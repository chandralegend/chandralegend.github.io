"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scene } from "@/lib/scene-store";
import { phaseFromProgress } from "@/lib/moon";

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __lenis?: Lenis;
    __animReady?: boolean;
    __preloaderDone?: boolean;
  }
}

/** Smooth-scrolls to an element, selector or offset; falls back to native scrolling. */
export function scrollToTarget(target: string | HTMLElement | number) {
  const lenis = window.__lenis;
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.6 });
    return;
  }
  if (typeof target === "number") window.scrollTo({ top: target });
  else (typeof target === "string" ? document.querySelector(target) : target)?.scrollIntoView();
}

/** Lenis + GSAP on one ticker, and the shared scroll/pointer/phase state for the moon. */
export default function SmoothScroll() {
  useEffect(() => {
    const html = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scene.reducedMotion = reduce;
    if (process.env.NODE_ENV !== "production") (window as unknown as { __scene: typeof scene }).__scene = scene;
    if (reduce) scene.intro = 1;

    const lenis = reduce ? null : new Lenis({ autoRaf: false, lerp: 0.09, anchors: true });
    if (lenis) {
      window.__lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      if (html.classList.contains("is-loading")) lenis.stop();
    }

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      scene.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      scene.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      scene.pointer.active = true;
    };
    const onLeave = () => {
      scene.pointer.active = false;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    html.addEventListener("pointerleave", onLeave);

    const tick = (time: number) => {
      lenis?.raf(time * 1000);
      const max = lenis ? lenis.limit : html.scrollHeight - window.innerHeight;
      const y = lenis ? lenis.scroll : window.scrollY;
      scene.scroll.progress = max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0;
      scene.scroll.velocity = lenis ? lenis.velocity : 0;

      const target = scene.phaseOverride ?? phaseFromProgress(scene.scroll.progress);
      const shown = 0.015 + (target - 0.015) * scene.intro;
      const k = reduce ? 1 : 1 - Math.pow(0.94, gsap.ticker.deltaRatio());
      scene.phase += (shown - scene.phase) * k;
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onPointer);
      html.removeEventListener("pointerleave", onLeave);
      lenis?.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}

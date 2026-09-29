"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { moonPath } from "@/lib/moon";
import { PRELOADER_DONE, SCENE_READY, scene } from "@/lib/scene-store";

/** First-visit curtain: counts 000→100 while the moon texture bakes, then lifts. */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const lit = useRef<SVGPathElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    let cancelled = false;

    const done = () => {
      if (window.__preloaderDone) return;
      window.__preloaderDone = true;
      html.classList.remove("is-loading");
      window.__lenis?.start();
      window.dispatchEvent(new Event(PRELOADER_DONE));
      // Pages without the hero timeline (e.g. 404) still get their moonrise.
      if (!document.querySelector("[data-hero-inner]")) gsap.to(scene, { intro: 1, duration: 2.6, ease: "power2.inOut" });
    };

    if (!html.classList.contains("is-loading")) {
      done();
      return;
    }

    try {
      sessionStorage.setItem("visited", "1");
    } catch {}

    const state = { p: 0 };
    const render = () => {
      if (count.current) count.current.textContent = String(Math.round(state.p * 100)).padStart(3, "0");
      lit.current?.setAttribute("d", moonPath(state.p));
    };
    const progress = gsap.to(state, { p: 0.86, duration: 1.5, ease: "power2.inOut", onUpdate: render });

    const ready = new Promise<void>((resolve) => {
      if (scene.ready) resolve();
      else window.addEventListener(SCENE_READY, () => resolve(), { once: true });
    });
    const minimum = new Promise<void>((resolve) => setTimeout(resolve, 1500));
    const maximum = new Promise<void>((resolve) => setTimeout(resolve, 3400));

    let exit: gsap.core.Timeline | undefined;
    Promise.race([Promise.all([ready, minimum]), maximum]).then(() => {
      if (cancelled) return;
      progress.kill();
      exit = gsap
        .timeline()
        .to(state, { p: 1, duration: 0.5, ease: "power2.out", onUpdate: render })
        .to("[data-preloader-inner]", { opacity: 0, y: -18, duration: 0.5, ease: "power2.in" }, "+=0.15")
        .to(root.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.15, ease: "expo.inOut" }, "-=0.15")
        .add(done, "-=0.8")
        .set(root.current, { display: "none" });
    });

    return () => {
      cancelled = true;
      progress.kill();
      exit?.kill();
    };
  }, []);

  return (
    <div className="preloader" ref={root} aria-hidden="true">
      <div className="preloader__inner" data-preloader-inner>
        <svg className="preloader__moon moon-icon" viewBox="0 0 24 24">
          <circle className="moon-icon__disc" cx="12" cy="12" r="10" />
          <path className="moon-icon__lit" ref={lit} d={moonPath(0)} />
        </svg>
        <span className="preloader__count" ref={count}>
          000
        </span>
        <span className="preloader__label">Chandra Irugalbandara — waiting for moonrise</span>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { scene } from "@/lib/scene-store";

const INTERACTIVE = "a, button, [data-cursor], summary, input, textarea";

/** Blend-mode cursor with contextual labels ("Open", "Read", "Explore" over the moon). */
export default function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = root.current;
    if (!fine || reduce || !el || !ring.current || !dot.current || !label.current) return;

    const html = document.documentElement;
    html.classList.add("has-cursor");

    const ringX = gsap.quickTo(ring.current, "x", { duration: 0.55, ease: "power3" });
    const ringY = gsap.quickTo(ring.current, "y", { duration: 0.55, ease: "power3" });
    const dotX = gsap.quickTo(dot.current, "x", { duration: 0.1, ease: "power3" });
    const dotY = gsap.quickTo(dot.current, "y", { duration: 0.1, ease: "power3" });

    let target: HTMLElement | null = null;
    let text = "";

    const setText = (next: string) => {
      if (next === text || !label.current) return;
      text = next;
      label.current.textContent = next;
      el.classList.toggle("has-label", next.length > 0);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      el.classList.add("is-visible");
      ringX(e.clientX);
      ringY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);
    };
    const onOver = (e: PointerEvent) => {
      target = (e.target as Element | null)?.closest<HTMLElement>(INTERACTIVE) ?? null;
      el.classList.toggle("is-hover", !!target);
      setText(target?.dataset.cursor ?? "");
    };
    const onDown = () => el.classList.add("is-down");
    const onUp = () => el.classList.remove("is-down");
    const onLeave = () => el.classList.remove("is-visible");

    // The moon lives in WebGL, so hover over it is polled from the scene each frame.
    const tick = () => {
      if (target) return;
      el.classList.toggle("is-moon", scene.hoverMoon);
      setText(scene.hoverMoon ? "Explore" : "");
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", onUp);
    html.addEventListener("pointerleave", onLeave);
    gsap.ticker.add(tick);

    return () => {
      html.classList.remove("has-cursor");
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      html.removeEventListener("pointerleave", onLeave);
      gsap.ticker.remove(tick);
    };
  }, []);

  return (
    <div className="cursor" ref={root} aria-hidden="true">
      <div className="cursor__ring" ref={ring}>
        <span className="cursor__label" ref={label} />
      </div>
      <div className="cursor__dot" ref={dot} />
    </div>
  );
}

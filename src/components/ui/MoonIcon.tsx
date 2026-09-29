"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { moonPath } from "@/lib/moon";
import { scene } from "@/lib/scene-store";

/** A moon-phase glyph. `live` follows the scroll-driven phase of the 3D moon. */
export default function MoonIcon({
  phase = 0.5,
  live = false,
  className = "",
  title,
}: {
  phase?: number;
  live?: boolean;
  className?: string;
  title?: string;
}) {
  const lit = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!live) return;
    let last = -1;
    const tick = () => {
      const p = Math.round(scene.phase * 200) / 200;
      if (p === last) return;
      last = p;
      lit.current?.setAttribute("d", moonPath(p));
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [live]);

  return (
    <svg
      className={`moon-icon ${className}`}
      viewBox="0 0 24 24"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <circle className="moon-icon__disc" cx="12" cy="12" r="10" />
      <path className="moon-icon__lit" ref={lit} d={moonPath(live ? 0.26 : phase)} />
    </svg>
  );
}

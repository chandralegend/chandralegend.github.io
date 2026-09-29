"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { illumination, phaseName } from "@/lib/moon";
import { scene } from "@/lib/scene-store";
import { site } from "@/lib/content";
import Clock from "./Clock";
import MoonIcon from "./MoonIcon";

/** Fixed instrument strip: current lunar phase on the left, Colombo time on the right. */
export default function PhaseHud() {
  const name = useRef<HTMLSpanElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let lastName = "";
    let lastPct = -1;
    const tick = () => {
      const n = phaseName(scene.phase);
      const p = Math.round(illumination(scene.phase) * 100);
      if (n !== lastName && name.current) name.current.textContent = lastName = n;
      if (p !== lastPct && pct.current) {
        pct.current.textContent = `${p}%`;
        lastPct = p;
      }
      if (bar.current) bar.current.style.transform = `scaleX(${scene.scroll.progress})`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <div className="hud" data-hero-fade aria-hidden="true">
      <div className="hud__phase">
        <MoonIcon live className="hud__icon" />
        <span ref={name} className="hud__name">
          Waxing crescent
        </span>
        <span className="hud__dim">
          <span ref={pct}>5%</span> lit
        </span>
      </div>
      <div className="hud__progress">
        <span ref={bar} />
      </div>
      <div className="hud__time">
        <span className="hud__dim">{site.location.coords}</span>
        <span>{site.location.city}</span>
        <Clock />
      </div>
    </div>
  );
}

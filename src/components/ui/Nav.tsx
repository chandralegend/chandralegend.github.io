"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { sections, site, socials } from "@/lib/content";
import { OPEN_TERMINAL } from "@/lib/scene-store";
import Magnetic from "./Magnetic";
import MoonIcon from "./MoonIcon";

gsap.registerPlugin(ScrambleTextPlugin);

function scramble(e: PointerEvent<HTMLElement>) {
  const label = e.currentTarget.querySelector<HTMLElement>("[data-label]");
  if (!label || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.to(label, {
    duration: 0.6,
    overwrite: true,
    scrambleText: { text: label.dataset.label ?? "", chars: "01☾✦", speed: 0.9 },
  });
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);

  // Hide while scrolling down, reveal on the way up.
  useEffect(() => {
    let last = 0;
    const tick = () => {
      const el = header.current;
      if (!el || document.documentElement.classList.contains("menu-open")) return;
      const y = window.__lenis?.scroll ?? window.scrollY;
      const state = y < 80 ? "top" : y > last + 2 ? "hidden" : y < last - 2 ? "shown" : el.dataset.state;
      if (state && state !== el.dataset.state) el.dataset.state = state;
      last = y;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("menu-open", open);
    if (open) window.__lenis?.stop();
    else if (!html.classList.contains("is-loading")) window.__lenis?.start();
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const openTerminal = () => window.dispatchEvent(new Event(OPEN_TERMINAL));

  return (
    <header className="nav" ref={header} data-state="top">
      <div className="nav__bar" data-hero-fade>
        <a href="#top" className="nav__brand" aria-label={`${site.name} — back to top`} onClick={() => setOpen(false)}>
          <MoonIcon live className="nav__moon" />
          <span className="nav__name">
            Chandra <em>Irugalbandara</em>
          </span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          <ul>
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} onPointerEnter={scramble}>
                  <span className="nav__num" aria-hidden="true">
                    0{i + 1}
                  </span>
                  <span data-label={s.label}>{s.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav__actions">
          <button type="button" className="nav__term" onClick={openTerminal} aria-label="Open terminal" data-cursor="Shell">
            <span aria-hidden="true">&gt;_</span>
          </button>
          <Magnetic className="nav__cta">
            <a className="pill pill--solid" href="#contact">
              <span>Let’s talk</span>
            </a>
          </Magnetic>
          <button
            type="button"
            className="nav__burger"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span className="nav__burger-line" aria-hidden="true" />
            <span className="nav__burger-line" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id="site-menu" className="menu" data-open={open} inert={!open}>
        <nav aria-label="Menu">
          <ol className="menu__links">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} onClick={() => setOpen(false)}>
                  <span className="menu__num">0{i + 1}</span>
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="menu__foot">
          <ul className="menu__socials">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="pill"
            onClick={() => {
              setOpen(false);
              openTerminal();
            }}
          >
            Open the terminal
          </button>
        </div>
      </div>
    </header>
  );
}

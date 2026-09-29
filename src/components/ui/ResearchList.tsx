"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import type { Publication } from "@/lib/content";

/** Publication rows with a citation card that trails the cursor. */
export default function ResearchList({ items }: { items: Publication[] }) {
  const [active, setActive] = useState<number | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = list.current;
    const card = preview.current;
    if (!el || !card || !window.matchMedia("(pointer: fine)").matches) return;
    const x = gsap.quickTo(card, "x", { duration: 0.7, ease: "power3" });
    const y = gsap.quickTo(card, "y", { duration: 0.7, ease: "power3" });
    const onMove = (e: PointerEvent) => {
      x(e.clientX + 28);
      y(e.clientY - 60);
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  const current = active === null ? null : items[active];

  return (
    <div className="pubs" ref={list} onPointerLeave={() => setActive(null)}>
      <ol className="pubs__list">
        {items.map((p, i) => (
          <li key={p.href} className="pub" data-reveal="fade">
            <a
              className="pub__link"
              href={p.href}
              target="_blank"
              rel="noreferrer"
              data-cursor="Read"
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
              <span className="pub__main">
                <span className="pub__title">{p.title}</span>
                <span className="pub__summary">{p.summary}</span>
              </span>
              <span className="pub__venue">
                {p.venue.includes(String(p.year)) ? p.venue : `${p.venue} · ${p.year}`}
                {p.note && <em>{p.note}</em>}
              </span>
              <span className="pub__cites">
                <b>{p.citations}</b> citations
              </span>
              <span className="pub__arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </li>
        ))}
      </ol>
      <div className="pubs__preview" ref={preview} data-active={current !== null} aria-hidden="true">
        {current && (
          <>
            <span className="pubs__preview-num">{current.citations}</span>
            <span className="pubs__preview-label">citations</span>
            <span className="pubs__preview-venue">
              {current.venue} · {current.year}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

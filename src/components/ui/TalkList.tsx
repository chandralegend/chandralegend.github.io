"use client";

import { useState } from "react";
import { talks } from "@/lib/content";

export default function TalkList() {
  const [open, setOpen] = useState(0);

  return (
    <ul className="talks">
      {talks.map((talk, i) => {
        const isOpen = open === i;
        return (
          <li key={talk.title} className="talk" data-open={isOpen} data-reveal="fade">
            <h3>
              <button
                type="button"
                id={`talk-${i}`}
                className="talk__toggle"
                aria-expanded={isOpen}
                aria-controls={`talk-panel-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
                data-cursor={isOpen ? "Close" : "Open"}
              >
                <span className="talk__index">{String(i + 1).padStart(2, "0")}</span>
                <span className="talk__title">{talk.title}</span>
                <span className="talk__icon" aria-hidden="true" />
              </button>
            </h3>
            <div
              id={`talk-panel-${i}`}
              role="region"
              aria-labelledby={`talk-${i}`}
              className="talk__panel"
              inert={!isOpen}
            >
              <div className="talk__panel-inner">
                <p>{talk.blurb}</p>
                <ul className="chips">
                  {talk.formats.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

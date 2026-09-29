import type { Glyph } from "@/lib/content";

function wavePath(k: number) {
  const pts: string[] = [];
  for (let x = 8; x <= 192; x += 4) {
    const envelope = Math.sin(((x - 8) / 184) * Math.PI);
    const y = 80 + Math.sin(x * 0.055 + k * 0.9) * (8 + k * 7) * envelope;
    pts.push(`${x === 8 ? "M" : "L"}${x} ${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

const HUB_NODES = Array.from({ length: 6 }, (_, i) => {
  const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
  return { x: 100 + Math.cos(a) * 58, y: 80 + Math.sin(a) * 58 };
});

const TICKS = Array.from({ length: 36 }, (_, i) => {
  const a = (i / 36) * Math.PI * 2;
  const r1 = 52;
  const r2 = i % 3 === 0 ? 60 : 56;
  return {
    x1: 88 + Math.cos(a) * r1,
    y1: 72 + Math.sin(a) * r1,
    x2: 88 + Math.cos(a) * r2,
    y2: 72 + Math.sin(a) * r2,
  };
});

/** Small generative illustrations, one per project. Pure SVG, animated with CSS. */
export default function ProjectGlyph({ type }: { type: Glyph }) {
  return (
    <svg className={`glyph glyph--${type}`} viewBox="0 0 200 160" aria-hidden="true">
      {type === "orbits" && (
        <>
          {[-18, 38, 96].map((angle, i) => (
            <g key={angle} className={`glyph__spin glyph__spin--${i}`}>
              <g transform={`rotate(${angle} 100 80)`}>
                <ellipse cx="100" cy="80" rx={84 - i * 10} ry={24 + i * 3} className="glyph__line" />
                <circle cx={184 - i * 10} cy="80" r="4.5" className="glyph__accent-fill" />
              </g>
            </g>
          ))}
          <circle cx="100" cy="80" r="17" className="glyph__fill" />
          <circle cx="100" cy="80" r="26" className="glyph__line glyph__line--faint" />
        </>
      )}

      {type === "types" && (
        <>
          <text x="14" y="118" className="glyph__brace">
            {"{"}
          </text>
          <text x="152" y="118" className="glyph__brace">
            {"}"}
          </text>
          <text x="56" y="62" className="glyph__mono">
            city: str
          </text>
          <text x="56" y="86" className="glyph__mono">
            rating: float
          </text>
          <text x="56" y="110" className="glyph__mono glyph__mono--accent">
            → Review
          </text>
          <rect x="56" y="118" width="64" height="1.5" className="glyph__accent-fill glyph__scan" />
        </>
      )}

      {type === "shell" && (
        <>
          <rect x="20" y="16" width="160" height="128" rx="12" className="glyph__line" />
          <line x1="20" y1="40" x2="180" y2="40" className="glyph__line" />
          <circle cx="34" cy="28" r="3.5" className="glyph__fill" />
          <circle cx="46" cy="28" r="3.5" className="glyph__fill glyph__fill--dim" />
          <circle cx="58" cy="28" r="3.5" className="glyph__accent-fill" />
          <text x="34" y="70" className="glyph__mono">
            $ nutsh
          </text>
          <text x="34" y="92" className="glyph__mono glyph__mono--dim">
            » ask it anything
          </text>
          <text x="34" y="120" className="glyph__mono glyph__mono--accent">
            &gt;
          </text>
          <rect x="48" y="108" width="9" height="15" className="glyph__fill glyph__caret" />
        </>
      )}

      {type === "wave" && (
        <>
          {[0, 1, 2, 3, 4].map((k) => (
            <path
              key={k}
              d={wavePath(k)}
              className={`glyph__line glyph__wave ${k === 2 ? "glyph__line--accent" : ""}`}
              style={{ opacity: 1 - k * 0.15, animationDelay: `${k * -0.6}s` }}
            />
          ))}
        </>
      )}

      {type === "lens" && (
        <>
          <g className="glyph__spin glyph__spin--0" style={{ transformOrigin: "88px 72px" }}>
            {TICKS.map((t, i) => (
              <line key={i} {...t} className="glyph__line glyph__line--faint" />
            ))}
          </g>
          <circle cx="88" cy="72" r="42" className="glyph__line" />
          <line x1="118" y1="102" x2="162" y2="146" className="glyph__line glyph__line--thick" />
          <path d="M68 73 l13 13 l27 -29" className="glyph__line glyph__line--thick glyph__line--accent glyph__check" />
        </>
      )}

      {type === "hub" && (
        <>
          <circle cx="100" cy="80" r="58" className="glyph__line glyph__line--faint glyph__dash" />
          <g className="glyph__spin glyph__spin--1">
            {HUB_NODES.map((n, i) => (
              <g key={i}>
                <line x1="100" y1="80" x2={n.x} y2={n.y} className="glyph__line glyph__line--faint" />
                <rect
                  x={n.x - 7}
                  y={n.y - 7}
                  width="14"
                  height="14"
                  rx="3"
                  className={i === 0 ? "glyph__accent-fill" : "glyph__fill glyph__fill--dim"}
                />
              </g>
            ))}
          </g>
          <circle cx="100" cy="80" r="15" className="glyph__fill" />
        </>
      )}
    </svg>
  );
}

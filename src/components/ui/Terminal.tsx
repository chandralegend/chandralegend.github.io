"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  contactHref,
  journey,
  manifesto,
  projects,
  publications,
  roles,
  scholar,
  sections,
  site,
  socials,
  talks,
} from "@/lib/content";
import { illumination, phaseName } from "@/lib/moon";
import { OPEN_TERMINAL, scene, setPhaseOverride } from "@/lib/scene-store";
import { scrollToTarget } from "@/components/providers/SmoothScroll";

type Line = { id: number; node: ReactNode; kind?: "input" | "error" | "muted" };

const COMMANDS = [
  "help",
  "whoami",
  "about",
  "ls",
  "cat",
  "projects",
  "research",
  "journey",
  "talks",
  "contact",
  "socials",
  "open",
  "goto",
  "phase",
  "neofetch",
  "date",
  "echo",
  "history",
  "sudo",
  "clear",
  "exit",
];

const HELP: [string, string][] = [
  ["whoami", "who you’re talking to"],
  ["projects", "what I’m building now"],
  ["research", "papers and citations"],
  ["journey", "where I’ve been"],
  ["talks", "what I speak about"],
  ["contact", "how to reach me"],
  ["open <name>", "open salli, pinglo, linkedin, scholar…"],
  ["goto <section>", "fly to a section of the page"],
  ["phase <new|quarter|full|0–1|auto>", "move the moon yourself"],
  ["neofetch", "system information"],
  ["clear · exit", "tidy up · leave"],
];

const MOON_ART = String.raw`      ..--""--..
    .'    .:::::'.
   /     .::::::::\
  |     ::::::::::::|
  |     ::::::::::::|
   \     '::::::::/
    '.    ':::::.'
      ''--..--''`;

const NAMED_PHASES: Record<string, number> = { new: 0.02, crescent: 0.25, quarter: 0.5, gibbous: 0.75, full: 1 };

const OPEN_TARGETS: Record<string, string> = {
  ...Object.fromEntries(socials.map((s) => [s.label.toLowerCase().split(" ").pop() ?? s.label, s.href])),
  ...Object.fromEntries(projects.map((p) => [p.id, p.href])),
  gapstars: "https://www.gapstars.net",
  stekz: "https://www.stekz.com",
  leafmonkey: "https://leafmonkey.org",
};

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

const pad = (s: string, n: number) => s + " ".repeat(Math.max(n - s.length, 1));

export default function Terminal() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [lines, setLines] = useState<Line[]>(() => [
    { id: 0, kind: "muted", node: "moonsh — a guest session on the moon" },
    {
      id: 1,
      node: (
        <>
          Type <b>help</b> to see what I can do. Try <b>neofetch</b>, <b>projects</b> or <b>phase full</b>.
        </>
      ),
    },
  ]);
  const nextId = useRef(2);
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);
  const input = useRef<HTMLInputElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  // Open with ~ or ` (outside text fields), the nav button, or the footer.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.closest("input, textarea, [contenteditable='true']");
      if ((e.key === "`" || e.key === "~") && !typing) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_TERMINAL, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_TERMINAL, onOpen);
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (open) {
      opener.current = document.activeElement as HTMLElement | null;
      window.__lenis?.stop();
      const id = setTimeout(() => input.current?.focus(), 60);
      return () => clearTimeout(id);
    }
    if (!html.classList.contains("is-loading") && !html.classList.contains("menu-open")) window.__lenis?.start();
    opener.current?.focus?.();
  }, [open]);

  useEffect(() => {
    if (body.current) body.current.scrollTop = body.current.scrollHeight;
  }, [lines]);

  const print = (...items: (ReactNode | Line)[]) => {
    setLines((prev) => [
      ...prev,
      ...items.map((item) =>
        item && typeof item === "object" && "node" in (item as Line)
          ? { ...(item as Line), id: nextId.current++ }
          : { id: nextId.current++, node: item as ReactNode },
      ),
    ]);
  };

  const close = () => setOpen(false);

  const fly = (id: string) => {
    close();
    setTimeout(() => scrollToTarget(`#${id}`), 350);
  };

  const run = (raw: string) => {
    const text = raw.trim();
    print({
      id: 0,
      kind: "input",
      node: (
        <>
          <span className="term__prompt">guest@moon:~$</span> {text}
        </>
      ),
    });
    if (!text) return;
    history.current.unshift(text);
    cursor.current = -1;

    const [name, ...rest] = text.split(/\s+/);
    const arg = rest.join(" ").toLowerCase();

    switch (name.toLowerCase()) {
      case "help":
        print(
          ...HELP.map(([cmd, desc]) => (
            <>
              <span className="term__accent">{pad(cmd, 36)}</span>
              <span className="term__muted">{desc}</span>
            </>
          )),
        );
        break;
      case "whoami":
        print(
          <b>{site.name}</b>,
          site.tagline,
          ...roles.map((r) => (
            <>
              <span className="term__muted">→</span> {r.title} @ <Ext href={r.href}>{r.org}</Ext>
            </>
          )),
        );
        break;
      case "about":
        print(manifesto);
        break;
      case "ls":
        print(
          <>
            about.txt  contact.txt  <span className="term__accent">projects/  research/  talks/</span>
          </>,
        );
        break;
      case "cat":
        if (arg === "about.txt") print(manifesto);
        else if (arg === "contact.txt") run("contact");
        else print({ id: 0, kind: "error", node: `cat: ${arg || "missing operand"}: no such file` });
        break;
      case "cd":
        print(
          arg.replace(/\/$/, "") === "projects"
            ? "Try `projects` — directories are overrated."
            : "cd: there is only one directory on the moon.",
        );
        break;
      case "projects":
        print(
          ...projects.map((p) => (
            <>
              <Ext href={p.href}>{pad(p.name, 10)}</Ext>
              <span className="term__muted">{pad(p.status, 14)}</span>
              {p.tagline}
            </>
          )),
          { id: 0, kind: "muted", node: "open <name> to visit — e.g. open salli" },
        );
        break;
      case "research":
      case "papers":
        print(
          <>
            <b>{scholar.citations}</b> citations · h-index {scholar.hIndex} · <Ext href={scholar.href}>Google Scholar</Ext>
          </>,
          ...publications.map((p) => (
            <>
              <span className="term__muted">{p.year}</span> <Ext href={p.href}>{p.title}</Ext>{" "}
              <span className="term__muted">
                — {p.venue}, {p.citations} cites
              </span>
            </>
          )),
        );
        break;
      case "journey":
        print(
          ...journey.map((j) => (
            <>
              <span className="term__accent">{pad(j.period, 14)}</span>
              {j.title} · {j.org}
            </>
          )),
        );
        break;
      case "talks":
        print(
          ...talks.map((t, i) => (
            <>
              <span className="term__accent">{String(i + 1).padStart(2, "0")}</span> <b>{t.title}</b>{" "}
              <span className="term__muted">— {t.blurb}</span>
            </>
          )),
          <>
            Invite me: <Ext href={contactHref("Speaking invitation")}>{site.email || "LinkedIn"}</Ext>
          </>,
        );
        break;
      case "contact":
        print(
          site.email ? (
            <>
              Email: <Ext href={contactHref()}>{site.email}</Ext>
            </>
          ) : (
            <>
              Best way in: <Ext href={contactHref()}>LinkedIn message</Ext>
            </>
          ),
          `Open to: ${site.availability.join(" · ")}`,
          { id: 0, kind: "muted", node: "Or run `goto contact`." },
        );
        break;
      case "socials":
        print(
          ...socials.map((s) => (
            <>
              <span className="term__muted">{pad(s.label, 16)}</span>
              <Ext href={s.href}>{s.handle}</Ext>
            </>
          )),
        );
        break;
      case "open": {
        const href = OPEN_TARGETS[arg];
        if (href) {
          window.open(href, "_blank", "noopener,noreferrer");
          print({ id: 0, kind: "muted", node: `Opening ${arg}…` });
        } else {
          print({
            id: 0,
            kind: "error",
            node: `open: unknown target '${arg}'. Try: ${Object.keys(OPEN_TARGETS).join(", ")}`,
          });
        }
        break;
      }
      case "goto": {
        const id = arg === "top" || arg === "home" ? "top" : sections.find((s) => s.id === arg)?.id;
        if (id) fly(id);
        else print({ id: 0, kind: "error", node: `goto: try one of top, ${sections.map((s) => s.id).join(", ")}` });
        break;
      }
      case "phase": {
        if (!arg) {
          const p = scene.phase;
          print(`${phaseName(p)} — ${Math.round(illumination(p) * 100)}% illuminated.`);
          break;
        }
        if (arg === "auto") {
          setPhaseOverride(null);
          print("The moon follows your scroll again.");
          break;
        }
        const value = NAMED_PHASES[arg] ?? Number(arg);
        if (Number.isFinite(value) && value >= 0 && value <= 1) {
          setPhaseOverride(value);
          print(
            `Moon set to ${phaseName(value).toLowerCase()} — ${Math.round(illumination(value) * 100)}% illuminated.`,
            { id: 0, kind: "muted", node: "Close the terminal to look. `phase auto` hands control back to the scroll." },
          );
        } else {
          print({ id: 0, kind: "error", node: "phase: expects new, crescent, quarter, gibbous, full, auto or 0–1" });
        }
        break;
      }
      case "neofetch":
      case "moon": {
        const p = scene.phase;
        const info: [string, string][] = [
          ["Name", site.name],
          ["Role", `${roles[0].title} @ ${roles[0].org}`],
          ["Lab", roles[1].org],
          ["Research", `${scholar.citations} citations · h-index ${scholar.hIndex}`],
          ["Building", projects.map((x) => x.name).join(" · ")],
          ["Shell", "moonsh (guest)"],
          ["Location", `${site.location.city}, ${site.location.country}`],
          ["Phase", `${phaseName(p)} (${Math.round(illumination(p) * 100)}%)`],
        ];
        print(
          <div className="term__neofetch">
            <pre className="term__art">{MOON_ART}</pre>
            <div>
              <b className="term__accent">guest@moon</b>
              <div className="term__muted">──────────</div>
              {info.map(([k, v]) => (
                <div key={k}>
                  <span className="term__accent">{pad(`${k}:`, 13)}</span>
                  {v}
                </div>
              ))}
            </div>
          </div>,
          { id: 0, kind: "muted", node: site.nameMeaning },
        );
        break;
      }
      case "date":
        print(
          `${new Intl.DateTimeFormat("en-GB", {
            timeZone: site.location.timeZone,
            dateStyle: "full",
            timeStyle: "short",
          }).format(new Date())} in ${site.location.city}`,
        );
        break;
      case "echo":
        print(rest.join(" "));
        break;
      case "history":
        print(
          ...history.current
            .slice()
            .reverse()
            .map((h, i) => `${String(i + 1).padStart(3, " ")}  ${h}`),
        );
        break;
      case "sudo":
        if (arg.replace(/\s+/g, "") === "hire-me" || arg === "hire me") {
          print("[sudo] password for guest: ********", <span className="term__accent">Permission granted. Taking you to contact…</span>);
          setTimeout(() => fly("contact"), 700);
        } else {
          print({ id: 0, kind: "error", node: "guest is not in the sudoers file. This incident will be reported to the moon." });
        }
        break;
      case "rm":
        print({ id: 0, kind: "error", node: "rm: the moon is read-only." });
        break;
      case "clear":
        setLines([]);
        break;
      case "exit":
      case "quit":
      case "q":
        close();
        break;
      default:
        print({ id: 0, kind: "error", node: `moonsh: command not found: ${name}. Type 'help'.` });
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(value);
      setValue("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(cursor.current + 1, history.current.length - 1);
      if (next >= 0) {
        cursor.current = next;
        setValue(history.current[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = cursor.current - 1;
      cursor.current = Math.max(next, -1);
      setValue(next >= 0 ? history.current[next] : "");
    } else if (e.key === "Tab") {
      e.preventDefault();
      const match = COMMANDS.find((c) => c.startsWith(value.trim().toLowerCase()));
      if (value.trim() && match) setValue(`${match} `);
    } else if (e.key === "Escape") {
      close();
    } else if (e.key.toLowerCase() === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div className="term-backdrop" data-open={open} inert={!open} onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="term" role="dialog" aria-modal="true" aria-labelledby="term-title">
        <div className="term__bar">
          <span className="term__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span id="term-title">moonsh — guest@moon</span>
          <button type="button" className="term__close" onClick={close} aria-label="Close terminal">
            esc
          </button>
        </div>
        <div className="term__body" ref={body} data-lenis-prevent aria-live="polite" onClick={() => input.current?.focus()}>
          {lines.map((l) => (
            <div key={l.id} className={`term__line${l.kind ? ` term__line--${l.kind}` : ""}`}>
              {l.node}
            </div>
          ))}
        </div>
        <label className="term__input-row">
          <span className="term__prompt">guest@moon:~$</span>
          <input
            ref={input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            aria-label="Terminal command"
          />
        </label>
      </div>
    </div>
  );
}

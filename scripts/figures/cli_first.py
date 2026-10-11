"""Figures for content/blog/cli-first.md, drawn by code so every label and number is exact.

  uv run --with pillow python3 scripts/figures/cli_first.py
      -> public/images/blog/cli-first/*.png (2x, 736 px wide = the post column on desktop)

The numbers are copied from the CLI-First paper's released data
(github.com/leafmonkeylabs/cli-first-paper):
- data/pilot/ratios.csv for the main experiment;
- data/followup/numbers.json ("isolation") for the isolation round;
- data/salli_coverage.csv for coverage;
- the teaser run's transcript, as printed in the paper's Figure 1.

Colours and fonts are the site's (src/app/globals.css). The fonts are the Latin
subsets that next/font ships, under the OFL.
"""

from __future__ import annotations

import math
import subprocess
import sys
import tempfile
from html import escape
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
OUT = HERE.parent.parent / "public" / "images" / "blog" / "cli-first"
CHROME = next(Path.home().glob(
    "Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-*/chrome-headless-shell"), None)
W, PAD = 736, 32

BG, INK3 = "#0e0e12", "#16161c"
BONE, BONE2, MUTED = "#ece8e0", "#bab5aa", "#8d897f"
LINE, LINE2 = "rgba(236,232,224,0.12)", "rgba(236,232,224,0.26)"
EMBER, EMBER2 = "#ff6a2b", "#ff8f5e"
MCP = "#7aa7ff"  # blue against the ember: CLI and MCP stay apart for colour-blind readers too


def css() -> str:
    f = lambda n: (HERE / "fonts" / n).as_uri()  # noqa: E731
    return f"""
@font-face {{ font-family: Geist; src: url("{f('Geist-latin.woff2')}"); font-weight: 100 900; }}
@font-face {{ font-family: GeistMono; src: url("{f('GeistMono-latin.woff2')}"); font-weight: 100 900; }}
@font-face {{ font-family: Serif; src: url("{f('InstrumentSerif-latin.woff2')}"); }}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
html, body {{ width: {W}px; background: {BG}; }}
body {{ font-family: Geist, sans-serif; color: {BONE}; -webkit-font-smoothing: antialiased; }}
svg {{ display: block; }}
.title {{ font-family: Serif; font-size: 34px; fill: {BONE}; }}
.sub {{ font-size: 17px; fill: {BONE2}; }}
.label {{ font-size: 19px; fill: {BONE2}; }}
.who {{ font-size: 17px; fill: {BONE2}; }}
.strong {{ font-size: 19px; font-weight: 600; fill: {BONE}; }}
.small {{ font-size: 15px; fill: {MUTED}; }}
.mono {{ font-family: GeistMono; font-size: 15px; fill: {BONE2}; }}
.cap {{ font-family: GeistMono; font-size: 14px; letter-spacing: 1.2px; fill: {MUTED}; }}
"""


def t(x: float, y: float, s: str, cls: str = "label", anchor: str = "start", **kw) -> str:
    extra = " ".join(f'{k.replace("_", "-")}="{v}"' for k, v in kw.items())
    return f'<text x="{x:.1f}" y="{y:.1f}" class="{cls}" text-anchor="{anchor}" {extra}>{escape(s)}</text>'


def rect(x, y, w, h, fill="none", stroke=LINE2, rx=12, **kw) -> str:
    extra = " ".join(f'{k.replace("_", "-")}="{v}"' for k, v in kw.items())
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx}" fill="{fill}" stroke="{stroke}" {extra}/>'


def line(x1, y1, x2, y2, stroke=LINE2, width=1.5, **kw) -> str:
    extra = " ".join(f'{k.replace("_", "-")}="{v}"' for k, v in kw.items())
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{stroke}" stroke-width="{width}" {extra}/>'


def dot(x, y, color, filled=True, r=7.0) -> str:
    if filled:
        return f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{color}"/>'
    return f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r - 1.2}" fill="{BG}" stroke="{color}" stroke-width="2.6"/>'


DEFS = f"""<defs>
<marker id="ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="{BONE2}"/></marker>
<marker id="ahe" viewBox="0 0 10 10" refX="8.5" refY="5" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="{EMBER}"/></marker>
</defs>"""


def header(title: str, sub: list[str]) -> tuple[str, float]:
    s, y = t(PAD, PAD + 30, title, "title"), PAD + 30 + 32
    for row in sub:
        s += t(PAD, y, row, "sub")
        y += 24
    return s, y


def svg(body: str, h: float) -> str:
    return f'<svg width="{W}" height="{h:.0f}" viewBox="0 0 {W} {h:.0f}" xmlns="http://www.w3.org/2000/svg">{DEFS}{body}</svg>'


# --- 1. one core, many clients ------------------------------------------------
def fig_core() -> str:
    s, y = header("One core, many clients", ["The CLI is the reference client: the others are checked against it."])
    n, gap = 5, 12
    bw = (W - 2 * PAD - (n - 1) * gap) / n
    xs = [PAD + i * (bw + gap) for i in range(n)]
    cx = [x + bw / 2 for x in xs]
    top, th = y + 16, 54
    for a, b, label in ((0, 0, "Coding agents"), (2, 2, "Users' agents"), (3, 4, "People")):
        x0, x1 = xs[a], xs[b] + bw
        s += rect(x0, top, x1 - x0, th, stroke=LINE2, stroke_dasharray="5 5")
        s += t((x0 + x1) / 2, top + th / 2 + 6, label, "who", "middle")
    cy, ch = top + th + 50, 86
    clients = [(["CLI"], "the reference", EMBER), (["HTTP API"], "", None), (["MCP server"], "OAuth-scoped", MCP),
               (["Web and", "mobile apps"], "", None), (["Built-in", "agent"], "", None)]
    for i, (rows, note, color) in enumerate(clients):
        fill = {EMBER: "rgba(255,106,43,0.10)", MCP: "rgba(122,167,255,0.08)"}.get(color, INK3)
        s += rect(xs[i], cy, bw, ch, fill=fill, stroke=color or LINE2, stroke_width=2 if color else 1)
        y0 = cy + ch / 2 - (len(rows) - 1) * 12 + (6 if not note else -4)
        for k, r in enumerate(rows):
            s += t(cx[i], y0 + k * 24, r, "strong", "middle", fill=EMBER2 if color == EMBER else BONE)
        if note:
            s += t(cx[i], y0 + 24, note, "small", "middle")
    for a, b in ((0, 0), (2, 2), (3, 3), (3, 4)):
        s += line(cx[b], top + th, cx[b], cy - 3, stroke=BONE2, width=1.6, marker_end="url(#ah)")
    core = cy + ch + 46
    for i in range(n):
        s += line(cx[i], cy + ch, cx[i], core - 3, stroke=BONE2, width=1.6, marker_end="url(#ah)")
    s += rect(PAD, core, W - 2 * PAD, 62, fill=INK3, stroke=LINE2)
    s += t(W / 2, core + 38, "Core: domain logic, rules, data and guardrails", "strong", "middle")
    return svg(s, core + 62 + PAD)


# --- 2. the agents test it ----------------------------------------------------
def fig_loop() -> str:
    s, y = header("The agents that build it can use it", ["When every capability is a command, a coding agent can play the user."])
    steps = [("01", ["Run a", "user story"]), ("02", ["Read the", "output"]), ("03", ["Notice", "what's off"]), ("04", ["Fix the", "code"])]
    n, gap = len(steps), 30
    bw, bh, top = (W - 2 * PAD - (n - 1) * gap) / n, 108, y + 18
    centres = []
    for i, (num, rows) in enumerate(steps):
        x = PAD + i * (bw + gap)
        centres.append(x + bw / 2)
        s += rect(x, top, bw, bh, fill=INK3)
        s += t(x + 16, top + 30, num, "cap", fill=EMBER)
        for k, r in enumerate(rows):
            s += t(x + 16, top + 62 + k * 25, r, "strong")
        if i < n - 1:
            s += line(x + bw + 5, top + bh / 2, x + bw + gap - 5, top + bh / 2, stroke=BONE2, width=1.6, marker_end="url(#ah)")
    back = top + bh + 36
    s += (f'<path d="M{centres[-1]:.1f},{top + bh:.1f} V{back:.1f} H{centres[0]:.1f} V{top + bh + 4:.1f}" fill="none" '
          f'stroke="{EMBER}" stroke-width="1.8" marker-end="url(#ahe)"/>')
    s += f'<rect x="{W / 2 - 92:.1f}" y="{back - 12:.1f}" width="184" height="24" fill="{BG}"/>'
    s += t(W / 2, back + 5, "and run it again", "small", "middle", fill=EMBER2)
    note = back + 34
    s += rect(PAD, note, W - 2 * PAD, 84, fill=INK3, stroke="none", rx=10)
    s += f'<rect x="{PAD}" y="{note}" width="3" height="84" fill="{EMBER}"/>'
    s += t(PAD + 22, note + 35, "In July, one pass through Salli's CLI found an approval gate", "label")
    s += t(PAD + 22, note + 62, "that silently did nothing. The web app had it wired correctly.", "label")
    return svg(s, note + 84 + PAD)


# --- 3. the same task through both interfaces --------------------------------
MCP_CALLS = """get_trial_balance()
get_accounts()
create_reminder("Review spending: General Expenses", "2026-04-30")
create_reminder("Review spending: Fuel", "2026-04-30")
create_reminder("Review spending: Pharmacy", "2026-04-30")"""
CLI_CALLS = r"""# call 1
salli accounts list --json > $TMPDIR/a.json 2>/dev/null
salli ledger trial-balance --json > $TMPDIR/tb.json
jq -r --slurpfile tb $TMPDIR/tb.json '.[]
  | select(.type=="expense") | [.id,.name,.currency,
    ($tb[0][.id]//"none")] | @tsv' $TMPDIR/a.json
# call 2
jq -r --slurpfile tb $TMPDIR/tb.json '.[]
  | select(.type=="expense" and .currency=="LKR")
  | select((($tb[0][.id]//"0")|tonumber)>20000)
  | .name' $TMPDIR/a.json |
while IFS= read -r n; do salli reminders add \
  "Review spending: $n" --due-date 2026-04-30 --json; done"""


def fig_task() -> str:
    def panel(color: str, name: str, calls: str, code: str, more: str, cost: str, rest: str) -> str:
        return (f'<div class="panel" style="border-color:{color}">'
                f'<div class="ph"><span style="color:{color}">{escape(name)}</span><span class="n">{escape(calls)}</span></div>'
                f'<pre>{escape(code)}</pre>{more}'
                f'<div class="pf"><b>{escape(cost)}</b><span>{escape(rest)}</span></div></div>')
    more = '<div class="more">... and 21 more create_reminder calls</div>'
    return f"""<style>
.fig {{ padding: {PAD}px; }}
.h1 {{ font-family: Serif; font-size: 34px; line-height: 1.1; }}
.h2 {{ font-size: 17px; color: {BONE2}; margin-top: 10px; line-height: 1.45; }}
.panel {{ margin-top: 22px; border: 1.5px solid; border-radius: 12px; background: {INK3}; padding: 16px 18px 14px; }}
.ph {{ display: flex; justify-content: space-between; align-items: baseline; font-size: 19px; font-weight: 600; }}
.ph .n {{ font-family: GeistMono; font-size: 15px; font-weight: 400; color: {BONE2}; }}
pre {{ font-family: GeistMono; font-size: 15px; line-height: 1.55; color: {BONE}; margin-top: 12px; white-space: pre; }}
.more {{ font-family: GeistMono; font-size: 15px; color: {MUTED}; margin-top: 2px; }}
.pf {{ margin-top: 12px; padding-top: 10px; border-top: 1px solid {LINE}; display: flex; gap: 14px; align-items: baseline; }}
.pf b {{ font-size: 24px; font-weight: 600; }}
.pf span {{ font-family: GeistMono; font-size: 15px; color: {BONE2}; }}
.note {{ margin-top: 18px; font-size: 18px; color: {BONE2}; line-height: 1.5; }}
.note b {{ color: {BONE}; font-weight: 600; }}
</style>
<div class="fig">
<div class="h1">Same task, two interfaces</div>
<div class="h2">&ldquo;Set a review reminder for every expense account over LKR 20,000.&rdquo; Sonnet, large ledger: medians of three runs each. The commands are from one of them.</div>
{panel(MCP, "Salli's MCP server", "26 tool calls", MCP_CALLS, more, "11.7¢", "4.1k output tokens · 25 s")}
{panel(EMBER, "The CLI, with the command sheet", "2 tool calls", CLI_CALLS, "", "4.4¢", "0.9k output tokens · 48 s")}
<div class="note"><b>62% cheaper</b>, but it took twice as long, and one approval now covers all 24 writes.</div>
</div>"""


# --- 4. the main experiment ---------------------------------------------------
# ratio to MCP-24, (Haiku, Sonnet), each (ratio, 95% low, high); data/pilot/ratios.csv
MAIN = [
    ("CHAINS OF DEPENDENT STEPS", [
        ("CLI learned from --help", EMBER, ((1.994, 1.847, 2.153), (1.624, 1.433, 1.84)), "1.6-2.0x"),
        ("CLI + sheet, composed", EMBER, ((1.205, 1.112, 1.306), (0.893, 0.782, 1.02)), "0.9-1.2x"),
        ("Generated MCP, 102 tools", MCP, ((1.794, 1.74, 1.851), (1.566, 1.528, 1.605)), "1.6-1.8x")]),
    ("REPEATING ONE OPERATION", [
        ("CLI learned from --help", EMBER, None, ""),
        ("CLI + sheet, composed", EMBER, ((0.641, 0.561, 0.734), (0.612, 0.503, 0.745)), "0.61-0.64x"),
        ("Generated MCP, 102 tools", MCP, ((1.533, 1.256, 1.872), (1.341, 1.313, 1.369)), "1.3-1.5x")]),
]


def legend(y: float, items: list[tuple[str, str, bool]]) -> str:
    s, x = "", PAD
    for label, color, filled in items:
        s += dot(x + 7, y - 6, color, filled, r=6.5) + t(x + 20, y, label, "small", fill=BONE2)
        x += 34 + len(label) * 7.6
    return s


def axis(x_of, ticks: list[tuple[float, str]], y_top: float, y_bot: float) -> str:
    s = line(x_of(1), y_top, x_of(1), y_bot, stroke=BONE2, width=1.2, stroke_dasharray="4 5")
    for v, label in ticks:
        s += line(x_of(v), y_bot, x_of(v), y_bot + 6, stroke=LINE2, width=1.2)
        s += t(x_of(v), y_bot + 24, label, "mono", "middle", fill=MUTED)
    s += t(x_of(1), y_top - 10, "same as MCP", "small", "middle")
    return s


def fig_main() -> str:
    s, y = header("Knowledge mattered more than protocol",
                  ["Cost relative to Salli's own MCP server (24 tools). Lower is cheaper. 704 runs."])
    s += legend(y + 12, [("Haiku 5.5", BONE2, True), ("Sonnet 5.5", BONE2, False)])
    lo, hi, x0, x1 = 0.45, 2.4, 300, 610
    x_of = lambda v: x0 + (math.log(v) - math.log(lo)) / (math.log(hi) - math.log(lo)) * (x1 - x0)  # noqa: E731
    yy = y + 70
    y_top = yy
    for group, rows in MAIN:
        s += t(PAD, yy, group, "cap")
        yy += 40
        for label, color, vals, right in rows:
            s += t(PAD, yy + 6, label, "label")
            if vals is None:
                s += t(x0, yy + 6, "not run", "small", font_style="italic")
            else:
                for (v, a, b), dy, filled in zip(vals, (-7, 7), (True, False)):
                    s += line(x_of(a), yy + dy, x_of(b), yy + dy, stroke=color, width=2, opacity="0.45")
                    s += dot(x_of(v), yy + dy, color, filled)
            s += t(W - PAD, yy + 6, right.replace("x", "×"), "mono", "end", fill=BONE)
            yy += 46
        yy += 8
    s += axis(x_of, [(0.5, "0.5×"), (1, "1×"), (2, "2×")], y_top + 8, yy - 18)
    return svg(s, yy + 24 + PAD)


# --- 5. the isolation round ---------------------------------------------------
# CLI with the sheet relative to MCP-46 and to the same server cut to 24 tools, (ratio, low, high);
# data/followup/numbers.json isolation.vs_mcp46 / vs_mcp24_rewritten, arm cli-pipe-ref
ISO = [("Haiku, chains", (0.838, 0.759, 0.924), (0.951, 0.889, 1.018)),
       ("Haiku, repeats", (0.529, 0.464, 0.604), (0.518, 0.453, 0.591)),
       ("Sonnet, chains", (0.611, 0.491, 0.761), (0.689, 0.564, 0.841)),
       ("Sonnet, repeats", (0.374, 0.214, 0.652), (0.392, 0.225, 0.683))]


def fig_iso() -> str:
    s, y = header("Part of the CLI's lead was MCP growing",
                  ["Rewritten product, 384 runs: cost of the CLI with its sheet, relative to MCP.", "Lower is cheaper."])
    s += legend(y + 12, [("vs the 46-tool server", EMBER, True), ("vs the same server cut to its original 24 tools", EMBER, False)])
    lo, hi, x0, x1 = 0.2, 1.3, 220, 590
    x_of = lambda v: x0 + (math.log(v) - math.log(lo)) / (math.log(hi) - math.log(lo)) * (x1 - x0)  # noqa: E731
    yy = y + 78
    y_top = yy
    for label, a, b in ISO:
        s += t(PAD, yy + 6, label, "label")
        for (v, l, h), dy in ((a, -7), (b, 7)):
            s += line(x_of(l), yy + dy, x_of(h), yy + dy, stroke=EMBER, width=2, opacity="0.4")
        if abs(x_of(b[0]) - x_of(a[0])) > 18:
            s += line(x_of(a[0]), yy - 7, x_of(b[0]) - 7, yy + 3, stroke=BONE2, width=1.4, marker_end="url(#ah)")
        s += dot(x_of(a[0]), yy - 7, EMBER, True) + dot(x_of(b[0]), yy + 7, EMBER, False)
        s += t(W - PAD, yy + 6, f"{a[0]:.2f} to {b[0]:.2f}", "mono", "end", fill=BONE)
        yy += 52
    s += axis(x_of, [(0.25, "0.25×"), (0.5, "0.5×"), (1, "1×")], y_top - 16, yy - 22)
    return svg(s, yy + 20 + PAD)


# --- 6. coverage --------------------------------------------------------------
# day, CLI commands, API feature routes; data/salli_coverage.csv
COVERAGE = [(0, 13, 19), (4, 13, 49), (8, 13, 49), (12, 13, 49), (16, 13, 49), (20, 13, 49), (24, 13, 54), (26, 13, 54),
            (27, 57, 72), (28, 89, 109), (32, 89, 110), (37, 89, 110), (42, 91, 114), (48, 91, 116), (55, 91, 114),
            (62, 91, 114), (69, 93, 127), (76, 93, 130), (83, 93, 128), (87, 93, 128)]


def fig_coverage() -> str:
    s, y = header("Under a written rule, the CLI still fell behind",
                  ["Salli's CLI commands and API feature routes, June to September 2026."])
    x0, x1, top = PAD + 40, W - PAD - 12, y + 30
    bot = top + 230
    X = lambda d: x0 + d / 87 * (x1 - x0)  # noqa: E731
    Y = lambda c: bot - c / 140 * (bot - top)  # noqa: E731
    for c in (0, 35, 70, 105, 140):
        s += line(x0, Y(c), x1, Y(c), stroke=LINE, width=1)
        s += t(x0 - 10, Y(c) + 5, str(c), "mono", "end", fill=MUTED)
    for d, label in ((0, "Jun 18"), (28, "Jul 16"), (55, "Aug 12"), (87, "Sep 13")):
        s += t(X(d), bot + 26, label, "mono", "middle" if 0 < d < 87 else ("start" if d == 0 else "end"), fill=MUTED)
    s += f'<rect x="{X(26):.1f}" y="{top:.1f}" width="{X(28) - X(26):.1f}" height="{bot - top:.1f}" fill="rgba(255,106,43,0.12)"/>'
    for idx, color, name, ny in ((2, BONE2, "API feature routes", 122), (1, EMBER, "CLI commands", 76)):
        pts = " ".join(f"{X(row[0]):.1f},{Y(row[idx]):.1f}" for row in COVERAGE)
        s += f'<polyline points="{pts}" fill="none" stroke="{color}" stroke-width="3" stroke-linejoin="round"/>'
        s += t(X(50), Y(ny), name, "label", "middle", fill=color)
    # commands per route, in the empty corner the API left before the push
    bx, by = X(0.8), Y(134)
    s += f'<rect x="{bx - 4:.1f}" y="{by - 18:.1f}" width="{X(25.4) - bx:.1f}" height="{26 + 4 * 22:.1f}" fill="{BG}"/>'
    s += t(bx, by, "COMMANDS PER ROUTE", "cap")
    for k, (pct, text) in enumerate((("68%", "at the start"), ("24%", "after a month"),
                                     ("82%", "after a CLI push"), ("73%", "in September"))):
        s += t(bx, by + 26 + k * 22, pct, "mono", fill=BONE) + t(bx + 46, by + 26 + k * 22, text, "small", fill=BONE2)
    return svg(s, bot + 26 + PAD)


FIGURES = {"one-core": fig_core, "test-loop": fig_loop, "same-task": fig_task, "cost": fig_main,
           "mcp-growth": fig_iso, "coverage": fig_coverage}


def render(name: str, body: str, tmp: Path) -> Path:
    page = tmp / f"{name}.html"
    page.write_text(f"<!doctype html><html><head><meta charset='utf-8'><style>{css()}</style></head><body>{body}</body></html>")
    png = OUT / f"{name}.png"
    subprocess.run([str(CHROME), "--headless", "--hide-scrollbars", "--force-device-scale-factor=2",
                    "--allow-file-access-from-files", "--virtual-time-budget=1500", f"--window-size={W},1600",
                    f"--screenshot={png}", page.as_uri()], check=True, capture_output=True)
    im = Image.open(png).convert("RGB")  # trim the empty window below the figure
    bg = tuple(int(BG[i:i + 2], 16) for i in (1, 3, 5))
    px, (w, h) = im.load(), im.size
    last = next(y for y in range(h - 1, -1, -1) if any(px[x, y] != bg for x in range(0, w, 3)))
    im.crop((0, 0, w, min(h, last + 2 * PAD))).save(png, optimize=True)  # PAD below, at 2x
    return png


def main() -> None:
    if not CHROME:
        sys.exit("headless Chromium not found (run: npx playwright install chromium-headless-shell)")
    OUT.mkdir(parents=True, exist_ok=True)
    only = set(sys.argv[1:])
    with tempfile.TemporaryDirectory() as tmp:
        for name, fn in FIGURES.items():
            if not only or name in only:
                p = render(name, fn(), Path(tmp))
                print(f"{p.relative_to(HERE.parent.parent)}  {Image.open(p).size}")


if __name__ == "__main__":
    main()

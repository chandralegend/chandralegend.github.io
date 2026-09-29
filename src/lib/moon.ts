/**
 * Moon-phase helpers shared by the WebGL scene, the HUD and the SVG icons.
 * `phase` runs 0 (new moon) → 0.5 (first quarter) → 1 (full moon), waxing only.
 */

export function illumination(phase: number) {
  return (1 - Math.cos(Math.min(Math.max(phase, 0), 1) * Math.PI)) / 2;
}

export function phaseName(phase: number) {
  const k = illumination(phase);
  if (k < 0.03) return "New moon";
  if (k < 0.47) return "Waxing crescent";
  if (k <= 0.53) return "First quarter";
  if (k < 0.97) return "Waxing gibbous";
  return "Full moon";
}

/** SVG path for the lit part of a waxing moon (lit on the right). */
export function moonPath(phase: number, r = 10, cx = 12, cy = 12) {
  const k = Math.cos(Math.min(Math.max(phase, 0), 1) * Math.PI);
  const rx = Math.max(Math.abs(k) * r, 0.001);
  const sweep = k > 0 ? 0 : 1;
  const f = (n: number) => n.toFixed(3);
  return `M ${f(cx)} ${f(cy - r)} A ${f(r)} ${f(r)} 0 0 1 ${f(cx)} ${f(cy + r)} A ${f(rx)} ${f(r)} 0 0 ${sweep} ${f(cx)} ${f(cy - r)} Z`;
}

/** Scroll progress (0–1) → target phase: a crescent at the top, full by the contact section. */
export function phaseFromProgress(p: number) {
  const t = Math.min(Math.max(p / 0.94, 0), 1);
  return 0.26 + 0.74 * t;
}

/**
 * A tiny mutable store shared by the DOM (scroll, pointer, sections) and the WebGL scene.
 * It is read every frame, so it deliberately avoids React state.
 */

export type MoonStop = {
  nx: number; // horizontal centre, as a fraction of viewport width (-0.5 … 0.5)
  ny: number; // vertical centre, as a fraction of viewport height (-0.5 … 0.5)
  s: number; // moon diameter as a fraction of viewport height
  orbits: number; // 0–1 visibility of the orbit rings
  dim: number; // 0–1 brightness multiplier (keeps text readable on small screens)
};

type StopSet = { desktop: MoonStop; mobile: MoonStop };

export const MOON_STOPS: Record<string, StopSet> = {
  hero: {
    desktop: { nx: 0.21, ny: 0.0, s: 0.72, orbits: 0.55, dim: 1 },
    mobile: { nx: 0.08, ny: 0.2, s: 0.46, orbits: 0.5, dim: 0.9 },
  },
  about: {
    desktop: { nx: -0.36, ny: 0.06, s: 0.4, orbits: 0.2, dim: 0.9 },
    mobile: { nx: 0.34, ny: 0.34, s: 0.3, orbits: 0.15, dim: 0.45 },
  },
  work: {
    desktop: { nx: 0.37, ny: 0.3, s: 0.26, orbits: 1, dim: 0.85 },
    mobile: { nx: 0.34, ny: 0.36, s: 0.24, orbits: 0.8, dim: 0.5 },
  },
  research: {
    desktop: { nx: -0.38, ny: 0.04, s: 0.3, orbits: 0.25, dim: 0.85 },
    mobile: { nx: -0.34, ny: 0.36, s: 0.26, orbits: 0.2, dim: 0.45 },
  },
  journey: {
    desktop: { nx: 0.34, ny: 0.02, s: 0.5, orbits: 0.35, dim: 0.85 },
    mobile: { nx: 0.34, ny: 0.34, s: 0.3, orbits: 0.25, dim: 0.45 },
  },
  speaking: {
    desktop: { nx: -0.33, ny: 0.2, s: 0.3, orbits: 0.45, dim: 0.9 },
    mobile: { nx: -0.32, ny: 0.35, s: 0.26, orbits: 0.3, dim: 0.45 },
  },
  writing: {
    desktop: { nx: 0.38, ny: 0.26, s: 0.24, orbits: 0.4, dim: 0.75 },
    mobile: { nx: 0.36, ny: 0.4, s: 0.2, orbits: 0.2, dim: 0.4 },
  },
  contact: {
    desktop: { nx: 0, ny: 0.02, s: 0.92, orbits: 0.6, dim: 1 },
    mobile: { nx: 0, ny: 0.08, s: 0.62, orbits: 0.5, dim: 1 },
  },
  // Reading pages (blog): a small moon tucked top-right, away from the text column.
  page: {
    desktop: { nx: 0.4, ny: 0.3, s: 0.26, orbits: 0.35, dim: 0.6 },
    mobile: { nx: 0.36, ny: 0.4, s: 0.2, orbits: 0.2, dim: 0.35 },
  },
  // The moon sets behind the footer wordmark.
  moonset: {
    desktop: { nx: 0, ny: -0.8, s: 1.1, orbits: 0.2, dim: 0.9 },
    mobile: { nx: 0, ny: -0.66, s: 0.9, orbits: 0.2, dim: 0.9 },
  },
};

export function stopFor(id: string, mobile: boolean): MoonStop {
  const set = MOON_STOPS[id] ?? MOON_STOPS.hero;
  return mobile ? set.mobile : set.desktop;
}

export const scene = {
  pointer: { x: 0, y: 0, active: false }, // normalised device coords (-1 … 1)
  scroll: { progress: 0, velocity: 0 },
  stop: { ...MOON_STOPS.hero.desktop } as MoonStop,
  phase: 0.02, // phase actually drawn (eased toward the scroll target)
  phaseOverride: null as number | null, // set from the terminal: `phase full`
  intro: 0, // 0 → 1 moonrise, played after the preloader
  hoverMoon: false,
  ready: false,
  reducedMotion: false,
};

export const SCENE_READY = "scene:ready";
export const PRELOADER_DONE = "preloader:done";
export const OPEN_TERMINAL = "terminal:open";

/** Pins the moon to a phase (0–1), or hands control back to the scroll with `null`. */
export function setPhaseOverride(phase: number | null) {
  scene.phaseOverride = phase;
}

export function markSceneReady() {
  if (scene.ready) return;
  scene.ready = true;
  if (process.env.NODE_ENV !== "production") console.info(`[moon] first frame at ${Math.round(performance.now())}ms`);
  window.dispatchEvent(new Event(SCENE_READY));
}

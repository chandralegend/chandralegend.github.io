# chandra — personal site

A single-page portfolio built around a real-time, procedurally generated moon
(*Chandra* is Sanskrit for “moon”). The moon waxes from crescent to full as you
scroll, and sets behind the footer.

**Stack:** Next.js 16 (static export) · React Three Fiber / Three.js · GSAP
(ScrollTrigger, SplitText, ScrambleText) · Lenis · Tailwind CSS v4.

## Editing content

Everything the site says lives in [`src/lib/content.ts`](src/lib/content.ts):
bio, roles, projects, publications, journey, talks and contact links.

- **Contact email:** set `site.email`. While it's empty, every contact button
  opens LinkedIn instead.
- **Domain:** set `site.url` once your custom domain points at GitHub Pages,
  and add a `public/CNAME` file containing the domain.
- **GitHub stars** refresh at build time (and weekly via the deploy workflow).
- **Scholar numbers** are static — update `scholar` and `publications` when they change.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in ./out
npm run preview    # serve ./out at http://localhost:4173
```

## Deploy (GitHub Pages)

1. Push this project to the `main` branch of `chandralegend/chandralegend.github.io`.
2. In the repo: **Settings → Pages → Source: GitHub Actions**.
3. `.github/workflows/deploy.yml` builds and publishes `out/` on every push.

## How the moon works

`src/components/canvas/` holds the WebGL scene:

- `shaders.ts` bakes a height/albedo field (craters, maria, rims) into a texture
  once at load, converts it to an object-space normal map, then lights it every
  frame with a Lommel–Seeliger/Lambert blend, earthshine and a pointer
  “flashlight” for exploring the dark side.
- `Moon.tsx` places the moon per section. Sections declare `data-moon="id"`, and
  the framing for each id lives in `src/lib/scene-store.ts` (`MOON_STOPS`).
- The phase follows scroll progress (`src/lib/moon.ts`). Press <kbd>~</kbd> and
  try `phase full` to drive it yourself.

Without WebGL2, a CSS moon stands in. With `prefers-reduced-motion`, smooth
scrolling, pinning and reveals switch off and all content is shown immediately.

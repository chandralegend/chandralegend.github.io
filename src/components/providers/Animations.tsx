"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { PRELOADER_DONE, SCENE_READY, scene, stopFor } from "@/lib/scene-store";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, ScrambleTextPlugin);

/**
 * Wires every scroll-driven effect from data attributes on server-rendered markup:
 *   data-moon="id"          moon framing for a section
 *   data-reveal="lines"     masked line reveal
 *   data-reveal="fade"      fade + rise (optional data-delay)
 *   data-scrub-words        words brighten as you scroll
 *   data-count="197"        number counts up
 *   data-scramble           mono label scrambles in
 *   data-speed="0.2"        parallax drift
 *   data-hscroll            pinned horizontal gallery (desktop)
 *   data-marquee            velocity-reactive marquee
 */
export default function Animations() {
  useGSAP(() => {
    window.__animReady = true;
    const html = document.documentElement;
    // Phones and portrait tablets share the compact moon framing.
    const mobile = window.matchMedia("(max-width: 767px), (orientation: portrait) and (max-width: 1180px)");
    const mm = gsap.matchMedia();
    const listeners = new AbortController();

    // Moon framing: the last [data-moon] block crossing 62% of the viewport wins.
    // Measured every frame, so pinned sections and nested blocks just work.
    const blocks = gsap.utils.toArray<HTMLElement>("[data-moon]");
    let activeStop = "";
    const pickStop = () => {
      const line = window.innerHeight * 0.62;
      let id = blocks[0]?.dataset.moon ?? "hero";
      for (const el of blocks) {
        const r = el.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) id = el.dataset.moon ?? id;
      }
      const key = `${id}:${mobile.matches}`;
      if (key === activeStop) return;
      activeStop = key;
      Object.assign(scene.stop, stopFor(id, mobile.matches));
    };
    pickStop();
    gsap.ticker.add(pickStop);

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        desktop: "(min-width: 1024px)",
      },
      (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
        activeStop = "";

        // Pinned horizontal gallery first, so later triggers measure the added pin spacing.
        const gallery = document.querySelector<HTMLElement>("[data-hscroll]");
        const track = gallery?.querySelector<HTMLElement>("[data-hscroll-track]");
        if (motion && desktop && gallery && track) {
          const distance = () => Math.max(track.scrollWidth - window.innerWidth, 0);
          const pan = gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: gallery,
              start: "top top",
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
              anticipatePin: 1,
            },
          });
          gallery.querySelectorAll<HTMLElement>("[data-hscroll-item]").forEach((item) => {
            gsap.fromTo(
              item,
              { opacity: 0.3, scale: 0.92, rotate: 1.5 },
              {
                opacity: 1,
                scale: 1,
                rotate: 0,
                ease: "none",
                scrollTrigger: { trigger: item, containerAnimation: pan, start: "left 100%", end: "left 60%", scrub: true },
              },
            );
          });
          const bar = gallery.querySelector("[data-hscroll-progress]");
          if (bar) {
            gsap.fromTo(
              bar,
              { scaleX: 0 },
              {
                scaleX: 1,
                ease: "none",
                scrollTrigger: { trigger: gallery, start: "top top", end: () => `+=${distance()}`, scrub: true },
              },
            );
          }
        }

        if (!motion) return;

        // Hero entrance — waits for the preloader curtain.
        const heroLines = gsap.utils.toArray<HTMLElement>("[data-hero-line]");
        const heroFades = gsap.utils.toArray<HTMLElement>("[data-hero-fade]");
        const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
        if (heroLines.length) {
          const split = SplitText.create(heroLines, { type: "chars", charsClass: "hero-char" });
          intro
            .set(heroLines, { visibility: "visible" })
            .from(split.chars, { yPercent: 118, rotate: 4, duration: 1.6, stagger: 0.035 }, 0.15);
        }
        intro.fromTo(heroFades, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 1.3, stagger: 0.07 }, 0.55);
        const playIntro = () => intro.play();
        if (window.__preloaderDone) playIntro();
        else window.addEventListener(PRELOADER_DONE, playIntro, { once: true, signal: listeners.signal });

        // Moonrise waits for both the curtain and the first rendered frame, so it's never missed.
        const moonrise = () => {
          if (window.__preloaderDone && scene.ready) gsap.to(scene, { intro: 1, duration: 3.2, ease: "power2.inOut" });
        };
        window.addEventListener(PRELOADER_DONE, moonrise, { once: true, signal: listeners.signal });
        window.addEventListener(SCENE_READY, moonrise, { once: true, signal: listeners.signal });
        moonrise();

        // Hero drifts up and dims as it leaves.
        gsap.to("[data-hero-inner]", {
          yPercent: -14,
          opacity: 0.25,
          ease: "none",
          scrollTrigger: { trigger: "#top", start: "top top", end: "bottom top", scrub: true },
        });

        // Masked line reveals.
        gsap.utils.toArray<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            linesClass: "split-line",
            autoSplit: true,
            onSplit: (self) => {
              gsap.set(el, { visibility: "visible" });
              return gsap.from(self.lines, {
                yPercent: 108,
                duration: 1.25,
                ease: "expo.out",
                stagger: 0.09,
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              });
            },
          });
        });

        // Fade + rise.
        gsap.utils.toArray<HTMLElement>('[data-reveal="fade"]').forEach((el) => {
          gsap.fromTo(
            el,
            { y: 44, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.3,
              ease: "expo.out",
              delay: Number(el.dataset.delay ?? 0),
              scrollTrigger: { trigger: el, start: "top 92%", once: true },
            },
          );
        });

        // Words brighten with scroll.
        gsap.utils.toArray<HTMLElement>("[data-scrub-words]").forEach((el) => {
          SplitText.create(el, {
            type: "words",
            wordsClass: "scrub-word",
            autoSplit: true,
            onSplit: (self) =>
              gsap.fromTo(
                self.words,
                { opacity: 0.13 },
                {
                  opacity: 1,
                  ease: "none",
                  stagger: 0.1,
                  scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 48%", scrub: true },
                },
              ),
          });
        });

        // Counters.
        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          const end = Number(el.dataset.count);
          const counter = { value: 0 };
          el.textContent = "0";
          gsap.to(counter, {
            value: end,
            duration: 2.4,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
            onUpdate: () => {
              el.textContent = Math.round(counter.value).toLocaleString("en-US");
            },
          });
        });

        // Scrambled mono labels.
        gsap.utils.toArray<HTMLElement>("[data-scramble]").forEach((el) => {
          const text = el.textContent ?? "";
          gsap.to(el, {
            duration: 1.4,
            scrambleText: { text, chars: "upperCase", speed: 0.5, revealDelay: 0.2 },
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          });
        });

        // Parallax drift.
        gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
          gsap.to(el, {
            yPercent: Number(el.dataset.speed) * -40,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          });
        });

        // Timeline spine draws itself.
        gsap.utils.toArray<HTMLElement>("[data-journey-line]").forEach((line) => {
          gsap.fromTo(
            line,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: { trigger: line.parentElement, start: "top 70%", end: "bottom 70%", scrub: true },
            },
          );
        });

        // Marquee: always drifting, speeds up and flips with scroll direction.
        gsap.utils.toArray<HTMLElement>("[data-marquee]").forEach((el) => {
          const row = el.querySelector("[data-marquee-track]");
          if (!row) return;
          const loop = gsap.to(row, { xPercent: -50, ease: "none", duration: 42, repeat: -1 });
          loop.totalTime(loop.duration() * 500);
          ScrollTrigger.create({
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            onUpdate: (self) => {
              const boost = Math.min(Math.abs(self.getVelocity()) / 220, 7);
              gsap.to(loop, {
                timeScale: self.direction * (1 + boost),
                duration: 0.25,
                overwrite: true,
                onComplete: () => {
                  gsap.to(loop, { timeScale: self.direction, duration: 1.4, ease: "power2.out" });
                },
              });
            },
          });
        });
      },
    );

    // Line splits depend on web fonts, so re-measure once they are ready.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    html.classList.add("anim-ready");

    return () => {
      listeners.abort();
      gsap.ticker.remove(pickStop);
      mm.revert();
    };
  });

  return null;
}

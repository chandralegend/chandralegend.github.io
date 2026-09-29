"use client";

import { useEffect } from "react";
import { scene, stopFor } from "@/lib/scene-store";

/**
 * Pages without the homepage's scroll choreography (blog) park the moon in one spot.
 * Its phase still follows scroll progress, so it waxes as you read.
 */
export default function PageMoon({ stop = "page" }: { stop?: string }) {
  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px), (orientation: portrait) and (max-width: 1180px)");
    const apply = () => Object.assign(scene.stop, stopFor(stop, mobile.matches));
    apply();
    mobile.addEventListener("change", apply);
    // No hero timeline here, so show the nav and any reveal targets straight away.
    window.__animReady = true;
    document.documentElement.classList.add("reveal-all");
    return () => mobile.removeEventListener("change", apply);
  }, [stop]);

  return null;
}

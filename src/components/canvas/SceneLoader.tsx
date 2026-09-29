"use client";

import dynamic from "next/dynamic";
import { useEffect, useSyncExternalStore } from "react";
import { markSceneReady } from "@/lib/scene-store";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

let webgl: boolean | null = null;
function detectWebGL() {
  if (webgl === null) {
    try {
      webgl = !!document.createElement("canvas").getContext("webgl2");
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

const noop = () => () => {};

/** Fixed full-screen backdrop: the WebGL moon, or a CSS moon where WebGL2 isn't available. */
export default function SceneLoader() {
  const supported = useSyncExternalStore(noop, detectWebGL, () => null);

  useEffect(() => {
    if (supported === false) markSceneReady();
  }, [supported]);

  return (
    <div className="scene" aria-hidden="true">
      {supported && <Scene />}
      {supported === false && <div className="scene__fallback" />}
    </div>
  );
}

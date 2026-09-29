"use client";

import { useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { markSceneReady, scene } from "@/lib/scene-store";
import { MoonSystem } from "./Moon";
import { Stars } from "./Stars";

function CameraRig() {
  useFrame(({ camera }, delta) => {
    const ease = scene.reducedMotion ? 1 : 1 - Math.exp(-Math.min(delta, 0.1) * 1.8);
    camera.position.x += (scene.pointer.x * 0.32 - camera.position.x) * ease;
    camera.position.y += (scene.pointer.y * 0.2 - camera.position.y) * ease;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function ReadySignal() {
  useEffect(() => {
    // Two frames: the bake has run and the first real frame is on screen.
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(markSceneReady);
    });
    return () => cancelAnimationFrame(id);
  }, []);
  return null;
}

export default function Scene() {
  return (
    <Canvas
      className="scene__canvas"
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 8], fov: 35, near: 0.1, far: 120 }}
      onCreated={({ gl }) => gl.setClearColor("#07070a", 1)}
    >
      <CameraRig />
      <Stars />
      <MoonSystem />
      <ReadySignal />
    </Canvas>
  );
}

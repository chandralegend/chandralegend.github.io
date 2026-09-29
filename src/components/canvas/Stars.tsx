"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scene } from "@/lib/scene-store";
import { starsFragment, starsVertex } from "./shaders";

// Deterministic PRNG so the sky is the same on every visit.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSky(count: number) {
  const rand = mulberry32(1337);
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const dustFrom = Math.floor(count * 0.95);

  for (let i = 0; i < count; i++) {
    const dust = i >= dustFrom;
    if (dust) {
      positions[i * 3] = (rand() * 2 - 1) * 9;
      positions[i * 3 + 1] = (rand() * 2 - 1) * 5.5;
      positions[i * 3 + 2] = rand() * 4 - 1.5;
      sizes[i] = 1.2 + rand() * 2.6;
    } else {
      positions[i * 3] = (rand() * 2 - 1) * 36;
      positions[i * 3 + 1] = (rand() * 2 - 1) * 21;
      positions[i * 3 + 2] = -8 - rand() * 42;
      sizes[i] = 0.55 + Math.pow(rand(), 4) * 3.4;
    }
    seeds[i] = rand();
    const tint = rand();
    const [r, g, b] = tint < 0.12 ? [1, 0.8, 0.66] : tint < 0.3 ? [0.74, 0.84, 1] : [0.96, 0.95, 1];
    const k = dust ? 0.22 : 0.55 + rand() * 0.45;
    colors[i * 3] = r * k;
    colors[i * 3 + 1] = g * k;
    colors[i * 3 + 2] = b * k;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

const drift = { x: 0, y: 0, spin: 0 };

export function Stars() {
  const width = useThree((s) => s.size.width);
  const dpr = useThree((s) => s.viewport.dpr);
  const group = useRef<THREE.Group>(null);
  const count = width < 768 ? 1400 : 2800;

  const geometry = useMemo(() => buildSky(count), [count]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: starsVertex,
        fragmentShader: starsFragment,
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uFade: { value: 0 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((_, delta) => {
    if (!group.current) return;
    const dt = Math.min(delta, 0.1);
    const reduced = scene.reducedMotion;
    const u = material.uniforms;
    u.uPixelRatio.value = dpr;
    if (!reduced) u.uTime.value += dt;
    u.uFade.value += (Math.min(scene.intro * 1.6, 1) - u.uFade.value) * (1 - Math.exp(-dt * 3));

    const ease = 1 - Math.exp(-dt * 1.5);
    drift.x += (-scene.pointer.x * 0.5 - drift.x) * ease;
    drift.y += (-scene.pointer.y * 0.3 - drift.y) * ease;
    if (!reduced) drift.spin += dt * 0.004 + scene.scroll.velocity * 0.00002;
    group.current.position.set(drift.x, drift.y, 0);
    group.current.rotation.z = drift.spin;
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}

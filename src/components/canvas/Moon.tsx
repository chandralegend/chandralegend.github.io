"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scene, type MoonStop } from "@/lib/scene-store";
import { illumination } from "@/lib/moon";
import {
  fullscreenVertex,
  haloFragment,
  haloVertex,
  heightFragment,
  moonFragment,
  moonVertex,
  normalFragment,
  ringFragment,
  ringVertex,
  satelliteFragment,
  satelliteVertex,
} from "./shaders";

const EMBER = new THREE.Vector3(1.0, 0.42, 0.17);
const MOONLIGHT = new THREE.Vector3(0.93, 0.9, 0.84);

/** Bakes the procedural surface into an object-space normal map (RGB) with albedo (A). */
function useMoonTexture(width: number) {
  const gl = useThree((s) => s.gl);

  const target = useMemo(() => {
    const height = width / 2;
    const heightTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      depthBuffer: false,
      generateMipmaps: false,
    });
    const normalTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      depthBuffer: false,
      generateMipmaps: true,
      anisotropy: Math.min(gl.capabilities.getMaxAnisotropy(), 8),
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    const bakeScene = new THREE.Scene();
    bakeScene.add(quad);
    const camera = new THREE.Camera();

    const heightMaterial = new THREE.ShaderMaterial({
      vertexShader: fullscreenVertex,
      fragmentShader: heightFragment,
      uniforms: { uSeed: { value: 7.31 } },
      depthTest: false,
      depthWrite: false,
    });
    const normalMaterial = new THREE.ShaderMaterial({
      vertexShader: fullscreenVertex,
      fragmentShader: normalFragment,
      uniforms: {
        uHeight: { value: heightTarget.texture },
        uTexel: { value: new THREE.Vector2(1 / width, 1 / height) },
        uBump: { value: 1.15 },
      },
      depthTest: false,
      depthWrite: false,
    });

    const previous = gl.getRenderTarget();
    quad.material = heightMaterial;
    gl.setRenderTarget(heightTarget);
    gl.render(bakeScene, camera);
    quad.material = normalMaterial;
    gl.setRenderTarget(normalTarget);
    gl.render(bakeScene, camera);
    gl.setRenderTarget(previous);

    heightTarget.dispose();
    heightMaterial.dispose();
    normalMaterial.dispose();
    quad.geometry.dispose();
    return normalTarget;
  }, [gl, width]);

  useEffect(() => () => target.dispose(), [target]);
  return target.texture;
}

type Orbit = { radius: number; squash: number; tilt: [number, number, number]; speed: number; offset: number };

const ORBITS: Orbit[] = [
  { radius: 1.42, squash: 1, tilt: [1.28, 0.1, 0.32], speed: 0.34, offset: 0.4 },
  { radius: 1.86, squash: 0.96, tilt: [1.42, -0.2, -0.52], speed: 0.22, offset: 2.6 },
  { radius: 2.4, squash: 0.94, tilt: [1.12, 0.3, 0.14], speed: 0.14, offset: 4.9 },
];

function makeRing(orbit: Orbit) {
  const segments = 320;
  const positions = new Float32Array(segments * 3);
  const angles = new Float32Array(segments);
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    positions[i * 3] = Math.cos(a) * orbit.radius;
    positions[i * 3 + 1] = Math.sin(a) * orbit.radius * orbit.squash;
    angles[i] = a;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aAngle", new THREE.BufferAttribute(angles, 1));
  const material = new THREE.ShaderMaterial({
    vertexShader: ringVertex,
    fragmentShader: ringFragment,
    uniforms: { uHead: { value: 0 }, uOpacity: { value: 0 }, uColor: { value: MOONLIGHT } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const ring = new THREE.LineLoop(geometry, material);

  const satGeometry = new THREE.BufferGeometry();
  satGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(3), 3));
  const satMaterial = new THREE.ShaderMaterial({
    vertexShader: satelliteVertex,
    fragmentShader: satelliteFragment,
    uniforms: {
      uColor: { value: EMBER },
      uOpacity: { value: 0 },
      uSize: { value: 5.5 },
      uPixelRatio: { value: 1 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const satellite = new THREE.Points(satGeometry, satMaterial);

  const group = new THREE.Group();
  group.rotation.set(...orbit.tilt);
  group.add(ring, satellite);
  return { group, ring, satellite, material, satMaterial, orbit };
}

export function MoonSystem() {
  const width = useThree((s) => s.size.width);
  const dpr = useThree((s) => s.viewport.dpr);
  const texture = useMoonTexture(width < 768 ? 1024 : 2048);

  const rig = useRef<THREE.Group>(null);
  const moon = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);

  const moonMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: moonVertex,
        fragmentShader: moonFragment,
        uniforms: {
          uNormalMap: { value: texture },
          uLight: { value: new THREE.Vector3(0, 0, -1) },
          uSpot: { value: new THREE.Vector3(0, 0, 1) },
          uSpotAmt: { value: 0 },
          uSpotColor: { value: new THREE.Vector3(1.0, 0.72, 0.52) },
          uRim: { value: new THREE.Vector3(0.36, 0.42, 0.6) },
          uBright: { value: 0 },
          uCamObj: { value: new THREE.Vector3(0, 0, 8) },
        },
      }),
    [texture],
  );

  const haloMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: haloVertex,
        fragmentShader: haloFragment,
        uniforms: {
          uColor: { value: new THREE.Vector3(0.95, 0.86, 0.74) },
          uAmt: { value: 0 },
          uExtent: { value: 3 },
          uIllum: { value: 0 },
          uLight2D: { value: new THREE.Vector2(1, 0) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  const rings = useMemo(() => ORBITS.map(makeRing), []);

  useEffect(
    () => () => {
      moonMaterial.dispose();
      haloMaterial.dispose();
      rings.forEach((r) => {
        r.ring.geometry.dispose();
        r.material.dispose();
        r.satellite.geometry.dispose();
        r.satMaterial.dispose();
      });
    },
    [moonMaterial, haloMaterial, rings],
  );

  const work = useMemo(
    () => ({
      current: { ...scene.stop } as MoonStop,
      light: new THREE.Vector3(),
      quat: new THREE.Quaternion(),
      sphere: new THREE.Sphere(),
      raycaster: new THREE.Raycaster(),
      ndc: new THREE.Vector2(),
      hit: new THREE.Vector3(),
      spotTarget: new THREE.Vector3(0, 0, 1),
      camRight: new THREE.Vector3(),
      camUp: new THREE.Vector3(),
      time: 0,
    }),
    [],
  );

  useFrame((state, delta) => {
    if (!rig.current || !moon.current || !halo.current) return;
    const dt = Math.min(delta, 0.1);
    const reduced = scene.reducedMotion;
    work.time += reduced ? 0 : dt;
    const { camera } = state;
    const vp = state.viewport.getCurrentViewport(camera, [0, 0, 0]);

    // Ease toward the current section's framing.
    const ease = reduced ? 1 : 1 - Math.exp(-dt * 2.8);
    const cur = work.current;
    const target = scene.stop;
    cur.nx += (target.nx - cur.nx) * ease;
    cur.ny += (target.ny - cur.ny) * ease;
    cur.s += (target.s - cur.s) * ease;
    cur.orbits += (target.orbits - cur.orbits) * ease;
    cur.dim += (target.dim - cur.dim) * ease;

    const intro = scene.intro;
    const rise = 1 - Math.pow(1 - intro, 3);
    const radius = (cur.s * vp.height) / 2;
    rig.current.position.set(cur.nx * vp.width, cur.ny * vp.height - (1 - rise) * vp.height * 0.22, 0);
    rig.current.scale.setScalar(radius);

    moon.current.rotation.y += reduced ? 0 : dt * 0.018 + Math.abs(scene.scroll.velocity) * 0.00005;
    rig.current.updateMatrixWorld();

    // Sunlight direction from the phase: behind the moon at new, beside it at quarter, in front at full.
    const theta = scene.phase * Math.PI;
    const light = work.light.set(Math.sin(theta), 0.16, -Math.cos(theta)).normalize();
    moon.current.getWorldQuaternion(work.quat).invert();
    const u = moonMaterial.uniforms;
    u.uLight.value.copy(light).applyQuaternion(work.quat);
    u.uCamObj.value.copy(camera.position);
    moon.current.worldToLocal(u.uCamObj.value);
    const brightness = cur.dim * Math.min(intro / 0.55, 1);
    u.uBright.value = brightness;

    // Pointer flashlight.
    work.ndc.set(scene.pointer.x, scene.pointer.y);
    work.raycaster.setFromCamera(work.ndc, camera);
    work.sphere.set(rig.current.position, radius);
    const hit = scene.pointer.active ? work.raycaster.ray.intersectSphere(work.sphere, work.hit) : null;
    scene.hoverMoon = !!hit;
    if (hit) work.spotTarget.copy(moon.current.worldToLocal(hit)).normalize();
    u.uSpot.value.lerp(work.spotTarget, reduced ? 1 : 1 - Math.exp(-dt * 10)).normalize();
    u.uSpotAmt.value += ((hit ? 1 : 0) - u.uSpotAmt.value) * (1 - Math.exp(-dt * 5));

    // Halo faces the camera and leans toward the sunlit limb.
    halo.current.quaternion.copy(camera.quaternion);
    const illum = illumination(scene.phase);
    const h = haloMaterial.uniforms;
    h.uAmt.value = (0.1 + 0.9 * illum) * brightness;
    h.uIllum.value = illum;
    work.camRight.setFromMatrixColumn(camera.matrixWorld, 0);
    work.camUp.setFromMatrixColumn(camera.matrixWorld, 1);
    const lx = light.dot(work.camRight);
    const ly = light.dot(work.camUp);
    const len = Math.hypot(lx, ly) || 1;
    h.uLight2D.value.set(lx / len, ly / len);

    // Orbits: comet-tail rings with a satellite at each head.
    for (const r of rings) {
      const head = r.orbit.offset + work.time * r.orbit.speed;
      r.material.uniforms.uHead.value = head % (Math.PI * 2);
      const opacity = cur.orbits * brightness * 0.85;
      r.material.uniforms.uOpacity.value = opacity;
      r.satMaterial.uniforms.uOpacity.value = opacity;
      r.satMaterial.uniforms.uPixelRatio.value = dpr;
      r.satMaterial.uniforms.uSize.value = 5.5 * Math.max(radius, 0.6);
      r.satellite.position.set(
        Math.cos(head) * r.orbit.radius,
        Math.sin(head) * r.orbit.radius * r.orbit.squash,
        0,
      );
    }
  });

  return (
    <group ref={rig}>
      <mesh ref={halo} material={haloMaterial} renderOrder={-1}>
        <planeGeometry args={[6, 6]} />
      </mesh>
      <mesh ref={moon} material={moonMaterial} rotation={[0.28, 0, 0.06]}>
        <sphereGeometry args={[1, 160, 120]} />
      </mesh>
      {rings.map((r, i) => (
        <primitive key={i} object={r.group} />
      ))}
    </group>
  );
}

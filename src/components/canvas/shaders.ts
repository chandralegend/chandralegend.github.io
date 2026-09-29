/* The moon is fully procedural: a height/albedo field is baked once into a texture,
   converted to an object-space normal map, then lit every frame. */

const hashes = /* glsl */ `
  // Hash functions after Dave Hoskins, "Hash without Sine" (MIT License).
  float hash13(vec3 p3) {
    p3 = fract(p3 * 0.1031);
    p3 += dot(p3, p3.zyx + 31.32);
    return fract((p3.x + p3.y) * p3.z);
  }
  vec3 hash33(vec3 p3) {
    p3 = fract(p3 * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yxz + 33.33);
    return fract((p3.xxy + p3.yxx) * p3.zyx);
  }
`;

// Maps a texel of an equirectangular texture to the matching direction on three.js' SphereGeometry.
const sphereDir = /* glsl */ `
  #define PI 3.141592653589793
  vec3 sphereDir(vec2 uv) {
    float phi = uv.x * 2.0 * PI;
    float theta = (1.0 - uv.y) * PI;
    return vec3(-cos(phi) * sin(theta), cos(theta), sin(phi) * sin(theta));
  }
`;

export const fullscreenVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/* Pass 1 — terrain height (16-bit, packed into R+G) and albedo (B). */
export const heightFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uSeed;
  ${hashes}
  ${sphereDir}

  float vnoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    return mix(
      mix(mix(hash13(i), hash13(i + vec3(1.0, 0.0, 0.0)), u.x),
          mix(hash13(i + vec3(0.0, 1.0, 0.0)), hash13(i + vec3(1.0, 1.0, 0.0)), u.x), u.y),
      mix(mix(hash13(i + vec3(0.0, 0.0, 1.0)), hash13(i + vec3(1.0, 0.0, 1.0)), u.x),
          mix(hash13(i + vec3(0.0, 1.0, 1.0)), hash13(i + vec3(1.0, 1.0, 1.0)), u.x), u.y),
      u.z);
  }

  float fbm(vec3 p) {
    float sum = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
      sum += amp * vnoise(p);
      p = p * 2.03 + vec3(1.7, 9.2, 3.1);
      amp *= 0.5;
    }
    return sum;
  }

  // One octave of craters: returns (height, freshness brightness).
  vec2 craters(vec3 p, float density, float rMin, float rMax) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    float h = 0.0;
    float b = 0.0;
    for (int z = -1; z <= 1; z++)
    for (int y = -1; y <= 1; y++)
    for (int x = -1; x <= 1; x++) {
      vec3 o = vec3(float(x), float(y), float(z));
      vec3 cell = i + o;
      vec3 r = hash33(cell + uSeed);
      if (r.x > density) continue;
      vec3 c = o + 0.2 + 0.6 * hash33(cell * 1.7 + 11.3 + uSeed);
      float rad = mix(rMin, rMax, r.y * r.y);
      float d = length(f - c) / rad;
      if (d > 2.0) continue;
      float age = r.z;                                // 0 fresh … 1 eroded
      float depth = mix(1.0, 0.3, age);
      float bowl = max(d * d - 1.0, -0.72) * (1.0 - smoothstep(0.9, 1.0, d));
      float rim = exp(-pow((d - 1.0) * 4.2, 2.0));
      float peak = exp(-d * d * 55.0) * 0.22;
      float ejecta = (1.0 - smoothstep(1.0, 2.0, d)) * step(1.0, d);
      h += (bowl * 0.9 + rim * 0.36 + peak - ejecta * 0.05) * depth;
      b += (rim * 0.28 + ejecta * 0.14) * (1.0 - age) * (1.0 - age);
    }
    return vec2(h, b);
  }

  void main() {
    vec3 p = sphereDir(vUv);

    float warp = vnoise(p * 1.7 + 7.0);
    float mariaField = fbm(p * 1.3 + warp * 0.9);
    float maria = smoothstep(0.5, 0.585, mariaField);
    float highlands = 1.0 - 0.88 * maria;

    vec2 c1 = craters(p * 2.4, 0.55, 0.22, 0.46);
    vec2 c2 = craters(p * 5.5 + 3.1, 0.72, 0.16, 0.42);
    vec2 c3 = craters(p * 12.0 + 7.7, 0.78, 0.14, 0.4);
    vec2 c4 = craters(p * 26.0 + 1.3, 0.74, 0.12, 0.38);

    float h = c1.x * 0.055 * mix(1.0, 0.4, maria)
            + c2.x * 0.028 * highlands
            + c3.x * 0.014 * highlands
            + c4.x * 0.006 * mix(1.0, 0.4, maria);
    h += (fbm(p * 20.0) - 0.5) * 0.008 * highlands;
    h -= maria * 0.012;

    float bright = (c1.y * 0.55 + c2.y * 0.5 + c3.y * 0.4 + c4.y * 0.3) * mix(1.0, 0.5, maria);
    float tone = fbm(p * 6.0 + 2.0);
    float albedo = mix(0.8, 0.24, maria) + (tone - 0.5) * 0.18 + bright * 0.4;

    float hn = clamp(h * 4.0 + 0.5, 0.0, 1.0);
    float hi = floor(hn * 255.0) / 255.0;
    float lo = fract(hn * 255.0);
    gl_FragColor = vec4(hi, lo, clamp(albedo, 0.0, 1.0), 1.0);
  }
`;

/* Pass 2 — object-space normals from the height field (RGB) + albedo (A). */
export const normalFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uHeight;
  uniform vec2 uTexel;
  uniform float uBump;
  ${sphereDir}

  float heightAt(vec2 uv) {
    vec4 t = texture2D(uHeight, vec2(fract(uv.x), clamp(uv.y, 0.0, 1.0)));
    return (t.r + t.g / 255.0 - 0.5) / 4.0;
  }

  void main() {
    vec3 dir = sphereDir(vUv);
    float phi = vUv.x * 2.0 * PI;
    float theta = (1.0 - vUv.y) * PI;
    float st = max(sin(theta), 0.02);

    vec3 east = vec3(sin(phi), 0.0, cos(phi));
    vec3 north = vec3(cos(phi) * cos(theta), sin(theta), -sin(phi) * cos(theta));

    float hE = heightAt(vUv + vec2(uTexel.x, 0.0));
    float hW = heightAt(vUv - vec2(uTexel.x, 0.0));
    float hN = heightAt(vUv + vec2(0.0, uTexel.y));
    float hS = heightAt(vUv - vec2(0.0, uTexel.y));

    float gE = (hE - hW) / (2.0 * uTexel.x * 2.0 * PI * st);
    float gN = (hN - hS) / (2.0 * uTexel.y * PI);

    vec3 n = normalize(dir - uBump * (gE * east + gN * north));
    float albedo = texture2D(uHeight, vUv).b;
    gl_FragColor = vec4(n * 0.5 + 0.5, albedo);
  }
`;

export const moonVertex = /* glsl */ `
  uniform vec3 uCamObj;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vNormal = normal;
    vView = uCamObj - position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const moonFragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uNormalMap;
  uniform vec3 uLight;
  uniform vec3 uSpot;
  uniform float uSpotAmt;
  uniform vec3 uSpotColor;
  uniform vec3 uRim;
  uniform float uBright;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec4 t = texture2D(uNormalMap, vUv);
    vec3 n = normalize(t.xyz * 2.0 - 1.0);
    vec3 ns = normalize(vNormal);
    vec3 V = normalize(vView);
    vec3 L = normalize(uLight);
    float albedo = t.a;

    // Lommel–Seeliger blended with Lambert: the flat, powdery look of regolith.
    float mu0 = max(dot(n, L), 0.0);
    float mu = max(dot(ns, V), 0.0);
    float lommel = min(2.0 * mu0 / (mu0 + mu + 0.0001), 1.4);
    float diffuse = mix(mu0, lommel, 0.55);
    float terminator = smoothstep(-0.05, 0.13, dot(ns, L));
    diffuse *= terminator;

    vec3 base = mix(vec3(0.25, 0.245, 0.24), vec3(0.96, 0.94, 0.9), albedo);
    vec3 col = base * diffuse * vec3(1.0, 0.97, 0.93);

    // Earthshine keeps the night side faintly visible.
    float night = 1.0 - terminator;
    col += base * night * vec3(0.085, 0.1, 0.14) * (0.3 + 0.7 * max(dot(n, V), 0.0));

    // Pointer "flashlight" for exploring the dark side.
    float spot = smoothstep(0.36, 0.0, distance(ns, uSpot)) * uSpotAmt;
    col += base * uSpotColor * spot * pow(max(dot(n, V), 0.0), 1.6) * (0.3 + 0.7 * night);

    // Limb glow.
    float fres = pow(1.0 - mu, 3.5);
    col += uRim * fres * (0.1 + 0.5 * terminator);

    gl_FragColor = vec4(col * uBright, 1.0);
  }
`;

export const haloVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const haloFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uAmt;
  uniform float uExtent;
  uniform float uIllum;
  uniform vec2 uLight2D;
  void main() {
    vec2 p = (vUv - 0.5) * 2.0 * uExtent;
    float r = length(p);
    if (r < 0.985) discard;
    float g = exp(-(r - 1.0) * 6.0) * 0.5 + exp(-(r - 1.0) * 1.7) * 0.14;
    float side = mix(0.3 + 0.7 * max(dot(normalize(p), uLight2D), 0.0), 1.0, uIllum);
    float a = g * side * uAmt;
    gl_FragColor = vec4(uColor, a);
  }
`;

export const starsVertex = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uFade;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float twinkle = 0.62 + 0.38 * sin(uTime * (0.5 + aSeed * 1.9) + aSeed * 40.0);
    vAlpha = twinkle * uFade;
    vColor = aColor;
    gl_PointSize = aSize * uPixelRatio * (30.0 / -mv.z);
  }
`;

export const starsFragment = /* glsl */ `
  precision highp float;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = pow(smoothstep(0.5, 0.0, d), 2.4) * vAlpha;
    if (a < 0.004) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

export const ringVertex = /* glsl */ `
  attribute float aAngle;
  varying float vAngle;
  void main() {
    vAngle = aAngle;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const ringFragment = /* glsl */ `
  precision highp float;
  uniform float uHead;
  uniform float uOpacity;
  uniform vec3 uColor;
  varying float vAngle;
  void main() {
    float behind = mod(uHead - vAngle + 12.566370614359172, 6.283185307179586);
    float tail = exp(-behind * 2.4);
    float a = (0.12 + 0.88 * tail) * uOpacity;
    gl_FragColor = vec4(uColor, a);
  }
`;

export const satelliteVertex = /* glsl */ `
  uniform float uSize;
  uniform float uPixelRatio;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (30.0 / -mv.z);
  }
`;

export const satelliteFragment = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.14, 0.0, d);
    float glow = pow(smoothstep(0.5, 0.0, d), 3.0) * 0.7;
    float a = min(core + glow, 1.0) * uOpacity;
    if (a < 0.004) discard;
    gl_FragColor = vec4(mix(uColor, vec3(1.0), core * 0.7), a);
  }
`;

// Three.js gold globe — same scene style as the Sun Resorts 3D bay map
// (custom ShaderMaterials, mouse parallax camera, IntersectionObserver pause,
// context-loss handling, adaptive pixel ratio). Motif matches the Asmyne logo:
// globe, meridians, orbital ring, traveling gold "airplane" marker.

import * as THREE from "three";
import { isMobile } from "./glutil";

const ATMOS_VS = `
varying vec3 vNormal;
void main(){
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const ATMOS_FS = `
precision highp float;
varying vec3 vNormal;
uniform float uTime;
void main(){
  float fres = pow(1.0 - abs(vNormal.z), 2.2);
  vec3 gold = vec3(0.86, 0.68, 0.28);
  vec3 halo = vec3(0.98, 0.88, 0.55);
  vec3 col = mix(gold, halo, fres);
  float pulse = 0.75 + 0.25 * sin(uTime * 0.8);
  gl_FragColor = vec4(col, fres * 0.55 * pulse);
}`;

const CORE_VS = `
varying vec3 vN; varying vec3 vPos;
void main(){
  vN = normalize(normalMatrix * normal);
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const CORE_FS = `
precision highp float;
varying vec3 vN; varying vec3 vPos;
uniform float uTime;
void main(){
  float lat = acos(clamp(vPos.y, -1.0, 1.0));
  float lon = atan(vPos.z, vPos.x);
  float mer = smoothstep(0.03, 0.008, abs(fract(lon / 0.785398 + 0.5) - 0.5));
  float par = smoothstep(0.03, 0.008, abs(fract(lat / 0.448 + 0.5) - 0.5));
  float grid = max(mer, par);
  float fres = pow(1.0 - abs(dot(normalize(vN), vec3(0.0,0.0,1.0))), 2.0);
  vec3 ink = vec3(0.04, 0.07, 0.16);
  vec3 gold = vec3(0.90, 0.74, 0.32);
  vec3 col = mix(ink, gold, grid * 0.85 + fres * 0.25);
  col += gold * fres * 0.35;
  col += vec3(0.15, 0.2, 0.4) * (0.5 + 0.5 * sin(uTime * 0.6 + vPos.y * 4.0)) * 0.12;
  gl_FragColor = vec4(col, 1.0);
}`;

export type GlobeApi = { destroy: () => void };

export function initGlobe(stage: HTMLElement, { onReady }: { onReady?: () => void } = {}): GlobeApi | null {
  const canvas = stage.querySelector("canvas");
  if (!canvas) return null;
  const mobile = isMobile();
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !mobile,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch (e) {
    console.warn(e);
    return null;
  }

  const onLost = (e: Event) => {
    e.preventDefault();
    stage.classList.remove("ready");
  };
  canvas.addEventListener("webglcontextlost", onLost);

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.6));
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x050814, 6, 14);
  const cam = new THREE.PerspectiveCamera(mobile ? 42 : 32, 1, 0.1, 40);
  cam.position.set(0, 0.15, 5.4);

  const uTime = { value: 0 };

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(1.55, mobile ? 48 : 80, mobile ? 32 : 56),
    new THREE.ShaderMaterial({ vertexShader: CORE_VS, fragmentShader: CORE_FS, uniforms: { uTime } }),
  );
  scene.add(core);

  const wire = new THREE.Mesh(
    new THREE.SphereGeometry(1.562, 32, 24),
    new THREE.MeshBasicMaterial({ color: 0xd4af37, wireframe: true, transparent: true, opacity: 0.18 }),
  );
  scene.add(wire);

  const atmos = new THREE.Mesh(
    new THREE.SphereGeometry(1.82, 48, 32),
    new THREE.ShaderMaterial({
      vertexShader: ATMOS_VS,
      fragmentShader: ATMOS_FS,
      uniforms: { uTime },
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
    }),
  );
  scene.add(atmos);

  // fibonacci gold points
  const count = mobile ? 280 : 520;
  const positions = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    positions[i * 3] = Math.cos(theta) * r * 1.57;
    positions[i * 3 + 1] = y * 1.57;
    positions[i * 3 + 2] = Math.sin(theta) * r * 1.57;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({ color: 0xf6e27a, size: mobile ? 0.028 : 0.022, sizeAttenuation: true, transparent: true, opacity: 0.9 }),
  );
  scene.add(points);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.15, 0.012, 12, 120),
    new THREE.MeshBasicMaterial({ color: 0xe8c872, transparent: true, opacity: 0.75 }),
  );
  ring.rotation.x = Math.PI / 2.6;
  ring.rotation.y = 0.4;
  scene.add(ring);

  const plane = new THREE.Mesh(
    new THREE.ConeGeometry(0.045, 0.16, 6),
    new THREE.MeshBasicMaterial({ color: 0xfff1b0 }),
  );
  plane.rotation.x = Math.PI / 2;
  const planePivot = new THREE.Group();
  const planeArm = new THREE.Group();
  planeArm.position.x = 2.15;
  planeArm.add(plane);
  planePivot.rotation.copy(ring.rotation);
  planePivot.add(planeArm);
  scene.add(planePivot);

  const glow = new THREE.PointLight(0xd4af37, 4, 12);
  glow.position.set(2.2, 1.4, 3.2);
  scene.add(glow);
  scene.add(new THREE.AmbientLight(0x334466, 0.8));

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointer = (e: PointerEvent) => {
    const r = stage.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left) / r.width - 0.5;
    mouse.ty = (e.clientY - r.top) / r.height - 0.5;
  };
  stage.addEventListener("pointermove", onPointer);

  const resize = () => {
    const r = stage.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    cam.aspect = r.width / Math.max(r.height, 1);
    cam.updateProjectionMatrix();
  };
  resize();
  addEventListener("resize", resize);

  let raf = 0;
  let visible = false;
  let destroyed = false;
  const t0 = performance.now();
  let announced = false;

  function frame(now: number) {
    if (destroyed) return;
    raf = requestAnimationFrame(frame);
    const t = (now - t0) / 1000;
    uTime.value = t;
    core.rotation.y = t * 0.12;
    wire.rotation.y = t * 0.12;
    points.rotation.y = t * 0.12;
    ring.rotation.z = t * 0.18;
    planePivot.rotation.z = t * 0.18;
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    cam.position.x = mouse.x * 0.7;
    cam.position.y = 0.15 - mouse.y * 0.45;
    cam.lookAt(0, 0, 0);
    renderer.render(scene, cam);
    if (!announced) {
      announced = true;
      stage.classList.add("ready");
      onReady?.();
    }
  }

  const io = new IntersectionObserver(
    ([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !destroyed) raf = requestAnimationFrame(frame);
    },
    { rootMargin: "100px" },
  );
  io.observe(stage);
  const onVis = () => {
    cancelAnimationFrame(raf);
    if (!document.hidden && visible && !destroyed) raf = requestAnimationFrame(frame);
  };
  document.addEventListener("visibilitychange", onVis);

  const destroy = () => {
    destroyed = true;
    cancelAnimationFrame(raf);
    io.disconnect();
    removeEventListener("resize", resize);
    stage.removeEventListener("pointermove", onPointer);
    canvas.removeEventListener("webglcontextlost", onLost);
    document.removeEventListener("visibilitychange", onVis);
    renderer.dispose();
    core.geometry.dispose();
    (core.material as THREE.Material).dispose();
    wire.geometry.dispose();
    (wire.material as THREE.Material).dispose();
    atmos.geometry.dispose();
    (atmos.material as THREE.Material).dispose();
    pGeo.dispose();
    (points.material as THREE.Material).dispose();
    ring.geometry.dispose();
    (ring.material as THREE.Material).dispose();
    plane.geometry.dispose();
    (plane.material as THREE.Material).dispose();
  };

  return { destroy };
}

// Hero atmosphere: same raw-WebGL architecture as the Sun Resorts ocean
// hero (pointer look, tilt, click ripples, adaptive resolution, pause offscreen),
// retuned to a navy / gold cosmic field for Asmyne Group.

import { createGL, program, quad, VS, isMobile, type GLProgram } from "./glutil";

const FS = `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes; uniform float uTime; uniform vec2 uLook; uniform float uRise; uniform vec2 uRipple; uniform float uRippleT;
float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.07; a*=.5; } return v; }
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / uRes.y;
  float t = uTime;
  vec2 look = uLook * 0.22;
  vec2 p = uv + look * 0.15;

  vec3 deep = vec3(0.015, 0.025, 0.07);
  vec3 mid  = vec3(0.04, 0.08, 0.20);
  vec3 rim  = vec3(0.10, 0.16, 0.34);
  vec3 col = mix(deep, mid, smoothstep(-0.85, 0.55, p.y));
  col = mix(col, rim, smoothstep(0.15, 1.15, p.y)*0.55);

  float n1 = fbm(p*1.35 + vec2(t*0.028, t*0.018) + look);
  float n2 = fbm(p*2.6 - vec2(t*0.04, -t*0.02) + 3.1);
  float neb = pow(n1*0.65 + n2*0.45, 1.6);
  vec3 gold = vec3(0.83, 0.65, 0.28);
  vec3 goldHot = vec3(0.98, 0.86, 0.52);
  col = mix(col, gold*0.55, neb*0.42);
  col = mix(col, goldHot, pow(neb, 3.2)*0.38);

  // gold "sun" disc, slightly off-center like a rising brand light
  vec2 sunP = vec2(0.55 + look.x*0.2, 0.22 + look.y*0.12);
  float sd = length(p - sunP);
  col += goldHot * smoothstep(0.55, 0.0, sd) * 0.28;
  col += vec3(1.0, 0.82, 0.45) * pow(max(1.0 - sd*2.2, 0.0), 8.0) * 0.55;

  // stars
  vec2 sg = p * 95.0;
  float stars = step(0.996, hash(floor(sg)));
  float tw = 0.55 + 0.45*sin(t*3.0 + hash(floor(sg))*40.0);
  col += stars * tw * vec3(1.0, 0.93, 0.75);

  // click ripple
  float rp = length(uv - uRipple);
  float ring = sin(rp*18. - uRippleT*9.)*exp(-rp*1.6)*exp(-uRippleT*0.85)*0.35;
  col += goldHot * max(ring, 0.0);

  // rise: gold light washes up from the bottom
  float wash = smoothstep(0.0, 1.0, uRise);
  col = mix(col * 0.45, col, wash);
  col += gold * (1.0 - wash) * smoothstep(-0.2, 0.8, -uv.y) * 0.12;

  col = pow(col, vec3(0.95));
  col *= 1.0 - 0.32*pow(length(vUv-0.5)*1.28, 2.2);
  gl_FragColor = vec4(col, 1.0);
}`;

export type AtmosphereApi = {
  state: { rise: number; visible: boolean };
  enableTilt: () => Promise<boolean>;
  needsPermission: boolean;
  destroy: () => void;
};

export function initAtmosphere(canvas: HTMLCanvasElement, { onFirstFrame }: { onFirstFrame?: () => void } = {}): AtmosphereApi | null {
  const raw = createGL(canvas, { alpha: false });
  if (!raw) return null;
  const gl: WebGLRenderingContext = raw;
  let prog: GLProgram;
  try {
    prog = program(gl, VS, FS);
  } catch (e) {
    console.warn(e);
    return null;
  }
  const draw = quad(gl, prog);
  const mobile = isMobile();
  const maxScale = mobile ? Math.min(devicePixelRatio, 2) * 0.4 : Math.min(devicePixelRatio, 1.5) * 0.75;
  let scale = maxScale;
  let ema = 16;
  let frames = 0;
  let w = 0;
  let h = 0;
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    w = Math.max(2, Math.round(r.width * scale));
    h = Math.max(2, Math.round(r.height * scale));
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  };
  resize();
  const onResize = () => resize();
  addEventListener("resize", onResize);
  const look = { x: 0, y: 0, tx: 0, ty: 0 };
  const ripple = { x: 0, y: 6, t: 10 };
  const state = { rise: 0, visible: true };
  let first = true;
  const t0 = performance.now();
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "mouse") {
      look.tx = (e.clientX / innerWidth - 0.5) * 2;
      look.ty = -(e.clientY / innerHeight - 0.5) * 2;
    }
  };
  addEventListener("pointermove", onMove, { passive: true });
  const parent = canvas.parentElement;
  const onDown = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const u = (e.clientX - r.left - r.width / 2) / r.height;
    const v = -((e.clientY - r.top - r.height / 2) / r.height);
    ripple.x = u;
    ripple.y = v;
    ripple.t = 0;
    if (e.pointerType !== "mouse") look.tx = u * 1.2;
  };
  parent?.addEventListener("pointerdown", onDown);
  const onOrient = (e: DeviceOrientationEvent) => {
    if (e.gamma == null) return;
    look.tx = Math.max(-1, Math.min(1, e.gamma / 30));
    look.ty = Math.max(-1, Math.min(1, ((e.beta || 45) - 45) / 30));
  };
  const enableTilt = async () => {
    const D = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };
    if (!D) return false;
    if (typeof D.requestPermission === "function") {
      try {
        const r = await D.requestPermission();
        if (r !== "granted") return false;
      } catch {
        return false;
      }
    }
    addEventListener("deviceorientation", onOrient, { passive: true });
    return true;
  };
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const needsPermission = isIOS && !!(window.DeviceOrientationEvent && typeof (window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === "function");
  if (mobile && !isIOS) addEventListener("deviceorientation", onOrient, { passive: true });

  let raf = 0;
  let last = 0;
  let destroyed = false;
  const frameMs = mobile ? 1000 / 45 : 0;
  function loop(now = performance.now()) {
    if (destroyed) return;
    cancelAnimationFrame(raf);
    if (!state.visible || document.hidden) return;
    raf = requestAnimationFrame(loop);
    if (frameMs && now - last < frameMs) return;
    const dtMs = now - (last || now);
    const dt = Math.min(0.05, dtMs / 1000);
    last = now;
    if (dtMs > 0 && dtMs < 200) ema = ema * 0.92 + dtMs * 0.08;
    if (++frames % 45 === 0) {
      const budget = mobile ? 1000 / 40 : 1000 / 50;
      if (ema > budget && scale > 0.3) {
        scale = Math.max(0.3, scale * 0.82);
        resize();
      } else if (ema < budget * 0.6 && scale < maxScale) {
        scale = Math.min(maxScale, scale * 1.08);
        resize();
      }
    }
    look.x += (look.tx - look.x) * 0.04;
    look.y += (look.ty - look.y) * 0.04;
    ripple.t += dt;
    const t = (now - t0) / 1000;
    gl.useProgram(prog.p);
    gl.uniform2f(prog.u.uRes, w, h);
    gl.uniform1f(prog.u.uTime, t);
    gl.uniform2f(prog.u.uLook, look.x, look.y);
    gl.uniform1f(prog.u.uRise, state.rise);
    gl.uniform2f(prog.u.uRipple, ripple.x, ripple.y);
    gl.uniform1f(prog.u.uRippleT, ripple.t);
    draw();
    if (first) {
      first = false;
      onFirstFrame?.();
    }
  }

  const io = new IntersectionObserver(
    ([en]) => {
      state.visible = en.isIntersecting;
      if (state.visible) loop();
    },
    { threshold: 0 },
  );
  io.observe(canvas);
  const onVis = () => {
    if (!document.hidden) loop();
  };
  document.addEventListener("visibilitychange", onVis);
  loop();

  const destroy = () => {
    destroyed = true;
    cancelAnimationFrame(raf);
    io.disconnect();
    removeEventListener("resize", onResize);
    removeEventListener("pointermove", onMove);
    parent?.removeEventListener("pointerdown", onDown);
    removeEventListener("deviceorientation", onOrient);
    document.removeEventListener("visibilitychange", onVis);
  };

  return { state, enableTilt, needsPermission, destroy };
}

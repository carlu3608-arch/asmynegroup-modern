// Desktop-only fx, ported from Sun Resorts fx.js: WebGL ripple/displacement
// hover on [data-ripple] images, plus a liquid metaball cursor retinted gold.

import { createGL, program, quad, texture, coverScale, VS, type GLProgram } from "./glutil";

const RIPPLE_FS = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex; uniform vec2 uScale; uniform vec4 uRect; uniform vec2 uRes; uniform vec2 uMouse;
uniform float uStr; uniform float uTime; uniform float uZoom; uniform float uRadius;
float sdRound(vec2 p, vec2 b, float r){ vec2 q = abs(p)-b+r; return length(max(q,0.))+min(max(q.x,q.y),0.)-r; }
void main(){
  vec2 px = vec2(vUv.x*uRes.x, (1.-vUv.y)*uRes.y);
  vec2 local = (px - uRect.xy) / uRect.zw;
  if (local.x < 0. || local.y < 0. || local.x > 1. || local.y > 1.) discard;
  float d = sdRound((local-0.5)*uRect.zw, uRect.zw*0.5, uRadius);
  float mask = smoothstep(0.75, -0.75, d);
  vec2 m = (uMouse - uRect.xy)/uRect.zw;
  vec2 dir = local - m; float dist = length(dir*vec2(uRect.z/uRect.w,1.));
  float wave = sin(dist*34. - uTime*7.)*exp(-dist*3.2)*0.022*uStr;
  vec2 uv = local + normalize(dir+1e-5)*wave;
  uv += vec2(sin(local.y*10.+uTime*2.), cos(local.x*8.+uTime*1.6))*0.006*uStr;
  uv = (uv - 0.5)/uZoom + 0.5;
  uv = (uv - 0.5)*uScale + 0.5; uv.y = 1. - uv.y;
  float sh = 0.006*uStr;
  vec3 col = vec3(texture2D(uTex, uv+vec2(sh,0.)).r, texture2D(uTex, uv).g, texture2D(uTex, uv-vec2(sh,0.)).b);
  col += vec3(1.,0.9,0.6)*max(wave,0.)*6.;
  gl_FragColor = vec4(col*mask, mask);
}`;

const CURSOR_FS = `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes; uniform vec2 uP[6]; uniform float uSize; uniform float uTime;
void main(){
  vec2 px = vec2(vUv.x*uRes.x, (1.-vUv.y)*uRes.y);
  float f = 0.;
  for (int i=0;i<6;i++){ float r = uSize*(1.-float(i)*0.12); vec2 d = px-uP[i]; f += r*r/(dot(d,d)+1.); }
  float a = smoothstep(0.95, 1.05, f);
  vec3 gold = vec3(0.91, 0.75, 0.32);
  gl_FragColor = vec4(gold * a, a);
}`;

export function initFx() {
  const c = document.createElement("canvas");
  c.className = "fx-canvas";
  document.body.appendChild(c);
  const raw = createGL(c);
  if (!raw) {
    c.remove();
    return () => undefined;
  }
  const gl: WebGLRenderingContext = raw;
  let prog: GLProgram;
  try {
    prog = program(gl, VS, RIPPLE_FS);
  } catch (e) {
    console.warn(e);
    c.remove();
    return () => undefined;
  }
  const draw = quad(gl, prog);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  const dpr = Math.min(devicePixelRatio, 1.5);
  const size = () => {
    c.width = innerWidth * dpr;
    c.height = innerHeight * dpr;
    gl.viewport(0, 0, c.width, c.height);
  };
  size();
  addEventListener("resize", size);
  const texCache = new Map<string, ReturnType<typeof texture>>();
  let active: { el: Element; img: HTMLImageElement; tex: ReturnType<typeof texture>; str: number; target: number } | null = null;
  const mouse = { x: -999, y: -999 };
  const onMove = (e: PointerEvent) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  };
  addEventListener("pointermove", onMove, { passive: true });

  const enterHandlers: Array<[Element, EventListener]> = [];
  const leaveHandlers: Array<[Element, EventListener]> = [];
  document.querySelectorAll("[data-ripple]").forEach((el) => {
    const img = el.querySelector("img");
    if (!img) return;
    const onEnter = () => {
      if (active && active.el !== el) active.img.style.visibility = "";
      let tex = texCache.get(img.currentSrc || img.src);
      if (!tex) {
        tex = texture(gl, img);
        texCache.set(img.currentSrc || img.src, tex);
      }
      active = { el, img, tex, str: active && active.el === el ? active.str : 0, target: 1 };
      tick();
    };
    const onLeave = () => {
      if (active && active.el === el) active.target = 0;
    };
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    enterHandlers.push([el, onEnter]);
    leaveHandlers.push([el, onLeave]);
  });

  let raf = 0;
  function tick() {
    cancelAnimationFrame(raf);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!active) return;
    active.str += (active.target - active.str) * 0.08;
    const r = active.el.getBoundingClientRect();
    if (active.tex.ready) {
      active.img.style.visibility = "hidden";
      const radius = parseFloat(getComputedStyle(active.el).borderTopLeftRadius) || 0;
      gl.useProgram(prog.p);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, active.tex.tex);
      gl.uniform1i(prog.u.uTex, 0);
      gl.uniform2fv(prog.u.uScale, coverScale(active.tex.w, active.tex.h, r.width, r.height));
      gl.uniform4f(prog.u.uRect, r.left, r.top, r.width, r.height);
      gl.uniform2f(prog.u.uRes, innerWidth, innerHeight);
      gl.uniform2f(prog.u.uMouse, mouse.x, mouse.y);
      gl.uniform1f(prog.u.uStr, active.str);
      gl.uniform1f(prog.u.uTime, performance.now() / 1000);
      gl.uniform1f(prog.u.uZoom, 1 + active.str * 0.08);
      gl.uniform1f(prog.u.uRadius, radius);
      draw();
    }
    if (active.target === 0 && active.str < 0.01) {
      active.img.style.visibility = "";
      active = null;
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  const cc = document.createElement("canvas");
  cc.className = "cursor-canvas";
  document.body.appendChild(cc);
  const g2raw = createGL(cc);
  const g2: WebGLRenderingContext | null = g2raw;
  let cursorRaf = 0;
  let cursorRunning = true;
  if (g2) {
    let cp: GLProgram | undefined;
    try {
      cp = program(g2, VS, CURSOR_FS);
    } catch (e) {
      console.warn(e);
      cc.remove();
    }
    if (cp) {
      const cdraw = quad(g2, cp);
      const csize = () => {
        cc.width = innerWidth;
        cc.height = innerHeight;
        g2.viewport(0, 0, cc.width, cc.height);
      };
      csize();
      addEventListener("resize", csize);
      document.documentElement.classList.add("has-cursor");
      const pts = Array.from({ length: 6 }, () => ({ x: -200, y: -200 }));
      let bsize = 9;
      let sizeT = 9;
      let idle = 0;
      const hoverSel = "a, button, [data-ripple], input, textarea, label";
      const onOver = (e: PointerEvent) => {
        const t = e.target as Element | null;
        sizeT = t?.closest?.("[data-ripple]") ? 30 : t?.closest?.(hoverSel) ? 24 : 9;
      };
      const onDown = () => {
        bsize *= 0.6;
      };
      addEventListener("pointerover", onOver, { passive: true });
      addEventListener("pointerdown", onDown, { passive: true });
      const cl = () => {
        if (!cursorRunning) return;
        cursorRaf = requestAnimationFrame(cl);
        if (document.hidden) return;
        const moving =
          Math.abs(pts[0].x - mouse.x) + Math.abs(pts[pts.length - 1].x - mouse.x) > 0.5 || Math.abs(bsize - sizeT) > 0.1;
        if (!moving && ++idle > 3) return;
        if (moving) idle = 0;
        pts[0].x += (mouse.x - pts[0].x) * 0.5;
        pts[0].y += (mouse.y - pts[0].y) * 0.5;
        for (let i = 1; i < pts.length; i += 1) {
          pts[i].x += (pts[i - 1].x - pts[i].x) * 0.42;
          pts[i].y += (pts[i - 1].y - pts[i].y) * 0.42;
        }
        bsize += (sizeT - bsize) * 0.15;
        g2.clearColor(0, 0, 0, 0);
        g2.clear(g2.COLOR_BUFFER_BIT);
        g2.useProgram(cp.p);
        g2.uniform2f(cp.u.uRes, cc.width, cc.height);
        g2.uniform2fv(cp.u.uP, pts.flatMap((p) => [p.x, p.y]));
        g2.uniform1f(cp.u.uSize, bsize);
        g2.uniform1f(cp.u.uTime, performance.now() / 1000);
        cdraw();
      };
      cl();
    }
  }

  return () => {
    cursorRunning = false;
    cancelAnimationFrame(raf);
    cancelAnimationFrame(cursorRaf);
    removeEventListener("resize", size);
    removeEventListener("pointermove", onMove);
    enterHandlers.forEach(([el, fn]) => el.removeEventListener("mouseenter", fn));
    leaveHandlers.forEach(([el, fn]) => el.removeEventListener("mouseleave", fn));
    if (active) active.img.style.visibility = "";
    c.remove();
    cc.remove();
    document.documentElement.classList.remove("has-cursor");
  };
}

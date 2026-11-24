// Tiny raw-WebGL helpers, ported from the Sun Resorts Mullet Bay boceto
// (/workspace/sunresorts-boceto/src/scripts/gl/glutil.js, 23 Nov 2026).

export type GLProgram = {
  p: WebGLProgram;
  u: Record<string, WebGLUniformLocation | null>;
};

export const isMobile = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;

export function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function createGL(canvas: HTMLCanvasElement, opts: WebGLContextAttributes = {}) {
  const gl = canvas.getContext("webgl", {
    antialias: false,
    alpha: true,
    premultipliedAlpha: true,
    powerPreference: "high-performance",
    preserveDrawingBuffer: false,
    ...opts,
  });
  return gl;
}

export function program(gl: WebGLRenderingContext, vs: string, fs: string): GLProgram {
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) throw new Error("shader");
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(String(gl.getShaderInfoLog(s)));
    }
    return s;
  };
  const p = gl.createProgram();
  if (!p) throw new Error("program");
  gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(String(gl.getProgramInfoLog(p)));
  }
  const u: Record<string, WebGLUniformLocation | null> = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < n; i += 1) {
    const info = gl.getActiveUniform(p, i);
    if (!info) continue;
    u[info.name.replace("[0]", "")] = gl.getUniformLocation(p, info.name);
  }
  return { p, u };
}

export function quad(gl: WebGLRenderingContext, prog: GLProgram) {
  const b = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const loc = gl.getAttribLocation(prog.p, "aPos");
  return () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };
}

export function texture(gl: WebGLRenderingContext, src: string | HTMLImageElement) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([10, 23, 78, 255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const obj = { tex: t as WebGLTexture, w: 1, h: 1, ready: false, promise: Promise.resolve() as Promise<unknown> };
  const upload = (img: HTMLImageElement) => {
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    obj.w = img.naturalWidth || img.width;
    obj.h = img.naturalHeight || img.height;
    obj.ready = true;
  };
  obj.promise = new Promise((res) => {
    if (typeof src !== "string") {
      if (src.complete && src.naturalWidth) {
        upload(src);
        res(obj);
      } else {
        src.addEventListener(
          "load",
          () => {
            upload(src);
            res(obj);
          },
          { once: true },
        );
      }
      return;
    }
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    img.onload = () => {
      upload(img);
      res(obj);
    };
    img.onerror = () => res(obj);
  });
  return obj;
}

export function coverScale(tw: number, th: number, bw: number, bh: number) {
  const ta = tw / th;
  const ba = bw / bh;
  return ta > ba ? [ba / ta, 1] : [1, ta / ba];
}

export const VS = `attribute vec2 aPos; varying vec2 vUv; void main(){ vUv = aPos*0.5+0.5; gl_Position = vec4(aPos,0.,1.); }`;

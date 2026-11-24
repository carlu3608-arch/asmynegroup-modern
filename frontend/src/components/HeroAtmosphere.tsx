"use client";

import { useEffect, useRef } from "react";

export default function HeroAtmosphere() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let destroy: () => void = () => {};
    let cancelled = false;
    let timer: number | undefined;

    import("@/gl/atmosphere").then((m) => {
      if (cancelled) return;
      const api = m.initAtmosphere(canvas, {
        onFirstFrame: () => {
          document.documentElement.classList.add("gl-ocean");
          window.__asmyneMotion?.playHero(0.05);
        },
      });
      if (!api) return;
      destroy = api.destroy;
      const tryAttach = (n = 0) => {
        if (cancelled) return;
        if (window.__asmyneMotion) {
          window.__asmyneMotion.attachAtmosphere(api);
          return;
        }
        if (n < 30) timer = window.setTimeout(() => tryAttach(n + 1), 40);
      };
      tryAttach();
    });

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      destroy();
    };
  }, []);

  return <canvas ref={ref} className="atmosphere-canvas" aria-hidden="true" />;
}

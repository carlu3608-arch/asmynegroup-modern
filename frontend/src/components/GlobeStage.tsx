"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function GlobeStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = ref.current;
    if (!stage) return;
    let destroy: () => void = () => {};
    let cancelled = false;
    import("@/gl/globe").then((m) => {
      if (cancelled) return;
      const api = m.initGlobe(stage);
      if (api) destroy = api.destroy;
    });
    return () => {
      cancelled = true;
      destroy();
    };
  }, []);

  return (
    <div ref={ref} className="globe-stage">
      <canvas className="globe-canvas" aria-hidden="true" />
      {children}
    </div>
  );
}

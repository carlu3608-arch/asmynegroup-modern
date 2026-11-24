"use client";

import { useEffect, useRef } from "react";
import type { MotionHandle } from "@/gl/motion";

export default function SiteEffects() {
  const handleRef = useRef<MotionHandle | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("@/gl/motion").then((m) => {
      if (cancelled) return;
      const handle = m.initAsmyneMotion();
      handleRef.current = handle;
      window.__asmyneMotion = handle;
      // Play hero shortly after mount; atmosphere attach can still start the rise.
      handle.playHero(0.2);
    });
    return () => {
      cancelled = true;
      handleRef.current?.destroy();
      handleRef.current = null;
      delete window.__asmyneMotion;
    };
  }, []);

  return <div className="progress" aria-hidden="true" />;
}

declare global {
  interface Window {
    __asmyneMotion?: MotionHandle;
  }
}

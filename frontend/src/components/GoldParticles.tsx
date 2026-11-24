"use client";

// 2D particle field adapted from /workspace/iax/teclado/src/components/Particles.tsx
// (mouse magnetism, edge fade, DPR cap, pause when the tab is hidden), retinted gold.

import { useEffect, useRef } from "react";

type Circle = {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
};

export default function GoldParticles({
  className = "",
  quantity = 48,
  staticity = 50,
  ease = 50,
  maxDpr = 2,
}: {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  maxDpr?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Circle[]>([]);
  const mouse = useRef({ x: 0, y: 0 });
  const canvasSize = useRef({ w: 0, h: 0 });
  const rafId = useRef(0);
  const dprRef = useRef(1);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    dprRef.current = Math.min(window.devicePixelRatio || 1, maxDpr);
    if (canvasRef.current) context.current = canvasRef.current.getContext("2d");

    const remapValue = (value: number, start1: number, end1: number, start2: number, end2: number) => {
      const remapped = ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
      return remapped > 0 ? remapped : 0;
    };

    const circleParams = (): Circle => ({
      x: Math.floor(Math.random() * canvasSize.current.w),
      y: Math.floor(Math.random() * canvasSize.current.h),
      translateX: 0,
      translateY: 0,
      size: Math.floor(Math.random() * 2) + 0.4,
      alpha: 0,
      targetAlpha: parseFloat((Math.random() * 0.55 + 0.15).toFixed(1)),
      dx: (Math.random() - 0.5) * 0.22,
      dy: (Math.random() - 0.5) * 0.22,
      magnetism: 0.1 + Math.random() * 4,
    });

    const drawCircle = (circle: Circle, update = false) => {
      const ctx = context.current;
      if (!ctx) return;
      const dpr = dprRef.current;
      ctx.translate(circle.translateX, circle.translateY);
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232, 200, 114, ${circle.alpha})`;
      ctx.fill();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!update) circles.current.push(circle);
    };

    const resizeCanvas = () => {
      if (!canvasContainerRef.current || !canvasRef.current || !context.current) return;
      circles.current.length = 0;
      const dpr = dprRef.current;
      canvasSize.current.w = canvasContainerRef.current.offsetWidth;
      canvasSize.current.h = canvasContainerRef.current.offsetHeight;
      canvasRef.current.width = canvasSize.current.w * dpr;
      canvasRef.current.height = canvasSize.current.h * dpr;
      canvasRef.current.style.width = `${canvasSize.current.w}px`;
      canvasRef.current.style.height = `${canvasSize.current.h}px`;
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawParticles = () => {
      context.current?.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
      for (let i = 0; i < quantity; i += 1) drawCircle(circleParams());
    };

    const initCanvas = () => {
      resizeCanvas();
      drawParticles();
    };

    const animate = () => {
      context.current?.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
      circles.current.forEach((circle, i) => {
        const edge = [
          circle.x + circle.translateX - circle.size,
          canvasSize.current.w - circle.x - circle.translateX - circle.size,
          circle.y + circle.translateY - circle.size,
          canvasSize.current.h - circle.y - circle.translateY - circle.size,
        ];
        const closestEdge = Math.min(...edge);
        const remapClosestEdge = parseFloat(remapValue(closestEdge, 0, 20, 0, 1).toFixed(2));
        if (remapClosestEdge > 1) {
          circle.alpha += 0.02;
          if (circle.alpha > circle.targetAlpha) circle.alpha = circle.targetAlpha;
        } else {
          circle.alpha = circle.targetAlpha * remapClosestEdge;
        }
        if (!reduce) {
          circle.x += circle.dx;
          circle.y += circle.dy;
          circle.translateX += (mouse.current.x / (staticity / circle.magnetism) - circle.translateX) / ease;
          circle.translateY += (mouse.current.y / (staticity / circle.magnetism) - circle.translateY) / ease;
        }
        if (
          circle.x < -circle.size ||
          circle.x > canvasSize.current.w + circle.size ||
          circle.y < -circle.size ||
          circle.y > canvasSize.current.h + circle.size
        ) {
          circles.current.splice(i, 1);
          drawCircle(circleParams());
        } else {
          drawCircle({ ...circle }, true);
        }
      });
      if (!reduce) rafId.current = requestAnimationFrame(animate);
    };

    const onMove = (e: PointerEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const { w, h } = canvasSize.current;
      const x = e.clientX - rect.left - w / 2;
      const y = e.clientY - rect.top - h / 2;
      const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
      if (inside) {
        mouse.current.x = x;
        mouse.current.y = y;
      }
    };

    initCanvas();
    animate();
    window.addEventListener("resize", initCanvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(rafId.current);
      else {
        cancelAnimationFrame(rafId.current);
        animate();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("resize", initCanvas);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [quantity, staticity, ease, maxDpr]);

  return (
    <div ref={canvasContainerRef} className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}

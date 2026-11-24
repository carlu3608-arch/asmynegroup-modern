"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number; z: number };

function fibonacciSphere(count: number): Point[] {
  const points: Point[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    points.push({
      x: Math.cos(theta) * radius,
      y,
      z: Math.sin(theta) * radius,
    });
  }
  return points;
}

function meridians(): Point[][] {
  const lines: Point[][] = [];
  for (let m = 0; m < 8; m += 1) {
    const lon = (m / 8) * Math.PI * 2;
    const line: Point[] = [];
    for (let i = 0; i <= 36; i += 1) {
      const lat = (i / 36) * Math.PI - Math.PI / 2;
      line.push({
        x: Math.cos(lat) * Math.cos(lon),
        y: Math.sin(lat),
        z: Math.cos(lat) * Math.sin(lon),
      });
    }
    lines.push(line);
  }
  for (let p = 1; p < 6; p += 1) {
    const lat = -Math.PI / 2 + (p / 6) * Math.PI;
    const line: Point[] = [];
    for (let i = 0; i <= 48; i += 1) {
      const lon = (i / 48) * Math.PI * 2;
      line.push({
        x: Math.cos(lat) * Math.cos(lon),
        y: Math.sin(lat),
        z: Math.cos(lat) * Math.sin(lon),
      });
    }
    lines.push(line);
  }
  return lines;
}

export default function GoldGlobe() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dots = fibonacciSphere(320);
    const grid = meridians();
    let raf = 0;
    let size = 0;
    let angleY = 0.4;
    let angleX = 0.28;

    const resize = () => {
      const parent = canvas.parentElement;
      size = Math.min(parent?.clientWidth || 420, parent?.clientHeight || 420);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(size * dpr);
      canvas.height = Math.floor(size * dpr);
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const rotate = (p: Point, ay: number, ax: number): Point => {
      const cosY = Math.cos(ay);
      const sinY = Math.sin(ay);
      const x1 = p.x * cosY - p.z * sinY;
      const z1 = p.x * sinY + p.z * cosY;
      const cosX = Math.cos(ax);
      const sinX = Math.sin(ax);
      const y2 = p.y * cosX - z1 * sinX;
      const z2 = p.y * sinX + z1 * cosX;
      return { x: x1, y: y2, z: z2 };
    };

    const project = (p: Point) => {
      const radius = size * 0.38;
      return {
        x: size / 2 + p.x * radius,
        y: size / 2 + p.y * radius,
        depth: p.z,
      };
    };

    const drawLine = (line: Point[], ay: number, ax: number) => {
      ctx.beginPath();
      line.forEach((point, index) => {
        const q = project(rotate(point, ay, ax));
        if (index === 0) ctx.moveTo(q.x, q.y);
        else ctx.lineTo(q.x, q.y);
      });
      ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.4;

      const glow = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.15);
      glow.addColorStop(0, "rgba(212, 175, 55, 0.16)");
      glow.addColorStop(0.55, "rgba(10, 23, 78, 0.08)");
      glow.addColorStop(1, "rgba(5, 8, 20, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(232, 200, 114, 0.28)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(212, 175, 55, 0.16)";
      ctx.lineWidth = 1;
      grid.forEach((line) => drawLine(line, angleY, angleX));

      dots.forEach((dot) => {
        const p = rotate(dot, angleY, angleX);
        const q = project(p);
        const visible = (p.z + 1) / 2;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 0.6 + visible * 1.35, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 200, 114, ${0.15 + visible * 0.75})`;
        ctx.fill();
      });

      // Orbital ring + airplane marker, matching the logo motif.
      const orbit = [];
      for (let i = 0; i <= 80; i += 1) {
        const t = (i / 80) * Math.PI * 2;
        orbit.push({ x: Math.cos(t) * 1.18, y: Math.sin(t) * 0.28, z: Math.sin(t) * 0.95 });
      }
      ctx.strokeStyle = "rgba(232, 200, 114, 0.45)";
      ctx.lineWidth = 1.2;
      drawLine(orbit, angleY * 0.35 + 0.8, 0.55);

      const planeT = (angleY * 0.85) % (Math.PI * 2);
      const plane = project(
        rotate(
          { x: Math.cos(planeT) * 1.18, y: Math.sin(planeT) * 0.28, z: Math.sin(planeT) * 0.95 },
          angleY * 0.35 + 0.8,
          0.55,
        ),
      );
      ctx.beginPath();
      ctx.arc(plane.x, plane.y, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = "#f6e27a";
      ctx.shadowColor = "rgba(246, 226, 122, 0.8)";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      if (!reduce) {
        angleY += 0.0042;
        raf = requestAnimationFrame(draw);
      }
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />;
}

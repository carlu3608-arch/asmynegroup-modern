"use client";

// Gold globe scene with React Three Fiber + bloom, following the teclado
// stack (three + @react-three/fiber + postprocessing + motion-friendly
// client canvas, capped DPR, pause offscreen). Motif matches the Asmyne logo.

import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";

function fibonacciPoints(count: number, radius: number) {
  const positions = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    positions[i * 3] = Math.cos(theta) * r * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * r * radius;
  }
  return positions;
}

function Globe() {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Group>(null);
  const points = useMemo(() => fibonacciPoints(420, 1.57), []);
  const reduce =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current && !reduce) group.current.rotation.y = t * 0.12;
    if (ring.current && !reduce) ring.current.rotation.z = t * 0.18;
    const { x, y } = state.pointer;
    state.camera.position.x += (x * 0.7 - state.camera.position.x) * 0.05;
    state.camera.position.y += (0.15 - y * 0.45 - state.camera.position.y) * 0.05;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.7} color="#6b7aa8" />
      <pointLight position={[2.2, 1.4, 3.2]} color="#d4af37" intensity={5} distance={14} />
      <pointLight position={[-3, -1, -2]} color="#1a2a6c" intensity={2} />

      <group ref={group}>
        <mesh>
          <sphereGeometry args={[1.55, 64, 48]} />
          <meshStandardMaterial color="#0a1230" metalness={0.55} roughness={0.35} emissive="#0b1a3a" emissiveIntensity={0.35} />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.565, 32, 24]} />
          <meshBasicMaterial color="#d4af37" wireframe transparent opacity={0.22} />
        </mesh>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[points, 3]} />
          </bufferGeometry>
          <pointsMaterial color="#f6e27a" size={0.024} sizeAttenuation transparent opacity={0.9} />
        </points>
        <mesh>
          <sphereGeometry args={[1.82, 48, 32]} />
          <meshBasicMaterial color="#e8c872" transparent opacity={0.08} side={THREE.BackSide} />
        </mesh>
      </group>

      <group ref={ring} rotation={[Math.PI / 2.6, 0.4, 0]}>
        <mesh>
          <torusGeometry args={[2.15, 0.012, 12, 128]} />
          <meshBasicMaterial color="#e8c872" transparent opacity={0.85} />
        </mesh>
        <mesh position={[2.15, 0, 0]}>
          <coneGeometry args={[0.045, 0.16, 6]} />
          <meshBasicMaterial color="#fff1b0" />
        </mesh>
      </group>
    </>
  );
}

export default function HeroGlobeR3F({ children }: { children?: ReactNode }) {
  const mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;

  return (
    <div className="globe-stage">
      <Canvas
        className="globe-canvas"
        dpr={mobile ? [1, 1.25] : [1, 1.6]}
        gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0.15, 5.4], fov: mobile ? 42 : 32, near: 0.1, far: 40 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Globe />
        <EffectComposer>
          <Bloom intensity={0.55} luminanceThreshold={0.28} luminanceSmoothing={0.2} mipmapBlur />
        </EffectComposer>
      </Canvas>
      {children}
    </div>
  );
}

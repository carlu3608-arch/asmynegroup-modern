/** "A con balanza dorada" — the Vault door. Pure SVG, no external asset. */
export default function Emblem({ size = 180, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} role="img" aria-label="Asmyne Vault">
      <defs>
        <linearGradient id="vgold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E6D2A8" />
          <stop offset="0.5" stopColor="#C9A96E" />
          <stop offset="1" stopColor="#8C6B3E" />
        </linearGradient>
        <radialGradient id="vglow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#C9A96E" stopOpacity="0.28" />
          <stop offset="1" stopColor="#C9A96E" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill="url(#vglow)" />
      <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(201,169,110,.35)" strokeWidth="0.8" />
      <ellipse cx="100" cy="100" rx="92" ry="34" fill="none" stroke="rgba(201,169,110,.18)" strokeWidth="0.6" />
      <ellipse cx="100" cy="100" rx="40" ry="92" fill="none" stroke="rgba(201,169,110,.18)" strokeWidth="0.6" />
      {/* A */}
      <path d="M100 34 L151 160 L163 160 L163 165 L131 165 L131 160 L139 160 L127 128 L100 60 L73 128 L63 160 L71 160 L71 165 L41 165 L41 160 L52 160 Z" fill="url(#vgold)" />
      {/* beam */}
      <path d="M44 104 Q100 92 156 104" fill="none" stroke="url(#vgold)" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="100" cy="97" r="4" fill="url(#vgold)" />
      {/* left pan */}
      <path d="M44 104 L32 132 M44 104 L56 132" stroke="url(#vgold)" strokeWidth="1" />
      <path d="M28 132 Q44 146 60 132 Z" fill="url(#vgold)" />
      {/* right pan */}
      <path d="M156 104 L144 132 M156 104 L168 132" stroke="url(#vgold)" strokeWidth="1" />
      <path d="M140 132 Q156 146 172 132 Z" fill="url(#vgold)" />
    </svg>
  );
}

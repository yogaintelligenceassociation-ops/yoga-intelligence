import { memo } from "react";

/* ════════════════════════════════════════════════════════════════════
   Festive ornament kit (Diwali). Pure SVG + CSS keyframes (see App.css),
   no JS animation loops — cheap on phones, silent under reduced-motion.
   ════════════════════════════════════════════════════════════════════ */

const BULBS = ["#FFC83D", "#FF8A1F", "#FF4D4D", "#FFE08A", "#FF8A1F"];

/* Strung fairy lights that sag across the top of a section. */
export const StringLights = memo(function StringLights({ className = "" }) {
  return (
    <div className={`pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      <div className="flex" style={{ width: "max-content" }}>
        {Array.from({ length: 28 }, (_, i) => {
          const c = BULBS[i % BULBS.length];
          return (
            <svg key={i} className="sl-tile flex-shrink-0 w-[68px] md:w-24 h-auto" viewBox="0 0 96 46">
              <path d="M0 3 Q48 26 96 3" fill="none" stroke="#8A5A22" strokeWidth="1.4" opacity="0.7" />
              <rect x="46.2" y="13.2" width="3.6" height="5" rx="1" fill="#6B4416" />
              <circle className="sl-glow" cx="48" cy="25" r="12" fill={c} opacity="0.3" />
              <circle cx="48" cy="25" r="5" fill={c} />
              <circle cx="46.4" cy="23.4" r="1.4" fill="#fff" opacity="0.8" />
            </svg>
          );
        })}
      </div>
    </div>
  );
});

/* Akash kandil — a swaying hanging lantern. */
export const Lantern = memo(function Lantern({ className = "", color = "#E2551F", delay = 0 }) {
  return (
    <svg
      className={`lantern ${className}`}
      style={{ animationDelay: `${delay}s` }}
      viewBox="0 0 60 126"
      aria-hidden="true"
    >
      <line x1="30" y1="0" x2="30" y2="25" stroke="#C99A2E" strokeWidth="1.6" />
      <path d="M20 31 H40 L37 24 H23 Z" fill="#C99A2E" />
      <path d="M18 31 C 5 45, 5 70, 18 84 H42 C 55 70, 55 45, 42 31 Z" fill={color} />
      <ellipse className="diya-glow" cx="30" cy="57" rx="11" ry="21" fill="#FFD86B" opacity="0.8" />
      <path d="M30 31 V84 M24 31 C 17 48, 17 68, 24 84 M36 31 C 43 48, 43 68, 36 84" fill="none" stroke="#C99A2E" strokeWidth="1.1" opacity="0.85" />
      <rect x="19" y="84" width="22" height="5" rx="1.5" fill="#C99A2E" />
      <path d="M24 89 V108 M30 89 V114 M36 89 V108" stroke="#C99A2E" strokeWidth="1.3" />
      <circle cx="24" cy="110" r="2.2" fill="#E8B531" />
      <circle cx="30" cy="116" r="2.4" fill="#E8B531" />
      <circle cx="36" cy="110" r="2.2" fill="#E8B531" />
    </svg>
  );
});

/* Two lanterns hanging from the top corners of the hero (wide screens only). */
export const HangingLanterns = memo(function HangingLanterns() {
  return (
    <div className="hidden xl:block absolute inset-x-0 top-20 pointer-events-none z-[4]" aria-hidden="true">
      <Lantern className="absolute left-3 w-12 2xl:w-14" color="#E2551F" />
      <Lantern className="absolute right-3 w-12 2xl:w-14" color="#D6336C" delay={1.4} />
    </div>
  );
});

/* Slowly turning rangoli mandala — decorative backdrop. */
export const Rangoli = memo(function Rangoli({ className = "", opacity = 0.14, spin = true }) {
  const ring = (n, cy, rx, ry, fill, stroke) =>
    Array.from({ length: n }, (_, i) => (
      <ellipse
        key={`${cy}-${i}`}
        cx="200"
        cy={cy}
        rx={rx}
        ry={ry}
        fill={fill}
        stroke={stroke}
        strokeWidth="1.2"
        transform={`rotate(${(360 / n) * i} 200 200)`}
      />
    ));
  return (
    <div className={`pointer-events-none ${className}`} style={{ opacity }} aria-hidden="true">
      <svg viewBox="0 0 400 400" className={spin ? "rangoli-spin w-full h-full" : "w-full h-full"}>
        {Array.from({ length: 28 }, (_, i) => {
          const a = ((Math.PI * 2) / 28) * i;
          return <circle key={i} cx={200 + Math.cos(a) * 190} cy={200 + Math.sin(a) * 190} r="3.2" fill="#F5C118" />;
        })}
        <circle cx="200" cy="200" r="176" fill="none" stroke="#F07A1A" strokeWidth="1" strokeDasharray="3 7" />
        {ring(20, 52, 12, 34, "#F5C118", "#C99A2E")}
        {ring(16, 88, 16, 42, "#F07A1A", "#C2571A")}
        {ring(12, 122, 18, 40, "#D6336C", "#A3204F")}
        {ring(8, 152, 16, 30, "#3A7D2C", "#2A5D20")}
        <circle cx="200" cy="200" r="22" fill="#F5C118" stroke="#C99A2E" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="9" fill="#F07A1A" />
      </svg>
    </div>
  );
});

/* Clay diya. `lit` toggles flame + glow. Size it with className (width). */
export const Diya = memo(function Diya({ lit = true, className = "", delay = 0 }) {
  return (
    <svg viewBox="0 0 100 82" className={className} aria-hidden="true" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="diya-halo">
          <stop offset="0" stopColor="#FFC24D" stopOpacity="0.75" />
          <stop offset="0.55" stopColor="#FF9A1F" stopOpacity="0.28" />
          <stop offset="1" stopColor="#FF8A1F" stopOpacity="0" />
        </radialGradient>
      </defs>
      {lit && <circle className="diya-glow" cx="50" cy="30" r="46" fill="url(#diya-halo)" style={{ animationDelay: `${delay}s` }} />}
      {lit && (
        <g className="flame" style={{ animationDelay: `${delay}s` }}>
          <path d="M50 4 C 60 16, 64 25, 50 38 C 36 25, 40 16, 50 4 Z" fill="#FF8A1F" />
          <path d="M50 17 C 55 24, 56 30, 50 36 C 44 30, 45 24, 50 17 Z" fill="#FFE27A" />
        </g>
      )}
      <rect x="48.4" y="35" width="3.2" height="8" rx="1.5" fill="#3E2412" />
      <path d="M8 44 H92 C 92 66, 74 78, 50 78 C 26 78, 8 66, 8 44 Z" fill={lit ? "#C2571A" : "#8C4A2A"} />
      <path d="M8 44 H92 C 91 48, 88 50, 84 51 H16 C 12 50, 9 48, 8 44 Z" fill={lit ? "#E07A2E" : "#A5603C"} />
      <g fill={lit ? "#FFD24A" : "#C9A15A"}>
        <circle cx="30" cy="62" r="2.4" />
        <circle cx="42" cy="68" r="2.4" />
        <circle cx="58" cy="68" r="2.4" />
        <circle cx="70" cy="62" r="2.4" />
      </g>
    </svg>
  );
});

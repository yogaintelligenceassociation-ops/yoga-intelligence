import { memo } from "react";

/* ════════════════════════════════════════════════════════════════════
   Botanical ornament system — elegant line-art leaves, ferns, lotus.
   Forest-green + warm gold. Used as subtle, premium section decoration.
   ════════════════════════════════════════════════════════════════════ */

const GOLD = "#F5C118";
const GREEN = "#4CAF50";

/* A graceful curved branch with leaves — the signature corner ornament. */
export const LeafBranch = memo(function LeafBranch({
  size = 220,
  color = GREEN,
  className = "",
  style = {},
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <g stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.9">
        {/* main stem */}
        <path d="M20 180 C 60 150, 90 110, 110 60 C 120 35, 128 18, 132 8" />
        {/* leaves along the stem (alternating) */}
        <path d="M40 158 C 30 140, 34 122, 54 120 C 58 138, 56 152, 40 158 Z" fill={color} fillOpacity="0.12" />
        <path d="M58 132 C 70 118, 88 118, 92 132 C 78 142, 64 142, 58 132 Z" fill={color} fillOpacity="0.12" />
        <path d="M74 104 C 64 86, 70 68, 90 68 C 92 86, 90 100, 74 104 Z" fill={color} fillOpacity="0.12" />
        <path d="M92 78 C 104 64, 122 66, 124 80 C 110 90, 96 88, 92 78 Z" fill={color} fillOpacity="0.12" />
        <path d="M106 50 C 98 32, 106 16, 124 18 C 124 36, 120 48, 106 50 Z" fill={color} fillOpacity="0.12" />
        {/* leaf veins */}
        <path d="M44 150 L 48 132" opacity="0.6" />
        <path d="M74 132 L 88 124" opacity="0.6" />
        <path d="M80 96 L 84 76" opacity="0.6" />
      </g>
    </svg>
  );
});

/* A small lotus bloom — used as the centerpiece of gold dividers. */
export const Lotus = memo(function Lotus({ size = 34, color = GOLD, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <g stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 40 C 24 30, 24 22, 24 14 C 28 22, 30 32, 24 40 C 18 32, 20 22, 24 14" fill={color} fillOpacity="0.14" />
        <path d="M24 40 C 16 34, 10 28, 8 20 C 16 22, 22 30, 24 40 Z" fill={color} fillOpacity="0.1" />
        <path d="M24 40 C 32 34, 38 28, 40 20 C 32 22, 26 30, 24 40 Z" fill={color} fillOpacity="0.1" />
        <path d="M24 40 C 12 38, 6 34, 4 28" opacity="0.7" />
        <path d="M24 40 C 36 38, 42 34, 44 28" opacity="0.7" />
      </g>
    </svg>
  );
});

/* Decorative corner branches placed in a section's four corners (opt-in). */
export const BotanicalCorners = memo(function BotanicalCorners({
  color = GREEN,
  opacity = 0.18,
  size = 220,
  corners = ["tl", "br"],
}) {
  const place = {
    tl: { top: 0, left: 0, transform: "rotate(0deg)" },
    tr: { top: 0, right: 0, transform: "scaleX(-1)" },
    bl: { bottom: 0, left: 0, transform: "scaleY(-1)" },
    br: { bottom: 0, right: 0, transform: "scale(-1,-1)" },
  };
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {corners.map((c) => (
        <div key={c} className="absolute botanical-sway" style={{ ...place[c], opacity }}>
          <LeafBranch size={size} color={color} />
        </div>
      ))}
    </div>
  );
});

/* Drifting leaves — sparse, slow, premium (NOT a snowstorm). */
const LEAF_PATHS = [
  "M12 2 C 4 8, 4 18, 12 22 C 20 18, 20 8, 12 2 Z",
  "M12 2 C 6 6, 5 16, 12 22 C 14 14, 16 8, 12 2 Z",
];
export const LeafParticles = memo(function LeafParticles({ count = 7, color = GREEN }) {
  // Deterministic pseudo-random spread so it looks designed, not chaotic.
  const seeds = Array.from({ length: count }, (_, i) => {
    const r = (n) => ((Math.sin(i * 99.7 + n) + 1) / 2);
    return {
      left: 6 + r(1) * 88,
      size: 12 + r(2) * 14,
      duration: 14 + r(3) * 12,
      delay: -r(4) * 18,
      drift: (r(5) - 0.5) * 120,
      opacity: 0.18 + r(6) * 0.22,
      path: LEAF_PATHS[i % LEAF_PATHS.length],
      tint: i % 3 === 0 ? GOLD : color,
    };
  });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {seeds.map((s, i) => (
        <div
          key={i}
          className="leaf-particle"
          style={{
            left: `${s.left}%`,
            "--leaf-duration": `${s.duration}s`,
            "--leaf-delay": `${s.delay}s`,
            "--leaf-drift": `${s.drift}px`,
            "--leaf-opacity": s.opacity,
          }}
        >
          <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill="none">
            <path d={s.path} fill={s.tint} fillOpacity="0.5" stroke={s.tint} strokeWidth="0.8" />
            <path d="M12 3 L 12 21" stroke={s.tint} strokeWidth="0.6" opacity="0.6" />
          </svg>
        </div>
      ))}
    </div>
  );
});

/* Royal gold divider with a centered lotus — between major sections. */
export const GoldDivider = memo(function GoldDivider({ className = "", align = "center" }) {
  const justify = align === "start" ? "justify-start" : align === "end" ? "justify-end" : "justify-center";
  return (
    <div className={`flex items-center gap-4 ${justify} ${className}`} aria-hidden="true">
      {align !== "start" && <span className="gold-hairline max-w-[140px]" />}
      <Lotus size={28} className="ornament-glow flex-shrink-0" />
      <span className="gold-hairline max-w-[140px]" />
    </div>
  );
});

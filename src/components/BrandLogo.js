import { IMAGES } from "../constants/social";

/**
 * Round, app-icon-style brand badge that contains the Yoga Intelligence logo.
 * Used in Navbar, Footer, and AuthModal so the brand mark stays consistent.
 *
 * Props:
 *   size    — tailwind size class group: "sm" | "md" | "lg" | "xl"
 *   className — extra classes for the outer circle
 */
export default function BrandLogo({ size = "md", className = "" }) {
  const sizes = {
    sm: { box: "w-10 h-10", img: "w-8 h-8" },
    md: { box: "w-12 h-12 md:w-14 md:h-14", img: "w-10 h-10 md:w-12 md:h-12" },
    lg: { box: "w-16 h-16", img: "w-14 h-14" },
    xl: { box: "w-20 h-20", img: "w-16 h-16" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div
      className={`relative ${s.box} rounded-full bg-white shadow-[0_6px_18px_rgba(240,122,26,0.22)] ring-2 ring-[#F07A1A]/35 flex items-center justify-center overflow-hidden transition-transform duration-300 ${className}`}
      aria-hidden="true"
    >
      <img
        src={IMAGES.logo}
        alt="Yoga Intelligence"
        className={`${s.img} object-contain relative z-10 p-0.5`}
        draggable="false"
      />
    </div>
  );
}

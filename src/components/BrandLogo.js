import { IMAGES } from "../constants/social";

/**
 * Yoga Intelligence brand mark (wide wordmark logo, ~1.4:1).
 * Used in Navbar, Footer and AuthModal so the brand stays consistent.
 *
 * Props:
 *   size   — "sm" | "md" | "lg" | "xl" (sets the logo height)
 *   onDark — seat the logo on a soft white plate (for dark backgrounds)
 */
const HEIGHTS = {
  sm: "h-10",
  md: "h-[56px] sm:h-[62px] md:h-[76px]",
  lg: "h-20 sm:h-24",
  xl: "h-24 sm:h-28",
};

export default function BrandLogo({ size = "md", className = "", onDark = false }) {
  const img = (
    <img
      src={IMAGES.logo}
      alt="Yoga Intelligence"
      width="560"
      height="399"
      className={`${HEIGHTS[size] || HEIGHTS.md} w-auto object-contain select-none`}
      draggable="false"
    />
  );

  if (!onDark) return <span className={`inline-flex transition-transform duration-300 ${className}`}>{img}</span>;

  return (
    <span
      className={`inline-flex rounded-2xl bg-white px-4 py-2.5 ring-1 ring-[#F5C118]/50 shadow-[0_10px_30px_rgba(0,0,0,0.35)] ${className}`}
    >
      {img}
    </span>
  );
}

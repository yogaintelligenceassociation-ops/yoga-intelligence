import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { GoldDivider } from "./Botanical";

/* ───────────────────────── Tilt ─────────────────────────
   Subtle 3D mouse-follow tilt (Stripe/Linear style). Spring-smoothed,
   automatically inert on touch devices and under prefers-reduced-motion. */
export function Tilt({ max = 8, scale = 1.02, className = "", children, ...rest }) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 220, damping: 18, mass: 0.4 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [max, -max]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-max, max]);

  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }, [mx, my]);

  const reset = useCallback(() => { mx.set(0); my.set(0); }, [mx, my]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 1100, transformStyle: "preserve-3d" }}
      whileHover={{ scale }}
      transition={{ scale: { type: "spring", stiffness: 300, damping: 20 } }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ───────────────────────── KineticText ─────────────────────────
   Word-by-word staggered rise-in. Accessible (full label on the wrapper). */
export function KineticText({ text, className = "", wordClass = "", delay = 0, stagger = 0.08 }) {
  const words = String(text).split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className={`inline-block ${wordClass}`}
          initial={{ opacity: 0, y: "0.55em", rotate: 1.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.6, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}

/* ───────────────────────── SectionHeading ─────────────────────────
   Consistent, premium section header: eyebrow + title + subtitle. */
export function SectionHeading({
  eyebrow,
  eyebrowStyle = "green",
  title,
  highlight,
  subtitle,
  align = "center",
  divider = false,
  className = "",
}) {
  const styles = {
    green: "bg-[#3A7D2C]/10 text-[#3A7D2C] border-[#3A7D2C]/20",
    orange: "bg-[#F07A1A]/10 text-[#F07A1A] border-[#F07A1A]/20",
    gold: "bg-[#F5C118]/15 text-[#B8860B] border-[#F5C118]/30",
    light: "bg-white/10 text-[#4CAF50] border-white/15",
  };
  const alignment = align === "center" ? "items-center text-center mx-auto" : "items-start text-left";

  return (
    <div className={`flex flex-col ${alignment} max-w-3xl ${className}`}>
      {eyebrow && (
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`eyebrow border ${styles[eyebrowStyle]} mb-4`}
        >
          {eyebrow}
        </motion.span>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="heading-fluid text-[#1A1A1A]"
      >
        {title} {highlight && <span className="text-gradient-brand">{highlight}</span>}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="subheading-fluid text-[#6B7280] mt-4"
        >
          {subtitle}
        </motion.p>
      )}
      {divider && <GoldDivider className="mt-6" align={align === "start" ? "start" : "center"} />}
    </div>
  );
}

/* ───────────────────────── StatCounter ─────────────────────────
   Animated count-up when scrolled into view. Supports "500+", "10+", "100%". */
export function StatCounter({ value, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  const match = String(value).match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  const prefix = match ? match[1] : "";
  const target = match ? parseFloat(match[2]) : 0;
  const suffix = match ? match[3] : "";
  const decimals = match && match[2].includes(".") ? 1 : 0;

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionVal, target, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return controls.stop;
  }, [inView, target, decimals, motionVal]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/* ───────────────────────── Spotlight ─────────────────────────
   Wraps content; sets --mx/--my CSS vars to follow the cursor. Pair with
   the `.spotlight` class for the radial highlight. */
export function Spotlight({ as: Tag = "div", className = "", children, ...rest }) {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, []);
  return (
    <Tag ref={ref} onMouseMove={onMove} className={`spotlight ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/* ───────────────────────── Aurora ─────────────────────────
   Ambient animated gradient blobs for section backgrounds. */
export function Aurora({ className = "" }) {
  return <div className={`aurora ${className}`} aria-hidden="true" />;
}

/* ───────────────────────── WaveDivider ─────────────────────────
   Smooth SVG transition between sections. `flip` for bottom edges. */
export function WaveDivider({ color = "#FFFFFF", flip = false, className = "" }) {
  return (
    <div className={`relative leading-none ${className}`} aria-hidden="true">
      <svg
        className="wave-divider"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        style={{ transform: flip ? "rotate(180deg)" : "none", height: "60px" }}
      >
        <path
          fill={color}
          d="M0,32 C240,80 480,0 720,24 C960,48 1200,80 1440,40 L1440,80 L0,80 Z"
        />
      </svg>
    </div>
  );
}

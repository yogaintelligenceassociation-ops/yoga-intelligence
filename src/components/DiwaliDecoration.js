import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { FESTIVAL, getFestiveState } from "../constants/festive";
import { waLink } from "../constants/social";
import { burstSparks } from "../lib/sparks";

const BANNER_KEY = "yi_festive_banner_closed";

const ORBS = [
  { x: "6%",  y: "18%", c: "#FFC83D", s: 5, d: 6.0, t: 0.0 },
  { x: "16%", y: "46%", c: "#FF8A1F", s: 4, d: 5.2, t: 0.8 },
  { x: "27%", y: "74%", c: "#FFC83D", s: 6, d: 6.8, t: 1.5 },
  { x: "39%", y: "26%", c: "#FFB347", s: 4, d: 5.6, t: 0.3 },
  { x: "53%", y: "62%", c: "#FF8A1F", s: 5, d: 6.2, t: 2.1 },
  { x: "66%", y: "20%", c: "#FFC83D", s: 3, d: 5.0, t: 1.0 },
  { x: "77%", y: "52%", c: "#FFD700", s: 6, d: 6.6, t: 0.5 },
  { x: "86%", y: "34%", c: "#FF8A1F", s: 4, d: 5.4, t: 1.8 },
  { x: "93%", y: "70%", c: "#FFC83D", s: 5, d: 6.1, t: 0.9 },
  { x: "46%", y: "86%", c: "#FFB347", s: 3, d: 5.8, t: 2.5 },
];

const wishMsg =
  "Shubh Deepawali, Yoga Intelligence team! 🪔🙏\n\nWishing you and your family a bright, healthy and joyful Diwali.";

function countdownText({ daysToGo, isToday, isPast }) {
  if (isToday) return "Happy Diwali today";
  if (isPast) return "Wishing you a joyous festive season";
  if (daysToGo === 1) return "Diwali is tomorrow";
  return `Diwali in ${daysToGo} days`;
}

function FestiveBanner({ state }) {
  const [open, setOpen] = useState(() => {
    try { return !sessionStorage.getItem(BANNER_KEY); } catch { return true; }
  });
  const ref = useRef(null);

  // The fixed navbar reads --banner-offset so it sits just below this banner,
  // then slides up to the top as the banner scrolls out of view.
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      const h = open && ref.current ? ref.current.offsetHeight : 0;
      root.style.setProperty("--banner-offset", `${Math.max(0, h - window.scrollY)}px`);
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    const ro = ref.current && typeof ResizeObserver !== "undefined" ? new ResizeObserver(sync) : null;
    if (ro) ro.observe(ref.current);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      if (ro) ro.disconnect();
      root.style.setProperty("--banner-offset", "0px");
    };
  }, [open]);

  if (!open) return null;

  const close = () => {
    try { sessionStorage.setItem(BANNER_KEY, "1"); } catch {}
    setOpen(false);
  };

  return (
    <div
      ref={ref}
      data-testid="festive-banner"
      className="relative z-40 text-white"
      style={{
        background:
          "linear-gradient(90deg, #6E1200 0%, #B93C00 22%, #E57A00 42%, #F5A623 50%, #E57A00 58%, #B93C00 78%, #6E1200 100%)",
      }}
    >
      <div className="container-yi flex items-center justify-center gap-x-2.5 sm:gap-x-3 py-2 pr-10 sm:pr-12 text-[11px] sm:text-sm font-semibold">
        <span className="diwali-flicker">🪔</span>
        <span className="font-poppins tracking-wide text-center">
          {FESTIVAL.greeting}
          <span className="hidden md:inline"> from Yoga Intelligence</span>
        </span>
        <span className="inline-flex items-center rounded-full bg-black/25 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold tracking-wide whitespace-nowrap">
          {countdownText(state)}
        </span>
        <a
          href={waLink(wishMsg)}
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-flex items-center rounded-full bg-white text-[#B93C00] px-3 py-1 text-xs font-black hover:bg-[#FFF3D6] transition-colors whitespace-nowrap"
        >
          Send wishes →
        </a>
        <span className="diwali-flicker hidden sm:inline" style={{ animationDelay: "0.6s" }}>🪔</span>
      </div>
      <button
        onClick={close}
        aria-label="Dismiss festive banner"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-white/75 hover:text-white hover:bg-white/15 transition-colors"
      >
        <X size={15} />
      </button>
    </div>
  );
}

export default function DiwaliDecoration() {
  const state = getFestiveState();
  const active = state.active;

  // Tap/click anywhere → a tiny golden spark burst.
  useEffect(() => {
    if (!active) return;
    const onDown = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      burstSparks(e.clientX, e.clientY, 9);
    };
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => window.removeEventListener("pointerdown", onDown);
  }, [active]);

  if (!active) return null;

  return (
    <>
      <FestiveBanner state={state} />
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }} aria-hidden="true">
        {ORBS.map((o, i) => (
          <span
            key={i}
            className="fest-orb"
            style={{
              left: o.x,
              top: o.y,
              width: o.s,
              height: o.s,
              background: o.c,
              boxShadow: `0 0 ${o.s * 3}px ${o.c}`,
              "--d": `${o.d}s`,
              "--t": `${o.t}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}

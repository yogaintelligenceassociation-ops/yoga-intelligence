import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { waLink } from "../constants/social";

const BANNER_KEY = "yi_diwali2026_dismissed";

// Subtle floating light orbs scattered across the viewport
const ORBS = [
  { id: 0,  x: "6%",  y: "18%", color: "#F5C118", size: 5, dur: 5.2, delay: 0.0 },
  { id: 1,  x: "15%", y: "42%", color: "#F07A1A", size: 4, dur: 4.5, delay: 0.8 },
  { id: 2,  x: "25%", y: "72%", color: "#F5C118", size: 6, dur: 6.0, delay: 1.5 },
  { id: 3,  x: "38%", y: "28%", color: "#FFB347", size: 4, dur: 4.8, delay: 0.3 },
  { id: 4,  x: "52%", y: "60%", color: "#F07A1A", size: 5, dur: 5.5, delay: 2.1 },
  { id: 5,  x: "63%", y: "20%", color: "#F5C118", size: 3, dur: 4.2, delay: 1.0 },
  { id: 6,  x: "74%", y: "50%", color: "#FFD700", size: 6, dur: 5.8, delay: 0.5 },
  { id: 7,  x: "83%", y: "35%", color: "#F07A1A", size: 4, dur: 4.6, delay: 1.8 },
  { id: 8,  x: "91%", y: "65%", color: "#F5C118", size: 5, dur: 5.3, delay: 0.9 },
  { id: 9,  x: "45%", y: "85%", color: "#FFB347", size: 3, dur: 4.9, delay: 2.5 },
  { id: 10, x: "10%", y: "88%", color: "#F5C118", size: 4, dur: 5.1, delay: 1.3 },
  { id: 11, x: "88%", y: "12%", color: "#FFD700", size: 5, dur: 4.7, delay: 0.7 },
];

export default function DiwaliDecoration() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(BANNER_KEY)) setVisible(true);
    } catch {}
  }, []);

  const dismiss = () => {
    try { sessionStorage.setItem(BANNER_KEY, "1"); } catch {}
    setVisible(false);
  };

  const offerMsg =
    "Namaste Yoga Intelligence 🙏\n\nI saw your Diwali special offer and I'd like to claim my FREE first session! 🪔\n\nCould you please share the available schedule?\n\nThank you! 🌿";

  return (
    <>
      {/* ── Festive Diwali banner ── */}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative z-[70] overflow-hidden"
          >
            <div
              className="relative flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2.5 px-10 text-white text-xs sm:text-sm font-semibold text-center"
              style={{
                background:
                  "linear-gradient(90deg, #7B1200 0%, #C94400 20%, #E07A00 40%, #FFB300 50%, #E07A00 60%, #C94400 80%, #7B1200 100%)",
              }}
            >
              <span className="diwali-flicker">🪔</span>
              <span>
                Happy Diwali from Yoga Intelligence! &nbsp;✨&nbsp; Special Offer:
                &nbsp;<span className="underline decoration-dotted">First Session FREE</span>&nbsp;
                this festive season
              </span>
              <a
                href={waLink(offerMsg)}
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-white text-[#C94400] font-black text-xs px-3 py-1 rounded-full hover:bg-[#FFF8E1] transition-colors whitespace-nowrap"
              >
                Claim Now →
              </a>
              <span className="diwali-flicker" style={{ animationDelay: "0.5s" }}>🪔</span>
              <button
                onClick={dismiss}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity p-1"
                aria-label="Dismiss Diwali banner"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Ambient floating light orbs — very subtle, non-intrusive ── */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 2 }}
        aria-hidden="true"
      >
        {ORBS.map((orb) => (
          <motion.div
            key={orb.id}
            className="absolute rounded-full"
            style={{
              left: orb.x,
              top: orb.y,
              width: orb.size,
              height: orb.size,
              background: orb.color,
              filter: `blur(0.5px)`,
              boxShadow: `0 0 ${orb.size * 3}px ${orb.color}`,
            }}
            animate={{
              opacity: [0, 0.55, 0.2, 0.7, 0],
              y: [0, -20, -8, -28, 0],
              scale: [0.7, 1.3, 0.9, 1.1, 0.7],
            }}
            transition={{
              duration: orb.dur,
              repeat: Infinity,
              delay: orb.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </>
  );
}

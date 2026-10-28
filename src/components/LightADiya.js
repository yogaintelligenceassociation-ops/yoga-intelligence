import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Share2, RotateCcw } from "lucide-react";
import { FESTIVAL, getFestiveState } from "../constants/festive";
import { waLink, waMessage } from "../constants/social";
import { burstSparks } from "../lib/sparks";
import { Diya, Rangoli } from "./FestiveDecor";

const INTENTIONS = ["Body", "Breath", "Mind", "Energy", "Peace"];

export default function LightADiya() {
  const [lit, setLit] = useState(() => INTENTIONS.map(() => false));
  const sectionRef = useRef(null);
  const count = lit.filter(Boolean).length;
  const allLit = count === INTENTIONS.length;
  const active = getFestiveState().active;

  const toggle = (i, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!lit[i]) burstSparks(rect.left + rect.width / 2, rect.top + rect.height * 0.3, 10);
    setLit((prev) => prev.map((v, j) => (j === i ? !v : v)));
  };

  // Celebrate once every diya is lit.
  useEffect(() => {
    if (!allLit || !sectionRef.current) return;
    const r = sectionRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = Math.min(Math.max(r.top + r.height * 0.55, 120), window.innerHeight - 120);
    [[-0.28, 0], [0.28, 0], [0, -0.1], [-0.12, 0.1], [0.12, 0.1]].forEach(([dx, dy], i) =>
      setTimeout(() => burstSparks(cx + dx * r.width, cy + dy * 160, 12, 1.5), i * 140),
    );
  }, [allLit]);

  if (!active) return null;

  const shareHref = `https://wa.me/?text=${encodeURIComponent(
    `I lit a diya at Yoga Intelligence 🪔 ${FESTIVAL.greeting}! May your life glow with health and happiness.\n${window.location.origin}`,
  )}`;

  return (
    <section
      id="deepawali"
      ref={sectionRef}
      data-testid="light-a-diya"
      className="relative overflow-hidden py-16 md:py-24"
      style={{ background: "linear-gradient(165deg, #260902 0%, #531705 48%, #86300A 100%)" }}
    >
      <Rangoli className="absolute left-1/2 -translate-x-1/2 -top-24 w-[560px] md:w-[760px] aspect-square" opacity={0.065} />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[720px] h-[280px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(245,166,35,0.28) 0%, transparent 70%)", opacity: 0.35 + count * 0.13 }}
      />

      <div className="container-yi relative z-10 text-center">
        <p className="text-[#F5C118] text-[11px] sm:text-xs font-bold uppercase tracking-[0.3em]">Festival of Lights</p>
        <h2 className="font-poppins font-black text-3xl sm:text-4xl md:text-5xl text-white mt-3 leading-tight">
          Light a Diya, <span className="text-orange-brand">Set an Intention</span>
        </h2>
        <p className="max-w-xl mx-auto mt-4 text-sm md:text-base text-white/70 leading-relaxed">
          Tap each diya to light it — one for body, breath, mind, energy and peace. May this {FESTIVAL.name} brighten your wellbeing.
        </p>

        <div className="mt-10 md:mt-12 flex justify-center items-end gap-1.5 sm:gap-6 md:gap-10">
          {INTENTIONS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={(e) => toggle(i, e)}
              aria-pressed={lit[i]}
              aria-label={`${lit[i] ? "Extinguish" : "Light"} the diya for ${label}`}
              data-testid={`diya-${label.toLowerCase()}`}
              className="group flex flex-col items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-2xl touch-manipulation transition-transform duration-200 hover:-translate-y-1 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F5C118]"
            >
              <Diya lit={lit[i]} delay={i * 0.35} className="w-[52px] sm:w-20 md:w-24 h-auto" />
              <span
                className={`font-poppins text-[10px] sm:text-sm font-semibold tracking-wide transition-colors duration-300 ${
                  lit[i] ? "text-[#FFD86B]" : "text-white/45 group-hover:text-white/75"
                }`}
              >
                {label}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-8 min-h-[148px] sm:min-h-[132px]">
          <AnimatePresence mode="wait">
            {allLit ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="max-w-xl mx-auto"
              >
                <p className="font-poppins font-bold text-xl sm:text-2xl text-[#FFD86B]">{FESTIVAL.greeting} 🪔</p>
                <p className="text-white/80 text-sm sm:text-base mt-2">
                  May your life glow with health, harmony and happiness.
                </p>
                <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={shareHref}
                    target="_blank"
                    rel="noreferrer"
                    data-testid="diya-share"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#F5A623] to-[#F07A1A] text-[#2A0A03] font-bold text-sm shadow-lg shadow-orange-900/40 hover:scale-[1.03] transition-transform"
                  >
                    <Share2 size={16} /> Share the light
                  </a>
                  <a
                    href={waLink(waMessage.general())}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
                  >
                    <MessageCircle size={16} /> Begin your wellness journey
                  </a>
                </div>
              </motion.div>
            ) : (
              <motion.p
                key="progress"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium text-[#F5C118]/85"
              >
                {count === 0 ? "Tap a diya to begin" : `${count} of ${INTENTIONS.length} lit — keep going`}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {count > 0 && (
          <button
            type="button"
            onClick={() => setLit(INTENTIONS.map(() => false))}
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            <RotateCcw size={12} /> Start over
          </button>
        )}
      </div>
    </section>
  );
}

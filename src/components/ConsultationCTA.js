import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, CalendarDays } from "lucide-react";
import { waLink } from "../constants/social";

const CTA_KEY = "yi_consult_cta_dismissed";
const SHOW_DELAY_MS = 12000;

const consultMsg =
  "Namaste Yoga Intelligence 🙏\n\nI'd like to speak with Yogacharya Mrityunjay Pandey's team about the right program for me.\n\nCould you please share the available time slots?\n\nThank you! 🌿";

export default function ConsultationCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try { dismissed = !!sessionStorage.getItem(CTA_KEY); } catch {}
    if (dismissed) return;
    const t = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    try { sessionStorage.setItem(CTA_KEY, "1"); } catch {}
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          data-testid="consult-cta"
          // bottom clears both floating buttons (music left, WhatsApp right)
          className="fixed bottom-[88px] left-3 right-3 sm:left-auto sm:right-6 sm:w-[340px] z-[35]"
        >
          <div className="relative glass rounded-2xl shadow-2xl overflow-hidden border border-[#F07A1A]/15">
            <div
              className="h-1.5 w-full"
              style={{
                background:
                  "linear-gradient(90deg, #3A7D2C 0%, #3A7D2C 33%, #F5C118 33%, #F5C118 66%, #F07A1A 66%, #F07A1A 100%)",
              }}
            />
            <div className="p-3.5 sm:p-4 pr-10">
              <button
                onClick={dismiss}
                className="absolute top-3 right-2.5 w-7 h-7 flex items-center justify-center rounded-full text-[#9CA3AF] hover:text-[#374151] hover:bg-black/5 transition-colors"
                aria-label="Close"
              >
                <X size={14} />
              </button>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg bg-gradient-to-br from-[#3A7D2C] to-[#4CAF50]">
                  <CalendarDays size={19} className="text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-poppins font-bold text-[#1A1A1A] text-sm leading-snug">
                    Not sure where to begin?
                  </div>
                  <div className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                    Tell Yogacharya Mrityunjay Pandey's team your goals and we'll guide you to the right program.
                  </div>
                </div>
              </div>

              <a
                href={waLink(consultMsg)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white font-bold text-sm transition-transform active:scale-[0.98] hover:scale-[1.01] shadow-lg shadow-green-200/40"
                style={{ background: "linear-gradient(135deg, #3A7D2C 0%, #4CAF50 100%)" }}
              >
                <MessageCircle size={16} />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

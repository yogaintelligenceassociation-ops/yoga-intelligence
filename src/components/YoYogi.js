import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Leaf, Brain, HeartPulse, Sun } from "lucide-react";
import RevealOnScroll from "./RevealOnScroll";
import ChatWidget from "./ChatWidget";
import { SOCIAL } from "../constants/social";

const promptPills = [
  "Which yoga helps with back pain?",
  "How do I start a morning yoga routine?",
  "What is the best Ayurvedic product for weight loss?",
  "Suggest a 5-minute meditation for stress.",
];

const capabilities = [
  { icon: Sun, label: "Asanas & sequences" },
  { icon: HeartPulse, label: "Therapeutic relief" },
  { icon: Brain, label: "Mind & meditation" },
  { icon: Leaf, label: "Ayurvedic remedies" },
];

export default function YoYogi({ isAuthenticated, onLoginClick }) {
  const [chatInput, setChatInput] = useState("");

  const handlePromptClick = (prompt) => setChatInput(prompt);

  return (
    <section
      id="yoyogi"
      data-testid="yoyogi-section"
      className="py-20 lg:py-28 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #FFF3E8 0%, #FFFAF2 100%)" }}
    >
      {/* Decorative ambient blobs */}
      <div className="absolute top-10 right-10 w-80 h-80 rounded-full bg-orange-200/25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-green-200/20 blur-3xl pointer-events-none" />

      <div className="container-yi relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* LEFT */}
          <div className="flex flex-col gap-6">
            <RevealOnScroll>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-[#3A7D2C]/10 text-[#3A7D2C] border border-[#3A7D2C]/20 w-fit">
                <Sparkles size={12} />
                Your Personal Wellness AI
              </span>
            </RevealOnScroll>

            <RevealOnScroll delay={0.1}>
              <h2 className="font-poppins font-bold text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] leading-tight">
                Meet <span className="text-orange-brand">YoYogi</span> —<br />
                Your Personal Yoga AI Companion
              </h2>
            </RevealOnScroll>

            <RevealOnScroll delay={0.2}>
              <p className="text-[#4B5563] leading-relaxed text-base sm:text-lg">
                YoYogi is Yoga Intelligence's AI wellness guide — available 24/7 to answer your questions
                about yoga, Ayurveda, nutrition, breathwork, and lifestyle. Ask anything. Get expert
                guidance, anytime.
              </p>
            </RevealOnScroll>

            {/* Capability chips */}
            <RevealOnScroll delay={0.25}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {capabilities.map((c, i) => (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-[#F07A1A]/15 text-xs font-semibold text-[#1A1A1A] shadow-sm"
                  >
                    <c.icon size={14} className="text-[#F07A1A]" />
                    {c.label}
                  </motion.div>
                ))}
              </div>
            </RevealOnScroll>

            {/* Prompt pills */}
            <RevealOnScroll delay={0.3}>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Try asking:</p>
                {promptPills.map((pill, i) => (
                  <motion.button
                    key={i}
                    data-testid="yoyogi-prompt-pill"
                    onClick={() => handlePromptClick(pill)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="text-left px-4 py-3 rounded-xl border border-[#F07A1A]/20 bg-white text-sm text-[#1A1A1A] hover:border-[#F07A1A]/50 hover:bg-orange-50/60 transition-colors duration-200 font-medium shadow-sm"
                  >
                    <span className="text-[#F07A1A] mr-2 font-bold">→</span>
                    {pill}
                  </motion.button>
                ))}
              </div>
            </RevealOnScroll>

            {/* WhatsApp fallback + disclaimer */}
            <RevealOnScroll delay={0.4}>
              <div className="flex flex-col gap-3">
                <a
                  href={SOCIAL.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="yoyogi-whatsapp-link"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#3A7D2C] hover:text-[#2A6020] transition-colors w-fit"
                >
                  <MessageCircle size={16} />
                  Prefer to chat with Yogacharya Mrityunjay Pandey directly? WhatsApp us →
                </a>
                <p className="text-xs text-[#9CA3AF]">
                  YoYogi provides general wellness guidance. Always consult a qualified doctor for
                  medical conditions.
                </p>
              </div>
            </RevealOnScroll>
          </div>

          {/* RIGHT — Chat widget */}
          <RevealOnScroll delay={0.2}>
            <ChatWidget
              isAuthenticated={isAuthenticated}
              onLoginClick={onLoginClick}
              prefillInput={chatInput}
              onClearPrefill={() => setChatInput("")}
            />
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CheckCircle, Award, Leaf, ArrowRight, Sparkles, Star, Heart, Flower2 } from "lucide-react";
import { waLink, waMessage } from "../constants/social";
import HeroVideo from "./HeroVideo";
import { StatCounter, Tilt, KineticText } from "./ui/primitives";
import { LeafParticles } from "./ui/Botanical";

const stats = [
  { number: "500+", label: "Students Transformed", icon: Sparkles },
  { number: "10+", label: "Years of Experience", icon: Award },
  { number: "7+", label: "Ayurvedic Products", icon: Leaf },
  { number: "15+", label: "Yoga Programs", icon: Star },
];

const trustBadges = [
  { icon: CheckCircle, text: "500+ Lives Transformed", color: "#3A7D2C" },
  { icon: Award, text: "10+ Years Experience", color: "#F07A1A" },
  { icon: Leaf, text: "100% Natural & Ayurvedic", color: "#F5C118" },
];

const marqueeItems = [
  { icon: Flower2, text: "Power Yoga" },
  { icon: Heart, text: "Acupressure Therapy" },
  { icon: Sparkles, text: "Stress Relief" },
  { icon: Leaf, text: "Ayurvedic Nutrition" },
  { icon: Award, text: "Back & Spine Care" },
  { icon: Star, text: "Weight Management" },
  { icon: CheckCircle, text: "Beginner Friendly" },
];

export default function Hero({ onExploreClasses }) {
  const sectionRef = useRef(null);

  // Scroll-linked fade/parallax is a desktop-only flourish. On phones the hero
  // is tall and scrolls naturally, so fading it out while reading feels broken.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <>
      <section
        id="home"
        ref={sectionRef}
        data-testid="home-hero"
        className="relative lg:min-h-screen flex flex-col hero-mesh overflow-hidden pt-24 sm:pt-28 lg:pt-20"
      >
        {/* Aurora ambient mesh */}
        <div className="aurora" aria-hidden="true" />
        {/* Drifting botanical leaves — sparse + premium */}
        <LeafParticles count={6} />
        {/* Decorative ambient blobs */}
        <div
          className="absolute top-20 right-10 w-72 h-72 md:w-96 md:h-96 rounded-full pointer-events-none opacity-50 animate-pulse-slow"
          style={{ background: "radial-gradient(circle, rgba(240,122,26,0.18) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-20 left-5 w-64 h-64 md:w-80 md:h-80 rounded-full pointer-events-none opacity-40 animate-pulse-slower"
          style={{ background: "radial-gradient(circle, rgba(245,193,24,0.14) 0%, transparent 70%)" }}
        />

        <motion.div
          style={isDesktop ? { opacity, scale } : undefined}
          className="container-yi flex-1 flex items-start lg:items-center py-8 lg:py-16 relative z-10"
        >
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full">
            {/* LEFT — Text */}
            <div className="flex flex-col gap-5 md:gap-6 text-center lg:text-left order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex justify-center lg:justify-start"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-[#3A7D2C]/10 to-[#4CAF50]/10 text-[#3A7D2C] border-2 border-[#3A7D2C]/30 badge-pulse">
                  <span className="w-2 h-2 rounded-full bg-[#3A7D2C] animate-pulse" />
                  India's Premier Yoga Intelligence
                </span>
              </motion.div>

              <h1 className="font-poppins font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-[#1A1A1A] leading-[1.08] px-4 lg:px-0">
                <KineticText text="Transform Your Life with" delay={0.15} />
                {/* Gradient-clipped text stays one element (split breaks the clip).
                    Pure-CSS entrance => always ends visible, robust under reduced-motion. */}
                <span className="text-orange-brand block mt-2 word-rise" data-testid="hero-brand-name">
                  Yoga Intelligence
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-base md:text-lg text-[#6B7280] leading-relaxed max-w-xl mx-auto lg:mx-0 px-4 lg:px-0"
              >
                Ancient Ayurvedic wisdom meets modern yoga science. Guided personally by{" "}
                <span className="yogacharya-highlight">Yogacharya Mrityunjay Pandey</span>.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 md:gap-4 px-4 lg:px-0"
              >
                <a
                  href={waLink(waMessage.general())}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="hero-whatsapp-cta"
                  className="shine touch-btn group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#3A7D2C] to-[#4CAF50] text-white font-bold text-base md:text-lg overflow-hidden font-poppins shadow-xl shadow-green-200 magnetic-btn"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    DM on WhatsApp
                    <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>

                <button
                  onClick={onExploreClasses}
                  data-testid="hero-explore-classes-cta"
                  className="shine touch-btn inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-[#3A7D2C] text-[#3A7D2C] bg-white/80 backdrop-blur-sm font-bold text-base md:text-lg hover:bg-[#3A7D2C] hover:text-white transition-colors duration-300 font-poppins magnetic-btn"
                >
                  Explore Classes
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4 justify-center lg:justify-start px-4 lg:px-0"
              >
                {trustBadges.map((badge, i) => (
                  <div key={i} className="flex items-center gap-2 justify-center lg:justify-start touch-feedback">
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-full"
                      style={{ background: `${badge.color}15`, border: `2px solid ${badge.color}30` }}
                    >
                      <badge.icon size={16} style={{ color: badge.color }} />
                    </div>
                    <span className="text-sm md:text-base font-semibold text-[#1A1A1A]">{badge.text}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-4 pt-2 justify-center lg:justify-start"
              >
                <div className="flex -space-x-2">
                  {["A", "P", "R", "M", "K"].map((l, i) => (
                    <motion.div
                      key={i}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#F07A1A] to-[#F5C118] text-white text-sm font-bold flex items-center justify-center border-2 border-white shadow-md"
                      initial={{ scale: 0, x: -20 }}
                      animate={{ scale: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.1, type: "spring" }}
                    >
                      {l}
                    </motion.div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <motion.span
                        key={s}
                        className="text-[#F5C118] text-base md:text-lg"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + s * 0.05 }}
                      >
                        ★
                      </motion.span>
                    ))}
                  </div>
                  <span className="text-xs md:text-sm text-[#6B7280] font-medium">500+ happy students</span>
                </div>
              </motion.div>
            </div>

            {/* RIGHT — Premium video frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative order-1 lg:order-2 flex justify-center lg:justify-end px-4 lg:px-0"
            >
              {/* Ambient glow behind the video */}
              <div
                className="absolute -inset-10 rounded-3xl opacity-60 blur-3xl pointer-events-none animate-pulse-slow"
                style={{ background: "radial-gradient(ellipse, rgba(58,125,44,0.30) 0%, rgba(240,122,26,0.18) 45%, transparent 75%)" }}
              />

              <Tilt max={7} scale={1.012} className="relative animated-border rounded-2xl md:rounded-3xl w-full max-w-sm lg:max-w-none">
                <motion.div style={isDesktop ? { y: videoY } : undefined} className="relative">
                  <HeroVideo />
                  {/* Gold corner brackets — royal cinematic frame */}
                  {["top-3 left-3 border-t-2 border-l-2 rounded-tl-lg", "top-3 right-3 border-t-2 border-r-2 rounded-tr-lg", "bottom-3 left-3 border-b-2 border-l-2 rounded-bl-lg", "bottom-3 right-3 border-b-2 border-r-2 rounded-br-lg"].map((pos, i) => (
                    <span
                      key={i}
                      className={`absolute ${pos} w-8 h-8 z-30 pointer-events-none`}
                      style={{ borderColor: "rgba(245,193,24,0.7)" }}
                    />
                  ))}
                </motion.div>

                {/* Certified badge (bottom-left float) — desktop only; on phones it
                    collided with the video controls, so it's hidden there. */}
                <motion.div
                  className="hidden lg:block absolute -bottom-4 -left-4 glass rounded-2xl px-4 py-3 shadow-xl glow-green z-30"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1, type: "spring" }}
                  style={{ transform: "translateZ(40px)" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3A7D2C] to-[#4CAF50] flex items-center justify-center text-white text-sm shadow-lg">
                      ✓
                    </div>
                    <div>
                      <div className="font-poppins font-bold text-sm text-[#1A1A1A]">Certified Yogacharya</div>
                      <div className="text-xs text-[#6B7280]">10+ Years Experience</div>
                    </div>
                  </div>
                </motion.div>

                {/* Stats float (top-right) — desktop only */}
                <motion.div
                  className="hidden lg:block absolute -top-4 -right-4 glass rounded-2xl px-4 py-3 shadow-xl glow-orange z-30"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.2, type: "spring" }}
                  style={{ transform: "translateZ(40px)" }}
                >
                  <div className="font-poppins font-black text-3xl text-orange-brand">500+</div>
                  <div className="text-xs text-[#6B7280] font-medium">Happy Students</div>
                </motion.div>
              </Tilt>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <div className="hidden md:flex justify-center pb-8 relative z-10">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <div className="text-xs text-[#6B7280] font-medium tracking-widest uppercase">Scroll</div>
            <div className="w-px h-10 bg-gradient-to-b from-[#F07A1A]/60 to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section data-testid="hero-stats-strip" className="section-dark py-10 md:py-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(240,122,26,0.25) 0%, transparent 60%)" }}
        />
        <div className="container-yi relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="relative text-center px-4 py-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 touch-feedback"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.2, type: "spring" }}
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#F07A1A] to-[#F5C118] mb-3 mx-auto"
                >
                  <stat.icon size={20} color="white" />
                </motion.div>
                <StatCounter
                  value={stat.number}
                  className="font-poppins font-black text-3xl md:text-4xl lg:text-5xl text-orange-brand counter-glow-orange"
                />
                <div className="text-xs md:text-sm text-gray-400 mt-2 font-medium tracking-wide">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust marquee — infinite scrolling program strip */}
      <div className="bg-white border-y border-black/5 py-5 overflow-hidden marquee-track" data-testid="hero-marquee">
        <div className="marquee gap-3">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 px-5 py-2 mx-1.5 rounded-full bg-[#FDFAF5] border border-black/5 text-sm font-semibold text-[#1A1A1A] whitespace-nowrap"
            >
              <item.icon size={15} className="text-[#F07A1A]" />
              {item.text}
              <span className="w-1 h-1 rounded-full bg-[#3A7D2C]/40 ml-1" />
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

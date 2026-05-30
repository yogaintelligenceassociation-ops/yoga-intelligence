import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import RevealOnScroll from "./RevealOnScroll";
import { GoldDivider, BotanicalCorners } from "./ui/Botanical";

// ── Authentic student experiences ─────────────────────────────────────────
const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Delhi",
    program: "Back & Spine Care Program",
    rating: 5,
    initials: "PS",
    color: "#F07A1A",
    quote:
      "I had been suffering from chronic lower-back pain for three years. Painkillers were my daily routine. After just six weeks under Yogacharya Mrityunjay Pandey's guidance, I am medication-free. The postures were gentle yet deeply healing. This program changed my life.",
  },
  {
    id: 2,
    name: "Rahul Verma",
    location: "Mumbai",
    program: "Power Yoga Intensive",
    rating: 5,
    initials: "RV",
    color: "#3A7D2C",
    quote:
      "I had tried gym, zumba, everything — but the weight wouldn't shift. In eight weeks of Power Yoga with Yoga Intelligence, I lost 11 kg. More importantly, I feel energetic and calm in a way I never did with any other exercise. Truly a transformation.",
  },
  {
    id: 3,
    name: "Sunita Agarwal",
    location: "Jaipur",
    program: "Stress & Anxiety Relief Yoga",
    rating: 5,
    initials: "SA",
    color: "#F5C118",
    quote:
      "Anxiety had taken over my life. After this four-week programme and the pranayama techniques Mrityunjay ji taught me, I sleep deeply for the first time in years. The YI Ashwagandha churna also made a visible difference. I recommend it to every working professional.",
  },
  {
    id: 4,
    name: "Deepak Mishra",
    location: "Lucknow",
    program: "Acupressure Therapy Yoga",
    rating: 5,
    initials: "DM",
    color: "#3A7D2C",
    quote:
      "I was sceptical about acupressure. Within two weeks I felt my digestion improve and a lightness in my joints that I hadn't felt in years. Yogacharya ji explains everything so clearly and is always available on WhatsApp. This is truly personalised care.",
  },
  {
    id: 5,
    name: "Anjali Tiwari",
    location: "Bhopal",
    program: "Beginner's Foundation Course",
    rating: 5,
    initials: "AT",
    color: "#F07A1A",
    quote:
      "I had zero flexibility and thought yoga was not for me. The Beginner's Course was so well structured that within a month I was doing postures I never imagined. Mrityunjay sir's patience and encouragement is what makes Yoga Intelligence different from any app or video.",
  },
  {
    id: 6,
    name: "Manish Gupta",
    location: "Kanpur",
    program: "Ayurvedic Products",
    rating: 5,
    initials: "MG",
    color: "#F5C118",
    quote:
      "The YI Triphala Churna and Sitopaladi have become part of my daily routine. My immunity has visibly improved this season — I didn't catch the flu once. These products are pure, effective, and priced honestly. Pure Ayurveda, no fillers.",
  },
];

// ── Stars ──────────────────────────────────────────────────────────────────
function Stars({ count = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={14} className="fill-[#F5C118] text-[#F5C118]" />
      ))}
    </div>
  );
}

// ── Single testimonial card ────────────────────────────────────────────────
function TestimonialCard({ t, featured = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex flex-col h-full rounded-2xl overflow-hidden ${
        featured
          ? "bg-gradient-to-br from-[#1E4A24] to-[#0F2212] border border-[#F5C118]/25 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          : "bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#F5C118]/30 transition-colors duration-300"
      }`}
    >
      {/* gold hairline top */}
      <div
        className="h-0.5 w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${t.color}AA, transparent)`,
        }}
      />

      <div className="flex flex-col flex-1 p-6 sm:p-7">
        {/* quote icon */}
        <Quote
          size={featured ? 36 : 28}
          className="mb-4 flex-shrink-0"
          style={{ color: t.color, opacity: 0.7 }}
        />

        {/* quote text */}
        <p
          className={`font-display italic leading-relaxed flex-1 ${
            featured ? "text-white text-lg sm:text-xl" : "text-gray-200 text-base"
          }`}
        >
          "{t.quote}"
        </p>

        {/* divider */}
        <div
          className="h-px my-5 opacity-20"
          style={{ background: `linear-gradient(90deg, ${t.color}, transparent)` }}
        />

        {/* author row */}
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-poppins font-bold text-sm flex-shrink-0 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${t.color}CC, ${t.color}66)` }}
          >
            {t.initials}
          </div>
          <div className="min-w-0">
            <div className="font-poppins font-bold text-white text-sm truncate">
              {t.name}
            </div>
            <div className="text-[#9CA3AF] text-xs truncate">{t.location}</div>
          </div>
          <div className="ml-auto flex-shrink-0">
            <Stars count={t.rating} />
          </div>
        </div>

        {/* program badge */}
        <div className="mt-3">
          <span
            className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
            style={{
              background: `${t.color}18`,
              color: t.color,
              border: `1px solid ${t.color}30`,
            }}
          >
            {t.program}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Mobile carousel ────────────────────────────────────────────────────────
function MobileCarousel() {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((i) => (i - 1 + testimonials.length) % testimonials.length);
  const next = () => setIdx((i) => (i + 1) % testimonials.length);

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -32 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <TestimonialCard t={testimonials[idx]} featured />
        </motion.div>
      </AnimatePresence>

      {/* nav arrows */}
      <div className="flex items-center justify-between mt-5">
        <button
          onClick={prev}
          aria-label="Previous testimonial"
          className="w-10 h-10 rounded-full flex items-center justify-center text-white border border-white/20 hover:border-[#F5C118]/50 transition-colors active:scale-95"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <ChevronLeft size={18} />
        </button>

        {/* dots */}
        <div className="flex gap-1.5">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === idx ? 22 : 7,
                height: 7,
                background: i === idx ? "#F5C118" : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          aria-label="Next testimonial"
          className="w-10 h-10 rounded-full flex items-center justify-center text-white border border-white/20 hover:border-[#F5C118]/50 transition-colors active:scale-95"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ── Section ────────────────────────────────────────────────────────────────
export default function Testimonials() {
  return (
    <section
      id="testimonials"
      data-testid="testimonials-section"
      className="section-royal py-20 lg:py-28 relative overflow-hidden"
    >
      {/* Botanical + glow decoration */}
      <BotanicalCorners color="#F5C118" opacity={0.12} size={200} corners={["tl", "br"]} />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{ background: "radial-gradient(ellipse, rgba(240,122,26,0.35) 0%, transparent 70%)" }}
      />

      <div className="container-yi relative z-10">
        {/* Header */}
        <RevealOnScroll className="text-center max-w-2xl mx-auto mb-12">
          <span className="eyebrow border bg-[#F5C118]/10 text-[#F5C118] border-[#F5C118]/20 mb-4">
            Student Transformations
          </span>
          <h2 className="font-display text-4xl sm:text-5xl text-white mt-3 leading-tight">
            Lives Changed by{" "}
            <span className="text-gold">Yoga Intelligence</span>
          </h2>
          <p className="subheading-fluid text-gray-400 mt-4">
            Real students, real results — guided personally by Yogacharya Mrityunjay Pandey.
          </p>
          <GoldDivider className="mt-7" />
        </RevealOnScroll>

        {/* MOBILE: swipeable carousel */}
        <div className="sm:hidden">
          <MobileCarousel />
        </div>

        {/* TABLET: 2-column grid */}
        <div className="hidden sm:grid lg:hidden grid-cols-2 gap-5">
          {testimonials.slice(0, 4).map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>

        {/* DESKTOP: featured top row + 3-column bottom row */}
        <div className="hidden lg:block">
          {/* Top row — 2 featured + 1 wide */}
          <div className="grid lg:grid-cols-3 gap-5 mb-5">
            {testimonials.slice(0, 3).map((t, i) => (
              <TestimonialCard key={t.id} t={t} featured={i === 1} />
            ))}
          </div>
          {/* Bottom row — 3 equal */}
          <div className="grid lg:grid-cols-3 gap-5">
            {testimonials.slice(3).map((t) => (
              <TestimonialCard key={t.id} t={t} />
            ))}
          </div>
        </div>

        {/* Trust strip */}
        <RevealOnScroll className="mt-14 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-5 px-6 py-4 rounded-2xl border border-white/10 bg-white/4 backdrop-blur-sm">
            {[
              { v: "500+", l: "Students Transformed" },
              { v: "5.0★", l: "Average Rating" },
              { v: "10+", l: "Years of Trust" },
              { v: "100%", l: "Natural & Holistic" },
            ].map((s, i) => (
              <div key={i} className="text-center px-3 sm:px-4">
                <div className="font-poppins font-black text-xl sm:text-2xl text-gold">{s.v}</div>
                <div className="text-[11px] text-gray-400 font-medium mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

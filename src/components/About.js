import { Brain, Activity, Leaf, Quote } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';
import { IMAGES } from '../constants/social';
import { StatCounter, Spotlight } from './ui/primitives';
import { BotanicalCorners, LeafParticles, GoldDivider } from './ui/Botanical';

const achievements = [
  { number: '10+', label: 'Years Teaching' },
  { number: '500+', label: 'Students' },
  { number: '15+', label: 'Programs' },
];

const features = [
  { icon: Brain,    color: '#F07A1A', bg: 'bg-orange-50', title: 'Mental Wellness',    desc: 'Reduce stress, anxiety, and mental fatigue through scientifically curated breathwork and meditative yoga practices.' },
  { icon: Activity, color: '#3A7D2C', bg: 'bg-green-50',  title: 'Physical Healing',  desc: 'Targeted yoga therapy for back pain, weight management, immunity, and chronic conditions — guided by an experienced expert.' },
  { icon: Leaf,     color: '#F5C118', bg: 'bg-amber-50',  title: 'Ayurvedic Living',  desc: '100% natural herbal products, detox programs, and lifestyle guidance rooted in classical Ayurvedic texts.' },
];

export default function About() {
  return (
    <section id="about" data-testid="about-section">

      {/* 3A: TEACHER BIO — CINEMATIC ROYAL */}
      <div className="section-royal py-20 lg:py-28 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/2 right-0 w-96 h-96 -translate-y-1/2 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(240,122,26,0.16) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,193,24,0.12) 0%, transparent 70%)' }} />
        {/* Botanical corners + drifting leaves */}
        <BotanicalCorners color="#4CAF50" opacity={0.16} size={260} corners={["tl", "br"]} />
        <LeafParticles count={5} />

        <div className="container-yi relative z-10">
          <RevealOnScroll>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-[#3A7D2C]/15 text-[#4CAF50] border border-[#3A7D2C]/25 mb-10">
              About the Teacher
            </span>
          </RevealOnScroll>

          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

            {/* Image */}
            <RevealOnScroll delay={0.1}>
              <div className="relative group">
                <div className="absolute -inset-4 opacity-40 blur-2xl rounded-3xl pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse, rgba(240,122,26,0.3) 0%, transparent 70%)' }} />
                <div className="relative rounded-2xl overflow-hidden ring-1 ring-[#F5C118]/30 royal-frame vignette">
                  <img
                    src={IMAGES.teacher}
                    alt="Yogacharya Mrityunjay Pandey"
                    className="w-full h-[500px] lg:h-[600px] object-cover object-center img-royal group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 z-[3]">
                    <div className="font-display text-2xl text-white">Yogacharya Mrityunjay Pandey</div>
                    <div className="text-sm font-medium mt-1 text-gold">Yoga Expert &amp; Wellness Coach</div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>

            {/* Content */}
            <div className="flex flex-col gap-6">
              <RevealOnScroll delay={0.2}>
                <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.05]">
                  Yogacharya<br />
                  <span className="text-gold">Mrityunjay Pandey</span>
                </h2>
                <p className="font-poppins font-semibold text-base mt-3 text-[#F07A1A]">
                  Yoga Expert · Ayurvedic Wellness Coach · Lifestyle Mentor
                </p>
                <GoldDivider className="mt-5" align="start" />
              </RevealOnScroll>

              <RevealOnScroll delay={0.3}>
                <div className="space-y-4 text-gray-300 leading-relaxed text-sm">
                  <p>Yogacharya Mrityunjay Pandey is a dedicated yoga teacher and Ayurvedic wellness coach with over a decade of experience transforming lives through the ancient science of yoga. His journey began with a deep personal commitment to understanding the body, mind, and spirit as one unified system.</p>
                  <p>Specialising in Power Yoga, Acupressure Therapy, therapeutic yoga for chronic conditions, and holistic lifestyle coaching, Mrityunjay ji brings a rare blend of traditional Ayurvedic knowledge and practical, result-oriented yoga programs.</p>
                  <p>Under his guidance, hundreds of students have overcome chronic back pain, stress, weight challenges, low immunity, and lifestyle diseases — through sustained, intelligent yoga practice paired with Ayurvedic nutrition.</p>
                </div>
              </RevealOnScroll>

              {/* Quote block */}
              <RevealOnScroll delay={0.4}>
                <div className="relative pl-5 py-2 my-2">
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full" style={{ background: 'linear-gradient(180deg, #F07A1A, #F5C118)' }} />
                  <Quote size={20} className="text-[#F07A1A] mb-2 opacity-60" />
                  <p className="font-lora italic text-white/90 text-base leading-relaxed">
                    The body already has everything it needs to heal itself. Yoga and Ayurveda are simply the tools to unlock that potential.
                  </p>
                </div>
              </RevealOnScroll>

              {/* Achievement stats */}
              <RevealOnScroll delay={0.5}>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {achievements.map((a, i) => (
                    <div
                      key={i}
                      className="glass-dark rounded-xl p-4 text-center border border-white/10 transition-transform duration-300 hover:-translate-y-1"
                    >
                      <StatCounter value={a.number} className="font-poppins font-black text-2xl gradient-text" />
                      <div className="text-xs text-gray-400 mt-1">{a.label}</div>
                    </div>
                  ))}
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </div>

      {/* 3B: BRAND FEATURES — LIGHT */}
      <div className="section-white py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% -20%, rgba(240,122,26,0.08) 0%, transparent 60%)' }} />
        <div className="container-yi relative z-10">
          <RevealOnScroll className="text-center max-w-3xl mx-auto mb-14">
            <span className="eyebrow border bg-[#F07A1A]/10 text-[#F07A1A] border-[#F07A1A]/20 mb-4">
              Our Brand
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#1A1A1A] mt-2 mb-5">
              What is <span className="text-gradient-brand">Yoga Intelligence</span>?
            </h2>
            <p className="subheading-fluid text-[#6B7280] leading-relaxed">
              Yoga Intelligence is more than a yoga studio or a product brand. It is a complete wellness ecosystem — combining certified yoga programs, 100% Ayurvedic herbal products, AI-powered wellness guidance, and a lifestyle education platform — all under one roof.
            </p>
            <GoldDivider className="mt-7" />
          </RevealOnScroll>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <RevealOnScroll key={i} delay={i * 0.12}>
                <Spotlight className="group p-8 rounded-2xl bg-white border border-black/5 shadow-ambient premium-card h-full">
                  <div className="relative z-10">
                    <div
                      className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${f.bg} mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}
                      style={{ boxShadow: `0 8px 24px ${f.color}22` }}
                    >
                      <f.icon size={28} style={{ color: f.color }} />
                    </div>
                    <h3 className="font-poppins font-bold text-lg text-[#1A1A1A] mb-3">{f.title}</h3>
                    <p className="text-[#6B7280] text-sm leading-relaxed">{f.desc}</p>
                    <div
                      className="mt-5 h-1 w-10 rounded-full transition-all duration-300 group-hover:w-20"
                      style={{ background: `linear-gradient(90deg, ${f.color}, transparent)` }}
                    />
                  </div>
                </Spotlight>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

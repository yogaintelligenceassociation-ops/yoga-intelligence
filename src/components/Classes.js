import { Clock, MessageCircle, Check, Sparkles } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';
import { IMAGES, waLink, waMessage } from '../constants/social';
import { SectionHeading, Spotlight } from './ui/primitives';

// Curated class imagery - each matches its specific program
const CLASS_D = IMAGES.classes.powerYoga;
const CLASS_E = IMAGES.classes.acupressure;
const CLASS_F = IMAGES.classes.backSpine;
const CLASS_G = IMAGES.classes.stress;
const CLASS_5 = IMAGES.classes.weightLoss;
const CLASS_6 = IMAGES.classes.beginner;

const classes = [
  {
    image: CLASS_D,
    badge: 'Power Yoga',
    badgeColor: 'bg-[#F07A1A]/10 text-[#F07A1A] border-[#F07A1A]/20',
    title: 'Power Yoga Intensive',
    description: 'High-intensity dynamic yoga for building strength, endurance, flexibility, and fat loss. Designed for people who want real, visible results from their yoga practice.',
    duration: '8-Week Program',
    durationColor: 'bg-[#3A7D2C]/10 text-[#3A7D2C]',
  },
  {
    image: CLASS_E,
    badge: 'Acupressure',
    badgeColor: 'bg-[#3A7D2C]/10 text-[#3A7D2C] border-[#3A7D2C]/20',
    title: 'Acupressure Therapy Yoga',
    description: 'Ancient pressure-point healing combined with targeted yoga postures. Relieves chronic pain, stress, digestive issues, and hormonal imbalances naturally without medication.',
    duration: '4-Week Program',
    durationColor: 'bg-[#F07A1A]/10 text-[#F07A1A]',
  },
  {
    image: CLASS_F,
    badge: 'Therapeutic',
    badgeColor: 'bg-[#F5C118]/10 text-[#B8860B] border-[#F5C118]/30',
    title: 'Back & Spine Care Program',
    description: 'Specially designed yoga sequence for chronic back pain, neck stiffness, poor posture, and spinal compression. Safe, gradual, and highly effective for desk workers and older adults.',
    duration: '6-Week Program',
    durationColor: 'bg-[#3A7D2C]/10 text-[#3A7D2C]',
  },
  {
    image: CLASS_G,
    badge: 'Mind & Breath',
    badgeColor: 'bg-[#F07A1A]/10 text-[#F07A1A] border-[#F07A1A]/20',
    title: 'Stress & Anxiety Relief Yoga',
    description: 'A deeply calming program combining yogic breathwork (pranayama), gentle asanas, and meditation techniques to quiet the nervous system, reduce cortisol, and restore mental clarity.',
    duration: '4-Week Program',
    durationColor: 'bg-[#3A7D2C]/10 text-[#3A7D2C]',
  },
  {
    image: CLASS_5,
    badge: 'Weight & Metabolism',
    badgeColor: 'bg-[#3A7D2C]/10 text-[#3A7D2C] border-[#3A7D2C]/20',
    title: 'Weight Management Yoga',
    description: 'A holistic, sustainable approach to weight management through metabolism-activating yoga sequences, Ayurvedic nutrition guidance, and detox practices. No crash diets, no shortcuts.',
    duration: '8-Week Program',
    durationColor: 'bg-[#F5C118]/20 text-[#B8860B]',
  },
  {
    image: CLASS_6,
    badge: 'Beginner Friendly',
    badgeColor: 'bg-[#F07A1A]/10 text-[#F07A1A] border-[#F07A1A]/20',
    title: "Beginner's Foundation Course",
    description: "The perfect starting point for anyone new to yoga. Learn foundational postures, breathing techniques, and lifestyle habits that build a lifelong practice from the very first class.",
    duration: '4-Week Program',
    durationColor: 'bg-[#3A7D2C]/10 text-[#3A7D2C]',
  },
];

const packages = [
  {
    badge: 'Starter',
    badgeColor: 'bg-[#3A7D2C]/10 text-[#3A7D2C]',
    title: 'Wellness Starter Pack',
    subtitle: 'Perfect for beginners',
    features: [
      '1 yoga program of your choice',
      'Weekly one-on-one check-in (30 min)',
      "Beginner's diet & lifestyle guide",
      'WhatsApp support access',
      'Yoga Intelligence digital welcome kit',
    ],
    highlighted: false,
  },
  {
    badge: 'Most Popular',
    badgeColor: 'bg-[#F07A1A]/10 text-[#F07A1A]',
    title: 'Complete Wellness Program',
    subtitle: 'Best for consistent transformation',
    features: [
      '2 yoga programs (your choice)',
      'Bi-weekly one-on-one sessions (45 min)',
      'Personalised Ayurvedic diet plan',
      '1 Ayurvedic product from our store',
      'Priority WhatsApp & call support',
      'Progress tracking and monthly review',
    ],
    highlighted: true,
  },
  {
    badge: 'Premium',
    badgeColor: 'bg-[#F5C118]/20 text-[#B8860B]',
    title: 'Total Transformation Bundle',
    subtitle: 'For serious, committed students',
    features: [
      'All yoga programs — unlimited access',
      'Weekly personal sessions with Yogacharya Mrityunjay Pandey',
      'Full Ayurvedic nutrition & detox plan',
      'Complete Ayurvedic product kit (3 products)',
      'Dedicated support line (call + WhatsApp)',
      'Monthly lifestyle audit and adjustment',
      'Certification of program completion',
    ],
    highlighted: false,
  },
];

// ClassCard component
function ClassCard({ cls, index }) {
  return (
    <RevealOnScroll delay={index * 0.08}>
      <Spotlight className="group bg-white rounded-2xl overflow-hidden border border-black/5 shadow-ambient card-hover flex flex-col h-full" data-testid="class-card">
        {/* Image */}
        <div className="relative overflow-hidden h-48">
          <img
            src={cls.image}
            alt={cls.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
          {/* Badge overlay */}
          <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${cls.badgeColor}`}>
            {cls.badge}
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 flex flex-col flex-1">
          <h3 className="font-poppins font-semibold text-lg text-[#1A1A1A] mb-3 transition-colors group-hover:text-[#3A7D2C]">{cls.title}</h3>
          <p className="text-[#6B7280] text-sm leading-relaxed flex-1">{cls.description}</p>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-black/5">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${cls.durationColor}`}>
              <Clock size={12} />
              {cls.duration}
            </span>
            <a
              href={waLink(waMessage.program(cls.title))}
              target="_blank"
              rel="noreferrer"
              className="shine inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#F07A1A] text-[#F07A1A] text-xs font-semibold hover:bg-[#F07A1A] hover:text-white transition-colors duration-200 font-poppins"
              data-testid="class-card-whatsapp-cta"
            >
              DM to Enquire
              <MessageCircle size={12} />
            </a>
          </div>
        </div>
      </Spotlight>
    </RevealOnScroll>
  );
}

// PackageCard component
function PackageCard({ pkg, index }) {
  const inner = (
    <div
      className={`relative flex flex-col h-full rounded-2xl p-8 bg-white ${
        pkg.highlighted ? "shadow-premium" : "border border-black/5 shadow-ambient card-hover"
      }`}
      data-testid="package-card"
    >
      {pkg.highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#F07A1A] to-[#FF9438] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md font-poppins"
            data-testid="packages-most-chosen-badge"
          >
            <Sparkles size={12} />
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${pkg.badgeColor}`}>
          {pkg.badge}
        </span>
        <h3 className="font-poppins font-bold text-xl text-[#1A1A1A]">{pkg.title}</h3>
        <p className="text-[#6B7280] text-sm mt-1">{pkg.subtitle}</p>
      </div>

      <ul className="flex-1 space-y-3 mb-8">
        {pkg.features.map((feat, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-[#1A1A1A]">
            <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-[#3A7D2C]/10 flex items-center justify-center">
              <Check size={12} className="text-[#3A7D2C]" />
            </span>
            <span>{feat}</span>
          </li>
        ))}
      </ul>

      <a
        href={waLink(waMessage.pkg(pkg.title))}
        target="_blank"
        rel="noreferrer"
        className={`shine w-full py-3.5 rounded-xl font-semibold text-sm text-center transition-all duration-200 font-poppins block ${
          pkg.highlighted
            ? "bg-gradient-to-r from-[#F07A1A] to-[#FF9438] text-white hover:shadow-lg hover:shadow-orange-200"
            : "bg-[#1A1A1A] text-white hover:bg-[#3A7D2C]"
        }`}
        data-testid="package-card-whatsapp-cta"
      >
        DM for Pricing
      </a>
    </div>
  );

  return (
    <RevealOnScroll delay={index * 0.1}>
      {pkg.highlighted ? (
        <div className="conic-border rounded-2xl h-full">{inner}</div>
      ) : (
        inner
      )}
    </RevealOnScroll>
  );
}

export default function Classes() {
  return (
    <section id="classes" data-testid="classes-section" className="section-cream py-20 lg:py-28">
      <div className="container-yi">
        {/* Header */}
        <SectionHeading
          eyebrow="Programs"
          eyebrowStyle="orange"
          title="Our Programs &"
          highlight="Packages"
          subtitle="Every body is different. Every program is personally tailored by Yogacharya Mrityunjay Pandey."
          divider
          className="mb-14"
        />

        {/* Classes Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {classes.map((cls, i) => (
            <ClassCard key={i} cls={cls} index={i} />
          ))}
        </div>

        {/* Packages Header */}
        <RevealOnScroll className="text-center max-w-2xl mx-auto mb-10">
          <h3 className="font-poppins font-bold text-2xl sm:text-3xl text-[#1A1A1A] mb-3">
            Choose the package that works for your goals.
          </h3>
          <p className="text-sm text-[#6B7280]">
            Prices are personalised. DM us for your custom quote.
          </p>
        </RevealOnScroll>

        {/* Packages Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="packages-section">
          {packages.map((pkg, i) => (
            <PackageCard key={i} pkg={pkg} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

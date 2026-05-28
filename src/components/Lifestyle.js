import { useState } from 'react';
import { ArrowRight, Clock, X } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';
import { IMAGES, SOCIAL } from '../constants/social';
import { SectionHeading, Spotlight } from './ui/primitives';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';

const articles = [
  {
    id: 'sun-salutation',
    image: IMAGES.lifestyle.suryaNamaskar,
    category: 'Practice',
    categoryColor: 'bg-[#F07A1A]/10 text-[#F07A1A]',
    title: 'Sun Salutation: The Complete Step-by-Step Guide',
    excerpt:
      "Surya Namaskar is yoga's most complete sequence \u2014 12 postures that work every major muscle group and energise the entire body. Here is exactly how to do it correctly.",
    readTime: '8 min read',
    sections: [
      {
        h: 'What is Surya Namaskar?',
        p: "Surya Namaskar, the Sun Salutation, is a flowing sequence of 12 yoga postures performed in a single continuous movement. Traditionally offered to the rising sun, it is the most efficient way to warm up the body, mobilise every joint, and circulate prana (life-force) before deeper practice. A single round takes about a minute; just 6\u201312 rounds is a complete daily practice.",
      },
      {
        h: 'The 12 Postures \u2014 in Order',
        list: [
          'Pranamasana (Prayer Pose) \u2014 stand tall, palms at heart, exhale fully.',
          'Hasta Uttanasana (Raised Arms Pose) \u2014 inhale, sweep arms overhead, gentle back-bend.',
          'Hasta Padasana (Hand-to-Foot Pose) \u2014 exhale, hinge at hips, fold forward.',
          'Ashwa Sanchalanasana (Equestrian Pose) \u2014 inhale, right leg back, look up.',
          'Dandasana (Plank) \u2014 hold breath, left leg back, body in one line.',
          "Ashtanga Namaskar (Eight-limbed Salute) \u2014 exhale, knees, chest and chin to floor.",
          'Bhujangasana (Cobra) \u2014 inhale, slide forward, lift chest, soft elbows.',
          'Adho Mukha Svanasana (Downward Dog) \u2014 exhale, hips up and back.',
          'Equestrian Pose (other side) \u2014 inhale, right foot forward.',
          'Hand-to-Foot Pose \u2014 exhale, step left foot to right, fold.',
          'Raised Arms Pose \u2014 inhale, rise up, arms overhead.',
          'Prayer Pose \u2014 exhale, palms at heart. One full round complete.',
        ],
      },
      {
        h: 'Benefits You Will Feel',
        list: [
          'Full-body warm-up in under 5 minutes',
          'Improves spinal flexibility, hip mobility, shoulder strength',
          'Stimulates digestion and metabolism (great for weight management)',
          'Calms the nervous system through breath-linked movement',
          'Builds discipline \u2014 a perfect daily ritual',
        ],
      },
      {
        h: 'How to Practise Safely',
        p: "Begin with 3 rounds, gradually building to 12. Move with the breath \u2014 inhale to open, exhale to fold. Never force a posture. Avoid back-bends if you have a recent spinal injury, uncontrolled hypertension, or are in the third trimester of pregnancy. Always finish with 1\u20132 minutes in Shavasana (Corpse Pose) to absorb the practice.",
      },
      {
        h: 'A Tip from Yogacharya Mrityunjay Pandey',
        p: "Quality before quantity. Three slow, breath-aligned rounds done with awareness do more for your body than twelve rushed ones. Make Surya Namaskar a meditation in motion \u2014 then it transforms your day.",
      },
    ],
  },

  {
    id: 'pranayama',
    image: IMAGES.lifestyle.pranayama,
    category: 'Breathwork',
    categoryColor: 'bg-[#3A7D2C]/10 text-[#3A7D2C]',
    title: 'Pranayama Basics: The Ancient Art of Yogic Breathing',
    excerpt:
      'Your breath is your most powerful healing tool. Learn the four foundational pranayama techniques \u2014 Anulom Vilom, Kapalbhati, Bhastrika, and Bhramari \u2014 and how to use them daily.',
    readTime: '7 min read',
    sections: [
      {
        h: 'Why Pranayama Matters',
        p: "In Sanskrit, 'prana' means life-force and 'ayama' means extension. Pranayama is the conscious regulation of breath to expand vital energy. Modern science confirms what yogis knew centuries ago: slow, controlled breathing activates the parasympathetic nervous system, lowers cortisol, sharpens focus and improves immunity.",
      },
      {
        h: '1. Anulom Vilom (Alternate Nostril Breathing)',
        p: "Sit comfortably with a tall spine. Use your right thumb to close the right nostril, inhale slowly through the left. Close the left nostril with the ring finger, release the right, exhale. Inhale through the right, close, exhale through the left. That is one round. Practise 5\u201310 minutes daily. Balances both hemispheres of the brain and calms anxiety.",
      },
      {
        h: '2. Kapalbhati (Skull-Shining Breath)',
        p: "Sit upright. Take a normal inhale, then exhale forcefully through both nostrils by sharply contracting the lower abdomen. The inhale happens passively. Aim for 30\u201360 rapid exhalations per round. Excellent for digestion, energising the mind and cleansing the lungs. Avoid during pregnancy, menstruation, or with uncontrolled blood pressure.",
      },
      {
        h: '3. Bhastrika (Bellows Breath)',
        p: "Inhale and exhale forcefully and equally through both nostrils, using the diaphragm like a bellows. Start with 10 cycles per round. A powerful warming pranayama \u2014 great in the morning or before exercise. Stop immediately if you feel dizzy.",
      },
      {
        h: '4. Bhramari (Bee Breath)',
        p: "Close your ears with your thumbs, place the index fingers above your eyebrows and the remaining fingers gently over your eyes. Inhale deeply, and on the exhale produce a low, steady humming sound like a bee. 5\u201310 rounds before bed dramatically lowers stress and helps with insomnia and headaches.",
      },
      {
        h: 'How to Build a Daily Practice',
        p: "Start with just 5 minutes: 2 minutes Anulom Vilom, 1 minute Kapalbhati (if appropriate), 2 minutes Bhramari. Practise on an empty stomach, ideally at sunrise. Within 21 days you will notice calmer mind, deeper sleep, and steadier energy.",
      },
    ],
  },

  {
    id: 'back-pain',
    image: IMAGES.lifestyle.backPain,
    category: 'Therapy',
    categoryColor: 'bg-[#F5C118]/20 text-[#B8860B]',
    title: 'Yoga for Chronic Back Pain: 8 Poses That Actually Work',
    excerpt:
      'Chronic back pain affects over 540 million people globally. These eight carefully selected yoga postures decompress the spine, release muscle tension, and provide lasting relief.',
    readTime: '10 min read',
    sections: [
      {
        h: 'Why Yoga Works for the Back',
        p: "Most chronic back pain comes from weak core muscles, tight hips and hamstrings, and prolonged sitting that compresses the lumbar spine. Yoga addresses the root cause: it strengthens the deep stabilisers, mobilises the spine in all six directions, and restores natural posture. Clinical studies (including a 2017 Annals of Internal Medicine trial) show yoga is as effective as physical therapy for chronic low-back pain.",
      },
      {
        h: 'The 8 Essential Poses',
        list: [
          "Cat\u2013Cow (Marjaryasana\u2013Bitilasana): on hands and knees, alternate arching and rounding. 10 slow rounds wakes up the spine.",
          "Child's Pose (Balasana): kneel, sit back on heels, forehead to mat. Gently lengthens the lumbar muscles. Hold 1\u20132 minutes.",
          "Supine Twist (Supta Matsyendrasana): on your back, drop knees to one side, arms wide. 1 minute each side decompresses the SI joint.",
          "Cobra (Bhujangasana): lie face down, press palms beside chest, lift chest with soft elbows. Strengthens the spinal erectors.",
          "Bridge (Setu Bandhasana): on your back, knees bent, lift hips. Strengthens glutes and lower back, opens hip flexors.",
          'Sphinx Pose: a gentler back-bend than cobra, ideal if you sit all day. Hold 1\u20132 minutes.',
          "Downward Dog (Adho Mukha Svanasana): lengthens hamstrings and the entire posterior chain. Bend the knees if needed.",
          "Legs-up-the-Wall (Viparita Karani): lie on your back with legs vertical against a wall. 5\u201310 minutes profoundly resets the lower back.",
        ],
      },
      {
        h: 'How to Sequence Them',
        p: "Practise this sequence in order, holding each pose for 5\u20138 slow breaths. The full routine takes ~20 minutes. Do it 4\u20135 times a week for at least 6 weeks. Most students feel meaningful relief within 2\u20133 weeks.",
      },
      {
        h: 'Critical Safety Notes',
        p: "Stop immediately if any pose sends pain down a leg \u2014 that may indicate sciatic involvement requiring medical evaluation. Avoid deep forward folds with disc herniation. Always rule out red-flag causes (fever, weight loss, bowel/bladder issues, recent trauma) with a doctor before starting.",
      },
      {
        h: 'A Personal Note',
        p: "At Yoga Intelligence, hundreds of students have walked into our Back & Spine Care Programme on painkillers and walked out medication-free. The body wants to heal. Yoga simply gives it the right conditions.",
      },
    ],
  },

  {
    id: 'morning-routine',
    image: IMAGES.lifestyle.morning,
    category: 'Lifestyle',
    categoryColor: 'bg-[#F07A1A]/10 text-[#F07A1A]',
    title: 'How to Build a Morning Yoga Routine That You Actually Stick To',
    excerpt:
      'The secret is not motivation \u2014 it is a system. Here is a simple, realistic morning yoga framework designed to become automatic within 21 days of practice.',
    readTime: '6 min read',
    sections: [
      {
        h: 'Why Mornings Work',
        p: "The brain is most plastic and the willpower reserve highest within an hour of waking. A morning practice anchors the rest of your day: better posture, calmer mood, steadier focus. Just 15 dedicated minutes is more powerful than a 90-minute evening session you do once a week.",
      },
      {
        h: 'The 15-Minute Framework',
        list: [
          'Minute 0\u20131: drink one glass of warm water on rising (flushes the kunjal channel).',
          'Minute 1\u20133: 1\u20133 rounds of Cat\u2013Cow to wake the spine.',
          "Minute 3\u20137: 6 slow rounds of Surya Namaskar.",
          'Minute 7\u201310: 3 minutes of Anulom Vilom pranayama.',
          'Minute 10\u201313: 2 minutes of Bhramari (or silent meditation).',
          'Minute 13\u201315: 2 minutes of Shavasana with one intention for the day.',
        ],
      },
      {
        h: 'How to Make It Stick',
        list: [
          'Lay out your mat the night before \u2014 zero friction.',
          'Practise at the same time daily \u2014 the brain loves consistency.',
          'Track 21 days on paper. Crossing each day is more powerful than any app.',
          'Pair it with an existing habit \u2014 right after brushing teeth, before coffee.',
          'On low-energy days, do only 3 rounds of Surya Namaskar. Never zero.',
        ],
      },
      {
        h: "Yogacharya Mrityunjay Pandey's Rule of Two",
        p: "Never miss two days in a row. Missing one day is human; missing two builds an identity of 'someone who skips'. This single rule has saved more morning practices than any motivation talk ever could.",
      },
    ],
  },

  {
    id: 'nutrition',
    image: IMAGES.lifestyle.nutrition,
    category: 'Nutrition',
    categoryColor: 'bg-[#3A7D2C]/10 text-[#3A7D2C]',
    title: 'Nutrition for Yogis: What Ayurveda Says About What You Should Eat',
    excerpt:
      'Ayurveda has guided yogic nutrition for over 5,000 years. Learn which foods energise your practice, which drain it, and how to eat in alignment with your body type.',
    readTime: '9 min read',
    sections: [
      {
        h: 'The Three Gunas of Food',
        list: [
          'Sattvic (pure & light): fresh fruits, vegetables, whole grains, soaked nuts, ghee, honey, herbal teas \u2014 ideal for a yogi.',
          'Rajasic (stimulating): coffee, refined sugar, garlic, onion, fried foods \u2014 OK in moderation, avoid before practice.',
          'Tamasic (dulling): leftovers, processed foods, alcohol, deep-fried, heavily salted, microwaved meals \u2014 minimise.',
        ],
      },
      {
        h: 'Eat for Your Dosha',
        list: [
          'Vata (air & space): favour warm, oily, grounding foods \u2014 stews, soaked nuts, ghee, root vegetables. Avoid raw salads in winter.',
          'Pitta (fire & water): favour cooling, mildly sweet foods \u2014 cucumber, melon, coconut, milk, leafy greens. Avoid excess spice and fermented foods.',
          'Kapha (earth & water): favour light, dry, pungent foods \u2014 ginger, black pepper, leafy greens, legumes. Avoid heavy dairy and sweets.',
        ],
      },
      {
        h: 'Yogic Eating Rules',
        list: [
          'Eat your largest meal at midday when digestive fire (agni) is strongest.',
          'Sit down, chew slowly, no screens \u2014 digestion begins in the mouth.',
          'Stop at 75% full \u2014 leave space for digestion.',
          'Avoid eating 3 hours before bed.',
          'Drink warm water through the day; iced drinks weaken digestion.',
        ],
      },
      {
        h: 'Foods that Pair with Asana Practice',
        p: "Before practice, keep the stomach light: a banana, a few soaked almonds, or just warm water. After practice (within 30 minutes) replenish with a simple, nourishing meal such as khichdi, dal\u2013rice, or a fruit-and-yogurt bowl. Avoid heavy meat or fried foods right after asana \u2014 they undo the lightness you just built.",
      },
    ],
  },

  {
    id: 'meditation',
    image: IMAGES.lifestyle.meditation,
    category: 'Mindfulness',
    categoryColor: 'bg-[#F5C118]/20 text-[#B8860B]',
    title: "How to Start a Meditation Practice: The Beginner's Complete Guide",
    excerpt:
      'Meditation is not about emptying your mind. It is about learning to watch it. Here is a simple, honest guide to starting \u2014 and sustaining \u2014 a daily meditation practice.',
    readTime: '8 min read',
    sections: [
      {
        h: 'The Biggest Myth',
        p: "Most beginners quit because they believe a 'good meditation' is one with no thoughts. That is impossible. The mind produces thoughts the way the heart pumps blood. Meditation is the practice of noticing thoughts without following them \u2014 again, and again, and again. Every return is a rep at the gym of awareness.",
      },
      {
        h: 'The Simplest Technique (Anapana)',
        p: "Sit comfortably with a tall spine \u2014 on a chair or cushion, doesn't matter. Close your eyes. Bring your attention to the natural sensation of the breath at the nostrils. Don't control the breath \u2014 just observe. When your mind wanders (it will, in seconds), gently return to the breath. That is the whole practice.",
      },
      {
        h: 'How Long & How Often',
        list: [
          'Days 1\u20137: 5 minutes daily, same time, same place.',
          'Days 8\u201321: 10 minutes daily.',
          'After day 21: 15\u201320 minutes daily.',
          'Consistency beats duration. 10 minutes every day is more powerful than 1 hour once a week.',
        ],
      },
      {
        h: 'Common Obstacles & Honest Answers',
        list: [
          "'I can't sit still' \u2014 do 5 minutes of Cat\u2013Cow first.",
          "'I fall asleep' \u2014 sit upright in a chair, eyes slightly open.",
          "'My back hurts' \u2014 use a cushion to lift your hips above your knees.",
          "'I have no time' \u2014 it is exactly the people with no time who need it most.",
        ],
      },
      {
        h: 'What You Will Notice in 30 Days',
        p: "Sharper focus at work, less reactivity in arguments, a longer fuse with family, more present moments through the day. You will not become a different person. You will become more of yourself \u2014 and that, the yogis tell us, is the entire point.",
      },
    ],
  },
];

function ArticleCard({ article, index, onOpen }) {
  return (
    <RevealOnScroll delay={(index % 3) * 0.1}>
      <Spotlight
        className="group bg-white rounded-2xl overflow-hidden border border-black/5 shadow-ambient card-hover flex flex-col h-full cursor-pointer"
        data-testid="blog-card"
        onClick={() => onOpen(article)}
      >
        <div className="relative overflow-hidden h-48">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
          <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${article.categoryColor}`}>
            {article.category}
          </span>
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[11px] font-medium text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
            <Clock size={10} />
            {article.readTime}
          </span>
        </div>

        <div className="relative z-10 p-6 flex flex-col flex-1">
          <h3 className="font-poppins font-semibold text-base text-[#1A1A1A] mb-3 line-clamp-2 transition-colors group-hover:text-[#F07A1A]">
            {article.title}
          </h3>
          <p className="text-[#6B7280] text-sm leading-relaxed line-clamp-3 flex-1">
            {article.excerpt}
          </p>
          <button
            data-testid={`blog-read-more-${article.id}`}
            onClick={(e) => { e.stopPropagation(); onOpen(article); }}
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-[#F07A1A] hover:text-[#E56F12] transition-all group-hover:gap-2.5 font-poppins self-start"
          >
            Read Full Article
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </Spotlight>
    </RevealOnScroll>
  );
}

export default function Lifestyle() {
  const [active, setActive] = useState(null);
  const [open, setOpen] = useState(false);

  const handleOpen = (article) => {
    setActive(article);
    setOpen(true);
  };

  return (
    <section id="lifestyle" data-testid="lifestyle-section" className="section-white py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-orange-100/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-green-100/30 blur-3xl pointer-events-none" />

      <div className="container-yi relative z-10">
        <SectionHeading
          eyebrow="Knowledge & Insights"
          eyebrowStyle="gold"
          title="The Yogic"
          highlight="Lifestyle"
          subtitle="Authoritative guides curated by Yogacharya Mrityunjay Pandey — knowledge, practice, and transformation for living intelligently, from the inside out."
          divider
          className="mb-14"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <ArticleCard key={article.id} article={article} index={i} onOpen={handleOpen} />
          ))}
        </div>
      </div>

      {/* Article Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          data-testid="blog-article-modal"
          className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 border-0 rounded-3xl shadow-2xl"
        >
          {active && (
            <>
              {/* Hero image */}
              <div className="relative h-56 sm:h-72 overflow-hidden rounded-t-3xl">
                <img src={active.image} alt={active.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-5 left-6 right-6">
                  <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${active.categoryColor}`}>
                    {active.category}
                  </span>
                  <h2 className="font-poppins font-bold text-white text-2xl sm:text-3xl mt-3 leading-tight drop-shadow-md">
                    {active.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-2 text-white/85 text-sm">
                    <Clock size={13} /> {active.readTime}
                    <span className="mx-1">·</span>
                    <span className="yogacharya-highlight-light">Yogacharya Mrityunjay Pandey</span>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  data-testid="blog-article-close"
                  aria-label="Close article"
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/25 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Article body */}
              <div className="px-6 sm:px-10 py-8">
                <DialogHeader className="sr-only">
                  <DialogTitle>{active.title}</DialogTitle>
                  <DialogDescription>{active.excerpt}</DialogDescription>
                </DialogHeader>

                <p className="font-lora italic text-[#3A7D2C] text-base sm:text-lg leading-relaxed mb-8 border-l-2 border-[#F07A1A] pl-4">
                  {active.excerpt}
                </p>

                <div className="space-y-7 text-[#1A1A1A]">
                  {active.sections.map((s, i) => (
                    <div key={i}>
                      <h3 className="font-poppins font-bold text-lg sm:text-xl text-[#1A1A1A] mb-3">
                        {s.h}
                      </h3>
                      {s.p && <p className="text-[#374151] leading-relaxed text-[15px]">{s.p}</p>}
                      {s.list && (
                        <ul className="space-y-2 mt-2">
                          {s.list.map((li, j) => (
                            <li key={j} className="flex items-start gap-3 text-[#374151] text-[15px] leading-relaxed">
                              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#F07A1A] flex-shrink-0" />
                              <span>{li}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-10 pt-6 border-t border-black/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <p className="text-sm text-[#6B7280]">
                    Want a personalised programme based on this guide?
                  </p>
                  <a
                    href={SOCIAL.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    data-testid="blog-article-cta"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3A7D2C] to-[#4CAF50] text-white font-semibold text-sm hover:scale-105 transition-transform shadow-lg shadow-green-200 font-poppins"
                  >
                    DM Yogacharya Mrityunjay Pandey
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

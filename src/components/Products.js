import { useState } from 'react';
import { MessageCircle, AlertCircle } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';
import { SOCIAL, IMAGES } from '../constants/social';
import { SectionHeading, Spotlight } from './ui/primitives';

const WA_LINK = SOCIAL.whatsapp;

const products = [
  {
    id: 1,
    image: IMAGES.products.ashwagandha,
    badge: 'Bestseller',
    badgeColor: 'bg-[#F07A1A]/10 text-[#F07A1A]',
    name: 'YI Ashwagandha Power Churna',
    tagline: 'Ancient strength. Modern vitality.',
    description: 'A powerful Ayurvedic herbal blend formulated to restore physical stamina, mental clarity, and inner strength — naturally.',
    ingredients: 'Ashwagandha, Bamboo Silica (Vanshlochan), Rock Candy (Taal Mishri), Basil Seeds (Tulsi Beej), Safed Musli',
    benefits: [
      'Boosts physical stamina and endurance',
      'Reduces stress, anxiety, and mental fatigue',
      'Strengthens immunity and hormonal balance',
      'Ideal companion for yoga, gym, and active lifestyles',
    ],
    howToUse: '1 teaspoon (5g) on an empty stomach every morning, or before bed at night. Best taken with warm milk for maximum effect.',
    bestFor: 'Those experiencing physical weakness, low energy, chronic stress, or anyone who practices yoga and fitness regularly.',
  },
  {
    id: 2,
    image: IMAGES.products.triphala,
    badge: 'Detox',
    badgeColor: 'bg-[#3A7D2C]/10 text-[#3A7D2C]',
    name: 'YI Triphala Churna',
    tagline: "Nature's most complete cleanser.",
    description: 'The legendary three-fruit Ayurvedic formula — Amla, Haritaki, and Bibhitaki — working together to detoxify, rejuvenate, and restore your entire system from the inside out.',
    ingredients: 'Amla (Indian Gooseberry), Haritaki, Bibhitaki (Baheda)',
    benefits: [
      'Deep body detox — removes toxins from liver and intestines',
      'Relieves constipation and improves gut health naturally',
      'Supports gradual, sustainable weight management',
      'Improves eyesight, skin clarity, and natural immunity',
    ],
    howToUse: '1 teaspoon of powder at night before bed with warm water. Best used with Kapalbhati and Agnisar Kriya every morning.',
    bestFor: 'Anyone looking for a gentle daily cleanse, improved digestion, and natural detoxification.',
  },
  {
    id: 3,
    image: IMAGES.products.panchsakar,
    badge: 'Digestive',
    badgeColor: 'bg-[#F5C118]/20 text-[#B8860B]',
    name: 'YI Panchsakar Churna',
    tagline: 'Complete digestive reset. Five powerful herbs.',
    description: 'A classical Ayurvedic digestive formula made from five powerful herbs, specifically designed to eliminate chronic constipation, cleanse the colon, and restore digestive harmony.',
    ingredients: 'Dry Ginger (Saunth), Fennel (Saunf), Senna Leaves, Rock Salt (Sendha Namak), Haritaki',
    benefits: [
      'Fast, effective relief from chronic constipation',
      'Eliminates gas, bloating, and abdominal heaviness',
      'Deep colon cleansing and digestive reset',
      'Supports healthy metabolism and natural weight management',
    ],
    howToUse: 'Half to 1 teaspoon before bed with warm water. Use as a short-term cleanse, not daily long-term. Combine with Pavanmuktasana and Kapalbhati.',
    caution: 'Contains Senna — a natural laxative. Not recommended for pregnant women or children without doctor guidance.',
  },
  {
    id: 4,
    image: IMAGES.products.sitopaladi,
    badge: 'Immunity',
    badgeColor: 'bg-[#3A7D2C]/10 text-[#3A7D2C]',
    name: 'YI Sitopaladi Churna',
    tagline: 'Your natural shield against cough, cold, and weak lungs.',
    description: 'A time-tested classical Ayurvedic respiratory formula that works like a natural cough syrup — soothing the throat, strengthening the lungs, and boosting immunity without any side effects.',
    ingredients: 'Rock Candy (Mishri), Bamboo Silica (Vanshlochan), Long Pepper (Pippali), Cardamom (Elaichi), Cinnamon (Dalchini)',
    benefits: [
      'Effective relief from dry cough, wet cough, and sore throat',
      'Strengthens lung capacity and respiratory health',
      'Supports asthma and allergy management naturally',
      'Builds strong, lasting immunity with regular use',
    ],
    howToUse: '1-2 teaspoons (3-5g) twice daily with honey or warm water. Best combined with Anulom Vilom and Bhastrika pranayama.',
  },
  {
    id: 5,
    image: IMAGES.products.slimfit,
    badge: 'Weight Care',
    badgeColor: 'bg-[#F07A1A]/10 text-[#F07A1A]',
    name: 'Slim Fit Ayurvedic Churna',
    tagline: 'Less belly, more energy — the natural way.',
    description: 'A carefully formulated Ayurvedic herbal blend that activates your metabolism, cleanses digestive toxins, and supports your body\'s natural fat-balancing process — without harsh chemicals.',
    ingredients: 'Amla, Haritaki, Bibhitaki, Triphala blend, Cumin (Jeera), Carom Seeds (Ajwain), Fennel (Saunf), and select Ayurvedic herbs for metabolic balance.',
    benefits: [
      'Activates natural metabolism and aids gradual fat reduction',
      'Detoxifies the digestive system and improves nutrient absorption',
      'Eliminates gas, acidity, and bloating',
      'Increases daily energy and reduces sluggishness',
    ],
    howToUse: '1 teaspoon (3-5g) on an empty stomach in the morning with warm water, or before bed. Best results alongside yoga practice.',
  },
  {
    id: 6,
    image: IMAGES.products.hairPack,
    badge: 'Hair Care',
    badgeColor: 'bg-[#3A7D2C]/10 text-[#3A7D2C]',
    name: 'Yoga Intelligence Herbal Hair Pack',
    tagline: 'Chemical-free. Nature-powered. Root to tip.',
    description: 'A 100% herbal, chemical-free hair care formula crafted from seven potent Ayurvedic herbs. Can be used as a natural shampoo or a deep-conditioning hair pack.',
    ingredients: 'Shikakai, Soapnut/Reetha, Amla, Henna/Mehendi, Bhringraj Leaf, Doob Grass/Durva, Aloe Vera',
    benefits: [
      'Stimulates natural hair growth from the roots',
      'Controls dandruff, itching, and scalp irritation',
      'Makes hair soft, shiny, and full of natural body',
      'Reduces hair fall and prevents breakage',
    ],
    howToUse: 'As Shampoo: Mix with water, apply with gentle massage, rinse after 5 minutes. As Hair Pack: Mix with yogurt or aloe vera gel, apply for 20–30 minutes, rinse with cool water.',
  },
  {
    id: 7,
    image: IMAGES.products.facePack,
    badge: 'Skin Care',
    badgeColor: 'bg-[#F5C118]/20 text-[#B8860B]',
    name: 'Yoga Intelligence Herbal Face Pack',
    tagline: 'Ayurvedic glow. No chemicals. No compromise.',
    description: 'A handcrafted Ayurvedic face pack blending six traditional skin-healing herbs and minerals. Deep-cleanses, brightens, and rejuvenates naturally — 100% chemical free.',
    ingredients: "Fuller's Earth (Multani Mitti), Shankh Bhasma, Sandalwood Powder (Chandan), Neem Powder, Kasturi Turmeric, Rose Water",
    benefits: [
      'Deep pore cleansing and oil control',
      'Reduces acne, pimples, and skin inflammation',
      'Natural skin brightening and glow',
      'Tones skin and fades dark spots and blemishes',
    ],
    howToUse: 'Mix dry powders with rose water to form a smooth paste. Apply on face, leave for 10–15 minutes, rinse gently with cool water. Use 2–3 times per week.',
    caution: 'For sensitive skin, consult a dermatologist first. Not for use near eyes.',
  },
];

// ProductCard component
function ProductCard({ product, index }) {
  const [activeTab, setActiveTab] = useState('benefits');
  const [expanded, setExpanded] = useState(false);

  const tabs = [
    { id: 'benefits', label: 'Benefits' },
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'howToUse', label: 'How to Use' },
  ];

  return (
    <RevealOnScroll delay={(index % 3) * 0.1}>
      <Spotlight
        className="group bg-white rounded-2xl overflow-hidden border border-black/5 shadow-ambient card-hover flex flex-col h-full"
        data-testid="product-card"
      >
        {/* Product Image */}
        <div className="relative overflow-hidden h-52">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${product.badgeColor}`}>
            {product.badge}
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 flex flex-col flex-1">
          <h3 className="font-poppins font-bold text-base text-[#1A1A1A] mb-1">{product.name}</h3>
          <p className="font-lora italic text-sm text-[#F07A1A] mb-3">{product.tagline}</p>
          <p className="text-[#6B7280] text-xs leading-relaxed mb-4">{product.description}</p>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-gray-50 rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors duration-200 font-poppins ${
                  activeTab === tab.id
                    ? 'bg-white text-[#F07A1A] shadow-sm'
                    : 'text-[#6B7280] hover:text-[#1A1A1A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-h-[80px] text-xs text-[#6B7280] leading-relaxed mb-4">
            {activeTab === 'benefits' && (
              <ul className="space-y-1.5">
                {product.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#3A7D2C] font-bold mt-0.5">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {activeTab === 'ingredients' && (
              <p className="leading-relaxed">{product.ingredients}</p>
            )}
            {activeTab === 'howToUse' && (
              <div>
                <p>{product.howToUse}</p>
                {product.bestFor && (
                  <p className="mt-2"><span className="font-semibold text-[#1A1A1A]">Best for: </span>{product.bestFor}</p>
                )}
                {product.caution && (
                  <div className="mt-3 flex items-start gap-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                    <AlertCircle size={12} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-700">{product.caution}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CTA */}
          <a
            href={WA_LINK}
            target="_blank"
            rel="noreferrer"
            className="shine flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#F07A1A] to-[#FF9438] text-white text-sm font-semibold hover:shadow-lg hover:shadow-orange-200 transition-all duration-200 font-poppins"
            data-testid="product-card-whatsapp-cta"
          >
            <MessageCircle size={15} />
            DM to Buy →
          </a>
        </div>
      </Spotlight>
    </RevealOnScroll>
  );
}

export default function Products() {
  return (
    <section id="products" data-testid="products-section" className="section-alt py-20 lg:py-28 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-green-200/20 blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-0 w-96 h-96 rounded-full bg-orange-200/10 blur-3xl pointer-events-none" />

      <div className="container-yi relative z-10">
        {/* Header */}
        <SectionHeading
          eyebrow="Ayurvedic Store"
          eyebrowStyle="green"
          title="Yoga Intelligence"
          highlight="Store"
          subtitle="100% natural, Ayurvedic formulations crafted to complement your yoga practice and daily wellness routine."
          divider
          className="mb-6"
        />

        {/* Note bar */}
        <RevealOnScroll className="mb-12">
          <div className="text-center py-3 px-6 bg-[#3A7D2C]/5 border border-[#3A7D2C]/15 rounded-xl text-sm text-[#3A7D2C] font-medium">
            All products are handcrafted using traditional Ayurvedic formulas. To purchase, DM us on WhatsApp.
          </div>
        </RevealOnScroll>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

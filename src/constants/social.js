// Yoga Intelligence — central source of truth for links and imagery.
// All brand-critical images live in /public/images/* so the site stays
// fully functional even if any third-party CDN goes down.

export const WHATSAPP_NUMBER = "917739588215";

export const SOCIAL = {
  phone: "7739588215",
  email: "yogaintelligenceassociation@gmail.com",
  whatsapp: `https://wa.me/${WHATSAPP_NUMBER}`,
  instagram: "https://www.instagram.com/yoga.intelligence?igsh=MW00cWU1aWo1bHY0cA==",
  youtube: "https://youtube.com/@yogaintelligenceassociation?si=DPWauvfekhar9Zus",
  facebook: "https://www.facebook.com/share/1G2D7UMSpJ/",
  googleReview: "https://g.page/r/CY3SeK9pCghQEAE/review",
};

// ── WhatsApp deep links with a pre-filled, professional message ─────────────
// Clicking a "DM" button opens WhatsApp with a context-aware note so the user
// (and we) know exactly what they're enquiring about — like a real product app.
export function waLink(message = "") {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const waMessage = {
  general: () =>
    "Namaste Yoga Intelligence 🙏\n\nI'd love to know more about your yoga programs and Ayurvedic products.\n\nPlease guide me. Thank you!",
  program: (name) =>
    `Namaste Yoga Intelligence 🙏\n\nI'm interested in the *${name}* program.\n\nCould you please share the details, schedule, and how I can begin?\n\nThank you!`,
  pkg: (name) =>
    `Namaste Yoga Intelligence 🙏\n\nI'd like to join the *${name}*.\n\nPlease share the pricing and the steps to enroll.\n\nThank you!`,
  product: (name) =>
    `Namaste Yoga Intelligence 🙏\n\nI'd like to order *${name}*.\n\nCould you please share the price and how to purchase?\n\nThank you!`,
  article: (title) =>
    `Namaste Yoga Intelligence 🙏\n\nI just read your guide "${title}" and would love a personalised programme based on it.\n\nPlease guide me. Thank you!`,
};

// Native brand colors used by the social icon row in Navbar + Footer.
export const BRAND_COLORS = {
  instagram: "#E1306C",
  youtube: "#FF0000",
  facebook: "#1877F2",
  whatsapp: "#25D366",
  googleReview: "#FBBC05", // Google brand yellow — recognisable as a review star
};

export const IMAGES = {
  // Brand — saved locally for full ownership.
  logo: "/images/logo.png",

  // Hero video (web-optimised, locally served)
  heroVideo: "/videos/hero.mp4",
  heroVideoMobile: "/videos/hero_mobile.mp4",
  heroPoster: "/videos/hero_poster.jpg",

  // Teacher photos (downloaded locally — full ownership, no CDN dependency)
  hero: "/images/teacher/hero.jpg",
  teacher: "/images/teacher/teacher.jpg",
  teacherAlt: "/images/teacher/teacher-alt.jpg",
  teacherAction: "/images/teacher/teacher-action.jpg",

  // Class imagery — curated, stable Unsplash CDN
  classes: {
    powerYoga: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=85&auto=format&fit=crop",
    acupressure: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=900&q=85&auto=format&fit=crop",
    backSpine: "/images/classes/back-spine.jpg",
    stress: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=900&q=85&auto=format&fit=crop",
    weightLoss: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&q=85&auto=format&fit=crop",
    beginner: "https://images.unsplash.com/photo-1593810450967-f9c42742e326?w=900&q=85&auto=format&fit=crop",
  },

  // Yoga Intelligence Ayurvedic product line.
  // Sitopaladi + Hair Pack use the original branded artifacts (saved locally).
  products: {
    ashwagandha: "https://images.unsplash.com/photo-1704650311291-0e001b7e2b9f?w=800&q=85&auto=format&fit=crop",
    triphala: "/images/products/triphala.jpg",
    panchsakar: "/images/products/panchsakar.jpg",
    sitopaladi: "/images/products/sitopaladi.jpg",
    slimfit: "https://images.unsplash.com/photo-1758525732480-8df43412b54c?w=800&q=85&auto=format&fit=crop",
    hairPack: "/images/products/hair-pack.jpg",
    facePack: "https://images.unsplash.com/photo-1761864293811-d6e937225df4?w=800&q=85&auto=format&fit=crop",
  },

  // Editorial lifestyle imagery
  lifestyle: {
    suryaNamaskar: "https://images.unsplash.com/photo-1520953822729-5955ba4f37d0?w=900&q=85&auto=format&fit=crop",
    pranayama: "https://images.unsplash.com/photo-1620919203384-7a23fdeb97fa?w=900&q=85&auto=format&fit=crop",
    backPain: "https://images.unsplash.com/photo-1516209293065-e5b8066cc0d1?w=900&q=85&auto=format&fit=crop",
    morning: "https://images.unsplash.com/photo-1636619297905-54f124aa90b2?w=900&q=85&auto=format&fit=crop",
    nutrition: "https://images.unsplash.com/photo-1720720406887-79b2d0420cb1?w=900&q=85&auto=format&fit=crop",
    meditation: "https://images.unsplash.com/photo-1758274526671-ad18176acb01?w=900&q=85&auto=format&fit=crop",
  },
};

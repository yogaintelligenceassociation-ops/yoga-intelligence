import { Instagram, Youtube, Facebook, MessageCircle, Mail, Phone, Star } from "lucide-react";
import { SOCIAL, BRAND_COLORS, waLink, waMessage } from "../constants/social";
import BrandLogo from "./BrandLogo";
import { BotanicalCorners, GoldDivider } from "./ui/Botanical";

const quickLinks = [
  { label: "About Us", href: "#about" },
  { label: "Classes", href: "#classes" },
  { label: "Products", href: "#products" },
  { label: "Lifestyle", href: "#lifestyle" },
  { label: "YoYogi AI", href: "#yoyogi" },
  { label: "Contact", href: SOCIAL.whatsapp, external: true },
];

const programs = [
  "Power Yoga Intensive",
  "Acupressure Therapy",
  "Back & Spine Care",
  "Stress & Anxiety Relief",
  "Weight Management",
  "Beginner's Foundation",
];

const socialIcons = [
  { Icon: Instagram, href: SOCIAL.instagram, color: BRAND_COLORS.instagram, label: "Instagram" },
  { Icon: Youtube, href: SOCIAL.youtube, color: BRAND_COLORS.youtube, label: "YouTube" },
  { Icon: Facebook, href: SOCIAL.facebook, color: BRAND_COLORS.facebook, label: "Facebook" },
  { Icon: Star, href: SOCIAL.googleReview, color: BRAND_COLORS.googleReview, label: "Google Review" },
  { Icon: MessageCircle, href: SOCIAL.whatsapp, color: BRAND_COLORS.whatsapp, label: "WhatsApp" },
];

export default function Footer() {
  const handleNavClick = (href) => {
    if (href.startsWith("http")) return;
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer data-testid="site-footer" className="footer-royal text-gray-200 relative overflow-hidden">
      {/* Top gold hairline */}
      <div className="gold-hairline opacity-70" />
      {/* Warm ambient glow */}
      <div
        className="absolute top-0 left-1/4 -translate-x-1/2 w-[700px] h-[360px] rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ background: "radial-gradient(ellipse, rgba(240,122,26,0.30) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[320px] rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: "radial-gradient(circle, rgba(245,193,24,0.28) 0%, transparent 70%)" }}
      />
      {/* Botanical corners */}
      <BotanicalCorners color="#F5C118" opacity={0.14} size={240} corners={["tl", "br"]} />

      <div className="container-yi py-16 relative z-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <BrandLogo size="md" />
              <div className="leading-tight">
                <span className="block font-poppins font-black text-xl text-orange-brand">
                  YOGA INTELLIGENCE
                </span>
                <span className="block font-display text-[11px] text-gold tracking-wide">
                  संकल्प स्वस्थ भारत का
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Connecting nature, yoga, and intelligence — for a life that is truly well. Founded and guided by{" "}
              <span className="yogacharya-highlight-dark">Yogacharya Mrityunjay Pandey</span>.
            </p>
            {/* Native-color social icons */}
            <div className="flex flex-wrap gap-2.5">
              {socialIcons.map(({ Icon, href, color, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  data-testid={`footer-social-${label.toLowerCase().replace(" ", "-")}`}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110 hover:-translate-y-0.5"
                  style={{ background: `${color}1F`, color, border: `1px solid ${color}40` }}
                >
                  <Icon size={17} strokeWidth={2.2} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-poppins font-semibold text-white text-sm mb-5 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-gray-400 hover:text-[#F07A1A] transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <button
                      onClick={() => handleNavClick(link.href)}
                      className="text-sm text-gray-400 hover:text-[#F07A1A] transition-colors"
                    >
                      {link.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-poppins font-semibold text-white text-sm mb-5 uppercase tracking-wider">
              Programs
            </h4>
            <ul className="space-y-3">
              {programs.map((program, i) => (
                <li key={i}>
                  <button
                    onClick={() => handleNavClick("#classes")}
                    className="text-sm text-gray-400 hover:text-[#F07A1A] transition-colors text-left"
                  >
                    {program}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-poppins font-semibold text-white text-sm mb-5 uppercase tracking-wider">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone size={15} style={{ color: BRAND_COLORS.whatsapp }} className="flex-shrink-0 mt-0.5" />
                <a
                  href={SOCIAL.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  +91 {SOCIAL.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={15} className="text-[#F07A1A] flex-shrink-0 mt-0.5" />
                <a
                  href={`mailto:${SOCIAL.email}`}
                  className="text-sm text-gray-400 hover:text-[#F07A1A] transition-colors break-all"
                >
                  {SOCIAL.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Star size={15} style={{ color: BRAND_COLORS.googleReview }} className="flex-shrink-0 mt-0.5" />
                <a
                  href={SOCIAL.googleReview}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Leave a Google review
                </a>
              </li>
            </ul>

            <a
              href={waLink(waMessage.general())}
              target="_blank"
              rel="noreferrer"
              data-testid="footer-whatsapp-cta"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-transform duration-200 hover:scale-105 hover:shadow-lg font-poppins"
              style={{ background: BRAND_COLORS.whatsapp, boxShadow: `0 8px 24px ${BRAND_COLORS.whatsapp}40` }}
            >
              <MessageCircle size={16} />
              DM on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Royal gold divider */}
      <div className="container-yi relative z-10">
        <GoldDivider className="opacity-80" />
      </div>

      <div className="border-t border-[#F5C118]/15 relative z-10 mt-6">
        <div className="container-yi py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-300/80">
            © {new Date().getFullYear()} Yoga Intelligence. All rights reserved.
          </p>
          <p className="text-xs text-gray-300/80">
            Crafted with care by{" "}
            <span className="yogacharya-highlight-light">Yogacharya Mrityunjay Pandey</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

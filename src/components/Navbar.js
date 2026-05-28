import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, User, Instagram, Youtube, Facebook, MessageCircle, Star } from "lucide-react";
import { SOCIAL, BRAND_COLORS, waLink, waMessage } from "../constants/social";
import BrandLogo from "./BrandLogo";

const socialIcons = [
  { Icon: Instagram, href: SOCIAL.instagram, color: BRAND_COLORS.instagram, label: "Instagram" },
  { Icon: Youtube, href: SOCIAL.youtube, color: BRAND_COLORS.youtube, label: "YouTube" },
  { Icon: Facebook, href: SOCIAL.facebook, color: BRAND_COLORS.facebook, label: "Facebook" },
  { Icon: Star, href: SOCIAL.googleReview, color: BRAND_COLORS.googleReview, label: "Google Review" },
  { Icon: MessageCircle, href: waLink(waMessage.general()), color: BRAND_COLORS.whatsapp, label: "WhatsApp" },
];

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Classes", href: "#classes" },
  { name: "Products", href: "#products" },
  { name: "Lifestyle", href: "#lifestyle" },
  { name: "YoYogi", href: "#yoyogi" },
];

export default function Navbar({ isAuthenticated, authPhone, authName, onLoginClick, onLogout }) {
  const displayName = (authName && authName.trim()) || authPhone;
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll-spy — highlight the nav link for the section currently in view.
  useEffect(() => {
    const ids = navLinks.map((l) => l.href.replace("#", ""));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-[0_6px_24px_rgba(16,24,40,0.08)] border-b border-black/5"
          : "bg-transparent"
      }`}
    >
      <div className="container-yi">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* LEFT — Round logo + orange brand wordmark */}
          <motion.a
            href="#home"
            className="flex items-center gap-3 group flex-shrink-0 min-w-0"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="navbar-brand"
          >
            <BrandLogo size="md" className="group-hover:scale-105" />
            <div className="flex flex-col min-w-0">
              <span className="font-poppins font-black text-base sm:text-lg md:text-xl lg:text-2xl leading-tight text-orange-brand whitespace-nowrap">
                YOGA INTELLIGENCE
              </span>
              <span className="hidden sm:block text-[9px] md:text-[10px] text-[#3A7D2C] font-semibold tracking-wider uppercase whitespace-nowrap">
                By Yogacharya Mrityunjay Pandey
              </span>
            </div>
          </motion.a>

          {/* MIDDLE — Desktop nav with sliding active pill */}
          <div className="hidden lg:flex items-center gap-1 rounded-2xl px-1 py-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace("#", "");
              return (
                <a
                  key={link.name}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 font-poppins ${
                    isActive ? "text-[#3A7D2C]" : "text-[#1A1A1A] hover:text-[#3A7D2C]"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-xl bg-[#3A7D2C]/10 ring-1 ring-[#3A7D2C]/15"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.name}</span>
                </a>
              );
            })}
          </div>

          {/* RIGHT — Native-colored social icons + Auth */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:flex items-center gap-1">
              {socialIcons.map(({ Icon, href, color, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  data-testid={`navbar-social-${label.toLowerCase().replace(" ", "-")}`}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200"
                  style={{ color, background: `${color}14` }}
                >
                  <Icon size={16} strokeWidth={2.2} />
                </motion.a>
              ))}
            </div>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#3A7D2C]/10 max-w-[160px]">
                  <User size={14} className="text-[#3A7D2C] flex-shrink-0" />
                  <span className="text-xs font-semibold text-[#3A7D2C] truncate">{displayName}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-lg text-[#6B7280] hover:text-[#F07A1A] hover:bg-[#F07A1A]/10 transition-colors duration-200"
                  aria-label="Logout"
                  data-testid="navbar-logout-btn"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                data-testid="navbar-login-btn"
                className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3A7D2C] text-white font-bold text-sm hover:bg-[#2F6823] transition-colors duration-200 shadow-lg shadow-[#3A7D2C]/20 font-poppins"
              >
                Login
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="lg:hidden p-2 rounded-lg text-[#1A1A1A] hover:bg-[#3A7D2C]/10 transition-colors"
              aria-label="Toggle menu"
              data-testid="navbar-mobile-toggle"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-black/5 shadow-xl overflow-hidden"
            data-testid="navbar-mobile-menu"
          >
            <div className="container-yi py-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-base font-semibold text-[#1A1A1A] hover:text-[#3A7D2C] hover:bg-[#3A7D2C]/5 transition-colors duration-200 font-poppins"
                >
                  {link.name}
                </a>
              ))}

              {/* Mobile social icons — native colors */}
              <div className="flex items-center justify-center gap-2 pt-4 pb-2 flex-wrap">
                {socialIcons.map(({ Icon, href, color, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-transform duration-200 active:scale-95"
                    style={{ color, background: `${color}15` }}
                  >
                    <Icon size={18} strokeWidth={2.2} />
                  </a>
                ))}
              </div>

              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-3">
                    <User size={16} className="text-[#3A7D2C]" />
                    <span className="text-sm font-semibold text-[#3A7D2C]">{displayName}</span>
                  </div>
                  <button
                    onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-base font-semibold text-[#F07A1A] hover:bg-[#F07A1A]/5 transition-colors duration-200 font-poppins"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { onLoginClick(); setMobileMenuOpen(false); }}
                  className="w-full px-4 py-3 rounded-xl bg-[#3A7D2C] text-white font-bold text-base hover:bg-[#2F6823] transition-colors duration-200 shadow-lg shadow-[#3A7D2C]/20 font-poppins"
                >
                  Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

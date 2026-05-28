import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { IMAGES } from "../constants/social";

/**
 * HeroVideo — autoplay-only cinematic player.
 *
 * The video always autoplays and loops; it cannot be paused or stopped by the
 * user. The ONLY control is mute / unmute. (It pauses automatically when fully
 * off-screen purely to save battery, and resumes the moment it's visible again.)
 */
export default function HeroVideo() {
  const wrapperRef = useRef(null);
  const videoRef = useRef(null);

  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);

  // Responsive source + reduced-motion preference.
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    const onMq = (e) => setReducedMotion(e.matches);
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("resize", checkMobile);
      mq.removeEventListener("change", onMq);
    };
  }, []);

  // Keep it playing whenever it's on screen; pause off-screen to save battery.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.2, 0.5] },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reducedMotion, isReady]);

  // Non-interactive progress indicator (visual only).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => {
      if (video.duration) setProgress((video.currentTime / video.duration) * 100);
    };
    const onReady = () => setIsReady(true);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
    };
  }, []);

  const toggleMute = useCallback((e) => {
    e?.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  }, []);

  return (
    <div
      ref={wrapperRef}
      data-testid="hero-video-frame"
      className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(15,34,18,0.35)] bg-[#0F2212] ring-1 ring-white/10"
    >
      {/* Skeleton until first frame is ready */}
      {!isReady && (
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-[#0F2212] via-[#1A3A1F] to-[#0F2212] flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-[#F07A1A]/30 border-t-[#F07A1A] animate-spin" />
        </div>
      )}

      {/* The video — autoplay, loop, muted; subtle cinematic colour grade */}
      <motion.video
        ref={videoRef}
        data-testid="hero-video"
        className="w-full h-[420px] sm:h-[500px] md:h-[580px] lg:h-[620px] object-cover object-center"
        src={isMobile ? IMAGES.heroVideoMobile : IMAGES.heroVideo}
        poster={IMAGES.heroPoster || IMAGES.hero}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        controlsList="nodownload noplaybackrate nofullscreen"
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: isReady ? 1 : 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          filter: "contrast(1.08) saturate(1.16) brightness(1.03) sepia(0.04) hue-rotate(-4deg)",
          willChange: "transform, opacity",
        }}
        aria-label="Yogacharya Mrityunjay Pandey teaching yoga"
      />

      {/* Cinematic gradient overlays + vignette */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F2212]/70 via-[#0F2212]/15 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#3A7D2C]/15" />
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/35 to-transparent" />
        <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 120px 30px rgba(0,0,0,0.45)" }} />
      </div>

      {/* "In Practice" live badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider shadow-lg pointer-events-none">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#FF4747] opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4747]" />
        </span>
        In Practice
      </div>

      {/* HD chip */}
      <div className="absolute top-4 right-4 z-20 px-2.5 py-1 rounded-md bg-black/45 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider pointer-events-none">
        HD
      </div>

      {/* The ONLY control: mute / unmute */}
      <button
        onClick={toggleMute}
        data-testid="hero-video-mute-toggle"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
        className={`absolute bottom-4 right-4 z-20 flex items-center gap-1.5 px-3 h-10 rounded-full text-white hover:scale-105 active:scale-95 transition-transform duration-200 shadow-lg font-semibold text-[11px] uppercase tracking-wider ring-1 ring-white/20 ${
          isMuted ? "bg-[#F07A1A]" : ""
        }`}
        style={
          isMuted
            ? { boxShadow: "0 8px 24px rgba(240,122,26,0.5)" }
            : { background: "rgba(15,34,18,0.65)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }
        }
      >
        {isMuted ? (
          <>
            <VolumeX size={14} /> Tap for sound
          </>
        ) : (
          <Volume2 size={14} />
        )}
      </button>

      {/* Non-interactive progress line (visual polish only) */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10 z-10 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#F07A1A] to-[#F5C118]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

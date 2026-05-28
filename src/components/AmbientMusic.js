import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music2, VolumeX } from "lucide-react";

/**
 * AmbientMusic — soulful, calming background music played site-wide.
 *
 * Behaviour (respects browser autoplay rules + is never annoying):
 *  - Plays /audio/ambient.mp3 on a gentle loop at a soft volume.
 *  - Browsers block audio-with-sound before a user gesture, so we start it on
 *    the visitor's FIRST interaction (tap/scroll/click) — unless they've turned
 *    it off before (remembered in localStorage).
 *  - A small floating button lets them mute/unmute anytime.
 *  - Pauses when the tab is hidden; fades in/out smoothly.
 *  - If the audio file is missing, the control simply doesn't show (no errors).
 */
const PREF_KEY = "yi_music"; // "on" | "off"
const TARGET_VOLUME = 0.32;

export default function AmbientMusic() {
  const audioRef = useRef(null);
  const fadeRef = useRef(null);
  const [available, setAvailable] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Smoothly ramp the volume up or down.
  const fadeTo = useCallback((target) => {
    const audio = audioRef.current;
    if (!audio) return;
    clearInterval(fadeRef.current);
    fadeRef.current = setInterval(() => {
      const diff = target - audio.volume;
      if (Math.abs(diff) < 0.02) {
        audio.volume = target;
        clearInterval(fadeRef.current);
        if (target === 0) audio.pause();
      } else {
        audio.volume = Math.max(0, Math.min(1, audio.volume + diff * 0.15));
      }
    }, 40);
  }, []);

  const startMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0;
    audio
      .play()
      .then(() => {
        setPlaying(true);
        fadeTo(TARGET_VOLUME);
      })
      .catch(() => {});
  }, [fadeTo]);

  const stopMusic = useCallback(() => {
    setPlaying(false);
    fadeTo(0);
  }, [fadeTo]);

  // Detect whether the audio file is actually present.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onOk = () => setAvailable(true);
    const onErr = () => setAvailable(false);
    // metadata is enough to know the track exists → show the toggle early.
    audio.addEventListener("loadedmetadata", onOk);
    audio.addEventListener("canplay", onOk);
    audio.addEventListener("error", onErr);
    return () => {
      audio.removeEventListener("loadedmetadata", onOk);
      audio.removeEventListener("canplay", onOk);
      audio.removeEventListener("error", onErr);
    };
  }, []);

  // Start on the visitor's first interaction (unless they opted out before).
  useEffect(() => {
    if (localStorage.getItem(PREF_KEY) === "off") return;
    let done = false;
    const kick = () => {
      if (done) return;
      done = true;
      startMusic();
      cleanup();
    };
    const cleanup = () => {
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", kick);
      window.removeEventListener("touchstart", kick);
      window.removeEventListener("scroll", kick);
    };
    window.addEventListener("pointerdown", kick, { once: false });
    window.addEventListener("keydown", kick);
    window.addEventListener("touchstart", kick);
    window.addEventListener("scroll", kick, { passive: true });
    return cleanup;
  }, [startMusic]);

  // Be polite: pause when the tab isn't visible, resume if it was playing.
  useEffect(() => {
    const onVis = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.hidden) {
        audio.pause();
      } else if (playing) {
        audio.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [playing]);

  const toggle = () => {
    if (playing) {
      localStorage.setItem(PREF_KEY, "off");
      stopMusic();
    } else {
      localStorage.setItem(PREF_KEY, "on");
      startMusic();
    }
  };

  return (
    <>
      {/* Loop the track; preload metadata only (keeps page load light, the
          audio then streams on play). */}
      <audio ref={audioRef} src="/audio/ambient.mp3" loop preload="metadata" />

      <AnimatePresence>
        {available && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 18 }}
            onClick={toggle}
            aria-label={playing ? "Turn off background music" : "Play calming background music"}
            data-testid="ambient-music-toggle"
            className="fixed bottom-5 left-5 z-[1000] w-12 h-12 rounded-full flex items-center justify-center shadow-lg ring-1 ring-white/40 transition-transform hover:scale-110 active:scale-95"
            style={{
              background: playing
                ? "linear-gradient(135deg, #3A7D2C, #4CAF50)"
                : "linear-gradient(135deg, #6B7280, #9CA3AF)",
              boxShadow: playing
                ? "0 8px 24px rgba(58,125,44,0.45)"
                : "0 8px 20px rgba(16,24,40,0.25)",
            }}
          >
            {playing ? (
              <span className="relative flex items-center justify-center">
                <Music2 size={20} color="white" />
                {/* gentle pulsing ring while playing */}
                <span className="absolute inset-[-10px] rounded-full border border-white/40 animate-ping" />
              </span>
            ) : (
              <VolumeX size={20} color="white" />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

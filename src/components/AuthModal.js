import { useState, useRef, useEffect } from "react";
import { X, ArrowRight, CheckCircle, RefreshCw } from "lucide-react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { toast } from "sonner";
import { api } from "../lib/api";
import { auth, firebaseConfigured } from "../lib/firebase";
import BrandLogo from "./BrandLogo";

/**
 * AuthModal — phone OTP login powered by Firebase Phone Authentication.
 *
 * Flow:
 *   step 1  name + phone  → Firebase sends the OTP (Google infrastructure)
 *   step 2  enter 6-digit code → Firebase verifies → we get an ID token
 *   step 3  success → our backend validates the token, logs the sign-up, and
 *           returns our long-lived session token (persistent login unchanged)
 *
 * Firebase requires an invisible reCAPTCHA verifier — handled transparently.
 */
export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [step, setStep] = useState(1); // 1 name+phone, 2 otp, 3 success
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const otpRefs = useRef([]);
  const recaptchaRef = useRef(null); // RecaptchaVerifier instance
  const confirmationRef = useRef(null); // Firebase ConfirmationResult

  const nameValid = name.trim().length >= 2;

  // ── Reset state + tear down the reCAPTCHA when the modal closes ──────────
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setStep(1);
        setName("");
        setPhone("");
        setOtp(["", "", "", "", "", ""]);
        setCountdown(0);
        setLoading(false);
        setError("");
        confirmationRef.current = null;
        if (recaptchaRef.current) {
          try { recaptchaRef.current.clear(); } catch { /* noop */ }
          recaptchaRef.current = null;
        }
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── Lazily create a single invisible reCAPTCHA verifier ─────────────────
  const getRecaptcha = () => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
    return recaptchaRef.current;
  };

  const friendlyFirebaseError = (err) => {
    const code = err?.code || "";
    if (code.includes("invalid-phone-number")) return "Please enter a valid 10-digit mobile number.";
    if (code.includes("too-many-requests")) return "Too many attempts. Please wait a few minutes and try again.";
    if (code.includes("invalid-verification-code")) return "Incorrect OTP. Please check and try again.";
    if (code.includes("code-expired")) return "This OTP has expired. Please request a new one.";
    if (code.includes("quota-exceeded")) return "OTP service is busy right now. Please try again shortly.";
    if (code.includes("captcha-check-failed")) return "Verification failed. Please refresh and try again.";
    if (code.includes("network")) return "Network issue. Please check your connection and try again.";
    return err?.message || "Something went wrong. Please try again.";
  };

  // ── Step 1 → send OTP via Firebase ──────────────────────────────────────
  const handleSendOTP = async () => {
    if (phone.length < 10 || !nameValid) return;
    if (!firebaseConfigured) {
      setError("Login is being set up. Please try again shortly or contact us on WhatsApp.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const verifier = getRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, `+91${phone}`, verifier);
      confirmationRef.current = confirmation;

      toast.success("OTP sent! Check your SMS.");
      setStep(2);
      setCountdown(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err) {
      // A failed attempt can poison the reCAPTCHA — reset it so retry works.
      if (recaptchaRef.current) {
        try { recaptchaRef.current.clear(); } catch { /* noop */ }
        recaptchaRef.current = null;
      }
      const msg = friendlyFirebaseError(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    setOtp((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = [...otp];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || "";
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) setTimeout(() => handleVerifyOTP(pasted), 80);
  };

  // ── Step 2 → confirm OTP with Firebase, then log in via our backend ─────
  const handleVerifyOTP = async (override) => {
    const otpString = override || otp.join("");
    if (otpString.length < 6) return;
    if (!confirmationRef.current) {
      setError("Your OTP session expired. Please request a new code.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const cred = await confirmationRef.current.confirm(otpString);
      const idToken = await cred.user.getIdToken();

      // Exchange the verified Firebase token for our own session.
      const data = await api.firebaseLogin(idToken, name.trim());

      setStep(3);
      toast.success("Welcome to Yoga Intelligence");
      setTimeout(
        () => onAuthSuccess(data.phone || `+91${phone}`, data.token, data.name || name.trim()),
        1100,
      );
    } catch (err) {
      const msg = err?.code ? friendlyFirebaseError(err) : err?.message || "Verification failed";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setOtp(["", "", "", "", "", ""]);
    // Fresh reCAPTCHA for a clean resend.
    if (recaptchaRef.current) {
      try { recaptchaRef.current.clear(); } catch { /* noop */ }
      recaptchaRef.current = null;
    }
    await handleSendOTP();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="sm:max-w-md bg-white rounded-3xl shadow-2xl p-0 border-0 overflow-hidden"
        data-testid="auth-modal"
      >
        {/* Decorative gradient strip at top */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#3A7D2C] via-[#F07A1A] to-[#F5C118]" />

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="px-7 sm:px-8 py-8">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <BrandLogo size="xl" />
          </div>

          <DialogTitle className="sr-only">Yoga Intelligence sign in</DialogTitle>
          <DialogDescription className="sr-only">
            Sign in to Yoga Intelligence with your mobile number and a one-time password.
          </DialogDescription>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="font-poppins font-bold text-2xl text-[#1A1A1A] text-center mb-1">
                Welcome to Yoga Intelligence
              </h2>
              <p className="text-[#6B7280] text-sm text-center mb-8">
                Enter your details to continue
              </p>

              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Your Name</label>
                <input
                  data-testid="auth-name-input"
                  type="text"
                  autoComplete="name"
                  maxLength={60}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && document.querySelector('[data-testid="auth-phone-input"]')?.focus()}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-4 py-3 rounded-xl border border-black/10 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F07A1A]/30 focus:border-[#F07A1A]/40 transition-colors"
                />
              </div>

              {/* Mobile */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Mobile Number</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-black/10 bg-gray-50 text-sm font-medium text-[#1A1A1A] flex-shrink-0">
                    <span aria-hidden>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    data-testid="auth-phone-input"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                    placeholder="10-digit number"
                    className="flex-1 px-4 py-3 rounded-xl border border-black/10 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F07A1A]/30 focus:border-[#F07A1A]/40 transition-colors"
                  />
                </div>
              </div>

              <button
                data-testid="auth-send-otp-button"
                onClick={handleSendOTP}
                disabled={phone.length < 10 || !nameValid || loading}
                className="w-full py-4 rounded-xl bg-[#F07A1A] text-white font-semibold text-sm hover:bg-[#E56F12] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-poppins flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : (<>Send OTP <ArrowRight size={16} /></>)}
              </button>

              <p className="text-xs text-[#9CA3AF] text-center mt-4">
                By continuing you agree to our Terms of Use and Privacy Policy.
              </p>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-poppins font-bold text-2xl text-[#1A1A1A] text-center mb-1">
                Verify Your Number
              </h2>
              <p className="text-[#6B7280] text-sm text-center mb-8">
                Enter the 6-digit OTP sent to{" "}
                <span className="font-semibold text-[#1A1A1A]">+91 {phone}</span>
              </p>

              <div className="flex gap-2 justify-center mb-6" data-testid="auth-otp-input">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste}
                    className="w-11 h-12 text-center text-lg font-bold rounded-xl border-2 border-black/10 text-[#1A1A1A] focus:outline-none focus:border-[#F07A1A] focus:ring-1 focus:ring-[#F07A1A]/30 transition-colors"
                  />
                ))}
              </div>

              <button
                data-testid="auth-verify-otp-button"
                onClick={() => handleVerifyOTP()}
                disabled={otp.join("").length < 6 || loading}
                className="w-full py-4 rounded-xl bg-[#F07A1A] text-white font-semibold text-sm hover:bg-[#E56F12] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-poppins flex items-center justify-center gap-2 mb-4"
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : "Verify & Continue"}
              </button>

              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleResendOTP}
                  disabled={countdown > 0}
                  className={`text-sm font-medium ${
                    countdown > 0 ? "text-[#9CA3AF] cursor-not-allowed" : "text-[#F07A1A] hover:text-[#E56F12]"
                  } transition-colors`}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                >
                  ← Change number
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-[#3A7D2C]/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-[#3A7D2C]" />
              </div>
              <h2 className="font-poppins font-bold text-2xl text-[#1A1A1A] mb-2">Welcome!</h2>
              <p className="text-[#6B7280] text-sm">
                You're now logged in. YoYogi is ready to guide you.
              </p>
            </div>
          )}

          {/* Invisible reCAPTCHA mount point (required by Firebase Phone Auth) */}
          <div id="recaptcha-container" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

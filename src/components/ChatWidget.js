import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Copy,
  Check,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "../lib/api";

// ── YoYogi welcome message ─────────────────────────────────────────────────
const WELCOME_TEXT =
  "**Namaste \u{1F64F}** I'm YoYogi — your personal yoga, Ayurveda & wellness guide, channeling the wisdom of *Yogacharya Mrityunjay Pandey*.\n\nAsk me about:\n- Asanas, sequences & alignment\n- Pranayama & meditation\n- Ayurvedic remedies & nutrition\n- Lifestyle, stress, sleep & more";

const WELCOME_MESSAGE = {
  id: "welcome",
  sender: "bot",
  text: WELCOME_TEXT,
  at: Date.now(),
};

// ── YoYogi avatar (round gradient w/ live pulse) ───────────────────────────
function YoYogiAvatar({ size = 32, pulse = false }) {
  return (
    <div className="relative flex-shrink-0">
      <div
        className="rounded-full bg-gradient-to-br from-[#3A7D2C] via-[#4CAF50] to-[#66BB6A] flex items-center justify-center text-white shadow-md ring-2 ring-white"
        style={{ width: size, height: size }}
      >
        <Sparkles size={Math.round(size * 0.42)} strokeWidth={2.4} />
      </div>
      {pulse && (
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#4CAF50] rounded-full border-2 border-white">
          <span className="absolute inset-0 rounded-full bg-[#4CAF50] animate-ping opacity-60" />
        </span>
      )}
    </div>
  );
}

// ── Minimal safe markdown rendering ─────────────────────────────────────────
// Handles: **bold**, *italic*, _italic_, `code`, line breaks, bulleted/numbered
// lists. Everything else is text. We escape HTML first so user/model can't
// inject markup.
const escapeHtml = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function renderInline(text) {
  // Order matters: bold (** **) before italic (* *).
  return text
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-black/5 text-[12px] font-mono">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[#0F2212]">$1</strong>')
    .replace(/(^|\s)\*(?!\s)([^*]+?)\*(?=\s|$|[.,!?;:])/g, '$1<em class="italic">$2</em>')
    .replace(/(^|\s)_(?!\s)([^_]+?)_(?=\s|$|[.,!?;:])/g, '$1<em class="italic">$2</em>');
}

function markdownToHtml(text) {
  const safe = escapeHtml(text);
  const lines = safe.split("\n");
  const blocks = [];
  let listType = null; // "ul" | "ol" | null
  let listItems = [];
  let para = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push(`<p class="mb-2 last:mb-0">${renderInline(para.join(" "))}</p>`);
      para = [];
    }
  };
  const flushList = () => {
    if (listType && listItems.length) {
      const tag = listType;
      const cls =
        tag === "ul"
          ? "list-disc pl-5 space-y-1 mb-2"
          : "list-decimal pl-5 space-y-1 mb-2";
      blocks.push(`<${tag} class="${cls}">${listItems.map((li) => `<li>${renderInline(li)}</li>`).join("")}</${tag}>`);
      listType = null;
      listItems = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    const ulMatch = line.match(/^[-•*]\s+(.*)$/);
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (ulMatch) {
      flushPara();
      if (listType !== "ul") flushList();
      listType = "ul";
      listItems.push(ulMatch[1]);
    } else if (olMatch) {
      flushPara();
      if (listType !== "ol") flushList();
      listType = "ol";
      listItems.push(olMatch[2]);
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return blocks.join("");
}

// ── A single chat message ──────────────────────────────────────────────────
function ChatMessage({ msg, onCopy, copiedId }) {
  const isUser = msg.sender === "user";
  const html = useMemo(
    () => (isUser ? null : markdownToHtml(msg.text)),
    [msg.text, isUser],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`group flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && <YoYogiAvatar size={28} />}
      <div className={`flex flex-col max-w-[82%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={[
            "px-4 py-2.5 text-[14px] leading-relaxed break-words",
            isUser
              ? "bg-gradient-to-br from-[#F07A1A] to-[#FF9438] text-white rounded-2xl rounded-br-md shadow-md whitespace-pre-wrap"
              : msg.isError
                ? "bg-red-50 text-red-800 border border-red-200 rounded-2xl rounded-bl-md whitespace-pre-wrap"
                : "bg-white text-[#1A1A1A] border border-black/5 shadow-sm rounded-2xl rounded-bl-md prose-yi",
          ].join(" ")}
        >
          {isUser ? msg.text : <span dangerouslySetInnerHTML={{ __html: html }} />}
        </div>
        <div className={`flex items-center gap-2 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? "flex-row-reverse" : ""}`}>
          <span className="text-[10px] text-gray-400 font-medium tabular-nums">
            {formatTime(msg.at)}
          </span>
          {!isUser && msg.id !== "welcome" && (
            <button
              onClick={() => onCopy(msg.id, msg.text)}
              aria-label="Copy reply"
              className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-[#F07A1A] transition-colors"
            >
              {copiedId === msg.id ? (
                <>
                  <Check size={11} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={11} />
                  Copy
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

// ── Main ChatWidget ────────────────────────────────────────────────────────
export default function ChatWidget({ isAuthenticated, onLoginClick, prefillInput = "", onClearPrefill }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const abortRef = useRef(null);

  // Stable ref to onClearPrefill so the prefill effect can depend only on the input value.
  const onClearPrefillRef = useRef(onClearPrefill);
  useEffect(() => {
    onClearPrefillRef.current = onClearPrefill;
  }, [onClearPrefill]);

  useEffect(() => {
    if (prefillInput) {
      setInput(prefillInput);
      textareaRef.current?.focus();
      onClearPrefillRef.current?.();
    }
  }, [prefillInput]);

  // Auto-scroll on new message / while thinking.
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  // Track scroll to show / hide the scroll-to-bottom FAB.
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollDown(distance > 80);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-resize textarea up to a cap.
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [input]);

  // Abort any in-flight request on unmount.
  useEffect(() => () => abortRef.current?.abort(), []);

  const handleSend = useCallback(
    async (overrideText) => {
      const trimmed = (overrideText ?? input).trim();
      if (!trimmed || isThinking || !isAuthenticated) return;

      const userMsg = { id: `u-${Date.now()}`, sender: "user", text: trimmed, at: Date.now() };
      const conversation = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }));
      conversation.push({ role: "user", content: trimmed });

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsThinking(true);

      abortRef.current = new AbortController();

      try {
        const data = await api.chat(conversation, sessionId, abortRef.current.signal);
        if (data.session_id && !sessionId) setSessionId(data.session_id);
        setMessages((prev) => [
          ...prev,
          { id: `b-${Date.now()}`, sender: "bot", text: data.message, at: Date.now() },
        ]);
      } catch (err) {
        if (err.name === "AbortError") return;
        const friendly =
          err instanceof ApiError && err.status === 401
            ? "Your session expired. Please log in again."
            : err.message || "Something went wrong.";
        toast.error(`YoYogi: ${friendly}`);
        setMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            sender: "bot",
            isError: true,
            text: "I had trouble connecting just now. Please try again in a moment \u{1F64F}",
            at: Date.now(),
          },
        ]);
      } finally {
        setIsThinking(false);
      }
    },
    [input, isThinking, isAuthenticated, messages, sessionId],
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1400);
    } catch {
      toast.error("Couldn't copy — your browser blocked clipboard access.");
    }
  };

  const scrollToBottom = () => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  const handleReset = () => {
    if (isThinking) return;
    setMessages([WELCOME_MESSAGE]);
    setSessionId(null);
    setInput("");
    textareaRef.current?.focus();
  };

  const hasUserMessages = messages.some((m) => m.sender === "user");

  return (
    <div
      className="relative rounded-3xl bg-white border border-black/5 shadow-[0_24px_70px_rgba(58,125,44,0.10)] overflow-hidden"
      data-testid="yoyogi-chat-widget"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-black/5 bg-gradient-to-br from-white via-[#FCFEF9] to-white">
        <YoYogiAvatar size={40} pulse />
        <div className="flex-1 min-w-0">
          <div className="font-poppins font-bold text-sm text-[#1A1A1A]">YoYogi</div>
          <div className="flex items-center gap-1.5 text-xs text-[#3A7D2C] font-medium">
            <span className="w-1.5 h-1.5 bg-[#3A7D2C] rounded-full animate-pulse" />
            Your personal wellness guide · Online
          </div>
        </div>
        {hasUserMessages && (
          <button
            onClick={handleReset}
            aria-label="Start new conversation"
            data-testid="yoyogi-reset"
            className="flex items-center gap-1.5 px-3 h-8 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#F07A1A] hover:bg-[#F07A1A]/10 border border-black/10 transition-colors"
          >
            <RotateCcw size={11} />
            New
          </button>
        )}
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#F07A1A] bg-[#F07A1A]/10 px-3 py-1 rounded-full border border-[#F07A1A]/20">
          <ShieldCheck size={11} />
          AI Wellness Guide
        </div>
      </div>

      {/* Ephemeral notice — chat is private and never stored */}
      <div
        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#FFF8EE] border-b border-[#F0E0C8] text-[10px] sm:text-[11px] text-[#9A6B1E] font-medium"
        data-testid="yoyogi-ephemeral-notice"
      >
        <Lock size={11} className="flex-shrink-0" />
        This chat is private &amp; never saved — it disappears when you close the site.
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="relative h-[26rem] sm:h-[28rem] overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-[#F8FBF6]/80 via-white to-white scroll-smooth"
        data-testid="yoyogi-messages"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} msg={msg} onCopy={handleCopy} copiedId={copiedId} />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isThinking && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="flex items-end gap-2"
              data-testid="yoyogi-typing"
            >
              <YoYogiAvatar size={28} />
              <div className="bg-white border border-black/5 shadow-sm rounded-2xl rounded-bl-md px-4 py-3 flex items-center">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll-to-bottom FAB */}
        <AnimatePresence>
          {showScrollDown && (
            <motion.button
              key="scroll-bottom"
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              onClick={scrollToBottom}
              aria-label="Scroll to latest"
              className="sticky bottom-2 ml-auto w-9 h-9 rounded-full bg-white shadow-lg ring-1 ring-black/10 flex items-center justify-center text-[#F07A1A] hover:scale-110 active:scale-95 transition-transform"
            >
              <ChevronDown size={16} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="px-4 py-4 bg-white border-t border-black/5">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            data-testid="yoyogi-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isAuthenticated ? "Ask about yoga, Ayurveda, wellness…" : "Login to chat with YoYogi"}
            rows={1}
            disabled={!isAuthenticated || isThinking}
            className="flex-1 resize-none rounded-xl border border-black/10 px-4 py-3 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F07A1A]/30 focus:border-[#F07A1A]/40 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
            style={{ minHeight: "44px", maxHeight: "120px" }}
            aria-label="Ask YoYogi"
          />
          <button
            data-testid="yoyogi-send-button"
            onClick={() => handleSend()}
            disabled={!isAuthenticated || !input.trim() || isThinking}
            aria-label="Send message"
            className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#F07A1A] to-[#FF9438] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-orange-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          YoYogi answers only health, yoga &amp; lifestyle questions. Always consult a qualified doctor for medical conditions.
        </p>
      </div>

      {/* Auth gate overlay */}
      {!isAuthenticated && (
        <div
          data-testid="yoyogi-login-overlay"
          className="absolute inset-0 flex items-center justify-center"
          style={{ backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", background: "rgba(255,255,255,0.86)" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="text-center px-8 py-10 max-w-xs"
          >
            <div className="w-14 h-14 rounded-full bg-[#F07A1A]/10 flex items-center justify-center mx-auto mb-5 ring-1 ring-[#F07A1A]/30">
              <Lock size={22} className="text-[#F07A1A]" />
            </div>
            <h3 className="font-poppins font-bold text-xl text-[#1A1A1A] mb-2">
              Login to chat with YoYogi
            </h3>
            <p className="text-sm text-[#6B7280] mb-6">
              Verify your phone via OTP to unlock your AI wellness companion.
            </p>
            <button
              onClick={onLoginClick}
              data-testid="yoyogi-login-cta"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-[#F07A1A] to-[#FF9438] text-white font-semibold text-sm hover:scale-105 active:scale-95 transition-transform font-poppins shadow-lg shadow-orange-200"
            >
              Login / Register
              <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

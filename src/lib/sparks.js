const COLORS = ["#FFD24A", "#FF9A1F", "#FF5A3C", "#FFE9A8", "#F5C118"];

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Small golden spark burst at viewport coords (x, y). Pure DOM, self-cleaning.
export function burstSparks(x, y, count = 9, reach = 1) {
  if (reduced()) return;
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    const a = (Math.PI * 2 * i) / count + Math.random() * 0.6;
    const d = (22 + Math.random() * 38) * reach;
    const c = COLORS[i % COLORS.length];
    s.className = "spark";
    s.style.cssText =
      `left:${x}px;top:${y}px;background:${c};box-shadow:0 0 8px ${c};` +
      `--dx:${(Math.cos(a) * d).toFixed(1)}px;--dy:${(Math.sin(a) * d).toFixed(1)}px`;
    s.addEventListener("animationend", () => s.remove());
    document.body.appendChild(s);
  }
}

// Festive layer is date-driven: it switches itself on/off, no code change needed.
// To theme another festival (Holi, Navratri, ...) just edit this block.
export const FESTIVAL = {
  name: "Diwali",
  greeting: "Shubh Deepawali",
  date: "2026-11-08", // Lakshmi Puja
  showFrom: "2026-10-18",
  showUntil: "2026-11-14",
};

const day = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export function getFestiveState(now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const active = today >= day(FESTIVAL.showFrom) && today <= day(FESTIVAL.showUntil);
  const daysToGo = Math.round((day(FESTIVAL.date) - today) / 86400000);
  return { active, daysToGo, isToday: daysToGo === 0, isPast: daysToGo < 0 };
}

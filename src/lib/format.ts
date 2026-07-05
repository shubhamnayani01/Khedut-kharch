export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);
  const abs = Math.abs(rounded);
  const str = abs.toLocaleString("en-IN");
  return `${rounded < 0 ? "-" : ""}₹${str}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-IN");
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function formatDateDMY(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

const GU_MONTHS = [
  "જાન્યુઆરી", "ફેબ્રુઆરી", "માર્ચ", "એપ્રિલ", "મે", "જૂન",
  "જુલાઈ", "ઓગસ્ટ", "સપ્ટેમ્બર", "ઓક્ટોબર", "નવેમ્બર", "ડિસેમ્બર",
];

export function formatDateLong(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return formatDateDMY(iso);
  return `${d.getDate()} ${GU_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function daysSince(iso: string): number {
  if (!iso) return 0;
  const start = new Date(iso + "T00:00:00").getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  return diff < 0 ? 0 : diff;
}

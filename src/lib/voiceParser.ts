import type { ExpenseCategory } from "../types";
import { EXPENSE_CATEGORIES } from "../types";

// Gujarati digits to Arabic digits mapping
const GUJARATI_DIGITS: Record<string, string> = {
  "૦": "0",
  "૧": "1",
  "૨": "2",
  "૩": "3",
  "૪": "4",
  "૫": "5",
  "૬": "6",
  "૭": "7",
  "૮": "8",
  "૯": "9",
};

export interface ParsedVoiceExpense {
  rawTranscript: string;
  amount?: number;
  category?: ExpenseCategory;
  description: string;
  matchedCategoryLabel?: string;
}


export function normalizeGujaratiDigits(text: string): string {
  return text.replace(/[૦-૯]/g, (ch) => GUJARATI_DIGITS[ch] || ch);
}

const CATEGORY_KEYWORDS: Record<ExpenseCategory, string[]> = {
  fertilizer: [
    // Gujarati
    "ખાતર", "યુરિયા", "ડીએપી", "પોટાશ", "સુપર", "ખાતરિયું",
    "દેશી ખાતર", "છાણીયું", "ખાતરિયા", "એનપીકે",
    // English / Hinglish
    "fertilizer", "urea", "dap", "npk", "potash", "compost",
    "manure", "khatar", "khaad", "superphosphate",
  ],
  pesticide: [
    // Gujarati
    "દવા", "જંતુનાશક", "કીટનાશક", "સ્પ્રે", "ફૂગનાશક",
    "નીંદણનાશક", "પાવડર", "છંટકાવ", "દવાનો",
    // English / Hinglish
    "pesticide", "insecticide", "fungicide", "herbicide", "weedicide",
    "spray", "chemical", "dawa", "powder", "medicine",
  ],
  seed: [
    // Gujarati
    "બિયારણ", "બીજ", "દાણા", "રોપા", "કલમ", "ધરૂ", "વાવેતર માટે બી",
    // English / Hinglish
    "seed", "seeds", "biyaran", "beej", "sapling", "seedling",
    "plants", "ropa",
  ],
  diesel: [
    // Gujarati
    "ડીઝલ", "ડીજલ", "ઓઇલ", "ઓઈલ", "પેટ્રોલ", "ટ્રેક્ટર ડીઝલ",
    // English / Hinglish
    "diesel", "petrol", "fuel", "oil", "tractor diesel", "dizel",
    "petrol pump", "gas",
  ],
  labor: [
    // Gujarati
    "મજૂર", "મજૂરી", "મજુર", "મજુરી", "લેબર", "કાપણી મજૂરી",
    "નિંદામણ મજૂરી", "ઉપાડ", "રોજ", "હાજરી", "દિહાડી",
    // English / Hinglish
    "labor", "labour", "worker", "workers", "wages", "majur",
    "majuri", "mazduri", "kaam", "daily wage", "harvesting",
    "cutting", "weeding", "picking",
  ],
  irrigation: [
    // Gujarati
    "પાણી", "સિંચાઈ", "સિંચાઇ", "પીયત", "પિયત", "બોરિંગ",
    "પાઇપ", "પાઈપ", "ડ્રિપ", "ફુવારા",
    // English / Hinglish
    "irrigation", "water", "watering", "drip", "sprinkler",
    "boring", "pump", "pipeline", "pani", "sinchai",
  ],
  transport: [
    // Gujarati
    "ભાડું ટેમ્પો", "ટેમ્પો", "ટ્રક", "ટ્રાન્સપોર્ટ", "પરિવહન",
    "ગાડી ભાડું", "રિક્ષા ભાડું",
    // English / Hinglish
    "transport", "transportation", "truck", "vehicle", "tempo",
    "lorry", "freight", "delivery", "gaadi", "bhaadu", "bhada",
    "rickshaw", "tractor rent",
  ],
  rent: [
    // Gujarati
    "ભાડું", "જમીન ભાડું", "ટ્રેક્ટર ભાડું", "થેસર ભાડું", "મશીન ભાડું",
    // English / Hinglish
    "rent", "land rent", "machine rent", "tractor rent", "thresher",
    "lease", "kiraaya", "bhadu", "jameen bhadu",
  ],
  electricity: [
    // Gujarati
    "લાઈટ બિલ", "લાઇટ બિલ", "વીજળી", "વીજળી બિલ", "ડીપી બિલ", "પાવર બિલ",
    // English / Hinglish
    "electricity", "electric", "power", "light bill", "current bill",
    "dp bill", "energy", "bijli", "bijlee", "light", "wiring",
  ],
  other: [
    // Gujarati
    "અન્ય", "પરચૂરણ", "ખર્ચ",
    // English / Hinglish
    "other", "miscellaneous", "misc", "general", "anya", "kharcha",
  ],
};

/**
 * Extracts numeric amount from spoken Gujarati or English transcript.
 * Recognizes patterns like:
 * - "1500 રૂપિયા", "₹1500", "1500 rs", "૧૫૦૦"
 * - Multipliers like: "2 હજાર" -> 2000, "દોઢ હજાર" -> 1500, etc.
 */
export function extractAmount(normalizedText: string): number | undefined {
  // 1. Direct patterns with words: e.g. "૨ હજાર" or "5 હજાર"
  const thousandMatch = normalizedText.match(/(\d+(?:\.\d+)?)\s*(?:હજાર|thousand|k\b)/i);
  if (thousandMatch) {
    const val = parseFloat(thousandMatch[1]);
    if (!isNaN(val) && val > 0) return Math.round(val * 1000);
  }

  // Common spoken phrases
  if (/\b(?:દોઢ\s*હજાર|દોઢસો\s*રૂપિયા)\b/i.test(normalizedText)) {
    return 1500;
  }
  if (/\b(?:અઢી\s*હજાર)\b/i.test(normalizedText)) {
    return 2500;
  }
  if (/\b(?:એક\s*હજાર)\b/i.test(normalizedText)) {
    return 1000;
  }
  if (/\b(?:બે\s*હજાર)\b/i.test(normalizedText)) {
    return 2000;
  }
  if (/\b(?:પાંચ\s*સો|૫૦૦)\b/i.test(normalizedText)) {
    return 500;
  }

  // 2. Numbers followed or preceded by currency words: e.g. "1500 રૂપિયા", "રૂપિયા 1500", "₹ 1500", "1500 રૂ"
  const rupeePattern = /(?:રૂપિયા|રૂ\.|રૂ|₹|rs\.?|inr)\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:રૂપિયા|રૂ\.|રૂ|₹|rs\.?|inr)/i;
  const rupeeMatch = normalizedText.match(rupeePattern);
  if (rupeeMatch) {
    const numStr = rupeeMatch[1] || rupeeMatch[2];
    const val = parseFloat(numStr);
    if (!isNaN(val) && val > 0) return Math.round(val);
  }

  // 3. Fallback: Find any standalone numbers (e.g. "ખાતર 1200")
  const allNumbers = normalizedText.match(/\b\d+(?:\.\d+)?\b/g);
  if (allNumbers && allNumbers.length > 0) {
    // If multiple numbers, usually the larger one is amount or the last one (e.g., "2 બોરી 1400" -> 1400)
    const nums = allNumbers.map(n => parseFloat(n)).filter(n => !isNaN(n) && n > 0);
    // Find number >= 50 or the maximum
    const likelyAmount = nums.find(n => n >= 50) || nums[nums.length - 1];
    if (likelyAmount) return Math.round(likelyAmount);
  }

  return undefined;
}

/**
 * Detects expense category based on spoken keywords.
 */
export function detectCategory(text: string): { category?: ExpenseCategory; label?: string } {
  const lower = text.toLowerCase();

  // Check specific categories first (more specific matches)
  const priorityOrder: ExpenseCategory[] = [
    "fertilizer",
    "pesticide",
    "seed",
    "diesel",
    "electricity",
    "transport",
    "labor",
    "irrigation",
    "rent",
    "other",
  ];

  for (const cat of priorityOrder) {
    const keywords = CATEGORY_KEYWORDS[cat];
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        const catInfo = EXPENSE_CATEGORIES.find((c) => c.id === cat);
        return { category: cat, label: catInfo?.label };
      }
    }
  }

  return {};
}

/**
 * Parses full spoken text into an expense proposal.
 */
export function parseVoiceExpense(rawTranscript: string): ParsedVoiceExpense {
  const cleanRaw = rawTranscript.trim();
  const normalized = normalizeGujaratiDigits(cleanRaw);

  const amount = extractAmount(normalized);
  const { category, label } = detectCategory(normalized);

  // Clean description: format nicely, removing trailing "રૂપિયા" if isolated
  let description = cleanRaw;

  return {
    rawTranscript: cleanRaw,
    amount,
    category,
    matchedCategoryLabel: label,
    description,
  };
}

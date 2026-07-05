export type ExpenseCategory =
  | "seed"
  | "fertilizer"
  | "pesticide"
  | "diesel"
  | "labor"
  | "irrigation"
  | "transport"
  | "rent"
  | "electricity"
  | "other";

export const EXPENSE_CATEGORIES: { id: ExpenseCategory; label: string }[] = [
  { id: "seed", label: "બીજ" },
  { id: "fertilizer", label: "ખાતર" },
  { id: "pesticide", label: "જંતુનાશક દવા" },
  { id: "diesel", label: "ડીઝલ" },
  { id: "labor", label: "મજૂરી" },
  { id: "irrigation", label: "સિંચાઈ" },
  { id: "transport", label: "પરિવહન" },
  { id: "rent", label: "ભાડું" },
  { id: "electricity", label: "વીજળી" },
  { id: "other", label: "અન્ય" },
];

export interface Expense {
  id: string;
  seasonId: string;
  date: string; // ISO yyyy-mm-dd
  category: ExpenseCategory;
  amount: number;
  description?: string;
  billPhoto?: string; // base64 data URL, compressed
  createdAt: number;
  updatedAt: number;
}

export type SeasonStatus = "active" | "harvested";

export interface Harvest {
  harvestDate: string; // ISO yyyy-mm-dd
  totalProductionKg: number;
  sellingPricePerKg: number;
  otherIncome: number;
}

export interface FarmingSeason {
  id: string;
  cropName: string;
  fieldName: string;
  areaBigha?: number;
  areaLabel?: string;
  sowingDate: string; // ISO yyyy-mm-dd
  notes?: string;
  colorTag: string; // key into CROP_COLORS
  status: SeasonStatus;
  harvest?: Harvest;
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  onboardingSeen: boolean;
}

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  seasons: FarmingSeason[];
  expenses: Expense[];
  settings: AppSettings;
}

export const CROP_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  crop: { bg: "var(--color-crop-100)", text: "var(--color-crop-700)", dot: "var(--color-crop-500)" },
  saffron: { bg: "var(--color-saffron-100)", text: "var(--color-saffron-600)", dot: "var(--color-saffron-500)" },
  soil: { bg: "var(--color-soil-100)", text: "var(--color-soil-600)", dot: "var(--color-soil-500)" },
};

export const COLOR_TAG_KEYS = ["crop", "saffron", "soil"] as const;

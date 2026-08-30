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

export type WorkType = "નિંદામણ" | "કાપણી" | "વાવેતર" | "દવા છંટકાવ" | "ખાતર આપવું" | "સિંચાઈ" | "અન્ય";

export interface WorkerRecord {
  id: string;
  seasonId: string;
  date: string; // ISO yyyy-mm-dd
  workersCount: number;
  workType: WorkType;
  dailyWage: number;
  total: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface BhaagidarProfile {
  id: string;
  seasonId: string;
  name: string;
  mobile?: string;
  sharePercentage: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AdvanceLedger {
  id: string;
  bhaagidarId: string;
  seasonId: string;
  date: string; // ISO yyyy-mm-dd
  amount: number;
  type: "credit" | "debit"; // debit = money given, credit = money returned
  note?: string;
  createdAt: number;
  updatedAt: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: ExpenseCategory;
  totalQuantity: number;
  unit: string;
  totalCost: number;
  datePurchased: string; // ISO yyyy-mm-dd
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Expense {
  id: string;
  seasonId: string;
  date: string; // ISO yyyy-mm-dd
  category: ExpenseCategory;
  amount: number;
  description?: string;
  billPhoto?: string; // base64 data URL, compressed
  inventoryItemId?: string;
  inventoryQuantityUsed?: number;
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
  language?: "gu" | "en" | "hi";
  activeSeasonId?: string;
}

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  seasons: FarmingSeason[];
  expenses: Expense[];
  workers: WorkerRecord[];
  bhaagidars: BhaagidarProfile[];
  advanceLedgers: AdvanceLedger[];
  inventoryItems: InventoryItem[];
  settings: AppSettings;
}

export const CROP_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  crop: { bg: "var(--color-crop-100)", text: "var(--color-crop-700)", dot: "var(--color-crop-500)" },
  saffron: { bg: "var(--color-saffron-100)", text: "var(--color-saffron-600)", dot: "var(--color-saffron-500)" },
  soil: { bg: "var(--color-soil-100)", text: "var(--color-soil-600)", dot: "var(--color-soil-500)" },
};

export const COLOR_TAG_KEYS = ["crop", "saffron", "soil"] as const;

// ─── Documents ────────────────────────────────────────────────────────────────

export type DocumentCategory =
  | "Aadhaar"
  | "PAN"
  | "Land Records"
  | "Soil Health Card"
  | "Crop Insurance"
  | "Farmer ID"
  | "Loan Documents"
  | "Purchase Bills"
  | "Sale Receipts"
  | "Other";

export interface UserDocument {
  id: string;
  uid: string;
  name: string;
  category: DocumentCategory;
  size: number;       // bytes
  fileType: string;   // e.g. "image/jpeg", "application/pdf"
  base64Data: string; // full data URL: "data:<mime>;base64,..."
  createdAt: number;  // ms since epoch
}

// ─── Membership ───────────────────────────────────────────────────────────────

export const ADMIN_EMAIL = "shubhamnayani01@gmail.com";

export type MembershipStatus = "Pending" | "Active" | "Expired" | "Rejected" | "Banned";

// ─── Donation ─────────────────────────────────────────────────────────────────

export type DonationStatus = "Skipped" | "Pending" | "Approved" | "Rejected";

export interface DonationRecord {
  donationId: string;
  uid: string;
  transactionId: string;
  screenshotUrl: string;
  note?: string;
  status: DonationStatus;
  createdAt: number;
}

export interface UserMembership {
  membershipStatus: MembershipStatus;
  membershipType: "Annual";
  membershipAmount: 300;
  paymentProof?: string;         // Firebase Storage download URL
  paymentMethod?: string;
  paymentReference?: string;
  paymentSubmittedAt?: number;   // timestamp ms
  membershipStartedAt?: number;
  membershipExpiresAt?: number;
  membershipApprovedAt?: number;
  approvedBy?: string;
  renewalCount: number;
  donationStatus?: DonationStatus; // lightweight mirror of latest donation status
}


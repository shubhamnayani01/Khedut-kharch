export type ProductCategory =
  | "Fertilizers"
  | "Pesticides"
  | "Fungicides"
  | "Herbicides"
  | "Micronutrients"
  | "Growth Regulators";

export type CompatibilityStatus = "Compatible" | "Use Separately" | "Do Not Mix";

export interface CompatibilityResult {
  status: CompatibilityStatus;
  warnings: string[];
  conflicts: string[];
}

const CATEGORY_NAMES: Record<ProductCategory, string> = {
  Fertilizers: "ખાતર",
  Pesticides: "જંતુનાશક દવા",
  Fungicides: "ફૂગનાશક દવા",
  Herbicides: "નીંદણનાશક",
  Micronutrients: "માઇક્રોન્યુટ્રિઅન્ટ્સ",
  "Growth Regulators": "ગ્રોથ રેગ્યુલેટર્સ",
};

export const PRODUCT_CATEGORIES = Object.keys(CATEGORY_NAMES) as ProductCategory[];

export function getCategoryName(cat: ProductCategory): string {
  return CATEGORY_NAMES[cat];
}

// Matrix mapping [cat1][cat2] to CompatibilityStatus
// 0 = Compatible, 1 = Use Separately (Caution), 2 = Do Not Mix
const rulesMatrix: Record<ProductCategory, Record<ProductCategory, number>> = {
  Fertilizers: {
    Fertilizers: 0,
    Pesticides: 1,
    Fungicides: 0,
    Herbicides: 2,
    Micronutrients: 0,
    "Growth Regulators": 1,
  },
  Pesticides: {
    Fertilizers: 1,
    Pesticides: 0,
    Fungicides: 0,
    Herbicides: 2,
    Micronutrients: 1,
    "Growth Regulators": 2,
  },
  Fungicides: {
    Fertilizers: 0,
    Pesticides: 0,
    Fungicides: 0,
    Herbicides: 2,
    Micronutrients: 1,
    "Growth Regulators": 2,
  },
  Herbicides: {
    Fertilizers: 2,
    Pesticides: 2,
    Fungicides: 2,
    Herbicides: 2, // Mixing multiple herbicides can be very dangerous without exact knowledge
    Micronutrients: 2,
    "Growth Regulators": 2,
  },
  Micronutrients: {
    Fertilizers: 0,
    Pesticides: 1,
    Fungicides: 1,
    Herbicides: 2,
    Micronutrients: 0,
    "Growth Regulators": 2,
  },
  "Growth Regulators": {
    Fertilizers: 1,
    Pesticides: 2,
    Fungicides: 2,
    Herbicides: 2,
    Micronutrients: 2,
    "Growth Regulators": 2,
  },
};

export function checkCompatibility(products: ProductCategory[]): CompatibilityResult {
  if (products.length < 2) {
    return {
      status: "Compatible",
      warnings: ["માહિતી ચકાસવા માટે ઓછામાં ઓછા ૨ ઉત્પાદનો પસંદ કરો."],
      conflicts: [],
    };
  }

  let worstStatus = 0;
  const conflicts: Set<string> = new Set();
  const warnings: Set<string> = new Set();

  for (let i = 0; i < products.length; i++) {
    for (let j = i + 1; j < products.length; j++) {
      const c1 = products[i];
      const c2 = products[j];
      const relation = rulesMatrix[c1][c2];

      if (relation > worstStatus) {
        worstStatus = relation;
      }

      if (relation === 1) {
        conflicts.add(`${CATEGORY_NAMES[c1]} અને ${CATEGORY_NAMES[c2]}`);
        warnings.add("સામાન્ય રીતે મિશ્રણ કરી શકાય, પરંતુ એક નાના વાસણમાં પહેલા ચેક કરો (Jar Test).");
      } else if (relation === 2) {
        conflicts.add(`${CATEGORY_NAMES[c1]} અને ${CATEGORY_NAMES[c2]}`);
        warnings.add("આ બંનેને સાથે મિશ્રણ કરવાથી પાકને નુકસાન થઈ શકે છે અથવા દવાની અસર ઓછી થઈ શકે છે.");
      }
    }
  }

  // Specific general rules
  if (products.includes("Herbicides")) {
    warnings.add("નીંદણનાશક દવાનો હંમેશા અલગથી જ છંટકાવ કરવો જોઈએ.");
  }
  if (products.length > 3) {
    warnings.add("૩ થી વધુ પ્રકારની દવાઓનું મિશ્રણ કરવાનું ટાળો.");
    if (worstStatus === 0) worstStatus = 1;
  }

  let finalStatus: CompatibilityStatus = "Compatible";
  if (worstStatus === 1) finalStatus = "Use Separately";
  if (worstStatus === 2) finalStatus = "Do Not Mix";

  if (finalStatus === "Compatible") {
    warnings.add("મિશ્રણ સુરક્ષિત છે. પાણીમાં પૂરતા પ્રમાણમાં ઓગાળીને જ છંટકાવ કરો.");
  }

  return {
    status: finalStatus,
    warnings: Array.from(warnings),
    conflicts: Array.from(conflicts),
  };
}

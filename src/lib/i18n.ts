import { useAppData } from "../context/AppDataContext";
import type { ExpenseCategory } from "../types";

export const translations = {
  gu: {
    // Nav & Shell
    dashboard: "ડેશબોર્ડ",
    expenses: "ખર્ચ",
    workers: "મજૂર",
    bhaagidar: "ભાગીદાર",
    more: "વધુ",
    newCrop: "નવી ખેતી",
    back: "પાછળ જાઓ",
    settings: "સેટિંગ્સ",
    account: "એકાઉન્ટ",

    // Dashboard
    greeting: "નમસ્તે",
    appTitle: "ખેડૂત ખર્ચ નોંધ",
    activeCrops: "ચાલુ ખેતી",
    totalSpent: "કુલ ખર્ચ",
    farmerTools: "ખેડૂત સાધનો",
    farmerWallet: "ખેડૂત વોલેટ",
    walletDesc: "તમારા જરૂરી દસ્તાવેજો સાચવો",
    stockGodown: "સ્ટોક / ગોડાઉન",
    stockDesc: "ખાતર, દવાનો સ્ટોક મેનેજ કરો",
    searchPlaceholder: "પાક અથવા ખેતર શોધો...",
    all: "બધા",
    active: "ચાલુ",
    harvested: "કપાયેલ",
    noSeasonsYet: "હજુ કોઈ ખેતી નોંધાઈ નથી",
    noSeasonsDesc: "નીચે '+ નવી ખેતી' બટન દબાવીને તમારી પહેલી ખેતી શરૂ કરો.",
    startNow: "હમણાં શરૂ કરો →",
    nothingFound: "કંઈ મળ્યું નહીં",
    tryAnotherSearch: "બીજું નામ શોધીને જુઓ.",

    // Account Page
    accountManagement: "એકાઉન્ટ સંચાલન",
    googleVerified: "Google દ્વારા સુરક્ષિત સાઇન-ઇન",
    membershipStatus: "સદસ્યતા અને સ્ટેટસ",
    supporter: "સહયોગી (Supporter)",
    freeUser: "મફત ઉપયોગ (Free User)",
    donationDate: "દાનની તારીખ",
    donationAmount: "દાનની રકમ",
    supportProjectMsg: "ખેડૂત ખર્ચને સહયોગ કરવા બદલ આભાર. તમારું એકાઉન્ટ સંપૂર્ણપણે સક્રિય છે.",
    supportAppBtn: "ખેડૂત ખર્ચને સહયોગ કરો",
    appSettingsDesc: "એપ સેટિંગ્સ (Theme, Backup, Storage)",
    savedDocsDesc: "મારા સાચવેલા દસ્તાવેજો (Farmer Wallet)",
    helpSupport: "મદદ અને સપોર્ટ",
    adminPanel: "એડ્મિન પેનલ (Admin Panel)",
    signOut: "સાઇન આઉટ",
    signOutDesc: "તમારા Google એકાઉન્ટમાંથી સાઇન આઉટ કરો",
    signOutConfirmTitle: "સાઇન આઉટ કરવું છે?",
    signOutConfirmDesc: "શું તમે આ એકાઉન્ટમાંથી સાઇન આઉટ કરવા માંગો છો?",
    cancel: "રદ કરો",

    // Settings Page
    language: "ભાષા / Language",
    gujarati: "ગુજરાતી (Gujarati)",
    english: "English (અંગ્રેજી)",
    appearance: "દેખાવ",
    lightMode: "લાઇટ મોડ",
    darkMode: "ડાર્ક મોડ",
    systemDefault: "સિસ્ટમ પ્રમાણે",
    backup: "બેકઅપ",
    exportBackup: "બેકઅપ એક્સપોર્ટ કરો",
    restoreBackup: "બેકઅપ પુનઃસ્થાપિત કરો",
    installApp: "એપ્લિકેશન ઇન્સ્ટોલ કરો",
    addToHomeScreen: "હોમ સ્ક્રીન પર ઉમેરો",
    storage: "સંગ્રહ",
    totalCropsCount: "કુલ ખેતી",
    totalExpensesCount: "કુલ ખર્ચ નોંધ",
    usedStorage: "વપરાયેલ સંગ્રહ",
    about: "વિશે",
    clearAllData: "બધો ડેટા સાફ કરો",
    clearAllConfirmTitle: "બધો ડેટા સાફ કરવો છે?",
    clearAllConfirmDesc: "તમામ ખેતી અને ખર્ચની નોંધ કાયમ માટે ડિલીટ થશે. બેકઅપ લીધા વગર આગળ ન વધો.",

    // Expenses Tab
    expenseHistory: "ખર્ચ ઇતિહાસ",
    addExpense: "નવો ખર્ચ",
    category: "કેટેગરી",
    amount: "રકમ",
    date: "તારીખ",
    notes: "નોંધ",

    // Workers Tab
    workerRecords: "મજૂરી હાજરી નોંધ",
    addWorker: "નવી મજૂરી હાજરી",
    workersCount: "મજૂરોની સંખ્યા",
    dailyWage: "દૈનિક મજૂરી",
    workType: "કામનો પ્રકાર",

    // Bhaagidar Tab
    bhaagidarPartners: "ભાગીદાર મેનેજમેન્ટ",
    addBhaagidar: "નવો ભાગીદાર",
    sharePercentage: "ભાગીદારી હિસ્સો (%)",
    advanceGiven: "આપેલ એડવાન્સ",

    // More Menu
    reportsPdf: "રિપોર્ટ અને PDF",
    statistics: "આંકડા (Statistics)",
    walletDocs: "વૉલેટ અને દસ્તાવેજો",
    support: "સપોર્ટ (Support)",
  },
  en: {
    // Nav & Shell
    dashboard: "Dashboard",
    expenses: "Expenses",
    workers: "Labor",
    bhaagidar: "Partners",
    more: "More",
    newCrop: "New Crop",
    back: "Go Back",
    settings: "Settings",
    account: "Account",

    // Dashboard
    greeting: "Hello",
    appTitle: "Farmer Expense Log",
    activeCrops: "Active Crops",
    totalSpent: "Total Spent",
    farmerTools: "Farmer Tools",
    farmerWallet: "Farmer Wallet",
    walletDesc: "Save your essential documents",
    stockGodown: "Stock / Godown",
    stockDesc: "Manage fertilizer & medicine stock",
    searchPlaceholder: "Search crop or field name...",
    all: "All",
    active: "Active",
    harvested: "Harvested",
    noSeasonsYet: "No farming crops recorded yet",
    noSeasonsDesc: "Tap '+ New Crop' button below to start your first crop log.",
    startNow: "Start Now →",
    nothingFound: "Nothing Found",
    tryAnotherSearch: "Try searching with a different name.",

    // Account Page
    accountManagement: "Account Management",
    googleVerified: "Secure Google Sign-In",
    membershipStatus: "Membership & Status",
    supporter: "Supporter",
    freeUser: "Free User",
    donationDate: "Donation Date",
    donationAmount: "Donation Amount",
    supportProjectMsg: "Thank you for supporting Khedut Kharch. Your account is fully active.",
    supportAppBtn: "Support Khedut Kharch",
    appSettingsDesc: "App Settings (Theme, Backup, Storage)",
    savedDocsDesc: "Saved Documents (Farmer Wallet)",
    helpSupport: "Help & Support",
    adminPanel: "Admin Panel",
    signOut: "Sign Out",
    signOutDesc: "Sign out from your Google account",
    signOutConfirmTitle: "Sign out from account?",
    signOutConfirmDesc: "Are you sure you want to sign out from this account?",
    cancel: "Cancel",

    // Settings Page
    language: "Language",
    gujarati: "Gujarati (ગુજરાતી)",
    english: "English",
    appearance: "Appearance",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    systemDefault: "System Default",
    backup: "Backup",
    exportBackup: "Export Backup Data",
    restoreBackup: "Restore Backup Data",
    installApp: "Install Application",
    addToHomeScreen: "Add to Home Screen",
    storage: "Storage",
    totalCropsCount: "Total Crops",
    totalExpensesCount: "Total Expense Entries",
    usedStorage: "Used Storage",
    about: "About",
    clearAllData: "Clear All Data",
    clearAllConfirmTitle: "Clear all data permanently?",
    clearAllConfirmDesc: "All crops, expenses, and records will be deleted forever. Do not proceed without a backup.",

    // Expenses Tab
    expenseHistory: "Expense History",
    addExpense: "Add Expense",
    category: "Category",
    amount: "Amount",
    date: "Date",
    notes: "Notes",

    // Workers Tab
    workerRecords: "Labor Work Records",
    addWorker: "Add Worker Record",
    workersCount: "Worker Count",
    dailyWage: "Daily Wage",
    workType: "Work Type",

    // Bhaagidar Tab
    bhaagidarPartners: "Farming Partners",
    addBhaagidar: "Add Partner",
    sharePercentage: "Partner Share (%)",
    advanceGiven: "Advance Given",

    // More Menu
    reportsPdf: "Reports & PDF",
    statistics: "Statistics",
    walletDocs: "Wallet & Documents",
    support: "Support",
  },
} as const;

export type TranslationKey = keyof typeof translations.gu;

export function useTranslation() {
  const { settings } = useAppData();
  const lang = (settings.language ?? "gu") as "gu" | "en";

  function t(key: TranslationKey, fallback?: string): string {
    const dict = translations[lang] || translations.gu;
    return dict[key] || translations.gu[key] || fallback || key;
  }

  return { t, lang };
}

export const CATEGORY_TRANSLATIONS: Record<ExpenseCategory, { gu: string; en: string }> = {
  seed: { gu: "બીજ", en: "Seeds" },
  fertilizer: { gu: "ખાતર", en: "Fertilizer" },
  pesticide: { gu: "જંતુનાશક દવા", en: "Pesticides" },
  diesel: { gu: "ડીઝલ", en: "Diesel" },
  labor: { gu: "મજૂરી", en: "Labor" },
  irrigation: { gu: "સિંચાઈ", en: "Irrigation" },
  transport: { gu: "પરિવહન", en: "Transport" },
  rent: { gu: "ભાડું", en: "Rent" },
  electricity: { gu: "વીજળી", en: "Electricity" },
  other: { gu: "અન્ય", en: "Other" },
};

export function getCategoryLabel(category: ExpenseCategory, lang: "gu" | "en" = "gu"): string {
  return CATEGORY_TRANSLATIONS[category]?.[lang] || CATEGORY_TRANSLATIONS[category]?.gu || category;
}

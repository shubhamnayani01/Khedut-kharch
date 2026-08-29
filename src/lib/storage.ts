const KEYS = {
  seasons: "kkn:seasons",
  expenses: "kkn:expenses",
  workers: "kkn:workers",
  bhaagidars: "kkn:bhaagidars",
  advanceLedgers: "kkn:advanceLedgers",
  inventoryItems: "kkn:inventoryItems",
  settings: "kkn:settings",
  draft: "kkn:draft:",
} as const;

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const storage = {
  keys: KEYS,
  getSeasons: () => safeGet(KEYS.seasons, [] as unknown[]),
  setSeasons: (v: unknown) => safeSet(KEYS.seasons, v),
  getExpenses: () => safeGet(KEYS.expenses, [] as unknown[]),
  setExpenses: (v: unknown) => safeSet(KEYS.expenses, v),
  getWorkers: () => safeGet(KEYS.workers, [] as unknown[]),
  setWorkers: (v: unknown) => safeSet(KEYS.workers, v),
  getBhaagidars: () => safeGet(KEYS.bhaagidars, [] as unknown[]),
  setBhaagidars: (v: unknown) => safeSet(KEYS.bhaagidars, v),
  getAdvanceLedgers: () => safeGet(KEYS.advanceLedgers, [] as unknown[]),
  setAdvanceLedgers: (v: unknown) => safeSet(KEYS.advanceLedgers, v),
  getInventoryItems: () => safeGet(KEYS.inventoryItems, [] as unknown[]),
  setInventoryItems: (v: unknown) => safeSet(KEYS.inventoryItems, v),
  getSettings: (fallback: unknown) => safeGet(KEYS.settings, fallback),
  setSettings: (v: unknown) => safeSet(KEYS.settings, v),
  getDraft: <T,>(id: string, fallback: T) => safeGet(KEYS.draft + id, fallback),
  setDraft: (id: string, v: unknown) => safeSet(KEYS.draft + id, v),
  clearDraft: (id: string) => {
    try {
      localStorage.removeItem(KEYS.draft + id);
    } catch {
      /* noop */
    }
  },
  estimateUsageBytes: () => {
    try {
      let total = 0;
      for (const k in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, k)) {
          total += (localStorage.getItem(k) || "").length + k.length;
        }
      }
      return total;
    } catch {
      return 0;
    }
  },
  clearAll: () => {
    try {
      localStorage.removeItem(KEYS.seasons);
      localStorage.removeItem(KEYS.expenses);
      localStorage.removeItem(KEYS.workers);
      localStorage.removeItem(KEYS.bhaagidars);
      localStorage.removeItem(KEYS.advanceLedgers);
      localStorage.removeItem(KEYS.inventoryItems);
      // keep settings (theme) intentionally left to caller
    } catch {
      /* noop */
    }
  },
};

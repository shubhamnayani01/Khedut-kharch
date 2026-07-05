const KEYS = {
  seasons: "kkn:seasons",
  expenses: "kkn:expenses",
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
      // keep settings (theme) intentionally left to caller
    } catch {
      /* noop */
    }
  },
};

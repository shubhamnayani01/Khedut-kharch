import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, deleteDoc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { storage } from "../lib/storage";
import { makeId } from "../lib/id";
import { auth, db } from "../firebase";
import type {
  AppSettings,
  BackupPayload,
  Expense,
  FarmingSeason,
  Harvest,
} from "../types";

const DEFAULT_SETTINGS: AppSettings = { theme: "system", onboardingSeen: false };

interface AppDataContextValue {
  seasons: FarmingSeason[];
  expenses: Expense[];
  settings: AppSettings;
  isLoaded: boolean;

  addSeason: (input: Omit<FarmingSeason, "id" | "status" | "createdAt" | "updatedAt">) => FarmingSeason;
  updateSeason: (id: string, patch: Partial<FarmingSeason>) => void;
  deleteSeason: (id: string) => void;
  getSeason: (id: string) => FarmingSeason | undefined;
  setHarvest: (id: string, harvest: Harvest) => void;

  addExpense: (input: Omit<Expense, "id" | "createdAt" | "updatedAt">) => Expense;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  expensesForSeason: (seasonId: string) => Expense[];

  updateSettings: (patch: Partial<AppSettings>) => void;

  exportBackup: () => BackupPayload;
  importBackup: (payload: BackupPayload) => { ok: boolean; error?: string };
  clearAllData: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [seasons, setSeasons] = useState<FarmingSeason[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSeasons(storage.getSeasons() as FarmingSeason[]);
    setExpenses(storage.getExpenses() as Expense[]);
    setSettings(storage.getSettings(DEFAULT_SETTINGS) as AppSettings);
    setIsLoaded(true);
  }, []);

  const cloudLoadAttempted = useRef(false);

  const normalizeFirestoreExpense = useCallback((data: Record<string, unknown>, id: string): Expense => {
    const valueToNumber = (value: unknown) => {
      if (typeof value === "number") return value;
      if (value && typeof value === "object" && "toMillis" in value && typeof (value as any).toMillis === "function") {
        return (value as any).toMillis();
      }
      return Date.now();
    };

    return {
      id,
      seasonId: String(data.seasonId ?? ""),
      category: String(data.category ?? "other") as Expense["category"],
      amount: Number(data.amount ?? 0),
      description: typeof data.description === "string" ? data.description : undefined,
      billPhoto: typeof data.billPhoto === "string" ? data.billPhoto : undefined,
      date: String(data.date ?? ""),
      createdAt: valueToNumber(data.createdAt),
      updatedAt: valueToNumber(data.updatedAt),
    };
  }, []);

  const normalizeFirestoreSeason = useCallback((data: Record<string, unknown>, id: string): FarmingSeason => {
    const valueToNumber = (value: unknown) => {
      if (typeof value === "number") return value;
      if (value && typeof value === "object" && "toMillis" in value && typeof (value as any).toMillis === "function") {
        return (value as any).toMillis();
      }
      return Date.now();
    };

    return {
      id,
      cropName: String(data.cropName ?? ""),
      fieldName: String(data.fieldName ?? ""),
      areaBigha: typeof data.areaBigha === "number" ? data.areaBigha : undefined,
      areaLabel: typeof data.areaLabel === "string" ? data.areaLabel : undefined,
      sowingDate: String(data.sowingDate ?? ""),
      notes: typeof data.notes === "string" ? data.notes : undefined,
      colorTag: String(data.colorTag ?? ""),
      status: String(data.status ?? "active") as FarmingSeason["status"],
      harvest: data.harvest && typeof data.harvest === "object" ? (data.harvest as Harvest) : undefined,
      createdAt: valueToNumber(data.createdAt),
      updatedAt: valueToNumber(data.updatedAt),
    };
  }, []);

  const migrateLocalSeasonsToFirestore = useCallback(async (localSeasons: FarmingSeason[]) => {
    const currentUser = auth.currentUser;
    if (!currentUser || localSeasons.length === 0) return;

    try {
      console.log("Migrating local seasons to Firestore:", localSeasons.length);
      await Promise.all(
        localSeasons.map((season) => {
          const payload: Record<string, unknown> = {
            ...season,
            createdAt: season.createdAt,
            updatedAt: season.updatedAt,
          };
          return setDoc(doc(db, "users", currentUser.uid, "seasons", season.id), cleanFirestorePayload(payload), {
            merge: true,
          });
        })
      );
    } catch (error: unknown) {
      console.error("Failed to migrate local seasons to Firestore:", error);
    }
  }, []);

  const loadSeasonsFromFirestore = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const snapshot = await getDocs(collection(db, "users", currentUser.uid, "seasons"));
      console.log("Authenticated UID:", currentUser.uid, "Seasons loaded count:", snapshot.size);
      if (snapshot.empty) {
        const localSeasons = storage.getSeasons() as FarmingSeason[];
        if (localSeasons.length === 0) {
          console.log("No Firestore seasons found and no local seasons available.");
          return;
        }

        console.log("No Firestore seasons found, migrating local seasons to Firestore");
        await migrateLocalSeasonsToFirestore(localSeasons);
        return;
      }

      const firestoreSeasons = snapshot.docs.map((docSnapshot) =>
        normalizeFirestoreSeason(docSnapshot.data(), docSnapshot.id)
      );
      console.log("setSeasons executed", firestoreSeasons.length);
      setSeasons(firestoreSeasons);
    } catch (error: unknown) {
      console.error("Failed to load seasons from Firestore:", error);
    }
  }, [migrateLocalSeasonsToFirestore, normalizeFirestoreSeason]);

  const loadExpensesFromFirestore = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const snapshot = await getDocs(collection(db, "users", currentUser.uid, "expenses"));
      console.log("Authenticated UID:", currentUser.uid, "Expenses loaded count:", snapshot.size);
      if (snapshot.empty) {
        console.log("No Firestore expenses found, keeping local expenses");
        return;
      }

      const firestoreExpenses: Expense[] = snapshot.docs.map((docSnapshot) =>
        normalizeFirestoreExpense(docSnapshot.data(), docSnapshot.id)
      );

      console.log("setExpenses executed", firestoreExpenses.length);
      setExpenses(firestoreExpenses);
    } catch (error: unknown) {
      console.error("Failed to load expenses from Firestore:", error);
    }
  }, [normalizeFirestoreExpense]);

  useEffect(() => {
    if (!isLoaded || cloudLoadAttempted.current) return;

    const runCloudLoad = async (user: { uid: string }) => {
      console.log("Authenticated UID:", user.uid);
      cloudLoadAttempted.current = true;
      await loadSeasonsFromFirestore();
      await loadExpensesFromFirestore();
    };

    const currentUser = auth.currentUser;
    if (currentUser) {
      void runCloudLoad(currentUser);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !cloudLoadAttempted.current) {
        void runCloudLoad(user);
      }
    });

    return unsubscribe;
  }, [isLoaded, loadExpensesFromFirestore, loadSeasonsFromFirestore]);

  useEffect(() => {
    if (isLoaded) storage.setSeasons(seasons);
  }, [seasons, isLoaded]);

  useEffect(() => {
    if (isLoaded) storage.setExpenses(expenses);
  }, [expenses, isLoaded]);

  useEffect(() => {
    if (isLoaded) storage.setSettings(settings);
  }, [settings, isLoaded]);

  // apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const apply = (dark: boolean) => root.classList.toggle("dark", dark);
    if (settings.theme === "dark") apply(true);
    else if (settings.theme === "light") apply(false);
    else {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mq.matches);
      const listener = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
  }, [settings.theme]);

  const cleanFirestorePayload = (obj: Record<string, unknown>) => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) out[k] = v;
    }
    return out;
  };

  const saveExpenseToFirestore = useCallback(async (expense: Expense, preserveCreatedAt = false) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const payload: Record<string, unknown> = {
        ...expense,
        createdAt: preserveCreatedAt ? expense.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const cleaned = cleanFirestorePayload(payload);
      await setDoc(doc(db, "users", currentUser.uid, "expenses", expense.id), cleaned, { merge: true });
    } catch (error: unknown) {
      console.error("Failed to sync expense to Firestore:", error);
    }
  }, []);

  const saveSeasonToFirestore = useCallback(async (season: FarmingSeason, preserveCreatedAt = false) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const payload: Record<string, unknown> = {
        ...season,
        createdAt: preserveCreatedAt ? season.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const cleaned = cleanFirestorePayload(payload);
      await setDoc(doc(db, "users", currentUser.uid, "seasons", season.id), cleaned, { merge: true });
    } catch (error: unknown) {
      console.error("Failed to sync season to Firestore:", error);
    }
  }, []);

  const deleteExpenseFromFirestore = useCallback(async (id: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, "users", currentUser.uid, "expenses", id));
    } catch (error: unknown) {
      console.error("Failed to delete expense from Firestore:", error);
    }
  }, []);

  const deleteSeasonFromFirestore = useCallback(async (id: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, "users", currentUser.uid, "seasons", id));
    } catch (error: unknown) {
      console.error("Failed to delete season from Firestore:", error);
    }
  }, []);

  const addSeason: AppDataContextValue["addSeason"] = useCallback((input) => {
    const now = Date.now();
    const season: FarmingSeason = {
      ...input,
      id: makeId(),
      status: "active",
      createdAt: now,
      updatedAt: now,
    };
    setSeasons((prev) => [season, ...prev]);
    void saveSeasonToFirestore(season);
    return season;
  }, [saveSeasonToFirestore]);

  const updateSeason = useCallback(
    (id: string, patch: Partial<FarmingSeason>) => {
      setSeasons((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...patch, updatedAt: Date.now() } : s))
      );

      const updatedSeason = seasons.find((s) => s.id === id);
      if (updatedSeason) {
        const seasonToSave = { ...updatedSeason, ...patch, updatedAt: Date.now() };
        void saveSeasonToFirestore(seasonToSave, true);
      }
    },
    [saveSeasonToFirestore, seasons]
  );

  const deleteSeason = useCallback(
    (id: string) => {
      setSeasons((prev) => prev.filter((s) => s.id !== id));
      setExpenses((prev) => prev.filter((e) => e.seasonId !== id));
      void deleteSeasonFromFirestore(id);
    },
    [deleteSeasonFromFirestore]
  );

  const getSeason = useCallback((id: string) => seasons.find((s) => s.id === id), [seasons]);

  const setHarvest = useCallback((id: string, harvest: Harvest) => {
    setSeasons((prev) =>
      prev.map((s) => (s.id === id ? { ...s, harvest, status: "harvested", updatedAt: Date.now() } : s))
    );
  }, []);

  const addExpense: AppDataContextValue["addExpense"] = useCallback((input) => {
    const now = Date.now();
    const expense: Expense = { ...input, id: makeId(), createdAt: now, updatedAt: now };
    setExpenses((prev) => [expense, ...prev]);
    void saveExpenseToFirestore(expense);
    return expense;
  }, [saveExpenseToFirestore]);

  const updateExpense = useCallback(
    (id: string, patch: Partial<Expense>) => {
      const existingExpense = expenses.find((e) => e.id === id);
      if (!existingExpense) return;

      const updatedExpense: Expense = {
        ...existingExpense,
        ...patch,
        updatedAt: Date.now(),
      };

      setExpenses((prev) => prev.map((e) => (e.id === id ? updatedExpense : e)));
      void saveExpenseToFirestore(updatedExpense, true);
    },
    [expenses, saveExpenseToFirestore]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      void deleteExpenseFromFirestore(id);
    },
    [deleteExpenseFromFirestore]
  );

  const expensesForSeason = useCallback(
    (seasonId: string) => expenses.filter((e) => e.seasonId === seasonId),
    [expenses]
  );

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const exportBackup = useCallback((): BackupPayload => {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      seasons,
      expenses,
      settings,
    };
  }, [seasons, expenses, settings]);

  const importBackup = useCallback((payload: BackupPayload) => {
    try {
      if (!payload || payload.version !== 1 || !Array.isArray(payload.seasons) || !Array.isArray(payload.expenses)) {
        return { ok: false, error: "invalid" };
      }
      setSeasons(payload.seasons);
      setExpenses(payload.expenses);
      if (payload.settings) setSettings((prev) => ({ ...prev, ...payload.settings }));
      return { ok: true };
    } catch {
      return { ok: false, error: "parse" };
    }
  }, []);

  const clearAllData = useCallback(() => {
    setSeasons([]);
    setExpenses([]);
    storage.clearAll();
  }, []);

  const value = useMemo<AppDataContextValue>(
    () => ({
      seasons,
      expenses,
      settings,
      isLoaded,
      addSeason,
      updateSeason,
      deleteSeason,
      getSeason,
      setHarvest,
      addExpense,
      updateExpense,
      deleteExpense,
      expensesForSeason,
      updateSettings,
      exportBackup,
      importBackup,
      clearAllData,
    }),
    [
      seasons,
      expenses,
      settings,
      isLoaded,
      addSeason,
      updateSeason,
      deleteSeason,
      getSeason,
      setHarvest,
      addExpense,
      updateExpense,
      deleteExpense,
      expensesForSeason,
      updateSettings,
      exportBackup,
      importBackup,
      clearAllData,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

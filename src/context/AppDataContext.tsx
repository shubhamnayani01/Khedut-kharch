import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { storage } from "../lib/storage";
import { makeId } from "../lib/id";
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
    return season;
  }, []);

  const updateSeason = useCallback((id: string, patch: Partial<FarmingSeason>) => {
    setSeasons((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch, updatedAt: Date.now() } : s))
    );
  }, []);

  const deleteSeason = useCallback((id: string) => {
    setSeasons((prev) => prev.filter((s) => s.id !== id));
    setExpenses((prev) => prev.filter((e) => e.seasonId !== id));
  }, []);

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
    return expense;
  }, []);

  const updateExpense = useCallback((id: string, patch: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e))
    );
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

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

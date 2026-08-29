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
  WorkerRecord,
  BhaagidarProfile,
  AdvanceLedger,
  InventoryItem
} from "../types";

const DEFAULT_SETTINGS: AppSettings = { theme: "system", onboardingSeen: false };

interface AppDataContextValue {
  seasons: FarmingSeason[];
  expenses: Expense[];
  workers: WorkerRecord[];
  bhaagidars: BhaagidarProfile[];
  advanceLedgers: AdvanceLedger[];
  inventoryItems: InventoryItem[];
  settings: AppSettings;
  isLoaded: boolean;

  setActiveSeason: (id: string | undefined) => void;

  addSeason: (input: Omit<FarmingSeason, "id" | "status" | "createdAt" | "updatedAt">) => FarmingSeason;
  updateSeason: (id: string, patch: Partial<FarmingSeason>) => void;
  deleteSeason: (id: string) => void;
  getSeason: (id: string) => FarmingSeason | undefined;
  setHarvest: (id: string, harvest: Harvest) => void;

  addExpense: (input: Omit<Expense, "id" | "createdAt" | "updatedAt">) => Expense;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  expensesForSeason: (seasonId: string) => Expense[];

  addWorker: (input: Omit<WorkerRecord, "id" | "createdAt" | "updatedAt">) => WorkerRecord;
  updateWorker: (id: string, patch: Partial<WorkerRecord>) => void;
  deleteWorker: (id: string) => void;
  workersForSeason: (seasonId: string) => WorkerRecord[];

  addBhaagidar: (input: Omit<BhaagidarProfile, "id" | "createdAt" | "updatedAt">) => BhaagidarProfile;
  updateBhaagidar: (id: string, patch: Partial<BhaagidarProfile>) => void;
  deleteBhaagidar: (id: string) => void;
  bhaagidarsForSeason: (seasonId: string) => BhaagidarProfile[];

  addAdvanceLedger: (input: Omit<AdvanceLedger, "id" | "createdAt" | "updatedAt">) => AdvanceLedger;
  deleteAdvanceLedger: (id: string) => void;
  ledgersForBhaagidar: (bhaagidarId: string) => AdvanceLedger[];

  addInventoryItem: (input: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => InventoryItem;
  updateInventoryItem: (id: string, patch: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;

  updateSettings: (patch: Partial<AppSettings>) => void;

  exportBackup: () => BackupPayload;
  importBackup: (payload: BackupPayload) => { ok: boolean; error?: string };
  clearAllData: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [seasons, setSeasons] = useState<FarmingSeason[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [workers, setWorkers] = useState<WorkerRecord[]>([]);
  const [bhaagidars, setBhaagidars] = useState<BhaagidarProfile[]>([]);
  const [advanceLedgers, setAdvanceLedgers] = useState<AdvanceLedger[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSeasons(storage.getSeasons() as FarmingSeason[]);
    setExpenses(storage.getExpenses() as Expense[]);
    setWorkers(storage.getWorkers() as WorkerRecord[]);
    setBhaagidars(storage.getBhaagidars() as BhaagidarProfile[]);
    setAdvanceLedgers(storage.getAdvanceLedgers() as AdvanceLedger[]);
    setInventoryItems(storage.getInventoryItems() as InventoryItem[]);
    setSettings(storage.getSettings(DEFAULT_SETTINGS) as AppSettings);
    setIsLoaded(true);
  }, []);

  const cloudLoadAttempted = useRef(false);

  const valueToNumber = (value: unknown) => {
    if (typeof value === "number") return value;
    if (value && typeof value === "object" && "toMillis" in value && typeof (value as any).toMillis === "function") {
      return (value as any).toMillis();
    }
    return Date.now();
  };

  const normalizeFirestoreExpense = useCallback((data: Record<string, unknown>, id: string): Expense => {
    return {
      id,
      seasonId: String(data.seasonId ?? ""),
      category: String(data.category ?? "other") as Expense["category"],
      amount: Number(data.amount ?? 0),
      description: typeof data.description === "string" ? data.description : undefined,
      billPhoto: typeof data.billPhoto === "string" ? data.billPhoto : undefined,
      inventoryItemId: typeof data.inventoryItemId === "string" ? data.inventoryItemId : undefined,
      inventoryQuantityUsed: typeof data.inventoryQuantityUsed === "number" ? data.inventoryQuantityUsed : undefined,
      date: String(data.date ?? ""),
      createdAt: valueToNumber(data.createdAt),
      updatedAt: valueToNumber(data.updatedAt),
    };
  }, []);

  const normalizeFirestoreSeason = useCallback((data: Record<string, unknown>, id: string): FarmingSeason => {
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

  const normalizeWorker = useCallback((data: Record<string, unknown>, id: string): WorkerRecord => ({
    id,
    seasonId: String(data.seasonId ?? ""),
    date: String(data.date ?? ""),
    workersCount: Number(data.workersCount ?? 0),
    workType: String(data.workType ?? "") as any,
    dailyWage: Number(data.dailyWage ?? 0),
    total: Number(data.total ?? 0),
    notes: typeof data.notes === "string" ? data.notes : undefined,
    createdAt: valueToNumber(data.createdAt),
    updatedAt: valueToNumber(data.updatedAt),
  }), []);

  const normalizeBhaagidar = useCallback((data: Record<string, unknown>, id: string): BhaagidarProfile => ({
    id,
    seasonId: String(data.seasonId ?? ""),
    name: String(data.name ?? ""),
    mobile: typeof data.mobile === "string" ? data.mobile : undefined,
    sharePercentage: Number(data.sharePercentage ?? 0),
    notes: typeof data.notes === "string" ? data.notes : undefined,
    createdAt: valueToNumber(data.createdAt),
    updatedAt: valueToNumber(data.updatedAt),
  }), []);

  const normalizeAdvanceLedger = useCallback((data: Record<string, unknown>, id: string): AdvanceLedger => ({
    id,
    bhaagidarId: String(data.bhaagidarId ?? ""),
    seasonId: String(data.seasonId ?? ""),
    date: String(data.date ?? ""),
    amount: Number(data.amount ?? 0),
    type: String(data.type ?? "debit") as "credit" | "debit",
    note: typeof data.note === "string" ? data.note : undefined,
    createdAt: valueToNumber(data.createdAt),
    updatedAt: valueToNumber(data.updatedAt),
  }), []);

  const normalizeInventoryItem = useCallback((data: Record<string, unknown>, id: string): InventoryItem => ({
    id,
    name: String(data.name ?? ""),
    category: String(data.category ?? "other") as InventoryItem["category"],
    totalQuantity: Number(data.totalQuantity ?? 0),
    unit: String(data.unit ?? ""),
    totalCost: Number(data.totalCost ?? 0),
    datePurchased: String(data.datePurchased ?? ""),
    notes: typeof data.notes === "string" ? data.notes : undefined,
    createdAt: valueToNumber(data.createdAt),
    updatedAt: valueToNumber(data.updatedAt),
  }), []);

  const migrateLocalSeasonsToFirestore = useCallback(async (localSeasons: FarmingSeason[]) => {
    const currentUser = auth.currentUser;
    if (!currentUser || localSeasons.length === 0) return;
    try {
      await Promise.all(
        localSeasons.map((season) =>
          setDoc(doc(db, "users", currentUser.uid, "seasons", season.id), cleanFirestorePayload(season), { merge: true })
        )
      );
    } catch (error) {
      console.error("Failed to migrate seasons:", error);
    }
  }, []);

  const loadCollection = useCallback(async <T,>(
    collectionName: string,
    normalizer: (data: Record<string, unknown>, id: string) => T,
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    migrator?: () => Promise<void>
  ) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    try {
      const snapshot = await getDocs(collection(db, "users", currentUser.uid, collectionName));
      if (snapshot.empty && migrator) {
        await migrator();
        return;
      }
      if (!snapshot.empty) {
        setter(snapshot.docs.map((d) => normalizer(d.data(), d.id)));
      }
    } catch (error) {
      console.error(`Failed to load ${collectionName}:`, error);
    }
  }, []);

  const loadSeasonsFromFirestore = useCallback(() => {
    return loadCollection("seasons", normalizeFirestoreSeason, setSeasons, async () => {
      const local = storage.getSeasons() as FarmingSeason[];
      if (local.length > 0) await migrateLocalSeasonsToFirestore(local);
    });
  }, [loadCollection, normalizeFirestoreSeason, migrateLocalSeasonsToFirestore]);

  useEffect(() => {
    if (!isLoaded || cloudLoadAttempted.current) return;
    const runCloudLoad = async () => {
      cloudLoadAttempted.current = true;
      await loadSeasonsFromFirestore();
      await loadCollection("expenses", normalizeFirestoreExpense, setExpenses);
      await loadCollection("workers", normalizeWorker, setWorkers);
      await loadCollection("bhaagidars", normalizeBhaagidar, setBhaagidars);
      await loadCollection("advanceLedgers", normalizeAdvanceLedger, setAdvanceLedgers);
      await loadCollection("inventoryItems", normalizeInventoryItem, setInventoryItems);
    };

    const currentUser = auth.currentUser;
    if (currentUser) {
      void runCloudLoad();
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !cloudLoadAttempted.current) void runCloudLoad();
    });
    return unsubscribe;
  }, [isLoaded, loadSeasonsFromFirestore, loadCollection, normalizeFirestoreExpense, normalizeWorker, normalizeBhaagidar, normalizeAdvanceLedger, normalizeInventoryItem]);

  useEffect(() => { if (isLoaded) storage.setSeasons(seasons); }, [seasons, isLoaded]);
  useEffect(() => { if (isLoaded) storage.setExpenses(expenses); }, [expenses, isLoaded]);
  useEffect(() => { if (isLoaded) storage.setWorkers(workers); }, [workers, isLoaded]);
  useEffect(() => { if (isLoaded) storage.setBhaagidars(bhaagidars); }, [bhaagidars, isLoaded]);
  useEffect(() => { if (isLoaded) storage.setAdvanceLedgers(advanceLedgers); }, [advanceLedgers, isLoaded]);
  useEffect(() => { if (isLoaded) storage.setInventoryItems(inventoryItems); }, [inventoryItems, isLoaded]);
  useEffect(() => { if (isLoaded) storage.setSettings(settings); }, [settings, isLoaded]);

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

  const cleanFirestorePayload = <T extends object>(obj: T): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) out[k] = v;
    }
    return out;
  };

  const saveToFirestore = useCallback(async (collectionName: string, item: any, preserveCreatedAt = false) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    try {
      const payload = {
        ...item,
        createdAt: preserveCreatedAt ? item.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", currentUser.uid, collectionName, item.id), cleanFirestorePayload(payload), { merge: true });
    } catch (error) {
      console.error(`Failed to sync ${collectionName}:`, error);
    }
  }, []);

  const deleteFromFirestore = useCallback(async (collectionName: string, id: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, "users", currentUser.uid, collectionName, id));
    } catch (error) {
      console.error(`Failed to delete from ${collectionName}:`, error);
    }
  }, []);

  const setActiveSeason = useCallback((id: string | undefined) => {
    setSettings(s => ({ ...s, activeSeasonId: id }));
  }, []);

  const addSeason = useCallback((input: any) => {
    const now = Date.now();
    const season: FarmingSeason = { ...input, id: makeId(), status: "active", createdAt: now, updatedAt: now };
    setSeasons((prev) => [season, ...prev]);
    void saveToFirestore("seasons", season);
    return season;
  }, [saveToFirestore]);

  const updateSeason = useCallback((id: string, patch: Partial<FarmingSeason>) => {
    setSeasons(prev => prev.map(s => s.id === id ? { ...s, ...patch, updatedAt: Date.now() } : s));
    const updated = seasons.find(s => s.id === id);
    if (updated) void saveToFirestore("seasons", { ...updated, ...patch, updatedAt: Date.now() }, true);
  }, [saveToFirestore, seasons]);

  const deleteSeason = useCallback((id: string) => {
    setSeasons(prev => prev.filter(s => s.id !== id));
    setExpenses(prev => prev.filter(e => e.seasonId !== id));
    setWorkers(prev => prev.filter(w => w.seasonId !== id));
    setBhaagidars(prev => prev.filter(b => b.seasonId !== id));
    setAdvanceLedgers(prev => prev.filter(a => a.seasonId !== id));
    if (settings.activeSeasonId === id) setActiveSeason(undefined);
    void deleteFromFirestore("seasons", id);
  }, [deleteFromFirestore, settings.activeSeasonId, setActiveSeason]);

  const getSeason = useCallback((id: string) => seasons.find(s => s.id === id), [seasons]);

  const setHarvest = useCallback((id: string, harvest: Harvest) => {
    updateSeason(id, { harvest, status: "harvested" });
  }, [updateSeason]);

  const addExpense = useCallback((input: any) => {
    const expense: Expense = { ...input, id: makeId(), createdAt: Date.now(), updatedAt: Date.now() };
    setExpenses(prev => [expense, ...prev]);
    void saveToFirestore("expenses", expense);
    return expense;
  }, [saveToFirestore]);

  const updateExpense = useCallback((id: string, patch: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e));
    const updated = expenses.find(e => e.id === id);
    if (updated) void saveToFirestore("expenses", { ...updated, ...patch, updatedAt: Date.now() }, true);
  }, [expenses, saveToFirestore]);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    void deleteFromFirestore("expenses", id);
  }, [deleteFromFirestore]);

  const expensesForSeason = useCallback((seasonId: string) => expenses.filter(e => e.seasonId === seasonId), [expenses]);

  const addWorker = useCallback((input: any) => {
    const worker: WorkerRecord = { ...input, id: makeId(), createdAt: Date.now(), updatedAt: Date.now() };
    setWorkers(prev => [worker, ...prev]);
    void saveToFirestore("workers", worker);
    return worker;
  }, [saveToFirestore]);

  const updateWorker = useCallback((id: string, patch: Partial<WorkerRecord>) => {
    setWorkers(prev => prev.map(w => w.id === id ? { ...w, ...patch, updatedAt: Date.now() } : w));
    const updated = workers.find(w => w.id === id);
    if (updated) void saveToFirestore("workers", { ...updated, ...patch, updatedAt: Date.now() }, true);
  }, [workers, saveToFirestore]);

  const deleteWorker = useCallback((id: string) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
    void deleteFromFirestore("workers", id);
  }, [deleteFromFirestore]);

  const workersForSeason = useCallback((seasonId: string) => workers.filter(w => w.seasonId === seasonId), [workers]);

  const addBhaagidar = useCallback((input: any) => {
    const bhaagidar: BhaagidarProfile = { ...input, id: makeId(), createdAt: Date.now(), updatedAt: Date.now() };
    setBhaagidars(prev => [bhaagidar, ...prev]);
    void saveToFirestore("bhaagidars", bhaagidar);
    return bhaagidar;
  }, [saveToFirestore]);

  const updateBhaagidar = useCallback((id: string, patch: Partial<BhaagidarProfile>) => {
    setBhaagidars(prev => prev.map(b => b.id === id ? { ...b, ...patch, updatedAt: Date.now() } : b));
    const updated = bhaagidars.find(b => b.id === id);
    if (updated) void saveToFirestore("bhaagidars", { ...updated, ...patch, updatedAt: Date.now() }, true);
  }, [bhaagidars, saveToFirestore]);

  const deleteBhaagidar = useCallback((id: string) => {
    setBhaagidars(prev => prev.filter(b => b.id !== id));
    setAdvanceLedgers(prev => prev.filter(a => a.bhaagidarId !== id));
    void deleteFromFirestore("bhaagidars", id);
  }, [deleteFromFirestore]);

  const bhaagidarsForSeason = useCallback((seasonId: string) => bhaagidars.filter(b => b.seasonId === seasonId), [bhaagidars]);

  const addAdvanceLedger = useCallback((input: any) => {
    const ledger: AdvanceLedger = { ...input, id: makeId(), createdAt: Date.now(), updatedAt: Date.now() };
    setAdvanceLedgers(prev => [ledger, ...prev]);
    void saveToFirestore("advanceLedgers", ledger);
    return ledger;
  }, [saveToFirestore]);

  const deleteAdvanceLedger = useCallback((id: string) => {
    setAdvanceLedgers(prev => prev.filter(a => a.id !== id));
    void deleteFromFirestore("advanceLedgers", id);
  }, [deleteFromFirestore]);

  const ledgersForBhaagidar = useCallback((bhaagidarId: string) => advanceLedgers.filter(a => a.bhaagidarId === bhaagidarId), [advanceLedgers]);

  const addInventoryItem = useCallback((input: any) => {
    const item: InventoryItem = { ...input, id: makeId(), createdAt: Date.now(), updatedAt: Date.now() };
    setInventoryItems(prev => [item, ...prev]);
    void saveToFirestore("inventoryItems", item);
    return item;
  }, [saveToFirestore]);

  const updateInventoryItem = useCallback((id: string, patch: Partial<InventoryItem>) => {
    setInventoryItems(prev => prev.map(i => i.id === id ? { ...i, ...patch, updatedAt: Date.now() } : i));
    const updated = inventoryItems.find(i => i.id === id);
    if (updated) void saveToFirestore("inventoryItems", { ...updated, ...patch, updatedAt: Date.now() }, true);
  }, [inventoryItems, saveToFirestore]);

  const deleteInventoryItem = useCallback((id: string) => {
    setInventoryItems(prev => prev.filter(i => i.id !== id));
    void deleteFromFirestore("inventoryItems", id);
  }, [deleteFromFirestore]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
  }, []);

  const exportBackup = useCallback((): BackupPayload => {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      seasons,
      expenses,
      workers,
      bhaagidars,
      advanceLedgers,
      inventoryItems,
      settings,
    };
  }, [seasons, expenses, workers, bhaagidars, advanceLedgers, inventoryItems, settings]);

  const importBackup = useCallback((payload: BackupPayload) => {
    try {
      if (!payload || payload.version !== 1 || !Array.isArray(payload.seasons) || !Array.isArray(payload.expenses)) {
        return { ok: false, error: "invalid" };
      }
      setSeasons(payload.seasons);
      setExpenses(payload.expenses);
      if (payload.workers) setWorkers(payload.workers);
      if (payload.bhaagidars) setBhaagidars(payload.bhaagidars);
      if (payload.advanceLedgers) setAdvanceLedgers(payload.advanceLedgers);
      if (payload.inventoryItems) setInventoryItems(payload.inventoryItems);
      if (payload.settings) setSettings(prev => ({ ...prev, ...payload.settings }));
      return { ok: true };
    } catch {
      return { ok: false, error: "parse" };
    }
  }, []);

  const clearAllData = useCallback(() => {
    setSeasons([]);
    setExpenses([]);
    setWorkers([]);
    setBhaagidars([]);
    setAdvanceLedgers([]);
    setInventoryItems([]);
    storage.clearAll();
  }, []);

  const value = useMemo<AppDataContextValue>(
    () => ({
      seasons, expenses, workers, bhaagidars, advanceLedgers, inventoryItems, settings, isLoaded,
      setActiveSeason, addSeason, updateSeason, deleteSeason, getSeason, setHarvest,
      addExpense, updateExpense, deleteExpense, expensesForSeason,
      addWorker, updateWorker, deleteWorker, workersForSeason,
      addBhaagidar, updateBhaagidar, deleteBhaagidar, bhaagidarsForSeason,
      addAdvanceLedger, deleteAdvanceLedger, ledgersForBhaagidar,
      addInventoryItem, updateInventoryItem, deleteInventoryItem,
      updateSettings, exportBackup, importBackup, clearAllData,
    }),
    [
      seasons, expenses, workers, bhaagidars, advanceLedgers, inventoryItems, settings, isLoaded,
      setActiveSeason, addSeason, updateSeason, deleteSeason, getSeason, setHarvest,
      addExpense, updateExpense, deleteExpense, expensesForSeason,
      addWorker, updateWorker, deleteWorker, workersForSeason,
      addBhaagidar, updateBhaagidar, deleteBhaagidar, bhaagidarsForSeason,
      addAdvanceLedger, deleteAdvanceLedger, ledgersForBhaagidar,
      addInventoryItem, updateInventoryItem, deleteInventoryItem,
      updateSettings, exportBackup, importBackup, clearAllData,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { Screen, Fab, BottomNav } from "../components/ui/AppShell";
import { SeasonCard } from "../components/SeasonCard";
import { EmptyState } from "../components/ui/EmptyState";
import { Dialog } from "../components/ui/Dialog";
import { SearchIcon, NotebookIcon, CloseIcon, CheckCircleIcon } from "../components/icons/UIIcons";
import { WalletIcon } from "../components/icons/ModuleIcons";
import { CategoryIcon } from "../components/icons/CategoryIcons";
import { formatCurrency } from "../lib/format";
import { totalExpenses, totalWorkerCost, totalBhaagidaarAdvance } from "../lib/calc";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function Dashboard() {
  const { seasons, expenses, workers, advanceLedgers, isLoaded } = useAppData();
  const { user, membership } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "harvested">("all");
  const [showThanks, setShowThanks] = useState(false);

  useEffect(() => {
    if (membership?.membershipStatus === "Active" && membership?.donationStatus !== "Skipped" && user?.uid) {
      const key = `thanks_shown_${user.uid}_${membership.membershipApprovedAt || 'no_date'}`;
      if (!localStorage.getItem(key)) {
        setShowThanks(true);
      }
    }
  }, [membership, user]);

  const handleCloseThanks = () => {
    if (user?.uid) {
      const key = `thanks_shown_${user.uid}_${membership?.membershipApprovedAt || 'no_date'}`;
      localStorage.setItem(key, "true");
    }
    setShowThanks(false);
  };

  const filtered = useMemo(() => {
    let list = seasons;
    if (filter !== "all") list = list.filter((s) => s.status === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (s) => s.cropName.toLowerCase().includes(q) || s.fieldName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [seasons, query, filter]);

  const activeSeasons = seasons.filter((s) => s.status === "active");
  const activeSeasonIds = new Set(activeSeasons.map(s => s.id));
  const activeCount = activeSeasons.length;
  
  const activeExpenses = expenses.filter(e => activeSeasonIds.has(e.seasonId));
  const activeWorkers = workers.filter(w => activeSeasonIds.has(w.seasonId));
  const activeLedgers = advanceLedgers.filter(a => activeSeasonIds.has(a.seasonId));
  const totalSpent = totalExpenses(activeExpenses) + totalWorkerCost(activeWorkers) + totalBhaagidaarAdvance(activeLedgers);

  return (
    <>
      <Screen>
        <div className="pt-2 pb-5">
          <p className="text-[14px] text-[var(--color-ink-faint)]">નમસ્તે 🙏</p>
          <h1 className="text-[24px] font-bold text-[var(--color-ink)] mt-0.5">ખેડૂત ખર્ચ નોંધ</h1>
        </div>

        {isLoaded && seasons.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-[var(--radius-card)] bg-[var(--color-crop-500)] text-white p-4">
              <p className="text-[13px] opacity-90">ચાલુ ખેતી</p>
              <p className="text-[22px] font-bold mt-1 tnum">{activeCount}</p>
            </div>
            <div className="rounded-[var(--radius-card)] bg-[var(--color-soil-500)] text-white p-4">
              <p className="text-[13px] opacity-90">કુલ ખર્ચ</p>
              <p className="text-[20px] font-bold mt-1 tnum">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
        )}

        {isLoaded && (
          <div className="mb-6">
            <h2 className="text-[15px] font-semibold text-[var(--color-ink)] mb-3 px-1">ખેડૂત સાધનો</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/wallet")}
                className="flex flex-col items-start p-4 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm active:scale-95 transition-transform text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--color-crop-50)] flex items-center justify-center text-[var(--color-crop-500)] mb-3">
                  <WalletIcon size={20} />
                </div>
                <h3 className="text-[14.5px] font-semibold text-[var(--color-ink)] mb-1">ખેડૂત વોલેટ</h3>
                <p className="text-[12px] text-[var(--color-ink-faint)] leading-tight">તમારા જરૂરી દસ્તાવેજો સાચવો</p>
              </button>
              
              <button
                onClick={() => navigate("/inventory")}
                className="flex flex-col items-start p-4 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm active:scale-95 transition-transform text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--color-crop-50)] flex items-center justify-center text-[var(--color-crop-500)] mb-3">
                  <CategoryIcon category="fertilizer" size={20} />
                </div>
                <h3 className="text-[14.5px] font-semibold text-[var(--color-ink)] mb-1">સ્ટોક / ગોડાઉન</h3>
                <p className="text-[12px] text-[var(--color-ink-faint)] leading-tight">ખાતર, દવાનો સ્ટોક મેનેજ કરો</p>
              </button>
            </div>
          </div>
        )}

        {isLoaded && seasons.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2 h-12 px-4 rounded-[var(--radius-control)] bg-[var(--color-surface)] border border-[var(--color-border)]">
              <SearchIcon size={19} className="text-[var(--color-ink-faint)] shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="પાક અથવા ખેતર શોધો..."
                className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-[var(--color-ink-faint)] min-w-0"
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="સાફ કરો" className="shrink-0 text-[var(--color-ink-faint)]">
                  <CloseIcon size={17} />
                </button>
              )}
            </div>
          </div>
        )}

        {isLoaded && seasons.length > 0 && (
          <div className="flex gap-2 mb-5 overflow-x-auto">
            {(
              [
                ["all", "બધા"],
                ["active", "ચાલુ"],
                ["harvested", "કપાયેલ"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`shrink-0 h-9 px-4 rounded-full text-[13.5px] font-medium border transition-colors duration-150 ${
                  filter === key
                    ? "bg-[var(--color-crop-500)] text-white border-[var(--color-crop-500)]"
                    : "bg-[var(--color-surface)] text-[var(--color-ink-soft)] border-[var(--color-border)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {!isLoaded ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-[var(--radius-card)] bg-[var(--color-paper-dim)] animate-pulse" />
            ))}
          </div>
        ) : seasons.length === 0 ? (
          <EmptyState
            icon={<NotebookIcon size={30} />}
            title="હજુ કોઈ ખેતી નોંધાઈ નથી"
            description="નીચે '+ નવી ખેતી' બટન દબાવીને તમારી પહેલી ખેતી શરૂ કરો."
            action={
              <button
                onClick={() => navigate("/new-season")}
                className="text-[14px] font-semibold text-[var(--color-crop-500)]"
              >
                હમણાં શરૂ કરો →
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<SearchIcon size={26} />} title="કંઈ મળ્યું નહીં" description="બીજું નામ શોધીને જુઓ." />
        ) : (
          <div className="space-y-3">
            {filtered.map((season) => (
              <SeasonCard
                key={season.id}
                season={season}
                expenses={expenses.filter((e) => e.seasonId === season.id)}
                workers={workers.filter((w) => w.seasonId === season.id)}
                ledgers={advanceLedgers.filter((a) => a.seasonId === season.id)}
              />
            ))}
          </div>
        )}
      </Screen>
      <Fab onClick={() => navigate("/new-season")} />
      <BottomNav />

      <Dialog
        open={showThanks}
        onClose={handleCloseThanks}
        title="ખૂબ ખૂબ આભાર! 💖"
        footer={
          <button
            onClick={handleCloseThanks}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[var(--color-crop-500)] to-[var(--color-crop-600)] text-white font-semibold text-[15px] shadow-sm active:scale-[0.98] transition-transform"
          >
            આગળ વધો
          </button>
        }
      >
        <div className="text-center py-2">
          <div className="w-16 h-16 bg-[var(--color-crop-50)] text-[var(--color-crop-500)] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon size={32} />
          </div>
          <p className="text-[14.5px] text-[var(--color-ink-soft)] leading-relaxed">
            તમારું <strong>₹{membership?.membershipAmount || 300}</strong> નું દાન સફળતાપૂર્વક સ્વીકારવામાં આવ્યું છે.<br/><br/>
            ખેડૂત ખર્ચ એપને સહયોગ કરવા બદલ તમારો ખૂબ ખૂબ આભાર! તમારું આ યોગદાન એપને વધુ સારી બનાવવામાં અને ચાલુ રાખવામાં મદદ કરશે.
          </p>
        </div>
      </Dialog>
    </>
  );
}

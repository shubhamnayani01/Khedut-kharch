import { useMemo, useState, useEffect } from "react";
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
import { HeaderActions } from "../components/HeaderActions";
import { useTranslation } from "../lib/i18n";

export default function Dashboard() {
  const { seasons, expenses, workers, advanceLedgers, isLoaded } = useAppData();
  const { user, membership } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "harvested">("all");
  const [showThanks, setShowThanks] = useState(false);

  useEffect(() => {
    if (
      membership?.membershipStatus === "Active" &&
      membership?.donationStatus !== "Skipped" &&
      membership?.membershipApprovedAt &&
      user?.uid
    ) {
      const key = `thanks_shown_${user.uid}_${membership.membershipApprovedAt}`;
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
        <div className="pt-2 pb-5 flex items-center justify-between">
          <div>
            <p className="text-[14px] text-[var(--color-ink-faint)]">
              {t("greeting")}{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""} 🙏
            </p>
            <h1 className="text-[24px] font-bold text-[var(--color-ink)] mt-0.5">{t("appTitle")}</h1>
          </div>
          <HeaderActions />
        </div>

        {isLoaded && seasons.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-[var(--radius-card)] bg-[var(--color-crop-500)] text-white p-4">
              <p className="text-[13px] opacity-90">{t("activeCrops")}</p>
              <p className="text-[22px] font-bold mt-1 tnum">{activeCount}</p>
            </div>
            <div className="rounded-[var(--radius-card)] bg-[var(--color-soil-500)] text-white p-4">
              <p className="text-[13px] opacity-90">{t("totalSpent")}</p>
              <p className="text-[20px] font-bold mt-1 tnum">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
        )}

        {isLoaded && (
          <div className="mb-6">
            <h2 className="text-[15px] font-semibold text-[var(--color-ink)] mb-3 px-1">{t("farmerTools")}</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/wallet")}
                className="flex flex-col items-start p-4 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm active:scale-95 transition-transform text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--color-crop-50)] flex items-center justify-center text-[var(--color-crop-500)] mb-3">
                  <WalletIcon size={20} />
                </div>
                <h3 className="text-[14.5px] font-semibold text-[var(--color-ink)] mb-1">{t("farmerWallet")}</h3>
                <p className="text-[12px] text-[var(--color-ink-faint)] leading-tight">{t("walletDesc")}</p>
              </button>
              
              <button
                onClick={() => navigate("/inventory")}
                className="flex flex-col items-start p-4 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm active:scale-95 transition-transform text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--color-crop-50)] flex items-center justify-center text-[var(--color-crop-500)] mb-3">
                  <CategoryIcon category="fertilizer" size={20} />
                </div>
                <h3 className="text-[14.5px] font-semibold text-[var(--color-ink)] mb-1">{t("stockGodown")}</h3>
                <p className="text-[12px] text-[var(--color-ink-faint)] leading-tight">{t("stockDesc")}</p>
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
                placeholder={t("searchPlaceholder")}
                className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-[var(--color-ink-faint)] min-w-0"
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Clear" className="shrink-0 text-[var(--color-ink-faint)]">
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
                ["all", t("all")],
                ["active", t("active")],
                ["harvested", t("harvested")],
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
            title={t("noSeasonsYet")}
            description={t("noSeasonsDesc")}
            action={
              <button
                onClick={() => navigate("/new-season")}
                className="text-[14px] font-semibold text-[var(--color-crop-500)]"
              >
                {t("startNow")}
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<SearchIcon size={26} />} title={t("nothingFound")} description={t("tryAnotherSearch")} />
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
        title="Thank you! 💖"
        footer={
          <button
            onClick={handleCloseThanks}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[var(--color-crop-500)] to-[var(--color-crop-600)] text-white font-semibold text-[15px] shadow-sm active:scale-[0.98] transition-transform"
          >
            Continue
          </button>
        }
      >
        <div className="text-center py-2">
          <div className="w-16 h-16 bg-[var(--color-crop-50)] text-[var(--color-crop-500)] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon size={32} />
          </div>
          <p className="text-[14.5px] text-[var(--color-ink-soft)] leading-relaxed">
            Your donation of <strong>₹{membership?.membershipAmount || 300}</strong> has been received.<br/><br/>
            Thank you for supporting Khedut Kharch!
          </p>
        </div>
      </Dialog>
    </>
  );
}

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { Screen, Fab, BottomNav } from "../components/ui/AppShell";
import { SeasonCard } from "../components/SeasonCard";
import { EmptyState } from "../components/ui/EmptyState";
import { SearchIcon, NotebookIcon, CloseIcon } from "../components/icons/UIIcons";
import { formatCurrency } from "../lib/format";
import { totalExpenses } from "../lib/calc";

export default function Dashboard() {
  const { seasons, expenses, isLoaded } = useAppData();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "harvested">("all");

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

  const activeCount = seasons.filter((s) => s.status === "active").length;
  const totalSpent = totalExpenses(expenses);

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
              />
            ))}
          </div>
        )}
      </Screen>
      <Fab onClick={() => navigate("/new-season")} />
      <BottomNav />
    </>
  );
}

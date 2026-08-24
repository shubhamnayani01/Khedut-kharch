import { useNavigate } from "react-router-dom";
import { useAppData } from "../../context/AppDataContext";
import { TopBar, Screen } from "../../components/ui/AppShell";
import { SeasonSwitcher } from "../../components/ui/SeasonSwitcher";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { UserIcon, PlusIcon } from "../../components/icons/UIIcons";
import { formatCurrency, formatDateDMY } from "../../lib/format";

export default function WorkersTab() {
  const navigate = useNavigate();
  const { settings, getSeason, workersForSeason } = useAppData();
  
  const seasonId = settings.activeSeasonId;
  const season = seasonId ? getSeason(seasonId) : undefined;
  const workers = seasonId ? workersForSeason(seasonId).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt) : [];
  const totalCost = workers.reduce((sum, w) => sum + w.total, 0);

  if (!season) {
    return (
      <>
        <TopBar titleContent={<SeasonSwitcher />} />
        <Screen>
          <div className="flex flex-col items-center justify-center pt-20">
            <UserIcon size={48} className="text-[var(--color-ink-faint)] mb-4" />
            <h2 className="text-[17px] font-semibold text-[var(--color-ink)] mb-2">કોઈ ખેતી પસંદ કરેલ નથી</h2>
            <p className="text-[14px] text-[var(--color-ink-faint)] text-center mb-6">
              મજૂરો જોવા માટે ઉપરથી તમારી ખેતી પસંદ કરો અથવા નવી ખેતી ઉમેરો.
            </p>
            <Button onClick={() => navigate("/new-season")}>નવી ખેતી ઉમેરો</Button>
          </div>
        </Screen>
      </>
    );
  }

  return (
    <>
      <TopBar titleContent={<SeasonSwitcher />} />
      <Screen>
        {workers.length > 0 && (
          <div className="mb-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-control)] p-4 flex items-center justify-between">
             <span className="text-[15px] font-medium text-[var(--color-ink-soft)]">કુલ મજૂરી ખર્ચ</span>
             <span className="tnum text-[18px] font-bold text-[var(--color-ink)]">{formatCurrency(totalCost)}</span>
          </div>
        )}

        {workers.length === 0 ? (
          <EmptyState
            icon={<UserIcon size={24} />}
            title="કોઈ મજૂર રેકોર્ડ નથી"
            description="આ ખેતી માટે હજુ સુધી કોઈ મજૂરી ઉમેરી નથી."
          />
        ) : (
          <div className="space-y-3">
            {workers.map((w) => (
              <button
                key={w.id}
                onClick={() => navigate(`/crop/${season.id}/workers/${w.id}/edit`)}
                className="w-full text-left bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-control)] p-3.5 flex items-center gap-3.5 active:scale-[0.98] transition-transform"
              >
                <div className="w-11 h-11 rounded-full bg-[var(--color-paper-dim)] text-[var(--color-ink-soft)] flex flex-col items-center justify-center shrink-0">
                  <span className="text-[15px] font-bold leading-none">{w.workersCount}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[15px] font-semibold text-[var(--color-ink)] truncate">
                      {w.workType}
                    </span>
                    <span className="tnum text-[15px] font-bold text-[var(--color-ink)] shrink-0">
                      {formatCurrency(w.total)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-[var(--color-ink-faint)]">
                    <span className="truncate">{formatDateDMY(w.date)}</span>
                    <span>·</span>
                    <span>₹{w.dailyWage}/મજૂર</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        
        <div className="fixed bottom-[calc(72px+env(safe-area-inset-bottom))] right-4 z-40">
           <button
             onClick={() => navigate(`/crop/${season.id}/workers/new`)}
             className="flex items-center gap-2 h-14 pl-4 pr-5 rounded-full bg-[var(--color-crop-500)] text-white shadow-[var(--shadow-float)] active:bg-[var(--color-crop-600)] transition-transform duration-150 active:scale-95"
           >
             <PlusIcon size={22} />
             <span className="text-[15px] font-semibold">મજૂર ઉમેરો</span>
           </button>
        </div>
      </Screen>
    </>
  );
}

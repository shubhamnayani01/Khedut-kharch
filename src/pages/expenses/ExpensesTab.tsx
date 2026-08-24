import { useNavigate } from "react-router-dom";
import { useAppData } from "../../context/AppDataContext";
import { TopBar, Screen } from "../../components/ui/AppShell";
import { SeasonSwitcher } from "../../components/ui/SeasonSwitcher";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { NotebookIcon, PlusIcon } from "../../components/icons/UIIcons";
import { CategoryIcon } from "../../components/icons/CategoryIcons";
import { formatCurrency, formatDateDMY } from "../../lib/format";
import { EXPENSE_CATEGORIES } from "../../types";

export default function ExpensesTab() {
  const navigate = useNavigate();
  const { settings, getSeason, expensesForSeason } = useAppData();
  
  const seasonId = settings.activeSeasonId;
  const season = seasonId ? getSeason(seasonId) : undefined;
  const expenses = seasonId ? expensesForSeason(seasonId).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt) : [];

  if (!season) {
    return (
      <>
        <TopBar titleContent={<SeasonSwitcher />} />
        <Screen>
          <div className="flex flex-col items-center justify-center pt-20">
            <NotebookIcon size={48} className="text-[var(--color-ink-faint)] mb-4" />
            <h2 className="text-[17px] font-semibold text-[var(--color-ink)] mb-2">કોઈ ખેતી પસંદ કરેલ નથી</h2>
            <p className="text-[14px] text-[var(--color-ink-faint)] text-center mb-6">
              ખર્ચ જોવા માટે ઉપરથી તમારી ખેતી પસંદ કરો અથવા નવી ખેતી ઉમેરો.
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
        {expenses.length === 0 ? (
          <EmptyState
            icon={<NotebookIcon size={24} />}
            title="કોઈ ખર્ચ નથી"
            description="આ ખેતી માટે હજુ સુધી કોઈ ખર્ચ ઉમેર્યો નથી."
          />
        ) : (
          <div className="space-y-3">
            {expenses.map((e) => (
              <button
                key={e.id}
                onClick={() => navigate(`/crop/${season.id}/expense/${e.id}/edit`)}
                className="w-full text-left bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-control)] p-3.5 flex items-center gap-3.5 active:scale-[0.98] transition-transform"
              >
                <div className="w-11 h-11 rounded-full bg-[var(--color-crop-50)] text-[var(--color-crop-500)] flex items-center justify-center shrink-0">
                  <CategoryIcon category={e.category} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[15px] font-semibold text-[var(--color-ink)] truncate">
                      {EXPENSE_CATEGORIES.find((c) => c.id === e.category)?.label || e.category}
                    </span>
                    <span className="tnum text-[15px] font-bold text-[var(--color-ink)] shrink-0">
                      {formatCurrency(e.amount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-[var(--color-ink-faint)]">
                    <span className="truncate">{formatDateDMY(e.date)}</span>
                    {e.description && (
                      <>
                        <span>·</span>
                        <span className="truncate">{e.description}</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        
        <div className="fixed bottom-[calc(72px+env(safe-area-inset-bottom))] right-4 z-40">
           <button
             onClick={() => navigate(`/crop/${season.id}/expense/new`)}
             className="flex items-center gap-2 h-14 pl-4 pr-5 rounded-full bg-[var(--color-crop-500)] text-white shadow-[var(--shadow-float)] active:bg-[var(--color-crop-600)] transition-transform duration-150 active:scale-95"
           >
             <PlusIcon size={22} />
             <span className="text-[15px] font-semibold">ખર્ચ ઉમેરો</span>
           </button>
        </div>
      </Screen>
    </>
  );
}

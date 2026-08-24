import { useNavigate } from "react-router-dom";
import { useAppData } from "../../context/AppDataContext";
import { TopBar, Screen } from "../../components/ui/AppShell";
import { SeasonSwitcher } from "../../components/ui/SeasonSwitcher";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { UsersIcon, PlusIcon, ChevronRightIcon } from "../../components/icons/UIIcons";

export default function BhaagidarTab() {
  const navigate = useNavigate();
  const { settings, getSeason, bhaagidarsForSeason } = useAppData();
  
  const seasonId = settings.activeSeasonId;
  const season = seasonId ? getSeason(seasonId) : undefined;
  const bhaagidars = seasonId ? bhaagidarsForSeason(seasonId) : [];

  if (!season) {
    return (
      <>
        <TopBar titleContent={<SeasonSwitcher />} />
        <Screen>
          <div className="flex flex-col items-center justify-center pt-20">
            <UsersIcon size={48} className="text-[var(--color-ink-faint)] mb-4" />
            <h2 className="text-[17px] font-semibold text-[var(--color-ink)] mb-2">કોઈ ખેતી પસંદ કરેલ નથી</h2>
            <p className="text-[14px] text-[var(--color-ink-faint)] text-center mb-6">
              ભાગીદાર જોવા માટે ઉપરથી તમારી ખેતી પસંદ કરો અથવા નવી ખેતી ઉમેરો.
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
        {bhaagidars.length === 0 ? (
          <EmptyState
            icon={<UsersIcon size={24} />}
            title="કોઈ ભાગીદાર નથી"
            description="આ ખેતી માટે હજુ સુધી કોઈ ભાગીદાર ઉમેર્યા નથી."
          />
        ) : (
          <div className="space-y-3">
            {bhaagidars.map((b) => (
              <button
                key={b.id}
                onClick={() => navigate(`/crop/${season.id}/bhaagidar/${b.id}`)}
                className="w-full text-left bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-control)] p-3.5 flex items-center gap-3.5 active:scale-[0.98] transition-transform"
              >
                <div className="w-11 h-11 rounded-full bg-[var(--color-soil-50)] text-[var(--color-soil-600)] flex items-center justify-center shrink-0 font-bold text-[16px]">
                  {b.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[15.5px] font-semibold text-[var(--color-ink)] truncate">
                      {b.name}
                    </span>
                    <span className="tnum text-[14px] font-bold text-[var(--color-crop-500)] shrink-0">
                      {b.sharePercentage}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-[var(--color-ink-faint)]">
                    {b.mobile ? <span className="truncate">{b.mobile}</span> : <span>નંબર નથી</span>}
                  </div>
                </div>
                <ChevronRightIcon size={18} className="text-[var(--color-ink-faint)]" />
              </button>
            ))}
          </div>
        )}
        
        <div className="fixed bottom-[calc(72px+env(safe-area-inset-bottom))] right-4 z-40">
           <button
             onClick={() => navigate(`/crop/${season.id}/bhaagidar/new`)}
             className="flex items-center gap-2 h-14 pl-4 pr-5 rounded-full bg-[var(--color-crop-500)] text-white shadow-[var(--shadow-float)] active:bg-[var(--color-crop-600)] transition-transform duration-150 active:scale-95"
           >
             <PlusIcon size={22} />
             <span className="text-[15px] font-semibold">ભાગીદાર ઉમેરો</span>
           </button>
        </div>
      </Screen>
    </>
  );
}

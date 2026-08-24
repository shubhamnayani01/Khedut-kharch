import { useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { Dialog } from "./Dialog";

export function SeasonSwitcher() {
  const { seasons, settings, setActiveSeason } = useAppData();
  const activeSeason = seasons.find(s => s.id === settings.activeSeasonId);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-paper-dim)] text-[var(--color-ink)] hover:bg-[var(--color-surface)] active:scale-95 transition-all max-w-[200px]"
      >
        <span className="text-[15.5px] font-semibold truncate">
          {activeSeason ? activeSeason.cropName : "ખેતી પસંદ કરો"}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title="ખેતી પસંદ કરો">
        <div className="space-y-2 mt-2 max-h-[60vh] overflow-y-auto">
          {seasons.map(s => (
            <button
              key={s.id}
              onClick={() => {
                setActiveSeason(s.id);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-[var(--radius-control)] border transition-colors ${s.id === settings.activeSeasonId ? 'border-[var(--color-crop-500)] bg-[var(--color-crop-50)] text-[var(--color-crop-700)]' : 'border-[var(--color-border)] text-[var(--color-ink)]'}`}
            >
              <div className="font-semibold text-[15px]">{s.cropName}</div>
              <div className="text-[13px] opacity-80">{s.fieldName}</div>
            </button>
          ))}
          {seasons.length === 0 && (
             <p className="text-center text-[var(--color-ink-faint)] py-4">કોઈ ખેતી ઉપલબ્ધ નથી.</p>
          )}
        </div>
      </Dialog>
    </>
  );
}

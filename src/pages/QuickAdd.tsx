import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { MicIcon, PlusIcon, AlertIcon } from "../components/icons/UIIcons";

export default function QuickAdd() {
  const { seasons, isLoaded } = useAppData();
  const navigate = useNavigate();
  const [noActive, setNoActive] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const active = seasons
      .filter((s) => s.status === "active")
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    if (active.length > 0) {
      navigate(`/crop/${active[0].id}/expense/new?voice=1`, { replace: true });
    } else {
      setNoActive(true);
    }
  }, [isLoaded, seasons, navigate]);

  if (!isLoaded) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-[var(--color-paper)] px-6">
        <div className="w-16 h-16 rounded-full bg-[var(--color-crop-500)] flex items-center justify-center animate-pulse">
          <MicIcon size={32} className="text-white" />
        </div>
        <p className="text-[15px] font-semibold text-[var(--color-ink)]">
          ખેડૂત ખર્ચ નોંધ
        </p>
        <p className="text-[13px] text-[var(--color-ink-faint)]">
          ઝડપી ખર્ચ ઉમેરી રહ્યા છીએ...
        </p>
        <div className="w-6 h-6 rounded-full border-2 border-[var(--color-crop-500)] border-t-transparent animate-spin" />
      </div>
    );
  }
  if (noActive) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-5 bg-[var(--color-paper)] px-8 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
          <AlertIcon size={30} className="text-amber-600" />
        </div>
        <div>
          <h2 className="text-[18px] font-bold text-[var(--color-ink)] mb-2">
            કોઈ સક્રિય ખેતી નથી
          </h2>
          <p className="text-[14px] text-[var(--color-ink-faint)] leading-relaxed">
            ખર્ચ ઉમેરવા માટે પહેલા એક ખેતી (Season) શરૂ કરો.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => navigate("/new-season", { replace: true })}
            className="h-12 w-full rounded-xl bg-[var(--color-crop-500)] text-white font-semibold text-[15px] flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform"
          >
            <PlusIcon size={18} />
            નવી ખેતી શરૂ કરો
          </button>
          <button
            onClick={() => navigate("/", { replace: true })}
            className="h-12 w-full rounded-xl border border-[var(--color-border)] text-[var(--color-ink-soft)] font-semibold text-[14px] active:bg-[var(--color-paper-dim)]"
          >
            ડૅશબોર્ડ પર જાઓ
          </button>
        </div>
      </div>
    );
  }

  return null;
}

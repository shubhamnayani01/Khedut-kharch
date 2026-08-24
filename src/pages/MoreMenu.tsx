import { useNavigate } from "react-router-dom";
import { TopBar, Screen } from "../components/ui/AppShell";
import { ChartIcon, SettingsIcon, NotebookIcon, UploadIcon } from "../components/icons/UIIcons";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";

export default function MoreMenu() {
  const navigate = useNavigate();
  const { settings } = useAppData();
  const { show } = useToast();
  
  const handleReportClick = () => {
    if (settings.activeSeasonId) {
      navigate(`/crop/${settings.activeSeasonId}/report`);
    } else {
      show("કૃપા કરીને પહેલા ડેશબોર્ડમાંથી ખેતી પસંદ કરો");
    }
  };

  const menu = [
    { label: "રિપોર્ટ અને PDF", icon: NotebookIcon, onClick: handleReportClick },
    { label: "આંકડા (Statistics)", icon: ChartIcon, onClick: () => navigate("/statistics") },
    { label: "સેટિંગ્સ", icon: SettingsIcon, onClick: () => navigate("/settings") },
    { label: "વૉલેટ અને દસ્તાવેજો", icon: UploadIcon, onClick: () => navigate("/wallet") }
  ];

  return (
    <>
      <TopBar title="વધુ (More)" />
      <Screen>
        <div className="space-y-2">
          {menu.map((m, i) => (
             <button 
                key={i}
                onClick={m.onClick}
                className="w-full flex items-center gap-4 p-4 rounded-[var(--radius-control)] bg-[var(--color-surface)] border border-[var(--color-border)] active:scale-[0.98] transition-transform"
             >
                <div className="w-10 h-10 rounded-full bg-[var(--color-paper-dim)] flex items-center justify-center text-[var(--color-ink-soft)]">
                  <m.icon size={20} />
                </div>
                <span className="text-[16px] font-medium text-[var(--color-ink)]">{m.label}</span>
             </button>
          ))}
        </div>
      </Screen>
    </>
  );
}

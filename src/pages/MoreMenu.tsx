import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar, Screen } from "../components/ui/AppShell";
import { Button } from "../components/ui/Button";
import { Dialog } from "../components/ui/Dialog";
import { ChartIcon, SettingsIcon, NotebookIcon, UploadIcon, MessageCircleIcon } from "../components/icons/UIIcons";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";

export default function MoreMenu() {
  const navigate = useNavigate();
  const { settings, submitSupportTicket } = useAppData();
  const { show } = useToast();
  
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportText, setSupportText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    { label: "વૉલેટ અને દસ્તાવેજો", icon: UploadIcon, onClick: () => navigate("/wallet") },
    { label: "સેટિંગ્સ", icon: SettingsIcon, onClick: () => navigate("/settings") },
    { 
      label: "સપોર્ટ (Support)", 
      icon: MessageCircleIcon, 
      onClick: () => setSupportOpen(true)
    }
  ];

  const handleSupportSubmit = async () => {
    if (!supportText.trim()) return;
    setIsSubmitting(true);
    try {
      await submitSupportTicket(supportText);
      show("તમારો મેસેજ મોકલાઈ ગયો છે. અમે જલ્દી સંપર્ક કરીશું.");
      setSupportOpen(false);
      setSupportText("");
    } catch (err) {
      show("મેસેજ મોકલવામાં ભૂલ આવી, ફરી પ્રયાસ કરો.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <Dialog
        open={supportOpen}
        onClose={() => !isSubmitting && setSupportOpen(false)}
        title="મદદ અને સપોર્ટ"
        footer={
          <>
            <Button variant="outline" fullWidth onClick={() => setSupportOpen(false)} disabled={isSubmitting}>
              રદ કરો
            </Button>
            <Button fullWidth onClick={handleSupportSubmit} disabled={!supportText.trim() || isSubmitting}>
              {isSubmitting ? "મોકલાઈ રહ્યું છે..." : "મોકલો"}
            </Button>
          </>
        }
      >
        <p className="text-[13.5px] text-[var(--color-ink-faint)] mb-4 leading-relaxed">
          જો તમને એપ વાપરવામાં કોઈ તકલીફ પડતી હોય અથવા કોઈ પ્રશ્ન હોય, તો નીચે લખીને મોકલો.
        </p>
        <textarea
          value={supportText}
          onChange={(e) => setSupportText(e.target.value)}
          placeholder="તમારી સમસ્યા અહી લખો..."
          disabled={isSubmitting}
          className="w-full h-32 rounded-[var(--radius-control)] border border-[var(--color-border)] p-4 text-[15px] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-crop-500)] resize-none"
        />
      </Dialog>
    </>
  );
}

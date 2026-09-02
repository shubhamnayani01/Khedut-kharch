import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar, Screen } from "../components/ui/AppShell";
import { Button } from "../components/ui/Button";
import { Dialog } from "../components/ui/Dialog";
import { ChartIcon, SettingsIcon, NotebookIcon, UploadIcon, MessageCircleIcon, UserIcon } from "../components/icons/UIIcons";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "../lib/i18n";

export default function MoreMenu() {
  const navigate = useNavigate();
  const { settings, submitSupportTicket } = useAppData();
  const { show } = useToast();
  const { t } = useTranslation();
  
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportText, setSupportText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleReportClick = () => {
    if (settings.activeSeasonId) {
      navigate(`/crop/${settings.activeSeasonId}/report`);
    } else {
      show("Please select a crop from dashboard first");
    }
  };

  const menu = [
    { label: t("accountManagement"), icon: UserIcon, onClick: () => navigate("/account") },
    { label: t("reportsPdf"), icon: NotebookIcon, onClick: handleReportClick },
    { label: t("statistics"), icon: ChartIcon, onClick: () => navigate("/statistics") },
    { label: t("walletDocs"), icon: UploadIcon, onClick: () => navigate("/wallet") },
    { label: t("settings"), icon: SettingsIcon, onClick: () => navigate("/settings") },
    { 
      label: t("support"), 
      icon: MessageCircleIcon, 
      onClick: () => setSupportOpen(true)
    }
  ];

  const handleSupportSubmit = async () => {
    if (!supportText.trim()) return;
    setIsSubmitting(true);
    try {
      await submitSupportTicket(supportText);
      show("Your message has been sent. We will get back to you soon.");
      setSupportOpen(false);
      setSupportText("");
    } catch {
      show("Failed to send message, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <TopBar title={t("more")} />
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
        title={t("helpSupport")}
        footer={
          <>
            <Button variant="outline" fullWidth onClick={() => setSupportOpen(false)} disabled={isSubmitting}>
              {t("cancel")}
            </Button>
            <Button fullWidth onClick={handleSupportSubmit} disabled={!supportText.trim() || isSubmitting}>
              {isSubmitting ? "..." : "Send"}
            </Button>
          </>
        }
      >
        <p className="text-[13.5px] text-[var(--color-ink-faint)] mb-4 leading-relaxed">
          Describe your issue or question below.
        </p>
        <textarea
          value={supportText}
          onChange={(e) => setSupportText(e.target.value)}
          placeholder="Write your issue here..."
          disabled={isSubmitting}
          className="w-full h-32 rounded-[var(--radius-control)] border border-[var(--color-border)] p-4 text-[15px] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-crop-500)] resize-none"
        />
      </Dialog>
    </>
  );
}

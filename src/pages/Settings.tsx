import { useState, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { storage } from "../lib/storage";
import { formatBytes } from "../lib/format";
import { TopBar, Screen, BottomNav } from "../components/ui/AppShell";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Dialog } from "../components/ui/Dialog";
import {
  SunIcon,
  MoonIcon,
  InfoIcon,
  DownloadIcon,
  UploadIcon,
  InstallIcon,
  TrashIcon,
  CheckIcon,
  NotebookIcon,
} from "../components/icons/UIIcons";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../lib/i18n";

export default function Settings() {
  const { settings, updateSettings, seasons, expenses, exportBackup, importBackup, clearAllData } = useAppData();
  const { user, signOutUser, isAdmin, membership } = useAuth();
  const navigate = useNavigate();
  const { show } = useToast();
  const { canInstall, installed, promptInstall } = useInstallPrompt();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { t } = useTranslation();

  const usage = storage.estimateUsageBytes();

  const handleSignOut = async () => {
    setAuthBusy(true);
    try {
      await signOutUser();
      show("Signed out successfully");
      navigate("/login");
    } catch {
      show("Failed to sign out", "error");
    } finally {
      setAuthBusy(false);
    }
  };

  const handleExport = () => {
    const data = exportBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `khedut-kharch-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    show("Backup file downloaded");
  };

  const handleImportFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const payload = JSON.parse(e.target?.result as string);
        const res = importBackup(payload);
        if (res.ok) show("Backup restored successfully");
        else show("Invalid backup file format", "error");
      } catch {
        show("Failed to read JSON file", "error");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <TopBar title={t("settings")} />
      <Screen>
        {/* Language */}
        <SectionLabel>{t("language")}</SectionLabel>
        <Card className="p-2 mb-5">
          <ThemeOption
            icon={<span className="font-bold text-[14px]">ગુ</span>}
            label={t("gujarati")}
            active={(settings.language ?? "gu") === "gu"}
            onClick={() => {
              updateSettings({ language: "gu" });
              show("ભાષા બદલાઈને ગુજરાતી થઈ");
            }}
          />
          <ThemeOption
            icon={<span className="font-bold text-[14px]">EN</span>}
            label={t("english")}
            active={settings.language === "en"}
            onClick={() => {
              updateSettings({ language: "en" });
              show("Language changed to English");
            }}
            last
          />
        </Card>

        {/* Appearance */}
        <SectionLabel>{t("appearance")}</SectionLabel>
        <Card className="p-2 mb-5">
          <ThemeOption
            icon={<SunIcon size={19} />}
            label={t("lightMode")}
            active={settings.theme === "light"}
            onClick={() => updateSettings({ theme: "light" })}
          />
          <ThemeOption
            icon={<MoonIcon size={19} />}
            label={t("darkMode")}
            active={settings.theme === "dark"}
            onClick={() => updateSettings({ theme: "dark" })}
          />
          <ThemeOption
            icon={<InfoIcon size={19} />}
            label={t("systemDefault")}
            active={settings.theme === "system"}
            onClick={() => updateSettings({ theme: "system" })}
            last
          />
        </Card>

        {/* Account */}
        <SectionLabel>{t("account")}</SectionLabel>
        <Card className="p-4 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--color-paper-dim)] flex items-center justify-center text-[var(--color-ink-faint)]">
              {user?.photoURL && !imageError ? (
                <img
                  src={user.photoURL}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold">{user?.displayName?.slice(0, 1) ?? "U"}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-[var(--color-ink)] truncate">
                {user?.displayName ?? "Google User"}
              </p>
              <p className="text-[12.5px] text-[var(--color-ink-faint)] truncate">
                {user?.email ?? ""}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" fullWidth size="md" onClick={() => navigate("/account")}>
              {t("accountManagement")}
            </Button>
            <Button variant="outline" size="md" onClick={handleSignOut} disabled={authBusy}>
              {authBusy ? "..." : t("signOut")}
            </Button>
          </div>
        </Card>

        {/* Membership / Donation */}
        <SectionLabel>{t("membershipStatus")}</SectionLabel>
        <Card className="p-4 mb-5">
          {(() => {
            const hasDonated = membership?.membershipStatus === "Active" && membership?.donationStatus !== "Skipped";

            if (hasDonated) {
              return (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[14px] text-[var(--color-ink-soft)]">Status</span>
                    <span className="text-[13px] font-semibold px-3 py-1 rounded-full bg-[var(--color-crop-100)] text-[var(--color-crop-600)]">
                      {t("supporter")}
                    </span>
                  </div>
                  {membership?.membershipApprovedAt && (
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[14px] text-[var(--color-ink-soft)]">{t("donationDate")}</span>
                      <span className="text-[14px] font-medium text-[var(--color-ink)] tnum">
                        {new Date(membership.membershipApprovedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[14px] text-[var(--color-ink-soft)]">{t("donationAmount")}</span>
                    <span className="text-[14px] font-medium text-[var(--color-ink)]">
                      ₹{membership?.membershipAmount ?? 300}
                    </span>
                  </div>
                  <div className="mt-2 pt-3 border-t border-[var(--color-border)]">
                    <p className="text-[13px] text-[var(--color-crop-700)] leading-relaxed">
                      {t("supportProjectMsg")}
                    </p>
                  </div>
                </>
              );
            }

            return (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[14px] text-[var(--color-ink-soft)]">Status</span>
                  <span className="text-[13px] font-semibold px-3 py-1 rounded-full bg-[var(--color-paper-dim)] text-[var(--color-ink-soft)]">
                    {t("freeUser")}
                  </span>
                </div>
                <div className="mt-2 pt-3 border-t border-[var(--color-border)]">
                  <p className="text-[13px] text-[var(--color-ink-soft)] leading-relaxed mb-3">
                    Support Khedut Kharch app to help us bring new features.
                  </p>
                  <Button variant="primary" fullWidth onClick={() => navigate("/membership/payment")}>
                    {t("supportAppBtn")}
                  </Button>
                </div>
              </>
            );
          })()}
        </Card>

        {/* Admin Panel link */}
        {isAdmin && (
          <>
            <SectionLabel>Admin</SectionLabel>
            <Card className="p-2 mb-5">
              <ActionRow
                icon={<InfoIcon size={19} />}
                label={t("adminPanel")}
                onClick={() => navigate("/admin")}
                last
              />
            </Card>
          </>
        )}

        {/* Backup */}
        <SectionLabel>{t("backup")}</SectionLabel>
        <Card className="p-2 mb-5">
          <ActionRow icon={<DownloadIcon size={19} />} label={t("exportBackup")} onClick={handleExport} />
          <ActionRow
            icon={<UploadIcon size={19} />}
            label={t("restoreBackup")}
            onClick={() => fileRef.current?.click()}
            last
          />
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => handleImportFile(e.target.files?.[0])} />
        </Card>

        {!installed && (
          <>
            <SectionLabel>{t("installApp")}</SectionLabel>
            <Card className="p-2 mb-5">
              <ActionRow
                icon={<InstallIcon size={19} />}
                label={canInstall ? t("installApp") : t("addToHomeScreen")}
                onClick={async () => {
                  if (canInstall) {
                    const accepted = await promptInstall();
                    if (accepted) show("Installing app...");
                  } else {
                    show("Select 'Add to Home Screen' from browser menu");
                  }
                }}
                last
              />
            </Card>
          </>
        )}

        {/* Storage */}
        <SectionLabel>{t("storage")}</SectionLabel>
        <Card className="p-4 mb-5">
          <div className="flex items-center justify-between text-[14px]">
            <span className="text-[var(--color-ink-soft)]">{t("totalCropsCount")}</span>
            <span className="tnum font-medium text-[var(--color-ink)]">{seasons.length}</span>
          </div>
          <div className="flex items-center justify-between text-[14px] mt-2">
            <span className="text-[var(--color-ink-soft)]">{t("totalExpensesCount")}</span>
            <span className="tnum font-medium text-[var(--color-ink)]">{expenses.length}</span>
          </div>
          <div className="flex items-center justify-between text-[14px] mt-2">
            <span className="text-[var(--color-ink-soft)]">{t("usedStorage")}</span>
            <span className="tnum font-medium text-[var(--color-ink)]">{formatBytes(usage)}</span>
          </div>
        </Card>

        {/* About */}
        <SectionLabel>{t("about")}</SectionLabel>
        <Card className="p-4 mb-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-full bg-[var(--color-crop-100)] text-[var(--color-crop-600)] flex items-center justify-center">
              <NotebookIcon size={18} />
            </span>
            <div>
              <p className="text-[15px] font-semibold text-[var(--color-ink)]">{t("appTitle")}</p>
              <p className="text-[12.5px] text-[var(--color-ink-faint)]">v1.0</p>
            </div>
          </div>
          <p className="text-[13.5px] text-[var(--color-ink-faint)] leading-relaxed mt-2">
            Kutch Khedut Kharch — Community project with cloud sync & backup.
          </p>
        </Card>

        <button
          onClick={() => setConfirmClear(true)}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-[var(--radius-control)] text-[var(--color-loss-500)] text-[14.5px] font-medium active:bg-[var(--color-loss-100)] mb-4"
        >
          <TrashIcon size={17} /> {t("clearAllData")}
        </button>
      </Screen>
      <BottomNav />

      <Dialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title={t("clearAllConfirmTitle")}
        footer={
          <>
            <Button variant="outline" fullWidth onClick={() => setConfirmClear(false)}>
              {t("cancel")}
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                clearAllData();
                show("All data cleared");
                setConfirmClear(false);
              }}
            >
              Clear Data
            </Button>
          </>
        }
      >
        {t("clearAllConfirmDesc")}
      </Dialog>
    </>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-[12.5px] font-semibold text-[var(--color-ink-faint)] uppercase tracking-wide mb-2 px-1">{children}</p>;
}

function ThemeOption({
  icon,
  label,
  active,
  onClick,
  last,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  last?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-[12px] transition-colors duration-150 ${!last ? "mb-1" : ""} ${active ? "bg-[var(--color-crop-50)]" : "active:bg-[var(--color-paper-dim)]"}`}
    >
      <span className={active ? "text-[var(--color-crop-500)]" : "text-[var(--color-ink-faint)]"}>{icon}</span>
      <span className={`flex-1 text-left text-[15px] ${active ? "font-semibold text-[var(--color-crop-600)]" : "text-[var(--color-ink)]"}`}>
        {label}
      </span>
      {active && <CheckIcon size={18} className="text-[var(--color-crop-500)]" />}
    </button>
  );
}

function ActionRow({ icon, label, onClick, last }: { icon: ReactNode; label: string; onClick: () => void; last?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-[12px] active:bg-[var(--color-paper-dim)] transition-colors duration-150 ${!last ? "mb-1" : ""}`}
    >
      <span className="text-[var(--color-ink-soft)]">{icon}</span>
      <span className="flex-1 text-left text-[15px] text-[var(--color-ink)]">{label}</span>
    </button>
  );
}

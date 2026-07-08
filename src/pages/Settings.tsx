import { useRef, useState, type ReactNode } from "react";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { TopBar, Screen, BottomNav } from "../components/ui/AppShell";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Dialog } from "../components/ui/Dialog";
import {
  SunIcon,
  MoonIcon,
  DownloadIcon,
  UploadIcon,
  InfoIcon,
  TrashIcon,
  InstallIcon,
  NotebookIcon,
  CheckIcon,
} from "../components/icons/UIIcons";
import type { BackupPayload } from "../types";
import { storage } from "../lib/storage";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Settings() {
  const { settings, updateSettings, exportBackup, importBackup, clearAllData, seasons, expenses } = useAppData();
  const { user, loading: authLoading, signInWithGoogle, signOutUser } = useAuth();
  const { show } = useToast();
  const { canInstall, installed, promptInstall } = useInstallPrompt();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);

  const usage = storage.estimateUsageBytes();

  const getAuthErrorMessage = (error: unknown) => {
    const code = (error as { code?: string })?.code;
    if (code === "auth/network-request-failed") return "ઇન્ટરનેટ કનેક્શન તપાસો";
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return "સાઇન ઇન પ્રક્રિયા બંધ કરી";
    if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") return "ગૂગલ સાઇન ઇનની પ્રક્રિયા માટે રીડાયરેક્ટ કરવામાં આવી રહી છે";
    return "ગૂગલ સાઇન ઇનમાં ભૂલ આવી છે";
  };

  const handleGoogleSignIn = async () => {
    setAuthBusy(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      show(getAuthErrorMessage(error), "error");
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    setAuthBusy(true);
    try {
      await signOutUser();
      show("સાઇન આઉટ થયો");
    } catch {
      show("સાઇન આઉટ કરતી વખતે ભૂલ થઈ", "error");
    } finally {
      setAuthBusy(false);
    }
  };

  const handleExport = () => {
    const payload = exportBackup();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `khedut-kharch-nondh-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    show("બેકઅપ ડાઉનલોડ થયો");
  };

  const handleImportFile = async (file?: File) => {
    if (!file) return;
    try {
      const text = await file.text();
      const payload = JSON.parse(text) as BackupPayload;
      const result = importBackup(payload);
      if (result.ok) show("બેકઅપ પુનઃસ્થાપિત થયો");
      else show("અમાન્ય બેકઅપ ફાઇલ", "error");
    } catch {
      show("ફાઇલ વાંચવામાં ભૂલ", "error");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <>
      <TopBar title="સેટિંગ્સ" />
      <Screen>
        <SectionLabel>દેખાવ</SectionLabel>
        <Card className="p-2 mb-5">
          <ThemeOption
            icon={<SunIcon size={19} />}
            label="લાઇટ મોડ"
            active={settings.theme === "light"}
            onClick={() => updateSettings({ theme: "light" })}
          />
          <ThemeOption
            icon={<MoonIcon size={19} />}
            label="ડાર્ક મોડ"
            active={settings.theme === "dark"}
            onClick={() => updateSettings({ theme: "dark" })}
          />
          <ThemeOption
            icon={<InfoIcon size={19} />}
            label="સિસ્ટમ પ્રમાણે"
            active={settings.theme === "system"}
            onClick={() => updateSettings({ theme: "system" })}
            last
          />
        </Card>

        <SectionLabel>ગૂગલ લોગઈન</SectionLabel>
        <Card className="p-4 mb-5">
          {authLoading ? (
            <p className="text-[14px] text-[var(--color-ink-faint)]">લૉગીન સ્થિતિ ચકાસી રહી છે...</p>
          ) : user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-[var(--color-paper-dim)] flex items-center justify-center text-[var(--color-ink-faint)]">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.displayName?.slice(0, 1) ?? "G"}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-[var(--color-ink)]">{user.displayName ?? "Google વપરાશકર્તા"}</p>
                  <p className="text-[13px] text-[var(--color-ink-faint)] break-words">{user.email ?? "વપરાશકર્તા ઇમેલ ઉપલબ્ધ નથી"}</p>
                </div>
              </div>
              <Button variant="outline" fullWidth size="md" onClick={handleSignOut} disabled={authBusy}>
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[14px] text-[var(--color-ink-faint)]">
                તમારા ગૂગલ એકાઉન્ટથી લોગઈન કરો અને પેજ રિફ્રેશ પછી પણ સત્ર જાળવો.
              </p>
              <Button fullWidth size="md" onClick={handleGoogleSignIn} disabled={authBusy}>
                {authBusy ? "પ્રક્રિયા ચાલે છે..." : "Continue with Google"}
              </Button>
            </div>
          )}
        </Card>

        <SectionLabel>બેકઅપ</SectionLabel>
        <Card className="p-2 mb-5">
          <ActionRow icon={<DownloadIcon size={19} />} label="બેકઅપ એક્સપોર્ટ કરો" onClick={handleExport} />
          <ActionRow
            icon={<UploadIcon size={19} />}
            label="બેકઅપ પુનઃસ્થાપિત કરો"
            onClick={() => fileRef.current?.click()}
            last
          />
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => handleImportFile(e.target.files?.[0])} />
        </Card>

        {!installed && (
          <>
            <SectionLabel>ઇન્સ્ટોલ</SectionLabel>
            <Card className="p-2 mb-5">
              <ActionRow
                icon={<InstallIcon size={19} />}
                label={canInstall ? "એપ્લિકેશન ઇન્સ્ટોલ કરો" : "હોમ સ્ક્રીન પર ઉમેરો"}
                onClick={async () => {
                  if (canInstall) {
                    const accepted = await promptInstall();
                    if (accepted) show("એપ ઇન્સ્ટોલ થઈ રહી છે");
                  } else {
                    show("બ્રાઉઝર મેનુમાંથી 'હોમ સ્ક્રીન પર ઉમેરો' પસંદ કરો");
                  }
                }}
                last
              />
            </Card>
          </>
        )}

        <SectionLabel>સંગ્રહ</SectionLabel>
        <Card className="p-4 mb-5">
          <div className="flex items-center justify-between text-[14px]">
            <span className="text-[var(--color-ink-soft)]">કુલ ખેતી</span>
            <span className="tnum font-medium text-[var(--color-ink)]">{seasons.length}</span>
          </div>
          <div className="flex items-center justify-between text-[14px] mt-2">
            <span className="text-[var(--color-ink-soft)]">કુલ ખર્ચ નોંધ</span>
            <span className="tnum font-medium text-[var(--color-ink)]">{expenses.length}</span>
          </div>
          <div className="flex items-center justify-between text-[14px] mt-2">
            <span className="text-[var(--color-ink-soft)]">વપરાયેલ સંગ્રહ</span>
            <span className="tnum font-medium text-[var(--color-ink)]">{formatBytes(usage)}</span>
          </div>
        </Card>

        <SectionLabel>વિશે</SectionLabel>
        <Card className="p-4 mb-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-full bg-[var(--color-crop-100)] text-[var(--color-crop-600)] flex items-center justify-center">
              <NotebookIcon size={18} />
            </span>
            <div>
              <p className="text-[15px] font-semibold text-[var(--color-ink)]">ખેડૂત ખર્ચ નોંધ</p>
              <p className="text-[12.5px] text-[var(--color-ink-faint)]">આવૃત્તિ 1.0</p>
            </div>
          </div>
          <p className="text-[13.5px] text-[var(--color-ink-faint)] leading-relaxed mt-2">
            આ એપ સંપૂર્ણપણે તમારા ફોનમાં જ કામ કરે છે. કોઈ ડેટા ઇન્ટરનેટ પર મોકલવામાં આવતો નથી.
          </p>
        </Card>

        <button
          onClick={() => setConfirmClear(true)}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-[var(--radius-control)] text-[var(--color-loss-500)] text-[14.5px] font-medium active:bg-[var(--color-loss-100)] mb-4"
        >
          <TrashIcon size={17} /> બધો ડેટા સાફ કરો
        </button>
      </Screen>
      <BottomNav />

      <Dialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="બધો ડેટા સાફ કરવો છે?"
        footer={
          <>
            <Button variant="outline" fullWidth onClick={() => setConfirmClear(false)}>
              રદ કરો
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                clearAllData();
                show("બધો ડેટા સાફ થયો");
                setConfirmClear(false);
              }}
            >
              સાફ કરો
            </Button>
          </>
        }
      >
        તમામ ખેતી અને ખર્ચની નોંધ કાયમ માટે ડિલીટ થશે. બેકઅપ લીધા વગર આગળ ન વધો.
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

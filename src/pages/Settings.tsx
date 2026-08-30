
import { useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
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
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect } from "react";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Settings() {
  const { settings, updateSettings, exportBackup, importBackup, clearAllData, seasons, expenses } = useAppData();
  const { user, signOutUser, isAdmin, membership } = useAuth();
  const navigate = useNavigate();
  const { show } = useToast();
  const { canInstall, installed, promptInstall } = useInstallPrompt();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);

  const usage = storage.estimateUsageBytes();

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

        {/* Account */}
        <SectionLabel>એકાઉન્ટ</SectionLabel>
        <Card className="p-4 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--color-paper-dim)] flex items-center justify-center text-[var(--color-ink-faint)]">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg">{user?.displayName?.slice(0, 1) ?? "U"}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-[var(--color-ink)] truncate">
                {user?.displayName ?? "Google વપરાશકર્તા"}
              </p>
              <p className="text-[12.5px] text-[var(--color-ink-faint)] truncate">
                {user?.email ?? ""}
              </p>
            </div>
          </div>
          <Button variant="outline" fullWidth size="md" onClick={handleSignOut} disabled={authBusy}>
            {authBusy ? "..." : "Sign Out"}
          </Button>
        </Card>

        {/* Support Status */}
        <SectionLabel>સહયોગ</SectionLabel>
        <Card className="p-4 mb-5">
          {(() => {
            const hasDonated = membership?.membershipStatus === "Active" && membership?.donationStatus !== "Skipped";

            if (hasDonated) {
              return (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[14px] text-[var(--color-ink-soft)]">સહયોગ સ્થિતિ</span>
                    <span className="text-[13px] font-semibold px-3 py-1 rounded-full bg-[var(--color-crop-100)] text-[var(--color-crop-600)]">
                      સહયોગી (Supporter)
                    </span>
                  </div>
                  {membership?.membershipApprovedAt && (
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[14px] text-[var(--color-ink-soft)]">દાનની તારીખ</span>
                      <span className="text-[14px] font-medium text-[var(--color-ink)] tnum">
                        {new Date(membership.membershipApprovedAt).toLocaleDateString("gu-IN")}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[14px] text-[var(--color-ink-soft)]">દાનની રકમ</span>
                    <span className="text-[14px] font-medium text-[var(--color-ink)]">
                      ₹{membership?.membershipAmount ?? 300}
                    </span>
                  </div>
                  <div className="mt-2 pt-3 border-t border-[var(--color-border)]">
                    <p className="text-[13px] text-[var(--color-crop-700)] leading-relaxed">
                      ખેડૂત ખર્ચને સહયોગ કરવા બદલ આભાર. તમારું દાન આ પ્રોજેક્ટને ચાલુ રાખવા માટે અમૂલ્ય છે.
                    </p>
                  </div>
                </>
              );
            }

            return (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[14px] text-[var(--color-ink-soft)]">સહયોગ સ્થિતિ</span>
                  <span className="text-[13px] font-semibold px-3 py-1 rounded-full bg-[var(--color-paper-dim)] text-[var(--color-ink-soft)]">
                    કોઈ દાન નથી (No Donation Yet)
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[14px] text-[var(--color-ink-soft)]">દાનની તારીખ</span>
                  <span className="text-[14px] font-medium text-[var(--color-ink-faint)]">—</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[14px] text-[var(--color-ink-soft)]">દાનની રકમ</span>
                  <span className="text-[14px] font-medium text-[var(--color-ink-faint)]">—</span>
                </div>
                <div className="mt-2 pt-3 border-t border-[var(--color-border)]">
                  <p className="text-[13px] text-[var(--color-ink-soft)] leading-relaxed mb-3">
                    તમે ખેડૂત ખર્ચનો મફત ઉપયોગ કરી રહ્યા છો. દાન કરવું વૈકલ્પિક છે અને તે એપની જાળવણી અને નવા ફીચર્સ ઉમેરવામાં મદદ કરે છે.
                  </p>
                  <Button variant="primary" fullWidth onClick={() => navigate("/membership/payment")}>
                    ખેડૂત ખર્ચને સહયોગ કરો
                  </Button>
                </div>
              </>
            );
          })()}
        </Card>

        {/* Admin Panel link — only visible to admin */}
        {isAdmin && (
          <>
            <SectionLabel>એડ્મિન</SectionLabel>
            <Card className="p-2 mb-5">
              <ActionRow
                icon={<InfoIcon size={19} />}
                label="Admin Panel — Membership Management"
                onClick={() => navigate("/admin")}
                last
              />
            </Card>
          </>
        )}

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
            કચ્છ ખેડૂત ખર્ચ — સુરક્ષિત ક્લાઉડ બેકઅપ સાથેનો સમુદાય આધારિત પ્રોજેક્ટ.
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

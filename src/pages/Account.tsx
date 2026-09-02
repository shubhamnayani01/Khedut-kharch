import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";
import { TopBar, Screen, BottomNav } from "../components/ui/AppShell";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Dialog } from "../components/ui/Dialog";
import {
  ShieldIcon,
  CheckCircleIcon,
  LogOutIcon,
  SettingsIcon,
  MessageCircleIcon,
} from "../components/icons/UIIcons";
import { WalletIcon } from "../components/icons/ModuleIcons";
import { useTranslation } from "../lib/i18n";

export default function Account() {
  const { user, signOutUser, isAdmin, membership } = useAuth();
  const { submitSupportTicket } = useAppData();
  const navigate = useNavigate();
  const { show } = useToast();
  const { t } = useTranslation();

  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [supportOpen, setSupportOpen] = useState(false);
  const [supportText, setSupportText] = useState("");
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);

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
      setConfirmSignOut(false);
    }
  };

  const handleSupportSubmit = async () => {
    if (!supportText.trim()) return;
    setIsSubmittingSupport(true);
    try {
      await submitSupportTicket(supportText);
      show("Your message has been sent. We will respond soon.");
      setSupportOpen(false);
      setSupportText("");
    } catch {
      show("Failed to send message, please try again.", "error");
    } finally {
      setIsSubmittingSupport(false);
    }
  };

  const isSupporter =
    membership?.membershipStatus === "Active" &&
    membership?.donationStatus !== "Skipped";

  return (
    <>
      <TopBar title={t("accountManagement")} />
      <Screen>
        {/* Profile Card */}
        <Card className="p-5 mb-5 overflow-hidden relative">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-[var(--color-crop-50)] border-2 border-[var(--color-crop-500)] flex items-center justify-center text-[var(--color-crop-600)] shadow-sm">
                {user?.photoURL && !imageError ? (
                  <img
                    src={user.photoURL}
                    alt=""
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold">
                    {user?.displayName?.slice(0, 1) ?? "U"}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white" title="Verified Google Account">
                <CheckCircleIcon size={12} />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[18px] font-bold text-[var(--color-ink)] truncate">
                  {user?.displayName ?? "Google User"}
                </h2>
                {isAdmin && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 shrink-0">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[13.5px] text-[var(--color-ink-faint)] truncate mt-0.5">
                {user?.email ?? "No Email"}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[12px] text-[var(--color-ink-soft)] bg-[var(--color-paper-dim)] px-2.5 py-1 rounded-md w-fit">
                <ShieldIcon size={14} className="text-emerald-600" />
                <span>{t("googleVerified")}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Membership & Support Status Card */}
        <div className="mb-2">
          <p className="text-[12.5px] font-semibold text-[var(--color-ink-faint)] uppercase tracking-wide mb-2 px-1">
            {t("membershipStatus")}
          </p>
        </div>
        <Card className="p-4 mb-5">
          {isSupporter ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] text-[var(--color-ink-soft)]">Status</span>
                <span className="text-[13px] font-semibold px-3 py-1 rounded-full bg-[var(--color-crop-100)] text-[var(--color-crop-600)] flex items-center gap-1">
                  <CheckCircleIcon size={14} /> {t("supporter")}
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
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] text-[var(--color-ink-soft)]">Account Type</span>
                <span className="text-[13px] font-semibold px-3 py-1 rounded-full bg-[var(--color-paper-dim)] text-[var(--color-ink-soft)]">
                  {t("freeUser")}
                </span>
              </div>
              <p className="text-[13px] text-[var(--color-ink-soft)] leading-relaxed mb-3">
                You are using the free tier of Khedut Kharch. Support our project with a voluntary donation.
              </p>
              <Button variant="primary" fullWidth onClick={() => navigate("/membership/payment")}>
                {t("supportAppBtn")}
              </Button>
            </div>
          )}
        </Card>

        {/* Quick Management Options */}
        <div className="mb-2">
          <p className="text-[12.5px] font-semibold text-[var(--color-ink-faint)] uppercase tracking-wide mb-2 px-1">
            {t("accountManagement")}
          </p>
        </div>
        <Card className="p-2 mb-5">
          <AccountRow
            icon={<SettingsIcon size={19} />}
            label={t("appSettingsDesc")}
            onClick={() => navigate("/settings")}
          />
          <AccountRow
            icon={<WalletIcon size={19} />}
            label={t("savedDocsDesc")}
            onClick={() => navigate("/wallet")}
          />
          <AccountRow
            icon={<MessageCircleIcon size={19} />}
            label={t("helpSupport")}
            onClick={() => setSupportOpen(true)}
          />
          {isAdmin && (
            <AccountRow
              icon={<ShieldIcon size={19} />}
              label={t("adminPanel")}
              onClick={() => navigate("/admin")}
              highlight
              last
            />
          )}
        </Card>

        {/* Sign Out Card */}
        <Card className="p-4 mb-5 border-red-100 bg-red-50/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-red-700 flex items-center gap-1.5">
                <LogOutIcon size={18} /> {t("signOut")}
              </h3>
              <p className="text-[12.5px] text-[var(--color-ink-faint)] mt-0.5">
                {t("signOutDesc")}
              </p>
            </div>
            <button
              onClick={() => setConfirmSignOut(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-[13.5px] shadow-sm active:scale-95 transition-all"
            >
              {t("signOut")}
            </button>
          </div>
        </Card>
      </Screen>

      <BottomNav />

      {/* Sign Out Dialog */}
      <Dialog
        open={confirmSignOut}
        onClose={() => !authBusy && setConfirmSignOut(false)}
        title={t("signOutConfirmTitle")}
        footer={
          <>
            <Button
              variant="outline"
              fullWidth
              onClick={() => setConfirmSignOut(false)}
              disabled={authBusy}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleSignOut}
              disabled={authBusy}
            >
              {authBusy ? "..." : t("signOut")}
            </Button>
          </>
        }
      >
        <p className="text-[14px] text-[var(--color-ink-soft)] leading-relaxed">
          {t("signOutConfirmDesc")} (<strong>{user?.email}</strong>)
        </p>
      </Dialog>

      {/* Support Dialog */}
      <Dialog
        open={supportOpen}
        onClose={() => !isSubmittingSupport && setSupportOpen(false)}
        title={t("helpSupport")}
        footer={
          <>
            <Button
              variant="outline"
              fullWidth
              onClick={() => setSupportOpen(false)}
              disabled={isSubmittingSupport}
            >
              {t("cancel")}
            </Button>
            <Button
              fullWidth
              onClick={handleSupportSubmit}
              disabled={!supportText.trim() || isSubmittingSupport}
            >
              {isSubmittingSupport ? "..." : "Send"}
            </Button>
          </>
        }
      >
        <p className="text-[13.5px] text-[var(--color-ink-faint)] mb-4 leading-relaxed">
          Enter your issue or feedback below.
        </p>
        <textarea
          value={supportText}
          onChange={(e) => setSupportText(e.target.value)}
          placeholder="Describe your issue..."
          disabled={isSubmittingSupport}
          className="w-full h-32 rounded-[var(--radius-control)] border border-[var(--color-border)] p-4 text-[15px] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-crop-500)] resize-none"
        />
      </Dialog>
    </>
  );
}

function AccountRow({
  icon,
  label,
  onClick,
  highlight,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  highlight?: boolean;
  last?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-[12px] active:bg-[var(--color-paper-dim)] transition-colors duration-150 ${
        !last ? "mb-1 border-b border-[var(--color-border)]/40" : ""
      }`}
    >
      <span className={highlight ? "text-purple-600" : "text-[var(--color-ink-soft)]"}>
        {icon}
      </span>
      <span
        className={`flex-1 text-left text-[14.5px] ${
          highlight ? "font-semibold text-purple-900" : "text-[var(--color-ink)]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

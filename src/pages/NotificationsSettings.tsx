import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar, Screen, BottomNav } from "../components/ui/AppShell";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import {
  isNotificationsSupported,
  getNotificationPermission,
  requestNotificationPermission,
  areRemindersEnabled,
  setRemindersEnabled,
  sendTestNotification,
} from "../hooks/useReminderNotifications";

function BellIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ShieldOffIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19.69 14a6.9 6.9 0 0 0 .31-2V5l-8-3-3.16 1.18" />
      <path d="M4.73 4.73 4 5v7c0 6 8 10 8 10a20.29 20.29 0 0 0 5.62-4.38" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function CheckCircleIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function XCircleIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function ClockIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export default function NotificationsSettings() {
  const navigate = useNavigate();
  const { show } = useToast();
  const { membership } = useAuth();

  const supported = isNotificationsSupported();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    getNotificationPermission()
  );
  const [enabled, setEnabled] = useState(areRemindersEnabled());
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    setPermission(getNotificationPermission());
    setEnabled(areRemindersEnabled());
  }, []);

  const handleToggle = async (next: boolean) => {
    if (!supported) {
      show("આ ઉપકરણ/બ્રાઉઝર સૂચનાઓ સપોર્ટ કરતો નથી", "error");
      return;
    }

    if (next && permission !== "granted") {
      setRequesting(true);
      const result = await requestNotificationPermission();
      setPermission(result);
      setRequesting(false);
      if (result !== "granted") {
        show("સૂચના પરવાનગી નહીં. બ્રાઉઝર સેટિંગ્સ તપાસો.", "error");
        return;
      }
    }

    setRemindersEnabled(next);
    setEnabled(next);
    show(next ? "સૂચનાઓ ચાલુ કરી" : "સૂચનાઓ બંધ કરી");
  };

  const handleTest = () => {
    if (permission !== "granted") {
      show("પહેલાં સૂચના ચાલુ કરો", "error");
      return;
    }
    sendTestNotification();
    show("ટેસ્ટ સૂચના મોકલી");
  };

  const membershipExpiry = membership?.membershipExpiresAt;
  const daysLeft = membershipExpiry
    ? Math.ceil((membershipExpiry - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <>
      <TopBar title="સૂચনાઓ / Reminders" onBack={() => navigate("/settings")} />
      <Screen>
        {/* Support status */}
        {!supported && (
          <div className="flex items-center gap-3 p-4 mb-5 rounded-[var(--radius-card)] bg-amber-50 border border-amber-200">
            <ShieldOffIcon size={20} />
            <p className="text-[13.5px] text-amber-800 leading-snug">
              આ બ્રાઉઝર Push Notifications સપોર્ટ કરતો નથી. Chrome/Edge વાપરો.
            </p>
          </div>
        )}

        {/* Main toggle */}
        <p className="text-[12.5px] font-semibold text-[var(--color-ink-faint)] uppercase tracking-wide mb-2 px-1">
          રીમાઈન્ડર સેટિંગ્સ
        </p>
        <Card className="p-4 mb-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--color-crop-50)] flex items-center justify-center text-[var(--color-crop-500)] shrink-0 mt-0.5">
              <BellIcon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-[var(--color-ink)]">
                ખર્ચ નોંધ રીમાઈન્ડર
              </p>
              <p className="text-[13px] text-[var(--color-ink-soft)] leading-snug mt-0.5">
                દર અઠવાડિયે: "આ અઠવાડિયાનો ખર્ચ નોંધ્યો?" — ખર્ચ ભૂલી ન જવાય તે માટે.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={enabled}
                disabled={!supported || requesting}
                onChange={(e) => handleToggle(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-crop-500)] peer-disabled:opacity-50" />
            </label>
          </div>

          {/* Permission status pill */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13.5px] text-[var(--color-ink-soft)]">પરવાનગી સ્થિતિ</span>
            <span className={`flex items-center gap-1 text-[12px] font-semibold px-3 py-1 rounded-full ${
              permission === "granted"
                ? "bg-[var(--color-crop-100)] text-[var(--color-crop-700)]"
                : permission === "denied"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600"
            }`}>
              {permission === "granted" ? <><CheckCircleIcon size={13} /> મંજૂર</> :
               permission === "denied" ? <><XCircleIcon size={13} /> નકાર્યું</> :
               permission === "unsupported" ? <>સપોર્ટ નથી</> : <><ClockIcon size={13} /> પ્રતીક્ષારત</>}
            </span>
          </div>

          {permission === "denied" && (
            <p className="text-[12.5px] text-red-600 leading-snug mb-3">
              સૂચના નકારી દેવાઈ છે. Chrome → Site Settings → Notifications → Allow.
            </p>
          )}

          <Button
            variant="outline"
            fullWidth
            onClick={handleTest}
            disabled={permission !== "granted"}
          >
            ટેસ્ટ સૂચના મોકલો
          </Button>
        </Card>

        {/* Membership reminder info */}
        <p className="text-[12.5px] font-semibold text-[var(--color-ink-faint)] uppercase tracking-wide mb-2 px-1">
          સભ્યપદ રીમાઈન્ડર
        </p>
        <Card className="p-4 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-saffron-50,_#fffbeb)] flex items-center justify-center text-[var(--color-saffron-500,_#f59e0b)] shrink-0">
              <BellIcon size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-[var(--color-ink)]">
                સભ્યપદ સમાપ્તિ ચેતવણી
              </p>
              <p className="text-[13px] text-[var(--color-ink-soft)] leading-snug mt-0.5">
                સભ્યપદ સમાપ્ત થવાના 7 દિવસ પહેલાં સ્વતઃ ચેતવણી મળશે.
              </p>
              {daysLeft !== null && daysLeft > 0 && (
                <p className="text-[12.5px] font-medium text-[var(--color-ink-soft)] mt-2">
                  વર્તમાન સ્થિતિ: <strong className={daysLeft <= 7 ? "text-amber-600" : "text-[var(--color-crop-600)]"}>{daysLeft} દિવસ બાકી</strong>
                </p>
              )}
              <p className="text-[12px] text-[var(--color-ink-faint)] mt-2 leading-snug">
                (ઉપર "ખર્ચ નોંધ રીમાઈન્ડર" ચાલુ હોવું જોઈએ)
              </p>
            </div>
          </div>
        </Card>

        {/* How it works */}
        <p className="text-[12.5px] font-semibold text-[var(--color-ink-faint)] uppercase tracking-wide mb-2 px-1">
          કઈ રીતે કામ કરે?
        </p>
        <Card className="p-4 mb-5">
          <ul className="space-y-2 text-[13px] text-[var(--color-ink-soft)] leading-relaxed">
            <li>• <strong>ઓફ-લાઈન</strong>: આ PWA ઍપ ખુલ્લી હોય ત્યારે 7 દિવસ ચેક કરે</li>
            <li>• <strong>ડૅટા</strong>: રીમાઈન્ડર ડૅટા ફક્ત ઉપકરણ પર સચવાય, ક્યાંય ન જાય</li>
            <li>• <strong>Chrome/Edge</strong> : ઍપ ઇન્સ્ટૉલ કરો (Add to Home Screen) — ઉત્તમ અનુભવ</li>
          </ul>
        </Card>
      </Screen>
      <BottomNav />
    </>
  );
}

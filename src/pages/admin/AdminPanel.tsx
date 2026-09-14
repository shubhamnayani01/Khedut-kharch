import { useEffect, useState, useCallback, useRef } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import type { MembershipStatus } from "../../types";
import { ShieldIcon, RefreshIcon, CheckCircleIcon, XCircleIcon, MessageCircleIcon, CheckIcon, TrashIcon, LockIcon, BellIcon, UserIcon, UsersIcon, HourglassIcon, RupeeIcon, AlertIcon, HeartIcon } from "../../components/icons/UIIcons";
import { useAdminNotifications } from "../../hooks/useAdminNotifications";

interface SupportTicket {
  id: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  message: string;
  status: "open" | "resolved";
  createdAt: number;
}

interface MemberUser {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  membershipStatus: MembershipStatus;
  membershipAmount: number;
  paymentProof?: string;
  paymentMethod?: string;
  paymentReference?: string;
  paymentSubmittedAt?: number;
  membershipStartedAt?: number;
  membershipExpiresAt?: number;
  membershipApprovedAt?: number;
  approvedBy?: string;
  renewalCount: number;
  donationStatus?: string;
}

type Tab = "Pending" | "Active" | "Expired" | "Rejected" | "Banned" | "Expiring";

function toMs(val: unknown): number | undefined {
  if (!val) return undefined;
  if (typeof val === "number") return val;
  if (val && typeof val === "object" && "toMillis" in val) {
    return (val as Timestamp).toMillis();
  }
  return undefined;
}

function fmt(ms?: number): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("gu-IN");
}

function fmtDateTime(ms?: number): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleString("gu-IN");
}

const ADMIN_PIN = "0110";
const MAX_ATTEMPTS = 3;
const LOCKOUT_SECONDS = 30;
const LOCKOUT_KEY = "admin_lockout_until";
const ATTEMPTS_KEY = "admin_lockout_attempts";

function AdminPinLock({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState(["" , "", "", ""]);
  const [shake, setShake] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Derive lockout state from sessionStorage on every render tick
  const getLockoutRemaining = () => {
    const until = parseInt(sessionStorage.getItem(LOCKOUT_KEY) ?? "0", 10);
    return Math.max(0, Math.ceil((until - Date.now()) / 1000));
  };

  const [countdown, setCountdown] = useState(() => getLockoutRemaining());
  const [attempts, setAttempts] = useState(() => {
    return parseInt(sessionStorage.getItem(ATTEMPTS_KEY) ?? "0", 10);
  });

  const locked = countdown > 0;

  // Focus first input on mount (only if not locked)
  useEffect(() => {
    if (!locked) inputRefs.current[0]?.focus();
  }, [locked]);

  // Tick the countdown every second using the real clock
  useEffect(() => {
    if (!locked) return;
    const interval = setInterval(() => {
      const remaining = getLockoutRemaining();
      setCountdown(remaining);
      if (remaining === 0) {
        sessionStorage.removeItem(LOCKOUT_KEY);
        sessionStorage.removeItem(ATTEMPTS_KEY);
        clearInterval(interval);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    }, 500); // poll every 500ms so it's accurate
    return () => clearInterval(interval);
  }, [locked]);

  const handleDigit = (index: number, value: string) => {
    if (locked) return;
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...pin];
    next[index] = digit;
    setPin(next);
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
    if (digit && index === 3) {
      const entered = [...next].join("");
      if (entered === ADMIN_PIN) {
        sessionStorage.removeItem(LOCKOUT_KEY);
        sessionStorage.removeItem(ATTEMPTS_KEY);
        onUnlock();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        sessionStorage.setItem(ATTEMPTS_KEY, String(newAttempts));
        setShake(true);
        setTimeout(() => setShake(false), 600);
        if (newAttempts >= MAX_ATTEMPTS) {
          const until = Date.now() + LOCKOUT_SECONDS * 1000;
          sessionStorage.setItem(LOCKOUT_KEY, String(until));
          setCountdown(LOCKOUT_SECONDS);
          setError(`ઘણા ખોટા પ્રયાસ — ${LOCKOUT_SECONDS} સેકન્ડ રાહ જુઓ.`);
        } else {
          setError(`ખોટો PIN. ${MAX_ATTEMPTS - newAttempts} પ્રયાસ બાકી.`);
        }
        setPin(["", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "linear-gradient(135deg, #0d1f12 0%, #1a2e1f 50%, #0a1a0d 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}>
      <style>{`
        @keyframes pinShake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-10px); }
          30% { transform: translateX(10px); }
          45% { transform: translateX(-8px); }
          60% { transform: translateX(8px); }
          75% { transform: translateX(-4px); }
          90% { transform: translateX(4px); }
        }
        @keyframes pinFadeIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes lockPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.25); }
          50% { box-shadow: 0 0 0 16px rgba(74,222,128,0); }
        }
        .pin-input:focus { outline: none; border-color: #4ade80 !important; background: rgba(74,222,128,0.08) !important; }
        .pin-digit-btn { transition: transform 0.1s; }
        .pin-digit-btn:active { transform: scale(0.92); }
      `}</style>

      <div style={{
        width: "100%", maxWidth: "340px",
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "28px",
        border: "1px solid rgba(255,255,255,0.1)",
        padding: "40px 32px 36px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(74,222,128,0.1)",
        animation: "pinFadeIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        textAlign: "center",
      }}>
        {/* Lock icon */}
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(74,222,128,0.2), rgba(34,197,94,0.1))",
          border: "1.5px solid rgba(74,222,128,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
          animation: "lockPulse 2.5s ease-in-out infinite",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "white", margin: "0 0 6px", letterSpacing: "-0.3px" }}>
          Admin Panel
        </h1>
        <p style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.45)", margin: "0 0 32px" }}>
          ખેડૂત ખર્ચ — PIN દાખલ કરો
        </p>

        {/* PIN dots */}
        <div
          style={{
            display: "flex", gap: "12px", justifyContent: "center", marginBottom: "10px",
            animation: shake ? "pinShake 0.5s ease" : "none",
          }}
        >
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={locked}
              className="pin-input"
              style={{
                width: "58px", height: "58px",
                borderRadius: "14px",
                border: `2px solid ${digit ? "rgba(74,222,128,0.6)" : "rgba(255,255,255,0.12)"}`,
                background: digit ? "rgba(74,222,128,0.08)" : "rgba(255,255,255,0.04)",
                color: "white",
                fontSize: "24px",
                textAlign: "center",
                fontWeight: 700,
                transition: "all 0.2s",
                cursor: locked ? "not-allowed" : "text",
              }}
            />
          ))}
        </div>

        {/* Error / countdown */}
        <div style={{ minHeight: "28px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
          {locked ? (
            <p style={{ fontSize: "13px", color: "#f87171", margin: 0 }}>
              🔒 {countdown}s પછી ફરી પ્રયાસ કરો
            </p>
          ) : error ? (
            <p style={{ fontSize: "13px", color: "#f87171", margin: 0 }}>{error}</p>
          ) : null}
        </div>

        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", margin: "16px 0 0" }}>
          4-digit PIN દાખલ કરો
        </p>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [pinVerified, setPinVerified] = useState(false);
  const [users, setUsers] = useState<MemberUser[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [viewMode, setViewMode] = useState<"memberships" | "feedback">("memberships");
  const [loading, setLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("Pending");
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);

  const { notifs, unreadCount, markRead, markAllRead } = useAdminNotifications(pinVerified);

  // ── Session timeout: auto-lock PIN after 10 min of inactivity ──
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      setPinVerified(false);
    }, 10 * 60 * 1000); // 10 minutes
  }, []);
  useEffect(() => {
    if (!pinVerified) return;
    const events = ["click", "keydown", "touchstart", "scroll"];
    events.forEach(e => window.addEventListener(e, resetInactivityTimer));
    resetInactivityTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [pinVerified, resetInactivityTimer]);

  const grantSupporterStatus = async (uid: string, amount = 300) => {
    setActionBusy(uid + "_supporter");
    setError("");
    try {
      const now = Date.now();
      const expiresAt = now + 365 * 24 * 60 * 60 * 1000;
      await updateDoc(doc(db, "users", uid), {
        membershipStatus: "Active",
        membershipType: "Annual",
        membershipAmount: amount,
        membershipStartedAt: Timestamp.fromMillis(now),
        membershipExpiresAt: Timestamp.fromMillis(expiresAt),
        membershipApprovedAt: Timestamp.fromMillis(now),
        approvedBy: user?.uid ?? "admin",
        donationStatus: "Donated",
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === uid
            ? {
              ...u,
              membershipStatus: "Active",
              membershipAmount: amount,
              membershipStartedAt: now,
              membershipExpiresAt: expiresAt,
              membershipApprovedAt: now,
              approvedBy: user?.uid ?? "admin",
              donationStatus: "Donated",
            }
            : u
        )
      );
    } catch (err) {
      console.error(err);
      setError("Supporter સ્ટેટસ અપડેટ કરવામાં ભૂલ આવી.");
    } finally {
      setActionBusy(null);
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const list: MemberUser[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        if (!d.membershipStatus) return;
        list.push({
          uid: docSnap.id,
          name: d.name ?? null,
          email: d.email ?? null,
          photoURL: d.photoURL ?? null,
          membershipStatus: d.membershipStatus as MembershipStatus,
          membershipAmount: d.membershipAmount ?? 300,
          paymentProof: d.paymentProof ?? undefined,
          paymentMethod: d.paymentMethod ?? undefined,
          paymentReference: d.paymentReference ?? undefined,
          paymentSubmittedAt: toMs(d.paymentSubmittedAt),
          membershipStartedAt: toMs(d.membershipStartedAt),
          membershipExpiresAt: toMs(d.membershipExpiresAt),
          membershipApprovedAt: toMs(d.membershipApprovedAt),
          approvedBy: d.approvedBy ?? undefined,
          renewalCount: typeof d.renewalCount === "number" ? d.renewalCount : 0,
          donationStatus: d.donationStatus ?? undefined,
        });
      });
      // Sort by most recently submitted
      list.sort((a, b) => (b.paymentSubmittedAt ?? 0) - (a.paymentSubmittedAt ?? 0));
      setUsers(list);
    } catch (err) {
      console.error(err);
      setError("ડેટા લોડ કરવામાં ભૂલ આવી.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    setTicketsLoading(true);
    try {
      const snap = await getDocs(collection(db, "feedback"));
      const list: SupportTicket[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          uid: d.uid,
          email: d.email ?? null,
          displayName: d.displayName ?? null,
          phoneNumber: d.phoneNumber ?? null,
          message: d.message ?? "",
          status: d.status ?? "open",
          createdAt: toMs(d.createdAt) ?? 0,
        });
      });
      list.sort((a, b) => b.createdAt - a.createdAt);
      setTickets(list);
    } catch (err) {
      console.error(err);
      setError("ટિકિટ લોડ કરવામાં ભૂલ આવી.");
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!pinVerified) return;
    if (viewMode === "memberships") void fetchUsers();
    else void fetchTickets();
  }, [pinVerified, viewMode, fetchUsers, fetchTickets]);

  if (!pinVerified) {
    return <AdminPinLock onUnlock={() => setPinVerified(true)} />;
  }

  const resolveTicket = async (id: string) => {
    setActionBusy(id + "_resolve");
    try {
      await updateDoc(doc(db, "feedback", id), { status: "resolved" });
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "resolved" } : t));
    } catch (err) {
      console.error(err);
      setError("ટિકિટ અપડેટ કરવામાં ભૂલ આવી.");
    } finally {
      setActionBusy(null);
    }
  };

  const approveMembership = async (uid: string) => {
    setActionBusy(uid + "_approve");
    setError("");
    try {
      const now = Date.now();
      const expiresAt = now + 365 * 24 * 60 * 60 * 1000;
      await updateDoc(doc(db, "users", uid), {
        membershipStatus: "Active",
        membershipType: "Annual",
        membershipStartedAt: Timestamp.fromMillis(now),
        membershipExpiresAt: Timestamp.fromMillis(expiresAt),
        membershipApprovedAt: Timestamp.fromMillis(now),
        approvedBy: user?.uid ?? "admin",
      });
      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === uid
            ? {
              ...u,
              membershipStatus: "Active",
              membershipStartedAt: now,
              membershipExpiresAt: expiresAt,
              membershipApprovedAt: now,
              approvedBy: user?.uid ?? "admin",
            }
            : u
        )
      );
    } catch (err) {
      console.error(err);
      setError("Approve કરવામાં ભૂલ આવી.");
    } finally {
      setActionBusy(null);
    }
  };

  const rejectMembership = async (uid: string) => {
    setActionBusy(uid + "_reject");
    setError("");
    try {
      await updateDoc(doc(db, "users", uid), {
        membershipStatus: "Rejected",
        membershipStartedAt: null,
        membershipExpiresAt: null,
        membershipApprovedAt: null,
        approvedBy: null,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === uid
            ? {
              ...u,
              membershipStatus: "Rejected",
              membershipStartedAt: undefined,
              membershipExpiresAt: undefined,
              membershipApprovedAt: undefined,
              approvedBy: undefined,
            }
            : u
        )
      );
    } catch (err) {
      console.error(err);
      setError("Reject કરવામાં ભૂલ આવી.");
    } finally {
      setActionBusy(null);
    }
  };

  const filtered = users.filter((u) => {
    let matchesTab: boolean;
    if (tab === "Expiring") {
      matchesTab =
        u.membershipStatus === "Active" &&
        !!u.membershipExpiresAt &&
        u.membershipExpiresAt - Date.now() < 30 * 24 * 60 * 60 * 1000;
    } else {
      matchesTab = u.membershipStatus === tab;
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesTab;
    return matchesTab && (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.paymentReference && u.paymentReference.toLowerCase().includes(q)) ||
      u.uid.toLowerCase().includes(q)
    );
  });

  const banUser = async (uid: string) => {
    if (uid === user?.uid) {
      alert("તમે તમારા પોતાના એકાઉન્ટને બેન કરી શકતા નથી.");
      return;
    }
    if (!window.confirm("શું તમે ખરેખર આ યુઝરને બેન કરવા માંગો છો?")) return;
    setActionBusy(uid + "_ban");
    setError("");
    try {
      await updateDoc(doc(db, "users", uid), { membershipStatus: "Banned" });
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, membershipStatus: "Banned" } : u)));
    } catch (err) {
      console.error(err);
      setError("બેન કરવામાં ભૂલ આવી. (" + (err instanceof Error ? err.message : String(err)) + ")");
    } finally {
      setActionBusy(null);
    }
  };

  const unbanUser = async (uid: string) => {
    if (!window.confirm("શું તમે આ યુઝરનો બેન હટાવવા માંગો છો?")) return;
    setActionBusy(uid + "_unban");
    setError("");
    try {
      await updateDoc(doc(db, "users", uid), { membershipStatus: "Pending" });
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, membershipStatus: "Pending" } : u)));
    } catch (err) {
      console.error(err);
      setError("Unban કરવામાં ભૂલ આવી. (" + (err instanceof Error ? err.message : String(err)) + ")");
    } finally {
      setActionBusy(null);
    }
  };

  const deleteUserProfile = async (uid: string) => {
    if (uid === user?.uid) {
      alert("તમે તમારા પોતાના એકાઉન્ટને ડીલીટ કરી શકતા નથી.");
      return;
    }
    if (!window.confirm("આ યુઝર પ્રોફાઈલ હંમેશા માટે ડીલીટ થઈ જશે. શું તમે ખરેખર ડીલીટ કરવા માંગો છો?")) return;
    setActionBusy(uid + "_delete");
    setError("");
    try {
      await deleteDoc(doc(db, "users", uid));
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
    } catch (err) {
      console.error(err);
      setError("ડીલીટ કરવામાં ભૂલ આવી. (" + (err instanceof Error ? err.message : String(err)) + ")");
    } finally {
      setActionBusy(null);
    }
  };

  // ── Derived stats ──
  const totalUsers = users.length;
  const activeCount = users.filter(u => u.membershipStatus === "Active").length;
  const pendingCount = users.filter(u => u.membershipStatus === "Pending").length;
  const totalRevenue = users
    .filter(u => u.membershipStatus === "Active" && u.paymentSubmittedAt)
    .reduce((sum, u) => sum + (u.membershipAmount ?? 0), 0);
  const expiringCount = users.filter(u => {
    if (u.membershipStatus !== "Active") return false;
    const exp = u.membershipExpiresAt;
    if (!exp) return false;
    return exp - Date.now() < 30 * 24 * 60 * 60 * 1000;
  }).length;

  const TABS: { key: Tab; label: string; color: string }[] = [
    { key: "Pending", label: "Pending", color: "var(--color-saffron-500)" },
    { key: "Active", label: "Active", color: "var(--color-crop-500)" },
    { key: "Expiring", label: "Expiring Soon", color: "#f97316" },
    { key: "Expired", label: "Expired", color: "var(--color-loss-500)" },
    { key: "Rejected", label: "Rejected", color: "var(--color-ink-faint)" },
    { key: "Banned", label: "Banned", color: "var(--color-loss-600)" },
  ];

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--color-paper)",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            height: "60px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "0 16px",
          }}
        >
          <ShieldIcon size={26} className="text-[var(--color-loss-500)]" />
          <div>
            <h1
              style={{
                fontSize: "17px",
                fontWeight: 700,
                color: "var(--color-ink)",
                margin: 0,
                lineHeight: 1,
              }}
            >
              Admin Panel
            </h1>
            <p style={{ fontSize: "11.5px", color: "var(--color-ink-faint)", margin: 0 }}>
              ખેડૂત ખર્ચ — Membership Management
            </p>
          </div>

          {/* Refresh */}
          <button
            onClick={() => {
              if (viewMode === "memberships") fetchUsers();
              else fetchTickets();
            }}
            style={{
              marginLeft: "auto",
              height: "34px",
              padding: "0 14px",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
              background: "var(--color-paper)",
              color: "var(--color-ink-soft)",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><RefreshIcon size={14} /> Refresh</div>
          </button>

          {/* Bell / Notifications */}
          <button
            onClick={() => { setNotifOpen(o => !o); if (!notifOpen) markAllRead(); }}
            style={{
              position: "relative",
              width: "38px", height: "38px",
              borderRadius: "10px",
              border: "1px solid var(--color-border)",
              background: notifOpen ? "var(--color-crop-50)" : "var(--color-paper)",
              color: notifOpen ? "var(--color-crop-600)" : "var(--color-ink-soft)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 0.15s",
            }}
            title="Notifications"
          >
            <BellIcon size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: "-5px", right: "-5px",
                minWidth: "18px", height: "18px",
                borderRadius: "99px",
                background: "var(--color-loss-500)",
                color: "white",
                fontSize: "10px", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 4px",
                border: "2px solid var(--color-surface)",
                animation: "bellPulse 1s ease infinite",
              }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notification Panel */}
        {notifOpen && (
          <div style={{
            position: "absolute", top: "60px", right: 0, left: 0,
            zIndex: 50,
            background: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            maxHeight: "420px", overflowY: "auto",
          }}>
            <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0 10px" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-ink)", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                  <BellIcon size={16} /> Notifications
                </p>
                {notifs.length > 0 && (
                  <button onClick={markAllRead} style={{ fontSize: "12px", color: "var(--color-crop-600)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    બધા વાંચ્યા
                  </button>
                )}
              </div>

              {notifs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "28px 0", color: "var(--color-ink-faint)", fontSize: "13px" }}>
                  કોઈ notification નથી
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingBottom: "12px" }}>
                  {notifs.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      style={{
                        display: "flex", flexDirection: "column", gap: "8px",
                        padding: "12px",
                        borderRadius: "12px",
                        background: n.read ? "var(--color-paper)" : "var(--color-crop-50)",
                        border: `1px solid ${n.read ? "var(--color-border)" : "var(--color-crop-200, #bbf7d0)"}`,
                        cursor: "default",
                        transition: "background 0.2s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                        {/* Icon */}
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                          background: n.type === "new_payment" ? "var(--color-saffron-100)" : "var(--color-crop-100)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {n.type === "new_payment"
                            ? <RupeeIcon size={20} className="text-[var(--color-saffron-600)]" />
                            : <UserIcon size={16} className="text-[var(--color-crop-600)]" />}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-ink)", margin: "0 0 2px", display: "flex", alignItems: "center", gap: "4px" }}>
                            {n.type === "new_payment" ? <><RupeeIcon size={14} /> નવી ચૂકવણી</> : <><UserIcon size={14} /> નવો યુઝર</>}
                          </p>
                          <p style={{ fontSize: "12.5px", color: "var(--color-ink-soft)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {n.name}
                            {n.type === "new_payment" && n.amount && ` — ₹${n.amount}`}
                          </p>
                          <p style={{ fontSize: "11px", color: "var(--color-ink-faint)", margin: "2px 0 0" }}>
                            {new Date(n.timestamp).toLocaleString("gu-IN")}
                          </p>
                        </div>

                        {/* Unread dot */}
                        {!n.read && (
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-crop-500)", flexShrink: 0, marginTop: "4px" }} />
                        )}
                      </div>

                      {/* Approve / Reject buttons for payment notifications */}
                      {n.type === "new_payment" && (
                        <div style={{ display: "flex", gap: "8px", paddingLeft: "46px" }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); void approveMembership(n.uid); markRead(n.id); setNotifOpen(false); setTab("Pending"); setViewMode("memberships"); }}
                            disabled={!!actionBusy}
                            style={{
                              flex: 1, height: "34px", borderRadius: "8px",
                              background: "linear-gradient(135deg, var(--color-crop-500), var(--color-crop-600))",
                              color: "white", border: "none",
                              fontSize: "12.5px", fontWeight: 600, cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                            }}
                          >
                            <CheckCircleIcon size={13} /> Approve
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); void rejectMembership(n.uid); markRead(n.id); setNotifOpen(false); setTab("Pending"); setViewMode("memberships"); }}
                            disabled={!!actionBusy}
                            style={{
                              flex: 1, height: "34px", borderRadius: "8px",
                              background: "var(--color-loss-100)",
                              color: "var(--color-loss-600)",
                              border: "1px solid var(--color-loss-300, #fca5a5)",
                              fontSize: "12.5px", fontWeight: 600, cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                            }}
                          >
                            <XCircleIcon size={13} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "20px 16px 48px",
        }}
      >
        {error && (
          <div
            style={{
              background: "var(--color-loss-100)",
              border: "1px solid var(--color-loss-400)",
              borderRadius: "10px",
              padding: "10px 14px",
              marginBottom: "16px",
            }}
          >
            <p style={{ fontSize: "13.5px", color: "var(--color-loss-600)", margin: 0 }}>{error}</p>
          </div>
        )}

        {/* ── Stats Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          {[
            { label: "કુલ યુઝર", value: totalUsers, icon: <UsersIcon size={20} />, color: "var(--color-crop-500)" },
            { label: "Active Members", value: activeCount, icon: <CheckCircleIcon size={20} />, color: "var(--color-crop-600)" },
            { label: "Pending", value: pendingCount, icon: <HourglassIcon size={20} />, color: "var(--color-saffron-500)" },
            { label: "કુલ Revenue", value: `₹${totalRevenue}`, icon: <RupeeIcon size={20} />, color: "#16a34a" },
          ].map((s, idx) => (
            <div key={idx} style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "14px",
              padding: "14px",
              boxShadow: "var(--shadow-card)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ display: "flex", alignItems: "center", color: s.color }}>{s.icon}</span>
                <p style={{ fontSize: "12px", color: "var(--color-ink-faint)", margin: 0 }}>{s.label}</p>
              </div>
              <p style={{ fontSize: "22px", fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>
        {expiringCount > 0 && (
          <div style={{
            background: "#fff7ed", border: "1px solid #fed7aa",
            borderRadius: "10px", padding: "10px 14px", marginBottom: "16px",
            display: "flex", alignItems: "center", gap: "8px"
          }}>
            <AlertIcon size={20} className="text-[#ea580c]" />
            <p style={{ fontSize: "13px", color: "#c2410c", margin: 0 }}>
              <strong>{expiringCount}</strong> સભ્ય(ઓ)ની membership 30 દિવસમાં expire થશે
            </p>
            <button onClick={() => { setTab("Expiring"); setViewMode("memberships"); }}
              style={{ marginLeft: "auto", fontSize: "12px", color: "#c2410c", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
              જુઓ →
            </button>
          </div>
        )}

        {/* View Mode Toggle */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button
            onClick={() => setViewMode("memberships")}
            style={{
              flex: 1,
              height: "40px",
              borderRadius: "10px",
              background: viewMode === "memberships" ? "var(--color-crop-500)" : "var(--color-surface)",
              color: viewMode === "memberships" ? "white" : "var(--color-ink-soft)",
              border: `1px solid ${viewMode === "memberships" ? "var(--color-crop-500)" : "var(--color-border)"}`,
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            સભ્યપદ (Memberships)
          </button>
          <button
            onClick={() => setViewMode("feedback")}
            style={{
              flex: 1,
              height: "40px",
              borderRadius: "10px",
              background: viewMode === "feedback" ? "var(--color-crop-500)" : "var(--color-surface)",
              color: viewMode === "feedback" ? "white" : "var(--color-ink-soft)",
              border: `1px solid ${viewMode === "feedback" ? "var(--color-crop-500)" : "var(--color-border)"}`,
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            <MessageCircleIcon size={16} /> સપોર્ટ ટિકિટ્સ
            {tickets.filter(t => t.status === "open").length > 0 && (
              <span style={{ background: viewMode === "feedback" ? "white" : "var(--color-loss-500)", color: viewMode === "feedback" ? "var(--color-crop-600)" : "white", padding: "2px 6px", borderRadius: "99px", fontSize: "11px" }}>
                {tickets.filter(t => t.status === "open").length}
              </span>
            )}
          </button>
        </div>

        {viewMode === "memberships" ? (
          <>
            {/* Search filter */}
            <div style={{ marginBottom: "14px" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="યુઝર શોધો (નામ, ઈમેઈલ, Ref, UID...)..."
                style={{
                  width: "100%",
                  height: "42px",
                  borderRadius: "10px",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                  padding: "0 14px",
                  fontSize: "14px",
                  color: "var(--color-ink)",
                  outline: "none",
                }}
              />
            </div>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "20px",
                overflowX: "auto",
                paddingBottom: "4px",
              }}
            >
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    flexShrink: 0,
                    height: "36px",
                    padding: "0 16px",
                    borderRadius: "999px",
                    border: `1.5px solid ${tab === t.key ? t.color : "var(--color-border)"}`,
                    background: tab === t.key ? t.color : "var(--color-surface)",
                    color: tab === t.key ? "white" : "var(--color-ink-soft)",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s",
                  }}
                >
                  {t.label}
                  <span
                    style={{
                      background: tab === t.key ? "rgba(255,255,255,0.3)" : "var(--color-paper-dim)",
                      borderRadius: "999px",
                      padding: "1px 7px",
                      fontSize: "12px",
                    }}
                  >
                    {t.key === "Expiring" ? expiringCount : users.filter(u => u.membershipStatus === t.key).length}
                  </span>
                </button>
              ))}
            </div>

            {/* User list */}
            {loading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: "120px",
                      borderRadius: "16px",
                      background: "var(--color-paper-dim)",
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  color: "var(--color-ink-faint)",
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: 'var(--color-crop-500)' }}><CheckCircleIcon size={48} /></div>
                <p style={{ fontSize: "15px", margin: 0 }}>
                  {tab === "Pending" ? "કોઈ Pending વિનંતી નથી" : `કોઈ ${tab} સભ્ય નથી`}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filtered.map((u) => (
                  <div
                    key={u.uid}
                    style={{
                      background: "var(--color-surface)",
                      borderRadius: "16px",
                      padding: "16px",
                      border: "1px solid var(--color-border)",
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    {/* User header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "14px",
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          background: "var(--color-crop-100)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {u.photoURL ? (
                          <img
                            src={u.photoURL}
                            alt={u.name ?? "User"}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <span style={{ fontSize: "18px", color: "var(--color-crop-600)" }}>
                            {u.name?.charAt(0) ?? "U"}
                          </span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: "15px",
                            fontWeight: 600,
                            color: "var(--color-ink)",
                            margin: "0 0 2px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {u.name ?? "Unknown User"}
                        </p>
                        <p
                          style={{
                            fontSize: "12.5px",
                            color: "var(--color-ink-faint)",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {u.email ?? u.uid}
                        </p>
                      </div>
                      {/* Status badge */}
                      <span
                        style={{
                          flexShrink: 0,
                          fontSize: "12px",
                          fontWeight: 600,
                          padding: "3px 10px",
                          borderRadius: "999px",
                          background:
                            u.membershipStatus === "Active"
                              ? "var(--color-crop-100)"
                              : u.membershipStatus === "Pending"
                                ? "var(--color-saffron-100)"
                                : u.membershipStatus === "Expired"
                                  ? "var(--color-loss-100)"
                                  : "var(--color-paper-dim)",
                          color:
                            u.membershipStatus === "Active"
                              ? "var(--color-crop-600)"
                              : u.membershipStatus === "Pending"
                                ? "var(--color-saffron-600)"
                                : u.membershipStatus === "Expired"
                                  ? "var(--color-loss-600)"
                                  : "var(--color-ink-faint)",
                        }}
                      >
                        {u.membershipStatus}
                      </span>
                    </div>

                    {/* Details grid */}
                    {u.donationStatus === "Skipped" ? (
                      <div style={{ padding: "12px", background: "var(--color-paper-dim)", borderRadius: "10px", marginBottom: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", color: "var(--color-ink-soft)", fontSize: "13.5px", marginBottom: "10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <CheckCircleIcon size={16} className="text-[var(--color-crop-500)]" />
                            Free Access (Donation Skipped)
                          </div>
                        </div>
                        <button
                          onClick={() => grantSupporterStatus(u.uid)}
                          disabled={actionBusy === u.uid + "_supporter"}
                          style={{
                            width: "100%",
                            height: "38px",
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, var(--color-crop-500), var(--color-crop-600))",
                            color: "white",
                            border: "none",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          {actionBusy === u.uid + "_supporter" ? "..." : <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><HeartIcon size={16} /> Mark as Supporter / Donor (સહયોગી બનાવો)</span>}
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "6px 16px",
                          marginBottom: "14px",
                          fontSize: "13px",
                        }}
                      >
                        <div>
                          <span style={{ color: "var(--color-ink-faint)" }}>Submitted: </span>
                          <span style={{ color: "var(--color-ink)", fontWeight: 500 }}>
                            {fmtDateTime(u.paymentSubmittedAt)}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: "var(--color-ink-faint)" }}>Method: </span>
                          <span style={{ color: "var(--color-ink)", fontWeight: 500 }}>
                            {u.paymentMethod ?? "—"}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: "var(--color-ink-faint)" }}>Ref: </span>
                          <span
                            style={{
                              color: "var(--color-ink)",
                              fontWeight: 500,
                              fontFamily: "monospace",
                              fontSize: "12px",
                            }}
                          >
                            {u.paymentReference ?? "—"}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: "var(--color-ink-faint)" }}>Amount: </span>
                          <span style={{ color: "var(--color-ink)", fontWeight: 500 }}>
                            ₹{u.membershipAmount}
                          </span>
                        </div>
                        {u.membershipExpiresAt && (
                          <div>
                            <span style={{ color: "var(--color-ink-faint)" }}>Expires: </span>
                            <span style={{ color: "var(--color-ink)", fontWeight: 500 }}>
                              {fmt(u.membershipExpiresAt)}
                            </span>
                          </div>
                        )}
                        {u.renewalCount > 0 && (
                          <div>
                            <span style={{ color: "var(--color-ink-faint)" }}>Renewals: </span>
                            <span style={{ color: "var(--color-ink)", fontWeight: 500 }}>
                              {u.renewalCount}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Payment proof thumbnail */}
                    {u.paymentProof && (
                      <div style={{ marginBottom: "14px" }}>
                        <button
                          onClick={() => setSelectedProof(u.paymentProof!)}
                          style={{
                            display: "block",
                            width: "100%",
                            cursor: "pointer",
                            border: "none",
                            background: "none",
                            padding: 0,
                            textAlign: "left",
                          }}
                        >
                          <img
                            src={u.paymentProof}
                            alt="Payment proof"
                            style={{
                              width: "100%",
                              maxHeight: "140px",
                              objectFit: "contain",
                              borderRadius: "10px",
                              border: "1px solid var(--color-border)",
                              background: "var(--color-paper)",
                            }}
                          />
                          <p
                            style={{
                              fontSize: "12px",
                              color: "var(--color-ink-faint)",
                              marginTop: "4px",
                              textAlign: "center",
                            }}
                          >
                            ટૅપ કરીને મોટો જુઓ
                          </p>
                        </button>
                      </div>
                    )}

                    {/* Actions — only for Pending */}
                    {u.membershipStatus === "Pending" && (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          id={`approve-${u.uid}`}
                          onClick={() => approveMembership(u.uid)}
                          disabled={actionBusy === u.uid + "_approve" || actionBusy === u.uid + "_reject"}
                          style={{
                            flex: 1,
                            height: "44px",
                            borderRadius: "12px",
                            background:
                              actionBusy === u.uid + "_approve"
                                ? "var(--color-paper-dim)"
                                : "linear-gradient(135deg, var(--color-crop-500), var(--color-crop-600))",
                            color: actionBusy === u.uid + "_approve" ? "var(--color-ink-faint)" : "white",
                            border: "none",
                            cursor:
                              actionBusy === u.uid + "_approve" || actionBusy === u.uid + "_reject"
                                ? "not-allowed"
                                : "pointer",
                            fontSize: "14px",
                            fontWeight: 600,
                            transition: "all 0.2s",
                          }}
                        >
                          {actionBusy === u.uid + "_approve" ? "..." : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><CheckCircleIcon size={16} /> Approve</div>}
                        </button>
                        <button
                          id={`reject-${u.uid}`}
                          onClick={() => rejectMembership(u.uid)}
                          disabled={actionBusy === u.uid + "_approve" || actionBusy === u.uid + "_reject"}
                          style={{
                            flex: 1,
                            height: "44px",
                            borderRadius: "12px",
                            background:
                              actionBusy === u.uid + "_reject"
                                ? "var(--color-paper-dim)"
                                : "var(--color-loss-100)",
                            color:
                              actionBusy === u.uid + "_reject"
                                ? "var(--color-ink-faint)"
                                : "var(--color-loss-600)",
                            border: `1px solid ${actionBusy === u.uid + "_reject" ? "var(--color-border)" : "var(--color-loss-400)"}`,
                            cursor:
                              actionBusy === u.uid + "_approve" || actionBusy === u.uid + "_reject"
                                ? "not-allowed"
                                : "pointer",
                            fontSize: "14px",
                            fontWeight: 600,
                            transition: "all 0.2s",
                          }}
                        >
                          {actionBusy === u.uid + "_reject" ? "..." : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><XCircleIcon size={16} /> Reject</div>}
                        </button>
                      </div>
                    )}

                    {/* Approve action for Rejected/Expired/Banned too */}
                    {(u.membershipStatus === "Rejected" || u.membershipStatus === "Expired" || u.membershipStatus === "Banned") && (
                      <button
                        id={`approve-${u.uid}`}
                        onClick={() => approveMembership(u.uid)}
                        disabled={actionBusy === u.uid + "_approve"}
                        style={{
                          width: "100%",
                          height: "44px",
                          borderRadius: "12px",
                          background:
                            actionBusy === u.uid + "_approve"
                              ? "var(--color-paper-dim)"
                              : "linear-gradient(135deg, var(--color-crop-500), var(--color-crop-600))",
                          color: actionBusy === u.uid + "_approve" ? "var(--color-ink-faint)" : "white",
                          border: "none",
                          cursor: actionBusy === u.uid + "_approve" ? "not-allowed" : "pointer",
                          fontSize: "14px",
                          fontWeight: 600,
                        }}
                      >
                        {actionBusy === u.uid + "_approve" ? "..." : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><CheckCircleIcon size={16} /> Approve & Activate</div>}
                      </button>
                    )}

                    {/* Management Actions: Ban and Delete */}
                    <div style={{ display: "flex", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--color-border)", paddingTop: "14px" }}>
                      {u.membershipStatus !== "Banned" ? (
                        <button
                          onClick={() => banUser(u.uid)}
                          disabled={actionBusy === u.uid + "_ban" || u.uid === user?.uid}
                          style={{
                            flex: 1,
                            height: "38px",
                            borderRadius: "8px",
                            background: "var(--color-paper-dim)",
                            color: u.uid === user?.uid ? "var(--color-ink-faint)" : "var(--color-loss-600)",
                            border: "1px solid var(--color-loss-200)",
                            cursor: u.uid === user?.uid ? "not-allowed" : "pointer",
                            fontSize: "13px",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            opacity: u.uid === user?.uid ? 0.6 : 1
                          }}
                          title={u.uid === user?.uid ? "તમે તમારા પોતાના એકાઉન્ટને બેન કરી શકતા નથી" : ""}
                        >
                          {actionBusy === u.uid + "_ban" ? "..." : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><LockIcon size={14} /> Ban User</div>}
                        </button>
                      ) : (
                        <button
                          onClick={() => unbanUser(u.uid)}
                          disabled={actionBusy === u.uid + "_unban"}
                          style={{
                            flex: 1,
                            height: "38px",
                            borderRadius: "8px",
                            background: "var(--color-crop-50)",
                            color: "var(--color-crop-600)",
                            border: "1px solid var(--color-crop-400)",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px"
                          }}
                        >
                          {actionBusy === u.uid + "_unban" ? "..." : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><CheckCircleIcon size={14} /> Unban User</div>}
                        </button>
                      )}

                      <button
                        onClick={() => deleteUserProfile(u.uid)}
                        disabled={actionBusy === u.uid + "_delete" || u.uid === user?.uid}
                        style={{
                          flex: 1,
                          height: "38px",
                          borderRadius: "8px",
                          background: "var(--color-loss-50)",
                          color: u.uid === user?.uid ? "var(--color-ink-faint)" : "var(--color-loss-600)",
                          border: "1px solid var(--color-loss-400)",
                          cursor: u.uid === user?.uid ? "not-allowed" : "pointer",
                          fontSize: "13px",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          opacity: u.uid === user?.uid ? 0.6 : 1
                        }}
                        title={u.uid === user?.uid ? "તમે તમારા પોતાના એકાઉન્ટને ડીલીટ કરી શકતા નથી" : ""}
                      >
                        {actionBusy === u.uid + "_delete" ? "..." : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><TrashIcon size={14} /> Delete Profile</div>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Support Tickets UI */
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {ticketsLoading ? (
              <p style={{ textAlign: "center", color: "var(--color-ink-faint)", padding: "20px" }}>ટિકિટ લોડ થઈ રહી છે...</p>
            ) : tickets.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-ink-faint)" }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: 'var(--color-crop-500)' }}><CheckCircleIcon size={48} /></div>
                <p style={{ fontSize: "15px", margin: 0 }}>કોઈ સપોર્ટ ટિકિટ નથી.</p>
              </div>
            ) : (
              tickets.map(t => (
                <div key={t.id} style={{ background: "var(--color-surface)", borderRadius: "16px", padding: "16px", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-card)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <div>
                      <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-ink)", margin: "0 0 2px" }}>{t.displayName || "Unknown User"}</p>
                      <p style={{ fontSize: "12.5px", color: "var(--color-ink-faint)", margin: 0 }}>{t.email || t.phoneNumber || t.uid}</p>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: t.status === "open" ? "var(--color-saffron-100)" : "var(--color-paper-dim)", color: t.status === "open" ? "var(--color-saffron-600)" : "var(--color-ink-faint)", height: "24px", display: "inline-flex", alignItems: "center" }}>
                      {t.status === "open" ? "Open" : "Resolved"}
                    </span>
                  </div>
                  <div style={{ background: "var(--color-paper-dim)", padding: "12px", borderRadius: "10px", fontSize: "14px", color: "var(--color-ink)", marginBottom: "14px", whiteSpace: "pre-wrap" }}>
                    {t.message}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "var(--color-ink-faint)" }}>{fmtDateTime(t.createdAt)}</span>
                    {t.status === "open" && (
                      <button
                        onClick={() => resolveTicket(t.id)}
                        disabled={actionBusy === t.id + "_resolve"}
                        style={{
                          background: "var(--color-crop-50)",
                          color: "var(--color-crop-600)",
                          border: "1px solid var(--color-crop-400)",
                          padding: "6px 14px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: actionBusy === t.id + "_resolve" ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        {actionBusy === t.id + "_resolve" ? "..." : <><CheckIcon size={14} /> Mark Resolved</>}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Proof lightbox */}
      {selectedProof && (
        <div
          onClick={() => setSelectedProof(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedProof}
              alt="Payment proof full view"
              style={{
                maxWidth: "90vw",
                maxHeight: "85vh",
                objectFit: "contain",
                borderRadius: "12px",
              }}
            />
            <button
              onClick={() => setSelectedProof(null)}
              style={{
                display: "block",
                margin: "16px auto 0",
                padding: "10px 24px",
                borderRadius: "10px",
                background: "white",
                color: "#1f2a1e",
                border: "none",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              બંધ કરો
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bellPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.25); }
        }
      `}</style>
    </div>
  );
}

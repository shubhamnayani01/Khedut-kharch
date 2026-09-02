import { useEffect, useState, useCallback } from "react";
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
import { ShieldIcon, RefreshIcon, CheckCircleIcon, XCircleIcon, MessageCircleIcon, CheckIcon, TrashIcon, LockIcon } from "../../components/icons/UIIcons";

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

type Tab = "Pending" | "Active" | "Expired" | "Rejected" | "Banned";

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

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState<MemberUser[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [viewMode, setViewMode] = useState<"memberships" | "feedback">("memberships");
  const [loading, setLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("Pending");
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const list: MemberUser[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        if (!d.membershipStatus) return; // skip users with no membership record
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
    if (viewMode === "memberships") void fetchUsers();
    else void fetchTickets();
  }, [viewMode, fetchUsers, fetchTickets]);

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

  const filtered = users.filter((u) => u.membershipStatus === tab);

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

  const tabCount = (t: Tab) => users.filter((u) => u.membershipStatus === t).length;

  const TABS: { key: Tab; label: string; color: string }[] = [
    { key: "Pending", label: "Pending", color: "var(--color-saffron-500)" },
    { key: "Active", label: "Active", color: "var(--color-crop-500)" },
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
        </div>
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
                {tabCount(t.key)}
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
                  <div style={{ padding: "10px", background: "var(--color-paper-dim)", borderRadius: "8px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-ink-soft)", fontSize: "13.5px" }}>
                    <CheckCircleIcon size={16} className="text-[var(--color-crop-500)]" />
                    Free Access (Donation Skipped)
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
      `}</style>
    </div>
  );
}

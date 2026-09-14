import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { TrialBanner } from "../ui/TrialBanner";

/**
 * Wraps protected routes. Redirects based on auth + membership status.
 *
 * Status state machine:
 *   Trial       → full access + trial countdown banner
 *   TrialExpired → read-only access + red lockout banner
 *   Active      → full access, no banner
 *   Pending     → /membership/pending
 *   Rejected    → /membership/payment
 *   Expired     → /membership/expired  (paid membership expired)
 *   Banned      → /login
 *   null        → wait (trial will be auto-started by AuthContext)
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, membership, membershipLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || membershipLoading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // null membership = AuthContext is about to write "Trial" status.
    // Don't redirect — just wait for the next snapshot.
    if (!membership) return;

    const status = membership.membershipStatus;

    if (status === "Banned") {
      navigate("/login", { replace: true });
      return;
    }

    if (status === "Pending") {
      navigate("/membership/pending", { replace: true });
      return;
    }

    if (status === "Rejected") {
      navigate("/membership/payment", { replace: true });
      return;
    }

    // Paid membership expired (not trial) → renewal page
    if (status === "Expired") {
      navigate("/membership/expired", { replace: true });
      return;
    }

    // Defensive: double-check paid membership expiry even if status says Active
    if (
      status === "Active" &&
      membership.membershipExpiresAt &&
      membership.membershipExpiresAt < Date.now()
    ) {
      navigate("/membership/expired", { replace: true });
    }
    // Trial + TrialExpired: both allowed through (handled by TrialBanner below)
  }, [user, loading, membership, membershipLoading, navigate]);

  // Show loading while resolving auth + membership
  if (loading || membershipLoading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-3 bg-[var(--color-paper)]">
        <div className="w-10 h-10 rounded-full border-2 border-[var(--color-crop-500)] border-t-transparent animate-spin" />
        <p className="text-[14px] text-[var(--color-ink-faint)]">લોડ થઈ રહ્યું છે...</p>
      </div>
    );
  }

  const status = membership?.membershipStatus;

  // Allowed statuses: Active, Trial, TrialExpired
  const isAllowed =
    !!user &&
    !!membership &&
    (status === "Active" || status === "Trial" || status === "TrialExpired") &&
    !(status === "Active" && membership.membershipExpiresAt && membership.membershipExpiresAt < Date.now());

  if (!isAllowed) {
    // navigation effect will redirect; render nothing in the meantime
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <TrialBanner />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}

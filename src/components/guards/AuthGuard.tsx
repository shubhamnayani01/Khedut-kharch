import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Wraps protected routes. Redirects based on auth + membership status.
 * All checks happen client-side; Firestore security rules enforce server-side.
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

    if (!membership) {
      // No membership doc at all → go to payment page
      navigate("/membership/payment", { replace: true });
      return;
    }

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

    if (status === "Expired") {
      navigate("/membership/expired", { replace: true });
      return;
    }

    // Defensive: double-check expiry even if status says Active
    if (
      status === "Active" &&
      membership.membershipExpiresAt &&
      membership.membershipExpiresAt < Date.now()
    ) {
      navigate("/membership/expired", { replace: true });
    }
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

  // If not active, don't render children (navigation effect will redirect)
  if (
    !user ||
    !membership ||
    membership.membershipStatus !== "Active" ||
    (membership.membershipExpiresAt && membership.membershipExpiresAt < Date.now())
  ) {
    return null;
  }

  return <>{children}</>;
}

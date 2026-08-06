import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LockIcon, RefreshIcon } from "../../components/icons/UIIcons";

export default function MembershipExpired() {
  const { user, loading, membership, membershipLoading, signOutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || membershipLoading) return;
    if (!user) { navigate("/login", { replace: true }); return; }
    if (membership?.membershipStatus === "Active") { navigate("/", { replace: true }); return; }
    if (membership?.membershipStatus === "Pending") { navigate("/membership/pending", { replace: true }); return; }
    if (!membership) { navigate("/membership/payment", { replace: true }); return; }
  }, [user, loading, membership, membershipLoading, navigate]);

  const expiredAt = membership?.membershipExpiresAt
    ? new Date(membership.membershipExpiresAt).toLocaleDateString("gu-IN")
    : null;

  if (loading || membershipLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--color-paper)]">
        <div className="w-10 h-10 rounded-full border-2 border-[var(--color-crop-500)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--color-paper)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      {/* Background decoration */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            top: "-60px",
            left: "-60px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "radial-gradient(circle, var(--color-loss-100) 0%, transparent 70%)",
            opacity: 0.6,
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "420px",
          width: "100%",
        }}
      >
        {/* Icon */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--color-loss-100), var(--color-loss-400))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 24px rgba(181,66,58,0.25)",
            }}
          >
            <LockIcon size={38} className="text-[white]" />
          </div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--color-ink)",
              margin: "0 0 6px",
            }}
          >
            સભ્યપદ સમાપ્ત
          </h1>
          {expiredAt && (
            <p
              style={{
                fontSize: "13px",
                color: "var(--color-ink-faint)",
                margin: 0,
              }}
            >
              {expiredAt} ના રોજ સમાપ્ત
            </p>
          )}
        </div>

        {/* Main card */}
        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: "20px",
            padding: "24px 20px",
            boxShadow: "var(--shadow-card)",
            border: "1px solid var(--color-border)",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              background: "var(--color-loss-100)",
              borderRadius: "12px",
              padding: "14px 16px",
              marginBottom: "20px",
              border: "1px solid var(--color-loss-400)",
            }}
          >
            <p
              style={{
                fontSize: "14.5px",
                color: "var(--color-loss-600)",
                lineHeight: "1.7",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Your annual membership has expired. Renew your ₹300/year membership to continue using Khedut Kharch.
            </p>
          </div>

          <p
            style={{
              fontSize: "14px",
              color: "var(--color-ink)",
              lineHeight: "1.7",
              margin: "0 0 20px",
            }}
          >
            તમારું વાર્ષિક સભ્યપદ સમાપ્ત થઈ ગયું છે. ખેડૂત ખર્ચ ઉપયોગ ચાલુ રાખવા ₹300/વર્ષ નું નવીનીકરણ કરો.
          </p>

          {/* Renewal details */}
          {membership?.renewalCount !== undefined && membership.renewalCount > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13.5px",
                marginBottom: "20px",
              }}
            >
              <span style={{ color: "var(--color-ink-faint)" }}>નવીનીકરણ ગણતરી</span>
              <span style={{ color: "var(--color-ink)", fontWeight: 500 }}>
                {membership.renewalCount} વખત
              </span>
            </div>
          )}

          <button
            id="renew-membership-btn"
            onClick={() => navigate("/membership/payment")}
            style={{
              width: "100%",
              height: "52px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, var(--color-crop-500), var(--color-crop-600))",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: 600,
              boxShadow: "0 4px 14px rgba(47,107,79,0.3)",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><RefreshIcon size={16} /> ₹300 સભ્યપદ નવીનીકરણ કરો</div>
          </button>

          <button
            onClick={signOutUser}
            style={{
              width: "100%",
              height: "44px",
              borderRadius: "12px",
              background: "transparent",
              border: "1px solid var(--color-border)",
              color: "var(--color-ink-faint)",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            સાઇન આઉટ
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, loading, membership, membershipLoading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already authenticated with active membership
  useEffect(() => {
    if (loading || membershipLoading) return;
    if (!user) return;

    if (!membership) {
      navigate("/membership/payment", { replace: true });
    } else if (membership.membershipStatus === "Active") {
      navigate("/", { replace: true });
    } else if (membership.membershipStatus === "Pending") {
      navigate("/membership/pending", { replace: true });
    } else if (membership.membershipStatus === "Expired") {
      navigate("/membership/expired", { replace: true });
    } else {
      navigate("/membership/payment", { replace: true });
    }
  }, [user, loading, membership, membershipLoading, navigate]);

  const handleSignIn = async () => {
    setBusy(true);
    setError("");
    try {
      await signInWithGoogle();
      // Navigation handled by useEffect above after auth state updates
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/network-request-failed") {
        setError("ઇન્ટરનેટ કનેક્શન તપાસો.");
      } else if (code === "auth/popup-closed-by-user") {
        setError("સાઇન ઇન પ્રક્રિયા બંધ કરી.");
      } else {
        setError("ગૂગલ સાઇન ઇનમાં ભૂલ આવી. ફરી પ્રયાસ કરો.");
      }
    } finally {
      setBusy(false);
    }
  };

  if (loading || membershipLoading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-3 bg-[var(--color-paper)]">
        <div className="w-10 h-10 rounded-full border-2 border-[var(--color-crop-500)] border-t-transparent animate-spin" />
        <p className="text-[14px] text-[var(--color-ink-faint)]">લોડ થઈ રહ્યું છે...</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-[var(--color-paper)] px-5">
      {/* Background decoration */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "radial-gradient(circle, var(--color-crop-100) 0%, transparent 70%)",
            opacity: 0.7,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            background: "radial-gradient(circle, var(--color-saffron-100) 0%, transparent 70%)",
            opacity: 0.6,
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 16px",
            }}
          >
            <img
              src="/icons/icon-192.png"
              alt="ખેડૂત ખર્ચ logo"
              style={{ width: "80px", height: "80px", objectFit: "contain" }}
            />
          </div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: "var(--color-ink)",
              margin: "0 0 6px",
            }}
          >
            ખેડૂત ખર્ચ
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "var(--color-ink-faint)",
              margin: 0,
            }}
          >
            કચ્છ ખેડૂત ખર્ચ વ્યવસ્થાપન એપ
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: "20px",
            padding: "28px 24px",
            boxShadow: "var(--shadow-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--color-ink)",
              margin: "0 0 8px",
            }}
          >
            પ્રવેશ કરો
          </h2>
          <p
            style={{
              fontSize: "13.5px",
              color: "var(--color-ink-faint)",
              lineHeight: "1.6",
              margin: "0 0 24px",
            }}
          >
            ખેડૂત ખર્ચ ઉપયોગ કરવા માટે ગૂગલ એકાઉન્ટ વડે લૉગઇન કરવું ફરજિયાત છે.
            ₹300 વાર્ષિક સભ્યપદ પ્રક્રિયા આ પ્રક્રિયા પછી પૂર્ણ કરી શકાય છે.
          </p>

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
              <p style={{ fontSize: "13.5px", color: "var(--color-loss-600)", margin: 0 }}>
                {error}
              </p>
            </div>
          )}

          <button
            id="google-signin-btn"
            onClick={handleSignIn}
            disabled={busy}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              height: "52px",
              borderRadius: "14px",
              background: busy
                ? "var(--color-paper-dim)"
                : "linear-gradient(135deg, var(--color-crop-500), var(--color-crop-600))",
              color: "white",
              border: "none",
              cursor: busy ? "not-allowed" : "pointer",
              fontSize: "15px",
              fontWeight: 600,
              boxShadow: busy ? "none" : "0 4px 14px rgba(47,107,79,0.35)",
              transition: "all 0.2s ease",
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? (
              <>
                <span
                  style={{
                    width: "18px",
                    height: "18px",
                    border: "2px solid white",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <span>લૉગઇન...</span>
              </>
            ) : (
              <>
                {/* Google "G" logo */}
                <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#fff" d="M44.5 20H24v8.5h11.8C34.7 33.9 30 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
                </svg>
                <span>Google સાથે સાઇન ઇન કરો</span>
              </>
            )}
          </button>
        </div>

        {/* Note */}
        <p
          style={{
            textAlign: "center",
            fontSize: "12px",
            color: "var(--color-ink-faint)",
            marginTop: "20px",
            lineHeight: "1.6",
          }}
        >
          સાઇન ઇન કરીને તમે ખેડૂત ખર્ચની સેવા શરતો અને ગોપનીયતા નીતિ સ્વીકારો છો.
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

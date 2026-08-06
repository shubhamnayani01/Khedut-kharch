import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { HourglassIcon, MessageCircleIcon } from "../../components/icons/UIIcons";

export default function MembershipPending() {
  const { user, loading, membership, membershipLoading, signOutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || membershipLoading) return;
    if (!user) { navigate("/login", { replace: true }); return; }
    if (membership?.membershipStatus === "Active") { navigate("/", { replace: true }); return; }
    if (membership?.membershipStatus === "Rejected") { navigate("/membership/payment", { replace: true }); return; }
    if (membership?.membershipStatus === "Expired") { navigate("/membership/expired", { replace: true }); return; }
    if (!membership) { navigate("/membership/payment", { replace: true }); return; }
  }, [user, loading, membership, membershipLoading, navigate]);

  const submittedAt = membership?.paymentSubmittedAt
    ? new Date(membership.paymentSubmittedAt).toLocaleString("gu-IN")
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
            right: "-60px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "radial-gradient(circle, var(--color-saffron-100) 0%, transparent 70%)",
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
              background: "linear-gradient(135deg, var(--color-saffron-100), var(--color-saffron-400))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 24px rgba(222,137,37,0.3)",
            }}
          >
            <HourglassIcon size={38} className="text-[var(--color-saffron-600)]" />
          </div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--color-ink)",
              margin: "0 0 8px",
            }}
          >
            ચકાસણી પ્રક્રિયામાં
          </h1>
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
              background: "linear-gradient(135deg, var(--color-saffron-100), var(--color-crop-50))",
              borderRadius: "12px",
              padding: "14px 16px",
              marginBottom: "16px",
            }}
          >
            <p
              style={{
                fontSize: "14.5px",
                color: "var(--color-ink)",
                lineHeight: "1.7",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Your membership request has been submitted successfully. Your account will be activated after the administrator verifies your payment.
            </p>
          </div>

          <p
            style={{
              fontSize: "14px",
              color: "var(--color-crop-700)",
              lineHeight: "1.7",
              margin: "0 0 16px",
            }}
          >
            તમારી સભ્યપદ વિનંતી સફળતાપૂર્વક સબમિટ થઈ ગઈ છે. એડ્મિન ચકાસ્યા પછી તમારું ખાતું ચાલુ થઈ જશે.
          </p>

          {/* Proof thumbnail */}
          {membership?.paymentProof && (
            <div style={{ marginBottom: "16px" }}>
              <p
                style={{
                  fontSize: "12.5px",
                  color: "var(--color-ink-faint)",
                  marginBottom: "8px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                સબમિટ કરેલ પ્રૂફ
              </p>
              <a
                href={membership.paymentProof}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  textDecoration: "none",
                }}
              >
                <img
                  src={membership.paymentProof}
                  alt="Payment proof"
                  style={{
                    width: "100%",
                    maxHeight: "160px",
                    objectFit: "contain",
                    borderRadius: "10px",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-paper)",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </a>
            </div>
          )}

          {/* Details */}
          <div style={{ display: "grid", gap: "8px" }}>
            {submittedAt && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13.5px",
                }}
              >
                <span style={{ color: "var(--color-ink-faint)" }}>સબમિટ સમય</span>
                <span style={{ color: "var(--color-ink)", fontWeight: 500 }}>{submittedAt}</span>
              </div>
            )}
            {membership?.paymentMethod && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13.5px",
                }}
              >
                <span style={{ color: "var(--color-ink-faint)" }}>ચૂકવણી પ્રકાર</span>
                <span style={{ color: "var(--color-ink)", fontWeight: 500 }}>{membership.paymentMethod}</span>
              </div>
            )}
            {membership?.paymentReference && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13.5px",
                }}
              >
                <span style={{ color: "var(--color-ink-faint)" }}>ટ્રાન્ઝ. ID</span>
                <span
                  style={{
                    color: "var(--color-ink)",
                    fontWeight: 500,
                    fontFamily: "monospace",
                    maxWidth: "180px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {membership.paymentReference}
                </span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13.5px",
              }}
            >
              <span style={{ color: "var(--color-ink-faint)" }}>સ્થિતિ</span>
              <span
                style={{
                  color: "var(--color-saffron-600)",
                  fontWeight: 600,
                  background: "var(--color-saffron-100)",
                  borderRadius: "6px",
                  padding: "2px 8px",
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><HourglassIcon size={12} /> Pending</div>
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "var(--color-paper-dim)",
            borderRadius: "12px",
            padding: "12px 14px",
            marginBottom: "20px",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              color: "var(--color-ink-faint)",
              lineHeight: "1.6",
              margin: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><div style={{ marginTop: '2px' }}><MessageCircleIcon size={16} /></div> સ્વીકૃતિ સામાન્ય રીતે 1–24 કલાકમાં મળે છે. કોઈ સવાલ હોય તો WhatsApp પર સંપર્ક કરો.</div>
          </p>
        </div>

        <button
          onClick={signOutUser}
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "14px",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-ink-soft)",
            fontSize: "15px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          સાઇન આઉટ
        </button>
      </div>
    </div>
  );
}

import { useRef, useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { XCircleIcon, CheckIcon, PinIcon, PaperclipIcon } from "../../components/icons/UIIcons";

const BENEFITS = [
  "અમર્યાદિત ખર્ચ નોંધ",
  "અમર્યાદિત આવક નોંધ",
  "પાક-વાઇઝ હિસાબ",
  "સિઝન-વાઇઝ હિસાબ",
  "નફો અને નુકસાન રિપોર્ટ",
  "સુરક્ષિત ક્લાઉડ બેકઅપ",
  "કોઈ પણ ઉપકરણ પરથી ઉપયોગ",
  "ઓટોમેટિક ડેટા સિંક",
  "નિયમિત નવા ફીચર અપડેટ",
  "વિશ્વસનીય ગ્રાહક સહાય",
  "365 દિવસ માટે સહયોગ",
];

export default function MembershipPayment() {
  const { user, loading, membership, membershipLoading, submitMembershipPayment, skipDonation, signOutUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentReference, setPaymentReference] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isRejected = membership?.membershipStatus === "Rejected";

  // If Active and not Skipped, go home; if Pending, go pending
  useEffect(() => {
    if (loading || membershipLoading) return;
    if (!user) { navigate("/login", { replace: true }); return; }
    

    
    if (membership?.membershipStatus === "Pending") { navigate("/membership/pending", { replace: true }); return; }
    if (membership?.membershipStatus === "Expired") { navigate("/membership/expired", { replace: true }); return; }
  }, [user, loading, membership, membershipLoading, navigate]);

  const handleFileChange = (file?: File) => {
    if (!file) return;
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setProofPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!proofFile) { setError("પેમેન્ટ પ્રૂફ ફાઇલ પસંદ કરો."); return; }
    if (!paymentReference.trim()) { setError("ટ્રાન્ઝેક્શન ID / UTR ભરો."); return; }
    setError("");
    setSubmitting(true);
    try {
      await submitMembershipPayment({
        paymentProofFile: proofFile,
        paymentMethod,
        paymentReference: paymentReference.trim(),
      });
      navigate("/membership/pending", { replace: true });
    } catch (err: unknown) {
      console.error(err);
      setError("સબમિટ કરવામાં ભૂલ આવી. ઇન્ટરનેટ કનેક્શન તપાસો અને ફરી પ્રયાસ કરો.");
    } finally {
      setSubmitting(false);
    }
  };

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
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "rgba(var(--color-paper-raw, 247,244,236), 0.95)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid var(--color-border)",
          padding: "0 16px",
        }}
      >
        <div
          style={{
            maxWidth: "520px",
            margin: "0 auto",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/icons/icon-192.png" alt="logo" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
            <span
              style={{
                fontSize: "17px",
                fontWeight: 700,
                color: "var(--color-crop-600)",
              }}
            >
              ખેડૂત ખર્ચ
            </span>
          </div>
          <button
            onClick={signOutUser}
            style={{
              fontSize: "13px",
              color: "var(--color-ink-faint)",
              background: "none",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            સાઇન આઉટ
          </button>
        </div>
      </header>

      <div
        style={{
          maxWidth: "520px",
          margin: "0 auto",
          padding: "24px 16px 48px",
        }}
      >
        {/* Rejected notice */}
        {isRejected && (
          <div
            style={{
              background: "var(--color-loss-100)",
              border: "1px solid var(--color-loss-400)",
              borderRadius: "14px",
              padding: "14px 16px",
              marginBottom: "20px",
            }}
          >
            <p
              style={{
                fontSize: "13.5px",
                color: "var(--color-loss-600)",
                margin: 0,
                lineHeight: "1.6",
                fontWeight: 600,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><XCircleIcon size={18} /> તમારી અગાઉની ચુકવણી નકારી કઢવામાં આવી છે. નવો પ્રૂફ સબમિટ કરો.</div>
            </p>
          </div>
        )}

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--color-ink)",
              margin: "0 0 8px",
            }}
          >
            {isRejected ? "દાન ફરી પ્રયાસ કરો" : "ખેડૂત ખર્ચને સહયોગ કરો"}
          </h1>
          <div
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: "6px",
              background: "linear-gradient(135deg, var(--color-crop-50), var(--color-saffron-100))",
              border: "1px solid var(--color-crop-100)",
              borderRadius: "12px",
              padding: "8px 20px",
            }}
          >
            <span style={{ fontSize: "14px", color: "var(--color-ink-faint)" }}>સૂચવેલ દાન:</span>
            <span style={{ fontSize: "28px", fontWeight: 800, color: "var(--color-crop-600)" }}>₹300</span>
          </div>
        </div>

        {/* Mission message */}
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            padding: "18px 16px",
            marginBottom: "20px",
          }}
        >
          <p
            style={{
              fontSize: "13.5px",
              color: "var(--color-ink)",
              lineHeight: "1.7",
              margin: "0 0 12px",
            }}
          >
            Khedut Kharch is a community-driven project built for farmers of Kachchh. If you find the app useful, you can support its development with a suggested annual donation of ₹300. Your contribution helps cover server costs, security, maintenance, and future improvements. Donating is completely optional and is not required to use the app.
          </p>
          <p
            style={{
              fontSize: "13.5px",
              color: "var(--color-crop-700)",
              lineHeight: "1.7",
              margin: 0,
            }}
          >
            ખેડૂત ખર્ચ કચ્છના ખેડૂતો માટે બનાવેલ એક સમુદાય આધારિત પ્રોજેક્ટ છે. જો તમને આ એપ ઉપયોગી લાગે, તો તેના વિકાસ અને જાળવણી માટે ₹300 નું સૂચવેલ વાર્ષિક દાન કરી શકો છો. તમારું દાન સર્વર ખર્ચ, સુરક્ષા, જાળવણી અને નવા ફીચર્સ વિકસાવવામાં મદદરૂપ બને છે. દાન કરવું સંપૂર્ણપણે વૈકલ્પિક છે અને એપનો ઉપયોગ કરવા માટે જરૂરી નથી.
          </p>
        </div>

        {/* Benefits */}
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            padding: "16px",
            marginBottom: "20px",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--color-ink-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              margin: "0 0 12px",
            }}
          >
            એપમાં મળતી સુવિધાઓ
          </p>
          <div style={{ display: "grid", gap: "8px" }}>
            {BENEFITS.map((b) => (
              <div
                key={b}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "var(--color-crop-500)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    flexShrink: 0,
                  }}
                >
                  <CheckIcon size={12} strokeWidth={3} />
                </span>
                <span style={{ fontSize: "14px", color: "var(--color-ink)" }}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* QR Code Payment */}
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            padding: "20px 16px",
            marginBottom: "20px",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--color-ink-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              margin: "0 0 16px",
            }}
          >
            ₹300 દાન કરો
          </p>

          {/* QR Code placeholder - replace /qr-code.png with your actual QR image */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "200px",
                height: "200px",
                borderRadius: "16px",
                border: "2px dashed var(--color-crop-400)",
                background: "var(--color-crop-50)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                overflow: "hidden",
              }}
            >
              {/* If you have a QR image at /qr-code.png, replace this placeholder */}
              <img
                src="/qr code final.jpeg"
                alt="UPI QR Code"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                onError={(e) => {
                  // Show placeholder if image not found
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                      <span style="font-size:13px;color:var(--color-ink-faint);text-align:center;padding:0 12px">
                        QR Code અહીં મૂકવામાં આવશે
                      </span>
                    `;
                  }
                }}
              />
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "var(--color-ink-faint)",
                textAlign: "center",
                margin: 0,
              }}
            >
              QR સ્કેન કરો અને ₹300 ચૂકવો
            </p>
          </div>

          <div
            style={{
              background: "var(--color-paper-dim)",
              borderRadius: "10px",
              padding: "10px 14px",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                color: "var(--color-ink-soft)",
                margin: 0,
                lineHeight: "1.6",
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><div style={{ marginTop: '2px' }}><PinIcon size={16} /></div> ચૂકવ્યા પછી નીચે સ્ક્રીનશૉટ/Receipt અપલોડ કરો. એડ્મિન ચકાસ્યા પછી તમારું ખાતું ચાલુ થશે.</div>
            </p>
          </div>
        </div>

        {/* Payment proof upload form */}
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            padding: "20px 16px",
            marginBottom: "20px",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--color-ink-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              margin: "0 0 16px",
            }}
          >
            પ્રૂફ સબમિટ કરો
          </p>

          {/* Payment method */}
          <div style={{ marginBottom: "14px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                color: "var(--color-ink-soft)",
                marginBottom: "6px",
                fontWeight: 500,
              }}
            >
              દાન કરવાની રીત
            </label>
            <select
              id="payment-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{
                width: "100%",
                height: "46px",
                borderRadius: "12px",
                border: "1.5px solid var(--color-border)",
                background: "var(--color-paper)",
                color: "var(--color-ink)",
                fontSize: "15px",
                padding: "0 14px",
                outline: "none",
              }}
            >
              <option value="UPI">UPI (PhonePe / GPay / Paytm)</option>
              <option value="Bank Transfer">Bank Transfer / NEFT / RTGS</option>
              <option value="Cash">Cash</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Transaction ID */}
          <div style={{ marginBottom: "14px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                color: "var(--color-ink-soft)",
                marginBottom: "6px",
                fontWeight: 500,
              }}
            >
              ટ્રાન્ઝેક્શન ID / UTR નંબર
            </label>
            <input
              id="payment-reference"
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="ટ્રાન્ઝેક્શન ID અહીં ભરો"
              style={{
                width: "100%",
                boxSizing: "border-box",
                height: "46px",
                borderRadius: "12px",
                border: "1.5px solid var(--color-border)",
                background: "var(--color-paper)",
                color: "var(--color-ink)",
                fontSize: "15px",
                padding: "0 14px",
                outline: "none",
              }}
            />
          </div>

          {/* File upload */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                color: "var(--color-ink-soft)",
                marginBottom: "6px",
                fontWeight: 500,
              }}
            >
              પ્રૂફ ફોટો / Screenshot (ફરજિયાત)
            </label>
            <input
              ref={fileRef}
              type="file"
              id="payment-proof-upload"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                width: "100%",
                height: "80px",
                borderRadius: "12px",
                border: "2px dashed var(--color-border)",
                background: proofFile ? "var(--color-crop-50)" : "var(--color-paper)",
                color: proofFile ? "var(--color-crop-600)" : "var(--color-ink-faint)",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                transition: "all 0.2s",
              }}
            >
              <PaperclipIcon size={24} className={proofFile ? "text-[var(--color-crop-600)]" : "text-[var(--color-ink-soft)]"} />
              <span>
                {proofFile ? proofFile.name : "ક્લિક કરીને ફાઇલ પસંદ કરો"}
              </span>
            </button>

            {proofPreview && proofFile?.type.startsWith("image/") && (
              <div style={{ marginTop: "10px", textAlign: "center" }}>
                <img
                  src={proofPreview}
                  alt="Payment proof preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    borderRadius: "10px",
                    border: "1px solid var(--color-border)",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
          </div>

          {error && (
            <div
              style={{
                background: "var(--color-loss-100)",
                border: "1px solid var(--color-loss-400)",
                borderRadius: "10px",
                padding: "10px 14px",
                marginBottom: "14px",
              }}
            >
              <p style={{ fontSize: "13.5px", color: "var(--color-loss-600)", margin: 0 }}>
                {error}
              </p>
            </div>
          )}

          <button
            id="submit-membership-btn"
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: "100%",
              height: "52px",
              borderRadius: "14px",
              background: submitting
                ? "var(--color-paper-dim)"
                : "linear-gradient(135deg, var(--color-crop-500), var(--color-crop-600))",
              color: submitting ? "var(--color-ink-faint)" : "white",
              border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              fontSize: "15px",
              fontWeight: 600,
              boxShadow: submitting ? "none" : "0 4px 14px rgba(47,107,79,0.3)",
              transition: "all 0.2s",
            }}
          >
            {submitting ? "સબમિટ કરી રહ્યા છે..." : "દાનની પુષ્ટિ માટે સબમિટ કરો"}
          </button>

          <button
            onClick={async () => {
              try {
                setSubmitting(true);
                await skipDonation();
                navigate("/", { replace: true });
              } catch (e) {
                console.error(e);
                setError("સ્કીપ કરવામાં ભૂલ આવી. ફરી પ્રયાસ કરો.");
                setSubmitting(false);
              }
            }}
            disabled={submitting}
            style={{
              width: "100%",
              height: "52px",
              marginTop: "12px",
              borderRadius: "14px",
              background: "transparent",
              color: submitting ? "var(--color-ink-faint)" : "var(--color-ink-soft)",
              border: "1.5px solid var(--color-border)",
              cursor: submitting ? "not-allowed" : "pointer",
              fontSize: "15px",
              fontWeight: 600,
              transition: "all 0.2s",
            }}
          >
            હમણાં નહીં, આગળ વધો
          </button>
        </div>
      </div>
    </div>
  );
}

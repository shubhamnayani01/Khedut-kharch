import { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { XCircleIcon, CheckIcon, PinIcon, PaperclipIcon, CloseIcon, HourglassIcon, CoffeeIcon } from "../../components/icons/UIIcons";

type FeatureRow = { label: string; free: boolean | string; paid: boolean | string };

const FEATURES: FeatureRow[] = [
  { label: "ખર્ચ નોંધ",                    free: "7 દિવસ",    paid: "અમર્યાદિત" },
  { label: "આવક નોંધ",                     free: "7 દિવસ",    paid: "અમર્યાદિત" },
  { label: "મજૂરી વ્યવસ્થાપન",               free: "7 દિવસ",    paid: "અમર્યાદિત" },
  { label: "ભાગીદાર હિસાબ",                 free: "7 દિવસ",    paid: "અમર્યાદિત" },
  { label: "નફો/ખોટ ગ્રાફ",                  free: "7 દિવસ",    paid: "અમર્યાદિત" },
  { label: "WhatsApp શેર",                  free: "7 દિવસ",    paid: "અમર્યાદિત" },
  { label: "ખેડૂત વૉલેટ (ડૉક.)",            free: "5 ડૉક.",    paid: "30 ડૉક." },
  { label: "ક્લાઉડ બેકઅપ",                   free: true,       paid: true },
  { label: "ઑફલાઇન ઉપયોગ",                  free: true,       paid: true },
  { label: "7 દિવસ પછી ઉમેરો/ફેરફાર",       free: false,      paid: true },
  { label: "365 દિવસ પ્રીમિયમ સહાય",        free: false,      paid: true },
];

export default function MembershipPayment() {
  const { user, loading, membership, membershipLoading, submitMembershipPayment, signOutUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("300");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isRejected = membership?.membershipStatus === "Rejected";
  const isTrialExpired = membership?.membershipStatus === "TrialExpired";

  useEffect(() => {
    if (loading || membershipLoading) return;
    if (!user) { navigate("/login", { replace: true }); return; }

    const status = membership?.membershipStatus;

    // Already active paid member → dashboard
    if (status === "Active" && membership?.donationStatus !== "Skipped") {
      navigate("/", { replace: true });
      return;
    }

    if (status === "Pending") { navigate("/membership/pending", { replace: true }); return; }
    if (status === "Expired") { navigate("/membership/expired", { replace: true }); return; }
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
    const amt = parseInt(paymentAmount, 10);
    if (isNaN(amt) || amt < 1) { setError("યોગ્ય રકમ ભરો."); return; }

    setError("");
    setSubmitting(true);
    try {
      await submitMembershipPayment({
        paymentProofFile: proofFile,
        paymentMethod,
        paymentReference: paymentReference.trim(),
        paymentAmount: amt,
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
    <div style={{ minHeight: "100dvh", background: "var(--color-paper)", overflowY: "auto" }}>

      {/* ── Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 30,
        background: "rgba(var(--color-paper-raw, 247,244,236), 0.95)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--color-border)",
        padding: "0 16px",
      }}>
        <div style={{
          maxWidth: "520px", margin: "0 auto", height: "60px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/icons/icon-192.png" alt="logo" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
            <span style={{ fontSize: "17px", fontWeight: 700, color: "var(--color-crop-600)" }}>
              ખેડૂત ખર્ચ
            </span>
          </div>
          {/* If TrialExpired, allow user to go back to read-only app */}
          {isTrialExpired ? (
            <button
              onClick={() => navigate(-1)}
              style={{
                fontSize: "13px", color: "var(--color-ink-faint)",
                background: "none", border: "1px solid var(--color-border)",
                borderRadius: "8px", padding: "6px 12px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "4px",
              }}
            >
              <CloseIcon size={14} /> ← પાછા
            </button>
          ) : (
            <button
              onClick={signOutUser}
              style={{
                fontSize: "13px", color: "var(--color-ink-faint)",
                background: "none", border: "1px solid var(--color-border)",
                borderRadius: "8px", padding: "6px 12px", cursor: "pointer",
              }}
            >
              સાઇન આઉટ
            </button>
          )}
        </div>
      </header>

      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "24px 16px 48px" }}>

        {/* ── Rejection notice ── */}
        {isRejected && (
          <div style={{
            background: "var(--color-loss-100)", border: "1px solid var(--color-loss-400)",
            borderRadius: "14px", padding: "14px 16px", marginBottom: "20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13.5px", color: "var(--color-loss-600)", fontWeight: 600 }}>
              <XCircleIcon size={18} /> તમારી અગાઉની ચુકવણી નકારી કઢવામાં આવી છે. નવો પ્રૂફ સબમિટ કરો.
            </div>
          </div>
        )}

        {/* ── Trial expired notice ── */}
        {isTrialExpired && (
          <div style={{
            background: "#fff8e1", border: "1px solid #ffc107",
            borderRadius: "14px", padding: "14px 16px", marginBottom: "20px",
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <span style={{ fontSize: "22px", display: "flex", alignItems: "center" }}><HourglassIcon size={24} /></span>
            <p style={{ fontSize: "13.5px", color: "#6d4c00", margin: 0, lineHeight: "1.6", fontWeight: 500 }}>
              તમારો 7 દિવસ ફ્રી ટ્રાયલ સમાપ્ત. ₹300/વર્ષ ભરીને ઉપયોગ ચાલુ રાખો.
            </p>
          </div>
        )}

        {/* ── Hero title ── */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--color-ink)", margin: "0 0 8px" }}>
            {isTrialExpired ? "ટ્રાયલ સમાપ્ત — અપગ્રેડ કરો" : "ખેડૂત ખર્ચ — ₹300/વર્ષ"}
          </h1>
          <p style={{ fontSize: "14px", color: "var(--color-ink-faint)", margin: 0, lineHeight: "1.5" }}>
            એક ચા ની કિંમત, આખા વર્ષ માટે. <span style={{ display: "inline-flex", verticalAlign: "middle", marginLeft: "4px" }}><CoffeeIcon size={18} /></span>
          </p>
        </div>

        <div style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "20px",
          overflow: "hidden",
          marginBottom: "24px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          {/* Table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 90px 90px",
            background: "var(--color-paper-dim)",
            borderBottom: "1px solid var(--color-border)",
          }}>
            <div style={{ padding: "14px 16px", fontSize: "12px", fontWeight: 700, color: "var(--color-ink-soft)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              સુવિધા
            </div>
            <div style={{
              padding: "14px 10px", fontSize: "13px", fontWeight: 700,
              color: "var(--color-ink-soft)", textAlign: "center",
              background: "rgba(0,0,0,0.03)",
            }}>
              ફ્રી
            </div>
            <div style={{
              padding: "14px 10px", fontSize: "13px", fontWeight: 800,
              color: "white", textAlign: "center",
              background: "linear-gradient(135deg, var(--color-crop-500), var(--color-crop-600))",
            }}>
              ₹300/વર્ષ
            </div>
          </div>

          {/* Feature rows */}
          {FEATURES.map((f, i) => (
            <div
              key={f.label}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 90px 90px",
                borderBottom: i < FEATURES.length - 1 ? "1px solid var(--color-border)" : "none",
                background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.015)",
              }}
            >
              <div style={{
                padding: "11px 16px", fontSize: "13.5px",
                color: "var(--color-ink)", display: "flex", alignItems: "center",
              }}>
                {f.label}
              </div>
              {/* Free cell */}
              <div style={{
                padding: "11px 10px", textAlign: "center",
                display: "flex", alignItems: "center", justifyContent: "center",
                borderLeft: "1px solid var(--color-border)",
                background: "rgba(0,0,0,0.01)",
              }}>
                {f.free === false ? (
                  <span style={{ color: "#ccc", fontSize: "18px" }}>—</span>
                ) : f.free === true ? (
                  <span style={{ color: "#43a047", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><CheckIcon size={16} strokeWidth={3} /></span>
                ) : (
                  <span style={{ fontSize: "11.5px", color: "var(--color-ink-soft)", fontWeight: 600, textAlign: "center", lineHeight: "1.3" }}>
                    {f.free}
                  </span>
                )}
              </div>
              {/* Paid cell */}
              <div style={{
                padding: "11px 10px", textAlign: "center",
                display: "flex", alignItems: "center", justifyContent: "center",
                borderLeft: "1px solid rgba(47,107,79,0.2)",
                background: "rgba(47,107,79,0.04)",
              }}>
                {f.paid === false ? (
                  <span style={{ color: "#ccc", fontSize: "18px" }}>—</span>
                ) : f.paid === true ? (
                  <span style={{
                    width: "20px", height: "20px", borderRadius: "50%",
                    background: "var(--color-crop-500)", color: "white",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <CheckIcon size={12} strokeWidth={3} />
                  </span>
                ) : (
                  <span style={{ fontSize: "11.5px", color: "var(--color-crop-700)", fontWeight: 700, textAlign: "center", lineHeight: "1.3" }}>
                    {f.paid}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── QR Code Payment ── */}
        <div style={{
          background: "var(--color-surface)", border: "1px solid var(--color-border)",
          borderRadius: "16px", padding: "20px 16px", marginBottom: "20px",
        }}>
          <p style={{
            fontSize: "13px", fontWeight: 700, color: "var(--color-ink-soft)",
            textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 16px",
          }}>
            ₹300 ચૂકવો — UPI / QR
          </p>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{
              width: "200px", height: "200px", borderRadius: "16px",
              border: "2px dashed var(--color-crop-400)", background: "var(--color-crop-50)",
              overflow: "hidden",
            }}>
              <img
                src="/qr code final.jpeg"
                alt="UPI QR Code"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--color-ink-faint);font-size:13px;padding:12px;text-align:center"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg><br/>QR Code અહીં મૂકવામાં આવશે</div>`;
                  }
                }}
              />
            </div>
            <p style={{ fontSize: "13px", color: "var(--color-ink-faint)", textAlign: "center", margin: 0 }}>
              QR સ્કેન કરો અને ₹300 ચૂકવો
            </p>
          </div>

          <div style={{ background: "var(--color-paper-dim)", borderRadius: "10px", padding: "10px 14px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: "var(--color-ink-soft)", lineHeight: "1.6" }}>
              <div style={{ marginTop: "2px", flexShrink: 0 }}><PinIcon size={16} /></div>
              <span>ચૂકવ્યા પછી નીચે Screenshot/Receipt અપલોડ કરો. Admin ચકાસ્યા પછી (24 કલાકમાં) ખાતું ચાલુ થશે.</span>
            </div>
          </div>
        </div>

        {/* ── Payment proof form ── */}
        <div style={{
          background: "var(--color-surface)", border: "1px solid var(--color-border)",
          borderRadius: "16px", padding: "20px 16px", marginBottom: "20px",
        }}>
          <p style={{
            fontSize: "13px", fontWeight: 700, color: "var(--color-ink-soft)",
            textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 16px",
          }}>
            પ્રૂફ સબમિટ કરો
          </p>

          {/* Payment method */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "13px", color: "var(--color-ink-soft)", marginBottom: "6px", fontWeight: 500 }}>
              ચુકવણીની રીત
            </label>
            <select
              id="payment-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{
                width: "100%", height: "46px", borderRadius: "12px",
                border: "1.5px solid var(--color-border)", background: "var(--color-paper)",
                color: "var(--color-ink)", fontSize: "15px", padding: "0 14px", outline: "none",
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
            <label style={{ display: "block", fontSize: "13px", color: "var(--color-ink-soft)", marginBottom: "6px", fontWeight: 500 }}>
              ટ્રાન્ઝેક્શન ID / UTR નંબર
            </label>
            <input
              id="payment-reference"
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="ટ્રાન્ઝેક્શન ID અહીં ભરો"
              style={{
                width: "100%", boxSizing: "border-box", height: "46px", borderRadius: "12px",
                border: "1.5px solid var(--color-border)", background: "var(--color-paper)",
                color: "var(--color-ink)", fontSize: "15px", padding: "0 14px", outline: "none",
              }}
            />
          </div>

          {/* Payment Amount */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "13px", color: "var(--color-ink-soft)", marginBottom: "6px", fontWeight: 500 }}>
              ચૂકવેલ રકમ (₹)
            </label>
            <input
              id="payment-amount"
              type="number"
              min="1"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="300"
              style={{
                width: "100%", boxSizing: "border-box", height: "46px", borderRadius: "12px",
                border: "1.5px solid var(--color-border)", background: "var(--color-paper)",
                color: "var(--color-ink)", fontSize: "15px", padding: "0 14px", outline: "none",
              }}
            />
          </div>

          {/* File upload */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", color: "var(--color-ink-soft)", marginBottom: "6px", fontWeight: 500 }}>
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
                width: "100%", height: "80px", borderRadius: "12px",
                border: `2px dashed ${proofFile ? "var(--color-crop-400)" : "var(--color-border)"}`,
                background: proofFile ? "var(--color-crop-50)" : "var(--color-paper)",
                color: proofFile ? "var(--color-crop-600)" : "var(--color-ink-faint)",
                fontSize: "14px", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: "4px", transition: "all 0.2s",
              }}
            >
              <PaperclipIcon size={24} className={proofFile ? "text-[var(--color-crop-600)]" : "text-[var(--color-ink-soft)]"} />
              <span>{proofFile ? proofFile.name : "ક્લિક કરીને ફાઇલ પસંદ કરો"}</span>
            </button>

            {proofPreview && proofFile?.type.startsWith("image/") && (
              <div style={{ marginTop: "10px", textAlign: "center" }}>
                <img
                  src={proofPreview}
                  alt="Payment proof preview"
                  style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "10px", border: "1px solid var(--color-border)", objectFit: "contain" }}
                />
              </div>
            )}
          </div>

          {error && (
            <div style={{
              background: "var(--color-loss-100)", border: "1px solid var(--color-loss-400)",
              borderRadius: "10px", padding: "10px 14px", marginBottom: "14px",
            }}>
              <p style={{ fontSize: "13.5px", color: "var(--color-loss-600)", margin: 0 }}>{error}</p>
            </div>
          )}

          <button
            id="submit-membership-btn"
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: "100%", height: "52px", borderRadius: "14px",
              background: submitting
                ? "var(--color-paper-dim)"
                : "linear-gradient(135deg, var(--color-crop-500), var(--color-crop-600))",
              color: submitting ? "var(--color-ink-faint)" : "white",
              border: "none", cursor: submitting ? "not-allowed" : "pointer",
              fontSize: "15px", fontWeight: 600,
              boxShadow: submitting ? "none" : "0 4px 14px rgba(47,107,79,0.3)",
              transition: "all 0.2s", touchAction: "manipulation",
            }}
          >
            {submitting ? "સબમિટ કરી રહ્યા છે..." : "ચુકવણી સ્વીકૃત માટે સબમિટ કરો →"}
          </button>
        </div>

        {/* Fine print */}
        <p style={{ textAlign: "center", fontSize: "12px", color: "var(--color-ink-faint)", lineHeight: "1.6" }}>
          ₹300/વર્ષ · Admin ચકાસ્યા પછી 24 કલાકમાં ઍક્ટિવ · કોઈ ઑટો-રિન્યૂ નહીં
          <br /><br />
          પેમેન્ટ સબમિટ કરીને તમે અમારી <Link to="/terms" style={{ color: "var(--color-crop-600)", textDecoration: "underline" }}>શરતો</Link> અને <Link to="/privacy-policy" style={{ color: "var(--color-crop-600)", textDecoration: "underline" }}>ગોપનીયતા નીતિ</Link> સાથે સંમત થાઓ છો.
        </p>

      </div>
    </div>
  );
}

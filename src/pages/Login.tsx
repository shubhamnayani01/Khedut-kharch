import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LeafIcon, 
  UsersIcon, 
  NotebookIcon, 
  SmartphoneIcon, 
  FieldIcon, 
  RupeeIcon, 
  ChartIcon, 
  CheckCircleIcon,
  MessageCircleIcon,
  ShieldIcon,
  RefreshIcon
} from "../components/icons/UIIcons";

export default function Login() {
  const {
    user,
    loading,
    membership,
    membershipLoading,
    isAdmin,
    signInWithGoogle,
    sendEmailOtp,
    verifyEmailOtp,
    signOutUser,
  } = useAuth();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState<"email" | "google">("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"email_input" | "otp_input">("email_input");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Timer countdown for resending OTP
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Redirect if already authenticated
  useEffect(() => {
    if (loading || membershipLoading) return;
    if (!user) return;

    if (isAdmin) {
      navigate("/", { replace: true });
      return;
    }

    if (!membership) {
      navigate("/membership/payment", { replace: true });
    } else if (membership.membershipStatus === "Active") {
      navigate("/", { replace: true });
    } else if (membership.membershipStatus === "Pending") {
      navigate("/membership/pending", { replace: true });
    } else if (membership.membershipStatus === "Expired") {
      navigate("/membership/expired", { replace: true });
    } else if (membership.membershipStatus === "Banned") {
      setError("તમારું એકાઉન્ટ બ્લોક કરવામાં આવ્યું છે. (Your account has been banned.)");
      void signOutUser();
    } else {
      // Free users (Trial, TrialExpired) or unknown statuses go directly to dashboard
      navigate("/", { replace: true });
    }
  }, [user, loading, membership, membershipLoading, isAdmin, navigate, signOutUser]);

  const handleSendEmailOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setError("કૃપા કરીને સાચું ઈમેલ એડ્રેસ દાખલ કરો.");
      return;
    }

    setBusy(true);

    try {
      await sendEmailOtp(cleanEmail);
      setStep("otp_input");
      setResendTimer(60);
    } catch (err: unknown) {
      console.error("Email OTP Send Error:", err);
      const msg = (err as Error)?.message;
      if (msg === "GOOGLE_ACCOUNT_EXISTS") {
        setError("GOOGLE_ACCOUNT_EXISTS");
      } else {
        setError("ઈમેલ પર OTP મોકલવામાં ભૂલ આવી. કૃપા કરીને ઈમેલ તપાસો અથવા ફરી પ્રયાસ કરો.");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length !== 6) {
      setError("કૃપા કરીને 6 આંકડાનો OTP દાખલ કરો.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await verifyEmailOtp(email.trim(), otpCode.trim());
      // Navigation is handled by the redirect useEffect above
    } catch (err: unknown) {
      console.error("Email OTP Verify Error:", err);
      const msg = (err as Error)?.message;
      if (msg === "OTP_INVALID") {
        setError("ખોટો OTP કોડ છે. તમારા ઈમેલમાંથી સાચો કોડ દાખલ કરો.");
      } else if (msg === "OTP_EXPIRED") {
        setError("OTP નો સમય (10 મિનિટ) પૂરો થઈ ગયો છે. નવો OTP મંગાવો.");
      } else {
        setError("ચકાસણી નિષ્ફળ ગઈ. ફરી પ્રયાસ કરો.");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
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
    <div className="min-h-dvh bg-[var(--color-paper)] overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div
          style={{
            position: "absolute",
            top: "-10vh",
            right: "-10vw",
            width: "50vw",
            height: "50vw",
            minWidth: "300px",
            minHeight: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, var(--color-crop-100) 0%, transparent 70%)",
            opacity: 0.6,
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10vh",
            left: "-10vw",
            width: "60vw",
            height: "60vw",
            minWidth: "350px",
            minHeight: "350px",
            borderRadius: "50%",
            background: "radial-gradient(circle, var(--color-saffron-100) 0%, transparent 70%)",
            opacity: 0.5,
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />
      </div>

      <div className="relative z-10 max-w-[600px] mx-auto px-5 py-12 pb-24">
        
        {/* Header / Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-[var(--color-border)]">
            <img
              src="/icons/icon-192.png"
              alt="ખેડૂત ખર્ચ logo"
              className="w-14 h-14 object-contain"
            />
          </div>
          <h1 className="text-[32px] sm:text-[40px] font-extrabold text-[var(--color-ink)] mb-4 leading-tight">
            કચ્છના ખેડૂતો માટે <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-crop-500)] to-[var(--color-crop-400)]">
              ડિજિટલ હિસાબપોથી
            </span>
          </h1>
          <p className="text-[16px] text-[var(--color-ink-soft)] leading-relaxed mb-8 max-w-[400px] mx-auto">
            તમારા ખેતરનો તમામ હિસાબ હવે તમારા મોબાઇલમાં. કાગળની ડાયરી ભૂલો અને સ્માર્ટ ખેતીની શરૂઆત કરો.
          </p>

          {/* Call to Action Box */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-[var(--shadow-card)]">
            {error === "GOOGLE_ACCOUNT_EXISTS" ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 mb-5 text-left shadow-sm">
                <div className="flex items-start gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 text-emerald-700">
                    <ShieldIcon size={18} />
                  </div>
                  <div>
                    <h4 className="text-[14.5px] font-bold text-emerald-900 leading-snug">
                      તમારું એકાઉન્ટ Google સાથે જોડાયેલું છે
                    </h4>
                    <p className="text-[12.5px] text-emerald-700 mt-1 leading-relaxed">
                      <span className="font-semibold text-emerald-900">{email}</span> માટે પાસવર્ડ કે OTP ની જરૂર નથી! નીચે એક ક્લિકમાં તમારા જૂના એકાઉન્ટમાં સીધા પ્રવેશ કરો:
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-2.5 h-12 rounded-xl text-white font-bold text-[14.5px] transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    boxShadow: "0 4px 14px -3px rgba(5, 150, 105, 0.4)",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span>Google દ્વારા સીધા પ્રવેશ કરો</span>
                </button>
              </div>
            ) : error ? (
              <div className="bg-[var(--color-loss-100)] border border-[var(--color-loss-400)] rounded-xl p-3 mb-4 text-[13.5px] text-[var(--color-loss-600)] text-left flex items-start gap-2">
                <CheckCircleIcon size={18} className="shrink-0 mt-0.5 opacity-0" />
                <span>{error}</span>
              </div>
            ) : null}
            
            {/* Auth Tab Switcher */}
            <div className="flex bg-[var(--color-paper-light)] p-1 rounded-xl mb-6 border border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => { setAuthMode("email"); setError(""); }}
                className={`flex-1 py-2.5 rounded-lg text-[14px] font-bold transition-all flex items-center justify-center gap-2 ${
                  authMode === "email"
                    ? "bg-white text-[var(--color-crop-600)] shadow-sm"
                    : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <span>ઈમેલ (Email OTP)</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("google"); setError(""); }}
                className={`flex-1 py-2.5 rounded-lg text-[14px] font-bold transition-all flex items-center justify-center gap-2 ${
                  authMode === "google"
                    ? "bg-white text-[var(--color-crop-600)] shadow-sm"
                    : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>Google</span>
              </button>
            </div>

            {/* Email OTP Section */}
            {authMode === "email" && (
              <div>
                {step === "email_input" ? (
                  <form onSubmit={handleSendEmailOtp} className="space-y-4">
                    <div className="text-left">
                      <label className="block text-[13px] font-bold text-[var(--color-ink)] mb-1.5">
                        તમારું ઈમેલ એડ્રેસ દાખલ કરો:
                      </label>
                      <input
                        type="email"
                        required
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="દા.ત. khedut@gmail.com"
                        className="w-full h-13 px-4 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-crop-500)] focus:ring-2 focus:ring-[var(--color-crop-100)] outline-none text-[15px] font-semibold text-[var(--color-ink)] bg-white transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={busy || !email.includes("@")}
                      className="w-full flex items-center justify-center gap-3 h-13 rounded-xl text-white font-bold text-[16px] transition-all duration-300"
                      style={{
                        background: busy || !email.includes("@")
                          ? "#cbd5e1"
                          : "linear-gradient(135deg, var(--color-crop-500), var(--color-crop-600))",
                        boxShadow: busy || !email.includes("@")
                          ? "none"
                          : "0 8px 20px -6px rgba(47,107,79,0.5)",
                        cursor: busy || !email.includes("@") ? "not-allowed" : "pointer",
                      }}
                    >
                      {busy ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>OTP મોકલી રહ્યું છે...</span>
                        </>
                      ) : (
                        <span>OTP મેળવો (Send OTP)</span>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
                    <div className="text-left">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[13px] font-bold text-[var(--color-ink)]">
                          6 આંકડાનો OTP દાખલ કરો:
                        </label>
                        <button
                          type="button"
                          onClick={() => { setStep("email_input"); setOtpCode(""); setError(""); }}
                          className="text-[12px] font-bold text-[var(--color-crop-600)] hover:underline"
                        >
                          ઈમેલ બદલો
                        </button>
                      </div>
                      <p className="text-[12px] text-[var(--color-ink-soft)] mb-2">
                        <span className="font-semibold text-[var(--color-ink)]">{email}</span> પર મોકલેલ 6 આંકડાનો કોડ દાખલ કરો:
                      </p>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={6}
                        autoFocus
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••••"
                        className="w-full h-13 px-4 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-crop-500)] focus:ring-2 focus:ring-[var(--color-crop-100)] outline-none text-[22px] font-extrabold text-center tracking-[10px] text-[var(--color-ink)] bg-white transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={busy || otpCode.trim().length !== 6}
                      className="w-full flex items-center justify-center gap-3 h-13 rounded-xl text-white font-bold text-[16px] transition-all duration-300"
                      style={{
                        background: busy || otpCode.trim().length !== 6
                          ? "#cbd5e1"
                          : "linear-gradient(135deg, var(--color-crop-500), var(--color-crop-600))",
                        boxShadow: busy || otpCode.trim().length !== 6
                          ? "none"
                          : "0 8px 20px -6px rgba(47,107,79,0.5)",
                        cursor: busy || otpCode.trim().length !== 6 ? "not-allowed" : "pointer",
                      }}
                    >
                      {busy ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>ચકાસી રહ્યું છે...</span>
                        </>
                      ) : (
                        <span>લૉગઇન ચકાસો (Verify & Sign In)</span>
                      )}
                    </button>

                    <div className="text-center pt-1">
                      {resendTimer > 0 ? (
                        <p className="text-[12.5px] text-[var(--color-ink-faint)]">
                          ફરીથી OTP મોકલો {resendTimer} સેકન્ડમાં
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendEmailOtp()}
                          className="text-[13px] font-bold text-[var(--color-crop-600)] hover:underline inline-flex items-center gap-1"
                        >
                          <RefreshIcon size={14} />
                          <span>ફરીથી OTP મોકલો (Resend OTP)</span>
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Google Login Section */}
            {authMode === "google" && (
              <div>
                <button
                  id="google-signin-btn"
                  onClick={handleGoogleSignIn}
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-3 h-14 rounded-xl text-white font-semibold text-[16px] transition-all duration-300"
                  style={{
                    background: busy
                      ? "var(--color-paper-dim)"
                      : "linear-gradient(135deg, var(--color-crop-500), var(--color-crop-600))",
                    boxShadow: busy ? "none" : "0 8px 20px -6px rgba(47,107,79,0.5)",
                    cursor: busy ? "not-allowed" : "pointer",
                  }}
                >
                  {busy ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>લૉગઇન થઈ રહ્યું છે...</span>
                    </>
                  ) : (
                    <>
                      <svg width="24" height="24" viewBox="0 0 48 48">
                        <path fill="#fff" d="M44.5 20H24v8.5h11.8C34.7 33.9 30 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
                      </svg>
                      <span>Google સાથે શરૂઆત કરો</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <p className="text-[12px] text-[var(--color-ink-faint)] mt-4 leading-relaxed">
              લૉગઇન કરીને તમે અમારી <Link to="/terms" className="underline text-[var(--color-crop-600)]">નિયમો અને શરતો</Link> અને <Link to="/privacy-policy" className="underline text-[var(--color-crop-600)]">ગોપનીયતા નીતિ</Link> સાથે સંમત થાઓ છો.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-14">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-[var(--color-border)] flex-1" />
            <h2 className="text-[15px] font-bold tracking-wide text-[var(--color-ink-soft)] uppercase">
              એપની ખાસિયતો
            </h2>
            <div className="h-px bg-[var(--color-border)] flex-1" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FeatureCard 
              icon={<LeafIcon size={22} />} 
              title="પાક-વાઇઝ હિસાબ" 
              desc="દરેક સિઝન અને પાકનો અલગથી ખર્ચ અને આવકનો હિસાબ રાખો."
            />
            <FeatureCard 
              icon={<UsersIcon size={22} />} 
              title="ભાગીદાર અને મજૂરી" 
              desc="ખેતમજૂરોની હાજરી અને ભાગીદારોના એડવાન્સ ઉપાડની નોંધ."
            />
            <FeatureCard 
              icon={<NotebookIcon size={22} />} 
              title="ઇન્વેન્ટરી મેનેજમેન્ટ" 
              desc="દવા અને ખાતરની જથ્થાબંધ ખરીદી અને વપરાશનો હિસાબ."
            />
            <FeatureCard 
              icon={<SmartphoneIcon size={22} />} 
              title="100% ઓફલાઇન સપોર્ટ" 
              desc="ઇન્ટરનેટ વગર પણ કામ કરે, નેટવર્ક આવ્યે ઓટો-બેકઅપ."
            />
            <FeatureCard 
              icon={<MessageCircleIcon size={22} />} 
              title="24/7 ગ્રાહક સેવા" 
              desc="કોઈપણ સમયે વોટ્સએપ પર સીધી મદદ અને માર્ગદર્શન."
            />
            <FeatureCard 
              icon={<ShieldIcon size={22} />} 
              title="સંપૂર્ણ સુરક્ષિત ડેટા" 
              desc="તમારો તમામ હિસાબ ગૂગલ ક્લાઉડ પર 100% સુરક્ષિત છે."
            />
          </div>
        </div>

        {/* How it works */}
        <div className="mb-14 bg-white/40 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-[var(--color-border)]">
          <h2 className="text-[20px] font-bold text-[var(--color-ink)] mb-6 text-center">
            કેવી રીતે વાપરવું?
          </h2>
          <div className="space-y-6">
            <Step 
              num="1" 
              icon={<FieldIcon size={20} />} 
              title="ખેતી ઉમેરો" 
              desc="નવી સિઝન શરૂ કરો, પાક અને વીઘાની વિગત ભરો." 
            />
            <Step 
              num="2" 
              icon={<RupeeIcon size={20} />} 
              title="ખર્ચ નોંધો" 
              desc="રોજબરોજના ખર્ચ, બિયારણ, મજૂરી બધું એપમાં નાખો." 
            />
            <Step 
              num="3" 
              icon={<ChartIcon size={20} />} 
              title="નફો જુઓ" 
              desc="કાપણી વખતે વેચાણ નાખીને તમારો સાચો નફો અને ખર્ચનો રિપોર્ટ જુઓ." 
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-crop-100)] text-[var(--color-crop-600)] mb-4">
            <CheckCircleIcon size={28} strokeWidth={2.5} />
          </div>
          <h2 className="text-[22px] font-bold text-[var(--color-ink)] mb-3">
            ફ્રી અને પ્રીમિયમ પ્લાન
          </h2>
          <p className="text-[15px] text-[var(--color-ink-soft)] leading-relaxed mb-6 max-w-[360px] mx-auto">
            એપનો મૂળભૂત ઉપયોગ મફત છે. ક્લાઉડ બેકઅપ, PDF રિપોર્ટ અને અનલિમિટેડ પાક જેવી પ્રીમિયમ સુવિધાઓ માટે તમે <strong className="text-[var(--color-ink)]">માત્ર ₹300</strong> ચૂકવીને અપગ્રેડ કરી શકો છો.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center pb-8 border-t border-[var(--color-border)] pt-8 flex flex-col items-center gap-3">
          <p className="text-[13px] text-[var(--color-ink-faint)]">
            &copy; 2026 Khedut Kharch. All rights reserved. <br/>
            Made for farmers in Kachchh.
          </p>
          <div className="flex items-center gap-4 text-[13px] font-medium text-[var(--color-ink-soft)]">
            <Link to="/privacy-policy" className="hover:text-[var(--color-crop-600)] transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-[var(--color-crop-600)] transition-colors">Terms & Conditions</Link>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white/50 shadow-sm transition-transform hover:-translate-y-1 duration-300">
      <div className="w-10 h-10 rounded-full bg-[var(--color-crop-50)] text-[var(--color-crop-600)] flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-[16px] font-bold text-[var(--color-ink)] mb-1.5">{title}</h3>
      <p className="text-[13.5px] text-[var(--color-ink-soft)] leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ num, icon, title, desc }: { num: string, icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="relative flex flex-col items-center">
        <div className="w-9 h-9 rounded-full bg-[var(--color-soil-100)] text-[var(--color-soil-600)] flex items-center justify-center font-bold text-[15px] z-10 border-2 border-[var(--color-paper)] shadow-sm">
          {num}
        </div>
        {num !== "3" && (
          <div className="absolute top-9 bottom-[-24px] w-[2px] bg-gradient-to-b from-[var(--color-soil-100)] to-transparent" />
        )}
      </div>
      <div className="pt-1.5 pb-2">
        <h3 className="text-[16px] font-bold text-[var(--color-ink)] mb-1 flex items-center gap-2">
          <span className="text-[var(--color-crop-500)]">{icon}</span>
          {title}
        </h3>
        <p className="text-[14px] text-[var(--color-ink-soft)] leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

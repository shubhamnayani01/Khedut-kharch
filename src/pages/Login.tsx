import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  ShieldIcon
} from "../components/icons/UIIcons";

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
            {error && (
              <div className="bg-[var(--color-loss-100)] border border-[var(--color-loss-400)] rounded-xl p-3 mb-4 text-[13.5px] text-[var(--color-loss-600)] text-left flex items-start gap-2">
                <CheckCircleIcon size={18} className="shrink-0 mt-0.5 opacity-0" />
                <span>{error}</span>
              </div>
            )}
            
            <button
              id="google-signin-btn"
              onClick={handleSignIn}
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
            <p className="text-[12px] text-[var(--color-ink-faint)] mt-4">
              તમારો ડેટા સંપૂર્ણપણે સુરક્ષિત છે.
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
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-saffron-100)] text-[var(--color-saffron-600)] mb-4">
            <CheckCircleIcon size={28} strokeWidth={2.5} />
          </div>
          <h2 className="text-[22px] font-bold text-[var(--color-ink)] mb-3">
            વાપરવા માટે સંપૂર્ણ મફત
          </h2>
          <p className="text-[15px] text-[var(--color-ink-soft)] leading-relaxed mb-6 max-w-[360px] mx-auto">
            ખેડૂત ખર્ચ એપ વાપરવા માટે મફત છે. પ્રોજેક્ટને ચાલુ રાખવા અને સર્વર ખર્ચ માટે તમે <strong className="text-[var(--color-ink)]">માત્ર ₹300</strong> નું સ્વૈચ્છિક દાન કરી શકો છો.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center pb-8 border-t border-[var(--color-border)] pt-8">
          <p className="text-[13px] text-[var(--color-ink-faint)]">
            &copy; 2026 Khedut Kharch. All rights reserved. <br/>
            Made for farmers in Kachchh.
          </p>
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

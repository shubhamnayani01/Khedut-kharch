import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { UserIcon, CheckCircleIcon } from "./icons/UIIcons";

interface ProfileSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function ProfileSetupModal({ isOpen, onComplete }: ProfileSetupModalProps) {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [name, setName] = useState(userProfile?.name || user?.displayName || "");
  const [age, setAge] = useState(userProfile?.age ? String(userProfile.age) : "");
  const [village, setVillage] = useState(userProfile?.village || "");
  const [taluka, setTaluka] = useState(userProfile?.taluka || "");
  const [district, setDistrict] = useState(userProfile?.district || "કચ્છ");
  const [landSize, setLandSize] = useState(userProfile?.landSizeAcres ? String(userProfile.landSizeAcres) : "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("કૃપા કરીને તમારું પૂરું નામ લખો.");
      return;
    }
    if (!village.trim()) {
      setError("કૃપા કરીને તમારા ગામનું નામ લખો.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await updateUserProfile({
        name: name.trim(),
        age: age ? parseInt(age, 10) : null,
        village: village.trim(),
        taluka: taluka.trim() || null,
        district: district.trim() || "કચ્છ",
        landSizeAcres: landSize ? parseFloat(landSize) : null,
        phoneNumber: user?.phoneNumber || userProfile?.phoneNumber || null,
        hasCompletedProfile: true,
      });
      onComplete();
    } catch (err: unknown) {
      console.error("Failed to save profile:", err);
      setError("પ્રોફાઇલ સાચવવામાં સમસ્યા આવી. કૃપા કરીને ફરી પ્રયાસ કરો.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#ffffff",
          borderRadius: "24px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          padding: "28px 24px",
          border: "1px solid rgba(226, 232, 240, 0.9)",
          animation: "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <style>{`
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* Top Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <UserIcon size={26} />
          </div>
          <div>
            <span className="text-[11.5px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
              ખેડૂત નોંધણી (Farmer Details)
            </span>
            <h2 className="text-[20px] font-extrabold text-[var(--color-ink)] leading-tight mt-0.5">
              તમારી વિગતો ભરો
            </h2>
          </div>
        </div>

        <p className="text-[13.5px] text-[var(--color-ink-soft)] mb-5 leading-relaxed">
          નમસ્તે ખેડૂત મિત્ર! તમારા હિસાબ અને સિઝનને યોગ્ય રીતે ગોઠવવા કૃપા કરીને નીચેની મૂળભૂત વિગતો ભરો.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-[13px] flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-[13px] font-bold text-[var(--color-ink)] mb-1.5">
              ખેડૂતનું નામ (Full Name) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="દા.ત. રમેશભાઈ પટેલ"
                className="w-full h-12 px-3.5 rounded-xl border border-[var(--color-border)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-[15px] text-[var(--color-ink)] transition-all bg-[var(--color-paper-light)]"
              />
            </div>
          </div>

          {/* Age & Land Size Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-bold text-[var(--color-ink)] mb-1.5">
                ઉંમર (Age)
              </label>
              <input
                type="number"
                min="14"
                max="105"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="દા.ત. 42"
                className="w-full h-12 px-3.5 rounded-xl border border-[var(--color-border)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-[15px] text-[var(--color-ink)] transition-all bg-[var(--color-paper-light)]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[var(--color-ink)] mb-1.5">
                જમીન / વીઘા (Land)
              </label>
              <input
                type="number"
                step="0.5"
                value={landSize}
                onChange={(e) => setLandSize(e.target.value)}
                placeholder="દા.ત. 15 વીઘા"
                className="w-full h-12 px-3.5 rounded-xl border border-[var(--color-border)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-[15px] text-[var(--color-ink)] transition-all bg-[var(--color-paper-light)]"
              />
            </div>
          </div>

          {/* Village & Taluka Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-bold text-[var(--color-ink)] mb-1.5">
                ગામ (Village) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="દા.ત. માધાપર"
                className="w-full h-12 px-3.5 rounded-xl border border-[var(--color-border)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-[15px] text-[var(--color-ink)] transition-all bg-[var(--color-paper-light)]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[var(--color-ink)] mb-1.5">
                તાલુકો (Taluka)
              </label>
              <input
                type="text"
                value={taluka}
                onChange={(e) => setTaluka(e.target.value)}
                placeholder="દા.ત. ભુજ"
                className="w-full h-12 px-3.5 rounded-xl border border-[var(--color-border)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-[15px] text-[var(--color-ink)] transition-all bg-[var(--color-paper-light)]"
              />
            </div>
          </div>

          {/* District Field */}
          <div>
            <label className="block text-[13px] font-bold text-[var(--color-ink)] mb-1.5">
              જિલ્લો (District)
            </label>
            <div className="relative">
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="દા.ત. કચ્છ"
                className="w-full h-12 px-3.5 rounded-xl border border-[var(--color-border)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-[15px] text-[var(--color-ink)] transition-all bg-[var(--color-paper-light)]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-13 mt-2 rounded-xl text-white font-bold text-[16px] flex items-center justify-center gap-2 transition-all duration-200"
            style={{
              background: submitting
                ? "#94a3b8"
                : "linear-gradient(135deg, var(--color-crop-500), var(--color-crop-600))",
              boxShadow: submitting ? "none" : "0 8px 20px -6px rgba(47,107,79,0.5)",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>સાચવી રહ્યું છે...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon size={20} />
                <span>સાચવો અને આગળ વધો (Save & Continue)</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

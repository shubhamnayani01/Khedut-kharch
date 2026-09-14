import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LockIcon, AlertIcon, HourglassIcon } from "../icons/UIIcons";

/**
 * TrialBanner — shown at the very top of the app (inside AppShell / Screen)
 * in two modes:
 *  • isInTrial  → green countdown: "X days left in your free trial"
 *  • isReadOnly → red lockout: "Trial ended — upgrade to add/edit data"
 */
export function TrialBanner() {
  const { isInTrial, isReadOnly, trialDaysLeft } = useAuth();
  const navigate = useNavigate();

  if (!isInTrial && !isReadOnly) return null;

  if (isReadOnly) {
    return (
      <div
        style={{
          background: "linear-gradient(90deg, #b5423a, #c0392b)",
          color: "white",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          fontSize: "13px",
          fontWeight: 500,
          flexShrink: 0,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><LockIcon size={16} /> ટ્રાયલ સમાપ્ત — ડેટા જોઈ શકો છો, ઉમેરી નહીં</span>
        <button
          onClick={() => navigate("/membership/payment")}
          style={{
            background: "white",
            color: "#c0392b",
            border: "none",
            borderRadius: "8px",
            padding: "5px 12px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          ₹300 ભરો
        </button>
      </div>
    );
  }

  // isInTrial
  const urgent = trialDaysLeft <= 2;
  return (
    <div
      style={{
        background: urgent
          ? "linear-gradient(90deg, #e67e22, #d35400)"
          : "linear-gradient(90deg, #2e7d32, #388e3c)",
        color: "white",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        fontSize: "13px",
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {urgent ? <AlertIcon size={16} /> : <HourglassIcon size={16} />}
        {trialDaysLeft === 0
          ? "આજે ટ્રાયલ સમાપ્ત"
          : `ટ્રાયલ — ${trialDaysLeft} દિ${trialDaysLeft === 1 ? "વસ" : "વસ"} બાકી`}
      </span>
      <button
        onClick={() => navigate("/membership/payment")}
        style={{
          background: "rgba(255,255,255,0.25)",
          color: "white",
          border: "1px solid rgba(255,255,255,0.5)",
          borderRadius: "8px",
          padding: "5px 12px",
          fontSize: "12px",
          fontWeight: 700,
          cursor: "pointer",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        ₹300 અપગ્રેડ
      </button>
    </div>
  );
}

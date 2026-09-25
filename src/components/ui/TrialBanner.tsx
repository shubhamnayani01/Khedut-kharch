import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ShieldIcon } from "../icons/UIIcons";

export function TrialBanner() {
  const { isPremium } = useAuth();
  const navigate = useNavigate();

  if (isPremium) return null;

  return (
    <div
      style={{
        background: "linear-gradient(90deg, #1d4ed8, #2563eb)",
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
        <ShieldIcon size={16} /> 
        ફ્રી પ્લાન - પ્રીમિયમ સુવિધાઓ માટે અપગ્રેડ કરો
      </span>
      <button
        onClick={() => navigate("/membership/payment")}
        style={{
          background: "white",
          color: "#1d4ed8",
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
        ₹300 અપગ્રેડ
      </button>
    </div>
  );
}

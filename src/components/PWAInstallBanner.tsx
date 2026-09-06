import { useState } from "react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { InstallIcon, CloseIcon } from "./icons/UIIcons";

export function PWAInstallBanner() {
  const { canInstall, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem("pwa_install_banner_dismissed") === "true";
  });

  if (!canInstall || dismissed) return null;

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa_install_banner_dismissed", "true");
    setDismissed(true);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "72px",
        left: "12px",
        right: "12px",
        zIndex: 90,
        background: "linear-gradient(135deg, var(--color-crop-600), var(--color-crop-700))",
        color: "white",
        borderRadius: "16px",
        padding: "12px 14px",
        boxShadow: "0 10px 25px -5px rgba(47, 107, 79, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        animation: "fadeInUp 0.3s ease-out both",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <InstallIcon size={20} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: "13.5px", fontWeight: 600, margin: 0, color: "white" }}>
            એપ હોમ સ્ક્રીન પર ઉમેરો
          </p>
          <p style={{ fontSize: "11.5px", margin: 0, opacity: 0.9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            ઝડપી એક્સેસ માટે ઇન્સ્ટોલ કરો
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
        <button
          onClick={handleInstall}
          style={{
            padding: "7px 14px",
            borderRadius: "10px",
            background: "white",
            color: "var(--color-crop-700)",
            border: "none",
            fontSize: "12.5px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}
        >
          ઇન્સ્ટોલ
        </button>
        <button
          onClick={handleDismiss}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(255, 255, 255, 0.8)",
            padding: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Close"
        >
          <CloseIcon size={18} />
        </button>
      </div>
    </div>
  );
}

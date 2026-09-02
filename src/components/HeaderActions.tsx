import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SettingsIcon, UserIcon } from "./icons/UIIcons";

export function HeaderActions({
  hideSettings,
  hideAccount,
  className = "",
}: {
  hideSettings?: boolean;
  hideAccount?: boolean;
  className?: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);

  const isSettingsPage = location.pathname === "/settings";
  const isAccountPage = location.pathname === "/account";

  const shouldHideSettings = hideSettings || isSettingsPage;
  const shouldHideAccount = hideAccount || isAccountPage;

  return (
    <div className={`flex items-center gap-2 shrink-0 ${className}`}>
      {!shouldHideSettings && (
        <button
          onClick={() => navigate("/settings")}
          aria-label="સેટિંગ્સ"
          title="સેટિંગ્સ"
          className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] active:scale-95 transition-all shadow-sm"
        >
          <SettingsIcon size={20} />
        </button>
      )}

      {!shouldHideAccount && (
        <button
          onClick={() => navigate("/account")}
          aria-label="એકાઉન્ટ (Account)"
          title="એકાઉન્ટ"
          className="w-10 h-10 rounded-full bg-[var(--color-crop-50)] border border-[var(--color-crop-200)] flex items-center justify-center overflow-hidden active:scale-95 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-crop-500)]"
        >
          {user?.photoURL && !imageError ? (
            <img
              src={user.photoURL}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[var(--color-crop-500)] text-white flex items-center justify-center font-bold text-sm">
              {user?.displayName ? (
                user.displayName.charAt(0).toUpperCase()
              ) : (
                <UserIcon size={18} />
              )}
            </div>
          )}
        </button>
      )}
    </div>
  );
}

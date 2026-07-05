import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { BackIcon, HomeIcon, ChartIcon, SettingsIcon, PlusIcon } from "../icons/UIIcons";

export function TopBar({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 bg-[var(--color-paper)]/95 backdrop-blur border-b border-[var(--color-border)]">
      <div className="flex items-center gap-2 h-16 px-3 max-w-2xl mx-auto">
        {onBack !== undefined ? (
          <button
            onClick={onBack ?? (() => navigate(-1))}
            aria-label="પાછળ જાઓ"
            className="w-11 h-11 flex items-center justify-center rounded-full active:bg-[var(--color-paper-dim)] text-[var(--color-ink)] shrink-0"
          >
            <BackIcon size={22} />
          </button>
        ) : (
          <div className="w-2" />
        )}
        <h1 className="flex-1 text-[19px] font-semibold text-[var(--color-ink)] truncate">{title}</h1>
        {right}
      </div>
    </header>
  );
}

const navItems = [
  { to: "/", label: "ડેશબોર્ડ", icon: HomeIcon, end: true },
  { to: "/statistics", label: "આંકડા", icon: ChartIcon, end: false },
  { to: "/settings", label: "સેટિંગ્સ", icon: SettingsIcon, end: false },
];

export function BottomNav() {
  return (
    <nav
      id="app-shell-nav"
      className="sticky bottom-0 z-30 bg-[var(--color-surface)]/95 backdrop-blur border-t border-[var(--color-border)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-2xl mx-auto grid grid-cols-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] text-[12px] font-medium transition-colors duration-150 ${
                isActive ? "text-[var(--color-crop-500)]" : "text-[var(--color-ink-faint)]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={22} strokeWidth={isActive ? 2 : 1.75} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function Fab({ onClick, label = "નવી ખેતી" }: { onClick: () => void; label?: string }) {
  return (
    <button
      id="app-shell-fab"
      onClick={onClick}
      className="fixed z-40 right-4 bottom-[calc(72px+env(safe-area-inset-bottom))] flex items-center gap-2 h-14 pl-4 pr-5 rounded-full bg-[var(--color-crop-500)] text-white shadow-[var(--shadow-float)] active:bg-[var(--color-crop-600)] transition-transform duration-150 active:scale-95"
    >
      <PlusIcon size={22} />
      <span className="text-[15px] font-semibold">{label}</span>
    </button>
  );
}

export function Screen({ children, withNav = true }: { children: React.ReactNode; withNav?: boolean }) {
  return (
    <div className={`flex-1 max-w-2xl w-full mx-auto px-4 pt-4 ${withNav ? "pb-28" : "pb-8"}`}>{children}</div>
  );
}

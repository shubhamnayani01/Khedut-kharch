import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-200"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md bg-[var(--color-surface)] rounded-t-[24px] sm:rounded-[var(--radius-card)] shadow-[var(--shadow-float)] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] animate-[dialog-in_220ms_ease-out]">
        <h2 className="text-lg font-semibold text-[var(--color-ink)] mb-3">{title}</h2>
        <div className="text-[var(--color-ink-soft)] text-[15px] leading-relaxed">{children}</div>
        {footer && <div className="mt-6 flex gap-3">{footer}</div>}
      </div>
      <style>{`
        @keyframes dialog-in {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>,
    document.body
  );
}

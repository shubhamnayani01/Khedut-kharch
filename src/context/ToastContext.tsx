import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckIcon, AlertIcon } from "../components/icons/UIIcons";

interface Toast {
  id: number;
  message: string;
  kind: "success" | "error" | "info";
}

const ToastContext = createContext<{ show: (message: string, kind?: Toast["kind"]) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const show = useCallback((message: string, kind: Toast["kind"] = "success") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {createPortal(
        <div className="fixed bottom-24 left-0 right-0 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="pointer-events-auto flex items-center gap-2 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] px-4 py-3 shadow-[var(--shadow-float)] text-[14px] font-medium animate-[toast-in_200ms_ease-out]"
            >
              {t.kind === "error" ? (
                <AlertIcon size={18} className="text-[var(--color-loss-400)]" />
              ) : (
                <CheckIcon size={18} className="text-[var(--color-crop-400)]" />
              )}
              {t.message}
            </div>
          ))}
          <style>{`
            @keyframes toast-in {
              from { transform: translateY(8px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

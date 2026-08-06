import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/** Allows access only to the admin (identified by hardcoded email). */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (!isAdmin) {
      navigate("/", { replace: true });
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-3 bg-[var(--color-paper)]">
        <div className="w-10 h-10 rounded-full border-2 border-[var(--color-crop-500)] border-t-transparent animate-spin" />
        <p className="text-[14px] text-[var(--color-ink-faint)]">લોડ થઈ રહ્યું છે...</p>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return <>{children}</>;
}

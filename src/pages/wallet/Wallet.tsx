import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { deleteDoc, doc } from "firebase/firestore";
import { Screen, TopBar, Fab } from "../../components/ui/AppShell";
import { EmptyState } from "../../components/ui/EmptyState";
import { DocumentCard } from "../../components/wallet/DocumentCard";
import { SearchIcon, CloseIcon } from "../../components/icons/UIIcons";
import { WalletIcon } from "../../components/icons/ModuleIcons";
import { useWalletDocuments } from "../../hooks/useWalletDocuments";
import { db, auth } from "../../firebase";

export default function Wallet() {
  const navigate = useNavigate();
  const { documents, loading } = useWalletDocuments();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => set.add(d.category));
    return ["all", ...Array.from(set)];
  }, [documents]);

  const filtered = useMemo(() => {
    let list = documents;
    if (filter !== "all") {
      list = list.filter((d) => d.category === filter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((d) => d.name.toLowerCase().includes(q));
    }
    return list;
  }, [documents, query, filter]);

  /** Delete only from Firestore — no Firebase Storage call needed. */
  const handleDelete = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "documents", id));
    } catch (e) {
      console.error("Error deleting document", e);
      alert("દસ્તાવેજ કાઢી નાખવામાં ભૂલ થઈ.");
    }
  };

  return (
    <>
      <TopBar title="ખેડૂત વોલેટ" />
      <Screen withNav={false}>
        <div className="mb-4">
          <p className="text-[14px] text-[var(--color-ink-faint)] leading-snug">
            તમારા તમામ જરૂરી દસ્તાવેજો સુરક્ષિત રીતે અહીં સાચવો.
          </p>
        </div>

        {documents.length > 0 && (
          <div className="flex flex-col gap-3 mb-5">
            <div className="flex-1 flex items-center gap-2 h-12 px-4 rounded-[var(--radius-control)] bg-[var(--color-surface)] border border-[var(--color-border)]">
              <SearchIcon size={19} className="text-[var(--color-ink-faint)] shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="દસ્તાવેજ શોધો..."
                className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-[var(--color-ink-faint)] min-w-0"
              />
              {query && (
                <button onClick={() => setQuery("")} className="shrink-0 text-[var(--color-ink-faint)]">
                  <CloseIcon size={17} />
                </button>
              )}
            </div>

            {categories.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFilter(c)}
                    className={`shrink-0 h-9 px-4 rounded-full text-[13px] font-medium border transition-colors duration-150 ${
                      filter === c
                        ? "bg-[var(--color-crop-500)] text-white border-[var(--color-crop-500)]"
                        : "bg-[var(--color-surface)] text-[var(--color-ink-soft)] border-[var(--color-border)]"
                    }`}
                  >
                    {c === "all" ? "બધા" : c}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-[var(--radius-card)] bg-[var(--color-paper-dim)] animate-pulse" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <EmptyState
            icon={<WalletIcon size={32} />}
            title="વોલેટ ખાલી છે"
            description="તમારા અગત્યના દસ્તાવેજો સાચવવા નવો દસ્તાવેજ ઉમેરો."
          />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<SearchIcon size={26} />} title="કંઈ મળ્યું નહીં" description="બીજું નામ શોધીને જુઓ." />
        ) : (
          <div className="space-y-3">
            {filtered.map((d) => (
              <DocumentCard key={d.id} doc={d} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </Screen>
      <Fab onClick={() => navigate("/wallet/upload")} label="નવો દસ્તાવેજ" />
    </>
  );
}



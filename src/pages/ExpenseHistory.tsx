import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";
import { TopBar, Screen } from "../components/ui/AppShell";
import { Card } from "../components/ui/Card";
import { Dialog } from "../components/ui/Dialog";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { CategoryIcon } from "../components/icons/CategoryIcons";
import { SearchIcon, FilterIcon, EditIcon, TrashIcon, CloseIcon, NotebookIcon } from "../components/icons/UIIcons";
import { EXPENSE_CATEGORIES } from "../types";
import type { Expense, ExpenseCategory } from "../types";
import { formatCurrency, formatDateDMY } from "../lib/format";

const PAGE_SIZE = 20;
type SortKey = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

export default function ExpenseHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSeason, expensesForSeason, deleteExpense } = useAppData();
  const { show } = useToast();
  const season = getSeason(id!);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ExpenseCategory | "all">("all");
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [showFilters, setShowFilters] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const all = expensesForSeason(id!);

  const filtered = useMemo(() => {
    let list = all;
    if (category !== "all") list = list.filter((e) => e.category === category);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((e) => (e.description || "").toLowerCase().includes(q));
    }
    const sorted = [...list].sort((a, b) => {
      switch (sort) {
        case "date_asc":
          return a.date.localeCompare(b.date);
        case "amount_desc":
          return b.amount - a.amount;
        case "amount_asc":
          return a.amount - b.amount;
        default:
          return b.date.localeCompare(a.date);
      }
    });
    return sorted;
  }, [all, category, query, sort]);

  useEffect(() => setVisibleCount(PAGE_SIZE), [category, query, sort]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length));
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [filtered.length]);

  const visible = filtered.slice(0, visibleCount);

  if (!season) {
    return (
      <>
        <TopBar title="ખર્ચનો ઇતિહાસ" />
        <Screen withNav={false}>
          <p className="text-[var(--color-ink-faint)] pt-8 text-center">ખેતી મળી નથી.</p>
        </Screen>
      </>
    );
  }

  return (
    <>
      <TopBar
        title="ખર્ચનો ઇતિહાસ"
        right={
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`w-11 h-11 flex items-center justify-center rounded-full ${showFilters ? "bg-[var(--color-crop-100)] text-[var(--color-crop-600)]" : "text-[var(--color-ink-soft)]"}`}
            aria-label="ફિલ્ટર"
          >
            <FilterIcon size={20} />
          </button>
        }
      />
      <Screen withNav={false}>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 flex items-center gap-2 h-12 px-4 rounded-[var(--radius-control)] bg-[var(--color-surface)] border border-[var(--color-border)]">
            <SearchIcon size={19} className="text-[var(--color-ink-faint)] shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="વર્ણનમાં શોધો..."
              className="flex-1 bg-transparent outline-none text-[15px] min-w-0 placeholder:text-[var(--color-ink-faint)]"
            />
            {query && (
              <button onClick={() => setQuery("")} className="shrink-0 text-[var(--color-ink-faint)]">
                <CloseIcon size={16} />
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <Card className="p-4 mb-4 space-y-4">
            <div>
              <p className="text-[13px] font-medium text-[var(--color-ink-soft)] mb-2">કેટેગરી</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setCategory("all")}
                  className={`shrink-0 h-9 px-3.5 rounded-full text-[13px] font-medium border ${category === "all" ? "bg-[var(--color-crop-500)] text-white border-[var(--color-crop-500)]" : "border-[var(--color-border)] text-[var(--color-ink-soft)]"}`}
                >
                  બધા
                </button>
                {EXPENSE_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`shrink-0 h-9 px-3.5 rounded-full text-[13px] font-medium border inline-flex items-center gap-1.5 ${category === c.id ? "bg-[var(--color-crop-500)] text-white border-[var(--color-crop-500)]" : "border-[var(--color-border)] text-[var(--color-ink-soft)]"}`}
                  >
                    <CategoryIcon category={c.id} size={14} />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[13px] font-medium text-[var(--color-ink-soft)] mb-2">ક્રમ</p>
              <div className="flex gap-2 flex-wrap">
                {(
                  [
                    ["date_desc", "નવીથી જૂની તારીખ"],
                    ["date_asc", "જૂનીથી નવી તારીખ"],
                    ["amount_desc", "વધુ રકમ પહેલા"],
                    ["amount_asc", "ઓછી રકમ પહેલા"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSort(key)}
                    className={`h-9 px-3.5 rounded-full text-[13px] font-medium border ${sort === key ? "bg-[var(--color-crop-500)] text-white border-[var(--color-crop-500)]" : "border-[var(--color-border)] text-[var(--color-ink-soft)]"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}

        <p className="text-[13px] text-[var(--color-ink-faint)] mb-3 tnum">
          {filtered.length} ખર્ચ · કુલ {formatCurrency(filtered.reduce((s, e) => s + e.amount, 0))}
        </p>

        {filtered.length === 0 ? (
          <EmptyState icon={<NotebookIcon size={26} />} title="કોઈ ખર્ચ મળ્યો નહીં" />
        ) : (
          <div className="space-y-2.5">
            {visible.map((e) => (
              <Card key={e.id} className="p-3.5 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-[var(--color-crop-50)] text-[var(--color-crop-500)] flex items-center justify-center shrink-0">
                  <CategoryIcon category={e.category} size={19} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14.5px] font-medium text-[var(--color-ink)] truncate">
                    {EXPENSE_CATEGORIES.find((c) => c.id === e.category)?.label}
                    {e.description ? ` · ${e.description}` : ""}
                  </p>
                  <p className="text-[12.5px] text-[var(--color-ink-faint)] mt-0.5">{formatDateDMY(e.date)}</p>
                </div>
                <p className="tnum text-[15px] font-semibold text-[var(--color-ink)] shrink-0">{formatCurrency(e.amount)}</p>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => navigate(`/crop/${season.id}/expense/${e.id}/edit`)}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--color-ink-faint)] active:bg-[var(--color-paper-dim)]"
                    aria-label="સંપાદિત કરો"
                  >
                    <EditIcon size={17} />
                  </button>
                  <button
                    onClick={() => setPendingDelete(e)}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--color-loss-500)] active:bg-[var(--color-loss-100)]"
                    aria-label="કાઢી નાખો"
                  >
                    <TrashIcon size={17} />
                  </button>
                </div>
              </Card>
            ))}
            {visible.length < filtered.length && <div ref={sentinelRef} className="h-8" />}
          </div>
        )}
      </Screen>

      <Dialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="ખર્ચ કાઢી નાખવો છે?"
        footer={
          <>
            <Button variant="outline" fullWidth onClick={() => setPendingDelete(null)}>
              રદ કરો
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                if (pendingDelete) {
                  deleteExpense(pendingDelete.id);
                  show("ખર્ચ કાઢી નાખ્યો");
                }
                setPendingDelete(null);
              }}
            >
              કાઢી નાખો
            </Button>
          </>
        }
      >
        આ ક્રિયા પાછી ફેરવી શકાશે નહીં.
      </Dialog>
    </>
  );
}

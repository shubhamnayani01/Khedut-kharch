import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";
import { TopBar, Screen } from "../components/ui/AppShell";
import { TextInput, NumberInput, TextArea } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { expenseSchema, type ExpenseFormInput, type ExpenseFormValues } from "../lib/validation";
import { todayISO } from "../lib/format";
import { EXPENSE_CATEGORIES } from "../types";
import type { ExpenseTemplate } from "../types";
import { CategoryIcon } from "../components/icons/CategoryIcons";
import { CameraIcon, CloseIcon, NotebookIcon, AlertIcon } from "../components/icons/UIIcons";
import { storage } from "../lib/storage";
import { compressImage } from "../lib/image";

// ─── Small inline icons ────────────────────────────────────────────────────────

function BookmarkIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TrashIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

// ─── Template Picker ───────────────────────────────────────────────────────────

function TemplatePicker({
  templates,
  onSelect,
  onDelete,
}: {
  templates: ExpenseTemplate[];
  onSelect: (t: ExpenseTemplate) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (templates.length === 0) return null;

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-crop-200)] bg-[var(--color-crop-50)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left"
      >
        <BookmarkIcon size={18} />
        <span className="flex-1 text-[14px] font-semibold text-[var(--color-crop-700)]">
          ટેમ્પ્લેટ વાપરો ({templates.length})
        </span>
        <svg
          width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          className={`text-[var(--color-crop-500)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-[var(--color-crop-100)] divide-y divide-[var(--color-crop-100)]">
          {templates.map((t) => (
            <div key={t.id} className="flex items-center gap-2 px-4 py-2.5">
              <button
                type="button"
                onClick={() => { onSelect(t); setOpen(false); }}
                className="flex-1 flex items-center gap-3 text-left min-w-0 active:opacity-70"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--color-crop-100)] flex items-center justify-center text-[var(--color-crop-500)] shrink-0">
                  <CategoryIcon category={t.category} size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-[var(--color-ink)] truncate">{t.name}</p>
                  <p className="text-[12px] text-[var(--color-ink-faint)]">
                    ₹{t.amount.toLocaleString("en-IN")}
                    {t.description ? ` · ${t.description}` : ""}
                  </p>
                </div>
              </button>
              {confirmDelete === t.id ? (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => { onDelete(t.id); setConfirmDelete(null); }}
                    className="text-[11.5px] font-semibold text-[var(--color-loss-500)] px-2 py-1 rounded bg-red-50 active:bg-red-100"
                  >
                    ડિલીટ
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(null)}
                    className="text-[11.5px] text-[var(--color-ink-soft)] px-2 py-1 rounded active:bg-[var(--color-paper-dim)]"
                  >
                    રદ
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(t.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--color-ink-faint)] active:bg-red-50 active:text-[var(--color-loss-500)] shrink-0"
                  aria-label="ટેમ્પ્લેટ ડિલીટ"
                >
                  <TrashIcon size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Save as Template dialog ───────────────────────────────────────────────────

function SaveTemplateDialog({
  open,
  onSave,
  onClose,
  defaultName,
}: {
  open: boolean;
  onSave: (name: string) => void;
  onClose: () => void;
  defaultName: string;
}) {
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    if (open) setName(defaultName);
  }, [open, defaultName]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-md bg-[var(--color-paper)] rounded-t-3xl p-6 pb-8 shadow-2xl">
        <p className="text-[17px] font-bold text-[var(--color-ink)] mb-4">ટેમ્પ્લેટ સાચવો</p>
        <p className="text-[13.5px] text-[var(--color-ink-soft)] mb-4 leading-snug">
          ટેમ્પ્લેટ નામ આપો. ભવિષ્યમાં આ ખર્ચ ઝડપથી ભરી શકશો.
        </p>
        <TextInput
          label="ટેમ્પ્લેટ નામ"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="દા.ત. DAP ખાતર 50kg"
          autoFocus
        />
        <div className="flex gap-3 mt-5">
          <Button variant="outline" fullWidth onClick={onClose}>
            રદ
          </Button>
          <Button
            variant="primary"
            fullWidth
            disabled={!name.trim()}
            onClick={() => { onSave(name.trim()); onClose(); }}
          >
            સાચવો
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AddExpense() {
  const navigate = useNavigate();
  const { id, expenseId } = useParams();
  const { getSeason, addExpense, updateExpense, expenses, inventoryItems, expenseTemplates, addExpenseTemplate, deleteExpenseTemplate } = useAppData();
  const { show } = useToast();
  const season = getSeason(id!);
  const isEdit = Boolean(expenseId);
  const existing = isEdit ? expenses.find((e) => e.id === expenseId) : undefined;
  const draftKey = `expense:${id}`;
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | undefined>(existing?.billPhoto);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  const [useStock, setUseStock] = useState(Boolean(existing?.inventoryItemId));
  const [selectedStockId, setSelectedStockId] = useState<string | undefined>(existing?.inventoryItemId);
  const [stockQuantityUsed, setStockQuantityUsed] = useState<number | undefined>(existing?.inventoryQuantityUsed);

  const selectedStockItem = inventoryItems.find(i => i.id === selectedStockId);
  const usedOtherForSelected = selectedStockItem
    ? expenses
        .filter(e => e.inventoryItemId === selectedStockItem.id && e.id !== existing?.id)
        .reduce((sum, e) => sum + (e.inventoryQuantityUsed || 0), 0)
    : 0;
  const availableStock = selectedStockItem ? selectedStockItem.totalQuantity - usedOtherForSelected : 0;
  const isStockExceeded = Boolean(
    useStock &&
    selectedStockItem &&
    stockQuantityUsed !== undefined &&
    stockQuantityUsed > availableStock
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormInput, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: existing
      ? {
          date: existing.date,
          category: existing.category,
          amount: existing.amount,
          description: existing.description || "",
        }
      : {
          date: todayISO(),
          category: undefined,
          amount: undefined,
          description: "",
        },
  });

  const category = watch("category");
  const description = watch("description");
  // amount is watched via react-hook-form register; used in template name suggestion via getValues()

  useEffect(() => {
    if (isEdit) return;
    const sub = watch((values) => storage.setDraft(draftKey, values));
    return () => sub.unsubscribe();
  }, [watch, isEdit, draftKey]);

  useEffect(() => {
    if (isEdit) return;
    const draft = storage.getDraft<Partial<ExpenseFormValues> | null>(draftKey, null);
    if (draft) {
      (Object.keys(draft) as (keyof ExpenseFormValues)[]).forEach((k) => {
        if (draft[k] !== undefined && draft[k] !== "") setValue(k, draft[k] as never);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!season) {
    return (
      <>
        <TopBar title="ખર્ચ ઉમેરો" onBack={() => navigate(`/crop/${id}`)} />
        <Screen withNav={false}>
          <p className="text-[var(--color-ink-faint)] pt-8 text-center">ખેતી મળી નથી.</p>
        </Screen>
      </>
    );
  }

  const onPickPhoto = async (file?: File) => {
    if (!file) return;
    setPhotoBusy(true);
    try {
      const compressed = await compressImage(file);
      setPhoto(compressed);
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleApplyTemplate = (t: ExpenseTemplate) => {
    setValue("category", t.category);
    setValue("amount", t.amount as any);
    setValue("description", t.description || "");
    show(`"${t.name}" ટેમ્પ્લેટ લગાડ્યું`);
  };

  const handleSaveTemplate = (name: string) => {
    const values = getValues();
    const amt = Number(values.amount);
    if (!values.category || !amt || amt <= 0) {
      show("ટેમ્પ્લેટ સાચવવા માટે કેટેગરી અને રકમ ભરો", "error");
      return;
    }
    addExpenseTemplate({
      name,
      category: values.category,
      amount: amt,
      description: values.description || undefined,
    });
    show(`"${name}" ટેમ્પ્લેટ સચવાઈ`);
  };

  const onSubmit = (values: ExpenseFormValues) => {
    if (useStock) {
      if (!selectedStockId || !selectedStockItem) {
        show("કૃપા કરીને ગોડાઉનમાંથી સ્ટોક આઇટમ પસંદ કરો", "error");
        return;
      }
      if (!stockQuantityUsed || stockQuantityUsed <= 0) {
        show("કૃપા કરીને વપરાયેલ જથ્થો ઉમેરો", "error");
        return;
      }
      if (stockQuantityUsed > availableStock) {
        show(`ગોડાઉનમાં ફક્ત ${availableStock} ${selectedStockItem.unit} સ્ટોક બાકી છે. તમે ${stockQuantityUsed} ${selectedStockItem.unit} વાપરી શકતા નથી.`, "error");
        return;
      }
    }

    const finalData = {
      ...values,
      inventoryItemId: useStock ? selectedStockId : undefined,
      inventoryQuantityUsed: useStock ? stockQuantityUsed : undefined,
    };

    if (isEdit && existing) {
      updateExpense(existing.id, { ...finalData, billPhoto: photo });
      show("ખર્ચ અપડેટ થયો");
    } else {
      addExpense({ ...finalData, seasonId: season.id, billPhoto: photo });
      storage.clearDraft(draftKey);
      show("ખર્ચ ઉમેરાયો");
    }
    navigate(`/crop/${season.id}`, { replace: true });
  };

  // Suggested template name from description or category label
  const suggestedTemplateName =
    (description || EXPENSE_CATEGORIES.find(c => c.id === category)?.label || "ટેમ્પ્લેટ").slice(0, 40);

  return (
    <>
      <TopBar title={isEdit ? "ખર્ચ એડિટ કરો" : "ખર્ચ ઉમેરો"} onBack={() => navigate(`/crop/${id}`)} />
      <Screen withNav={false}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-8">
          <TextInput
            label="તારીખ"
            type="date"
            required
            max={todayISO()}
            error={errors.date?.message}
            {...register("date")}
          />

          {/* Template picker — only shown when adding (not editing) */}
          {!isEdit && (
            <TemplatePicker
              templates={expenseTemplates}
              onSelect={handleApplyTemplate}
              onDelete={deleteExpenseTemplate}
            />
          )}

          {!isEdit && inventoryItems.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-[var(--color-crop-50)] rounded-[var(--radius-card)] border border-[var(--color-crop-100)]">
              <NotebookIcon size={20} className="text-[var(--color-crop-500)]" />
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-[var(--color-ink)]">સ્ટોક માંથી વાપરો?</p>
                <p className="text-[12px] text-[var(--color-ink-soft)]">ગોડાઉન માંથી સામાન લો</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={useStock}
                  onChange={(e) => {
                    setUseStock(e.target.checked);
                    if (!e.target.checked) {
                      setSelectedStockId(undefined);
                      setStockQuantityUsed(undefined);
                    }
                  }}
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-crop-500)]"></div>
              </label>
            </div>
          )}

          {useStock && (
            <div className="space-y-4 p-4 border-2 border-dashed border-[var(--color-crop-300)] bg-[var(--color-crop-50)] rounded-[var(--radius-card)]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] font-medium text-[var(--color-ink)]">સ્ટોક પસંદ કરો</span>
                  {selectedStockItem && (
                    <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${
                      availableStock > 0
                        ? 'bg-[var(--color-crop-100)] text-[var(--color-crop-700)] border border-[var(--color-crop-300)]'
                        : 'bg-[var(--color-loss-100)] text-[var(--color-loss-700)] border border-[var(--color-loss-300)]'
                    }`}>
                      ગોડાઉનમાં ઉપલબ્ધ: {availableStock} {selectedStockItem.unit}
                    </span>
                  )}
                </div>
                <select
                  className="w-full h-[52px] px-3.5 bg-white border border-[var(--color-border)] rounded-[var(--radius-control)] text-[15px] font-medium outline-none focus:border-[var(--color-crop-500)]"
                  value={selectedStockId || ""}
                  onChange={(e) => {
                    const itemId = e.target.value;
                    setSelectedStockId(itemId);
                    const item = inventoryItems.find(i => i.id === itemId);
                    if (item) {
                      setValue("category", item.category);
                      if (stockQuantityUsed) {
                        setValue("amount", Math.round((item.totalCost / item.totalQuantity) * stockQuantityUsed));
                      }
                    }
                  }}
                >
                  <option value="" disabled>-- સ્ટોક આઇટમ પસંદ કરો --</option>
                  {inventoryItems.map(item => {
                    const usedOther = expenses
                      .filter(e => e.inventoryItemId === item.id && e.id !== existing?.id)
                      .reduce((sum, e) => sum + (e.inventoryQuantityUsed || 0), 0);
                    const avail = item.totalQuantity - usedOther;
                    return (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.unit}) — બાકી સ્ટોક: {avail} {item.unit}
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedStockItem && (
                <div>
                  <NumberInput
                    label={`વપરાયેલ જથ્થો (${selectedStockItem.unit})`}
                    value={stockQuantityUsed || ""}
                    onChange={(e) => {
                      const qty = Number(e.target.value);
                      setStockQuantityUsed(qty);
                      if (qty > 0) {
                        setValue("amount", Math.round((selectedStockItem.totalCost / selectedStockItem.totalQuantity) * qty));
                      }
                    }}
                    placeholder="કેટલું વાપર્યું?"
                    min="0.1"
                    step="any"
                    error={isStockExceeded ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><AlertIcon size={14} className="text-[#dc2626]" /> ગોડાઉનમાં ફક્ત {availableStock} {selectedStockItem.unit} બાકી છે. તમે {stockQuantityUsed} {selectedStockItem.unit} વાપરી શકતા નથી.</span> : undefined}
                  />
                  {availableStock <= 0 ? (
                    <p className="mt-1.5 text-[12.5px] font-medium text-[var(--color-loss-600)]">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><AlertIcon size={14} className="text-[#dc2626]" /> આ આઇટમનો સ્ટોક પૂરો થઈ ગયો છે! (0 {selectedStockItem.unit} બાકી)</span>
                    </p>
                  ) : (
                    <p className="mt-1 text-[12px] text-[var(--color-ink-faint)]">
                      ગોડાઉનમાં બાકી સ્ટોક: <strong className="text-[var(--color-crop-600)]">{availableStock} {selectedStockItem.unit}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className={useStock ? "opacity-50 pointer-events-none" : ""}>
            <span className="block text-[15px] font-medium text-[var(--color-ink)] mb-2">
              કેટેગરી <span className="text-[var(--color-loss-500)]">*</span>
            </span>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-4 gap-2.5">
                  {EXPENSE_CATEGORIES.map((c) => {
                    const active = field.value === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => field.onChange(c.id)}
                        className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-[var(--radius-control)] border transition-colors duration-150 ${
                          active
                            ? "bg-[var(--color-crop-500)] border-[var(--color-crop-500)] text-white"
                            : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-ink-soft)]"
                        }`}
                      >
                        <CategoryIcon category={c.id} size={22} />
                        <span className="text-[11.5px] font-medium leading-tight text-center">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {errors.category && (
              <span className="block mt-1.5 text-sm text-[var(--color-loss-500)]">{errors.category.message}</span>
            )}
          </div>

          <div className={useStock ? "hidden" : ""}>
            <NumberInput
              label="રકમ (₹)"
              required
              placeholder="0"
              step="1"
              min="0"
              autoFocus={!category && !useStock}
              error={errors.amount?.message}
              {...register("amount")}
            />
          </div>

          <TextArea label="વર્ણન (વૈકલ્પિક)" placeholder="દા.ત. યુરિયા 2 બોરી" {...register("description")} />

          {/* Bill photo */}
          <div>
            <span className="block text-[15px] font-medium text-[var(--color-ink)] mb-2">બિલનો ફોટો (વૈકલ્પિક)</span>
            {photo ? (
              <div className="relative w-28 h-28">
                <img src={photo} alt="બિલ" className="w-28 h-28 object-cover rounded-[var(--radius-control)] border border-[var(--color-border)]" />
                <button
                  type="button"
                  onClick={() => setPhoto(undefined)}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] flex items-center justify-center"
                  aria-label="ફોટો દૂર કરો"
                >
                  <CloseIcon size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={photoBusy}
                className="w-28 h-28 rounded-[var(--radius-control)] border-2 border-dashed border-[var(--color-border)] flex flex-col items-center justify-center gap-1.5 text-[var(--color-ink-faint)]"
              >
                {photoBusy ? (
                  <span className="text-[12px]">લોડ થાય છે...</span>
                ) : (
                  <>
                    <CameraIcon size={22} />
                    <span className="text-[11.5px]">ફોટો ઉમેરો</span>
                  </>
                )}
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => onPickPhoto(e.target.files?.[0])}
            />
          </div>

          {/* Actions */}
          <div className="pt-2 space-y-3">
            <Button type="submit" fullWidth size="lg" disabled={isSubmitting || isStockExceeded}>
              ખર્ચ સાચવો
            </Button>

            {/* Save as template — only for new expenses, not edit */}
            {!isEdit && (
              <button
                type="button"
                onClick={() => setShowSaveTemplate(true)}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-[var(--radius-control)] border border-[var(--color-border)] text-[var(--color-ink-soft)] text-[14px] font-medium active:bg-[var(--color-paper-dim)] transition-colors"
              >
                <BookmarkIcon size={16} />
                ટેમ્પ્લેટ તરીકે સાચવો
              </button>
            )}
          </div>
        </form>
      </Screen>

      {/* Save template modal */}
      <SaveTemplateDialog
        open={showSaveTemplate}
        onSave={handleSaveTemplate}
        onClose={() => setShowSaveTemplate(false)}
        defaultName={suggestedTemplateName}
      />
    </>
  );
}

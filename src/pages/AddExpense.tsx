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
import { CategoryIcon } from "../components/icons/CategoryIcons";
import { CameraIcon, CloseIcon, NotebookIcon } from "../components/icons/UIIcons";
import { storage } from "../lib/storage";
import { compressImage } from "../lib/image";

export default function AddExpense() {
  const navigate = useNavigate();
  const { id, expenseId } = useParams();
  const { getSeason, addExpense, updateExpense, expenses, inventoryItems } = useAppData();
  const { show } = useToast();
  const season = getSeason(id!);
  const isEdit = Boolean(expenseId);
  const existing = isEdit ? expenses.find((e) => e.id === expenseId) : undefined;
  const draftKey = `expense:${id}`;
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | undefined>(existing?.billPhoto);
  const [photoBusy, setPhotoBusy] = useState(false);
  
  const [useStock, setUseStock] = useState(Boolean(existing?.inventoryItemId));
  const [selectedStockId, setSelectedStockId] = useState<string | undefined>(existing?.inventoryItemId);
  const [stockQuantityUsed, setStockQuantityUsed] = useState<number | undefined>(existing?.inventoryQuantityUsed);

  const selectedStockItem = inventoryItems.find(i => i.id === selectedStockId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
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
        <TopBar title="ખર્ચ ઉમેરો" />
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

  const onSubmit = (values: ExpenseFormValues) => {
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

  return (
    <>
      <TopBar title={isEdit ? "ખર્ચ સંપાદિત કરો" : "ખર્ચ ઉમેરો"} />
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
                <span className="block text-[14px] font-medium text-[var(--color-ink)] mb-2">સ્ટોક પસંદ કરો</span>
                <select 
                  className="w-full h-[52px] px-3.5 bg-white border border-[var(--color-border)] rounded-[var(--radius-control)] text-[15px] font-medium outline-none focus:border-[var(--color-crop-500)]"
                  value={selectedStockId || ""}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedStockId(id);
                    const item = inventoryItems.find(i => i.id === id);
                    if (item) {
                      setValue("category", item.category);
                      if (stockQuantityUsed) {
                        setValue("amount", Math.round((item.totalCost / item.totalQuantity) * stockQuantityUsed));
                      }
                    }
                  }}
                >
                  <option value="" disabled>-- સ્ટોક આઇટમ પસંદ કરો --</option>
                  {inventoryItems.map(item => (
                    <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>
                  ))}
                </select>
              </div>
              
              {selectedStockItem && (
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
                />
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

          <div className="pt-2">
            <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
              ખર્ચ સાચવો
            </Button>
          </div>
        </form>
      </Screen>
    </>
  );
}

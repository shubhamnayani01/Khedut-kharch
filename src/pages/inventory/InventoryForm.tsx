import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../../context/AppDataContext";
import { useToast } from "../../context/ToastContext";
import { TopBar, Screen } from "../../components/ui/AppShell";
import { TextInput, NumberInput, TextArea } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { inventorySchema, type InventoryFormInput, type InventoryFormValues } from "../../lib/validation";
import { todayISO } from "../../lib/format";
import { INVENTORY_CATEGORIES } from "../../types";
import { CategoryIcon } from "../../components/icons/CategoryIcons";

export default function InventoryForm() {
  const navigate = useNavigate();
  const { addInventoryItem } = useAppData();
  const { show } = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InventoryFormInput, unknown, InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      datePurchased: todayISO(),
      name: "",
      unit: "થેલી",
      notes: "",
    },
  });

  const onSubmit = (values: InventoryFormValues) => {
    addInventoryItem(values);
    show("સ્ટોક ઉમેરાયો");
    navigate("/inventory", { replace: true });
  };

  return (
    <>
      <TopBar title="નવો સ્ટોક ઉમેરો" />
      <Screen withNav={false}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-8">
          
          <TextInput
            label="સ્ટોકનું નામ"
            required
            placeholder="દા.ત. ઇફકો યુરિયા 50 કિલો"
            error={errors.name?.message}
            {...register("name")}
          />
          
          <div>
            <span className="block text-[15px] font-medium text-[var(--color-ink)] mb-2">
              કેટેગરી <span className="text-[var(--color-loss-500)]">*</span>
            </span>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-4 gap-2.5">
                  {INVENTORY_CATEGORIES.map((c) => {
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

          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              label="કુલ જથ્થો"
              required
              placeholder="50"
              step="any"
              min="0.1"
              error={errors.totalQuantity?.message}
              {...register("totalQuantity")}
            />
            <TextInput
              label="એકમ"
              required
              placeholder="દા.ત. થેલી, લિટર, કિલો"
              error={errors.unit?.message}
              {...register("unit")}
            />
          </div>

          <NumberInput
            label="કુલ કિંમત (₹)"
            required
            placeholder="15000"
            step="1"
            min="0"
            error={errors.totalCost?.message}
            {...register("totalCost")}
          />

          <TextInput
            label="ખરીદી તારીખ"
            type="date"
            required
            max={todayISO()}
            error={errors.datePurchased?.message}
            {...register("datePurchased")}
          />

          <TextArea label="નોંધ (વૈકલ્પિક)" placeholder="ક્યાંથી ખરીદ્યું અથવા અન્ય વિગત" {...register("notes")} />

          <div className="pt-2">
            <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
              સ્ટોક સાચવો
            </Button>
          </div>
        </form>
      </Screen>
    </>
  );
}

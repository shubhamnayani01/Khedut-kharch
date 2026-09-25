import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../../context/AppDataContext";
import { useToast } from "../../context/ToastContext";
import { TopBar, Screen } from "../../components/ui/AppShell";
import { TextInput, NumberInput, TextArea } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import type { FieldOwnership } from "../../types";

const fieldSchema = z.object({
  name: z.string().trim().min(1, "ખેતરનું નામ જરૂરી છે").max(80),
  areaBigha: z.coerce.number().nonnegative().optional(),
  areaLabel: z.string().trim().max(50).optional(),
  ownershipType: z.enum(["owned", "leased", "shared"]).optional(),
  notes: z.string().trim().max(300).optional(),
});

type FieldFormInput = z.input<typeof fieldSchema>;
type FieldFormValues = z.output<typeof fieldSchema>;

function HomeIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function HandshakeIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 17a4.5 4.5 0 0 1-4.5-4.5v-3a2 2 0 0 1 4 0" />
      <path d="M9 10.5V6a2 2 0 1 1 4 0v1" />
      <path d="M13 7a2 2 0 1 1 4 0v3a4.5 4.5 0 0 1-4.5 4.5" />
      <path d="M8 17.929A6 6 0 0 0 15 20h1a5 5 0 0 0 5-5V9a1 1 0 0 0-1-1h-1" />
      <path d="M3 9a1 1 0 0 0-1 1v6a5 5 0 0 0 5 5h1" />
      <path d="M9 10H4" />
    </svg>
  );
}

function UsersIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

const OWNERSHIP_OPTIONS: { value: FieldOwnership; label: string; Icon: React.ElementType<{ size?: number }> }[] = [
  { value: "owned", label: "પોતાની", Icon: HomeIcon },
  { value: "leased", label: "ભાડા પર", Icon: HandshakeIcon },
  { value: "shared", label: "ભાગ-ભૂમિ", Icon: UsersIcon },
];

export default function FieldForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { addField, updateField, getField } = useAppData();
  const { show } = useToast();
  const existing = isEdit ? getField(id!) : undefined;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FieldFormInput, unknown, FieldFormValues>({
    resolver: zodResolver(fieldSchema),
    defaultValues: existing
      ? {
          name: existing.name,
          areaBigha: existing.areaBigha,
          areaLabel: existing.areaLabel ?? "",
          ownershipType: existing.ownershipType,
          notes: existing.notes ?? "",
        }
      : {
          name: "",
          areaBigha: undefined,
          areaLabel: "",
          ownershipType: undefined,
          notes: "",
        },
  });

  const onSubmit = (values: FieldFormValues) => {
    const payload = {
      name: values.name,
      areaBigha: values.areaBigha,
      areaLabel: values.areaLabel || undefined,
      ownershipType: values.ownershipType,
      notes: values.notes || undefined,
    };

    if (isEdit && existing) {
      updateField(existing.id, payload);
      show("ખેતર અપડેટ થઈ");
    } else {
      addField(payload);
      show("ખેતર ઉમેરાઈ");
    }
    navigate("/fields");
  };

  return (
    <>
      <TopBar
        title={isEdit ? "ખેતર એડિટ કરો" : "નવું ખેતર ઉમેરો"}
        onBack={() => navigate("/fields")}
      />
      <Screen withNav={false}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-8">
          <TextInput
            label="ખેતરનું નામ"
            required
            placeholder="દા.ત. પટેલ વાળું ખેતર, ઘર પાસે"
            autoFocus
            error={errors.name?.message}
            {...register("name")}
          />

          <NumberInput
            label="ક્ષેત્રફળ (વિઘા) — વૈકલ્પિક"
            placeholder="દા.ત. 4"
            step="0.5"
            min="0"
            error={errors.areaBigha?.message as string | undefined}
            {...register("areaBigha")}
          />

          <TextInput
            label="ક્ષેત્ર વિગત (ટેક્સ્ટ) — વૈકલ્પિક"
            placeholder="દા.ત. 4 વિઘા 2 ગઠ્ઠા"
            error={errors.areaLabel?.message}
            {...register("areaLabel")}
          />

          {/* Ownership type */}
          <div>
            <span className="block text-[15px] font-medium text-[var(--color-ink)] mb-2">
              માલિકીનો પ્રકાર (વૈકલ્પિક)
            </span>
            <Controller
              name="ownershipType"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2.5">
                  {OWNERSHIP_OPTIONS.map((opt) => {
                    const active = field.value === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => field.onChange(active ? undefined : opt.value)}
                        className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-[var(--radius-control)] border transition-colors duration-150 ${
                          active
                            ? "bg-[var(--color-crop-500)] border-[var(--color-crop-500)] text-white"
                            : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-ink-soft)]"
                        }`}
                      >
                        <opt.Icon size={22} />
                        <span className="text-[12px] font-medium">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>

          <TextArea
            label="નોંધ (વૈકલ્પિક)"
            placeholder="ખેતર વિશે કોઈ વધારાની નોંધ..."
            {...register("notes")}
          />

          <div className="pt-2">
            <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
              {isEdit ? "ફેરફાર સાચવો" : "ખેતર ઉમેરો"}
            </Button>
          </div>
        </form>
      </Screen>
    </>
  );
}

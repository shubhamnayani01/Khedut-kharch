import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { TopBar, Screen } from "../components/ui/AppShell";
import { TextInput, TextArea } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { seasonSchema, type SeasonFormValues } from "../lib/validation";
import { todayISO } from "../lib/format";
import { CROP_COLORS, COLOR_TAG_KEYS } from "../types";
import { storage } from "../lib/storage";
import type { FarmField } from "../types";

const DRAFT_KEY = "new-season";

function MapPinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function NewSeason() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { getSeason, addSeason, updateSeason, fields, seasons } = useAppData();
  const { isPremium } = useAuth();
  const { show } = useToast();
  const existing = isEdit ? getSeason(id!) : undefined;
  const [selectedFieldId, setSelectedFieldId] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SeasonFormValues>({
    resolver: zodResolver(seasonSchema),
    defaultValues: existing
      ? {
          cropName: existing.cropName,
          fieldName: existing.fieldName,
          areaLabel: existing.areaLabel || "",
          sowingDate: existing.sowingDate,
          notes: existing.notes || "",
          colorTag: existing.colorTag,
        }
      : {
          cropName: "",
          fieldName: "",
          areaLabel: "",
          sowingDate: todayISO(),
          notes: "",
          colorTag: "crop",
        },
  });

  const colorTag = watch("colorTag");

  // autosave draft while typing (only for new season)
  useEffect(() => {
    if (isEdit) return;
    const sub = watch((values) => {
      storage.setDraft(DRAFT_KEY, values);
    });
    return () => sub.unsubscribe();
  }, [watch, isEdit]);

  useEffect(() => {
    if (isEdit) return;
    const draft = storage.getDraft<Partial<SeasonFormValues> | null>(DRAFT_KEY, null);
    if (draft) {
      (Object.keys(draft) as (keyof SeasonFormValues)[]).forEach((k) => {
        if (draft[k] !== undefined) setValue(k, draft[k] as never);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply selected field's data to form fields
  const handleFieldSelect = (fieldId: string) => {
    setSelectedFieldId(fieldId);
    if (!fieldId) return;
    const field: FarmField | undefined = fields.find((f) => f.id === fieldId);
    if (!field) return;
    setValue("fieldName", field.name);
    if (field.areaLabel) setValue("areaLabel", field.areaLabel);
    else if (field.areaBigha) setValue("areaLabel", `${field.areaBigha} વિઘા`);
  };

  const onSubmit = (values: SeasonFormValues) => {
    if (isEdit && existing) {
      updateSeason(existing.id, values);
      show("ખેતી અપડેટ થઈ");
      navigate(`/crop/${existing.id}`, { replace: true });
    } else {
      const season = addSeason(values);
      storage.clearDraft(DRAFT_KEY);
      show("નવી ખેતી ઉમેરાઈ");
      navigate(`/crop/${season.id}`, { replace: true });
    }
  };

  return (
    <>
      <TopBar title={isEdit ? "ખેતી એડિટ કરો" : "નવી ખેતી"} onBack={undefined} />
      <Screen withNav={false}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-8">
          <TextInput
            label="પાકનું નામ"
            required
            placeholder="દા.ત. કપાસ, મગફળી, ઘઉં"
            autoFocus
            error={errors.cropName?.message}
            {...register("cropName")}
          />

          {/* Field picker — shown only when adding and there are saved fields */}
          {!isEdit && fields.length > 0 && (
            <div>
              <span className="block text-[15px] font-medium text-[var(--color-ink)] mb-2">
                સાચવેલ ખેતર પસંદ કરો (વૈકલ્પિક)
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => handleFieldSelect("")}
                  className={`shrink-0 flex items-center gap-1.5 h-10 px-3.5 rounded-full border text-[13px] font-medium transition-colors ${
                    selectedFieldId === ""
                      ? "bg-[var(--color-crop-500)] text-white border-[var(--color-crop-500)]"
                      : "bg-[var(--color-surface)] text-[var(--color-ink-soft)] border-[var(--color-border)]"
                  }`}
                >
                  હાથે ભરો
                </button>
                {fields.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleFieldSelect(f.id)}
                    className={`shrink-0 flex items-center gap-1.5 h-10 px-3.5 rounded-full border text-[13px] font-medium transition-colors ${
                      selectedFieldId === f.id
                        ? "bg-[var(--color-crop-500)] text-white border-[var(--color-crop-500)]"
                        : "bg-[var(--color-surface)] text-[var(--color-ink-soft)] border-[var(--color-border)]"
                    }`}
                  >
                    <MapPinIcon size={14} />
                    {f.name}
                  </button>
                ))}
              </div>
              {selectedFieldId && (
                <p className="mt-2 text-[12.5px] text-[var(--color-crop-700)] bg-[var(--color-crop-50)] px-3 py-2 rounded-[var(--radius-control)]">
                  ✓ ખેતર "{fields.find(f => f.id === selectedFieldId)?.name}" ભરાઈ ગઈ. નીચે ફેરફાર કરી શકો.
                </p>
              )}
            </div>
          )}

          <TextInput
            label="ગામ / ખેતરનું નામ"
            required
            placeholder="દા.ત. પટેલવાસ ખેતર"
            error={errors.fieldName?.message}
            {...register("fieldName")}
          />
          <TextInput
            label="વિસ્તાર (વૈકલ્પિક)"
            placeholder="દા.ત. 2 વીઘા"
            error={errors.areaLabel?.message}
            {...register("areaLabel")}
          />
          <TextInput
            label="વાવણી તારીખ"
            type="date"
            required
            max={todayISO()}
            error={errors.sowingDate?.message}
            {...register("sowingDate")}
          />

          <div>
            <span className="block text-[15px] font-medium text-[var(--color-ink)] mb-2">રંગ ટેગ</span>
            <div className="flex gap-3">
              {COLOR_TAG_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setValue("colorTag", key)}
                  aria-label={key}
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-transform duration-150"
                  style={{
                    background: CROP_COLORS[key].bg,
                    outline: colorTag === key ? `2.5px solid ${CROP_COLORS[key].dot}` : "none",
                    outlineOffset: "2px",
                  }}
                >
                  <span className="w-5 h-5 rounded-full" style={{ background: CROP_COLORS[key].dot }} />
                </button>
              ))}
            </div>
          </div>

          <TextArea label="નોંધ (વૈકલ્પિક)" placeholder="કોઈ વધારાની નોંધ..." {...register("notes")} />

          <div className="pt-2">
            {!isEdit && !isPremium && seasons.filter(s => s.status === "active").length >= 3 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-[14px] font-semibold text-blue-900 mb-1">ફ્રી લિમિટ પૂરી થઈ ગઈ છે</p>
                <p className="text-[13px] text-blue-700 leading-snug mb-3">ફ્રી એકાઉન્ટમાં વધુમાં વધુ ૩ ચાલુ ખેતી રાખી શકાય. વધુ ખેતી ઉમેરવા પ્રીમિયમ લો.</p>
                <Button type="button" fullWidth size="lg" onClick={() => navigate("/membership/payment")}>
                  ₹300 અપગ્રેડ
                </Button>
              </div>
            ) : (
              <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
                {isEdit ? "સાચવો" : "ખેતી બનાવો"}
              </Button>
            )}
          </div>
        </form>
      </Screen>
    </>
  );
}

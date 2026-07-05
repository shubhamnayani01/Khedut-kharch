import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";
import { TopBar, Screen } from "../components/ui/AppShell";
import { TextInput, TextArea } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { seasonSchema, type SeasonFormValues } from "../lib/validation";
import { todayISO } from "../lib/format";
import { CROP_COLORS, COLOR_TAG_KEYS } from "../types";
import { storage } from "../lib/storage";

const DRAFT_KEY = "new-season";

export default function NewSeason() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { getSeason, addSeason, updateSeason } = useAppData();
  const { show } = useToast();
  const existing = isEdit ? getSeason(id!) : undefined;

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
      <TopBar title={isEdit ? "ખેતી સંપાદિત કરો" : "નવી ખેતી"} onBack={undefined} />
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
            <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
              {isEdit ? "સાચવો" : "ખેતી બનાવો"}
            </Button>
          </div>
        </form>
      </Screen>
    </>
  );
}

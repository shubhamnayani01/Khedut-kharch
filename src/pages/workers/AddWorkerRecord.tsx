import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../../context/AppDataContext";
import { useToast } from "../../context/ToastContext";
import { TopBar, Screen } from "../../components/ui/AppShell";
import { TextInput, NumberInput, TextArea } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { todayISO } from "../../lib/format";

const workerSchema = z.object({
  date: z.string().min(1, "તારીખ જરૂરી છે"),
  workersCount: z.coerce.number().min(1, "ઓછામાં ઓછો 1 મજૂર હોવો જોઈએ"),
  workType: z.string().min(1, "કામનો પ્રકાર પસંદ કરો"),
  dailyWage: z.coerce.number().min(0, "રકમ 0 અથવા વધુ હોવી જોઈએ"),
  notes: z.string().optional(),
});

type WorkerFormInput = z.input<typeof workerSchema>;
type WorkerFormValues = z.output<typeof workerSchema>;

const WORK_TYPES = ["નિંદામણ", "કાપણી", "વાવેતર", "દવા છંટકાવ", "ખાતર આપવું", "સિંચાઈ", "અન્ય"];

export default function AddWorkerRecord() {
  const navigate = useNavigate();
  const { id, workerId } = useParams();
  const { getSeason, addWorker, updateWorker, workers } = useAppData();
  const { show } = useToast();
  
  const season = getSeason(id!);
  const isEdit = Boolean(workerId);
  const existing = isEdit ? workers.find((w) => w.id === workerId) : undefined;

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<WorkerFormInput, unknown, WorkerFormValues>({
    resolver: zodResolver(workerSchema),
    defaultValues: existing ? {
      date: existing.date,
      workersCount: existing.workersCount,
      workType: existing.workType,
      dailyWage: existing.dailyWage,
      notes: existing.notes || "",
    } : {
      date: todayISO(),
      workersCount: 1,
      workType: "",
      dailyWage: 0,
      notes: "",
    },
  });

  const workersCount = watch("workersCount") || 0;
  const dailyWage = watch("dailyWage") || 0;
  const totalCost = workersCount * dailyWage;

  if (!season) {
    return (
      <>
        <TopBar title="મજૂર ઉમેરો" />
        <Screen withNav={false}>
          <p className="text-[var(--color-ink-faint)] pt-8 text-center">ખેતી મળી નથી.</p>
        </Screen>
      </>
    );
  }

  const onSubmit = (values: WorkerFormValues) => {
    const total = values.workersCount * values.dailyWage;
    if (isEdit && existing) {
      updateWorker(existing.id, { ...values, total, workType: values.workType as any });
      show("મજૂર રેકોર્ડ અપડેટ થયો");
    } else {
      addWorker({ ...values, total, workType: values.workType as any, seasonId: season.id });
      show("મજૂર રેકોર્ડ ઉમેરાયો");
    }
    navigate("/workers", { replace: true });
  };

  return (
    <>
      <TopBar title={isEdit ? "મજૂર સંપાદિત કરો" : "મજૂર ઉમેરો"} />
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

          <NumberInput
            label="મજૂરોની સંખ્યા"
            required
            placeholder="દા.ત. 5"
            step="1"
            min="1"
            error={errors.workersCount?.message}
            {...register("workersCount")}
          />

          <div>
            <span className="block text-[15px] font-medium text-[var(--color-ink)] mb-2">
              કામનો પ્રકાર <span className="text-[var(--color-loss-500)]">*</span>
            </span>
            <select
              {...register("workType")}
              className="w-full h-[52px] px-4 rounded-[var(--radius-control)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[16px] text-[var(--color-ink)] appearance-none focus:outline-none focus:border-[var(--color-crop-500)] transition-colors"
            >
              <option value="">પસંદ કરો</option>
              {WORK_TYPES.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
            {errors.workType && (
              <span className="block mt-1.5 text-sm text-[var(--color-loss-500)]">{errors.workType.message}</span>
            )}
          </div>

          <NumberInput
            label="રોજ (દૈનિક વેતન ₹)"
            required
            placeholder="દા.ત. 400"
            step="1"
            min="0"
            error={errors.dailyWage?.message}
            {...register("dailyWage")}
          />

          <div className="bg-[var(--color-crop-50)] border border-[var(--color-crop-200)] rounded-[var(--radius-control)] p-4 flex items-center justify-between">
             <span className="text-[15px] font-semibold text-[var(--color-crop-700)]">કુલ મજૂરી ખર્ચ:</span>
             <span className="tnum text-[18px] font-bold text-[var(--color-crop-600)]">₹{totalCost}</span>
          </div>

          <TextArea label="નોંધ (વૈકલ્પિક)" placeholder="વધારાની માહિતી" {...register("notes")} />

          <div className="pt-2">
            <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
              {isEdit ? "ફેરફાર સાચવો" : "મજૂર સાચવો"}
            </Button>
          </div>
        </form>
      </Screen>
    </>
  );
}

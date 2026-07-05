import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";
import { TopBar, Screen } from "../components/ui/AppShell";
import { TextInput, NumberInput } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { harvestSchema, type HarvestFormInput, type HarvestFormValues } from "../lib/validation";
import { todayISO, formatCurrency } from "../lib/format";
import { totalExpenses } from "../lib/calc";

export default function Harvest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSeason, setHarvest, expensesForSeason } = useAppData();
  const { show } = useToast();
  const season = getSeason(id!);
  const expenses = season ? expensesForSeason(season.id) : [];
  const spent = totalExpenses(expenses);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<HarvestFormInput, unknown, HarvestFormValues>({
    resolver: zodResolver(harvestSchema),
    defaultValues: season?.harvest
      ? { ...season.harvest }
      : { harvestDate: todayISO(), totalProductionKg: undefined, sellingPricePerKg: undefined, otherIncome: 0 },
  });

  const production = Number(watch("totalProductionKg")) || 0;
  const price = Number(watch("sellingPricePerKg")) || 0;
  const other = Number(watch("otherIncome")) || 0;
  const income = production * price + other;
  const profit = income - spent;

  if (!season) {
    return (
      <>
        <TopBar title="પાક વેચાણ" />
        <Screen withNav={false}>
          <p className="text-[var(--color-ink-faint)] pt-8 text-center">ખેતી મળી નથી.</p>
        </Screen>
      </>
    );
  }

  const onSubmit = (values: HarvestFormValues) => {
    setHarvest(season.id, {
      harvestDate: values.harvestDate,
      totalProductionKg: values.totalProductionKg,
      sellingPricePerKg: values.sellingPricePerKg,
      otherIncome: values.otherIncome || 0,
    });
    show("કાપણી નોંધાઈ");
    navigate(`/crop/${season.id}`, { replace: true });
  };

  return (
    <>
      <TopBar title="પાક વેચાણ" />
      <Screen withNav={false}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-8">
          <TextInput
            label="કાપણી તારીખ"
            type="date"
            required
            max={todayISO()}
            error={errors.harvestDate?.message}
            {...register("harvestDate")}
          />
          <NumberInput
            label="કુલ ઉત્પાદન (કિલો)"
            required
            placeholder="0"
            step="0.1"
            min="0"
            error={errors.totalProductionKg?.message}
            {...register("totalProductionKg")}
          />
          <NumberInput
            label="વેચાણ ભાવ (₹ પ્રતિ કિલો)"
            required
            placeholder="0"
            step="0.1"
            min="0"
            error={errors.sellingPricePerKg?.message}
            {...register("sellingPricePerKg")}
          />
          <NumberInput
            label="અન્ય આવક (વૈકલ્પિક)"
            placeholder="0"
            step="1"
            min="0"
            error={errors.otherIncome?.message}
            {...register("otherIncome")}
          />

          <Card className="p-4 space-y-2.5">
            <Row label="કુલ આવક" value={formatCurrency(income)} />
            <Row label="કુલ ખર્ચ" value={formatCurrency(spent)} muted />
            <div className="h-px bg-[var(--color-border)]" />
            <Row
              label={profit >= 0 ? "ચોખ્ખો નફો" : "ચોખ્ખી ખોટ"}
              value={formatCurrency(profit)}
              strong
              color={profit >= 0 ? "var(--color-crop-500)" : "var(--color-loss-500)"}
            />
          </Card>

          <div className="pt-2">
            <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
              કાપણી સાચવો
            </Button>
          </div>
        </form>
      </Screen>
    </>
  );
}

function Row({
  label,
  value,
  muted,
  strong,
  color,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-[14px] ${muted ? "text-[var(--color-ink-faint)]" : "text-[var(--color-ink-soft)]"}`}>
        {label}
      </span>
      <span
        className={`tnum ${strong ? "text-[18px] font-bold" : "text-[15px] font-semibold"}`}
        style={{ color: color || "var(--color-ink)" }}
      >
        {value}
      </span>
    </div>
  );
}

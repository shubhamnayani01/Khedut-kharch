import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";
import { TopBar, Screen } from "../components/ui/AppShell";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Dialog } from "../components/ui/Dialog";
import { EmptyState } from "../components/ui/EmptyState";
import { CategoryIcon } from "../components/icons/CategoryIcons";
import {
  PlusIcon,
  HarvestIcon,
  NotebookIcon,
  EditIcon,
  TrashIcon,
  ChevronRightIcon,
  LeafIcon,
} from "../components/icons/UIIcons";
import { formatCurrency, formatDateDMY, daysSince } from "../lib/format";
import { categoryTotals, seasonIncome, seasonProfit, totalExpenses } from "../lib/calc";
import { CROP_COLORS, EXPENSE_CATEGORIES } from "../types";

export default function CropDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSeason, expensesForSeason, deleteSeason } = useAppData();
  const { show } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const season = getSeason(id!);
  const expenses = season ? expensesForSeason(season.id) : [];

  if (!season) {
    return (
      <>
        <TopBar title="ખેતી વિગત" />
        <Screen withNav={false}>
          <p className="text-[var(--color-ink-faint)] pt-8 text-center">ખેતી મળી નથી.</p>
        </Screen>
      </>
    );
  }

  const color = CROP_COLORS[season.colorTag] || CROP_COLORS.crop;
  const spent = totalExpenses(expenses);
  const cats = categoryTotals(expenses);
  const isHarvested = season.status === "harvested";
  const income = seasonIncome(season);
  const profit = seasonProfit(season, expenses);
  const recent = [...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt).slice(0, 5);

  return (
    <>
      <TopBar
        title={season.cropName}
        right={
          <button
            onClick={() => navigate(`/crop/${season.id}/edit`)}
            className="w-11 h-11 flex items-center justify-center rounded-full text-[var(--color-ink-soft)] active:bg-[var(--color-paper-dim)]"
            aria-label="સંપાદિત કરો"
          >
            <EditIcon size={19} />
          </button>
        }
      />
      <Screen>
        <Card stitched className="p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
              style={{ background: color.bg, color: color.text }}
            >
              <LeafIcon size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-[16px] font-semibold text-[var(--color-ink)] truncate">{season.fieldName}</p>
              <p className="text-[13px] text-[var(--color-ink-faint)]">
                {season.areaLabel ? `${season.areaLabel} · ` : ""}વાવણી {formatDateDMY(season.sowingDate)}
              </p>
            </div>
            <span
              className="ml-auto shrink-0 text-[12px] font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: isHarvested ? "var(--color-saffron-100)" : color.bg,
                color: isHarvested ? "var(--color-saffron-600)" : color.text,
              }}
            >
              {isHarvested ? "કપાયેલ" : "ચાલુ"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center mb-1">
            <Stat label="દિવસ" value={String(daysSince(season.sowingDate))} />
            <Stat label="કુલ ખર્ચ" value={formatCurrency(spent)} border />
            <Stat label="ખર્ચ સંખ્યા" value={String(expenses.length)} />
          </div>

          {season.notes && (
            <p className="text-[13.5px] text-[var(--color-ink-faint)] mt-3 pt-3 border-t border-[var(--color-border)]">
              {season.notes}
            </p>
          )}
        </Card>

        {isHarvested && season.harvest && (
          <Card className="p-5 mb-4 border-[var(--color-saffron-400)]/40">
            <div className="flex items-center gap-2 mb-3">
              <HarvestIcon size={18} className="text-[var(--color-saffron-500)]" />
              <p className="text-[15px] font-semibold text-[var(--color-ink)]">કાપણી પરિણામ</p>
            </div>
            <div className="space-y-2">
              <InfoRow label="કાપણી તારીખ" value={formatDateDMY(season.harvest.harvestDate)} />
              <InfoRow label="ઉત્પાદન" value={`${season.harvest.totalProductionKg} કિલો`} />
              <InfoRow label="ભાવ" value={`${formatCurrency(season.harvest.sellingPricePerKg)}/કિલો`} />
              <InfoRow label="કુલ આવક" value={formatCurrency(income)} />
              <div className="h-px bg-[var(--color-border)] my-1" />
              <InfoRow
                label={profit >= 0 ? "ચોખ્ખો નફો" : "ચોખ્ખી ખોટ"}
                value={formatCurrency(profit)}
                strong
                color={profit >= 0 ? "var(--color-crop-500)" : "var(--color-loss-500)"}
              />
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button onClick={() => navigate(`/crop/${season.id}/expense/new`)} className="!h-14">
            <PlusIcon size={18} /> ખર્ચ ઉમેરો
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/crop/${season.id}/harvest`)}
            className="!h-14"
          >
            <HarvestIcon size={18} /> પાક વેચાણ
          </Button>
          <Button variant="outline" onClick={() => navigate(`/crop/${season.id}/report`)} className="!h-14">
            <NotebookIcon size={18} /> PDF બનાવો
          </Button>
          <Button variant="outline" onClick={() => navigate(`/crop/${season.id}/edit`)} className="!h-14">
            <EditIcon size={18} /> સંપાદિત કરો
          </Button>
        </div>

        {cats.length > 0 && (
          <Card className="p-5 mb-4">
            <p className="text-[15px] font-semibold text-[var(--color-ink)] mb-3.5">ખર્ચ વિભાજન</p>
            <div className="space-y-3">
              {cats.map((c) => {
                const pct = spent > 0 ? (c.total / spent) * 100 : 0;
                return (
                  <div key={c.category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="inline-flex items-center gap-2 text-[13.5px] text-[var(--color-ink-soft)]">
                        <CategoryIcon category={c.category} size={15} />
                        {c.label}
                      </span>
                      <span className="tnum text-[13.5px] font-medium text-[var(--color-ink)]">
                        {formatCurrency(c.total)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--color-paper-dim)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--color-crop-500)] transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <Card className="p-5 mb-4">
          <div className="flex items-center justify-between mb-3.5">
            <p className="text-[15px] font-semibold text-[var(--color-ink)]">તાજેતરના ખર્ચ</p>
            {expenses.length > 0 && (
              <Link
                to={`/crop/${season.id}/expenses`}
                className="text-[13.5px] font-medium text-[var(--color-crop-500)] inline-flex items-center"
              >
                બધા જુઓ <ChevronRightIcon size={15} />
              </Link>
            )}
          </div>

          {recent.length === 0 ? (
            <EmptyState
              icon={<NotebookIcon size={24} />}
              title="હજુ કોઈ ખર્ચ નથી"
              description={`${EXPENSE_CATEGORIES[0].label} થી શરૂ કરીને પહેલો ખર્ચ ઉમેરો.`}
            />
          ) : (
            <div className="space-y-2.5">
              {recent.map((e) => (
                <div key={e.id} className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-[var(--color-crop-50)] text-[var(--color-crop-500)] flex items-center justify-center shrink-0">
                    <CategoryIcon category={e.category} size={17} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[var(--color-ink)] truncate">
                      {EXPENSE_CATEGORIES.find((c) => c.id === e.category)?.label}
                    </p>
                    <p className="text-[12px] text-[var(--color-ink-faint)]">{formatDateDMY(e.date)}</p>
                  </div>
                  <p className="tnum text-[14.5px] font-semibold text-[var(--color-ink)]">{formatCurrency(e.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <button
          onClick={() => setConfirmDelete(true)}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-[var(--radius-control)] text-[var(--color-loss-500)] text-[14.5px] font-medium active:bg-[var(--color-loss-100)]"
        >
          <TrashIcon size={17} /> ખેતી કાઢી નાખો
        </button>
      </Screen>

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="આ ખેતી કાઢી નાખવી છે?"
        footer={
          <>
            <Button variant="outline" fullWidth onClick={() => setConfirmDelete(false)}>
              રદ કરો
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                deleteSeason(season.id);
                show("ખેતી કાઢી નાખી");
                navigate("/", { replace: true });
              }}
            >
              કાઢી નાખો
            </Button>
          </>
        }
      >
        આ ખેતીના તમામ {expenses.length} ખર્ચ પણ કાયમ માટે ડિલીટ થશે. આ ક્રિયા પાછી ફેરવી શકાશે નહીં.
      </Dialog>
    </>
  );
}

function Stat({ label, value, border }: { label: string; value: string; border?: boolean }) {
  return (
    <div className={border ? "border-x border-[var(--color-border)]" : ""}>
      <p className="tnum text-[16px] font-bold text-[var(--color-ink)]">{value}</p>
      <p className="text-[11.5px] text-[var(--color-ink-faint)] mt-0.5">{label}</p>
    </div>
  );
}

function InfoRow({
  label,
  value,
  strong,
  color,
}: {
  label: string;
  value: string;
  strong?: boolean;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13.5px] text-[var(--color-ink-soft)]">{label}</span>
      <span
        className={`tnum ${strong ? "text-[16px] font-bold" : "text-[13.5px] font-medium"}`}
        style={{ color: color || "var(--color-ink)" }}
      >
        {value}
      </span>
    </div>
  );
}

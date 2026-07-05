import { Link } from "react-router-dom";
import type { FarmingSeason } from "../types";
import { CROP_COLORS } from "../types";
import { Card } from "./ui/Card";
import { LeafIcon, HarvestIcon } from "./icons/UIIcons";
import { formatCurrency, formatDateDMY, daysSince } from "../lib/format";
import { seasonIncome, seasonProfit, totalExpenses } from "../lib/calc";
import type { Expense } from "../types";

export function SeasonCard({ season, expenses }: { season: FarmingSeason; expenses: Expense[] }) {
  const color = CROP_COLORS[season.colorTag] || CROP_COLORS.crop;
  const spent = totalExpenses(expenses);
  const isHarvested = season.status === "harvested";
  const profit = isHarvested ? seasonProfit(season, expenses) : 0;
  const income = isHarvested ? seasonIncome(season) : 0;

  return (
    <Link to={`/crop/${season.id}`} className="block active:scale-[0.99] transition-transform duration-150">
      <Card stitched className="p-5 relative overflow-hidden">
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{ background: color.dot }}
          aria-hidden
        />
        <div className="flex items-start justify-between gap-3 pl-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-full shrink-0"
                style={{ background: color.bg, color: color.text }}
              >
                <LeafIcon size={17} />
              </span>
              <h3 className="text-[17px] font-semibold text-[var(--color-ink)] truncate">{season.cropName}</h3>
            </div>
            <p className="text-[14px] text-[var(--color-ink-faint)] truncate">{season.fieldName}</p>
          </div>
          <span
            className="shrink-0 text-[12px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: isHarvested ? "var(--color-saffron-100)" : color.bg, color: isHarvested ? "var(--color-saffron-600)" : color.text }}
          >
            {isHarvested ? "કપાયેલ" : "ચાલુ"}
          </span>
        </div>

        <div className="mt-4 pl-2 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="tnum text-[15px] font-semibold text-[var(--color-ink)]">{daysSince(season.sowingDate)}</p>
            <p className="text-[11.5px] text-[var(--color-ink-faint)] mt-0.5">દિવસ</p>
          </div>
          <div className="border-x border-[var(--color-border)]">
            <p className="tnum text-[15px] font-semibold text-[var(--color-ink)]">{formatCurrency(spent)}</p>
            <p className="text-[11.5px] text-[var(--color-ink-faint)] mt-0.5">ખર્ચ</p>
          </div>
          <div>
            {isHarvested ? (
              <>
                <p
                  className="tnum text-[15px] font-semibold"
                  style={{ color: profit >= 0 ? "var(--color-crop-500)" : "var(--color-loss-500)" }}
                >
                  {formatCurrency(profit)}
                </p>
                <p className="text-[11.5px] text-[var(--color-ink-faint)] mt-0.5">{profit >= 0 ? "નફો" : "ખોટ"}</p>
              </>
            ) : (
              <>
                <p className="tnum text-[15px] font-semibold text-[var(--color-ink-faint)]">—</p>
                <p className="text-[11.5px] text-[var(--color-ink-faint)] mt-0.5">નફો/ખોટ</p>
              </>
            )}
          </div>
        </div>

        <div className="mt-3 pl-2 flex items-center justify-between text-[12.5px] text-[var(--color-ink-faint)]">
          <span>વાવણી: {formatDateDMY(season.sowingDate)}</span>
          {isHarvested && (
            <span className="inline-flex items-center gap-1 text-[var(--color-saffron-600)] font-medium">
              <HarvestIcon size={14} /> {formatCurrency(income)}
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}

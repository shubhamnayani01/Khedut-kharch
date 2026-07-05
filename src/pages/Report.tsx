import { useParams } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { TopBar, Screen } from "../components/ui/AppShell";
import { Button } from "../components/ui/Button";
import { formatCurrency, formatDateDMY, formatDateLong } from "../lib/format";
import { categoryTotals, seasonIncome, seasonProfit, totalExpenses, profitPercentage } from "../lib/calc";
import { EXPENSE_CATEGORIES } from "../types";
import { DownloadIcon } from "../components/icons/UIIcons";

export default function Report() {
  const { id } = useParams();
  const { getSeason, expensesForSeason } = useAppData();
  const season = getSeason(id!);
  const expenses = season
    ? [...expensesForSeason(season.id)].sort((a, b) => a.date.localeCompare(b.date))
    : [];

  if (!season) {
    return (
      <>
        <TopBar title="રિપોર્ટ" />
        <Screen withNav={false}>
          <p className="text-[var(--color-ink-faint)] pt-8 text-center">ખેતી મળી નથી.</p>
        </Screen>
      </>
    );
  }

  const spent = totalExpenses(expenses);
  const cats = categoryTotals(expenses);
  const isHarvested = season.status === "harvested";
  const income = seasonIncome(season);
  const profit = seasonProfit(season, expenses);
  const pct = profitPercentage(season, expenses);

  return (
    <>
      <TopBar
        title="રિપોર્ટ"
        right={
          <button
            onClick={() => window.print()}
            className="w-11 h-11 flex items-center justify-center rounded-full text-[var(--color-crop-500)]"
            aria-label="PDF ડાઉનલોડ કરો"
          >
            <DownloadIcon size={20} />
          </button>
        }
      />
      <Screen withNav={false}>
        <div className="mb-4 print:hidden">
          <Button fullWidth size="lg" onClick={() => window.print()}>
            <DownloadIcon size={18} /> PDF તરીકે સાચવો / છાપો
          </Button>
          <p className="text-center text-[12.5px] text-[var(--color-ink-faint)] mt-2">
            પ્રિન્ટ સ્ક્રીનમાં "Save as PDF" પસંદ કરો.
          </p>
        </div>

        <div id="report-sheet" className="bg-white text-black rounded-[var(--radius-card)] border border-[var(--color-border)] p-6 print:p-0 print:border-0 print:rounded-none">
          <div className="text-center border-b-2 border-black pb-4 mb-4">
            <p className="text-[12px] tracking-wide text-gray-500">ખેડૂત ખર્ચ નોંધ</p>
            <h1 className="text-[22px] font-bold mt-1">{season.cropName} — પાક રિપોર્ટ</h1>
          </div>

          <table className="w-full text-[13.5px] mb-5">
            <tbody>
              <ReportRow label="ખેતરનું નામ" value={season.fieldName} />
              {season.areaLabel && <ReportRow label="વિસ્તાર" value={season.areaLabel} />}
              <ReportRow label="વાવણી તારીખ" value={formatDateLong(season.sowingDate)} />
              {isHarvested && season.harvest && (
                <ReportRow label="કાપણી તારીખ" value={formatDateLong(season.harvest.harvestDate)} />
              )}
            </tbody>
          </table>

          <h2 className="text-[15px] font-bold mb-2 mt-6">ખર્ચની વિગત</h2>
          <table className="w-full text-[12.5px] border-collapse mb-3">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-1.5 font-semibold">તારીખ</th>
                <th className="text-left py-1.5 font-semibold">કેટેગરી</th>
                <th className="text-left py-1.5 font-semibold">વર્ણન</th>
                <th className="text-right py-1.5 font-semibold">રકમ</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b border-gray-300">
                  <td className="py-1.5 tnum">{formatDateDMY(e.date)}</td>
                  <td className="py-1.5">{EXPENSE_CATEGORIES.find((c) => c.id === e.category)?.label}</td>
                  <td className="py-1.5">{e.description || "—"}</td>
                  <td className="py-1.5 text-right tnum">{formatCurrency(e.amount)}</td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500">
                    કોઈ ખર્ચ નોંધાયો નથી
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <h2 className="text-[15px] font-bold mb-2 mt-6">કેટેગરી પ્રમાણે કુલ</h2>
          <table className="w-full text-[12.5px] border-collapse mb-3">
            <tbody>
              {cats.map((c) => (
                <tr key={c.category} className="border-b border-gray-200">
                  <td className="py-1.5">{c.label}</td>
                  <td className="py-1.5 text-right tnum">{formatCurrency(c.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 border-t-2 border-black pt-3">
            <ReportTotal label="કુલ ખર્ચ" value={formatCurrency(spent)} />
            {isHarvested && (
              <>
                <ReportTotal label="કુલ આવક" value={formatCurrency(income)} />
                <ReportTotal
                  label={profit >= 0 ? "ચોખ્ખો નફો" : "ચોખ્ખી ખોટ"}
                  value={`${formatCurrency(profit)} (${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%)`}
                  strong
                />
              </>
            )}
          </div>

          {season.notes && (
            <div className="mt-6 pt-3 border-t border-gray-300">
              <p className="text-[12px] font-semibold text-gray-600 mb-1">ખેડૂત નોંધ</p>
              <p className="text-[13px]">{season.notes}</p>
            </div>
          )}

          <p className="text-center text-[10.5px] text-gray-400 mt-8">
            ખેડૂત ખર્ચ નોંધ એપ્લિકેશન દ્વારા બનાવેલ · {formatDateDMY(new Date().toISOString().slice(0, 10))}
          </p>
        </div>
      </Screen>

      <style>{`
        @media print {
          @page { margin: 14mm; }
          body * { visibility: hidden; }
          #report-sheet, #report-sheet * { visibility: visible; }
          #report-sheet { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </>
  );
}

function ReportRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="py-1 pr-4 text-gray-600 w-40">{label}</td>
      <td className="py-1 font-medium">{value}</td>
    </tr>
  );
}

function ReportTotal({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-1 ${strong ? "text-[16px] font-bold" : "text-[13.5px]"}`}>
      <span>{label}</span>
      <span className="tnum">{value}</span>
    </div>
  );
}

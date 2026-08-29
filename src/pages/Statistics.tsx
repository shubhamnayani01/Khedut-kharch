import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { useAppData } from "../context/AppDataContext";
import { TopBar, Screen, BottomNav } from "../components/ui/AppShell";
import { SeasonSwitcher } from "../components/ui/SeasonSwitcher";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { ChartIcon } from "../components/icons/UIIcons";
import { formatCurrency } from "../lib/format";
import { categoryTotals, monthlyExpenseSeries, seasonIncome, seasonProfit, totalExpenses, totalWorkerCost, totalBhaagidaarAdvance } from "../lib/calc";
import WeatherCard from "../components/weather/WeatherCard";

const PIE_COLORS = [
  "var(--color-crop-500)",
  "var(--color-saffron-500)",
  "var(--color-soil-500)",
  "var(--color-crop-400)",
  "var(--color-saffron-400)",
  "var(--color-soil-400)",
  "var(--color-crop-600)",
  "var(--color-saffron-600)",
  "var(--color-soil-600)",
  "var(--color-ink-faint)",
];

export default function Statistics() {
  const { seasons, settings, getSeason, expensesForSeason, workersForSeason, advanceLedgers, expenses: allExpenses, isLoaded } = useAppData();

  const seasonId = settings.activeSeasonId;
  const season = seasonId ? getSeason(seasonId) : undefined;
  const expenses = seasonId ? expensesForSeason(seasonId) : [];
  const workers = seasonId ? workersForSeason(seasonId) : [];
  const ledgers = seasonId ? advanceLedgers.filter(a => a.seasonId === seasonId) : [];

  const totalIncome = season ? seasonIncome(season) : 0;
  const netProfit = season ? seasonProfit(season, expenses, workers, ledgers) : 0;
  
  const bighas = season?.areaBigha || 0;
  const canShowPerBigha = bighas > 0;
  const [showPerBigha, setShowPerBigha] = useState(false);
  
  const v = (num: number) => (canShowPerBigha && showPerBigha ? num / bighas : num);

  const cats = useMemo(() => {
    const list = categoryTotals(expenses);
    const wTotal = totalWorkerCost(workers);
    if (wTotal > 0) list.push({ category: "labor" as any, label: "મજૂરી ખર્ચ", total: wTotal });
    const bTotal = totalBhaagidaarAdvance(ledgers);
    if (bTotal > 0) list.push({ category: "other" as any, label: "ભાગીદાર એડવાન્સ", total: bTotal });
    return list.sort((a, b) => b.total - a.total).map(c => ({ ...c, total: v(c.total) }));
  }, [expenses, workers, ledgers, showPerBigha, canShowPerBigha, bighas]);
  const monthly = useMemo(() => monthlyExpenseSeries(expenses).map(m => ({ ...m, total: v(m.total) })), [expenses, showPerBigha, canShowPerBigha, bighas]);
  const profitSeries = useMemo(
    () =>
      seasons
        .filter((s) => s.status === "harvested")
        .map((s) => {
          const sExp = allExpenses.filter((e) => e.seasonId === s.id);
          // workers cost not in allWorkers easily without another appData helper, but let's approximate or just use expenses for the line chart
          return {
            name: s.cropName.length > 6 ? s.cropName.slice(0, 6) + "…" : s.cropName,
            profit: seasonProfit(s, sExp),
          };
        }),
    [seasons, allExpenses]
  );

  if (isLoaded && !season) {
    return (
      <>
        <TopBar titleContent={<SeasonSwitcher />} />
        <Screen>
          <WeatherCard />
          <EmptyState icon={<ChartIcon size={26} />} title="કોઈ ખેતી પસંદ કરેલ નથી" description="આંકડા જોવા માટે ઉપરથી ખેતી પસંદ કરો." />
        </Screen>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <TopBar titleContent={<SeasonSwitcher />} />
      <Screen>
        <WeatherCard />
        
        {canShowPerBigha && (
          <div className="flex justify-center mb-4">
            <div className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full p-1 shadow-sm">
              <button
                onClick={() => setShowPerBigha(false)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${!showPerBigha ? "bg-[var(--color-crop-500)] text-white shadow-sm" : "text-[var(--color-ink-soft)]"}`}
              >
                કુલ (Total)
              </button>
              <button
                onClick={() => setShowPerBigha(true)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${showPerBigha ? "bg-[var(--color-crop-500)] text-white shadow-sm" : "text-[var(--color-ink-soft)]"}`}
              >
                વિઘા દીઠ (Per Bigha)
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard label="સામાન ખર્ચ" value={formatCurrency(v(totalExpenses(expenses)))} />
          <StatCard label="મજૂરી ખર્ચ" value={formatCurrency(v(totalWorkerCost(workers)))} />
          {ledgers.length > 0 && <StatCard label="ભાગીદાર એડવાન્સ" value={formatCurrency(v(totalBhaagidaarAdvance(ledgers)))} />}
          <StatCard label="કુલ ખર્ચ" value={formatCurrency(v(totalExpenses(expenses) + totalWorkerCost(workers) + totalBhaagidaarAdvance(ledgers)))} />
          <StatCard label="કુલ આવક" value={formatCurrency(v(totalIncome))} />
          <StatCard
            label={netProfit >= 0 ? "ચોખ્ખો નફો" : "ચોખ્ખી ખોટ"}
            value={formatCurrency(v(netProfit))}
            color={netProfit >= 0 ? "var(--color-crop-500)" : "var(--color-loss-500)"}
          />
        </div>

        {cats.length > 0 && (
          <Card className="p-5 mb-4">
            <p className="text-[15px] font-semibold text-[var(--color-ink)] mb-3">ખર્ચ કેટેગરી પ્રમાણે</p>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={cats} dataKey="total" nameKey="label" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {cats.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
              {cats.map((c, i) => (
                <div key={c.category} className="flex items-center gap-2 text-[12.5px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-[var(--color-ink-soft)] truncate">{c.label}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {monthly.length > 0 && (
          <Card className="p-5 mb-4">
            <p className="text-[15px] font-semibold text-[var(--color-ink)] mb-3">માસિક ખર્ચ</p>
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer>
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-ink-faint)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--color-ink-faint)" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Bar dataKey="total" fill="var(--color-crop-500)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {profitSeries.length > 0 && (
          <Card className="p-5 mb-4">
            <p className="text-[15px] font-semibold text-[var(--color-ink)] mb-3">નફો/ખોટ (ખેતી પ્રમાણે)</p>
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer>
                <LineChart data={profitSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-ink-faint)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--color-ink-faint)" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Line type="monotone" dataKey="profit" stroke="var(--color-saffron-500)" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </Screen>
      <BottomNav />
    </>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Card className="p-4">
      <p className="text-[12.5px] text-[var(--color-ink-faint)]">{label}</p>
      <p className="tnum text-[18px] font-bold mt-1" style={{ color: color || "var(--color-ink)" }}>
        {value}
      </p>
    </Card>
  );
}

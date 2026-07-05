import { useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { useAppData } from "../context/AppDataContext";
import { TopBar, Screen, BottomNav } from "../components/ui/AppShell";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { ChartIcon } from "../components/icons/UIIcons";
import { formatCurrency } from "../lib/format";
import { categoryTotals, monthlyExpenseSeries, seasonIncome, seasonProfit, totalExpenses } from "../lib/calc";

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
  const { seasons, expenses, isLoaded } = useAppData();

  const totalSpent = totalExpenses(expenses);
  const totalIncome = seasons.reduce((s, season) => s + seasonIncome(season), 0);
  const netProfit = seasons.reduce((s, season) => s + seasonProfit(season, expenses.filter((e) => e.seasonId === season.id)), 0);
  const activeCount = seasons.filter((s) => s.status === "active").length;
  const harvestedCount = seasons.filter((s) => s.status === "harvested").length;

  const cats = useMemo(() => categoryTotals(expenses), [expenses]);
  const monthly = useMemo(() => monthlyExpenseSeries(expenses), [expenses]);
  const profitSeries = useMemo(
    () =>
      seasons
        .filter((s) => s.status === "harvested")
        .map((s) => ({
          name: s.cropName.length > 6 ? s.cropName.slice(0, 6) + "…" : s.cropName,
          profit: seasonProfit(s, expenses.filter((e) => e.seasonId === s.id)),
        })),
    [seasons, expenses]
  );

  if (isLoaded && seasons.length === 0) {
    return (
      <>
        <TopBar title="આંકડા" />
        <Screen>
          <EmptyState icon={<ChartIcon size={26} />} title="હજુ કોઈ માહિતી નથી" description="ખેતી ઉમેરો એટલે અહીં આંકડા દેખાશે." />
        </Screen>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <TopBar title="આંકડા" />
      <Screen>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard label="કુલ ખેતી" value={String(seasons.length)} />
          <StatCard label="ચાલુ ખેતી" value={String(activeCount)} />
          <StatCard label="પૂર્ણ ખેતી" value={String(harvestedCount)} />
          <StatCard label="કુલ ખર્ચ" value={formatCurrency(totalSpent)} />
          <StatCard label="કુલ આવક" value={formatCurrency(totalIncome)} />
          <StatCard
            label={netProfit >= 0 ? "ચોખ્ખો નફો" : "ચોખ્ખી ખોટ"}
            value={formatCurrency(netProfit)}
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

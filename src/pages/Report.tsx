import { useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { TopBar, Screen } from "../components/ui/AppShell";
import { Button } from "../components/ui/Button";
import { formatCurrency, formatDateDMY, formatDateLong } from "../lib/format";
import { categoryTotals, seasonIncome, seasonProfit, totalExpenses, profitPercentage, totalWorkerCost, totalBhaagidaarAdvance } from "../lib/calc";
import { EXPENSE_CATEGORIES } from "../types";
import { DownloadIcon, MessageCircleIcon, LockIcon } from "../components/icons/UIIcons";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Report() {
  const navigate = useNavigate();
  const   { id } = useParams();
  const { getSeason, expensesForSeason, workersForSeason, bhaagidarsForSeason, advanceLedgers } = useAppData();
  const { isPremium } = useAuth();
  const { show } = useToast();
  const season = getSeason(id!);
  const expenses = season ? expensesForSeason(season.id) : [];
  const workers = season ? workersForSeason(season.id) : [];
  const ledgers = season ? advanceLedgers.filter(a => a.seasonId === season.id) : [];

  if (!season) {
    return (
      <>
        <TopBar title="રિપોર્ટ" onBack={() => navigate(`/crop/${id}`)} />
        <Screen withNav={false}>
          <p className="text-[var(--color-ink-faint)] pt-8 text-center">ખેતી મળી નથી.</p>
        </Screen>
      </>
    );
  }

  const spent = totalExpenses(expenses) + totalWorkerCost(workers) + totalBhaagidaarAdvance(ledgers);
  const isHarvested = season.status === "harvested";
  const income = seasonIncome(season);
  const profit = seasonProfit(season, expenses, workers, ledgers);
  const pct = profitPercentage(season, expenses, workers, ledgers);

  const bighas = season.areaBigha || 0;
  const showPerBigha = bighas > 0;
  const pb = (amount: number) => showPerBigha ? `(${formatCurrency(amount / bighas)} / વિઘા)` : '';

  const cats = [...categoryTotals(expenses)];
  const wTotal = totalWorkerCost(workers);
  if (wTotal > 0) cats.push({ category: "labor" as any, label: "મજૂરી ખર્ચ", total: wTotal });
  const bTotal = totalBhaagidaarAdvance(ledgers);
  if (bTotal > 0) cats.push({ category: "other" as any, label: "ભાગીદાર એડવાન્સ", total: bTotal });
  cats.sort((a, b) => b.total - a.total);

  type ReportItem = { id: string; date: string; categoryLabel: string; description: string; amount: number };
  const reportItems: ReportItem[] = [];
  
  expenses.forEach(e => reportItems.push({ 
    id: e.id, 
    date: e.date, 
    categoryLabel: EXPENSE_CATEGORIES.find(c => c.id === e.category)?.label || "અન્ય", 
    description: e.description || "—", 
    amount: e.amount 
  }));
  
  workers.forEach(w => reportItems.push({ 
    id: w.id, 
    date: w.date, 
    categoryLabel: "મજૂરી", 
    description: `${w.workersCount} મજૂર (${w.workType}) ${w.notes ? '- ' + w.notes : ''}`, 
    amount: w.total 
  }));
  
  const bhaagidars = bhaagidarsForSeason(season.id);
  ledgers.forEach(l => {
    const bhaagidar = bhaagidars.find(b => b.id === l.bhaagidarId);
    const name = bhaagidar ? bhaagidar.name : 'ભાગીદાર';
    const typeStr = l.type === 'debit' ? 'આપેલ' : 'પરત મળેલ';
    reportItems.push({
      id: l.id,
      date: l.date,
      categoryLabel: `ભાગીદાર (${name})`,
      description: `એડવાન્સ ${typeStr} ${l.note ? '- ' + l.note : ''}`,
      amount: l.type === 'debit' ? l.amount : -l.amount
    });
  });

  reportItems.sort((a, b) => a.date.localeCompare(b.date));

  const handlePrint = () => {
    if (!isPremium) {
      show("આ સુવિધા માત્ર પ્રીમિયમ એકાઉન્ટ માટે છે.");
      navigate("/membership/payment");
      return;
    }
    window.print();
  };

  const handleWhatsAppShare = () => {
    if (!isPremium) {
      show("આ સુવિધા માત્ર પ્રીમિયમ એકાઉન્ટ માટે છે.");
      navigate("/membership/payment");
      return;
    }
    const summaryText =
      `🌾 *ખેડૂત ખર્ચ નોંધ — પાક રિપોર્ટ* 🌾\n\n` +
      `🌱 *પાક:* ${season.cropName}\n` +
      `🏞️ *ખેતર:* ${season.fieldName}${season.areaLabel ? ` (${season.areaLabel})` : ""}\n` +
      `📅 *વાવણી તારીખ:* ${formatDateDMY(season.sowingDate)}\n` +
      `💰 *કુલ ખર્ચ:* ${formatCurrency(spent)}\n` +
      (isHarvested
        ? `💵 *કુલ આવક:* ${formatCurrency(income)}\n` +
          `📈 *${profit >= 0 ? "ચોખ્ખો નફો" : "ચોખ્ખી ખોટ"}:* ${formatCurrency(profit)} (${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%)\n`
        : "") +
      `\nખેડૂત ખર્ચ એપ દ્વારા બનાવેલ 🚜`;

    const url = `https://wa.me/?text=${encodeURIComponent(summaryText)}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <TopBar
        title="રિપોર્ટ"
        onBack={() => navigate(`/crop/${id}`)}
        right={
          <div className="flex items-center gap-1">
            <button
              onClick={handleWhatsAppShare}
              className="w-10 h-10 flex items-center justify-center rounded-full text-emerald-600 bg-emerald-50 active:bg-emerald-100"
              title="WhatsApp પર શેર કરો"
            >
              <MessageCircleIcon size={20} />
            </button>
            <button
              onClick={handlePrint}
              className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--color-crop-500)]"
              title="PDF ડાઉનલોડ કરો"
            >
              {!isPremium ? <LockIcon size={20} /> : <DownloadIcon size={20} />}
            </button>
          </div>
        }
      />
      <Screen withNav={false}>
        <div className="mb-4 space-y-2 print:hidden">
          <Button fullWidth size="lg" onClick={handlePrint} variant={!isPremium ? "outline" : "primary"}>
            {!isPremium ? <LockIcon size={18} /> : <DownloadIcon size={18} />} PDF તરીકે સાચવો / છાપો
          </Button>
          <button
            onClick={handleWhatsAppShare}
            className={`w-full h-12 flex items-center justify-center gap-2 rounded-[var(--radius-control)] font-semibold text-[15px] shadow-sm transition-colors ${
              !isPremium ? "bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--color-border)]" : "bg-emerald-600 text-white active:bg-emerald-700"
            }`}
          >
            {!isPremium ? <LockIcon size={20} /> : <MessageCircleIcon size={20} />} WhatsApp પર શેર કરો
          </button>
          <p className="text-center text-[12.5px] text-[var(--color-ink-faint)] mt-1">
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
              {reportItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-300">
                  <td className="py-1.5 tnum">{formatDateDMY(item.date)}</td>
                  <td className="py-1.5">{item.categoryLabel}</td>
                  <td className="py-1.5">{item.description}</td>
                  <td className="py-1.5 text-right tnum">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
              {reportItems.length === 0 && (
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
            <ReportTotal label="કુલ ખર્ચ" value={`${formatCurrency(spent)} ${pb(spent)}`} />
            {isHarvested && (
              <>
                <ReportTotal label="કુલ આવક" value={`${formatCurrency(income)} ${pb(income)}`} />
                <ReportTotal
                  label={profit >= 0 ? "ચોખ્ખો નફો" : "ચોખ્ખી ખોટ"}
                  value={`${formatCurrency(profit)} ${pb(profit)} (${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%)`}
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
          <p className="text-center text-[9.5px] text-gray-400 mt-1">
            અસ્વીકરણ: આ રિપોર્ટ માત્ર અંગત નોંધ માટે છે. કાનૂની અથવા સત્તાવાર ટેક્સ ઓડિટ દસ્તાવેજ નથી.
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

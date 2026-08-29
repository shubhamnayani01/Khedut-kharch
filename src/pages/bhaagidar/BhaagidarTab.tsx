import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../../context/AppDataContext";
import { TopBar, Screen } from "../../components/ui/AppShell";
import { SeasonSwitcher } from "../../components/ui/SeasonSwitcher";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { TextInput, NumberInput } from "../../components/ui/Field";
import { EmptyState } from "../../components/ui/EmptyState";
import { UsersIcon, PlusIcon } from "../../components/icons/UIIcons";
import { todayISO } from "../../lib/format";
import { useToast } from "../../context/ToastContext";

export default function BhaagidarTab() {
  const navigate = useNavigate();
  const { settings, getSeason, bhaagidarsForSeason, addAdvanceLedger } = useAppData();
  const { show } = useToast();
  
  const seasonId = settings.activeSeasonId;
  const season = seasonId ? getSeason(seasonId) : undefined;
  const bhaagidars = seasonId ? bhaagidarsForSeason(seasonId) : [];

  const [selectedBhaagidar, setSelectedBhaagidar] = useState<string | null>(null);
  const [showAddTx, setShowAddTx] = useState(false);
  const [txType, setTxType] = useState<"debit"|"credit">("debit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayISO());

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !selectedBhaagidar || !season) return;
    addAdvanceLedger({
      seasonId: season.id,
      bhaagidarId: selectedBhaagidar,
      date,
      amount: Number(amount),
      type: txType,
      note
    });
    setShowAddTx(false);
    setSelectedBhaagidar(null);
    setAmount("");
    setNote("");
    setDate(todayISO());
    show(txType === "debit" ? "એડવાન્સ નોંધાયું" : "પરત મળેલ રકમ નોંધાઈ");
  };

  if (!season) {
    return (
      <>
        <TopBar titleContent={<SeasonSwitcher />} />
        <Screen>
          <div className="flex flex-col items-center justify-center pt-20">
            <UsersIcon size={48} className="text-[var(--color-ink-faint)] mb-4" />
            <h2 className="text-[17px] font-semibold text-[var(--color-ink)] mb-2">કોઈ ખેતી પસંદ કરેલ નથી</h2>
            <p className="text-[14px] text-[var(--color-ink-faint)] text-center mb-6">
              ભાગીદાર જોવા માટે ઉપરથી તમારી ખેતી પસંદ કરો અથવા નવી ખેતી ઉમેરો.
            </p>
            <Button onClick={() => navigate("/new-season")}>નવી ખેતી ઉમેરો</Button>
          </div>
        </Screen>
      </>
    );
  }

  return (
    <>
      <TopBar titleContent={<SeasonSwitcher />} />
      <Screen>
        {bhaagidars.length === 0 ? (
          <EmptyState
            icon={<UsersIcon size={24} />}
            title="કોઈ ભાગીદાર નથી"
            description="આ ખેતી માટે હજુ સુધી કોઈ ભાગીદાર ઉમેર્યા નથી."
          />
        ) : (
          <div className="space-y-3">
            {bhaagidars.map((b) => (
              <div
                key={b.id}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-control)] p-3.5 flex items-center justify-between"
              >
                <button
                  onClick={() => navigate(`/crop/${season.id}/bhaagidar/${b.id}`)}
                  className="flex-1 min-w-0 flex items-center gap-3.5 text-left active:opacity-70 transition-opacity"
                >
                  <div className="w-11 h-11 rounded-full bg-[var(--color-soil-50)] text-[var(--color-soil-600)] flex items-center justify-center shrink-0 font-bold text-[16px]">
                    {b.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[15.5px] font-semibold text-[var(--color-ink)] truncate">
                        {b.name}
                      </span>
                      <span className="tnum text-[14px] font-bold text-[var(--color-crop-500)] shrink-0 pl-2">
                        {b.sharePercentage}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-[var(--color-ink-faint)]">
                      {b.mobile ? <span className="truncate">{b.mobile}</span> : <span>નંબર નથી</span>}
                    </div>
                  </div>
                </button>
                
                <div className="border-l border-[var(--color-border)] pl-3 ml-3 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedBhaagidar(b.id);
                      setTxType('debit');
                      setShowAddTx(true);
                    }}
                    className="flex items-center justify-center px-3 py-1.5 bg-[var(--color-surface-dim)] rounded-full text-[12px] font-semibold text-[var(--color-ink-soft)] active:scale-95 transition-transform"
                  >
                    + લેવડ-દેવડ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="fixed bottom-[calc(72px+env(safe-area-inset-bottom))] right-4 z-40">
           <button
             onClick={() => navigate(`/crop/${season.id}/bhaagidar/new`)}
             className="flex items-center gap-2 h-14 pl-4 pr-5 rounded-full bg-[var(--color-crop-500)] text-white shadow-[var(--shadow-float)] active:bg-[var(--color-crop-600)] transition-transform duration-150 active:scale-95"
           >
             <PlusIcon size={22} />
             <span className="text-[15px] font-semibold">ભાગીદાર ઉમેરો</span>
           </button>
        </div>
      </Screen>

      <Dialog open={showAddTx} onClose={() => setShowAddTx(false)} title="નવી લેવડ-દેવડ નોંધો">
        <form onSubmit={handleAddTx} className="space-y-4 mt-2">
           <div className="grid grid-cols-2 gap-2">
             <button type="button" onClick={() => setTxType('debit')} className={`py-2 rounded-md font-semibold text-[14px] ${txType==='debit' ? 'bg-[var(--color-loss-100)] text-[var(--color-loss-600)] border border-[var(--color-loss-300)]' : 'bg-[var(--color-surface)] text-[var(--color-ink-soft)] border border-[var(--color-border)]'}`}>રૂપિયા આપ્યા</button>
             <button type="button" onClick={() => setTxType('credit')} className={`py-2 rounded-md font-semibold text-[14px] ${txType==='credit' ? 'bg-[var(--color-crop-100)] text-[var(--color-crop-700)] border border-[var(--color-crop-300)]' : 'bg-[var(--color-surface)] text-[var(--color-ink-soft)] border border-[var(--color-border)]'}`}>પરત મળ્યા</button>
           </div>
           
           <TextInput label="તારીખ" type="date" required value={date} onChange={(e) => setDate(e.target.value)} max={todayISO()} />
           <NumberInput label="રકમ (₹)" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" min="1" autoFocus />
           <TextInput label="નોંધ (વૈકલ્પિક)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="શાના માટે..." />
           
           <Button type="submit" fullWidth className="mt-2">નોંધ સાચવો</Button>
        </form>
      </Dialog>
    </>
  );
}

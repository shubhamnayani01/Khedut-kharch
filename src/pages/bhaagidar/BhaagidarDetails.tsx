import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppData } from "../../context/AppDataContext";
import { TopBar, Screen } from "../../components/ui/AppShell";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { TextInput, NumberInput } from "../../components/ui/Field";
import { TrashIcon } from "../../components/icons/UIIcons";
import { formatCurrency, formatDateDMY, todayISO } from "../../lib/format";
import { useToast } from "../../context/ToastContext";

export default function BhaagidarDetails() {
  const { id, bhaagidarId } = useParams();
  const navigate = useNavigate();
  const { getSeason, bhaagidarsForSeason, ledgersForBhaagidar, addAdvanceLedger, deleteBhaagidar, deleteAdvanceLedger } = useAppData();
  const { show } = useToast();
  const season = getSeason(id!);
  
  const bhaagidars = season ? bhaagidarsForSeason(season.id) : [];
  const profile = bhaagidars.find((b) => b.id === bhaagidarId);
  const ledgers = profile ? ledgersForBhaagidar(profile.id).sort((a, b) => b.createdAt - a.createdAt) : [];
  
  const [showAddTx, setShowAddTx] = useState(false);
  const [txType, setTxType] = useState<"debit"|"credit">("debit"); // debit = given, credit = returned
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayISO());

  if (!season || !profile) {
    return (
      <>
        <TopBar title="ભાગીદાર વિગત" onBack={() => navigate("/")} />
        <Screen>
          <p className="text-[var(--color-ink-faint)] pt-8 text-center">માહિતી મળી નથી.</p>
        </Screen>
      </>
    );
  }

  // Calculate Advance Ledger Balance
  let outstandingAdvance = 0;
  for (const t of ledgers) {
    if (t.type === "debit") outstandingAdvance += t.amount;
    if (t.type === "credit") outstandingAdvance -= t.amount;
  }

  // Calculate Settlement
  const income = season.harvest ? season.harvest.totalProductionKg * season.harvest.sellingPricePerKg + season.harvest.otherIncome : 0;
  
  const expectedShare = income * (profile.sharePercentage / 100);
  const finalSettlement = expectedShare - outstandingAdvance;

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    addAdvanceLedger({
      seasonId: season.id,
      bhaagidarId: profile.id,
      date,
      amount: Number(amount),
      type: txType,
      note
    });
    setShowAddTx(false);
    setAmount("");
    setNote("");
    setDate(todayISO());
    show(txType === "debit" ? "એડવાન્સ નોંધાયું" : "પરત મળેલ રકમ નોંધાઈ");
  };

  const handleDelete = () => {
    if (window.confirm("શું તમે આ ભાગીદાર અને તેના તમામ એડવાન્સ રેકોર્ડ્સ કાઢી નાખવા માંગો છો?")) {
      deleteBhaagidar(profile.id);
      show("ભાગીદાર કાઢી નાખ્યો");
      navigate("/bhaagidar", { replace: true });
    }
  };

  return (
    <>
      <TopBar title={profile.name} onBack={() => navigate("/")} right={
         <button onClick={handleDelete} className="p-2 text-[var(--color-loss-500)]"><TrashIcon size={20} /></button>
      } />
      <Screen>
        {/* Profile Info */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-control)] p-5 mb-4">
          <div className="flex justify-between items-center mb-3">
             <h2 className="text-[17px] font-bold text-[var(--color-ink)]">{profile.name}</h2>
             <span className="bg-[var(--color-crop-100)] text-[var(--color-crop-700)] px-3 py-1 rounded-full text-[13px] font-bold">
               {profile.sharePercentage}% ભાગ
             </span>
          </div>
          {profile.mobile && <p className="text-[14px] text-[var(--color-ink-soft)]">{profile.mobile}</p>}
          {profile.notes && <p className="text-[13px] text-[var(--color-ink-faint)] mt-2 italic">{profile.notes}</p>}
        </div>

        {/* Settlement Summary */}
        <div className="bg-gradient-to-br from-[var(--color-crop-500)] to-[var(--color-crop-600)] rounded-[var(--radius-control)] p-5 mb-5 text-white shadow-lg">
           <h3 className="text-[15px] font-medium opacity-90 mb-4">હિસાબ (Settlement)</h3>
           
           {!season.harvest ? (
             <div className="space-y-4">
                <div className="bg-white/10 p-3 rounded-lg border border-white/20 flex items-start gap-2 text-[14px]">
                  <span>⚠️</span>
                  <span>પાક વેચાણની માહિતી હજુ ઉમેરવામાં આવી નથી</span>
                </div>
                
                <div className="space-y-2.5">
                  <div className="flex justify-between text-[14px]">
                     <span className="opacity-80">Settlement Status:</span>
                     <span className="font-semibold">બાકી</span>
                  </div>
                  <div className="flex justify-between text-[14px]">
                     <span className="opacity-80">Outstanding Advance:</span>
                     <span className="font-semibold text-red-200">{formatCurrency(outstandingAdvance)}</span>
                  </div>
                </div>
                
                <Button 
                  variant="secondary" 
                  fullWidth 
                  className="mt-2 bg-white text-[var(--color-crop-700)] border-none font-bold hover:bg-gray-50 active:bg-gray-100"
                  onClick={() => navigate(`/crop/${season.id}/harvest`)}
                >
                  પાક વેચાણ ઉમેરો
                </Button>
             </div>
           ) : (
             <div className="space-y-2.5">
                <div className="flex justify-between text-[14px]">
                   <span className="opacity-80">કુલ આવક</span>
                   <span className="font-semibold">{formatCurrency(income)}</span>
                </div>
                <div className="flex justify-between text-[14px]">
                   <span className="opacity-80">ભાગીદારનો હિસ્સો ({profile.sharePercentage}%)</span>
                   <span className="font-semibold">{formatCurrency(expectedShare)}</span>
                </div>
                <div className="flex justify-between text-[14px]">
                   <span className="opacity-80">બાકી એડવાન્સ</span>
                   <span className="font-semibold text-red-200">-{formatCurrency(outstandingAdvance)}</span>
                </div>
                <div className="h-px bg-white/20 my-2" />
                <div className="flex justify-between items-center">
                   <span className="text-[16px] font-bold">ફાઇનલ ચૂકવણી</span>
                   <span className="text-[20px] font-bold">{formatCurrency(finalSettlement)}</span>
                </div>
             </div>
           )}
        </div>

        {/* Advance Ledger */}
        <div className="flex items-center justify-between mb-3">
           <h3 className="text-[16px] font-semibold text-[var(--color-ink)]">એડવાન્સ લેજર</h3>
           <Button variant="secondary" size="sm" onClick={() => setShowAddTx(true)}>+ લેવડ-દેવડ</Button>
        </div>

        <div className="space-y-3 pb-8">
           {ledgers.length === 0 ? (
             <p className="text-center text-[var(--color-ink-faint)] py-4 text-[14px]">કોઈ લેવડ-દેવડ નોંધાયેલ નથી.</p>
           ) : (
             ledgers.map(t => (
               <div key={t.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-[var(--radius-control)] flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${t.type === 'debit' ? 'bg-[var(--color-loss-500)]' : 'bg-[var(--color-crop-500)]'}`}></span>
                      <span className="text-[14.5px] font-semibold text-[var(--color-ink)]">
                        {t.type === 'debit' ? 'આપેલ (એડવાન્સ)' : 'પરત મળેલ'}
                      </span>
                    </div>
                    <p className="text-[12.5px] text-[var(--color-ink-faint)]">{formatDateDMY(t.date)} {t.note ? `· ${t.note}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`tnum text-[16px] font-bold ${t.type === 'debit' ? 'text-[var(--color-loss-500)]' : 'text-[var(--color-crop-500)]'}`}>
                      {t.type === 'debit' ? '-' : '+'}{formatCurrency(t.amount)}
                    </span>
                    <button onClick={() => { if(window.confirm("ડિલીટ કરવું છે?")) deleteAdvanceLedger(t.id); }} className="p-2 -mr-2 text-[var(--color-ink-faint)]"><TrashIcon size={16}/></button>
                  </div>
               </div>
             ))
           )}
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

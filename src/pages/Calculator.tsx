import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar, Screen } from "../components/ui/AppShell";
import { formatCurrency } from "../lib/format";

type Tab = "mann" | "tractor" | "basic" | "land" | "labor" | "fertilizer";

export default function Calculator() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("mann");

  // ────────────────────────────────────────────────────────────────────
  // TAB: MANN (મણ) / APMC CROP PRICE CALCULATOR
  // User customizable: 1 Mann = X kg (Default 20 kg, can be edited to 40 kg or any number)
  // ────────────────────────────────────────────────────────────────────
  const [kgPerMann, setKgPerMann] = useState<number | "">(20);
  const [weightMode, setWeightMode] = useState<"kg" | "mann">("kg");
  const [inputWeight, setInputWeight] = useState<number | "">(1000); // e.g. 1000 kg or 50 mann
  const [pricePerMann, setPricePerMann] = useState<number | "">(1650); // e.g. Cotton ₹1650 / mann

  const effectiveKgPerMann = typeof kgPerMann === "number" && kgPerMann > 0 ? kgPerMann : 20;

  // Compute total KG and total Mann
  const totalWeightKg =
    typeof inputWeight === "number" && inputWeight > 0
      ? weightMode === "kg"
        ? inputWeight
        : inputWeight * effectiveKgPerMann
      : 0;

  const totalWeightMann = totalWeightKg / effectiveKgPerMann;
  const ratePerMann = typeof pricePerMann === "number" && pricePerMann > 0 ? pricePerMann : 0;
  const ratePerKg = ratePerMann / effectiveKgPerMann;
  const totalMannAmount = totalWeightMann * ratePerMann;

  // ────────────────────────────────────────────────────────────────────
  // TAB: TRACTOR / HOURLY & VIGHA RENT CALCULATOR
  // ────────────────────────────────────────────────────────────────────
  const [tractorMode, setTractorMode] = useState<"time" | "vigha">("time");
  // Time mode (Hours + Minutes)
  const [tractorHours, setTractorHours] = useState<number | "">(2);
  const [tractorMinutes, setTractorMinutes] = useState<number | "">(30);
  const [ratePerHour, setRatePerHour] = useState<number | "">(800);

  // Vigha mode
  const [tractorVighas, setTractorVighas] = useState<number | "">(4);
  const [ratePerVigha, setRatePerVigha] = useState<number | "">(500);

  const totalTimeHours =
    (typeof tractorHours === "number" ? tractorHours : 0) +
    (typeof tractorMinutes === "number" ? tractorMinutes / 60 : 0);

  const tractorTotalCost =
    tractorMode === "time"
      ? totalTimeHours * (typeof ratePerHour === "number" ? ratePerHour : 0)
      : (typeof tractorVighas === "number" ? tractorVighas : 0) *
        (typeof ratePerVigha === "number" ? ratePerVigha : 0);

  // ────────────────────────────────────────────────────────────────────
  // TAB: BASIC 4-FUNCTION CALCULATOR
  // ────────────────────────────────────────────────────────────────────
  const [calcDisplay, setCalcDisplay] = useState<string>("0");
  const [calcPrev, setCalcPrev] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);
  const [calcNewNumber, setCalcNewNumber] = useState<boolean>(true);

  const handleDigit = (digit: string) => {
    if (calcNewNumber) {
      setCalcDisplay(digit === "." ? "0." : digit);
      setCalcNewNumber(false);
    } else {
      if (digit === "." && calcDisplay.includes(".")) return;
      setCalcDisplay(calcDisplay === "0" && digit !== "." ? digit : calcDisplay + digit);
    }
  };

  const handleOp = (op: string) => {
    const current = parseFloat(calcDisplay);
    if (calcPrev !== null && calcOp && !calcNewNumber) {
      let res = calcPrev;
      if (calcOp === "+") res += current;
      if (calcOp === "-") res -= current;
      if (calcOp === "×") res *= current;
      if (calcOp === "÷") res = current !== 0 ? res / current : 0;
      setCalcDisplay(String(Number(res.toFixed(4))));
      setCalcPrev(res);
    } else {
      setCalcPrev(current);
    }
    setCalcOp(op);
    setCalcNewNumber(true);
  };

  const handleEqual = () => {
    if (calcPrev === null || !calcOp) return;
    const current = parseFloat(calcDisplay);
    let res = calcPrev;
    if (calcOp === "+") res += current;
    if (calcOp === "-") res -= current;
    if (calcOp === "×") res *= current;
    if (calcOp === "÷") res = current !== 0 ? res / current : 0;
    setCalcDisplay(String(Number(res.toFixed(4))));
    setCalcPrev(null);
    setCalcOp(null);
    setCalcNewNumber(true);
  };

  const handleClear = () => {
    setCalcDisplay("0");
    setCalcPrev(null);
    setCalcOp(null);
    setCalcNewNumber(true);
  };

  // ────────────────────────────────────────────────────────────────────
  // TAB: LAND CONVERTER
  // ────────────────────────────────────────────────────────────────────
  const [landInput, setLandInput] = useState<number | "">(1);
  const [landUnit, setLandUnit] = useState<"vigha" | "acre" | "guntha" | "sqft" | "hectare">("vigha");

  const getSqFt = (val: number, unit: typeof landUnit): number => {
    switch (unit) {
      case "vigha":
        return val * 23760;
      case "acre":
        return val * 43560;
      case "guntha":
        return val * 1089;
      case "hectare":
        return val * 107639;
      case "sqft":
      default:
        return val;
    }
  };

  const sqFtValue = typeof landInput === "number" && landInput > 0 ? getSqFt(landInput, landUnit) : 0;
  const landResults = {
    vigha: sqFtValue / 23760,
    acre: sqFtValue / 43560,
    guntha: sqFtValue / 1089,
    sqft: sqFtValue,
    hectare: sqFtValue / 107639,
  };

  // ────────────────────────────────────────────────────────────────────
  // TAB: LABOR CALCULATOR
  // ────────────────────────────────────────────────────────────────────
  const [workersCount, setWorkersCount] = useState<number | "">(5);
  const [dailyWage, setDailyWage] = useState<number | "">(400);
  const [daysCount, setDaysCount] = useState<number | "">(1);

  const totalLaborCost =
    (typeof workersCount === "number" ? workersCount : 0) *
    (typeof dailyWage === "number" ? dailyWage : 0) *
    (typeof daysCount === "number" ? daysCount : 0);

  // ────────────────────────────────────────────────────────────────────
  // TAB: FERTILIZER DOSAGE CALCULATOR
  // ────────────────────────────────────────────────────────────────────
  const [fertArea, setFertArea] = useState<number | "">(5);
  const [dosagePerVighaKg, setDosagePerVighaKg] = useState<number | "">(25);
  const [bagWeightKg, setBagWeightKg] = useState<number | "">(50);
  const [bagPrice, setBagPrice] = useState<number | "">(1350);

  const totalFertKg =
    (typeof fertArea === "number" ? fertArea : 0) *
    (typeof dosagePerVighaKg === "number" ? dosagePerVighaKg : 0);

  const bagsNeeded =
    typeof bagWeightKg === "number" && bagWeightKg > 0 ? totalFertKg / bagWeightKg : 0;

  const totalFertCost =
    typeof bagPrice === "number" && bagPrice > 0 ? bagsNeeded * bagPrice : 0;

  return (
    <>
      <TopBar title="ખેતી કેલ્ક્યુલેટર" onBack={() => navigate("/")} />
      <Screen withNav={false}>
        {/* Navigation Tabs - Horizontal Scrollable */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5 no-scrollbar">
          {[
            { id: "mann", label: "મણ / ભાવ" },
            { id: "tractor", label: "ટ્રેક્ટર ભાડું" },
            { id: "basic", label: "કેલ્ક્યુલેટર (+ -)" },
            { id: "land", label: "જમીન માપ" },
            { id: "labor", label: "મજૂર હિસાબ" },
            { id: "fertilizer", label: "ખાતર ગણતરી" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as Tab)}
              className={`shrink-0 px-3.5 py-2 rounded-xl font-bold text-[13px] transition-all border ${
                activeTab === t.id
                  ? "bg-[var(--color-crop-500)] text-white border-[var(--color-crop-500)] shadow-xs"
                  : "bg-[var(--color-surface)] text-[var(--color-ink-soft)] border-[var(--color-border)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── TAB 1: MANN / APMC CROP PRICE CALCULATOR ─────────────── */}
        {activeTab === "mann" && (
          <div className="space-y-4">
            {/* Customizable 1 Mann = ? KG Config Banner */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex-1">
                <span className="text-[12px] font-bold text-amber-900 block">
                  ૧ મણનું પ્રમાણ (કિલોગ્રામ):
                </span>
                <span className="text-[11px] text-amber-700 block">
                  (સૌરાષ્ટ્ર/ગુજરાતમાં ૨૦ kg, કેટલાક વિસ્તારોમાં ૪૦ kg)
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 bg-white px-2.5 py-1 rounded-xl border border-amber-300">
                <span className="text-[13px] font-bold text-amber-950">૧ મણ =</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={kgPerMann}
                  onChange={(e) => setKgPerMann(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-12 text-center text-[15px] font-bold text-amber-900 outline-none"
                />
                <span className="text-[12px] font-bold text-amber-800">kg</span>
              </div>
            </div>

            {/* Inputs Card */}
            <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-xs space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12.5px] font-semibold text-[var(--color-ink)]">
                    કુલ ઉત્પાદન / વજન:
                  </label>
                  <div className="flex bg-[var(--color-paper-dim)] p-0.5 rounded-lg text-[11.5px] font-bold border border-[var(--color-border)]">
                    <button
                      type="button"
                      onClick={() => setWeightMode("kg")}
                      className={`px-2.5 py-0.5 rounded-md transition-all ${
                        weightMode === "kg"
                          ? "bg-[var(--color-crop-500)] text-white"
                          : "text-[var(--color-ink-faint)]"
                      }`}
                    >
                      કિલો (KG)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeightMode("mann")}
                      className={`px-2.5 py-0.5 rounded-md transition-all ${
                        weightMode === "mann"
                          ? "bg-[var(--color-crop-500)] text-white"
                          : "text-[var(--color-ink-faint)]"
                      }`}
                    >
                      મણ (Mann)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={inputWeight}
                    onChange={(e) => setInputWeight(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder={weightMode === "kg" ? "દા.ત. 1000" : "દા.ત. 50"}
                    className="flex-1 h-12 px-3.5 bg-white border border-[var(--color-border)] rounded-xl text-[16px] font-bold outline-none focus:border-[var(--color-crop-500)]"
                  />
                  <span className="text-[14px] font-bold text-[var(--color-ink-soft)] px-2">
                    {weightMode === "kg" ? "કિલો" : "મણ"}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[12.5px] font-semibold text-[var(--color-ink)] block mb-1">
                  ૧ મણનો બજાર ભાવ (₹):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={pricePerMann}
                    onChange={(e) => setPricePerMann(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="દા.ત. 1650"
                    className="flex-1 h-12 px-3.5 bg-white border border-[var(--color-border)] rounded-xl text-[16px] font-bold outline-none focus:border-[var(--color-crop-500)]"
                  />
                  <span className="text-[13px] font-bold text-[var(--color-ink-soft)] px-2">
                    ₹ / મણ
                  </span>
                </div>
              </div>
            </div>

            {/* Total Sale Result Card */}
            <div className="p-5 bg-gradient-to-br from-[var(--color-crop-500)] to-[var(--color-crop-700)] text-white rounded-[var(--radius-card)] shadow-md">
              <span className="text-[12.5px] opacity-90 block">કુલ વેચાણ રકમ:</span>
              <strong className="text-[32px] font-bold tracking-tight block my-1 tnum">
                {formatCurrency(Math.round(totalMannAmount))}
              </strong>

              <div className="grid grid-cols-2 gap-2 pt-3 mt-2 border-t border-white/20 text-[12px]">
                <div className="bg-white/10 p-2 rounded-lg">
                  <span className="opacity-80 block text-[11px]">કુલ મણ:</span>
                  <strong className="text-[15px] font-bold tnum">
                    {totalWeightMann.toFixed(2)} મણ
                  </strong>
                </div>
                <div className="bg-white/10 p-2 rounded-lg">
                  <span className="opacity-80 block text-[11px]">૧ કિલોનો ભાવ:</span>
                  <strong className="text-[15px] font-bold tnum">
                    ₹{ratePerKg.toFixed(2)} / kg
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: TRACTOR / HOURLY RENT CALCULATOR ──────────────── */}
        {activeTab === "tractor" && (
          <div className="space-y-4">
            <div className="flex bg-[var(--color-paper-dim)] p-1 rounded-xl border border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setTractorMode("time")}
                className={`flex-1 py-2 rounded-lg font-bold text-[13px] transition-all ${
                  tractorMode === "time"
                    ? "bg-[var(--color-surface)] text-[var(--color-crop-700)] shadow-xs"
                    : "text-[var(--color-ink-faint)]"
                }`}
              >
                કલાક / સમય પ્રમાણે
              </button>
              <button
                type="button"
                onClick={() => setTractorMode("vigha")}
                className={`flex-1 py-2 rounded-lg font-bold text-[13px] transition-all ${
                  tractorMode === "vigha"
                    ? "bg-[var(--color-surface)] text-[var(--color-crop-700)] shadow-xs"
                    : "text-[var(--color-ink-faint)]"
                }`}
              >
                વિઘા દીઠ ભાડું
              </button>
            </div>

            {tractorMode === "time" ? (
              <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-xs space-y-3.5">
                <div>
                  <label className="text-[12.5px] font-semibold text-[var(--color-ink)] block mb-1">
                    ટ્રેક્ટર ચાલ્યાનો સમય:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="number"
                        min="0"
                        value={tractorHours}
                        onChange={(e) => setTractorHours(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="કલાક"
                        className="w-full h-11 px-3 bg-white border border-[var(--color-border)] rounded-xl text-[15px] font-bold outline-none focus:border-[var(--color-crop-500)]"
                      />
                      <span className="text-[11px] text-[var(--color-ink-faint)] mt-1 block">કલાક (Hours)</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={tractorMinutes}
                        onChange={(e) => setTractorMinutes(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="મિનિટ"
                        className="w-full h-11 px-3 bg-white border border-[var(--color-border)] rounded-xl text-[15px] font-bold outline-none focus:border-[var(--color-crop-500)]"
                      />
                      <span className="text-[11px] text-[var(--color-ink-faint)] mt-1 block">મિનિટ (Minutes)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[12.5px] font-semibold text-[var(--color-ink)] block mb-1">
                    ૧ કલાકનો ભાવ (₹):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={ratePerHour}
                    onChange={(e) => setRatePerHour(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="દા.ત. 800"
                    className="w-full h-11 px-3 bg-white border border-[var(--color-border)] rounded-xl text-[15px] font-bold outline-none focus:border-[var(--color-crop-500)]"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-xs space-y-3.5">
                <div>
                  <label className="text-[12.5px] font-semibold text-[var(--color-ink)] block mb-1">
                    કુલ ખેડેલ વિસ્તાર (વિઘા):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={tractorVighas}
                    onChange={(e) => setTractorVighas(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="દા.ત. 4"
                    className="w-full h-11 px-3 bg-white border border-[var(--color-border)] rounded-xl text-[15px] font-bold outline-none focus:border-[var(--color-crop-500)]"
                  />
                </div>

                <div>
                  <label className="text-[12.5px] font-semibold text-[var(--color-ink)] block mb-1">
                    વિઘાદીઠ ખેડ/રોટાવેટર ભાડું (₹):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={ratePerVigha}
                    onChange={(e) => setRatePerVigha(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="દા.ત. 500"
                    className="w-full h-11 px-3 bg-white border border-[var(--color-border)] rounded-xl text-[15px] font-bold outline-none focus:border-[var(--color-crop-500)]"
                  />
                </div>
              </div>
            )}

            {/* Tractor Result Card */}
            <div className="p-5 bg-gradient-to-br from-[var(--color-soil-500)] to-[#7c4d28] text-white rounded-[var(--radius-card)] shadow-md">
              <span className="text-[12.5px] opacity-90 block">કુલ ટ્રેક્ટર ભાડું ચૂકવવાપાત્ર:</span>
              <strong className="text-[32px] font-bold tracking-tight block my-1 tnum">
                {formatCurrency(Math.round(tractorTotalCost))}
              </strong>
              {tractorMode === "time" && (
                <div className="text-[12px] opacity-90 pt-2 border-t border-white/20">
                  કુલ સમય: <strong>{tractorHours || 0} કલાક {tractorMinutes || 0} મિનિટ</strong> ({totalTimeHours.toFixed(2)} કલાક)
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 3: BASIC 4-FUNCTION CALCULATOR ───────────────────── */}
        {activeTab === "basic" && (
          <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-sm max-w-sm mx-auto">
            {/* Screen */}
            <div className="bg-[var(--color-paper-dim)] p-4 rounded-2xl mb-4 border border-[var(--color-border)] text-right">
              <span className="text-[12px] text-[var(--color-ink-faint)] block min-h-[16px]">
                {calcPrev !== null ? `${calcPrev} ${calcOp || ""}` : ""}
              </span>
              <span className="text-[32px] font-bold text-[var(--color-ink)] tracking-tight block truncate tnum">
                {calcDisplay}
              </span>
            </div>

            {/* Buttons Keypad */}
            <div className="grid grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={handleClear}
                className="col-span-2 h-13 rounded-xl bg-red-50 text-red-600 font-bold text-[17px] active:scale-95 transition-transform"
              >
                C (સાફ)
              </button>
              <button
                type="button"
                onClick={() => setCalcDisplay((d) => (d.startsWith("-") ? d.slice(1) : "-" + d))}
                className="h-13 rounded-xl bg-gray-100 text-[var(--color-ink)] font-bold text-[17px] active:scale-95 transition-transform"
              >
                ±
              </button>
              <button
                type="button"
                onClick={() => handleOp("÷")}
                className="h-13 rounded-xl bg-[var(--color-crop-50)] text-[var(--color-crop-700)] font-bold text-[20px] active:scale-95 transition-transform"
              >
                ÷
              </button>

              {["7", "8", "9"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDigit(d)}
                  className="h-13 rounded-xl bg-white border border-[var(--color-border)] text-[var(--color-ink)] font-bold text-[20px] shadow-xs active:scale-95 transition-transform"
                >
                  {d}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleOp("×")}
                className="h-13 rounded-xl bg-[var(--color-crop-50)] text-[var(--color-crop-700)] font-bold text-[20px] active:scale-95 transition-transform"
              >
                ×
              </button>

              {["4", "5", "6"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDigit(d)}
                  className="h-13 rounded-xl bg-white border border-[var(--color-border)] text-[var(--color-ink)] font-bold text-[20px] shadow-xs active:scale-95 transition-transform"
                >
                  {d}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleOp("-")}
                className="h-13 rounded-xl bg-[var(--color-crop-50)] text-[var(--color-crop-700)] font-bold text-[20px] active:scale-95 transition-transform"
              >
                -
              </button>

              {["1", "2", "3"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDigit(d)}
                  className="h-13 rounded-xl bg-white border border-[var(--color-border)] text-[var(--color-ink)] font-bold text-[20px] shadow-xs active:scale-95 transition-transform"
                >
                  {d}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleOp("+")}
                className="h-13 rounded-xl bg-[var(--color-crop-50)] text-[var(--color-crop-700)] font-bold text-[20px] active:scale-95 transition-transform"
              >
                +
              </button>

              <button
                type="button"
                onClick={() => handleDigit("0")}
                className="col-span-2 h-13 rounded-xl bg-white border border-[var(--color-border)] text-[var(--color-ink)] font-bold text-[20px] shadow-xs active:scale-95 transition-transform"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleDigit(".")}
                className="h-13 rounded-xl bg-white border border-[var(--color-border)] text-[var(--color-ink)] font-bold text-[20px] shadow-xs active:scale-95 transition-transform"
              >
                .
              </button>
              <button
                type="button"
                onClick={handleEqual}
                className="h-13 rounded-xl bg-[var(--color-crop-500)] text-white font-bold text-[22px] shadow-sm active:scale-95 transition-transform"
              >
                =
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB 4: LAND CONVERTER ─────────────────────────────────── */}
        {activeTab === "land" && (
          <div className="space-y-4">
            <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-xs">
              <label className="text-[13px] font-semibold text-[var(--color-ink)] block mb-1.5">
                જમીન માપ દાખલ કરો:
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={landInput}
                  onChange={(e) => setLandInput(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="માપ દાખલ કરો"
                  className="flex-1 h-12 px-3.5 bg-white border border-[var(--color-border)] rounded-xl text-[16px] font-bold outline-none focus:border-[var(--color-crop-500)]"
                />
                <select
                  value={landUnit}
                  onChange={(e) => setLandUnit(e.target.value as any)}
                  className="h-12 px-3 bg-white border border-[var(--color-border)] rounded-xl text-[14px] font-semibold outline-none focus:border-[var(--color-crop-500)]"
                >
                  <option value="vigha">વિઘા (Vigha)</option>
                  <option value="acre">એકર (Acre)</option>
                  <option value="guntha">ગુંઠા (Guntha)</option>
                  <option value="hectare">હેક્ટર (Hectare)</option>
                  <option value="sqft">ચોરસ ફૂટ (Sq. Ft)</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-xs">
              <h3 className="text-[13px] font-bold text-[var(--color-crop-700)] mb-3 pb-2 border-b border-[var(--color-border)]">
                બરાબર રૂપાંતરિત માપ:
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-[var(--color-crop-50)]/50 border border-[var(--color-crop-200)]/60 rounded-xl">
                  <span className="text-[11px] text-[var(--color-ink-faint)] font-medium block">વિઘા (ગુજરાત)</span>
                  <strong className="text-[18px] text-[var(--color-crop-700)] font-bold tnum">
                    {landResults.vigha.toFixed(2)}
                  </strong>
                  <span className="text-[10px] text-[var(--color-ink-faint)] block mt-0.5">વિઘા</span>
                </div>

                <div className="p-3 bg-[var(--color-paper-dim)] rounded-xl">
                  <span className="text-[11px] text-[var(--color-ink-faint)] font-medium block">એકર</span>
                  <strong className="text-[18px] text-[var(--color-ink)] font-bold tnum">
                    {landResults.acre.toFixed(2)}
                  </strong>
                  <span className="text-[10px] text-[var(--color-ink-faint)] block mt-0.5">એકર (40 ગુંઠા)</span>
                </div>

                <div className="p-3 bg-[var(--color-paper-dim)] rounded-xl">
                  <span className="text-[11px] text-[var(--color-ink-faint)] font-medium block">ગુંઠા</span>
                  <strong className="text-[18px] text-[var(--color-ink)] font-bold tnum">
                    {landResults.guntha.toFixed(2)}
                  </strong>
                  <span className="text-[10px] text-[var(--color-ink-faint)] block mt-0.5">ગુંઠા</span>
                </div>

                <div className="p-3 bg-[var(--color-paper-dim)] rounded-xl">
                  <span className="text-[11px] text-[var(--color-ink-faint)] font-medium block">હેક્ટર</span>
                  <strong className="text-[18px] text-[var(--color-ink)] font-bold tnum">
                    {landResults.hectare.toFixed(3)}
                  </strong>
                  <span className="text-[10px] text-[var(--color-ink-faint)] block mt-0.5">હેક્ટર</span>
                </div>
              </div>

              <div className="mt-3 p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/50 text-[11px] text-amber-900 leading-relaxed">
                ℹ️ <strong>માહિતી:</strong> ગુજરાતમાં સામાન્ય રીતે <strong>૧ એકર = ૨.૫ વિઘા = ૪૦ ગુંઠા</strong> (૪૩,૫૬ો ચોરસ ફૂટ) ગણવામાં આવે છે.
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 5: LABOR CALCULATOR ───────────────────────────────── */}
        {activeTab === "labor" && (
          <div className="space-y-4">
            <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-xs space-y-3.5">
              <div>
                <label className="text-[12.5px] font-semibold text-[var(--color-ink)] block mb-1">
                  કુલ મજૂર સંખ્યા:
                </label>
                <input
                  type="number"
                  min="1"
                  value={workersCount}
                  onChange={(e) => setWorkersCount(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="દા.ત. 5"
                  className="w-full h-11 px-3 bg-white border border-[var(--color-border)] rounded-xl text-[15px] font-semibold outline-none focus:border-[var(--color-crop-500)]"
                />
              </div>

              <div>
                <label className="text-[12.5px] font-semibold text-[var(--color-ink)] block mb-1">
                  એક મજૂરની દૈનિક દાડી (₹):
                </label>
                <input
                  type="number"
                  min="0"
                  value={dailyWage}
                  onChange={(e) => setDailyWage(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="દા.ત. 400"
                  className="w-full h-11 px-3 bg-white border border-[var(--color-border)] rounded-xl text-[15px] font-semibold outline-none focus:border-[var(--color-crop-500)]"
                />
              </div>

              <div>
                <label className="text-[12.5px] font-semibold text-[var(--color-ink)] block mb-1">
                  કામના દિવસો:
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={daysCount}
                  onChange={(e) => setDaysCount(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="દા.ત. 2"
                  className="w-full h-11 px-3 bg-white border border-[var(--color-border)] rounded-xl text-[15px] font-semibold outline-none focus:border-[var(--color-crop-500)]"
                />
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-[var(--color-crop-500)] to-[var(--color-crop-600)] text-white rounded-[var(--radius-card)] shadow-md">
              <span className="text-[13px] opacity-90 block">કુલ મજૂરી ખર્ચ:</span>
              <strong className="text-[28px] font-bold tracking-tight block my-1 tnum">
                {formatCurrency(totalLaborCost)}
              </strong>
              <div className="pt-2 mt-2 border-t border-white/20 text-[12px] opacity-90 flex justify-between">
                <span>૧ દિવસનો કુલ ખર્ચ:</span>
                <span className="font-bold tnum">
                  {formatCurrency((typeof workersCount === "number" ? workersCount : 0) * (typeof dailyWage === "number" ? dailyWage : 0))}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 6: FERTILIZER DOSAGE CALCULATOR ────────────────────── */}
        {activeTab === "fertilizer" && (
          <div className="space-y-4">
            <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-xs space-y-3.5">
              <div>
                <label className="text-[12.5px] font-semibold text-[var(--color-ink)] block mb-1">
                  ખેતર વિસ્તાર (વિઘા):
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={fertArea}
                  onChange={(e) => setFertArea(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="દા.ત. 5"
                  className="w-full h-11 px-3 bg-white border border-[var(--color-border)] rounded-xl text-[15px] font-semibold outline-none focus:border-[var(--color-crop-500)]"
                />
              </div>

              <div>
                <label className="text-[12.5px] font-semibold text-[var(--color-ink)] block mb-1">
                  વિઘાદીઠ ખાતર પ્રમાણ (kg):
                </label>
                <input
                  type="number"
                  min="1"
                  value={dosagePerVighaKg}
                  onChange={(e) => setDosagePerVighaKg(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="દા.ત. 25 kg / વિઘા"
                  className="w-full h-11 px-3 bg-white border border-[var(--color-border)] rounded-xl text-[15px] font-semibold outline-none focus:border-[var(--color-crop-500)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[12.5px] font-semibold text-[var(--color-ink)] block mb-1">
                    બોરી વજન (kg):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bagWeightKg}
                    onChange={(e) => setBagWeightKg(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="દા.ત. 50"
                    className="w-full h-11 px-3 bg-white border border-[var(--color-border)] rounded-xl text-[15px] font-semibold outline-none focus:border-[var(--color-crop-500)]"
                  />
                </div>
                <div>
                  <label className="text-[12.5px] font-semibold text-[var(--color-ink)] block mb-1">
                    બોરી ભાવ (₹):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bagPrice}
                    onChange={(e) => setBagPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="દા.ત. 1350"
                    className="w-full h-11 px-3 bg-white border border-[var(--color-border)] rounded-xl text-[15px] font-semibold outline-none focus:border-[var(--color-crop-500)]"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-xs">
              <h3 className="text-[13px] font-bold text-[var(--color-crop-700)] mb-3 pb-2 border-b border-[var(--color-border)]">
                ખાતર જરૂરિયાત અંદાજ:
              </h3>

              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <div className="p-3 bg-[var(--color-crop-50)]/60 border border-[var(--color-crop-200)]/60 rounded-xl">
                  <span className="text-[11px] text-[var(--color-ink-faint)] font-medium block">કુલ ખાતર વજન</span>
                  <strong className="text-[18px] text-[var(--color-crop-700)] font-bold tnum">
                    {totalFertKg.toFixed(1)}
                  </strong>
                  <span className="text-[10px] text-[var(--color-ink-faint)] block mt-0.5">કિલોગ્રામ (kg)</span>
                </div>

                <div className="p-3 bg-[var(--color-paper-dim)] rounded-xl">
                  <span className="text-[11px] text-[var(--color-ink-faint)] font-medium block">જરૂરી બોરી (કટ્ટા)</span>
                  <strong className="text-[18px] text-[var(--color-ink)] font-bold tnum">
                    {bagsNeeded.toFixed(1)}
                  </strong>
                  <span className="text-[10px] text-[var(--color-ink-faint)] block mt-0.5">બોરી ({bagWeightKg} kg)</span>
                </div>
              </div>

              <div className="p-3.5 bg-[var(--color-soil-500)] text-white rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11.5px] opacity-90 block">કુલ અંદાજિત ખર્ચ:</span>
                  <strong className="text-[20px] font-bold tnum">
                    {formatCurrency(Math.round(totalFertCost))}
                  </strong>
                </div>
                <div className="text-right text-[11.5px] opacity-90">
                  <span>~ {Math.ceil(bagsNeeded)} આખી બોરી</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Screen>
    </>
  );
}

import { useState } from "react";
import { Screen, TopBar } from "../../components/ui/AppShell";
import { WarningIcon, ShieldAlertIcon } from "../../components/icons/ModuleIcons";
import { CheckCircleIcon, CloseIcon } from "../../components/icons/UIIcons";
import {
  PRODUCT_CATEGORIES,
  getCategoryName,
  checkCompatibility,
} from "../../lib/compatibilityRules";
import type { ProductCategory } from "../../lib/compatibilityRules";

export default function CompatibilityChecker() {
  const [selected, setSelected] = useState<ProductCategory[]>([]);

  const toggleCategory = (cat: ProductCategory) => {
    if (selected.includes(cat)) {
      setSelected(selected.filter((c) => c !== cat));
    } else {
      if (selected.length >= 5) {
        alert("તમે વધુમાં વધુ ૫ ઉત્પાદનો પસંદ કરી શકો છો.");
        return;
      }
      setSelected([...selected, cat]);
    }
  };

  const results = checkCompatibility(selected);

  return (
    <>
      <TopBar title="દવા મિશ્રણ ચેકર" />
      <Screen withNav={false}>
        <div className="mb-5">
          <p className="text-[14px] text-[var(--color-ink-faint)] leading-snug">
            બે કે તેથી વધુ ખાતર અથવા દવાઓનું મિશ્રણ સુરક્ષિત છે કે નહીં તે જાણવા નીચેથી પસંદ કરો. (મહત્તમ ૫)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {PRODUCT_CATEGORIES.map((cat) => {
            const isSelected = selected.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`p-3 rounded-[var(--radius-card)] border text-left transition-colors flex items-start gap-2 ${
                  isSelected
                    ? "bg-[var(--color-saffron-100)] border-[var(--color-saffron-400)]"
                    : "bg-[var(--color-surface)] border-[var(--color-border)]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors ${
                    isSelected
                      ? "bg-[var(--color-saffron-500)] border-[var(--color-saffron-500)] text-white"
                      : "border-[var(--color-ink-faint)] bg-transparent"
                  }`}
                >
                  {isSelected && <CheckCircleIcon size={14} strokeWidth={3} />}
                </div>
                <span
                  className={`text-[14px] font-semibold leading-tight ${
                    isSelected ? "text-[var(--color-saffron-600)]" : "text-[var(--color-ink)]"
                  }`}
                >
                  {getCategoryName(cat)}
                </span>
              </button>
            );
          })}
        </div>

        {selected.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[14px] font-semibold text-[var(--color-ink)] mb-3">પસંદ કરેલ ({selected.length}/5)</h2>
            <div className="flex flex-wrap gap-2">
              {selected.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[13px] font-medium text-[var(--color-ink)]"
                >
                  {getCategoryName(cat)}
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--color-paper-dim)] text-[var(--color-ink-faint)] ml-1"
                  >
                    <CloseIcon size={12} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {selected.length >= 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-[16px] font-bold text-[var(--color-ink)] mb-3">પરિણામ</h2>
            <div
              className={`rounded-[var(--radius-card)] p-5 border ${
                results.status === "Compatible"
                  ? "bg-[var(--color-crop-50)] border-[var(--color-crop-400)]"
                  : results.status === "Use Separately"
                  ? "bg-[var(--color-saffron-100)] border-[var(--color-saffron-400)]"
                  : "bg-[var(--color-loss-100)] border-[var(--color-loss-400)]"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    results.status === "Compatible"
                      ? "bg-[var(--color-crop-500)] text-white"
                      : results.status === "Use Separately"
                      ? "bg-[var(--color-saffron-500)] text-white"
                      : "bg-[var(--color-loss-500)] text-white"
                  }`}
                >
                  {results.status === "Compatible" ? (
                    <CheckCircleIcon size={28} />
                  ) : results.status === "Use Separately" ? (
                    <WarningIcon size={26} />
                  ) : (
                    <ShieldAlertIcon size={26} />
                  )}
                </div>
                <div>
                  <h3
                    className={`text-[20px] font-bold ${
                      results.status === "Compatible"
                        ? "text-[var(--color-crop-600)]"
                        : results.status === "Use Separately"
                        ? "text-[var(--color-saffron-600)]"
                        : "text-[var(--color-loss-600)]"
                    }`}
                  >
                    {results.status === "Compatible"
                      ? "મિશ્રણ કરી શકાય"
                      : results.status === "Use Separately"
                      ? "અલગ વાપરવું હિતાવહ"
                      : "મિશ્રણ કરશો નહીં"}
                  </h3>
                </div>
              </div>

              {results.conflicts.length > 0 && (
                <div className="mb-4">
                  <p className="text-[13px] font-semibold text-[var(--color-ink)] mb-2">જોખમી મિશ્રણ:</p>
                  <ul className="space-y-1">
                    {results.conflicts.map((conflict, i) => (
                      <li key={i} className="text-[13px] text-[var(--color-loss-600)] flex items-start gap-1.5">
                        <span className="mt-0.5">•</span> {conflict}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.warnings.length > 0 && (
                <div>
                  <p className="text-[13px] font-semibold text-[var(--color-ink)] mb-2">ધ્યાનમાં રાખો:</p>
                  <ul className="space-y-1.5">
                    {results.warnings.map((warning, i) => (
                      <li key={i} className="text-[13.5px] text-[var(--color-ink-soft)] leading-snug flex items-start gap-1.5">
                        <span className="mt-0.5 opacity-60">•</span> {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </Screen>
    </>
  );
}

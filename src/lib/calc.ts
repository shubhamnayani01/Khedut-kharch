import type { Expense, ExpenseCategory, FarmingSeason } from "../types";
import { EXPENSE_CATEGORIES } from "../types";

export function totalExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function categoryTotals(expenses: Expense[]): { category: ExpenseCategory; label: string; total: number }[] {
  const map = new Map<ExpenseCategory, number>();
  for (const e of expenses) map.set(e.category, (map.get(e.category) || 0) + e.amount);
  return EXPENSE_CATEGORIES.filter((c) => (map.get(c.id) || 0) > 0)
    .map((c) => ({ category: c.id, label: c.label, total: map.get(c.id) || 0 }))
    .sort((a, b) => b.total - a.total);
}

export function seasonIncome(season: FarmingSeason): number {
  if (!season.harvest) return 0;
  return season.harvest.totalProductionKg * season.harvest.sellingPricePerKg + (season.harvest.otherIncome || 0);
}

export function seasonProfit(season: FarmingSeason, expenses: Expense[]): number {
  return seasonIncome(season) - totalExpenses(expenses);
}

export function profitPercentage(season: FarmingSeason, expenses: Expense[]): number {
  const exp = totalExpenses(expenses);
  if (exp <= 0) return 0;
  return (seasonProfit(season, expenses) / exp) * 100;
}

export function monthlyExpenseSeries(expenses: Expense[]): { key: string; label: string; total: number }[] {
  const map = new Map<string, number>();
  for (const e of expenses) {
    const key = e.date.slice(0, 7); // yyyy-mm
    map.set(key, (map.get(key) || 0) + e.amount);
  }
  const GU_MONTHS_SHORT = ["જાન્યુ", "ફેબ્રુ", "માર્ચ", "એપ્રિ", "મે", "જૂન", "જુલા", "ઓગ", "સપ્ટે", "ઓક્ટો", "નવે", "ડિસે"];
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([key, total]) => {
      const [, m] = key.split("-");
      return { key, label: GU_MONTHS_SHORT[Number(m) - 1] || key, total };
    });
}

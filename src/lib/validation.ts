import { z } from "zod";

export const seasonSchema = z.object({
  cropName: z.string().trim().min(1, "પાકનું નામ જરૂરી છે").max(60),
  fieldName: z.string().trim().min(1, "ખેતર / ગામનું નામ જરૂરી છે").max(60),
  areaLabel: z.string().trim().max(40).optional(),
  sowingDate: z.string().min(1, "વાવણી તારીખ જરૂરી છે"),
  notes: z.string().trim().max(500).optional(),
  colorTag: z.string().min(1),
});
export type SeasonFormValues = z.infer<typeof seasonSchema>;

export const EXPENSE_CATEGORY_VALUES = [
  "seed",
  "fertilizer",
  "pesticide",
  "diesel",
  "labor",
  "irrigation",
  "transport",
  "rent",
  "electricity",
  "other",
] as const;

export const expenseSchema = z.object({
  date: z.string().min(1, "તારીખ જરૂરી છે"),
  category: z.enum(EXPENSE_CATEGORY_VALUES, { message: "કેટેગરી પસંદ કરો" }),
  amount: z.coerce.number({ message: "રકમ દાખલ કરો" }).positive("રકમ 0 કરતાં વધુ હોવી જોઈએ"),
  description: z.string().trim().max(200).optional(),
});
export type ExpenseFormInput = z.input<typeof expenseSchema>;
export type ExpenseFormValues = z.output<typeof expenseSchema>;

export const harvestSchema = z.object({
  harvestDate: z.string().min(1, "કાપણી તારીખ જરૂરી છે"),
  totalProductionKg: z.coerce.number({ message: "ઉત્પાદન દાખલ કરો" }).nonnegative(),
  sellingPricePerKg: z.coerce.number({ message: "ભાવ દાખલ કરો" }).nonnegative(),
  otherIncome: z.coerce.number().nonnegative().optional().default(0),
});
export type HarvestFormInput = z.input<typeof harvestSchema>;
export type HarvestFormValues = z.output<typeof harvestSchema>;

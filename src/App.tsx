import { Suspense, lazy } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AppDataProvider } from "./context/AppDataContext";
import { ToastProvider } from "./context/ToastContext";
import Dashboard from "./pages/Dashboard";
import NewSeason from "./pages/NewSeason";
import CropDetails from "./pages/CropDetails";
import AddExpense from "./pages/AddExpense";
import ExpenseHistory from "./pages/ExpenseHistory";
import Harvest from "./pages/Harvest";
import Report from "./pages/Report";
import Settings from "./pages/Settings";

const Statistics = lazy(() => import("./pages/Statistics"));

export default function App() {
  return (
    <AppDataProvider>
      <ToastProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-season" element={<NewSeason />} />
            <Route path="/crop/:id" element={<CropDetails />} />
            <Route path="/crop/:id/edit" element={<NewSeason />} />
            <Route path="/crop/:id/expense/new" element={<AddExpense />} />
            <Route path="/crop/:id/expense/:expenseId/edit" element={<AddExpense />} />
            <Route path="/crop/:id/expenses" element={<ExpenseHistory />} />
            <Route path="/crop/:id/harvest" element={<Harvest />} />
            <Route path="/crop/:id/report" element={<Report />} />
            <Route
              path="/statistics"
              element={
                <Suspense fallback={<div className="flex-1 flex items-center justify-center text-[var(--color-ink-faint)] text-sm">લોડ થાય છે...</div>}>
                  <Statistics />
                </Suspense>
              }
            />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </HashRouter>
      </ToastProvider>
    </AppDataProvider>
  );
}

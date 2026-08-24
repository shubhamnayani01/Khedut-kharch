import { Suspense, lazy } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppDataProvider } from "./context/AppDataContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthGuard } from "./components/guards/AuthGuard";
import { AdminGuard } from "./components/guards/AdminGuard";
import Dashboard from "./pages/Dashboard";
import NewSeason from "./pages/NewSeason";
import CropDetails from "./pages/CropDetails";
import AddExpense from "./pages/AddExpense";
import ExpenseHistory from "./pages/ExpenseHistory";
import Harvest from "./pages/Harvest";
import Report from "./pages/Report";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import MembershipPayment from "./pages/membership/MembershipPayment";
import MembershipPending from "./pages/membership/MembershipPending";
import MembershipExpired from "./pages/membership/MembershipExpired";
import AdminPanel from "./pages/admin/AdminPanel";
import Wallet from "./pages/wallet/Wallet";
import UploadDocument from "./pages/wallet/UploadDocument";
import CompatibilityChecker from "./pages/compatibility/CompatibilityChecker";
import ExpensesTab from "./pages/expenses/ExpensesTab";
import WorkersTab from "./pages/workers/WorkersTab";
import AddWorkerRecord from "./pages/workers/AddWorkerRecord";
import BhaagidarTab from "./pages/bhaagidar/BhaagidarTab";
import AddBhaagidar from "./pages/bhaagidar/AddBhaagidar";
import BhaagidarDetails from "./pages/bhaagidar/BhaagidarDetails";
import MoreMenu from "./pages/MoreMenu";

const Statistics = lazy(() => import("./pages/Statistics"));

const LoadingSpinner = () => (
  <div
    style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      background: "var(--color-paper)",
    }}
  >
    <div
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        border: "2px solid var(--color-crop-500)",
        borderTopColor: "transparent",
        animation: "spin 0.8s linear infinite",
      }}
    />
    <p style={{ fontSize: "14px", color: "var(--color-ink-faint)" }}>લોડ થઈ રહ્યું છે...</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default function App() {
  return (
    <AppDataProvider>
      <ToastProvider>
        <HashRouter>
          <Routes>
            {/* ─── Public / Auth pages ─────────────────────────────── */}
            <Route path="/login" element={<Login />} />
            <Route path="/membership/payment" element={<MembershipPayment />} />
            <Route path="/membership/pending" element={<MembershipPending />} />
            <Route path="/membership/expired" element={<MembershipExpired />} />
            {/* Renewal reuses the payment page (it detects expired status) */}
            <Route path="/membership/renewal" element={<MembershipExpired />} />

            {/* ─── Admin (protected by AdminGuard) ─────────────────── */}
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminPanel />
                </AdminGuard>
              }
            />

            {/* ─── Protected app routes (require Active membership) ─── */}
            <Route
              path="/"
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              }
            />
            <Route
              path="/new-season"
              element={
                <AuthGuard>
                  <NewSeason />
                </AuthGuard>
              }
            />
            <Route
              path="/crop/:id"
              element={
                <AuthGuard>
                  <CropDetails />
                </AuthGuard>
              }
            />
            <Route
              path="/crop/:id/edit"
              element={
                <AuthGuard>
                  <NewSeason />
                </AuthGuard>
              }
            />
            <Route
              path="/crop/:id/expense/new"
              element={
                <AuthGuard>
                  <AddExpense />
                </AuthGuard>
              }
            />
            <Route
              path="/crop/:id/expense/:expenseId/edit"
              element={
                <AuthGuard>
                  <AddExpense />
                </AuthGuard>
              }
            />
            <Route
              path="/crop/:id/expenses"
              element={
                <AuthGuard>
                  <ExpenseHistory />
                </AuthGuard>
              }
            />
            <Route
              path="/crop/:id/harvest"
              element={
                <AuthGuard>
                  <Harvest />
                </AuthGuard>
              }
            />
            <Route
              path="/crop/:id/report"
              element={
                <AuthGuard>
                  <Report />
                </AuthGuard>
              }
            />
            <Route
              path="/statistics"
              element={
                <AuthGuard>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Statistics />
                  </Suspense>
                </AuthGuard>
              }
            />
            <Route
              path="/expenses"
              element={
                <AuthGuard>
                  <ExpensesTab />
                </AuthGuard>
              }
            />
            <Route
              path="/workers"
              element={
                <AuthGuard>
                  <WorkersTab />
                </AuthGuard>
              }
            />
            <Route
              path="/crop/:id/workers/new"
              element={
                <AuthGuard>
                  <AddWorkerRecord />
                </AuthGuard>
              }
            />
            <Route
              path="/crop/:id/workers/:workerId/edit"
              element={
                <AuthGuard>
                  <AddWorkerRecord />
                </AuthGuard>
              }
            />
            <Route
              path="/bhaagidar"
              element={
                <AuthGuard>
                  <BhaagidarTab />
                </AuthGuard>
              }
            />
            <Route
              path="/crop/:id/bhaagidar/new"
              element={
                <AuthGuard>
                  <AddBhaagidar />
                </AuthGuard>
              }
            />
            <Route
              path="/crop/:id/bhaagidar/:bhaagidarId"
              element={
                <AuthGuard>
                  <BhaagidarDetails />
                </AuthGuard>
              }
            />
            <Route
              path="/more"
              element={
                <AuthGuard>
                  <MoreMenu />
                </AuthGuard>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthGuard>
                  <Settings />
                </AuthGuard>
              }
            />
            <Route
              path="/wallet"
              element={
                <AuthGuard>
                  <Wallet />
                </AuthGuard>
              }
            />
            <Route
              path="/wallet/upload"
              element={
                <AuthGuard>
                  <UploadDocument />
                </AuthGuard>
              }
            />
            <Route
              path="/compatibility"
              element={
                <AuthGuard>
                  <CompatibilityChecker />
                </AuthGuard>
              }
            />

            {/* Catch-all → home (AuthGuard will redirect appropriately) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </ToastProvider>
    </AppDataProvider>
  );
}

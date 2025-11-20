import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import POSPage from "./pages/POSPage";
import { MembersPage } from "./pages/MembersPage";
import InventoryPage from "./pages/InventoryPage";
import PlansPage from "./pages/PlansPage";
import TransactionsPage from "./pages/TransactionsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CheckInPage from "./pages/CheckInPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import RoleManagementPage from "./pages/RoleManagementPage";
import ManualGiveawaysPage from "./pages/ManualGiveawaysPage";
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Toaster } from 'sonner';
import MemberProfilePage from './pages/MemberProfilePage';
import NotFound from './pages/NotFound';
import { SessionContextProvider } from './components/auth/SessionContextProvider';
import QueryProvider from './components/QueryProvider';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Toaster richColors position="top-right" />
      <QueryProvider>
        <SessionContextProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Public Route */}
              <Route path="/" element={<LoginPage />} />
              
              {/* Protected Routes (Staff/Owner/Member) */}
              <Route element={<ProtectedRoute />}>
                {/* Staff/Owner Routes */}
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/pos" element={<POSPage />} />
                <Route path="/check-in" element={<CheckInPage />} />
                <Route path="/members" element={<MembersPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/plans" element={<PlansPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/roles" element={<RoleManagementPage />} />
                <Route path="/manual-giveaways" element={<ManualGiveawaysPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                
                {/* Member-Only Route (Redirects staff/owner away) */}
                <Route path="/my-profile" element={<MemberProfilePage />} />
              </Route>
              
              {/* 404 Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </SessionContextProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;
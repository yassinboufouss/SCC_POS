import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes"; // Import ThemeProvider
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import POSPage from "./pages/POSPage";
import MembersPage from "./pages/MembersPage";
import InventoryPage from "./pages/InventoryPage";
import PlansPage from "./pages/PlansPage";
import CheckInPage from "./pages/CheckInPage";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import MemberProfilePage from "./pages/MemberProfilePage";
import RoleManagementPage from "./pages/RoleManagementPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import GiveawaysPage from "./pages/GiveawaysPage"; // Import GiveawaysPage
import { SessionContextProvider } from "./components/auth/SessionContextProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" attribute="class"> {/* Wrap with ThemeProvider */}
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <SessionContextProvider>
            <Routes>
              {/* Public Route (Login) */}
              <Route path="/" element={<LoginPage />} />
              
              {/* Protected Routes Group (Role-based redirection handled inside ProtectedRoute) */}
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
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/giveaways" element={<GiveawaysPage />} /> {/* NEW Route */}
                
                {/* Member Route (Accessible only by members, staff/owner redirected away) */}
                <Route path="/my-profile" element={<MemberProfilePage />} />
              </Route>
              
              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SessionContextProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
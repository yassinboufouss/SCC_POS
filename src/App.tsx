import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage"; // Use LoginPage instead of Index
import NotFound from "./pages/NotFound";
import POSPage from "./pages/POSPage";
import MembersPage from "./pages/MembersPage";
import InventoryPage from "./pages/InventoryPage";
import PlansPage from "./pages/PlansPage";
import CheckInPage from "./pages/CheckInPage";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import { SessionContextProvider } from "./components/auth/SessionContextProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute"; // Import ProtectedRoute

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <SessionContextProvider>
          <Routes>
            {/* Public Route (Login) */}
            <Route path="/" element={<LoginPage />} />
            
            {/* Protected Routes Group */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/pos" element={<POSPage />} />
              <Route path="/check-in" element={<CheckInPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/plans" element={<PlansPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
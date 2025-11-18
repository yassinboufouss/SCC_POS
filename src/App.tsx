import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import POSPage from "./pages/POSPage";
import MembersPage from "./pages/MembersPage";
import InventoryPage from "./pages/InventoryPage";
import PlansPage from "./pages/PlansPage";
import CheckInPage from "./pages/CheckInPage";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage"; // Import TransactionsPage

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Index />} />
          
          {/* Protected Routes (Wrapped in Layout in their respective files) */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pos" element={<POSPage />} />
          <Route path="/check-in" element={<CheckInPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/transactions" element={<TransactionsPage />} /> {/* New Transactions Route */}
          
          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
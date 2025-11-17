import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MainLayout from "@/layouts/MainLayout.tsx";
import Dashboard from "./pages/Dashboard";
import MembersPage from "@/pages/members/MembersPage.tsx";
import CheckInPage from "./pages/CheckInPage";
import ClassesPage from "./pages/ClassesPage";
import TrainersPage from "./pages/TrainersPage";
import InventoryPage from "./pages/InventoryPage";
import FinancePage from "./pages/FinancePage";
import SettingsPage from "./pages/SettingsPage";
import POSPage from "./pages/POSPage";
import MembershipPlansPage from "./pages/MembershipPlansPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Protected Routes using MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/members/*" element={<MembersPage />} />
            <Route path="/checkin" element={<CheckInPage />} />
            <Route path="/pos" element={<POSPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/trainers" element={<TrainersPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/plans" element={<MembershipPlansPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
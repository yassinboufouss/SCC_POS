import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import POSPage from "./pages/POSPage";
import { MembersPage } from "./pages/MembersPage"; // FIX: Changed to named import
import InventoryPage from "./pages/InventoryPage";
import PlansPage from "./pages/PlansPage";
import TransactionsPage from "./pages/TransactionsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CheckInPage from "./pages/CheckInPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import RoleManagementPage from "./pages/RoleManagementPage";
import GiveawayPage from "./pages/GiveawayPage";
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'sonner';

// ... (omitted code)
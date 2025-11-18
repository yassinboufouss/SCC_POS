import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, ShoppingCart, LogOut, Package, Ticket, QrCode, LayoutDashboard, History, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { useUserRole } from '@/hooks/use-user-role'; // Import role hook

const navItems = [
  { nameKey: 'dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['owner', 'manager', 'cashier'] },
  { nameKey: 'pos', href: '/pos', icon: ShoppingCart, roles: ['owner', 'cashier'] },
  { nameKey: 'check_in', href: '/check-in', icon: QrCode, roles: ['owner', 'manager', 'cashier'] },
  { nameKey: 'members', href: '/members', icon: Users, roles: ['owner', 'manager'] },
  { nameKey: 'inventory', href: '/inventory', icon: Package, roles: ['owner', 'manager'] },
  { nameKey: 'membership_plans', href: '/plans', icon: Ticket, roles: ['owner', 'manager'] },
  { nameKey: 'transactions', href: '/transactions', icon: History, roles: ['owner', 'manager', 'cashier'] },
  { nameKey: 'role_management', href: '/roles', icon: Shield, roles: ['owner'] }, // New role management link
];

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { role, isOwner } = useUserRole(); // Use role hook

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      showError(t('logout_failed'));
    } else {
      // Redirection handled by SessionContextProvider/ProtectedRoute, but navigate just in case
      navigate('/');
    }
  };
  
  const userRole = role || 'member';

  return (
    <div className="flex flex-col h-screen border-r bg-sidebar text-sidebar-foreground p-4 w-64 sticky top-0">
      <div className="text-2xl font-bold text-sidebar-primary mb-8">
        {t("app_title")}
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          // Check if the current user role is allowed to see this item
          if (!item.roles.includes(userRole)) {
              return null;
          }
          
          const Icon = item.icon;
          // Check if the current path starts with the item's href, handling '/' for dashboard
          const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold" : "text-sidebar-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {t(item.nameKey)}
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-4 border-t border-sidebar-border">
        <LanguageSwitcher />
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-400 transition-all hover:bg-red-900/20"
        >
          <LogOut className="h-5 w-5" />
          {t("logout")}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, ShoppingCart, LogOut, Package, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const navItems = [
  { nameKey: 'pos', href: '/pos', icon: ShoppingCart },
  { nameKey: 'members', href: '/members', icon: Users },
  { nameKey: 'inventory', href: '/inventory', icon: Package },
  { nameKey: 'membership_plans', href: '/plans', icon: Ticket },
];

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div className="flex flex-col h-screen border-r bg-sidebar text-sidebar-foreground p-4 w-64 sticky top-0">
      <div className="text-2xl font-bold text-sidebar-primary mb-8">
        {t("app_title")}
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.href);
          
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
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-red-400 transition-all hover:bg-red-900/20"
        >
          <LogOut className="h-5 w-5" />
          {t("logout")}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
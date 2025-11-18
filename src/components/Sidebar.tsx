import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  Calendar,
  Dumbbell,
  DollarSign,
  Package,
  Settings,
  LogIn,
  ShoppingCart,
  Ticket,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const navItems = [
  {
    nameKey: "dashboard",
    icon: Home,
    path: "/dashboard",
    roles: ["Admin", "Manager", "Receptionist", "Trainer"],
  },
  {
    nameKey: "members",
    icon: Users,
    path: "/members",
    roles: ["Admin", "Manager", "Receptionist"],
  },
  {
    nameKey: "check_in",
    icon: LogIn,
    path: "/checkin",
    roles: ["Admin", "Receptionist"],
  },
  {
    nameKey: "pos",
    icon: ShoppingCart,
    path: "/pos",
    roles: ["Admin", "Manager", "Receptionist"],
  },
  {
    nameKey: "classes",
    icon: Calendar,
    path: "/classes",
    roles: ["Admin", "Manager", "Trainer"],
  },
  {
    nameKey: "trainers",
    icon: Dumbbell,
    path: "/trainers",
    roles: ["Admin", "Manager"],
  },
  {
    nameKey: "inventory",
    icon: Package,
    path: "/inventory",
    roles: ["Admin", "Manager"],
  },
  {
    nameKey: "membership_plans",
    icon: Ticket,
    path: "/plans",
    roles: ["Admin", "Manager"],
  },
  {
    nameKey: "finance_reports",
    icon: DollarSign,
    path: "/finance",
    roles: ["Admin", "Manager"],
  },
  {
    nameKey: "settings",
    icon: Settings,
    path: "/settings",
    roles: ["Admin"],
  },
];

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  // Placeholder for current user role (assuming Admin for full view initially)
  const currentUserRole = "Admin"; 

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(currentUserRole)
  );
  
  const handleLogout = () => {
    // In a real app, this would clear auth tokens/session state
    console.log("User logged out.");
    navigate("/");
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full border-r bg-sidebar w-64 p-4 transition-all duration-300",
        className
      )}
    >
      <div className="mb-8 text-2xl font-bold text-sidebar-primary">
        {t("app_title")}
      </div>
      <nav className="flex flex-col space-y-1">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.nameKey}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {t(item.nameKey)}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-sidebar-border space-y-2">
        <LanguageSwitcher />
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={handleLogout}
        >
          {t("logout")}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
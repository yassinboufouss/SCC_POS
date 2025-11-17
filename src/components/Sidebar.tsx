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
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    name: "Dashboard",
    icon: Home,
    path: "/dashboard",
    roles: ["Admin", "Manager", "Receptionist", "Trainer"],
  },
  {
    name: "Members",
    icon: Users,
    path: "/members",
    roles: ["Admin", "Manager", "Receptionist"],
  },
  {
    name: "Check-In",
    icon: LogIn,
    path: "/checkin",
    roles: ["Admin", "Receptionist"],
  },
  {
    name: "POS", // New Item
    icon: ShoppingCart,
    path: "/pos",
    roles: ["Admin", "Manager", "Receptionist"],
  },
  {
    name: "Classes",
    icon: Calendar,
    path: "/classes",
    roles: ["Admin", "Manager", "Trainer"],
  },
  {
    name: "Trainers",
    icon: Dumbbell,
    path: "/trainers",
    roles: ["Admin", "Manager"],
  },
  {
    name: "Inventory",
    icon: Package,
    path: "/inventory",
    roles: ["Admin", "Manager"],
  },
  {
    name: "Finance & Reports",
    icon: DollarSign,
    path: "/finance",
    roles: ["Admin", "Manager"],
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/settings",
    roles: ["Admin"],
  },
];

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  // Placeholder for current user role (assuming Admin for full view initially)
  const currentUserRole = "Admin"; 

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(currentUserRole)
  );

  return (
    <div
      className={cn(
        "flex flex-col h-full border-r bg-sidebar w-64 p-4 transition-all duration-300",
        className
      )}
    >
      <div className="mb-8 text-2xl font-bold text-sidebar-primary">
        Gym POS
      </div>
      <nav className="flex flex-col space-y-1">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-sidebar-border">
        {/* Placeholder for User Profile/Logout */}
        <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
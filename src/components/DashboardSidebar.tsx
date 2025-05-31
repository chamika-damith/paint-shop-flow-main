import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Package, FileText, DollarSign, Users, Settings, LogOut, Menu, X, Truck } from "lucide-react";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <Button
    variant="ghost"
    className={cn(
      "w-full justify-start gap-2 sidebar-item",
      active ? "bg-primary/10 text-primary font-medium" : "hover:bg-primary/5"
    )}
    onClick={onClick}
  >
    <Icon size={18} />
    <span>{label}</span>
  </Button>
);

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/inventory", label: "Inventory", icon: Package },
    { path: "/billing", label: "Billing", icon: FileText },
    { path: "/finances", label: "Finances", icon: DollarSign },
    { path: "/suppliers", label: "Suppliers", icon: Truck },
    { path: "/customers", label: "Customers", icon: Users },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className={cn(
      "h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 flex flex-col transition-all duration-300 border-r border-gray-700 relative",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Collapse button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute -right-3 top-8 z-10 rounded-full bg-gray-800 border border-gray-700 hover:bg-gray-700"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <Menu size={16} /> : <X size={16} />}
      </Button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8 mt-4">
        <div className="h-8 w-8 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
          NT
        </div>
        {!collapsed && (
          <div className="font-semibold text-lg">Colour House</div>
        )}
      </div>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={collapsed ? "" : item.label}
            path={item.path}
            active={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          />
        ))}
      </nav>

      {/* Logout button */}
      <Button
        variant="ghost"
        className="w-full justify-start gap-2 mt-auto text-gray-300 hover:text-white hover:bg-red-500/10"
        onClick={logout}
      >
        <LogOut size={18} />
        {!collapsed && <span>Logout</span>}
      </Button>
    </div>
  );
};

export default DashboardSidebar;

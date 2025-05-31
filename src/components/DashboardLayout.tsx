import { ReactNode } from "react";
import DashboardSidebar from "./DashboardSidebar";
import { ThemeToggle } from "./ThemeToggle";
import { Home, Package, Truck, Users, Receipt, Bell, Settings } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Package,
  },
  {
    title: "Suppliers",
    href: "/suppliers",
    icon: Truck,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Billing",
    href: "/billing",
    icon: Receipt,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="flex justify-between items-center p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h1 className="text-2xl font-bold text-primary">NT Colour House</h1>
          <ThemeToggle />
        </div>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

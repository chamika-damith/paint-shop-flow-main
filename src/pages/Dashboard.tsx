import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, Layers, ShoppingCart, DollarSign, TrendingUp, Users,
  AlertTriangle, Calendar 
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchInventory } from "@/redux/slices/inventorySlice";
import { inventoryApi } from "@/api/inventoryApi";
import { billingApi } from "@/api/billingApi";
import { InventoryItem, Invoice } from "@/types";

interface SalesData {
  name: string;
  amount: number;
}

interface InventoryChartData {
  name: string;
  value: number;
}

interface LowStockItem {
  id: number;
  name: string;
  stock: number;
  reorderLevel: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  date: string;
  amount: string;
  status: string;
}

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const inventory = useAppSelector((state) => state.inventory.items);
  
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryChartData[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlySales, setMonthlySales] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch inventory data
        await dispatch(fetchInventory()).unwrap();
        
        // Fetch sales data for the last 6 months
        const today = new Date();
        const salesPromises = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(today.getMonth() - i);
          const monthName = date.toLocaleString('default', { month: 'short' });
          return billingApi.getAllInvoices().then(response => {
            const monthlyTotal = response.data
              .filter(invoice => new Date(invoice.date).getMonth() === date.getMonth())
              .reduce((sum, invoice) => sum + invoice.amount, 0);
            return { name: monthName, amount: monthlyTotal };
          });
        });
        
        const salesResults = await Promise.all(salesPromises);
        setSalesData(salesResults.reverse());
        
        // Calculate monthly sales (current month)
        setMonthlySales(salesResults[salesResults.length - 1].amount);
        
        // Calculate total revenue (sum of all months)
        setTotalRevenue(salesResults.reduce((sum, month) => sum + month.amount, 0));
        
        // Get recent orders
        const invoices = await billingApi.getAllInvoices();
        const recentInvoices = invoices.data
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3)
          .map(invoice => ({
            id: invoice.id,
            customer: invoice.customer,
            date: new Date(invoice.date).toISOString().split('T')[0],
            amount: `$${invoice.amount.toFixed(2)}`,
            status: invoice.status
          }));
        setRecentOrders(recentInvoices);
        
        // Count active orders
        setActiveOrders(invoices.data.filter(invoice => invoice.status === 'Pending').length);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [dispatch]);

  // Process inventory data whenever inventory state changes
  useEffect(() => {
    if (inventory.length > 0) {
      // Group inventory by category
      const categoryGroups = inventory.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.quantity;
        return acc;
      }, {} as Record<string, number>);

      // Convert to chart data format
      const chartData = Object.entries(categoryGroups).map(([name, value]) => ({
        name,
        value
      }));
      setInventoryData(chartData);

      // Find low stock items
      const lowStock = inventory
        .filter(item => item.status === 'Low Stock')
        .map(item => ({
          id: item.id,
          name: item.name,
          stock: item.quantity,
          reorderLevel: 10 // This should come from your business logic or item configuration
        }))
        .slice(0, 3);
      setLowStockItems(lowStock);
    }
  }, [inventory]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">NT Color House Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your NT Colour House management system</p>
          </div>
          <p className="text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Inventory" 
            value={`${inventory.reduce((sum, item) => sum + item.quantity, 0)} items`}
            icon={Package} 
            description={`Across ${inventoryData.length} categories`}
            colorClass="from-blue-500 to-cyan-400"
          />
          <StatCard 
            title="Monthly Sales" 
            value={`$${monthlySales.toFixed(2)}`}
            icon={ShoppingCart} 
            change={8.2}
            colorClass="from-green-400 to-emerald-600"
          />
          <StatCard 
            title="Active Orders" 
            value={activeOrders.toString()}
            icon={Layers} 
            description={`${activeOrders} pending delivery`}
            colorClass="from-amber-400 to-orange-500"
          />
          <StatCard 
            title="Revenue" 
            value={`$${totalRevenue.toFixed(2)}`}
            icon={DollarSign} 
            change={-2.4}
            colorClass="from-purple-500 to-pink-500"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <Card className="paint-card">
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
              <CardDescription>Monthly sales performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    activeDot={{ r: 8 }} 
                    name="Sales ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Inventory Chart */}
          <Card className="paint-card">
            <CardHeader>
              <CardTitle>Inventory Distribution</CardTitle>
              <CardDescription>Items by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={inventoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8b5cf6" name="Items" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Lower section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alerts */}
          <Card className="paint-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Low Stock Alerts
                </CardTitle>
                <CardDescription>Items that need reordering</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockItems.map(item => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-md"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        Current stock: <span className="text-red-600 font-medium">{item.stock}</span> / 
                        Reorder at: <span className="font-medium">{item.reorderLevel}</span>
                      </p>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Reorder
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="paint-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Recent Orders
                </CardTitle>
                <CardDescription>Latest customer purchases</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div 
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{order.id}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'Paid' ? 'bg-green-100 text-green-800' :
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {order.customer} · {order.date}
                      </p>
                    </div>
                    <p className="font-medium">{order.amount}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

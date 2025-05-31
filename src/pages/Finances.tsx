import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, ChevronDown, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatCard from "@/components/StatCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";
import { billingApi } from "@/api/billingApi";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

interface FinancialData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ExpenseCategory {
  name: string;
  value: number;
}

const Finances = () => {
  const [period, setPeriod] = useState("6months");
  const [revenueData, setRevenueData] = useState<FinancialData[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [revenueChange, setRevenueChange] = useState(0);
  const [expenseChange, setExpenseChange] = useState(0);
  const [profitChange, setProfitChange] = useState(0);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        // Get all invoices
        const invoicesResponse = await billingApi.getAllInvoices();
        const invoices = invoicesResponse.data;

        // Calculate monthly data for the last 6 months
        const today = new Date();
        const monthlyData: FinancialData[] = [];
        let totalRev = 0;
        let totalExp = 0;

        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(today.getMonth() - i);
          const monthName = date.toLocaleString('default', { month: 'short' });
          
          // Filter invoices for current month
          const monthInvoices = invoices.filter(invoice => {
            const invDate = new Date(invoice.date);
            return invDate.getMonth() === date.getMonth() && 
                   invDate.getFullYear() === date.getFullYear();
          });

          // Calculate revenue and expenses for the month
          const monthRevenue = monthInvoices.reduce((sum, inv) => sum + inv.amount, 0);
          const monthExpenses = monthInvoices.reduce((sum, inv) => {
            return sum + (inv.items.reduce((itemSum, item) => 
              itemSum + (item.price * item.quantity), 0) * 0.7); // Assuming 70% of price is cost
          }, 0);

          totalRev += monthRevenue;
          totalExp += monthExpenses;

          monthlyData.push({
            month: monthName,
            revenue: monthRevenue,
            expenses: monthExpenses,
            profit: monthRevenue - monthExpenses
          });
        }

        // Calculate expense categories
        const categories: { [key: string]: number } = {};
        invoices.forEach(invoice => {
          invoice.items.forEach(item => {
            const itemCost = item.price * item.quantity * 0.7; // Assuming 70% of price is cost
            const category = 'Inventory'; // Default category since we don't have categories in items
            categories[category] = (categories[category] || 0) + itemCost;
          });
        });

        // Add some fixed expense categories
        categories['Rent'] = totalExp * 0.15; // Assuming 15% of expenses is rent
        categories['Utilities'] = totalExp * 0.05; // Assuming 5% of expenses is utilities
        categories['Salaries'] = totalExp * 0.25; // Assuming 25% of expenses is salaries
        categories['Marketing'] = totalExp * 0.05; // Assuming 5% of expenses is marketing

        const expCategories = Object.entries(categories).map(([name, value]) => ({
          name,
          value: Math.round((value / totalExp) * 100)
        }));

        // Calculate changes (comparing last month with previous month)
        const lastMonth = monthlyData[monthlyData.length - 1];
        const prevMonth = monthlyData[monthlyData.length - 2];
        
        setRevenueChange(((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100);
        setExpenseChange(((lastMonth.expenses - prevMonth.expenses) / prevMonth.expenses) * 100);
        setProfitChange(((lastMonth.profit - prevMonth.profit) / prevMonth.profit) * 100);

        // Update state
        setRevenueData(monthlyData);
        setExpenseCategories(expCategories);
        setTotalRevenue(totalRev);
        setTotalExpenses(totalExp);
        setTotalProfit(totalRev - totalExp);
      } catch (error) {
        console.error('Error fetching financial data:', error);
      }
    };

    fetchFinancialData();
  }, [period]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <DollarSign className="mr-2" /> Financial Management
            </h1>
            <p className="text-gray-500 mt-1">
              Track your business finances and performance
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Select Date Range
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Reports
            </Button>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Total Revenue" 
            value={`$${totalRevenue.toLocaleString()}`}
            icon={DollarSign} 
            change={revenueChange}
            colorClass="from-blue-500 to-blue-700"
          />
          <StatCard 
            title="Total Expenses" 
            value={`$${totalExpenses.toLocaleString()}`}
            icon={ChevronDown} 
            change={expenseChange}
            colorClass="from-red-500 to-red-700"
          />
          <StatCard 
            title="Net Profit" 
            value={`$${totalProfit.toLocaleString()}`}
            icon={TrendingUp} 
            change={profitChange}
            colorClass="from-green-500 to-green-700"
          />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4 space-y-6">
            <Card className="paint-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <div>
                    <CardTitle>Financial Performance</CardTitle>
                    <CardDescription>Revenue, expenses and profit over time</CardDescription>
                  </div>
                  <Select 
                    value={period} 
                    onValueChange={setPeriod}
                  >
                    <SelectTrigger className="w-[180px] mt-2 sm:mt-0">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3months">Last 3 Months</SelectItem>
                      <SelectItem value="6months">Last 6 Months</SelectItem>
                      <SelectItem value="1year">Last Year</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      name="Revenue"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Expenses" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Profit" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="paint-card">
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                  <CardDescription>Monthly revenue distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="paint-card">
                <CardHeader>
                  <CardTitle>Expense Categories</CardTitle>
                  <CardDescription>Distribution of business expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={expenseCategories}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {expenseCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="income" className="mt-4">
            <Card className="paint-card">
              <CardHeader>
                <CardTitle>Income Details</CardTitle>
                <CardDescription>
                  Detailed analysis of your business income sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">
                  Income analysis details will be shown here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="expenses" className="mt-4">
            <Card className="paint-card">
              <CardHeader>
                <CardTitle>Expense Details</CardTitle>
                <CardDescription>
                  Track and analyze your business expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">
                  Expense analysis details will be shown here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Finances;

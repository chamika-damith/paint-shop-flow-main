import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./components/ThemeProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import AddItem from "./pages/AddItem";
import Billing from "./pages/Billing";
import CreateInvoice from "./pages/CreateInvoice";
import Finances from "./pages/Finances";
import Suppliers from "./pages/Suppliers";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import AddSupplier from "./pages/AddSupplier";
import Notifications from "./pages/Notifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="nt-color-house-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/inventory" 
                element={
                  <ProtectedRoute>
                    <Inventory />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/inventory/add" 
                element={
                  <ProtectedRoute>
                    <AddItem />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/inventory/edit/:id" 
                element={
                  <ProtectedRoute>
                    <AddItem />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/products" 
                element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/billing" 
                element={
                  <ProtectedRoute>
                    <Billing />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/billing/create-invoice" 
                element={
                  <ProtectedRoute>
                    <CreateInvoice />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/billing/edit/:id" 
                element={
                  <ProtectedRoute>
                    <CreateInvoice />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/finances" 
                element={
                  <ProtectedRoute>
                    <Finances />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/suppliers" 
                element={
                  <ProtectedRoute>
                    <Suppliers />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/suppliers/add" 
                element={
                  <ProtectedRoute>
                    <AddSupplier />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/suppliers/edit/:id" 
                element={
                  <ProtectedRoute>
                    <AddSupplier />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/customers" 
                element={
                  <ProtectedRoute>
                    <Customers />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

import { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';

// Default admin credentials - in a real app, these would be stored securely
const DEFAULT_ADMIN = {
  username: "admin",
  password: "admin123"
};

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('paintShopUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check for default admin login on frontend (for demo/dev only)
      if (email === 'admin@paintshop.com' && password === 'admin123') {
        const adminUser = {
          id: 'admin',
          email: 'admin@paintshop.com',
          name: 'Admin',
          isAdmin: true,
        };
        setUser(adminUser);
        localStorage.setItem('paintShopUser', JSON.stringify(adminUser));
        localStorage.setItem('paintShopToken', 'admin-token');
        toast({
          title: 'Admin Login Successful',
          description: 'Welcome, Admin!',
        });
        return true;
      }
      // Otherwise, call backend for customer login
      const res = await axios.post('/api/customers/login', { email, password });
      const { token, customer } = res.data;
      setUser(customer);
      localStorage.setItem('paintShopUser', JSON.stringify(customer));
      localStorage.setItem('paintShopToken', token);
      toast({
        title: 'Login Successful',
        description: 'Welcome to Paint Shop Management System',
      });
      return true;
    } catch (err: any) {
      toast({
        title: 'Login Failed',
        description: err.response?.data?.message || 'Invalid email or password',
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('paintShopUser');
    localStorage.removeItem('paintShopToken');
    navigate('/login');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

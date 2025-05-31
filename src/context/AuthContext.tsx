
import { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

// Default admin credentials - in a real app, these would be stored securely
const DEFAULT_ADMIN = {
  username: "admin",
  password: "admin123"
};

interface User {
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
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

  const login = async (username: string, password: string): Promise<boolean> => {
    // In a real app, you would validate against a backend API
    if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
      const user = { username };
      setUser(user);
      localStorage.setItem('paintShopUser', JSON.stringify(user));
      toast({
        title: "Login Successful",
        description: "Welcome to Paint Shop Management System",
      });
      return true;
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('paintShopUser');
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

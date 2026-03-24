import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import type { User, UserRole } from '../data/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check local storage on mount
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      const email = localStorage.getItem('userEmail') || '';
      const role = (localStorage.getItem('userRole') as UserRole) || 'EPA_ADMIN';
      const companyId = localStorage.getItem('userCompanyId') || undefined;
      setUser({ email, role, companyId });
    }
  }, []);

  const login = (email: string) => {
    setIsAuthenticated(true);
    let role: UserRole = 'EPA_ADMIN';
    let companyId: string | undefined;

    if (email.toLowerCase() === 'admin@oilcompany.com' || email.toLowerCase() === 'admin@oilcomapny.com') {
      role = 'OIL_COMPANY_ADMIN';
      companyId = 'oc-noc'; // hardcoded default oil company ID for testing
    }

    const newUser: User = { email, role, companyId };
    setUser(newUser);

    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
    if (companyId) {
      localStorage.setItem('userCompanyId', companyId);
    } else {
      localStorage.removeItem('userCompanyId');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userCompanyId');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

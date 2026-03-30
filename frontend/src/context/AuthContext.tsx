import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import type { User, UserRole } from '../data/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (backendUser: any, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check local storage on mount
    const token = localStorage.getItem('authToken');
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true' && token) {
      setIsAuthenticated(true);
      const email = localStorage.getItem('userEmail') || '';
      const role = (localStorage.getItem('userRole') as UserRole) || 'EPA_ADMIN';
      const companyId = localStorage.getItem('userCompanyId') || undefined;
      setUser({ email, role, companyId });
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  // Update login to accept real user object and token instead of faking logic
  const login = (backendUser: any, token: string) => {
    setIsAuthenticated(true);
    
    // Map backend roles to frontend types
    const role: UserRole = backendUser.role === 'epa_admin' ? 'EPA_ADMIN' : 'OIL_COMPANY_ADMIN';
    const companyId = backendUser.company_id ? backendUser.company_id.toString() : undefined;
    const email = backendUser.email;

    const newUser: User = { email, role, companyId };
    setUser(newUser);

    localStorage.setItem('authToken', token);
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userCompanyId');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login: login as any, logout }}>
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

import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import type { User, UserRole } from '../data/types';
import api from '../api/axios';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (backendUser: any, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get initial state from localStorage
const getInitialAuthState = () => {
  const token = localStorage.getItem('authToken');
  const storedAuth = localStorage.getItem('isAuthenticated');
  if (storedAuth === 'true' && token) {
    const email = localStorage.getItem('userEmail') || '';
    const role = (localStorage.getItem('userRole') as UserRole) || 'EPA_ADMIN';
    const companyId = localStorage.getItem('userCompanyId') || undefined;
    return { isAuthenticated: true, user: { email, role, companyId } as User };
  }
  return { isAuthenticated: false, user: null };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState(getInitialAuthState());

  useEffect(() => {
    // Verify token on mount if we think we're authenticated
    if (authState.isAuthenticated) {
      api.get('/auth/me')
        .then(response => {
          // Token is valid, update user info just in case
          const backendUser = response.data;
          const rawRole = (backendUser.role || '').toUpperCase();
          const role: UserRole = rawRole.includes('EPA') ? 'EPA_ADMIN' : 'OIL_COMPANY_ADMIN';
          const companyId = backendUser.company_id ? backendUser.company_id.toString() : undefined;
          setAuthState({
            isAuthenticated: true,
            user: { email: backendUser.email, role, companyId }
          });
        })
        .catch(() => {
          // Token is invalid or expired
          logout();
        });
    }
  }, []);

  const login = (backendUser: any, token: string) => {
    // Map backend roles to frontend types
    const rawRole = (backendUser.role || '').toUpperCase();
    const role: UserRole = rawRole.includes('EPA') ? 'EPA_ADMIN' : 'OIL_COMPANY_ADMIN';
    const companyId = backendUser.company_id ? backendUser.company_id.toString() : undefined;
    const email = backendUser.email;

    const newUser: User = { email, role, companyId };

    localStorage.setItem('authToken', token);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
    if (companyId) {
      localStorage.setItem('userCompanyId', companyId);
    } else {
      localStorage.removeItem('userCompanyId');
    }

    setAuthState({ isAuthenticated: true, user: newUser });
  };

  const logout = () => {
    // Optionally call backend logout (non-blocking)
    api.post('/auth/logout').catch(() => { });

    setAuthState({ isAuthenticated: false, user: null });
    localStorage.clear();
    // Use window.location the simple way if needed, or just state update
    // window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: authState.isAuthenticated,
      user: authState.user,
      login: login as any,
      logout
    }}>
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

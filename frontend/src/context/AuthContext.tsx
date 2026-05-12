import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isSignedIn: boolean;
  getToken: () => Promise<string>;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isSignedIn: false,
  getToken: async () => '',
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('auth_token')
  );
  const [user, setUser] = useState<AuthUser | null>(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  const login = (newToken: string, newUser: AuthUser) => {
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('user', JSON.stringify({ ...newUser, role: newUser.role || 'USER' }));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('dev_bypass_token');
    setToken(null);
    setUser(null);
    window.location.href = '/landing';
  };

  const getToken = async (): Promise<string> =>
    localStorage.getItem('auth_token') || localStorage.getItem('dev_bypass_token') || '';

  const isSignedIn = !!token || !!localStorage.getItem('dev_bypass_token');

  return (
    <AuthContext.Provider value={{ user, token, isSignedIn, getToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

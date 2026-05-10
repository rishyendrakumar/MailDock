import React, { createContext, useContext, useState, useCallback } from 'react';

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  username: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_KEY = 'maildock-auth';

// Accepted credentials — will be replaced with OAuth
const VALID_CREDENTIALS = [
  { username: 'qa@keka.com', password: 'K7@mP2$x' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const stored = localStorage.getItem(AUTH_KEY);
  const [authState, setAuthState] = useState<{ username: string } | null>(
    stored ? JSON.parse(stored) : null
  );

  const login = useCallback((username: string, password: string): boolean => {
    const match = VALID_CREDENTIALS.find(
      (c) => c.username === username.trim() && c.password === password
    );
    if (match) {
      const state = { username: username.trim() };
      localStorage.setItem(AUTH_KEY, JSON.stringify(state));
      setAuthState(state);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setAuthState(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!authState,
        login,
        logout,
        username: authState?.username ?? '',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

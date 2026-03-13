import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'trainer' | 'student';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole) => {
    // Simulate login - in production, this would call an API
    await new Promise(resolve => setTimeout(resolve, 800));
    setUser({
      id: '1',
      name: role === 'trainer' ? 'Coach Alex' : 'João Silva',
      email,
      role,
      avatar: undefined,
    });
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    // Simulate registration
    await new Promise(resolve => setTimeout(resolve, 800));
    setUser({
      id: '1',
      name,
      email,
      role,
      avatar: undefined,
    });
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

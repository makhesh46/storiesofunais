import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { DB } from '../services/db';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = DB.auth.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const loggedInUser = await DB.auth.login(email, pass);
    setUser(loggedInUser);
  };

  const signup = async (email: string, pass: string, name: string) => {
    const newUser = await DB.auth.signup(email, pass, name);
    setUser(newUser);
  };

  const loginWithGoogle = async (token: string) => {
    const loggedInUser = await DB.auth.googleLogin(token);
    setUser(loggedInUser);
  };

  const logout = () => {
    DB.auth.logout();
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, loginWithGoogle, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
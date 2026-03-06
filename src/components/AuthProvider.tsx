"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type UserRole = "editor" | "viewer";

interface AuthContextType {
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = "pm-nav-auth";
const ROLE_KEY = "pm-nav-role";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEY);
    const savedRole = localStorage.getItem(ROLE_KEY) as UserRole | null;
    if (token && savedRole) {
      setIsAuthenticated(true);
      setRole(savedRole);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (password: string): Promise<boolean> => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem(AUTH_KEY, data.token);
      localStorage.setItem(ROLE_KEY, data.role);
      setIsAuthenticated(true);
      setRole(data.role);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(ROLE_KEY);
    setIsAuthenticated(false);
    setRole(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

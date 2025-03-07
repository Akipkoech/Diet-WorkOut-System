"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authService, RegisterData } from "../services/auth"

type User = {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  [key: string]: any; // For other user properties
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (fullName: string, email: string, password: string, additionalData?: Partial<RegisterData>) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    
    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login({ email, password });
      
      // Store user data and token
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Redirect based on user role
      if (response.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    router.push("/");
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    additionalData?: Partial<RegisterData>
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const userData: RegisterData = {
        fullName,
        email,
        password,
        ...additionalData
      };
      
      const response = await authService.register(userData);
      
      // Store user data and token
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Redirect to dashboard after registration
      router.push("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is an admin
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        login, 
        logout, 
        register, 
        isAuthenticated,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface AuthContextType {
  isAuthenticated: boolean;
  email?: string;
  loading: boolean; // Added
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true); // Tracks auth check status

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/me", {
          withCredentials: true,
        });
        setIsAuthenticated(true);
        setEmail(response.data.email);
      } catch {
        setIsAuthenticated(false);
        setEmail(undefined);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    await axios.post("/api/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      withCredentials: true,
    });

    setIsAuthenticated(true);
    setEmail(email);
  };

  const logout = async () => {
    await axios.post("/api/logout", {}, { withCredentials: true });
    setIsAuthenticated(false);
    setEmail(undefined);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, email, loading, login, logout }} // ✅ Include loading
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "./api";

const AuthContext = createContext(null);
const STORAGE_KEY = "gallery-app-auth";

function readStoredAuth() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readStoredAuth()?.token || "");
  const [user, setUser] = useState(() => readStoredAuth()?.user || null);

  useEffect(() => {
    if (token && user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
  }, [token, user]);

  const login = (payload) => {
    setToken(payload.access_token);
    setUser(payload.user);
  };

  const logout = () => {
    setToken("");
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) {
      return null;
    }
    const me = await apiRequest("/api/auth/me", { method: "GET" }, token);
    setUser(me);
    return me;
  };

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token && user),
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được dùng bên trong AuthProvider.");
  }
  return context;
}

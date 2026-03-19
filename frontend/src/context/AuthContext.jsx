import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import api from "../services/api";
import formatApiError from "../utils/formatApiError";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    setUser(null);
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await api.get("/users/me");
      setUser(res.data);
    } catch {
      logout();
    }
  }, [logout]);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("access_token", res.data.access_token);
      await fetchCurrentUser();
      setError(null);
    } catch (err) {
      setError(formatApiError(err, "Login failed"));
    }
  };

  const register = async (data) => {
    try {
      await api.post("/auth/register", data);
      await login(data.email, data.password);
    } catch (err) {
      setError(formatApiError(err, "Registration failed"));
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        await fetchCurrentUser();
      }
      if (mounted) {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [fetchCurrentUser]);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

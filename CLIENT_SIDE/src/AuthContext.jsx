import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, login as apiLogin, logout as apiLogout } from "./api";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loginUser = async (username, password) => {
    await apiLogin(username, password);
    const res = await getCurrentUser();
    setUser(res);
  };

  const logoutUser = async () => {
    await apiLogout();
    setUser(null);
    navigate("/login");
  };

  const isStaff = user?.is_staff || user?.is_superuser || false;

  return (
    <AuthContext.Provider value={{ user, setUser, loginUser, logoutUser, isStaff, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

import React, { createContext, useState, useEffect } from "react";
import api from "../lib/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem("user_email");
    const access = localStorage.getItem("access_token");
    if (access && email) setUser({ email });
  }, []);

  const login = async ({ email, password }) => {
    const resp = await api.post("/auth/token/", { email, password });
    localStorage.setItem("access_token", resp.data.access);
    localStorage.setItem("refresh_token", resp.data.refresh);
    if (resp.data.user) {
      localStorage.setItem("user_email", resp.data.user.email);
      setUser(resp.data.user);
    } else {
      localStorage.setItem("user_email", email);
      setUser({ email });
    }
    return resp;
  };

  const logout = async () => {
    const refresh = localStorage.getItem("refresh_token");
    try {
      if (refresh) await api.post("/auth/logout/", { refresh });
    } catch (_) { /* ignore errors */ }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_email");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

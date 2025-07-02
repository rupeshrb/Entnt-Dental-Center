// src/context/AuthContext.js
import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (email, password, users) => {
    const matchedUser = users.find(u => u.email === email && u.password === password);
    if (matchedUser) {
      setUser(matchedUser);
      localStorage.setItem("user", JSON.stringify(matchedUser));
      return { success: true, role: matchedUser.role };
    }
    return { success: false };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

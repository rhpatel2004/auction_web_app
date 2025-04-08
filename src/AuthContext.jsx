// src/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await api.getUser();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        // Handle error appropriately (e.g., redirect to login)
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = (userData) => {
     localStorage.setItem('userId', userData.userId);
     localStorage.setItem('userRole', userData.role);
    setUser({ userId: userData.userId, username: userData.username, role: userData.role });
  };

  const logout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole')
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smartcine_token') || null);
  const [city, setCity] = useState(localStorage.getItem('smartcine_city') || 'Hyderabad');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await authService.getProfile();
          if (res.success) {
            setUser(res.data);
            if (res.data.preferredCity) {
              setCity(res.data.preferredCity);
              localStorage.setItem('smartcine_city', res.data.preferredCity);
            }
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = (userData) => {
    localStorage.setItem('smartcine_token', userData.token);
    setToken(userData.token);
    setUser(userData);
    if (userData.preferredCity) {
      setCity(userData.preferredCity);
      localStorage.setItem('smartcine_city', userData.preferredCity);
    }
  };

  const logout = () => {
    localStorage.removeItem('smartcine_token');
    setToken(null);
    setUser(null);
  };

  const updateCity = (newCity) => {
    setCity(newCity);
    localStorage.setItem('smartcine_city', newCity);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        city,
        loading,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
        login,
        logout,
        updateCity,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

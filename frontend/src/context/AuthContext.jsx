import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smartcine_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
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
            localStorage.setItem('smartcine_user', JSON.stringify(res.data));
            if (res.data.preferredCity) {
              setCity(res.data.preferredCity);
              localStorage.setItem('smartcine_city', res.data.preferredCity);
            }
          }
        } catch (error) {
          console.warn('Could not verify profile with backend:', error.message);
          // Only clear session if token is actively rejected (401/403), NOT on network error or server sleep
          if (error.message?.includes('401') || error.message?.includes('403') || error.message?.includes('Invalid token')) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = (userData) => {
    localStorage.setItem('smartcine_token', userData.token);
    localStorage.setItem('smartcine_user', JSON.stringify(userData));
    setToken(userData.token);
    setUser(userData);
    if (userData.preferredCity) {
      setCity(userData.preferredCity);
      localStorage.setItem('smartcine_city', userData.preferredCity);
    }
  };

  const logout = () => {
    localStorage.removeItem('smartcine_token');
    localStorage.removeItem('smartcine_user');
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

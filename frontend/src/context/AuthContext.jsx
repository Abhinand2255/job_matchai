import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('jobmatch_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If token exists, verify/fetch current user profile
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        try {
          const res = await axiosClient.get('/auth/me/');
          setUser(res.data);
          localStorage.setItem('jobmatch_user', JSON.stringify(res.data));
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (identifier, password) => {
    const payload = identifier.includes('@')
      ? { email: identifier, password }
      : { username: identifier, password };

    const res = await axiosClient.post('/auth/login/', payload);
    const { access, refresh, user: loggedUser } = res.data;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('jobmatch_user', JSON.stringify(loggedUser));

    setToken(access);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (userData) => {
    const res = await axiosClient.post('/auth/register/', userData);
    const { tokens, user: registeredUser } = res.data;

    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('jobmatch_user', JSON.stringify(registeredUser));

    setToken(tokens.access);
    setUser(registeredUser);
    return registeredUser;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('jobmatch_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
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

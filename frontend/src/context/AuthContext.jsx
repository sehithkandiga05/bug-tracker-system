import React, { createContext, useContext, useEffect, useState } from 'react';
import API from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_info');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('user_info', JSON.stringify(res.data.user));
          }
        } catch (e) {
          console.warn('[Auth] Check auth failed or expired session');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('access_token', res.data.token);
      localStorage.setItem('refresh_token', res.data.refreshToken);
      localStorage.setItem('user_info', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await API.post('/auth/register', userData);
    if (res.data.success) {
      localStorage.setItem('access_token', res.data.token);
      localStorage.setItem('refresh_token', res.data.refreshToken);
      localStorage.setItem('user_info', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    setUser(null);
  };

  // Demo Login Helper for quick testing of all roles
  const demoLogin = async (role) => {
    const emailMap = {
      Admin: 'admin@bugtracker.system',
      Developer: 'frontend@bugtracker.system',
      Tester: 'qa@bugtracker.system',
      Reporter: 'reporter@bugtracker.system',
    };
    const email = emailMap[role] || 'admin@bugtracker.system';
    return await login(email, 'password123');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

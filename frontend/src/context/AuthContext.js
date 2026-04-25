import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { connectSocket, disconnectSocket } from '../utils/socket';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) fetchMe();
    else setLoading(false);
  }, []);

  const fetchMe = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      connectSocket(data.user._id, data.user.role);
    } catch { localStorage.removeItem('token'); }
    finally { setLoading(false); }
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    connectSocket(data.user._id, data.user.role);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    connectSocket(data.user._id, data.user.role);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    disconnectSocket();
    setUser(null);
    toast.success('Logged out');
  };

  const updateUser = (updates) => setUser(prev => ({ ...prev, ...updates }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

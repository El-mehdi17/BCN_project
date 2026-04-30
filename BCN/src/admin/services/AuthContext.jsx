import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import api from './api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('admin_access_token');
      const storedUser = localStorage.getItem('admin_user');
      
      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          
          if (userData.role !== 'admin') {
            throw new Error('Accès non autorisé');
          }
          setUser(userData);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (err) {
          localStorage.removeItem('admin_access_token');
          localStorage.removeItem('admin_user');
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.adminLogin(email, password, 'admin');
      
  
      if (response.user.role !== 'admin') {
        throw new Error('Ce compte n\'a pas les privilèges d\'administrateur');
      }
      
      setUser(response.user);
      setLoading(false);
      return response;
    } catch (err) {
      setError(err.message || 'Échec de la connexion');
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_user');
      delete api.defaults.headers.common['Authorization'];
    }
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
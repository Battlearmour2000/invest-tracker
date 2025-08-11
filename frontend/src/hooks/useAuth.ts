import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { jwtDecode } from 'jwt-decode';

type TokenPayload = {
  exp?: number;
  user_id?: number;
  username?: string;
  is_data_admin?: boolean;
};

export function useAuth() {
  const navigate = useNavigate();

  // Check token validity
  const validateToken = useCallback((token: string): boolean => {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      if (!decoded.exp || Date.now() >= decoded.exp * 1000) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  // Initialize auth state and set API headers
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    if (!token || !validateToken(token)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      navigate('/login');
      return;
    }

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Optional: Set up token refresh timer
    const checkTokenExpiration = () => {
      if (!validateToken(token)) {
        logout();
      }
    };
    
    const interval = setInterval(checkTokenExpiration, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [navigate, validateToken]);

  // Get current user info from token
  const getCurrentUser = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    
    try {
      return jwtDecode<TokenPayload>(token);
    } catch (error) {
      return null;
    }
  }, []);

  // Enhanced logout function
  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
    
    // Optional: Send logout request to backend
    api.post('/auth/logout/').catch(() => {});
  }, [navigate]);

  // Login helper function
  const login = useCallback(async (credentials: { username: string; password: string }) => {
    try {
      const response = await api.post('/auth/login/', credentials);
      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      return true;
    } catch (error) {
      logout();
      return false;
    }
  }, [logout]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    const user = getCurrentUser();
    return user?.is_data_admin ?? false;
  }, [getCurrentUser]);

  return { 
    logout,
    login,
    getCurrentUser,
    isAdmin,
    isAuthenticated: !!localStorage.getItem('access_token')
  };
}
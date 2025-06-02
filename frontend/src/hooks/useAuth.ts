import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export function useAuth() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token'); 
    if (!token) {
      navigate('/login');
    } else {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`; 
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return { logout };
}
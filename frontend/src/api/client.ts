import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  exp?: number;
  user_id?: number;
  username?: string;
  is_data_admin?: boolean;
}

interface RefreshTokenResponse {
  access: string;
  refresh?: string;
}

const api = axios.create({
  baseURL: '/api/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor with proper InternalAxiosRequestConfig typing
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      return config;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const isExpired = decoded.exp ? decoded.exp * 1000 < Date.now() : false;

      if (!isExpired) {
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      }

      // Token is expired, attempt refresh
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await axios.post<RefreshTokenResponse>(
        '/api/auth/refresh/',
        { refresh: refreshToken }
      );

      localStorage.setItem('access_token', response.data.access);
      if (response.data.refresh) {
        localStorage.setItem('refresh_token', response.data.refresh);
      }

      config.headers.Authorization = `Bearer ${response.data.access}`;
      return config;

    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      if (!config.url?.includes('/auth/')) {
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');
        
        const response = await axios.post<RefreshTokenResponse>(
          '/api/auth/refresh/',
          { refresh: refreshToken }
        );
        
        localStorage.setItem('access_token', response.data.access);
        if (response.data.refresh) {
          localStorage.setItem('refresh_token', response.data.refresh);
        }
        
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
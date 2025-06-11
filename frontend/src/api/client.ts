// api/client.ts
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  //baseURL: "https://30c4-41-188-143-58.ngrok-free.app/api/",
  withCredentials: true,
});

// Add request interceptor
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('access_token'); // FIXED

  if (token) {
    // Check if token is expired
    const decoded = jwtDecode(token);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post('http://localhost:8000/api/auth/refresh/', {
          refresh: refreshToken
        });
        // const response = await axios.post('https://30c4-41-188-143-58.ngrok-free.app/api/auth/refresh/', {
        //    refresh: refreshToken
        //  });
        localStorage.setItem('access_token', response.data.access);
        config.headers.Authorization = `Bearer ${response.data.access}`;
      } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
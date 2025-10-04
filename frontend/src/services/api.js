import axios from 'axios';

const API_BASE_URL = '/api'; // Using Vite proxy to avoid CORS issues

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Token expired, try refresh
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          console.log('Attempting token refresh...');
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          if (response.data && response.data.data && response.data.data.accessToken) {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;
            console.log('Token refresh successful');
            localStorage.setItem('accessToken', accessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api.request(originalRequest);
          } else {
            console.error('Invalid refresh response format:', response.data);
            throw new Error('Invalid refresh response');
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Clear invalid tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        console.log('No refresh token available');
        // No refresh token, redirect to login
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
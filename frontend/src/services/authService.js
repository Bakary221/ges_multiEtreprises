import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { data: { accessToken, refreshToken, user } } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  registerSuperAdmin: async (email, password) => {
    const response = await api.post('/auth/register-superadmin', { email, password });
    return response.data.data;
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    if (!user || user === 'undefined') {
      localStorage.removeItem('user');
      return null;
    }
    try {
      return JSON.parse(user);
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  getUserRole: () => {
    const user = authService.getCurrentUser();
    return user?.role || null;
  },
};
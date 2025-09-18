import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/api/user/me');
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await api.put('/api/user/profile', userData);
    return response.data;
  },
  
  requestPasswordReset: async (email) => {
    const response = await api.post('/api/password/request', { email });
    return response.data;
  },
  
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/api/password/perform', { token, newPassword });
    return response.data;
  }
};
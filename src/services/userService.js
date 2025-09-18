import api from './api';

export const userService = {
  updateProfile: async (userData) => {
    const response = await api.put('/api/user/profile', userData);
    return response.data;
  },
  
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/api/user/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },
  
  getQuizHistory: async () => {
    const response = await api.get('/api/quiz/my-history');
    return response.data;
  },
  
  getAchievements: async () => {
    const response = await api.get('/api/user/achievements');
    return response.data;
  },
  
  getBookmarks: async () => {
    const response = await api.get('/api/bookmarks');
    return response.data;
  }
};
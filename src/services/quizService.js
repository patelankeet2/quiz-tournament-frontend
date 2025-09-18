import api from './api';

export const quizService = {
  // Admin functions
  createQuiz: async (quizData) => {
    const response = await api.post('/api/admin/quiz', quizData);
    return response.data;
  },
  
  getAllQuizzes: async () => {
    try {
      const response = await api.get('/api/admin/quizzes');
      return response.data;
    } catch (error) {
      console.error('Error in getAllQuizzes:', error);
      throw error;
    }
  },
  
  updateQuiz: async (id, quizData) => {
    const response = await api.put(`/api/admin/quiz/${id}`, quizData);
    return response.data;
  },
  
  deleteQuiz: async (id) => {
    const response = await api.delete(`/api/admin/quiz/${id}`);
    return response.data;
  },
  
  getQuizLikes: async (id) => {
    const response = await api.get(`/api/admin/quiz/${id}/likes`);
    return response.data;
  },
  
  getAdminStats: async () => {
    const response = await api.get('/api/admin/stats');
    return response.data;
  },
  
  getAllUsers: async () => {
    const response = await api.get('/api/admin/users');
    return response.data;
  },
  
  deleteUser: async (userId) => {
    const response = await api.delete(`/api/admin/user/${userId}`);
    return response.data;
  },
  
  createAdmin: async (adminData) => {
    const response = await api.post('/api/admin/create-admin', adminData);
    return response.data;
  },
  
  // Player functions
  getQuizQuestions: async (id) => {
    const response = await api.get(`/api/quiz/${id}/questions`);
    return response.data;
  },
  
  startQuizAttempt: async (id) => {
    const response = await api.post(`/api/quiz/${id}/start`);
    return response.data;
  },
  
  getAttemptQuestion: async (attemptId) => {
    const response = await api.get(`/api/quiz/attempt/${attemptId}/question`);
    return response.data;
  },
  
  submitAnswer: async (attemptId, answer) => {
    const response = await api.post(`/api/quiz/attempt/${attemptId}/answer`, { answer });
    return response.data;
  },
  
  getLeaderboard: async (id) => {
    const response = await api.get(`/api/quiz/${id}/leaderboard`);
    return response.data;
  },
  
  getQuizScores: async (id) => {
    const response = await api.get(`/api/quiz/${id}/scores`);
    return response.data;
  },
  
  getQuizStatus: async () => {
    const response = await api.get('/api/quiz/status');
    return response.data;
  },
  
  searchQuizzes: async (category) => {
    const response = await api.get(`/api/quiz/search?category=${category}`);
    return response.data;
  },
  
  getQuizHistory: async () => {
    const response = await api.get('/api/quiz/my-history');
    return response.data;
  },
  
  getRecommendations: async () => {
    const response = await api.get('/api/quiz/recommendations');
    return response.data;
  },
  
  // Like and bookmark functions
  likeQuiz: async (quizId) => {
    const response = await api.post(`/api/like/${quizId}`);
    return response.data;
  },
  
  unlikeQuiz: async (quizId) => {
    const response = await api.delete(`/api/like/${quizId}`);
    return response.data;
  },
  
  getLikeCount: async (quizId) => {
    const response = await api.get(`/api/like/${quizId}/count`);
    return response.data;
  },
  
  bookmarkQuiz: async (quizId) => {
    const response = await api.post(`/api/bookmarks/${quizId}`);
    return response.data;
  },
  
  removeBookmark: async (quizId) => {
    const response = await api.delete(`/api/bookmarks/${quizId}`);
    return response.data;
  },
  
  getUserBookmarks: async () => {
    const response = await api.get('/api/bookmarks');
    return response.data;
  },
  
  getBookmarkStatus: async (quizId) => {
    const response = await api.get(`/api/bookmarks/${quizId}/status`);
    return response.data;
  }
};
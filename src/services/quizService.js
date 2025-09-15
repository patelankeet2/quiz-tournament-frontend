import api from './api';

export const quizService = {
  // Admin functions
  createQuiz: async (quizData) => {
    const response = await api.post('/admin/quiz', quizData);
    return response.data;
  },
  
  getAllQuizzes: async () => {
    const response = await api.get('/admin/quizzes');
    return response.data;
  },
  
  updateQuiz: async (id, quizData) => {
    const response = await api.put(`/admin/quiz/${id}`, quizData);
    return response.data;
  },
  
  deleteQuiz: async (id) => {
    const response = await api.delete(`/admin/quiz/${id}`);
    return response.data;
  },
  
  getQuizLikes: async (id) => {
    const response = await api.get(`/admin/quiz/${id}/likes`);
    return response.data;
  },
  
  getAdminStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/user/${userId}`);
    return response.data;
  },
  
  createAdmin: async (adminData) => {
    const response = await api.post('/admin/create-admin', adminData);
    return response.data;
  },
  
  // Player functions
  getQuizQuestions: async (id) => {
    const response = await api.get(`/quiz/${id}/questions`);
    return response.data;
  },
  
  startQuizAttempt: async (id) => {
    const response = await api.post(`/quiz/${id}/start`);
    return response.data;
  },
  
  getAttemptQuestion: async (attemptId) => {
    const response = await api.get(`/quiz/attempt/${attemptId}/question`);
    return response.data;
  },
  
  submitAnswer: async (attemptId, answer) => {
    const response = await api.post(`/quiz/attempt/${attemptId}/answer`, { answer });
    return response.data;
  },
  
  getLeaderboard: async (id) => {
    const response = await api.get(`/quiz/${id}/leaderboard`);
    return response.data;
  },
  
  getQuizScores: async (id) => {
    const response = await api.get(`/quiz/${id}/scores`);
    return response.data;
  },
  
  getQuizStatus: async () => {
    const response = await api.get('/quiz/status');
    return response.data;
  },
  
  searchQuizzes: async (category) => {
    const response = await api.get(`/quiz/search?category=${category}`);
    return response.data;
  },
  
  getQuizHistory: async () => {
    const response = await api.get('/quiz/my-history');
    return response.data;
  },
  
  getRecommendations: async () => {
    const response = await api.get('/quiz/recommendations');
    return response.data;
  },
  
  // Like and bookmark functions
  likeQuiz: async (quizId) => {
    const response = await api.post(`/like/${quizId}`);
    return response.data;
  },
  
  unlikeQuiz: async (quizId) => {
    const response = await api.delete(`/like/${quizId}`);
    return response.data;
  },
  
  getLikeCount: async (quizId) => {
    const response = await api.get(`/like/${quizId}/count`);
    return response.data;
  },
  
  bookmarkQuiz: async (quizId) => {
    const response = await api.post(`/bookmarks/${quizId}`);
    return response.data;
  },
  
  removeBookmark: async (quizId) => {
    const response = await api.delete(`/bookmarks/${quizId}`);
    return response.data;
  },
  
  getUserBookmarks: async () => {
    const response = await api.get('/bookmarks');
    return response.data;
  },
  
  getBookmarkStatus: async (quizId) => {
    const response = await api.get(`/bookmarks/${quizId}/status`);
    return response.data;
  }
};
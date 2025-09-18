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
  
  getQuizQuestions: async (id) => {
    const response = await api.get(`/api/quiz/${id}/questions`);
    return response.data;
  },
  
  getAdminStats: async () => {
    try {
      const response = await api.get('/api/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // Return default stats if endpoint doesn't exist
      return {
        totalQuizzes: 0,
        activeQuizzes: 0,
        totalPlayers: 0,
        totalAttempts: 0
      };
    }
  },
  
  // Player functions
  getQuizStatus: async () => {
    try {
      const response = await api.get('/api/quiz/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz status:', error);
      return { ongoing: [], upcoming: [], past: [] };
    }
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
  
  getQuizHistory: async () => {
    try {
      const response = await api.get('/api/quiz/my-history');
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      return [];
    }
  }
};
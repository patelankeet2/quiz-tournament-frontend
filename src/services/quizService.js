import api from './api';

export const quizService = {
  // Admin functions
  createQuiz: async (quizData) => {
    const response = await api.post('/api/admin/quiz', quizData);
    return response.data;
  },
  
  getAllQuizzes: async () => {
    try {
      console.log('Fetching quizzes from /api/admin/quizzes');
      const response = await api.get('/api/admin/quizzes');
      
      // Directly extract the data we need without complex circular reference handling
      let quizzesData = response.data;
      
      // If it's an array, process each quiz to remove circular references
      if (Array.isArray(quizzesData)) {
        const cleanedQuizzes = quizzesData.map(quiz => ({
          id: quiz.id,
          name: quiz.name,
          category: quiz.category,
          difficulty: quiz.difficulty,
          startDate: quiz.startDate,
          endDate: quiz.endDate,
          minPassingPercentage: quiz.minPassingPercentage,
          // Don't include questions to avoid circular references
          questionCount: quiz.questions ? quiz.questions.length : 0
        }));
        
        console.log(`Successfully retrieved ${cleanedQuizzes.length} quizzes`);
        return cleanedQuizzes;
      }
      
      // If it's not an array, try to extract array from common structures
      if (quizzesData && Array.isArray(quizzesData.content)) {
        // Handle paginated response: { content: [...] }
        const cleanedQuizzes = quizzesData.content.map(quiz => ({
          id: quiz.id,
          name: quiz.name,
          category: quiz.category,
          difficulty: quiz.difficulty,
          startDate: quiz.startDate,
          endDate: quiz.endDate,
          minPassingPercentage: quiz.minPassingPercentage,
          questionCount: quiz.questions ? quiz.questions.length : 0
        }));
        
        console.log(`Successfully retrieved ${cleanedQuizzes.length} quizzes from paginated response`);
        return cleanedQuizzes;
      }
      
      if (quizzesData && Array.isArray(quizzesData.quizzes)) {
        // Handle response: { quizzes: [...] }
        const cleanedQuizzes = quizzesData.quizzes.map(quiz => ({
          id: quiz.id,
          name: quiz.name,
          category: quiz.category,
          difficulty: quiz.difficulty,
          startDate: quiz.startDate,
          endDate: quiz.endDate,
          minPassingPercentage: quiz.minPassingPercentage,
          questionCount: quiz.questions ? quiz.questions.length : 0
        }));
        
        console.log(`Successfully retrieved ${cleanedQuizzes.length} quizzes from quizzes property`);
        return cleanedQuizzes;
      }
      
      console.warn('Unexpected response structure from /api/admin/quizzes:', quizzesData);
      return [];
      
    } catch (error) {
      console.error('Error in getAllQuizzes:', error);
      
      // Provide detailed error information
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        if (error.response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (error.response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
      }
      
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
    try {
      const response = await api.get('/api/admin/users');
      
      return (response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
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
    try {
      const response = await api.get(`/api/quiz/${id}/questions`);
      
      return (response.data);
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      throw error;
    }
  },
  
  startQuizAttempt: async (id) => {
    try {
      const response = await api.post(`/api/quiz/${id}/start`);
      
      // The backend returns: { "message": "resumed", "attemptId": 5 }
      if (response.data.attemptId) {
        return response.data;
      } else {
        console.warn('Unexpected response structure from start quiz attempt:', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Error starting quiz attempt:', error);
      throw error;
    }
  },
  
  getAttemptQuestion: async (attemptId) => {
    try {
      const response = await api.get(`/api/quiz/attempt/${attemptId}/question`);
      return response.data;
    } catch (error) {
      console.error('Error loading question:', error);
      throw error;
    }
  },
  
  submitAnswer: async (attemptId, answer) => {
    try {
      const response = await api.post(`/api/quiz/attempt/${attemptId}/answer`, { answer });
      return response.data;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
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
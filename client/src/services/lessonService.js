import { apiClient } from './api.js';

export const lessonService = {
  getLessons: (category = '', search = '') => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient(`/lessons${queryString}`);
  },

  getCategories: () => apiClient('/lessons/categories'),

  getLessonById: (id) => apiClient(`/lessons/${id}`),

  startLearningSession: (lessonId) =>
    apiClient('/learning/start', {
      method: 'POST',
      body: { lessonId }
    }),

  updateStepProgress: (lessonId, stepNumber, actionType = 'done') =>
    apiClient(`/learning/${lessonId}/progress`, {
      method: 'PUT',
      body: { stepNumber, actionType }
    }),

  completeLesson: (lessonId) =>
    apiClient(`/learning/${lessonId}/complete`, {
      method: 'POST'
    }),

  submitPractice: (lessonId, answers) =>
    apiClient(`/learning/${lessonId}/practice`, {
      method: 'POST',
      body: { answers }
    })
};

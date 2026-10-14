import { apiClient } from './api.js';

export const aiService = {
  chatWithTeacher: (message, history = [], currentLessonTitle = null, currentStep = null, currentTopic = null) =>
    apiClient('/ai/chat', {
      method: 'POST',
      body: { message, history, currentLessonTitle, currentStep, currentTopic }
    }),

  createDynamicLesson: (topic) =>
    apiClient('/ai/lesson', {
      method: 'POST',
      body: { topic }
    }),

  evaluatePractice: (question, userAnswer, expectedAnswer) =>
    apiClient('/ai/practice', {
      method: 'POST',
      body: { question, userAnswer, expectedAnswer }
    }),

  getConversations: () =>
    apiClient('/ai/conversations', {
      method: 'GET'
    }),

  saveConversation: (data) =>
    apiClient('/ai/conversations', {
      method: 'POST',
      body: data
    }),

  deleteConversation: (id) =>
    apiClient(`/ai/conversations/${id}`, {
      method: 'DELETE'
    }),

  clearConversations: () =>
    apiClient('/ai/conversations', {
      method: 'DELETE'
    })
};

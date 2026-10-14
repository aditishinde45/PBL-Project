import { apiClient } from './api.js';

export const progressService = {
  getProgress: () => apiClient('/progress'),
  getRecommendations: () => apiClient('/progress/recommendations')
};

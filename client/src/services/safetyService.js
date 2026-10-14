import { apiClient } from './api.js';

export const safetyService = {
  checkSafety: (type, content) =>
    apiClient('/safety/check', {
      method: 'POST',
      body: { type, content }
    }),

  getSafetyHistory: () => apiClient('/safety/history'),

  getCommonScams: () => apiClient('/safety/scams')
};

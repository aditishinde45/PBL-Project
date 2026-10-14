import { apiClient } from './api.js';

export const familyService = {
  getOverview: () => apiClient('/family/overview'),
  sendNote: (message, emoji = '❤️') =>
    apiClient('/family/notes', {
      method: 'POST',
      body: { message, emoji }
    }),
  getSeniorNotes: () => apiClient('/family/notes/my')
};

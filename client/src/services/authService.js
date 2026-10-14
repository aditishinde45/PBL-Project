import { apiClient } from './api.js';

export const authService = {
  login: (email, password) =>
    apiClient('/auth/login', {
      method: 'POST',
      body: { email, password }
    }),

  register: (userData) =>
    apiClient('/auth/register', {
      method: 'POST',
      body: userData
    }),

  demoSeniorLogin: () =>
    apiClient('/auth/demo/senior', {
      method: 'POST'
    }),

  demoFamilyLogin: () =>
    apiClient('/auth/demo/family', {
      method: 'POST'
    }),

  getMe: () => apiClient('/auth/me'),

  updateSettings: (settings) =>
    apiClient('/auth/settings', {
      method: 'PUT',
      body: settings
    }),

  completeOnboarding: (preferences) =>
    apiClient('/auth/onboarding', {
      method: 'POST',
      body: preferences
    })
};

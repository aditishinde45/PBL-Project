import { apiClient } from './api.js';

export const visionService = {
  analyzeScreenshot: (formData) =>
    apiClient('/vision/analyze', {
      method: 'POST',
      body: formData
    })
};

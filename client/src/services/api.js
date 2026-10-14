// Centralized API Client with senior-friendly error handling

const RAW_API_URL = import.meta.env.VITE_API_URL || 'https://elderease-0h4i.onrender.com';
const API_BASE = RAW_API_URL.replace(/\/$/, '').endsWith('/api')
  ? RAW_API_URL.replace(/\/$/, '')
  : `${RAW_API_URL.replace(/\/$/, '')}/api`;

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('elderease_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData (multipart/form-data for screenshots)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  } else if (options.body && typeof options.body === 'object') {
    options.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({
      success: false,
      message: 'Server communication error. Please try again.'
    }));

    if (!response.ok) {
      const friendlyMessage = data.message || 'Something went wrong. Don’t worry, please try again.';
      throw new Error(friendlyMessage);
    }

    return data;
  } catch (error) {
    console.warn(`[ElderEase API Notice]:`, error.message);
    throw error;
  }
};

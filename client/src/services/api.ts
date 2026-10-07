const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('elderease_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }

  return data.data;
}

export const api = {
  // Auth
  demoLogin: () =>
    request<any>('/auth/demo-login', {
      method: 'POST',
      body: '{}',
    }),
  login: (identifier: string, password: string) =>
    request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),
  registerSenior: (data: any) =>
    request<any>('/auth/register-senior', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  registerCaregiver: (data: any) =>
    request<any>('/auth/register-caregiver', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMe: () => request<any>('/auth/me'),

  // Senior
  getSeniorOverview: () => request<any>('/senior/overview'),
  getSeniorProfile: () => request<any>('/senior/profile'),
  updatePreferences: (prefs: any) =>
    request<any>('/senior/preferences', {
      method: 'PATCH',
      body: JSON.stringify(prefs),
    }),
  generateCaregiverCode: () =>
    request<any>('/senior/caregiver-code', { method: 'POST' }),

  // Caregiver
  getCaregiverDashboard: () => request<any>('/caregiver/dashboard'),
  connectSenior: (inviteCode: string) =>
    request<any>('/caregiver/connect', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    }),
  createFamilyTask: (data: any) =>
    request<any>('/caregiver/family-tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Medicines
  getMedicines: (seniorId?: string) =>
    request<any[]>(`/medicines${seniorId ? `?seniorId=${seniorId}` : ''}`),
  createMedicine: (data: any) =>
    request<any>('/medicines', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  confirmMedicine: (scheduleId: string, status: 'TAKEN' | 'DELAYED', notes?: string) =>
    request<any>('/medicines/confirm', {
      method: 'POST',
      body: JSON.stringify({ scheduleId, status, notes }),
    }),

  // Appointments
  getAppointments: (seniorId?: string) =>
    request<any[]>(`/appointments${seniorId ? `?seniorId=${seniorId}` : ''}`),
  createAppointment: (data: any) =>
    request<any>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Check-In
  getTodayCheckin: (seniorId?: string) =>
    request<any>(`/checkins/today${seniorId ? `?seniorId=${seniorId}` : ''}`),
  submitCheckin: (status: 'OKAY' | 'HELP_NEEDED', notes?: string) =>
    request<any>('/checkins', {
      method: 'POST',
      body: JSON.stringify({ status, notes }),
    }),

  // Emergency & Help
  triggerEmergency: (coords?: { latitude?: number; longitude?: number }) =>
    request<any>('/help/emergency', {
      method: 'POST',
      body: JSON.stringify(coords || {}),
    }),
  triggerFamilyCall: (message?: string) =>
    request<any>('/help/family', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  resolveEmergency: (id: string) =>
    request<any>(`/help/emergency/${id}/resolve`, { method: 'PATCH' }),

  // Guided Tasks
  getTasks: () => request<any[]>('/tasks'),
  getTaskById: (id: string) => request<any>(`/tasks/${id}`),
  startTask: (taskId: string) =>
    request<any>('/tasks/start', {
      method: 'POST',
      body: JSON.stringify({ taskId }),
    }),
  updateTaskSession: (sessionId: string, currentStepIndex: number, status?: string) =>
    request<any>(`/tasks/sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ currentStepIndex, status }),
    }),
  getActiveSession: () => request<any>('/tasks/sessions/active'),
  submitFeedback: (sessionId: string, rating: 'GOOD' | 'POOR', comment?: string) =>
    request<any>('/feedback', {
      method: 'POST',
      body: JSON.stringify({ sessionId, rating, comment }),
    }),

  getFamilyHelpRequests: () => request<any[]>('/help/requests'),

  // AI Companion
  chatWithAi: (
    message: string,
    history: any[],
    language?: string,
    context?: {
      currentTaskSlug?: string;
      currentStepIndex?: number;
      voiceEnabled?: boolean;
      userConfusionLevel?: number;
      lastInstruction?: string;
      lastAIResponse?: string;
    }
  ) =>
    request<any>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        history,
        language,
        currentTaskSlug: context?.currentTaskSlug,
        currentStepIndex: context?.currentStepIndex,
        voiceEnabled: context?.voiceEnabled,
        userConfusionLevel: context?.userConfusionLevel,
        lastInstruction: context?.lastInstruction,
        lastAIResponse: context?.lastAIResponse,
      }),
    }),
  checkScam: (messageText: string, language?: string) =>
    request<any>('/ai/check-scam', {
      method: 'POST',
      body: JSON.stringify({ messageText, language }),
    }),
  explainPage: (pageTitle: string, url: string, visibleText: string, language?: string) =>
    request<any>('/ai/explain-page', {
      method: 'POST',
      body: JSON.stringify({ pageTitle, url, visibleText, language }),
    }),
  extractPrescription: (rawTextOrDescription: string) =>
    request<any>('/ai/extract-prescription', {
      method: 'POST',
      body: JSON.stringify({ rawTextOrDescription }),
    }),

  // Notifications
  getNotifications: () => request<any[]>('/notifications'),
  markNotificationRead: (id: string) =>
    request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () =>
    request<any>('/notifications/read-all', { method: 'PATCH' }),

  // Admin CMS & Analytics
  getAdminTasks: () => request<any[]>('/admin/tasks'),
  createAdminTask: (task: any) =>
    request<any>('/admin/tasks', { method: 'POST', body: JSON.stringify(task) }),
  togglePublishTask: (id: string) =>
    request<any>(`/admin/tasks/${id}/publish`, { method: 'PATCH' }),
  getAnalyticsSummary: () => request<any>('/admin/analytics'),

  // Demo / Dev Mode Controls
  triggerDemoMedicine: () =>
    request<any>('/demo/trigger-medicine', { method: 'POST' }),
  simulateMissedMedicine: () =>
    request<any>('/demo/simulate-missed-medicine', { method: 'POST' }),
  simulateMissedCheckin: () =>
    request<any>('/demo/simulate-missed-checkin', { method: 'POST' }),
  triggerDemoEmergency: () =>
    request<any>('/demo/trigger-emergency', { method: 'POST' }),
};

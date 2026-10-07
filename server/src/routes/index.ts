import { Router } from 'express';
import {
  registerSenior,
  registerCaregiver,
  login,
  demoLogin,
  getMe,
  logout,
} from '../controllers/authController';
import {
  getSeniorProfile,
  updateSeniorPreferences,
  getSeniorOverview,
  generateCaregiverCode,
} from '../controllers/seniorController';
import {
  getCaregiverDashboard,
  connectSeniorByCode,
  createFamilyTask,
} from '../controllers/caregiverController';
import {
  getMedicines,
  createMedicine,
  confirmMedicine,
  checkMissedMedicines,
} from '../controllers/medicineController';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
} from '../controllers/appointmentController';
import {
  getTodayCheckin,
  submitCheckin,
} from '../controllers/checkinController';
import {
  triggerEmergency,
  triggerFamilyCall,
  resolveEmergency,
  getFamilyHelpRequests,
} from '../controllers/helpController';
import {
  getPublishedTasks,
  getTaskById,
  startTaskSession,
  updateSessionProgress,
  getActiveRecoverableSession,
} from '../controllers/taskController';
import {
  getAllTasksAdmin,
  createTaskAdmin,
  togglePublishTask,
  getAnalyticsSummary,
} from '../controllers/adminController';
import {
  chatWithAi,
  checkScamMessage,
  explainWebPage,
  extractPrescription,
} from '../controllers/aiController';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../controllers/notificationController';
import {
  triggerDemoMedicineReminder,
  simulateMissedMedicine,
  simulateMissedCheckin,
  triggerDemoEmergency,
} from '../controllers/demoController';
import { submitTaskFeedback } from '../controllers/feedbackController';
import { authenticateToken, requireRole, optionalAuth } from '../middleware/auth';

export const apiRouter = Router();

// --- Auth Routes ---
apiRouter.post('/auth/demo-login', demoLogin);
apiRouter.post('/auth/register-senior', registerSenior);
apiRouter.post('/auth/register-caregiver', registerCaregiver);
apiRouter.post('/auth/login', login);
apiRouter.get('/auth/me', authenticateToken, getMe);
apiRouter.post('/auth/logout', logout);

// --- Senior Routes ---
apiRouter.get('/senior/profile', authenticateToken, getSeniorProfile);
apiRouter.patch('/senior/preferences', authenticateToken, updateSeniorPreferences);
apiRouter.get('/senior/overview', authenticateToken, getSeniorOverview);
apiRouter.post('/senior/caregiver-code', authenticateToken, generateCaregiverCode);

// --- Caregiver Routes ---
apiRouter.get('/caregiver/dashboard', authenticateToken, requireRole('CAREGIVER', 'ADMIN'), getCaregiverDashboard);
apiRouter.post('/caregiver/connect', authenticateToken, requireRole('CAREGIVER'), connectSeniorByCode);
apiRouter.post('/caregiver/family-tasks', authenticateToken, requireRole('CAREGIVER'), createFamilyTask);

// --- Medicine Routes ---
apiRouter.get('/medicines', authenticateToken, getMedicines);
apiRouter.post('/medicines', authenticateToken, createMedicine);
apiRouter.post('/medicines/confirm', authenticateToken, confirmMedicine);
apiRouter.post('/medicines/check-missed', checkMissedMedicines);

// --- Appointment Routes ---
apiRouter.get('/appointments', authenticateToken, getAppointments);
apiRouter.post('/appointments', authenticateToken, createAppointment);
apiRouter.patch('/appointments/:id', authenticateToken, updateAppointment);

// --- Check-In Routes ---
apiRouter.get('/checkins/today', authenticateToken, getTodayCheckin);
apiRouter.post('/checkins', authenticateToken, submitCheckin);

// --- Emergency & Help Routes ---
apiRouter.post('/help/emergency', authenticateToken, triggerEmergency);
apiRouter.post('/help/family', authenticateToken, triggerFamilyCall);
apiRouter.get('/help/requests', authenticateToken, getFamilyHelpRequests);
apiRouter.patch('/help/emergency/:id/resolve', authenticateToken, resolveEmergency);

// --- Guided Task Routes ---
apiRouter.get('/tasks', getPublishedTasks);
apiRouter.get('/tasks/sessions/active', authenticateToken, getActiveRecoverableSession);
apiRouter.get('/tasks/:id', getTaskById);
apiRouter.post('/tasks/start', authenticateToken, startTaskSession);
apiRouter.patch('/tasks/sessions/:sessionId', authenticateToken, updateSessionProgress);
apiRouter.post('/feedback', authenticateToken, submitTaskFeedback);

// --- Admin CMS & Analytics ---
apiRouter.get('/admin/tasks', authenticateToken, requireRole('ADMIN'), getAllTasksAdmin);
apiRouter.post('/admin/tasks', authenticateToken, requireRole('ADMIN'), createTaskAdmin);
apiRouter.patch('/admin/tasks/:id/publish', authenticateToken, requireRole('ADMIN'), togglePublishTask);
apiRouter.get('/admin/analytics', authenticateToken, requireRole('ADMIN'), getAnalyticsSummary);

apiRouter.post('/ai/chat', optionalAuth, chatWithAi);
apiRouter.post('/ai/check-scam', checkScamMessage);
apiRouter.post('/ai/explain-page', explainWebPage);
apiRouter.post('/ai/extract-prescription', extractPrescription);

// --- Notifications ---
apiRouter.get('/notifications', authenticateToken, getUserNotifications);
apiRouter.patch('/notifications/:id/read', authenticateToken, markNotificationAsRead);
apiRouter.patch('/notifications/read-all', authenticateToken, markAllNotificationsAsRead);

// --- Development / Demo Panel ---
apiRouter.post('/demo/trigger-medicine', triggerDemoMedicineReminder);
apiRouter.post('/demo/simulate-missed-medicine', simulateMissedMedicine);
apiRouter.post('/demo/simulate-missed-checkin', simulateMissedCheckin);
apiRouter.post('/demo/trigger-emergency', triggerDemoEmergency);

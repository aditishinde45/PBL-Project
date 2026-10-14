import express from 'express';
import {
  register,
  login,
  getMe,
  updateSettings,
  completeOnboarding,
  demoSeniorLogin,
  demoFamilyLogin
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/demo/senior', demoSeniorLogin);
router.post('/demo/family', demoFamilyLogin);

router.get('/me', protect, getMe);
router.put('/settings', protect, updateSettings);
router.post('/onboarding', protect, completeOnboarding);

export default router;

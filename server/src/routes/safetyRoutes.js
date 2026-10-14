import express from 'express';
import { checkSafety, getSafetyHistory, getCommonScams } from '../controllers/safetyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/check', protect, checkSafety);
router.get('/history', protect, getSafetyHistory);
router.get('/scams', getCommonScams);

export default router;

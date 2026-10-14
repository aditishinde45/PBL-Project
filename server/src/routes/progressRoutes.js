import express from 'express';
import { getProgressStats, getRecommendationsController } from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getProgressStats);
router.get('/recommendations', protect, getRecommendationsController);

export default router;

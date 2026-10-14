import express from 'express';
import {
  startLearningSession,
  updateStepProgress,
  completeLesson,
  submitPractice
} from '../controllers/learningController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/start', protect, startLearningSession);
router.put('/:lessonId/progress', protect, updateStepProgress);
router.post('/:lessonId/complete', protect, completeLesson);
router.post('/:lessonId/practice', protect, submitPractice);

export default router;

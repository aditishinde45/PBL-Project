import express from 'express';
import {
  chatWithTeacher,
  createDynamicLesson,
  evaluatePracticeAnswer,
  getUserConversations,
  saveUserConversation,
  deleteUserConversation,
  clearUserConversations
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', protect, chatWithTeacher);
router.post('/lesson', protect, createDynamicLesson);
router.post('/practice', protect, evaluatePracticeAnswer);

router.get('/conversations', protect, getUserConversations);
router.post('/conversations', protect, saveUserConversation);
router.delete('/conversations/:id', protect, deleteUserConversation);
router.delete('/conversations', protect, clearUserConversations);

export default router;

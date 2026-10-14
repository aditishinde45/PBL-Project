import express from 'express';
import { getFamilyOverview, sendCheerNote, getSeniorNotes } from '../controllers/familyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/overview', protect, getFamilyOverview);
router.post('/notes', protect, sendCheerNote);
router.get('/notes/my', protect, getSeniorNotes);

export default router;

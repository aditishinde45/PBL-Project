import express from 'express';
import { analyzeScreenshotController } from '../controllers/visionController.js';
import { uploadScreenshot } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/analyze', protect, uploadScreenshot, analyzeScreenshotController);

export default router;

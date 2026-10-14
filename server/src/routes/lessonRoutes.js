import express from 'express';
import { getLessons, getLesson, getCategories } from '../controllers/lessonController.js';

const router = express.Router();

router.get('/', getLessons);
router.get('/categories', getCategories);
router.get('/:id', getLesson);

export default router;

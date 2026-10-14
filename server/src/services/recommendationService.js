import { inMemoryStore } from './inMemoryStore.js';
import { Lesson } from '../models/Lesson.js';
import { LearningProgress } from '../models/LearningProgress.js';

export const getRecommendations = async (userId) => {
  let completedLessonIds = [];
  try {
    const userProgress = await LearningProgress.find({ userId, status: 'completed' });
    completedLessonIds = userProgress.map(p => p.lessonId.toString());
  } catch (err) {
    completedLessonIds = inMemoryStore.progress
      .filter(p => p.userId?.toString() === userId?.toString() && p.status === 'completed')
      .map(p => p.lessonId.toString());
  }

  // Get all available lessons
  let allLessons = [];
  try {
    allLessons = await Lesson.find().lean();
  } catch (err) {
    allLessons = inMemoryStore.lessons;
  }
  if (!allLessons || allLessons.length === 0) {
    allLessons = inMemoryStore.lessons;
  }

  // Filter out completed ones, or pick highest value beginner ones
  const uncompleted = allLessons.filter(l => !completedLessonIds.includes(l._id.toString()));

  // Curate recommended lessons
  const recommended = uncompleted.slice(0, 3);

  // If all completed or none left, recommend practice or popular ones
  if (recommended.length === 0 && allLessons.length > 0) {
    return allLessons.slice(0, 3);
  }

  return recommended;
};

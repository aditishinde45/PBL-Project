import { getAllLessons, getLessonByIdOrSlug } from '../services/lessonService.js';

export const getLessons = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const lessons = await getAllLessons({ category, search });
    res.json({
      success: true,
      count: lessons.length,
      lessons
    });
  } catch (error) {
    next(error);
  }
};

export const getLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lesson = await getLessonByIdOrSlug(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found. Please pick another lesson from our library.'
      });
    }

    res.json({
      success: true,
      lesson
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = [
      { id: 'All', name: 'All Topics', icon: '🌟', count: 12 },
      { id: 'WhatsApp', name: 'WhatsApp', icon: '💬', count: 3 },
      { id: 'Smartphone', name: 'Smartphone Basics', icon: '📱', count: 2 },
      { id: 'Email', name: 'Email & Gmail', icon: '✉️', count: 2 },
      { id: 'Google Meet', name: 'Video Meetings', icon: '💻', count: 1 },
      { id: 'Google Maps', name: 'Google Maps', icon: '🗺️', count: 1 },
      { id: 'YouTube', name: 'YouTube & Songs', icon: '▶️', count: 1 },
      { id: 'Digital Payments', name: 'UPI & Payments', icon: '💳', count: 1 },
      { id: 'Online Safety', name: 'Stay Safe Online', icon: '🛡️', count: 1 }
    ];

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
};

import { LearningProgress } from '../models/LearningProgress.js';
import { Lesson } from '../models/Lesson.js';
import { User } from '../models/User.js';
import { inMemoryStore } from '../services/inMemoryStore.js';
import { getRecommendations } from '../services/recommendationService.js';

export const getProgressStats = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    let progressRecords = [];
    let allLessons = [];
    let user = req.user;

    try {
      progressRecords = await LearningProgress.find({ userId }).populate('lessonId');
      allLessons = await Lesson.find().lean();
      user = await User.findById(userId) || req.user;
    } catch (e) {
      // In-memory fallback
      progressRecords = inMemoryStore.progress
        .filter(p => p.userId?.toString() === userId?.toString())
        .map(p => {
          const lesson = inMemoryStore.lessons.find(l => l._id.toString() === p.lessonId.toString());
          return { ...p, lessonId: lesson };
        });
      allLessons = inMemoryStore.lessons;
    }

    const completed = progressRecords.filter(p => p.status === 'completed' || p.percentage === 100);
    const inProgress = progressRecords.filter(p => p.status === 'in_progress' && p.percentage < 100);

    // Compute progress by category
    const categoryMap = {};
    for (const rec of progressRecords) {
      const cat = rec.lessonId?.category || 'General';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { totalPercentage: 0, count: 0, completedCount: 0 };
      }
      categoryMap[cat].totalPercentage += (rec.percentage || 0);
      categoryMap[cat].count += 1;
      if (rec.status === 'completed' || rec.percentage === 100) {
        categoryMap[cat].completedCount += 1;
      }
    }

    const categoryProgress = Object.keys(categoryMap).map(category => {
      const item = categoryMap[category];
      return {
        category,
        averagePercentage: Math.round(item.totalPercentage / item.count),
        completedLessons: item.completedCount,
        totalLessons: item.count
      };
    });

    const recentActivity = progressRecords
      .sort((a, b) => new Date(b.lastAccessedAt || b.updatedAt) - new Date(a.lastAccessedAt || a.updatedAt))
      .slice(0, 5)
      .map(p => ({
        lessonId: p.lessonId?._id,
        lessonTitle: p.lessonId?.title || 'Technology Lesson',
        category: p.lessonId?.category || 'General',
        percentage: p.percentage || 0,
        status: p.status,
        lastAccessedAt: p.lastAccessedAt || p.updatedAt
      }));

    res.json({
      success: true,
      stats: {
        totalCompletedLessons: completed.length,
        inProgressCount: inProgress.length,
        technologiesLearned: Object.keys(categoryMap).length,
        learningStreak: user?.learningStreak || 1,
        overallPercentage: allLessons.length > 0 && completed.length > 0
          ? Math.round((completed.length / allLessons.length) * 100)
          : 0
      },
      categoryProgress,
      inProgressLessons: inProgress.map(p => ({
        lesson: p.lessonId,
        percentage: p.percentage,
        currentStep: p.currentStep
      })),
      recentActivity
    });
  } catch (error) {
    next(error);
  }
};

export const getRecommendationsController = async (req, res, next) => {
  try {
    const recommendations = await getRecommendations(req.user?._id);
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    next(error);
  }
};

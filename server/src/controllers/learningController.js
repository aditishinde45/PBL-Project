import mongoose from 'mongoose';
import { LearningProgress } from '../models/LearningProgress.js';
import { LearningSession } from '../models/LearningSession.js';
import { getLessonByIdOrSlug } from '../services/lessonService.js';
import { inMemoryStore } from '../services/inMemoryStore.js';

export const startLearningSession = async (req, res, next) => {
  try {
    const { lessonId } = req.body;
    const userId = req.user._id;

    const lesson = await getLessonByIdOrSlug(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Could not find that lesson.'
      });
    }

    // Find or create progress
    let progress = null;
    try {
      progress = await LearningProgress.findOne({ userId, lessonId: lesson._id });
      if (!progress) {
        progress = await LearningProgress.create({
          userId,
          lessonId: lesson._id,
          currentStep: 1,
          completedSteps: [],
          percentage: 0,
          status: 'in_progress',
          lastAccessedAt: new Date()
        });
      } else {
        progress.lastAccessedAt = new Date();
        await progress.save();
      }
    } catch (e) {
      // In-memory fallback
      progress = inMemoryStore.progress.find(
        p => p.userId?.toString() === userId.toString() && p.lessonId?.toString() === lesson._id.toString()
      );
      if (!progress) {
        progress = {
          _id: new mongoose.Types.ObjectId(),
          userId,
          lessonId: lesson._id,
          currentStep: 1,
          completedSteps: [],
          percentage: 0,
          status: 'in_progress',
          practiceCompleted: false,
          lastAccessedAt: new Date()
        };
        inMemoryStore.progress.push(progress);
      } else {
        progress.lastAccessedAt = new Date();
      }
    }

    res.json({
      success: true,
      lesson,
      progress
    });
  } catch (error) {
    next(error);
  }
};

export const updateStepProgress = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { stepNumber, actionType } = req.body; // actionType: 'done' | 'stuck' | 'slow' | 'repeat'
    const userId = req.user._id;

    const lesson = await getLessonByIdOrSlug(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const totalSteps = lesson.steps?.length || 1;
    let completedSteps = [];
    let currentStep = stepNumber || 1;

    // Find progress
    let progress = null;
    try {
      progress = await LearningProgress.findOne({ userId, lessonId: lesson._id });
      if (!progress) {
        progress = new LearningProgress({ userId, lessonId: lesson._id });
      }

      if (actionType === 'done') {
        if (!progress.completedSteps.includes(stepNumber)) {
          progress.completedSteps.push(stepNumber);
        }
        currentStep = Math.min(stepNumber + 1, totalSteps);
        progress.currentStep = currentStep;
      }

      progress.percentage = Math.round((progress.completedSteps.length / totalSteps) * 100);
      if (progress.completedSteps.length >= totalSteps) {
        progress.status = 'completed';
      } else {
        progress.status = 'in_progress';
      }
      progress.lastAccessedAt = new Date();
      await progress.save();
      completedSteps = progress.completedSteps;
    } catch (e) {
      // In-memory update
      let memProg = inMemoryStore.progress.find(
        p => p.userId?.toString() === userId.toString() && p.lessonId?.toString() === lesson._id.toString()
      );
      if (!memProg) {
        memProg = {
          _id: new mongoose.Types.ObjectId(),
          userId,
          lessonId: lesson._id,
          currentStep: 1,
          completedSteps: [],
          percentage: 0,
          status: 'in_progress',
          lastAccessedAt: new Date()
        };
        inMemoryStore.progress.push(memProg);
      }

      if (actionType === 'done') {
        if (!memProg.completedSteps.includes(stepNumber)) {
          memProg.completedSteps.push(stepNumber);
        }
        currentStep = Math.min(stepNumber + 1, totalSteps);
        memProg.currentStep = currentStep;
      }

      memProg.percentage = Math.round((memProg.completedSteps.length / totalSteps) * 100);
      if (memProg.completedSteps.length >= totalSteps) {
        memProg.status = 'completed';
      }
      memProg.lastAccessedAt = new Date();
      progress = memProg;
      completedSteps = memProg.completedSteps;
    }

    res.json({
      success: true,
      currentStep,
      completedSteps,
      percentage: progress.percentage,
      isCompleted: progress.percentage === 100
    });
  } catch (error) {
    next(error);
  }
};

export const completeLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user._id;

    const lesson = await getLessonByIdOrSlug(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    try {
      await LearningProgress.findOneAndUpdate(
        { userId, lessonId: lesson._id },
        {
          percentage: 100,
          status: 'completed',
          completedSteps: (lesson.steps || []).map(s => s.stepNumber),
          lastAccessedAt: new Date()
        },
        { upsert: true }
      );
    } catch (e) {
      let p = inMemoryStore.progress.find(
        x => x.userId?.toString() === userId.toString() && x.lessonId?.toString() === lesson._id.toString()
      );
      if (p) {
        p.percentage = 100;
        p.status = 'completed';
        p.completedSteps = (lesson.steps || []).map(s => s.stepNumber);
      }
    }

    res.json({
      success: true,
      message: 'Congratulations! You completed this lesson with patience and flying colors.'
    });
  } catch (error) {
    next(error);
  }
};

export const submitPractice = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { answers } = req.body; // array of chosen indices
    const userId = req.user._id;

    const lesson = await getLessonByIdOrSlug(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const questions = lesson.practiceQuestions || [];
    let correctCount = 0;

    questions.forEach((q, idx) => {
      if (answers && answers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const total = questions.length || 1;
    const score = Math.round((correctCount / total) * 100);

    // Warm, encouraging feedback (never harsh)
    let encouragement = 'Great job! You remembered the important steps.';
    if (score === 100) {
      encouragement = 'Outstanding! You have mastered this lesson completely!';
    } else if (score >= 50) {
      encouragement = 'Wonderful effort! You remembered most of the steps. Practice makes perfect!';
    } else {
      encouragement = 'Good try! You are making wonderful progress every single day.';
    }

    try {
      await LearningProgress.findOneAndUpdate(
        { userId, lessonId: lesson._id },
        { practiceCompleted: true, practiceScore: score }
      );
    } catch (e) {
      const p = inMemoryStore.progress.find(
        x => x.userId?.toString() === userId.toString() && x.lessonId?.toString() === lesson._id.toString()
      );
      if (p) {
        p.practiceCompleted = true;
        p.practiceScore = score;
      }
    }

    res.json({
      success: true,
      score,
      correctCount,
      total,
      encouragement
    });
  } catch (error) {
    next(error);
  }
};

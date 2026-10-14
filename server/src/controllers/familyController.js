import { User } from '../models/User.js';
import { LearningProgress } from '../models/LearningProgress.js';
import { FamilyNote } from '../models/FamilyNote.js';
import { inMemoryStore } from '../services/inMemoryStore.js';

export const getFamilyOverview = async (req, res, next) => {
  try {
    // Find the senior user linked or default to Grandma Asha for demo
    let senior = null;
    try {
      senior = await User.findOne({ email: 'asha@elderease.com' });
    } catch (e) {
      // Mongo fallback
    }
    if (!senior) {
      senior = inMemoryStore.users.find(u => u.email === 'asha@elderease.com') || inMemoryStore.users[0];
    }

    if (!senior) {
      return res.status(404).json({ success: false, message: 'No senior profile found.' });
    }

    // Check privacy setting
    if (!senior.familySharingEnabled) {
      return res.json({
        success: true,
        sharingEnabled: false,
        seniorName: senior.name,
        message: `${senior.name} has turned off family sharing in their privacy settings.`
      });
    }

    // Get senior's progress
    let progressRecords = [];
    try {
      progressRecords = await LearningProgress.find({ userId: senior._id }).populate('lessonId');
    } catch (e) {
      progressRecords = inMemoryStore.progress
        .filter(p => p.userId?.toString() === senior._id.toString())
        .map(p => {
          const lesson = inMemoryStore.lessons.find(l => l._id.toString() === p.lessonId.toString());
          return { ...p, lessonId: lesson };
        });
    }

    // Notes sent to senior
    let notes = [];
    try {
      notes = await FamilyNote.find({ seniorUserId: senior._id }).sort({ createdAt: -1 });
    } catch (e) {
      notes = inMemoryStore.familyNotes.filter(n => n.seniorUserId?.toString() === senior._id.toString());
    }

    const completed = progressRecords.filter(p => p.status === 'completed' || p.percentage === 100);
    const inProgress = progressRecords.filter(p => p.status === 'in_progress' && p.percentage < 100);

    res.json({
      success: true,
      sharingEnabled: true,
      senior: {
        _id: senior._id,
        name: senior.name,
        avatar: senior.avatar,
        preferredLanguage: senior.preferredLanguage,
        learningStreak: senior.learningStreak,
        lastActive: senior.lastActive || new Date()
      },
      stats: {
        completedLessonsCount: completed.length,
        inProgressCount: inProgress.length,
        streakDays: senior.learningStreak || 4
      },
      completedLessons: completed.map(p => ({
        title: p.lessonId?.title,
        category: p.lessonId?.category,
        completedAt: p.updatedAt || p.lastAccessedAt
      })),
      inProgressLessons: inProgress.map(p => ({
        title: p.lessonId?.title,
        category: p.lessonId?.category,
        percentage: p.percentage,
        currentStep: p.currentStep
      })),
      notes
    });
  } catch (error) {
    next(error);
  }
};

export const sendCheerNote = async (req, res, next) => {
  try {
    const { message, emoji = '❤️' } = req.body;
    const familyUser = req.user;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please type an encouraging message for your loved one.'
      });
    }

    // Find senior
    let senior = null;
    try {
      senior = await User.findOne({ email: 'asha@elderease.com' });
    } catch (e) {
      // Fallback
    }
    if (!senior) {
      senior = inMemoryStore.users.find(u => u.email === 'asha@elderease.com') || inMemoryStore.users[0];
    }

    let savedNote = null;
    try {
      savedNote = await FamilyNote.create({
        seniorUserId: senior._id,
        senderUserId: familyUser._id,
        senderName: familyUser.name || 'Rahul',
        senderRelation: 'Family Member',
        message: message.trim(),
        emoji,
        readBySenior: false,
        createdAt: new Date()
      });
    } catch (e) {
      savedNote = {
        _id: new Date().getTime().toString(),
        seniorUserId: senior._id,
        senderUserId: familyUser._id,
        senderName: familyUser.name || 'Rahul',
        senderRelation: 'Family Member',
        message: message.trim(),
        emoji,
        readBySenior: false,
        createdAt: new Date()
      };
      inMemoryStore.familyNotes.unshift(savedNote);
    }

    res.status(201).json({
      success: true,
      message: 'Your encouraging message has been sent to your loved one!',
      note: savedNote
    });
  } catch (error) {
    next(error);
  }
};

export const getSeniorNotes = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let notes = [];

    try {
      notes = await FamilyNote.find({ seniorUserId: userId }).sort({ createdAt: -1 });
    } catch (e) {
      notes = inMemoryStore.familyNotes.filter(n => n.seniorUserId?.toString() === userId.toString());
    }

    res.json({
      success: true,
      count: notes.length,
      notes
    });
  } catch (error) {
    next(error);
  }
};

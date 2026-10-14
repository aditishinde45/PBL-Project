import mongoose from 'mongoose';
import { Lesson } from '../models/Lesson.js';
import { inMemoryStore } from './inMemoryStore.js';
import { callAI, SYSTEM_PROMPTS } from './aiService.js';

export const getAllLessons = async (query = {}) => {
  const { category, search } = query;
  
  // Try MongoDB only if live
  if (mongoose.connection.readyState === 1) {
    try {
      const filter = {};
      if (category && category !== 'All') filter.category = category;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      const lessons = await Lesson.find(filter).sort({ createdAt: 1 });
      if (lessons && lessons.length > 0) return lessons;
    } catch (err) {
      // Fallback to in-memory
    }
  }

  // Filter in-memory lessons
  let result = [...inMemoryStore.lessons];
  if (category && category !== 'All') {
    result = result.filter(l => l.category.toLowerCase() === category.toLowerCase());
  }
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(l => l.title.toLowerCase().includes(s) || l.description.toLowerCase().includes(s));
  }
  return result;
};

export const getLessonByIdOrSlug = async (idOrSlug) => {
  if (mongoose.connection.readyState === 1) {
    try {
      let lesson = null;
      if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
        lesson = await Lesson.findById(idOrSlug);
      }
      if (!lesson) {
        lesson = await Lesson.findOne({ slug: idOrSlug });
      }
      if (lesson) return lesson;
    } catch (err) {
      // Fallback
    }
  }

  return inMemoryStore.lessons.find(
    l => l._id.toString() === idOrSlug.toString() || l.slug === idOrSlug
  ) || null;
};

export const generateDynamicLesson = async (userPrompt, userId = null) => {
  const aiResponse = await callAI([
    { role: 'system', content: SYSTEM_PROMPTS.LESSON_GENERATOR },
    { role: 'user', content: `Please create a beginner senior lesson for: "${userPrompt}"` }
  ], { isLessonGenerator: true, responseFormat: 'json_object' });

  let parsedLesson;
  try {
    parsedLesson = JSON.parse(aiResponse);
  } catch (e) {
    console.warn('[Lesson Service] Failed to parse AI JSON, creating safe structured lesson.');
    parsedLesson = {
      title: `Learning: ${userPrompt}`,
      category: 'Custom',
      difficulty: 'Absolute Beginner',
      icon: '💡',
      estimatedTime: '4 mins',
      description: `Step-by-step beginner guide created for ${userPrompt}.`,
      steps: [
        {
          stepNumber: 1,
          title: 'Open Your Phone Screen',
          instruction: 'Unlock your phone and locate the app icon on your home screen.',
          explanation: 'Starting cleanly from your home screen ensures you are in full control.',
          expectedAction: 'Unlock phone and look at apps.',
          helpText: 'Swipe gently left or right if you do not see the icon immediately.'
        }
      ],
      practiceQuestions: []
    };
  }

  const slug = `custom-${Date.now()}-${userPrompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 20)}`;
  const lessonData = {
    _id: new mongoose.Types.ObjectId(),
    slug,
    title: parsedLesson.title || `Learning ${userPrompt}`,
    category: parsedLesson.category || 'Custom',
    difficulty: parsedLesson.difficulty || 'Absolute Beginner',
    icon: parsedLesson.icon || '💡',
    estimatedTime: parsedLesson.estimatedTime || '4 mins',
    description: parsedLesson.description || 'Personalized step-by-step senior lesson.',
    isPredefined: false,
    createdBy: userId,
    steps: parsedLesson.steps || [],
    practiceQuestions: parsedLesson.practiceQuestions || []
  };

  // Save to in-memory store
  inMemoryStore.lessons.unshift(lessonData);

  // Try to save to MongoDB if live
  try {
    await Lesson.create(lessonData);
  } catch (e) {
    // In-memory already updated
  }

  return lessonData;
};

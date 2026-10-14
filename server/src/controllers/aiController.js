import mongoose from 'mongoose';
import { callAI, SYSTEM_PROMPTS } from '../services/aiService.js';
import { generateDynamicLesson } from '../services/lessonService.js';
import { ChatConversation } from '../models/ChatConversation.js';

export const chatWithTeacher = async (req, res, next) => {
  try {
    const { message, history = [], currentLessonTitle = null, currentStep = null, currentTopic = null } = req.body;
    const userLanguage = req.user?.preferredLanguage || 'English';
    const teachingSpeed = req.user?.teachingSpeed || 'Step by Step';

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please speak or type a message.'
      });
    }

    const cleanHistory = (Array.isArray(history) ? history : [])
      .filter(item => item && item.content && item.role)
      .map(item => ({ role: item.role, content: item.content }))
      .slice(-8);

    const lastMsg = cleanHistory[cleanHistory.length - 1];
    const messages = [
      {
        role: 'system',
        content: `You are a helpful, smart, and friendly AI assistant.
User profile context:
- Name: \${req.user?.name || 'Friend'}
- Preferred language: \${userLanguage}
- Current Topic: \${currentTopic || 'None'}
- Current Step: \${currentStep || 0}

You must act as a normal, highly capable voice assistant. You can answer ANY question the user asks.

CRITICAL INSTRUCTIONS:
Determine if the user's message is a general question/chit-chat (like "What is the capital of India?", "Tell me a joke") OR a request for a tutorial/how-to that involves multiple steps (like "How to book a train ticket", "How to use WhatsApp").

IF IT IS A GENERAL QUESTION OR CHIT-CHAT:
Provide a full, direct, and complete answer. Do NOT break it into steps.
Return EXACTLY this JSON format:
{
  "reply": "Your full response here",
  "currentStep": 0,
  "totalSteps": 0,
  "isCompleted": false,
  "currentTopic": null,
  "topicTitle": null
}

IF IT IS A HOW-TO/TUTORIAL THAT REQUIRES STEPS:
1. If the user is asking a NEW question, start at step 1. Provide ONLY the instructions for step 1.
2. If the user is continuing the Current Topic (e.g., they said "done", "next", or "I'm stuck"), provide the NEXT step.
3. If they reached the final step, set isCompleted to true.
Return EXACTLY this JSON format:
{
  "reply": "Instructions for this specific step only...",
  "currentStep": <number>,
  "totalSteps": <total_number_of_steps>,
  "stepTitle": "Short title for this step",
  "isCompleted": <true if this is the final step, false otherwise>,
  "currentTopic": "a_short_identifier_for_the_topic",
  "topicTitle": "User friendly topic title"
}

Speak naturally and warmly in \${userLanguage}.`
      },
      ...cleanHistory
    ];

    if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== message) {
      messages.push({ role: 'user', content: message });
    }

    const response = await callAI(messages, {
      language: userLanguage,
      responseFormat: 'json_object'
    });

    let aiData;
    if (typeof response === 'object' && response !== null) {
      aiData = response;
    } else {
      try {
        let cleanJson = response.replace(/^```(json)?/, '').replace(/```$/, '').trim();
        aiData = JSON.parse(cleanJson);
      } catch (e) {
        aiData = { reply: response };
      }
    }

    res.json({
      success: true,
      reply: aiData.reply || aiData,
      currentStep: aiData.currentStep,
      totalSteps: aiData.totalSteps,
      stepTitle: aiData.stepTitle,
      isCompleted: aiData.isCompleted,
      currentTopic: aiData.currentTopic,
      topicTitle: aiData.topicTitle,
      language: userLanguage
    });
  } catch (error) {
    next(error);
  }
};

export const createDynamicLesson = async (req, res, next) => {
  try {
    const { topic } = req.body;
    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please tell me what you would like to learn.'
      });
    }

    const lesson = await generateDynamicLesson(topic.trim(), req.user?._id);

    res.status(201).json({
      success: true,
      lesson
    });
  } catch (error) {
    next(error);
  }
};

export const evaluatePracticeAnswer = async (req, res, next) => {
  try {
    const { question, userAnswer, expectedAnswer } = req.body;

    const messages = [
      {
        role: 'system',
        content: `You are evaluating a senior citizen's verbal or written answer to a tech practice question.
Be extremely encouraging, warm, and positive. Never be harsh or punitive.
Evaluate if they grasped the core concept.
Return JSON:
{
  "isCorrect": true/false,
  "encouragingFeedback": "Positive feedback here",
  "gentleTip": "Helpful reminder if needed"
}`
      },
      {
        role: 'user',
        content: `Question: ${question}\nExpected: ${expectedAnswer}\nSenior Citizen's Answer: ${userAnswer}`
      }
    ];

    const reply = await callAI(messages, { responseFormat: 'json_object' });
    let parsed;
    try {
      parsed = JSON.parse(reply);
    } catch (e) {
      parsed = {
        isCorrect: true,
        encouragingFeedback: 'Wonderful! You remembered the main steps correctly. Keep up the great practice!',
        gentleTip: 'You can repeat this lesson whenever you wish.'
      };
    }

    res.json({
      success: true,
      evaluation: parsed
    });
  } catch (error) {
    next(error);
  }
};

export const getUserConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    // Only return conversations that contain at least one user message
    const conversations = await ChatConversation.find({
      userId,
      'messages.role': 'user'
    })
      .sort({ lastMessageAt: -1 })
      .lean();

    const validConversations = conversations.filter(c =>
      Array.isArray(c.messages) &&
      c.messages.some(m => m.role === 'user' && m.content && m.content.trim().length > 0)
    );

    // Deduplicate on server side to guarantee unique conversations
    const seenKeys = new Set();
    const uniqueConversations = [];
    for (const c of validConversations) {
      const firstUserMsg = (c.messages.find(m => m.role === 'user')?.content || '').trim().toLowerCase();
      const key = `${c.title || ''}:::${firstUserMsg}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueConversations.push(c);
      }
    }

    res.json({
      success: true,
      conversations: uniqueConversations.map(c => ({
        id: c._id.toString(),
        title: c.title,
        messages: c.messages,
        currentStep: c.currentStep,
        totalSteps: c.totalSteps,
        currentTopic: c.currentTopic,
        topicTitle: c.topicTitle,
        isCompleted: c.isCompleted,
        date: c.lastMessageAt || c.updatedAt || c.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const saveUserConversation = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id, title, messages, currentStep, totalSteps, currentTopic, topicTitle, isCompleted } = req.body;

    // Do NOT save or create conversations if the user never sent any message
    const hasUserMessage = Array.isArray(messages) && messages.some(m => m.role === 'user' && m.content && m.content.trim().length > 0);
    if (!hasUserMessage) {
      return res.json({
        success: true,
        message: 'No user messages to save.',
        conversation: null
      });
    }

    let conversation = null;
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      conversation = await ChatConversation.findOne({ _id: id, userId });
    }

    const firstUserMsg = messages.find(m => m.role === 'user')?.content?.trim() || '';
    const derivedTitle = firstUserMsg.length > 30 ? firstUserMsg.substring(0, 30) + '...' : firstUserMsg;

    if (conversation) {
      if (title) conversation.title = title;
      else if (!conversation.title || conversation.title === 'New Chat') conversation.title = derivedTitle || 'Chat';

      if (Array.isArray(messages)) conversation.messages = messages;
      if (currentStep !== undefined) conversation.currentStep = currentStep;
      if (totalSteps !== undefined) conversation.totalSteps = totalSteps;
      if (currentTopic !== undefined) conversation.currentTopic = currentTopic;
      if (topicTitle !== undefined) conversation.topicTitle = topicTitle;
      if (isCompleted !== undefined) conversation.isCompleted = isCompleted;
      conversation.lastMessageAt = new Date();
      await conversation.save();
    } else {
      conversation = await ChatConversation.create({
        userId,
        title: title || derivedTitle || 'Chat',
        messages: Array.isArray(messages) ? messages : [],
        currentStep: currentStep || 0,
        totalSteps: totalSteps || 0,
        currentTopic: currentTopic || null,
        topicTitle: topicTitle || null,
        isCompleted: Boolean(isCompleted),
        lastMessageAt: new Date()
      });
    }

    res.json({
      success: true,
      conversation: {
        id: conversation._id.toString(),
        title: conversation.title,
        messages: conversation.messages,
        currentStep: conversation.currentStep,
        totalSteps: conversation.totalSteps,
        currentTopic: conversation.currentTopic,
        topicTitle: conversation.topicTitle,
        isCompleted: conversation.isCompleted,
        date: conversation.lastMessageAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserConversation = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (id && mongoose.Types.ObjectId.isValid(id)) {
      await ChatConversation.deleteOne({ _id: id, userId });
    }

    res.json({
      success: true,
      message: 'Conversation deleted.'
    });
  } catch (error) {
    next(error);
  }
};

export const clearUserConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await ChatConversation.deleteMany({ userId });

    res.json({
      success: true,
      message: 'All conversations cleared.'
    });
  } catch (error) {
    next(error);
  }
};


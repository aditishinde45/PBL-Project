import mongoose from 'mongoose';
import { SafetyCheck } from '../models/SafetyCheck.js';
import { analyzeSafetyQuery, COMMON_SCAM_GUIDES } from '../services/safetyService.js';
import { inMemoryStore } from '../services/inMemoryStore.js';

export const checkSafety = async (req, res, next) => {
  try {
    const { type = 'message', content } = req.body;
    const userId = req.user?._id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message or link to inspect.'
      });
    }

    const analysis = analyzeSafetyQuery({ type, content });

    // Save to database
    let savedRecord = null;
    try {
      savedRecord = await SafetyCheck.create({
        userId,
        type,
        queryContent: content,
        riskLevel: analysis.riskLevel,
        riskScore: analysis.riskScore,
        headline: analysis.headline,
        reasons: analysis.reasons,
        actionAdvice: analysis.actionAdvice,
        flaggedKeywords: analysis.flaggedKeywords,
        createdAt: new Date()
      });
    } catch (e) {
      savedRecord = {
        _id: new mongoose.Types.ObjectId(),
        userId,
        type,
        queryContent: content,
        riskLevel: analysis.riskLevel,
        riskScore: analysis.riskScore,
        headline: analysis.headline,
        reasons: analysis.reasons,
        actionAdvice: analysis.actionAdvice,
        flaggedKeywords: analysis.flaggedKeywords,
        createdAt: new Date()
      };
      inMemoryStore.safetyChecks.unshift(savedRecord);
    }

    res.json({
      success: true,
      analysis,
      checkId: savedRecord?._id
    });
  } catch (error) {
    next(error);
  }
};

export const getSafetyHistory = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    let checks = [];

    try {
      checks = await SafetyCheck.find({ userId }).sort({ createdAt: -1 }).limit(20);
    } catch (e) {
      // In-memory fallback
      checks = inMemoryStore.safetyChecks
        .filter(s => s.userId?.toString() === userId?.toString())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json({
      success: true,
      count: checks.length,
      checks
    });
  } catch (error) {
    next(error);
  }
};

export const getCommonScams = async (req, res) => {
  res.json({
    success: true,
    scams: COMMON_SCAM_GUIDES
  });
};

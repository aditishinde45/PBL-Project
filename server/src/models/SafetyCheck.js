import mongoose from 'mongoose';

const safetyCheckSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['message', 'link', 'payment', 'screenshot'],
    required: true
  },
  queryContent: {
    type: String,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['safe', 'caution', 'suspicious', 'dangerous'],
    required: true
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  headline: {
    type: String,
    required: true
  },
  reasons: [{
    type: String
  }],
  actionAdvice: [{
    type: String
  }],
  flaggedKeywords: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const SafetyCheck = mongoose.model('SafetyCheck', safetyCheckSchema);

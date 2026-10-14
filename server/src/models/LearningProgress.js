import mongoose from 'mongoose';

const learningProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  currentStep: {
    type: Number,
    default: 1
  },
  completedSteps: [{
    type: Number
  }],
  percentage: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  practiceCompleted: {
    type: Boolean,
    default: false
  },
  practiceScore: {
    type: Number,
    default: 0
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

learningProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

export const LearningProgress = mongoose.model('LearningProgress', learningProgressSchema);

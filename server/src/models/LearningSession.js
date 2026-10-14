import mongoose from 'mongoose';

const learningSessionSchema = new mongoose.Schema({
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
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  helpRequests: {
    type: Number,
    default: 0
  },
  slowRequests: {
    type: Number,
    default: 0
  },
  repeatRequests: {
    type: Number,
    default: 0
  },
  screenshotUploads: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export const LearningSession = mongoose.model('LearningSession', learningSessionSchema);

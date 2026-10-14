import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema({
  stepNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  instruction: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  slowExplanation: {
    type: String,
    default: ''
  },
  visual: {
    type: {
      type: String,
      default: 'mock_screen'
    },
    screenName: {
      type: String,
      default: 'App Screen'
    },
    mockImageUrl: {
      type: String,
      default: ''
    },
    targetHighlight: {
      top: Number,
      left: Number,
      width: Number,
      height: Number,
      label: String
    },
    screenPreview: {
      header: String,
      content: String,
      footer: String
    }
  },
  expectedAction: {
    type: String,
    required: true
  },
  helpText: {
    type: String,
    required: true
  },
  translations: {
    Hindi: {
      instruction: String,
      explanation: String,
      slowExplanation: String,
      helpText: String
    },
    Marathi: {
      instruction: String,
      explanation: String,
      slowExplanation: String,
      helpText: String
    },
    Hinglish: {
      instruction: String,
      explanation: String,
      slowExplanation: String,
      helpText: String
    }
  }
});

const practiceQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctIndex: {
    type: Number,
    required: true
  },
  explanation: {
    type: String,
    required: true
  }
});

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Smartphone',
      'WhatsApp',
      'Email',
      'Google Meet',
      'Google Maps',
      'YouTube',
      'Digital Payments',
      'Computer Basics',
      'Internet',
      'Online Safety',
      'Custom'
    ]
  },
  difficulty: {
    type: String,
    enum: ['Absolute Beginner', 'Easy', 'Intermediate'],
    default: 'Absolute Beginner'
  },
  icon: {
    type: String,
    default: '📱'
  },
  description: {
    type: String,
    required: true
  },
  estimatedTime: {
    type: String,
    default: '5 mins'
  },
  isPredefined: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  steps: [stepSchema],
  practiceQuestions: [practiceQuestionSchema]
}, {
  timestamps: true
});

export const Lesson = mongoose.model('Lesson', lessonSchema);

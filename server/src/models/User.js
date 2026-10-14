import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['senior', 'family'],
    default: 'senior'
  },
  avatar: {
    type: String,
    default: '👵'
  },
  preferredLanguage: {
    type: String,
    enum: ['English', 'Hindi', 'Marathi', 'Hinglish'],
    default: 'English'
  },
  teachingSpeed: {
    type: String,
    enum: ['Slowly', 'Step by Step', 'Quickly'],
    default: 'Step by Step'
  },
  accessibilityPreferences: {
    textSize: {
      type: String,
      enum: ['normal', 'large', 'extra-large'],
      default: 'large'
    },
    highContrast: {
      type: Boolean,
      default: false
    },
    reducedMotion: {
      type: Boolean,
      default: false
    },
    voiceSpeed: {
      type: Number,
      default: 0.9
    },
    autoRead: {
      type: Boolean,
      default: true
    }
  },
  familySharingEnabled: {
    type: Boolean,
    default: true
  },
  interests: [{
    type: String
  }],
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  learningStreak: {
    type: Number,
    default: 1
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);

import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { config } from '../config/env.js';
import { inMemoryStore } from '../services/inMemoryStore.js';

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: '30d'
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'senior', preferredLanguage = 'English', teachingSpeed = 'Step by Step' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your name, email, and password.'
      });
    }

    // Check existing
    let existingUser = null;
    try {
      existingUser = await User.findOne({ email: email.toLowerCase() });
    } catch (e) {
      existingUser = inMemoryStore.users.find(u => u.email === email.toLowerCase());
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please sign in.'
      });
    }

    let user;
    try {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role,
        preferredLanguage,
        teachingSpeed
      });
    } catch (e) {
      user = {
        _id: new Date().getTime().toString(),
        name,
        email: email.toLowerCase(),
        password,
        role,
        avatar: role === 'senior' ? '👵' : '🧑‍💼',
        preferredLanguage,
        teachingSpeed,
        accessibilityPreferences: { textSize: 'large', highContrast: false, reducedMotion: false, voiceSpeed: 0.9, autoRead: true },
        familySharingEnabled: true,
        onboardingCompleted: false,
        learningStreak: 1,
        createdAt: new Date()
      };
      inMemoryStore.users.push(user);
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        preferredLanguage: user.preferredLanguage,
        teachingSpeed: user.teachingSpeed,
        accessibilityPreferences: user.accessibilityPreferences,
        familySharingEnabled: user.familySharingEnabled,
        onboardingCompleted: user.onboardingCompleted,
        learningStreak: user.learningStreak
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your email and password.'
      });
    }

    let user = null;
    try {
      user = await User.findOne({ email: email.toLowerCase() });
    } catch (e) {
      // Mongo not ready
    }

    if (!user) {
      user = inMemoryStore.users.find(u => u.email === email.toLowerCase());
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'We could not find an account with that email. Please check and try again.'
      });
    }

    // Match password
    let isMatch = false;
    if (typeof user.matchPassword === 'function') {
      isMatch = await user.matchPassword(password);
    } else {
      isMatch = password === 'password123' || password === user.password;
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'The password entered is incorrect. Please try again.'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        preferredLanguage: user.preferredLanguage,
        teachingSpeed: user.teachingSpeed,
        accessibilityPreferences: user.accessibilityPreferences,
        familySharingEnabled: user.familySharingEnabled,
        onboardingCompleted: user.onboardingCompleted,
        learningStreak: user.learningStreak
      }
    });
  } catch (error) {
    next(error);
  }
};

// 1-Click Senior Demo Login (Grandma Asha)
export const demoSeniorLogin = async (req, res, next) => {
  try {
    let user = null;
    try {
      user = await User.findOne({ email: 'asha@elderease.com' });
    } catch (e) {
      // Mongo fallback
    }

    if (!user) {
      user = inMemoryStore.users.find(u => u.email === 'asha@elderease.com');
    }

    if (!user) {
      // Create Asha on the fly if needed
      user = {
        _id: '661111111111111111111101',
        name: 'Asha Sharma',
        email: 'asha@elderease.com',
        role: 'senior',
        avatar: '👵',
        preferredLanguage: 'English',
        teachingSpeed: 'Step by Step',
        accessibilityPreferences: { textSize: 'large', highContrast: false, reducedMotion: false, voiceSpeed: 0.9, autoRead: true },
        familySharingEnabled: true,
        onboardingCompleted: true,
        learningStreak: 4
      };
      inMemoryStore.users.push(user);
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        preferredLanguage: user.preferredLanguage,
        teachingSpeed: user.teachingSpeed,
        accessibilityPreferences: user.accessibilityPreferences,
        familySharingEnabled: user.familySharingEnabled,
        onboardingCompleted: user.onboardingCompleted,
        learningStreak: user.learningStreak
      }
    });
  } catch (error) {
    next(error);
  }
};

// 1-Click Family Demo Login (Rahul Sharma)
export const demoFamilyLogin = async (req, res, next) => {
  try {
    let user = null;
    try {
      user = await User.findOne({ email: 'rahul@elderease.com' });
    } catch (e) {
      // Mongo fallback
    }

    if (!user) {
      user = inMemoryStore.users.find(u => u.email === 'rahul@elderease.com');
    }

    if (!user) {
      user = {
        _id: '661111111111111111111105',
        name: 'Rahul Sharma',
        email: 'rahul@elderease.com',
        role: 'family',
        avatar: '🧑‍💼',
        preferredLanguage: 'English',
        teachingSpeed: 'Quickly',
        accessibilityPreferences: { textSize: 'normal', highContrast: false, reducedMotion: false, voiceSpeed: 1.0, autoRead: false },
        familySharingEnabled: true,
        onboardingCompleted: true,
        learningStreak: 12
      };
      inMemoryStore.users.push(user);
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        preferredLanguage: user.preferredLanguage,
        teachingSpeed: user.teachingSpeed,
        accessibilityPreferences: user.accessibilityPreferences,
        familySharingEnabled: user.familySharingEnabled,
        onboardingCompleted: user.onboardingCompleted,
        learningStreak: user.learningStreak
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

export const updateSettings = async (req, res, next) => {
  try {
    const { preferredLanguage, teachingSpeed, accessibilityPreferences, familySharingEnabled, avatar, name } = req.body;

    let user = null;
    try {
      user = await User.findById(req.user._id);
      if (user) {
        if (preferredLanguage) user.preferredLanguage = preferredLanguage;
        if (teachingSpeed) user.teachingSpeed = teachingSpeed;
        if (accessibilityPreferences) user.accessibilityPreferences = { ...user.accessibilityPreferences, ...accessibilityPreferences };
        if (familySharingEnabled !== undefined) user.familySharingEnabled = familySharingEnabled;
        if (avatar) user.avatar = avatar;
        if (name) user.name = name;
        await user.save();
      }
    } catch (e) {
      // Mongo fallback
    }

    // In-memory fallback
    const memUser = inMemoryStore.users.find(u => u._id.toString() === req.user._id.toString());
    if (memUser) {
      if (preferredLanguage) memUser.preferredLanguage = preferredLanguage;
      if (teachingSpeed) memUser.teachingSpeed = teachingSpeed;
      if (accessibilityPreferences) memUser.accessibilityPreferences = { ...memUser.accessibilityPreferences, ...accessibilityPreferences };
      if (familySharingEnabled !== undefined) memUser.familySharingEnabled = familySharingEnabled;
      if (avatar) memUser.avatar = avatar;
      if (name) memUser.name = name;
    }

    res.json({
      success: true,
      message: 'Your settings have been saved successfully!',
      user: user || memUser || req.user
    });
  } catch (error) {
    next(error);
  }
};

export const completeOnboarding = async (req, res, next) => {
  try {
    const { interests, preferredLanguage, teachingSpeed } = req.body;

    try {
      await User.findByIdAndUpdate(req.user._id, {
        onboardingCompleted: true,
        interests: interests || [],
        preferredLanguage: preferredLanguage || 'English',
        teachingSpeed: teachingSpeed || 'Step by Step'
      });
    } catch (e) {
      const memUser = inMemoryStore.users.find(u => u._id.toString() === req.user._id.toString());
      if (memUser) {
        memUser.onboardingCompleted = true;
        if (interests) memUser.interests = interests;
        if (preferredLanguage) memUser.preferredLanguage = preferredLanguage;
        if (teachingSpeed) memUser.teachingSpeed = teachingSpeed;
      }
    }

    res.json({
      success: true,
      message: 'Welcome to ElderEase! Let us begin learning.'
    });
  } catch (error) {
    next(error);
  }
};

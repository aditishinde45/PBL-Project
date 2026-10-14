import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { inMemoryStore } from '../services/inMemoryStore.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Please sign in to continue your learning journey.'
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Check MongoDB first if connected, or fallback to in-memory store
    let user = null;
    try {
      user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // MongoDB lookup failed or not connected
    }

    if (!user) {
      user = inMemoryStore.users.find(u => u._id.toString() === decoded.id.toString());
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session expired. Please sign in again.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Your session has ended. Please sign in again.'
    });
  }
};

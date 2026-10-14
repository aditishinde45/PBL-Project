import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { seedDatabase } from './seeds/seedData.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import learningRoutes from './routes/learningRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import visionRoutes from './routes/visionRoutes.js';
import safetyRoutes from './routes/safetyRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import familyRoutes from './routes/familyRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    product: 'ElderEase',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/vision', visionRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/family', familyRoutes);

// Fallback 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'The page or lesson you were looking for was not found.'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    const maxAttempts = 10;
    const startPort = Number(config.port) || 5001;

    const attemptListen = (port, attemptsLeft) => {
      const server = app.listen(port);

      server.on('listening', () => {
        console.log(`====================================================`);
        console.log(`🌟 ElderEase API Server is running on port ${port}`);
        console.log(`   Health: http://localhost:${port}/api/health`);
        console.log(`   Client URL: ${config.clientUrl}`);
        console.log(`====================================================`);
      });

      server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE' && attemptsLeft > 0) {
          console.warn(`Port ${port} is in use. Trying port ${port + 1}...`);
          // Try next port
          attemptListen(port + 1, attemptsLeft - 1);
        } else {
          console.error('Failed to start server:', err);
          process.exit(1);
        }
      });
    };

    attemptListen(startPort, maxAttempts);
  } catch (error) {
    console.error('Failed to start ElderEase server:', error);
    process.exit(1);
  }
};

startServer();

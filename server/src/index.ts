import express from 'express';
import cors from 'cors';
import { config } from './config';
import { apiRouter } from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middleware
app.use(
  cors({
    origin: '*', // Allows frontend on :3000 and browser extensions
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    product: 'ElderEase',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api', apiRouter);

// Centralized error handling
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`=========================================`);
  console.log(`  ElderEase Backend Server Running`);
  console.log(`  Listening on: http://localhost:${config.port}`);
  console.log(`  Health Check: http://localhost:${config.port}/api/health`);
  console.log(`=========================================`);
});

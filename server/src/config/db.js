import mongoose from 'mongoose';
import { config } from './env.js';

mongoose.set('bufferCommands', false);

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });
    isConnected = true;
    console.log(`[Database] Connected to MongoDB at: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`[Database] MongoDB connection notice (${error.message}). Running in Resilient Fallback Mode.`);
    // We do not exit process; models can still function or use graceful memory layer
  }
};

export const getDBStatus = () => ({
  connected: mongoose.connection.readyState === 1,
  state: mongoose.connection.readyState, // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  uri: config.mongoUri
});

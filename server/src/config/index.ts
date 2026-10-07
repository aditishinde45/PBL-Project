import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  jwtSecret: process.env.JWT_SECRET || 'elderease_jwt_super_secret_dev_key_2026_elderly_care',
  aiApiKey: process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
};

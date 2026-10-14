import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded whether running from server, PBL-Project, or workspace root
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });
dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: false });
dotenv.config({ override: false });

let rawMongoUri = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elderease';
if (rawMongoUri.includes('mongodb+srv://') && rawMongoUri.includes('.mongodb.net/?')) {
  rawMongoUri = rawMongoUri.replace('.mongodb.net/?', '.mongodb.net/elderease?');
} else if (rawMongoUri.includes('mongodb+srv://') && rawMongoUri.endsWith('.mongodb.net/')) {
  rawMongoUri += 'elderease';
} else if (rawMongoUri.includes('mongodb+srv://') && rawMongoUri.endsWith('.mongodb.net')) {
  rawMongoUri += '/elderease';
}

export const config = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: rawMongoUri,
  jwtSecret: process.env.JWT_SECRET || 'elderease_senior_secure_jwt_secret_2026',
  ai: {
    provider: process.env.AI_PROVIDER || 'custom',
    baseUrl: process.env.AI_BASE_URL || (process.env.GEMINI_API ? 'https://generativelanguage.googleapis.com/v1beta/openai' : 'https://api.openai.com/v1'),
    apiKey: process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GEMINI_API || '',
    model: process.env.AI_MODEL || (process.env.GEMINI_API ? 'gemini-3.5-flash' : 'gpt-4o-mini'),
    visionModel: process.env.AI_VISION_MODEL || (process.env.GEMINI_API ? 'gemini-3.5-flash' : 'gpt-4o-mini')
  }
};

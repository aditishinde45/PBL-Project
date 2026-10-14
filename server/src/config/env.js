
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load local .env files without overriding existing environment variables.
// Render's environment variables will take priority.
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
  override: false,
});

dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
  override: false,
});

dotenv.config({ override: false });

// MongoDB configuration
let rawMongoUri = process.env.MONGODB_URL;
console.log(
  '[MongoDB Debug] MONGODB_URL exists:',
  Boolean(process.env.MONGODB_URL)
);
console.log('[MongoDB Debug] NODE_ENV:', process.env.NODE_ENV);
if (!rawMongoUri) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'MONGODB_URL is required in production. Set it in Render Environment.'
    );
  }

  // Local development fallback only
  rawMongoUri = 'mongodb://127.0.0.1:27017/elderease';
}

// Add the database name if an Atlas URL does not specify one.
if (
  rawMongoUri.startsWith('mongodb+srv://') &&
  rawMongoUri.includes('.mongodb.net/?')
) {
  rawMongoUri = rawMongoUri.replace(
    '.mongodb.net/?',
    '.mongodb.net/elderease?'
  );
} else if (
  rawMongoUri.startsWith('mongodb+srv://') &&
  rawMongoUri.endsWith('.mongodb.net/')
) {
  rawMongoUri += 'elderease';
} else if (
  rawMongoUri.startsWith('mongodb+srv://') &&
  rawMongoUri.endsWith('.mongodb.net')
) {
  rawMongoUri += '/elderease';
}

export const config = {
  port: process.env.PORT || 5001,

  nodeEnv: process.env.NODE_ENV || 'development',

  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  mongoUri: rawMongoUri,

  jwtSecret:
    process.env.JWT_SECRET ||
    'elderease_senior_secure_jwt_secret_2026',

  ai: {
    provider: process.env.AI_PROVIDER || 'custom',

    baseUrl:
      process.env.AI_BASE_URL ||
      (process.env.GEMINI_API
        ? 'https://generativelanguage.googleapis.com/v1beta/openai'
        : 'https://api.openai.com/v1'),

    apiKey:
      process.env.AI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.GEMINI_API ||
      '',

    model:
      process.env.AI_MODEL ||
      (process.env.GEMINI_API ? 'gemini-3.5-flash' : 'gpt-4o-mini'),

    visionModel:
      process.env.AI_VISION_MODEL ||
      (process.env.GEMINI_API ? 'gemini-3.5-flash' : 'gpt-4o-mini'),
  },
};

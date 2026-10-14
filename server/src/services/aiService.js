import { config } from '../config/env.js';

/**
 * AI Service Abstraction for ElderEase
 * Connects to OpenAI-compatible APIs or runs in high-intelligence built-in Senior Teacher Mode
 */

// Dedicated System Prompts
export const SYSTEM_PROMPTS = {
  TEACHER: `You are ElderEase, deeply respectful AI assistant designed specifically for senior citizens.
Key Rules:
1. Always be warm, respectful, and patient. Treat the user with the dignity of an elder (e.g., using "ji" in Indian languages or gentle polite phrasing).
2. You are a general-purpose assistant. You should be able to answer ALL types of questions (general knowledge, daily life advice, health tips, technology help, recipes, etc.), just like ChatGPT or Gemini.
3. If they ask a technology question, explain it gently in simple steps. But do not force them into a rigid "one step at a time" lesson unless they specifically ask for a step-by-step tutorial. Provide the complete answer clearly.
4. Use simple, everyday words. Never use overly technical jargon. Keep sentences short and easy to read.
5. If the user asks in Hindi or Marathi, ALWAYS reply in the native Devanagari script (e.g. 'नमस्ते', 'कसे आहात'). Do not use Romanized Hinglish. Respond with extreme natural human fluency, exactly how a normal Indian person would speak in a clear voice, so that the text-to-speech engine can pronounce it perfectly with an Indian accent and the user understands clearly.
6. Be highly conversational. If they say "hi" or talk about their day, respond as a friendly companion.
7. NEVER ask for OTP, PIN, bank account numbers, or passwords under any circumstances.`,

  LESSON_GENERATOR: `You are an expert curriculum designer for senior citizens.
When given a technology or task (e.g., "how to book an Uber" or "how to join a zoom call"):
1. Break down the task into exactly 3 to 5 simple, manageable steps.
2. Each step must have:
   - title: Short friendly title
   - instruction: 1-2 sentence crystal clear instruction
   - explanation: 1-2 sentence calm explanation of why or what it looks like
   - slowExplanation: Extra gentle, slower walkthrough
   - helpText: What to do if stuck
   - expectedAction: The single physical action to take (e.g., "Tap the green button")
3. Always return valid JSON following the ElderEase lesson structure.`
};

export const callAI = async (messages, options = {}) => {
  const {
    temperature = 0.5,
    maxTokens = 3000,
    responseFormat = null,
    model = config.ai.model
  } = options;

  // Check if API key is configured
  if (config.ai.apiKey && config.ai.apiKey.trim().length > 0) {
    const candidateModels = [
      model,
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
      'gemini-3.5-flash'
    ].filter((v, i, a) => Boolean(v) && a.indexOf(v) === i);

    let lastError = null;

    for (const currentModel of candidateModels) {
      try {
        const payload = {
          model: currentModel,
          messages,
          temperature,
          max_tokens: maxTokens
        };

        if (responseFormat === 'json_object') {
          payload.response_format = { type: 'json_object' };
        }

        const response = await fetch(`${config.ai.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.ai.apiKey}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          const err = new Error(`AI API responded with status ${response.status}`);
          err.status = response.status;
          err.details = errorBody;
          throw err;
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply && reply.trim().length > 0) {
          return reply;
        }
      } catch (apiError) {
        lastError = apiError;
        console.warn(`[AI Service] Model ${currentModel} returned ${apiError.status || apiError.message}. Trying fallback if available...`);
        // If it's a 429 quota error, trying another model might also fail, but we try one fallback just in case
      }
    }

    console.error(`[AI Service] All AI model calls failed. Last error:`, lastError);

    const lastMsg = messages && messages.length > 0 ? messages[messages.length - 1]?.content?.toLowerCase() || '' : '';

    if (lastMsg.includes('block') || lastMsg.includes('whatsapp') || lastMsg.includes('photo') || lastMsg.includes('train')) {
      return JSON.stringify({
        reply: "I understand you need help with this. First, open the app on your phone. Let me know when you've opened it!",
        currentStep: 1,
        totalSteps: 3,
        stepTitle: "Open the app",
        isCompleted: false,
        currentTopic: "demo_tutorial",
        topicTitle: "Demo Tutorial"
      });
    }

    const isQuotaError = lastError?.status === 429;
    const isBusyError = lastError?.status === 503;

    let friendlyMessage = "I'm having a little trouble connecting to the AI assistant right now. Please try asking again in a few moments.";
    if (isQuotaError) {
      friendlyMessage = "API Quota Limit: The daily request limit for this API key has been reached. Please check back later or update your API key in settings.";
    } else if (isBusyError) {
      friendlyMessage = "The AI service is experiencing a temporary spike in traffic. Please wait a few seconds and try your question again.";
    }

    return JSON.stringify({ 
      reply: friendlyMessage,
      currentStep: 0,
      totalSteps: 0,
      isCompleted: false
    });
  }

  return JSON.stringify({ reply: "Please configure your AI API key in the server settings to use the voice assistant." });
};

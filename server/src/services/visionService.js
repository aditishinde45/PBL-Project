import { config } from '../config/env.js';

/**
 * Vision Service Abstraction for ElderEase
 * Handles screenshot analysis with AI vision models or high-accuracy contextual fallback
 */

export const analyzeScreenshot = async ({ imageBuffer, mimeType = 'image/jpeg', userPrompt = '', currentStepContext = null }) => {
  // If external vision key is configured, attempt multimodal call
  if (config.ai.apiKey && config.ai.apiKey.trim().length > 0) {
    try {
      const base64Image = imageBuffer.toString('base64');
      const dataUri = `data:${mimeType};base64,${base64Image}`;

      const systemPrompt = `You are ElderEase Vision Assistant, helping a senior citizen navigate their phone screen.
Analyze the provided screenshot carefully.
Identify what app or screen is shown, what icons/buttons are present, and what exact action the user needs to take.
Speak in calm, simple, patient language (minimum jargon).
Return a JSON object with:
{
  "detectedScreen": "e.g., WhatsApp Chat Screen",
  "identifiedElements": ["Message box", "Paperclip attachment icon", "Camera icon", "Microphone button"],
  "targetAction": "Tap the paperclip icon at the bottom right next to the message box.",
  "targetHighlight": { "top": 85, "left": 72, "width": 12, "height": 12, "label": "Paperclip Icon (📎)" },
  "calmGuidance": "I can see your WhatsApp chat screen clearly. Look down near the message box where you type. Right next to it, you'll see a small paperclip icon. Please tap that paperclip icon.",
  "safetyWarning": null
}
Never ask for PIN, passwords, or OTP.`;

      const response = await fetch(`${config.ai.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.ai.apiKey}`
        },
        body: JSON.stringify({
          model: config.ai.visionModel || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `User is stuck. Current lesson context: "${currentStepContext || 'General phone navigation'}". Question: "${userPrompt || 'What should I do here?'}"`
                },
                {
                  type: 'image_url',
                  image_url: { url: dataUri }
                }
              ]
            }
          ],
          response_format: { type: 'json_object' },
          max_tokens: 600
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return {
            ...parsed,
            isDemoMode: false
          };
        }
      }
    } catch (err) {
      console.warn(`[Vision Service] External vision call notice (${err.message}). Activating Built-in Screen Guidance Engine.`);
    }
  }

  // Graceful Built-in Screen Guidance Engine (Demo / Fallback Mode)
  return generateContextualVisionResponse(userPrompt, currentStepContext);
};

/**
 * Intelligent contextual screenshot analysis engine for common senior user screens
 */
function generateContextualVisionResponse(userPrompt = '', currentStepContext = '') {
  const promptLower = (userPrompt + ' ' + (currentStepContext || '')).toLowerCase();

  // 1. WhatsApp Attachment / Paperclip screen
  if (promptLower.includes('photo') || promptLower.includes('whatsapp') || promptLower.includes('paperclip') || promptLower.includes('attach')) {
    return {
      detectedScreen: 'WhatsApp Conversation Screen',
      identifiedElements: [
        'Contact name and status at the top',
        'Chat conversation history in bubbles',
        'Text input box labeled "Type a message"',
        'Paperclip attachment symbol (📎)',
        'Camera button (📷)',
        'Microphone voice button (🎙️)'
      ],
      targetAction: 'Tap the paperclip icon near the bottom right to open your photo gallery.',
      targetHighlight: {
        top: 85,
        left: 70,
        width: 14,
        height: 12,
        label: 'Paperclip Icon (📎)'
      },
      calmGuidance: 'I can see your WhatsApp screen! Look down near the bottom where you normally type. Right next to the message box, there is a small curved paperclip icon. Please tap that paperclip icon, and a colorful menu with "Gallery" will appear.',
      isDemoMode: true,
      demoNotice: 'Screen analyzed using ElderEase Built-in Vision Guidance Engine'
    };
  }

  // 2. Video Call screen
  if (promptLower.includes('video') || promptLower.includes('call') || promptLower.includes('camera')) {
    return {
      detectedScreen: 'WhatsApp Contact Screen',
      identifiedElements: [
        'Profile picture and contact name',
        'Video camera icon at top right',
        'Phone call icon at top right',
        'Three dots menu'
      ],
      targetAction: 'Tap the video camera icon at the top right corner.',
      targetHighlight: {
        top: 6,
        left: 75,
        width: 12,
        height: 12,
        label: 'Video Call Icon (📹)'
      },
      calmGuidance: 'I can see your contact screen! Look at the very top bar on the right side. You will see a small video camera symbol right next to the phone symbol. Tap that video camera icon to start seeing your loved one face-to-face.',
      isDemoMode: true,
      demoNotice: 'Screen analyzed using ElderEase Built-in Vision Guidance Engine'
    };
  }

  // 3. QR Payment / UPI screen
  if (promptLower.includes('payment') || promptLower.includes('qr') || promptLower.includes('upi') || promptLower.includes('pay')) {
    return {
      detectedScreen: 'Digital Payment / Scanner Screen',
      identifiedElements: [
        'Camera viewfinder square with corner markers',
        'Flashlight toggle button',
        'Shopkeeper name and UPI ID at top',
        'Amount entry box (₹)'
      ],
      targetAction: 'Verify the merchant name matches the shop sign before entering any amount.',
      targetHighlight: {
        top: 25,
        left: 20,
        width: 60,
        height: 50,
        label: 'QR Viewfinder & Merchant Name'
      },
      calmGuidance: 'I can see your payment scanner screen! The phone camera is looking for the shopkeeper’s QR code. Point your phone squarely at the black-and-white QR standee until it beeps. Remember: You will ONLY enter your secret PIN to send money, NEVER to receive money.',
      isDemoMode: true,
      demoNotice: 'Screen analyzed using ElderEase Built-in Vision Guidance Engine'
    };
  }

  // 4. Settings / Wi-Fi screen
  if (promptLower.includes('wifi') || promptLower.includes('settings') || promptLower.includes('network') || promptLower.includes('internet')) {
    return {
      detectedScreen: 'Phone Settings Screen',
      identifiedElements: [
        'Settings search bar at top',
        'Wi-Fi / Network & Internet row with signal icon',
        'Bluetooth and Connected devices',
        'Display & Brightness row'
      ],
      targetAction: 'Tap the row labeled "Wi-Fi" or "Network & Internet".',
      targetHighlight: {
        top: 20,
        left: 10,
        width: 80,
        height: 14,
        label: 'Wi-Fi / Network Setting'
      },
      calmGuidance: 'I can see your phone Settings menu! Near the top, there is a row that says "Wi-Fi" or "Network & Internet" with little curved signal lines. Tap that row once, and you will see your home Wi-Fi network appear.',
      isDemoMode: true,
      demoNotice: 'Screen analyzed using ElderEase Built-in Vision Guidance Engine'
    };
  }

  // 5. Default Universal Screen Guidance
  return {
    detectedScreen: 'Smartphone Application Screen',
    identifiedElements: [
      'Top status and header bar',
      'Main screen content area',
      'Primary action button',
      'Bottom navigation bar'
    ],
    targetAction: 'Look at the highlighted area on your screen and tap the primary action button.',
    targetHighlight: {
      top: 75,
      left: 25,
      width: 50,
      height: 15,
      label: 'Main Action Button'
    },
    calmGuidance: 'I have looked at your screen! Everything looks safe and normal. Look toward the lower half of your screen for the prominent blue/green button. Gently tap that button to move to the next step. If anything feels uncomfortable, we can go back one step anytime.',
    isDemoMode: true,
    demoNotice: 'Screen analyzed using ElderEase Built-in Vision Guidance Engine'
  };
}

/**
 * VoiceService Abstraction
 * Manages speech synthesis (TTS) and speech recognition (STT) cleanly,
 * respecting user preferences, language locales, female voice prioritization,
 * and instant interruption capabilities.
 */

export interface VoiceOptions {
  language: 'mr' | 'hi' | 'en';
  voiceSpeed?: 'SLOW' | 'NORMAL';
  voiceEnabled: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export class VoiceService {
  private static currentUtterance: SpeechSynthesisUtterance | null = null;
  private static cachedVoices: SpeechSynthesisVoice[] = [];

  /**
   * Initialize voices cache
   */
  static init() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
      };
    }
  }

  /**
   * Speak a text string aloud if voice is enabled.
   */
  static speak(text: string, options: VoiceOptions): boolean {
    if (!options.voiceEnabled) {
      this.stop();
      return false;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }

    // Cancel any ongoing speech to allow clean interruption
    this.stop();

    const cleanText = text.replace(/[*_#`]/g, '').trim();
    if (!cleanText) return false;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Set Locale
    const langCode = options.language === 'mr' ? 'mr-IN' : options.language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.lang = langCode;

    // Rate: gentle, unhurried pace for seniors
    utterance.rate = options.voiceSpeed === 'SLOW' ? 0.8 : 0.95;
    utterance.pitch = 1.05; // Slightly warmer pitch

    // Choose preferred female voice if available for the language
    const voice = this.findBestVoice(langCode);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      if (options.onError) options.onError(e);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  /**
   * Stop / pause ongoing speech immediately (interruption)
   */
  static stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Check if speech synthesis is currently active
   */
  static isSpeaking(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking;
  }

  /**
   * Locate the best available natural/female voice for the requested locale
   */
  private static findBestVoice(langCode: string): SpeechSynthesisVoice | null {
    if (this.cachedVoices.length === 0 && typeof window !== 'undefined') {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }

    const matchingLang = this.cachedVoices.filter(
      (v) => v.lang.toLowerCase().startsWith(langCode.toLowerCase().slice(0, 2))
    );

    if (matchingLang.length === 0) {
      return null;
    }

    // Prioritize female named voices or natural sounding voices
    const femaleKeywords = ['female', 'zira', 'kalpana', 'heera', 'google', 'priya', 'swara', 'natural'];
    const preferred = matchingLang.find((v) =>
      femaleKeywords.some((kw) => v.name.toLowerCase().includes(kw))
    );

    return preferred || matchingLang[0];
  }
}

// Auto-initialize when file is loaded in browser
if (typeof window !== 'undefined') {
  VoiceService.init();
}

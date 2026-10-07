import { useState, useEffect, useCallback } from 'react';
import { usePreferences } from '../context/PreferencesContext';

export function useSpeechSynthesis() {
  const { language, voiceSpeed, ttsEnabled } = usePreferences();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !ttsEnabled || !text) return;

      try {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Language code
        if (language === 'mr') utterance.lang = 'mr-IN';
        else if (language === 'hi') utterance.lang = 'hi-IN';
        else utterance.lang = 'en-IN';

        // Speed setting (SLOW for elderly clarity)
        utterance.rate = voiceSpeed === 'SLOW' ? 0.82 : 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis error:', err);
        setIsSpeaking(false);
      }
    },
    [supported, ttsEnabled, language, voiceSpeed]
  );

  const stop = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [supported]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported: supported,
  };
}

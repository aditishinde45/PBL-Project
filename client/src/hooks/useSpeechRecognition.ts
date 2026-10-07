import { useState, useEffect, useCallback } from 'react';
import { usePreferences } from '../context/PreferencesContext';

export function useSpeechRecognition() {
  const { language } = usePreferences();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = false;
      recognizer.interimResults = true;

      // Map language
      if (language === 'mr') recognizer.lang = 'mr-IN';
      else if (language === 'hi') recognizer.lang = 'hi-IN';
      else recognizer.lang = 'en-IN';

      recognizer.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognizer.onresult = (event: any) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recognizer.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setError('Microphone permission is required to listen.');
        } else if (event.error !== 'no-speech') {
          setError('Could not understand clearly, please try again.');
        }
      };

      recognizer.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognizer);
    } else {
      setError('Voice recognition is not supported in this browser.');
    }
  }, [language]);

  const startListening = useCallback(() => {
    if (!recognition) return;
    try {
      setTranscript('');
      setError(null);
      recognition.start();
    } catch (e) {
      console.warn('Recognition already started or busy');
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (!recognition) return;
    try {
      recognition.stop();
    } catch (e) {
      console.warn('Recognition could not stop');
    }
  }, [recognition]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: !!recognition,
  };
}

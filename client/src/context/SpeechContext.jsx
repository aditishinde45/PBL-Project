import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAccessibility } from './AccessibilityContext.jsx';

const SpeechContext = createContext(null);

export const SpeechProvider = ({ children }) => {
  const { voiceSpeed, language } = useAccessibility();

  // Voice Interaction States: 'idle' | 'listening' | 'processing' | 'speaking' | 'error'
  const [voiceState, setVoiceState] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [lastSpokenText, setLastSpokenText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(true);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const transcriptRef = useRef('');
  const onCompleteCallbackRef = useRef(null);
  const silenceTimerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasSpeechSynthesis = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    synthRef.current = hasSpeechSynthesis ? window.speechSynthesis : null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const hasRecognition = Boolean(SpeechRecognition);

    setIsSupported(hasSpeechSynthesis && hasRecognition);
    setIsSpeechRecognitionSupported(hasRecognition);

    return () => {
      cleanupRecognition();
    };
  }, []);

  const cleanupRecognition = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
  };

  const startListening = async (onComplete = null) => {
    // Stop any ongoing speech output first
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
    }

    setSpeechError(null);
    transcriptRef.current = '';
    setTranscript('');
    onCompleteCallbackRef.current = typeof onComplete === 'function' ? onComplete : null;

    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

    if (!SpeechRecognition) {
      setIsSpeechRecognitionSupported(false);
      setSpeechError("Voice input is not supported in this browser. Please use Google Chrome, Edge, or Safari, or type your question below.");
      setVoiceState('error');
      return;
    }

    cleanupRecognition();

    // Check / request microphone permission explicitly
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
      } catch (micErr) {
        console.warn('[Microphone permission notice]:', micErr);
        if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
          setSpeechError("Microphone access is blocked. Please tap the lock or microphone icon in your browser address bar to allow microphone access.");
          setVoiceState('error');
          return;
        }
      }
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Map language
      if (language === 'Hindi') recognition.lang = 'hi-IN';
      else if (language === 'Marathi') recognition.lang = 'mr-IN';
      else recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setVoiceState('listening');
        setSpeechError(null);
      };

      recognition.onresult = (event) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }

        const trimmed = fullTranscript.trim();
        transcriptRef.current = trimmed;
        setTranscript(trimmed);

        // Reset silence timer on hearing new words
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // When the user speaks, wait 2.5 seconds of silence before auto-asking
        if (trimmed.length > 0) {
          silenceTimerRef.current = setTimeout(() => {
            stopListening();
          }, 2500);
        }
      };

      recognition.onerror = (event) => {
        console.warn('[Speech Recognition error]:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setSpeechError("Microphone access is blocked. Please tap the lock/camera/mic icon in your address bar and allow microphone access.");
          setVoiceState('error');
        } else if (event.error === 'audio-capture') {
          setSpeechError("No microphone detected. Please connect or enable your microphone, or type your question below.");
          setVoiceState('error');
        } else if (event.error === 'network') {
          setSpeechError("Voice service connection issue. Please check your internet connection or type your question below.");
          setVoiceState('error');
        } else if (event.error === 'no-speech') {
          if (!transcriptRef.current) {
            setSpeechError("I didn’t hear any words. Please tap 'Tap to Speak' and speak near your device microphone.");
            setVoiceState('idle');
          }
        }
      };

      recognition.onend = () => {
        setVoiceState(prev => (prev === 'listening' ? 'idle' : prev));
        const finalText = transcriptRef.current?.trim() || '';
        if (finalText && onCompleteCallbackRef.current) {
          const cb = onCompleteCallbackRef.current;
          onCompleteCallbackRef.current = null;
          cb(finalText);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setVoiceState('listening');
    } catch (e) {
      console.warn('[Speech setup error]:', e.message);
      setSpeechError("Unable to start microphone. Please try again or type your question below.");
      setVoiceState('error');
    }
  };

  const stopListening = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    const finalText = transcriptRef.current?.trim() || '';

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    setVoiceState('idle');

    if (finalText && onCompleteCallbackRef.current) {
      const cb = onCompleteCallbackRef.current;
      onCompleteCallbackRef.current = null;
      cb(finalText);
    }
  };

  const clearTranscript = () => {
    transcriptRef.current = '';
    setTranscript('');
    setSpeechError(null);
  };

  const speak = (text, onComplete = null) => {
    if (typeof window === 'undefined' || isMuted || !text) {
      if (onComplete) onComplete();
      return;
    }

    const synth = window.speechSynthesis;
    if (!synth || !('SpeechSynthesisUtterance' in window)) {
      if (onComplete) onComplete();
      return;
    }

    // Clean text of markdown asterisks or technical formatting before speaking
    const cleanText = String(text)
      .replace(/[*_#`~]/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .trim();

    if (!cleanText) {
      if (onComplete) onComplete();
      return;
    }

    try {
      synth.cancel();
      synth.resume();
    } catch (e) {
      // Some browsers throw when resuming or cancelling before speaking begins.
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Auto-detect Hindi/Marathi (Devanagari script)
    const hasDevanagari = /[\u0900-\u097F]/.test(cleanText);
    let speakLang = language;
    if (hasDevanagari && language === 'English') {
      speakLang = 'Hindi'; // Fallback to Hindi TTS for Devanagari text
    }

    utterance.lang = speakLang === 'Hindi' ? 'hi-IN' : speakLang === 'Marathi' ? 'mr-IN' : 'en-IN';

    // Set appropriate speed: Regional TTS engines sound garbled if too fast
    let defaultRate = (speakLang === 'Hindi' || speakLang === 'Marathi') ? 0.75 : 0.9;
    
    // If the user hasn't explicitly set a custom voiceSpeed, use the clearer defaultRate
    utterance.rate = Number(voiceSpeed) || defaultRate;
    utterance.pitch = 1.0;

    const voices = synth.getVoices();
    if (voices && voices.length > 0) {
      let targetLang = 'en';
      if (speakLang === 'Hindi') targetLang = 'hi';
      else if (speakLang === 'Marathi') targetLang = 'mr';

      // First try to find voices matching the target language
      let targetVoices = voices.filter(v => v.lang && (v.lang.toLowerCase().startsWith(targetLang) || v.lang.toLowerCase().includes(targetLang)));

      // CRITICAL FALLBACK: Many devices lack Marathi ('mr-IN') voices. 
      // Since Marathi uses Devanagari script, Hindi ('hi-IN') can read it perfectly in an Indian accent!
      if (targetLang === 'mr' && targetVoices.length === 0) {
        targetVoices = voices.filter(v => v.lang && (v.lang.toLowerCase().startsWith('hi') || v.lang.toLowerCase().includes('hi')));
      }

      // SECOND FALLBACK: Try to find ANY Indian voice ('en-IN', etc) if pure Hindi/Marathi is missing
      if (hasDevanagari && targetVoices.length === 0) {
        targetVoices = voices.filter(v => v.lang && v.lang.toLowerCase().includes('in'));
      }

      const bestVoice = targetVoices.find(v => v.name.includes('Google')) || targetVoices[0];

      if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang; // Ensure utterance matches the actual voice chosen
      }
    }

    utterance.onstart = () => {
      setVoiceState('speaking');
      setLastSpokenText(cleanText);
    };

    utterance.onend = () => {
      setVoiceState('idle');
      if (onComplete) onComplete();
    };

    utterance.onerror = () => {
      setVoiceState('idle');
      if (onComplete) onComplete();
    };

    synth.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setVoiceState('idle');
  };

  const replay = () => {
    if (lastSpokenText) {
      speak(lastSpokenText);
    }
  };

  const toggleMute = () => {
    if (!isMuted) {
      stopSpeaking();
    }
    setIsMuted(!isMuted);
  };

  const value = {
    voiceState,
    setVoiceState,
    transcript,
    setTranscript,
    clearTranscript,
    speechError,
    setSpeechError,
    isMuted,
    isSupported,
    isSpeechRecognitionSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    replay,
    toggleMute
  };

  return <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>;
};

export const useSpeech = () => {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error('useSpeech must be used within SpeechProvider');
  }
  return context;
};

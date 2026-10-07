import React, { useState, useEffect, useRef } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { api } from '../services/api';
import { VoiceService } from '../services/voiceService';
import { VisualTarget, VisualTargetProps } from './common/VisualTarget';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  ArrowLeft,
  Sparkles,
  BookOpen,
  AlertCircle,
  Square,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'SENIOR' | 'AI';
  text: string;
  visualTarget?: VisualTargetProps;
  taskData?: {
    taskId: string;
    taskSlug: string;
    taskTitle: string;
    taskStep?: number;
  };
}

interface ChatViewProps {
  onBack: () => void;
  onStartTask: (taskId: string) => void;
  initialTaskContext?: {
    currentTaskSlug?: string;
    currentStepIndex?: number;
  };
}

export const ChatView: React.FC<ChatViewProps> = ({
  onBack,
  onStartTask,
  initialTaskContext,
}) => {
  const { t, language, voiceSpeed, voiceEnabled, setVoiceEnabled } = usePreferences();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  // Stateful Context Tracking
  const [activeTaskSlug, setActiveTaskSlug] = useState<string | undefined>(
    initialTaskContext?.currentTaskSlug
  );
  const [activeStepIndex, setActiveStepIndex] = useState<number | undefined>(
    initialTaskContext?.currentStepIndex
  );
  const [confusionLevel, setConfusionLevel] = useState<number>(1);
  const [lastAIResponseText, setLastAIResponseText] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize initial greeting message
  useEffect(() => {
    let initialGreeting = '';
    if (language === 'mr') {
      initialGreeting = 'नमस्कार आजी! मी तुमची डिजिटल मदतनीस ElderEase. मला काहीही विचारा — जसे की "व्हॉट्सॲपवर फोटो कसा पाठवू", किंवा कोणताही प्रश्न.';
    } else if (language === 'hi') {
      initialGreeting = 'नमस्ते आजी! मैं आपकी डिजिटल साथी ElderEase हूँ। मुझसे कुछ भी पूछिए — जैसे "व्हाट्सएप पर फोटो कैसे भेजें", या कोई सवाल।';
    } else {
      initialGreeting = 'Hello Aaji! I am your companion ElderEase. Ask me anything — like "How do I send a WhatsApp photo", or any question.';
    }

    setMessages([
      {
        id: 'msg-welcome',
        sender: 'AI',
        text: initialGreeting,
      },
    ]);
    setLastAIResponseText(initialGreeting);

    if (voiceEnabled) {
      VoiceService.speak(initialGreeting, {
        language,
        voiceSpeed,
        voiceEnabled,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    }

    return () => {
      VoiceService.stop();
    };
  }, [language]);

  // Auto scroll to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Speech helper
  const handleSpeak = (text: string) => {
    if (!voiceEnabled) return;
    VoiceService.speak(text, {
      language,
      voiceSpeed,
      voiceEnabled,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const stopSpeaking = () => {
    VoiceService.stop();
    setIsSpeaking(false);
  };

  // Toggle Listening with immediate TTS stop (turn-taking interruption)
  const toggleListening = () => {
    // If AI is currently speaking, stop it immediately when user wants to talk
    if (isSpeaking) {
      stopSpeaking();
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    setMicError(null);
    stopSpeaking(); // Interruption guarantee

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError(t('assistant.micNotice'));
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          sendMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setMicError(t('assistant.micNotice'));
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Could not start recognition:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Process message through stateful conversation engine
  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Stop ongoing speech immediately
    stopSpeaking();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'SENIOR',
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      const history = messages.slice(-4).map((m) => ({
        role: m.sender === 'SENIOR' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await api.chatWithAi(trimmed, history, language, {
        currentTaskSlug: activeTaskSlug,
        currentStepIndex: activeStepIndex,
        voiceEnabled,
        userConfusionLevel: confusionLevel,
        lastAIResponse: lastAIResponseText,
      });

      const replyText = res.message || res.reply;
      setLastAIResponseText(replyText);

      // Update state tracking from structured response
      if (res.explanationLevel) {
        setConfusionLevel(res.explanationLevel);
      }
      if (res.taskSlug) {
        setActiveTaskSlug(res.taskSlug);
      }
      if (res.taskStep !== undefined) {
        setActiveStepIndex(res.taskStep - 1);
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'AI',
        text: replyText,
        visualTarget: res.visualTarget,
        taskData:
          res.mode === 'GUIDED_TASK' && res.taskId
            ? {
                taskId: res.taskId,
                taskSlug: res.taskSlug || '',
                taskTitle: res.taskTitle || '',
                taskStep: res.taskStep,
              }
            : undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Speak aloud only if voice is enabled and response requested speech
      if (voiceEnabled && res.speak !== false) {
        handleSpeak(replyText);
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'AI',
        text: t('common.errorGeneral'),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 2rem',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '3px solid var(--border-light)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--border-strong)',
            backgroundColor: 'var(--bg-subtle)',
            fontSize: 'var(--font-md)',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={24} />
          {t('assistant.back')}
        </button>

        <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, margin: 0 }}>
          {t('assistant.title')}
        </h2>

        {/* Global Accessible Voice Toggle in Header */}
        <button
          onClick={() => {
            const nextVal = !voiceEnabled;
            setVoiceEnabled(nextVal);
            if (!nextVal) stopSpeaking();
          }}
          aria-label={voiceEnabled ? 'Turn voice off' : 'Turn voice on'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: `3px solid ${voiceEnabled ? 'var(--brand-primary)' : 'var(--border-strong)'}`,
            backgroundColor: voiceEnabled ? 'var(--brand-surface)' : 'var(--bg-subtle)',
            color: voiceEnabled ? 'var(--brand-text)' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: 'var(--font-base)',
            cursor: 'pointer',
          }}
        >
          {voiceEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          <span>{voiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}</span>
        </button>
      </header>

      {/* Main Chat Messages List */}
      <main
        style={{
          flex: 1,
          maxWidth: '900px',
          width: '100%',
          margin: '0 auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          overflowY: 'auto',
        }}
      >
        {micError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: 'var(--accent-amber-bg)',
              color: 'var(--accent-amber)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-base)',
              fontWeight: 700,
            }}
          >
            <AlertCircle size={28} />
            <span>{micError}</span>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.sender === 'SENIOR' ? 'flex-end' : 'flex-start',
              width: '100%',
            }}
          >
            {/* Sender Label */}
            <span
              style={{
                fontSize: 'var(--font-sm)',
                fontWeight: 700,
                color: 'var(--text-muted)',
                marginBottom: '0.25rem',
                padding: '0 0.5rem',
              }}
            >
              {m.sender === 'SENIOR' ? '👵 Aaji' : '🤖 ElderEase'}
            </span>

            {/* Bubble */}
            <div
              style={{
                maxWidth: '88%',
                padding: '1.5rem 1.75rem',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--font-lg)',
                lineHeight: 1.5,
                fontWeight: 600,
                backgroundColor:
                  m.sender === 'SENIOR' ? 'var(--brand-primary)' : 'var(--bg-surface)',
                color: m.sender === 'SENIOR' ? '#ffffff' : 'var(--text-primary)',
                border:
                  m.sender === 'AI' ? '3px solid var(--border-light)' : '3px solid transparent',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div>{m.text}</div>

              {/* Render VisualTarget if provided by conversational state */}
              {m.visualTarget && (
                <VisualTarget
                  name={m.visualTarget.name}
                  description={m.visualTarget.description}
                  icon={m.visualTarget.icon}
                  badgeColor={m.visualTarget.badgeColor}
                  highlight={true}
                />
              )}

              {/* AI action buttons (Hear Again, Stop Speaking, Start Guided Task) */}
              {m.sender === 'AI' && (
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {/* Hear Again */}
                  <button
                    onClick={() => handleSpeak(m.text)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '2px solid var(--border-strong)',
                      fontSize: 'var(--font-sm)',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    <Volume2 size={20} />
                    {t('assistant.hearAgain')}
                  </button>

                  {/* Stop Speaking button if currently speaking */}
                  {isSpeaking && (
                    <button
                      onClick={stopSpeaking}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--status-red-bg)',
                        color: 'var(--status-red-text)',
                        border: '2px solid var(--status-red)',
                        fontSize: 'var(--font-sm)',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      <Square size={18} fill="currentColor" />
                      <span>🔇 Stop Speaking</span>
                    </button>
                  )}

                  {/* Guided Task Start Button */}
                  {m.taskData && (
                    <button
                      onClick={() => onStartTask(m.taskData!.taskId)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.75rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--brand-primary)',
                        color: '#ffffff',
                        border: '2px solid var(--brand-primary-hover)',
                        fontSize: 'var(--font-base)',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-md)',
                      }}
                    >
                      <BookOpen size={22} />
                      {t('assistant.startGuidedTask')}: {m.taskData.taskTitle}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Thinking Indicator */}
        {isThinking && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
            <Sparkles size={24} className="animate-spin" />
            <span style={{ fontSize: 'var(--font-md)', fontWeight: 600 }}>
              🧠 {t('assistant.thinking')}
            </span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </main>

      {/* Obvious Audio State Banner */}
      {isListening && (
        <div
          style={{
            backgroundColor: 'var(--status-red-bg)',
            color: 'var(--status-red-text)',
            padding: '1.25rem',
            textAlign: 'center',
            fontSize: 'var(--font-lg)',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            borderTop: '3px solid var(--status-red)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="audio-bar" style={{ backgroundColor: 'var(--status-red)' }} />
            <span className="audio-bar" style={{ backgroundColor: 'var(--status-red)' }} />
            <span className="audio-bar" style={{ backgroundColor: 'var(--status-red)' }} />
          </div>
          <span>{t('assistant.listening')}</span>
        </div>
      )}

      {isSpeaking && (
        <div
          style={{
            backgroundColor: 'var(--brand-surface)',
            color: 'var(--brand-text)',
            padding: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid var(--brand-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Volume2 size={24} />
            <span style={{ fontSize: 'var(--font-base)', fontWeight: 700 }}>
              {t('assistant.speaking')}
            </span>
          </div>

          <button
            onClick={stopSpeaking}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--status-red-bg)',
              color: 'var(--status-red-text)',
              border: '2px solid var(--status-red)',
              fontWeight: 800,
              fontSize: 'var(--font-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Square size={16} fill="currentColor" />
            <span>🔇 Stop Speaking</span>
          </button>
        </div>
      )}

      {/* Bottom Conversation Controls */}
      <footer
        style={{
          padding: '1.5rem 2rem',
          backgroundColor: 'var(--bg-surface)',
          borderTop: '3px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        {/* Large Central Microphone Button */}
        <button
          onClick={toggleListening}
          aria-label={isListening ? t('assistant.stopListening') : t('assistant.tapToTalk')}
          style={{
            width: '100%',
            maxWidth: '520px',
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: isListening ? 'var(--status-red)' : 'var(--brand-primary)',
            color: '#ffffff',
            border: '3px solid transparent',
            fontSize: 'var(--font-xl)',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            boxShadow: 'var(--shadow-md)',
            cursor: 'pointer',
          }}
        >
          {isListening ? <MicOff size={36} /> : <Mic size={36} />}
          <span>{isListening ? '🔴 ' + t('assistant.stopListening') : '🎙️ ' + t('assistant.tapToTalk')}</span>
        </button>

        {/* Optional Text Input Row */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputText);
          }}
          style={{
            width: '100%',
            maxWidth: '700px',
            display: 'flex',
            gap: '0.75rem',
          }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('assistant.typePlaceholder')}
            style={{
              flex: 1,
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border-strong)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-base)',
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{
              padding: '1rem 1.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-subtle)',
              border: '2px solid var(--border-strong)',
              fontSize: 'var(--font-base)',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: inputText.trim() ? 'pointer' : 'default',
              opacity: inputText.trim() ? 1 : 0.6,
            }}
          >
            <Send size={22} />
            {t('assistant.send')}
          </button>
        </form>
      </footer>
    </div>
  );
};

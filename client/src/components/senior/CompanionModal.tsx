import React, { useState, useEffect } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { usePreferences } from '../../context/PreferencesContext';
import { api } from '../../services/api';
import { Mic, MicOff, Volume2, RotateCcw, X, Send } from 'lucide-react';

interface CompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAction?: (action: string) => void;
}

export const CompanionModal: React.FC<CompanionModalProps> = ({
  isOpen,
  onClose,
  onTriggerAction,
}) => {
  const { language, voiceSpeed, setVoiceSpeed, t } = usePreferences();
  const { isListening, transcript, error: sttError, startListening, stopListening, resetTranscript } =
    useSpeechRecognition();
  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [loading, setLoading] = useState(false);

  // Initial friendly greeting when opening
  useEffect(() => {
    if (isOpen) {
      const initialGreeting =
        language === 'mr'
          ? 'नमस्कार! मी एल्डरईज. मी तुम्हाला कशी मदत करू? औषध, फोन, किंवा काही विचारायचे आहे का?'
          : language === 'hi'
          ? 'नमस्ते! मैं एल्डरईज हूँ। मैं आपकी क्या मदद करूँ? आप बेझिझक बोलिए।'
          : 'Hello! I am ElderEase, your patient companion. How can I help you today?';

      setMessages([{ role: 'assistant', text: initialGreeting }]);
      speak(initialGreeting);
    } else {
      stopSpeaking();
      stopListening();
    }
  }, [isOpen]);

  // When speech recognition produces text, automatically update input
  useEffect(() => {
    if (transcript) {
      setInputMessage(transcript);
    }
  }, [transcript]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    stopListening();
    resetTranscript();
    setInputMessage('');

    const newHistory = [...messages, { role: 'user' as const, text }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const response = await api.chatWithAi(
        text,
        newHistory.map((m) => ({ role: m.role, content: m.text })),
        language
      );

      const aiReply = response.reply;
      setMessages([...newHistory, { role: 'assistant' as const, text: aiReply }]);
      speak(aiReply);

      if (response.suggestedAction && onTriggerAction) {
        onTriggerAction(response.suggestedAction);
      }
    } catch (err: any) {
      const fallbackError =
        language === 'mr'
          ? 'काही हरकत नाही. पुन्हा एकदा बोलूया.'
          : 'No worries. Let us try once more.';
      setMessages([...newHistory, { role: 'assistant' as const, text: fallbackError }]);
      speak(fallbackError);
    } finally {
      setLoading(false);
    }
  };

  const repeatLastMessage = () => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    if (lastAssistant) {
      speak(lastAssistant.text);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Talk to ElderEase">
      <div className="modal-content" style={{ maxWidth: '700px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 'var(--font-xl)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🎤</span> {t('talkToAi')}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border-light)',
              fontSize: 'var(--font-md)',
              fontWeight: 700,
            }}
          >
            <X size={24} /> {t('close')}
          </button>
        </div>

        {/* Conversation Display */}
        <div
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            minHeight: '220px',
            maxHeight: '340px',
            overflowY: 'auto',
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: m.role === 'user' ? 'var(--brand-surface)' : 'var(--bg-surface)',
                color: 'var(--text-primary)',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                maxWidth: '85%',
                boxShadow: 'var(--shadow-sm)',
                border: `2px solid ${m.role === 'user' ? 'var(--brand-primary)' : 'var(--border-light)'}`,
                fontSize: 'var(--font-md)',
                lineHeight: '1.5',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                {m.role === 'user' ? 'You' : 'ElderEase'}
              </div>
              <div>{m.text}</div>
            </div>
          ))}

          {loading && (
            <div style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: 'var(--font-md)' }}>
              {language === 'mr' ? 'एल्डरईज विचार करत आहे...' : 'ElderEase is thinking...'}
            </div>
          )}
        </div>

        {/* Listening / Speaking Visual Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', minHeight: '50px', marginBottom: '1.25rem' }}>
          {isListening && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '36px' }}>
                <span className="audio-bar" />
                <span className="audio-bar" />
                <span className="audio-bar" />
                <span className="audio-bar" />
                <span className="audio-bar" />
              </div>
              <span style={{ fontWeight: 700, color: 'var(--brand-primary)', fontSize: 'var(--font-md)' }}>
                {t('listening')}
              </span>
            </div>
          )}

          {isSpeaking && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-amber)' }}>
              <Volume2 size={28} />
              <span style={{ fontWeight: 700, fontSize: 'var(--font-md)' }}>{t('speaking')}</span>
            </div>
          )}

          {sttError && (
            <span style={{ color: 'var(--status-red)', fontSize: 'var(--font-sm)' }}>{sttError}</span>
          )}
        </div>

        {/* Primary Large Microphone & Control Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <button
            onClick={() => {
              if (isListening) {
                stopListening();
                if (transcript) handleSendMessage(transcript);
              } else {
                startListening();
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1.25rem 2.5rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isListening ? '#dc2626' : 'var(--brand-primary)',
              color: '#ffffff',
              fontSize: 'var(--font-lg)',
              fontWeight: 800,
              boxShadow: 'var(--shadow-md)',
              border: '3px solid #ffffff',
            }}
          >
            {isListening ? <MicOff size={32} /> : <Mic size={32} />}
            <span>{isListening ? 'बोलणे थांबवा (Stop)' : 'माइक सुरू करा (Start Talking)'}</span>
          </button>

          <button
            onClick={repeatLastMessage}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-subtle)',
              border: '2px solid var(--border-strong)',
              fontSize: 'var(--font-md)',
              fontWeight: 700,
            }}
          >
            <RotateCcw size={24} /> {t('repeat')}
          </button>

          <button
            onClick={() => setVoiceSpeed(voiceSpeed === 'SLOW' ? 'NORMAL' : 'SLOW')}
            style={{
              padding: '1rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-subtle)',
              border: '2px solid var(--border-strong)',
              fontSize: 'var(--font-md)',
              fontWeight: 700,
            }}
          >
            {voiceSpeed === 'SLOW' ? '🐢 ' + t('voiceSpeedSlow') : '🐇 ' + t('voiceSpeedNormal')}
          </button>
        </div>

        {/* Typing Fallback Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{ display: 'flex', gap: '0.75rem' }}
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={t('typeHere')}
            style={{
              flex: 1,
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '3px solid var(--border-strong)',
              fontSize: 'var(--font-md)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            style={{
              padding: '1rem 1.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--brand-primary)',
              color: '#ffffff',
              fontSize: 'var(--font-md)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: !inputMessage.trim() ? 0.6 : 1,
            }}
          >
            <Send size={24} /> {t('send')}
          </button>
        </form>
      </div>
    </div>
  );
};

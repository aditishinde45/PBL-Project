import React, { useState } from 'react';
import { api } from '../../services/api';
import { usePreferences } from '../../context/PreferencesContext';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { Heart, AlertTriangle, X } from 'lucide-react';

interface CheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const CheckinModal: React.FC<CheckinModalProps> = ({ isOpen, onClose, onComplete }) => {
  const { t, language } = usePreferences();
  const { speak } = useSpeechSynthesis();
  const [submitted, setSubmitted] = useState(false);
  const [statusSubmitted, setStatusSubmitted] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (status: 'OKAY' | 'HELP_NEEDED') => {
    try {
      await api.submitCheckin(status);
      setSubmitted(true);
      setStatusSubmitted(status);
      onComplete();

      if (status === 'OKAY') {
        const msg =
          language === 'mr'
            ? 'आनंदाची बातमी! तुम्ही ठीक आहात हे ऐकून बरे वाटले. कुटुंबियांना कळवले आहे.'
            : language === 'hi'
            ? 'सुनकर अच्छा लगा कि आप ठीक हैं! परिवार को सूचित कर दिया गया है।'
            : 'Wonderful! Glad to know you are okay. Your family has been notified.';
        speak(msg);
      } else {
        const msg =
          language === 'mr'
            ? 'काळजी करू नका. तुमच्या कुटुंबियांना तात्काळ मदतीचा संदेश पाठवला आहे.'
            : 'Don’t worry. Your family has been notified that you need help.';
        speak(msg);
      }
    } catch (e) {
      alert('Could not submit check-in.');
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Daily Check-in">
      <div className="modal-content" style={{ textAlign: 'center', maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'none' }}>
            <X size={28} />
          </button>
        </div>

        {!submitted ? (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>☀️</div>
            <h2 style={{ fontSize: 'var(--font-xl)', color: 'var(--text-primary)', marginBottom: '0.75rem', fontWeight: 800 }}>
              {language === 'mr' ? 'शुभ प्रभात! आज तुम्ही कसे आहात?' : 'Good morning! Are you okay today?'}
            </h2>
            <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {language === 'mr'
                ? 'खालीलपैकी एका बटणावर दाबून तुमच्या कुटुंबीयांना सांगा.'
                : 'Tap one button below so your family knows your morning status.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <button
                onClick={() => handleSubmit('OKAY')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--status-green)',
                  color: '#ffffff',
                  fontSize: 'var(--font-xl)',
                  fontWeight: 800,
                  boxShadow: 'var(--shadow-md)',
                  border: '3px solid #ffffff',
                }}
              >
                <Heart size={36} fill="#ffffff" />
                <span>{t('iAmOkay')}</span>
              </button>

              <button
                onClick={() => handleSubmit('HELP_NEEDED')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--status-red-bg)',
                  color: 'var(--status-red-text)',
                  fontSize: 'var(--font-lg)',
                  fontWeight: 800,
                  border: '3px solid var(--status-red)',
                }}
              >
                <AlertTriangle size={32} color="var(--status-red)" />
                <span>{t('iNeedHelp')}</span>
              </button>
            </div>
          </>
        ) : (
          <div style={{ padding: '2rem 1rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
              {statusSubmitted === 'OKAY' ? '💚' : '🚨'}
            </div>
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, marginBottom: '1rem' }}>
              {statusSubmitted === 'OKAY'
                ? (language === 'mr' ? 'आजची नोंद पूर्ण झाली!' : 'Check-in Recorded!')
                : (language === 'mr' ? 'कुटुंबाला संदेश पाठवला आहे!' : 'Family Alerted!')}
            </h2>
            <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {statusSubmitted === 'OKAY'
                ? (language === 'mr' ? 'तुमच्या मुलीला (प्रिया) कळवले आहे की तुम्ही व्यवस्थित आहात.' : 'Your caregiver knows you completed your morning check-in.')
                : (language === 'mr' ? 'तुमच्या मुलीला (प्रिया) कळवले आहे. ते लवकरच तुमच्याशी संपर्क साधतील.' : 'Your family has been informed and will assist you.')}
            </p>
            <button
              onClick={onClose}
              style={{
                padding: '1rem 2.5rem',
                backgroundColor: 'var(--brand-primary)',
                color: '#ffffff',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: 'var(--font-lg)',
              }}
            >
              {t('close')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { api } from '../../services/api';
import { usePreferences } from '../../context/PreferencesContext';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { PhoneCall, MessageSquare, Check, X } from 'lucide-react';

interface CallFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CallFamilyModal: React.FC<CallFamilyModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = usePreferences();
  const { speak } = useSpeechSynthesis();
  const [requested, setRequested] = useState(false);

  if (!isOpen) return null;

  const handleAskForHelp = async () => {
    try {
      await api.triggerFamilyCall('Senior wants family assistance or a phone call.');
      setRequested(true);
      const audio =
        language === 'mr'
          ? 'तुमच्या मुलीला (प्रिया) निरोप पाठवला आहे. ती लवकरच तुम्हाला फोन करेल.'
          : 'Your family has been notified to call you soon.';
      speak(audio);
    } catch (e) {
      alert('Could not notify family.');
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Call Family">
      <div className="modal-content" style={{ textAlign: 'center', maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'none' }}>
            <X size={28} />
          </button>
        </div>

        {!requested ? (
          <div>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>👨‍👩‍👧</div>
            <h2 style={{ fontSize: 'var(--font-xl)', color: 'var(--text-primary)', fontWeight: 800, marginBottom: '0.75rem' }}>
              {t('callFamily')}
            </h2>
            <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {language === 'mr'
                ? 'मुलीला (प्रिया) थेट फोन लावा किंवा तिला फोन करण्याची आठवण पाठवा.'
                : 'Directly call your daughter Priya or send her a notification to call you back.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <a
                href="tel:+919876543211"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '1.25rem',
                  backgroundColor: 'var(--brand-primary)',
                  color: '#ffffff',
                  fontSize: 'var(--font-lg)',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-lg)',
                  textDecoration: 'none',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <PhoneCall size={28} />
                <span>फोन लावा (Call Priya +91 98765 43211)</span>
              </a>

              <button
                onClick={handleAskForHelp}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '1.25rem',
                  backgroundColor: 'var(--accent-amber-bg)',
                  color: 'var(--accent-amber)',
                  fontSize: 'var(--font-lg)',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-lg)',
                  border: '3px solid var(--accent-amber)',
                }}
              >
                <MessageSquare size={28} />
                <span>फोन करायला सांगा (Ask Family to Call)</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '1.5rem 1rem' }}>
            <div style={{ color: 'var(--status-green)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <Check size={56} />
            </div>
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--status-green)', marginBottom: '1rem' }}>
              {language === 'mr' ? 'कुटुंबाला संदेश पोहोचला आहे!' : 'Family Notified!'}
            </h2>
            <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {language === 'mr'
                ? 'प्रियाला समजले आहे की तुम्हाला तिच्याशी बोलायचे आहे. ती वेळ मिळताच कॉल करेल.'
                : 'Priya has received your note and will reach out to you.'}
            </p>
            <button
              onClick={onClose}
              style={{
                padding: '1rem 2.5rem',
                backgroundColor: 'var(--brand-primary)',
                color: '#ffffff',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: 'var(--font-md)',
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

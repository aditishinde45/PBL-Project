import React, { useState } from 'react';
import { api } from '../../services/api';
import { usePreferences } from '../../context/PreferencesContext';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { AlertCircle, PhoneCall, ShieldAlert, CheckCircle, X } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = usePreferences();
  const { speak } = useSpeechSynthesis();
  const [triggered, setTriggered] = useState(false);
  const [contactInfo, setContactInfo] = useState<{ name?: string; phone?: string }>({});

  if (!isOpen) return null;

  const handleConfirmEmergency = async () => {
    let coords: { latitude?: number; longitude?: number } = {};

    if (navigator.geolocation) {
      try {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              coords = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              };
              resolve(true);
            },
            () => resolve(false),
            { timeout: 3000 }
          );
        });
      } catch (err) {
        console.warn('Geolocation error:', err);
      }
    }

    try {
      const res = await api.triggerEmergency(coords);
      setTriggered(true);
      setContactInfo({
        name: res.emergencyContactName || 'Priya (Daughter)',
        phone: res.emergencyContactPhone || '+919876543211',
      });

      const audioMsg =
        language === 'mr'
          ? 'काळजी करू नका. तुमच्या कुटुंबियांना तात्काळ आणीबाणीचा संदेश पाठवला आहे. फोन जवळ ठेवा.'
          : 'Do not panic. Your family member has been notified immediately.';
      speak(audioMsg);
    } catch (e) {
      alert('Could not dispatch emergency alert.');
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Emergency Help">
      <div
        className="modal-content"
        style={{
          border: '4px solid var(--status-red)',
          textAlign: 'center',
          maxWidth: '650px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'none' }}>
            <X size={28} />
          </button>
        </div>

        {!triggered ? (
          <div>
            <div style={{ color: 'var(--status-red)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <ShieldAlert size={64} />
            </div>

            <h2 style={{ fontSize: 'var(--font-xl)', color: 'var(--status-red)', fontWeight: 800, marginBottom: '1rem' }}>
              {t('emergencyConfirmTitle')}
            </h2>

            <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
              {t('emergencyConfirmDesc')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={handleConfirmEmergency}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '1.5rem',
                  backgroundColor: 'var(--status-red)',
                  color: '#ffffff',
                  fontSize: 'var(--font-xl)',
                  fontWeight: 900,
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '3px solid #ffffff',
                }}
              >
                <AlertCircle size={36} />
                <span>{t('emergencyYes')}</span>
              </button>

              <button
                onClick={onClose}
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-md)',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-lg)',
                  border: '3px solid var(--border-strong)',
                }}
              >
                {t('emergencyCancel')}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '1rem' }}>
            <div style={{ color: 'var(--status-green)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <CheckCircle size={64} />
            </div>

            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--status-green)', marginBottom: '1rem' }}>
              {t('emergencySent')}
            </h2>

            <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              {language === 'mr'
                ? `तुमच्या कुटुंबियांना (प्रिया) तुमचा तात्काळ मेसेज पाठवला आहे. फोन जवळ ठेवा, ते लगेच कॉल करत आहेत.`
                : `Your family caregiver has received your distress alert. Please stay calm and keep your phone nearby.`}
            </p>

            {contactInfo.phone && (
              <div
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  border: '2px solid var(--border-light)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 'var(--font-md)', marginBottom: '0.5rem' }}>
                  📞 {contactInfo.name}
                </div>
                <a
                  href={`tel:${contactInfo.phone}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.8rem 1.5rem',
                    backgroundColor: 'var(--brand-primary)',
                    color: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    fontWeight: 800,
                    fontSize: 'var(--font-md)',
                  }}
                >
                  <PhoneCall size={22} /> आता फोन लावा ({contactInfo.phone})
                </a>
              </div>
            )}

            <button
              onClick={onClose}
              style={{
                padding: '1rem 2.5rem',
                backgroundColor: 'var(--text-primary)',
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

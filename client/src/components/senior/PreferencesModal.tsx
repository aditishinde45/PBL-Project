import React from 'react';
import { usePreferences, FontSize, VoiceSpeed } from '../../context/PreferencesContext';
import { Language } from '../../translations';
import { Sliders, Check, X } from 'lucide-react';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose }) => {
  const {
    language,
    fontSize,
    voiceSpeed,
    highContrast,
    ttsEnabled,
    savePreferences,
    t,
  } = usePreferences();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Preferences">
      <div className="modal-content" style={{ maxWidth: '650px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: 'var(--font-xl)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
            <Sliders size={32} /> {t('preferences')}
          </h2>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'none' }}>
            <X size={28} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* 1. Language Selection */}
          <div>
            <label style={{ display: 'block', fontWeight: 800, fontSize: 'var(--font-lg)', marginBottom: '0.75rem' }}>
              🌐 भाषा (Language):
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {[
                { code: 'mr', label: 'मराठी (Marathi)' },
                { code: 'hi', label: 'हिंदी (Hindi)' },
                { code: 'en', label: 'English' },
              ].map((item) => (
                <button
                  key={item.code}
                  onClick={() => savePreferences({ language: item.code as Language })}
                  style={{
                    padding: '1.25rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: `3px solid ${language === item.code ? 'var(--brand-primary)' : 'var(--border-strong)'}`,
                    backgroundColor: language === item.code ? 'var(--brand-surface)' : 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                    fontWeight: 800,
                    fontSize: 'var(--font-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  {item.label}
                  {language === item.code && <Check size={20} color="var(--brand-primary)" />}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Font Scaling */}
          <div>
            <label style={{ display: 'block', fontWeight: 800, fontSize: 'var(--font-lg)', marginBottom: '0.75rem' }}>
              🔤 अक्षरांचा आकार (Text Size):
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {[
                { size: 'NORMAL', label: 'सामान्य (Normal)' },
                { size: 'LARGE', label: 'मोठा (Big)' },
                { size: 'EXTRA_LARGE', label: 'खूप मोठा (Extra Big)' },
              ].map((item) => (
                <button
                  key={item.size}
                  onClick={() => savePreferences({ fontSize: item.size as FontSize })}
                  style={{
                    padding: '1.25rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: `3px solid ${fontSize === item.size ? 'var(--brand-primary)' : 'var(--border-strong)'}`,
                    backgroundColor: fontSize === item.size ? 'var(--brand-surface)' : 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                    fontWeight: 800,
                    fontSize: 'var(--font-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  {item.label}
                  {fontSize === item.size && <Check size={20} color="var(--brand-primary)" />}
                </button>
              ))}
            </div>
          </div>

          {/* 3. High Contrast Mode Toggle */}
          <div>
            <label style={{ display: 'block', fontWeight: 800, fontSize: 'var(--font-lg)', marginBottom: '0.75rem' }}>
              🎨 स्पष्ट रंग / कॉन्ट्रास्ट (High Contrast Mode):
            </label>
            <button
              onClick={() => savePreferences({ highContrast: !highContrast })}
              style={{
                width: '100%',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: `3px solid ${highContrast ? 'var(--brand-primary)' : 'var(--border-strong)'}`,
                backgroundColor: highContrast ? '#000000' : 'var(--bg-subtle)',
                color: highContrast ? '#facc15' : 'var(--text-primary)',
                fontWeight: 800,
                fontSize: 'var(--font-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
              }}
            >
              {highContrast ? '✅ उच्च कॉन्ट्रास्ट चालू आहे (High Contrast Active)' : 'सामान्य रंग (Normal Contrast)'}
            </button>
          </div>

          {/* 4. Voice Speed */}
          <div>
            <label style={{ display: 'block', fontWeight: 800, fontSize: 'var(--font-lg)', marginBottom: '0.75rem' }}>
              🗣️ आवाजाचा वेग (Voice Speaking Speed):
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { speed: 'SLOW', label: '🐢 हळू व शांत (Slow & Patient)' },
                { speed: 'NORMAL', label: '🐇 सामान्य (Normal)' },
              ].map((item) => (
                <button
                  key={item.speed}
                  onClick={() => savePreferences({ voiceSpeed: item.speed as VoiceSpeed })}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: `3px solid ${voiceSpeed === item.speed ? 'var(--brand-primary)' : 'var(--border-strong)'}`,
                    backgroundColor: voiceSpeed === item.speed ? 'var(--brand-surface)' : 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                    fontWeight: 800,
                    fontSize: 'var(--font-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {item.label}
                  {voiceSpeed === item.speed && <Check size={20} color="var(--brand-primary)" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: '2rem',
            width: '100%',
            padding: '1.25rem',
            backgroundColor: 'var(--brand-primary)',
            color: '#ffffff',
            borderRadius: 'var(--radius-md)',
            fontWeight: 800,
            fontSize: 'var(--font-lg)',
          }}
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
};

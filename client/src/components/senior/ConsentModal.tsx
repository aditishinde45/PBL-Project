import React from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import { Shield, Mic, Users, Database, X } from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = usePreferences();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Privacy and Consent">
      <div className="modal-content" style={{ maxWidth: '700px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 'var(--font-xl)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
            <Shield size={32} /> {t('privacy')}
          </h2>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'none' }}>
            <X size={28} />
          </button>
        </div>

        <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          {language === 'mr'
            ? 'एल्डरईज तुमच्या सुरक्षिततेची आणि गोपनीयतेची पूर्ण काळजी घेते. आम्ही तुमची माहिती कशी हाताळतो ते खालीलप्रमाणे आहे:'
            : 'ElderEase is designed to respect your dignity and safety. Here is our complete promise to you:'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', backgroundColor: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <Mic size={32} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, marginBottom: '0.25rem' }}>
                मायक्रोफोन (Microphone Access)
              </h3>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                {language === 'mr'
                  ? 'जेव्हा तुम्ही थेट माइक बटण दाबता, तेव्हाच आवाज ऐकला जातो. कोणताही गुप्त किंवा पार्श्वभूमीतील आवाज रेकॉर्ड केला जात नाही.'
                  : 'Microphone is used only when you explicitly press the Speak button. No background recording ever occurs.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', backgroundColor: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <Users size={32} color="var(--accent-amber)" style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, marginBottom: '0.25rem' }}>
                कुटुंबीयांसोबत काय शेअर होते? (Caregiver Sharing)
              </h3>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                {language === 'mr'
                  ? 'फक्त औषधांची खात्री, सकाळची हाजिरी आणि आणीबाणीचा संदेश कुटुंबाला पाठवला जातो. तुमच्या खाजगी गप्पा कुटुंबासोबत शेअर होत नाहीत.'
                  : 'Only health reminders, morning check-in status, and emergency alerts are shared. Your private talks with AI remain confidential.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', backgroundColor: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <Database size={32} color="var(--status-green)" style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, marginBottom: '0.25rem' }}>
                माहिती नियंत्रण (Your Control)
              </h3>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                {language === 'mr'
                  ? 'तुम्ही कोणत्याही वेळी कुटुंबीयांचा संबंध किंवा सेटिंग्ज बदलू शकता. सर्व माहिती सुरक्षित एन्क्रिप्शनमध्ये ठेवली जाते.'
                  : 'You can change connections or preferences at any time. Your data is stored securely with strict encryption.'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '1.25rem',
            backgroundColor: 'var(--brand-primary)',
            color: '#ffffff',
            borderRadius: 'var(--radius-md)',
            fontWeight: 800,
            fontSize: 'var(--font-lg)',
          }}
        >
          समजले (I Understand)
        </button>
      </div>
    </div>
  );
};

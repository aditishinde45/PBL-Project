import React, { useState } from 'react';
import { api } from '../../services/api';
import { usePreferences } from '../../context/PreferencesContext';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { Shield, ShieldAlert, ShieldCheck, X } from 'lucide-react';

interface ScamCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskFamily: () => void;
}

export const ScamCheckerModal: React.FC<ScamCheckerModalProps> = ({
  isOpen,
  onClose,
  onAskFamily,
}) => {
  const { t, language } = usePreferences();
  const { speak } = useSpeechSynthesis();
  const [messageText, setMessageText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCheck = async () => {
    if (!messageText.trim()) return;
    setLoading(true);
    try {
      const result = await api.checkScam(messageText, language);
      setAnalysis(result);
      speak(result.guidance);
    } catch (e) {
      alert('Could not analyze message.');
    } finally {
      setLoading(false);
    }
  };

  const sampleScam = () => {
    setMessageText(
      'प्रिय ग्राहक, तुमचे वीजबिल थकले आहे. आज रात्री वीज कापली जाईल. तात्काळ या लिंकवर क्लिक करून OTP शेअर करा.'
    );
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Is This Safe?">
      <div className="modal-content" style={{ maxWidth: '700px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 'var(--font-xl)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
            <Shield size={32} color="#0d9488" /> {t('scamCheck')}
          </h2>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'none' }}>
            <X size={28} />
          </button>
        </div>

        <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          {language === 'mr'
            ? 'मोबाईलवर आलेला कोणताही अनोळखी किंवा संशयास्पद मेसेज खाली लिहा किंवा पेस्ट करा. एल्डरईज तो तपासून देईल.'
            : 'Paste or type any suspicious SMS, message, or link below. ElderEase will analyze it safely.'}
        </p>

        {!analysis ? (
          <div>
            <textarea
              rows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={
                language === 'mr'
                  ? 'उदा. "तुमचे वीज बिल थकले आहे... या नंबरवर OTP द्या..."'
                  : 'e.g. "Your bank account is suspended, click link to update KYC..."'
              }
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: 'var(--font-md)',
                borderRadius: 'var(--radius-md)',
                border: '3px solid var(--border-strong)',
                marginBottom: '1rem',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <button
                type="button"
                onClick={sampleScam}
                style={{
                  fontSize: 'var(--font-sm)',
                  color: 'var(--brand-primary)',
                  textDecoration: 'underline',
                  fontWeight: 600,
                }}
              >
                📋 {language === 'mr' ? 'नमुना संशयास्पद मेसेज भरा' : 'Paste Sample Scam'}
              </button>

              <button
                onClick={handleCheck}
                disabled={!messageText.trim() || loading}
                style={{
                  padding: '1rem 2rem',
                  backgroundColor: 'var(--brand-primary)',
                  color: '#ffffff',
                  fontSize: 'var(--font-lg)',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-md)',
                  opacity: !messageText.trim() ? 0.6 : 1,
                }}
              >
                {loading ? 'तपासत आहे...' : 'हा मेसेज तपासा (Check)'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Result Box */}
            <div
              style={{
                backgroundColor: analysis.isSuspicious ? 'var(--status-red-bg)' : 'var(--status-green-bg)',
                border: `3px solid ${analysis.isSuspicious ? 'var(--status-red)' : 'var(--status-green)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                {analysis.isSuspicious ? (
                  <ShieldAlert size={36} color="var(--status-red)" />
                ) : (
                  <ShieldCheck size={36} color="var(--status-green)" />
                )}
                <h3
                  style={{
                    fontSize: 'var(--font-lg)',
                    fontWeight: 800,
                    color: analysis.isSuspicious ? 'var(--status-red-text)' : 'var(--status-green-text)',
                  }}
                >
                  {analysis.isSuspicious
                    ? (language === 'mr' ? 'सावध राहा: हा मेसेज संशयास्पद असू शकतो!' : 'Warning: This may be suspicious!')
                    : (language === 'mr' ? 'हा मेसेज सामान्य वाटतो' : 'This message appears normal')}
                </h3>
              </div>

              <p style={{ fontSize: 'var(--font-md)', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {analysis.guidance}
              </p>

              {analysis.warningPoints?.length > 0 && (
                <ul style={{ paddingLeft: '1.5rem', fontSize: 'var(--font-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-primary)' }}>
                  {analysis.warningPoints.map((pt: string, idx: number) => (
                    <li key={idx}>{pt}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* 3 Explicit Actions requested in SRS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analysis.isSuspicious && (
                <button
                  onClick={onClose}
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--status-red)',
                    color: '#ffffff',
                    fontSize: 'var(--font-lg)',
                    fontWeight: 800,
                    borderRadius: 'var(--radius-md)',
                    border: '3px solid #ffffff',
                  }}
                >
                  🛑 {language === 'mr' ? 'हे करू नका (DO NOT DO THIS)' : 'DO NOT DO THIS'}
                </button>
              )}

              <button
                onClick={() => {
                  onClose();
                  onAskFamily();
                }}
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--accent-amber-bg)',
                  color: 'var(--accent-amber)',
                  fontSize: 'var(--font-lg)',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-md)',
                  border: '3px solid var(--accent-amber)',
                }}
              >
                👨‍👩‍👧 {language === 'mr' ? 'कुटुंबाला विचारा (ASK FAMILY)' : 'ASK FAMILY'}
              </button>

              <button
                onClick={() => {
                  setAnalysis(null);
                  setMessageText('');
                }}
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-md)',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid var(--border-strong)',
                }}
              >
                ↩️ {language === 'mr' ? 'मागे जा (GO BACK)' : 'GO BACK'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

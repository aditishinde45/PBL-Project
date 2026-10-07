import React, { useState } from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { ShieldCheck, AlertTriangle, CheckCircle, X, ArrowRight } from 'lucide-react';

interface SafePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafePaymentModal: React.FC<SafePaymentModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = usePreferences();
  const { speak } = useSpeechSynthesis();

  const [step, setStep] = useState<number>(1);
  const [recipient, setRecipient] = useState('City Kirana Store (दुकानदार)');
  const [amount, setAmount] = useState('500');
  const [pin, setPin] = useState('');
  const [verified, setVerified] = useState(false);

  if (!isOpen) return null;

  const handleProceedToVerify = () => {
    setStep(2);
    const alertSpeech =
      language === 'mr'
        ? `सावधान: तुम्ही ${recipient} यांना ₹${amount} पाठवत आहात. नाव आणि रक्कम बरोबर असल्याची खात्री करा.`
        : `You are about to send ₹${amount} to ${recipient}. Please verify the name and amount carefully.`;
    speak(alertSpeech);
  };

  const handleCompleteMockPayment = () => {
    setStep(3);
    const successSpeech =
      language === 'mr'
        ? `पेमेंट यशस्वी झाले! सुरक्षित सराव पूर्ण झाला.`
        : `Payment successful! Safe practice completed.`;
    speak(successSpeech);
  };

  const handleReset = () => {
    setStep(1);
    setPin('');
    setVerified(false);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Safe Payment Environment">
      <div className="modal-content" style={{ maxWidth: '650px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 'var(--font-xl)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
            <span>💳</span> {t('safePayment')}
          </h2>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'none' }}>
            <X size={28} />
          </button>
        </div>

        <div style={{ backgroundColor: 'var(--status-blue-bg)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: 'var(--font-sm)', color: 'var(--status-blue-text)', fontWeight: 600 }}>
          🛡️ सुरक्षित सराव वातावरण (Safe Practice Simulation — No Real Money Involved)
        </div>

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)' }}>
              {language === 'mr'
                ? 'ज्या व्यक्तीला किंवा दुकानाला पैसे पाठवायचे आहेत त्यांचे नाव आणि रक्कम लिहा:'
                : 'Enter the shop name and amount for this safe payment exercise:'}
            </p>

            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', fontSize: 'var(--font-md)' }}>
                दुकान किंवा व्यक्तीचे नाव:
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', fontSize: 'var(--font-md)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', fontSize: 'var(--font-md)' }}>
                रक्कम (रुपये ₹):
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', fontSize: 'var(--font-md)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)' }}
              />
            </div>

            <button
              onClick={handleProceedToVerify}
              style={{
                marginTop: '1rem',
                padding: '1.25rem',
                backgroundColor: 'var(--brand-primary)',
                color: '#ffffff',
                fontSize: 'var(--font-lg)',
                fontWeight: 800,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <span>पुढे जा (Verify Details)</span>
              <ArrowRight size={24} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Safety Warning Confirmation Banner */}
            <div
              style={{
                backgroundColor: 'var(--accent-amber-bg)',
                border: '3px solid var(--accent-amber)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'center',
              }}
            >
              <AlertTriangle size={48} color="var(--accent-amber)" style={{ margin: '0 auto 0.5rem' }} />
              <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {language === 'mr' ? `तुम्ही ₹${amount} पाठवत आहात!` : `You are about to send ₹${amount}!`}
              </h3>
              <p style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--brand-text)' }}>
                {recipient}
              </p>
              <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                {language === 'mr'
                  ? 'कृपया नाव आणि रक्कम दोनदा तपासा. हे बरोबर असल्यास खाली खात्री करा.'
                  : 'Please check the name and amount carefully before proceeding.'}
              </p>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 'var(--font-md)', cursor: 'pointer', padding: '0.5rem' }}>
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
                style={{ width: '24px', height: '24px' }}
              />
              <span style={{ fontWeight: 700 }}>
                {language === 'mr' ? 'मी नाव आणि रक्कम नीट तपासली आहे ✅' : 'I have verified the recipient and amount ✅'}
              </span>
            </label>

            {verified && (
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', fontSize: 'var(--font-md)' }}>
                  गुप्त सराव पिन टाका (Mock UPI PIN):
                </label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', fontSize: 'var(--font-xl)', letterSpacing: '0.5rem', textAlign: 'center', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)' }}
                />
                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  ℹ️ फोनवर कधीही कोणालाही पिन सांगू नका.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                onClick={handleCompleteMockPayment}
                disabled={!verified || pin.length < 4}
                style={{
                  flex: 1,
                  padding: '1.25rem',
                  backgroundColor: verified && pin.length >= 4 ? 'var(--status-green)' : 'var(--border-strong)',
                  color: '#ffffff',
                  fontSize: 'var(--font-lg)',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-md)',
                  opacity: !verified || pin.length < 4 ? 0.6 : 1,
                }}
              >
                सुरक्षित पाठवा (Send ₹{amount})
              </button>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  border: '2px solid var(--border-strong)',
                }}
              >
                बदला (Edit)
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <CheckCircle size={64} color="var(--status-green)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--status-green)', marginBottom: '0.5rem' }}>
              {language === 'mr' ? 'सुरक्षित सराव पूर्ण झाला!' : 'Mock Payment Successful!'}
            </h3>
            <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {language === 'mr'
                ? `तुम्ही सुरक्षितपणे ₹${amount} ची पडताळणी केली. प्रत्यक्ष पेमेंट करतानाही अशीच खात्री करा.`
                : `You successfully practiced verifying ₹${amount}. Always remember to double check the recipient and amount!`}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={handleReset}
                style={{
                  padding: '1rem 1.75rem',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '2px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                }}
              >
                पुन्हा सराव करा (Practice Again)
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '1rem 2rem',
                  backgroundColor: 'var(--brand-primary)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 800,
                }}
              >
                {t('close')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import { User, Lock, Phone, Mail, X, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialRole?: 'SENIOR' | 'CAREGIVER';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialRole = 'SENIOR',
  onClose,
}) => {
  const { login, registerSenior, registerCaregiver } = useAuth();
  const { language } = usePreferences();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [role, setRole] = useState<'SENIOR' | 'CAREGIVER'>(initialRole);

  // Form fields
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [prefLang, setPrefLang] = useState('mr');
  const [fontSize, setFontSize] = useState('LARGE');
  const [inviteCode, setInviteCode] = useState('');
  const [relationship, setRelationship] = useState('Daughter');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'LOGIN') {
        await login(identifier, password);
      } else {
        if (role === 'SENIOR') {
          await registerSenior({
            name,
            phone: identifier.includes('@') ? null : identifier,
            email: identifier.includes('@') ? identifier : null,
            password,
            language: prefLang,
            fontSize,
          });
        } else {
          await registerCaregiver({
            name,
            phone: identifier.includes('@') ? null : identifier,
            email: identifier.includes('@') ? identifier : null,
            password,
            relationshipToSenior: relationship,
            seniorInviteCode: inviteCode || null,
          });
        }
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (userType: 'SENIOR' | 'CAREGIVER' | 'ADMIN') => {
    setMode('LOGIN');
    if (userType === 'SENIOR') {
      setIdentifier('aai@elderease.com');
      setPassword('aai123');
    } else if (userType === 'CAREGIVER') {
      setIdentifier('daughter@elderease.com');
      setPassword('daughter123');
    } else {
      setIdentifier('admin@elderease.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Sign In">
      <div className="modal-content" style={{ maxWidth: '580px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            {mode === 'LOGIN' ? 'लॉगिन करा (Login)' : 'नवीन खाते तयार करा (Register)'}
          </h2>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'none' }}>
            <X size={28} />
          </button>
        </div>

        {/* Role Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', backgroundColor: 'var(--bg-subtle)', padding: '0.4rem', borderRadius: 'var(--radius-md)' }}>
          <button
            type="button"
            onClick={() => setRole('SENIOR')}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 800,
              fontSize: 'var(--font-md)',
              backgroundColor: role === 'SENIOR' ? 'var(--brand-primary)' : 'transparent',
              color: role === 'SENIOR' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            👤 ज्येष्ठ नागरिक (Senior)
          </button>
          <button
            type="button"
            onClick={() => setRole('CAREGIVER')}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 800,
              fontSize: 'var(--font-md)',
              backgroundColor: role === 'CAREGIVER' ? '#7c3aed' : 'transparent',
              color: role === 'CAREGIVER' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            👨‍👩‍👧 काळजीवाहू (Caregiver)
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--status-red-bg)', color: 'var(--status-red-text)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontWeight: 600, fontSize: 'var(--font-sm)' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'REGISTER' && (
            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.25rem', fontSize: 'var(--font-md)' }}>
                पूर्ण नाव (Full Name):
              </label>
              <input
                type="text"
                placeholder="उदा. सुलोचना ताई / Priya"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '0.8rem', fontSize: 'var(--font-md)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)' }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.25rem', fontSize: 'var(--font-md)' }}>
              फोन नंबर किंवा ईमेल (Phone or Email):
            </label>
            <input
              type="text"
              placeholder="+91 98765 43210 किंवा aai@elderease.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              style={{ width: '100%', padding: '0.8rem', fontSize: 'var(--font-md)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.25rem', fontSize: 'var(--font-md)' }}>
              पासवर्ड किंवा पिन (Password):
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.8rem', fontSize: 'var(--font-md)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)' }}
            />
          </div>

          {mode === 'REGISTER' && role === 'SENIOR' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 'var(--font-sm)', marginBottom: '0.25rem' }}>
                  प्राधान्य भाषा (Language):
                </label>
                <select
                  value={prefLang}
                  onChange={(e) => setPrefLang(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', fontSize: 'var(--font-md)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)' }}
                >
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 'var(--font-sm)', marginBottom: '0.25rem' }}>
                  अक्षरांचा आकार (Text Size):
                </label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', fontSize: 'var(--font-md)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)' }}
                >
                  <option value="LARGE">मोठा (Big)</option>
                  <option value="NORMAL">सामान्य (Normal)</option>
                  <option value="EXTRA_LARGE">खूप मोठा (Extra Big)</option>
                </select>
              </div>
            </div>
          )}

          {mode === 'REGISTER' && role === 'CAREGIVER' && (
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 'var(--font-sm)', marginBottom: '0.25rem' }}>
                ज्येष्ठांचा कनेक्शन कोड (Senior 6-char Code, Optional):
              </label>
              <input
                type="text"
                placeholder="उदा. AAI789"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                style={{ width: '100%', padding: '0.8rem', fontSize: 'var(--font-md)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)', letterSpacing: '2px' }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              padding: '1.25rem',
              backgroundColor: role === 'SENIOR' ? 'var(--brand-primary)' : '#7c3aed',
              color: '#ffffff',
              fontSize: 'var(--font-lg)',
              fontWeight: 800,
              borderRadius: 'var(--radius-md)',
            }}
          >
            {loading ? 'कृपया थांबा...' : mode === 'LOGIN' ? 'लॉगिन करा (Continue)' : 'खाते तयार करा (Submit)'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <button
            type="button"
            onClick={() => setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
            style={{ fontSize: 'var(--font-md)', color: 'var(--brand-primary)', fontWeight: 700, textDecoration: 'underline' }}
          >
            {mode === 'LOGIN' ? 'नवीन आहात? नोंदणी करा (Create Account)' : 'आधीच खाते आहे? लॉगिन करा (Sign In)'}
          </button>
        </div>

        {/* Quick Demo Preloads */}
        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '2px solid var(--border-light)' }}>
          <div style={{ fontSize: 'var(--font-sm)', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            ⚡ परीक्षक / मूल्यांकनासाठी झटपट डेमो खाती (Demo Quick-Fill):
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fillQuickDemo('SENIOR')}
              style={{
                padding: '0.5rem 0.8rem',
                backgroundColor: 'var(--brand-surface)',
                color: 'var(--brand-text)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: 'var(--font-sm)',
                border: '1px solid var(--brand-primary)',
              }}
            >
              Demo Aai (Senior)
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('CAREGIVER')}
              style={{
                padding: '0.5rem 0.8rem',
                backgroundColor: '#ede9fe',
                color: '#6d28d9',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: 'var(--font-sm)',
                border: '1px solid #7c3aed',
              }}
            >
              Demo Daughter (Caregiver)
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('ADMIN')}
              style={{
                padding: '0.5rem 0.8rem',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: 'var(--font-sm)',
                border: '1px solid var(--border-strong)',
              }}
            >
              System Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

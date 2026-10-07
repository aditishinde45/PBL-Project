import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { Language } from '../i18n';
import {
  Sun,
  Moon,
  Type,
  Globe,
  Sparkles,
  ArrowRight,
  UserPlus,
  LogIn,
  Heart,
  Users,
} from 'lucide-react';

interface LoginViewProps {
  onSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { login, demoLogin, registerSenior, registerCaregiver } = useAuth();
  const { t, language, setLanguage, theme, setTheme, fontSize, setFontSize } = usePreferences();

  // Mode: 'login' or 'signup'
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Login form state
  const [identifier, setIdentifier] = useState('aai@elderease.com');
  const [password, setPassword] = useState('aai123');

  // Sign up form state
  const [signupRole, setSignupRole] = useState<'SENIOR' | 'CAREGIVER'>('SENIOR');
  const [signupName, setSignupName] = useState('');
  const [signupIdentifier, setSignupIdentifier] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [relationship, setRelationship] = useState('Daughter');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await demoLogin();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || t('common.errorGeneral'));
    } finally {
      setLoading(false);
    }
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;
    setLoading(true);
    setError(null);
    try {
      await login(identifier, password);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || t('common.errorGeneral'));
    } finally {
      setLoading(false);
    }
  };

  const handleFormSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupIdentifier.trim() || !signupPassword) {
      setError(
        language === 'mr'
          ? 'कृपया आपले नाव, फोन/ईमेल आणि पासवर्ड भरा.'
          : language === 'hi'
          ? 'कृपया अपना नाम, फोन/ईमेल और पासवर्ड भरें।'
          : 'Please enter your name, email/phone, and a password.'
      );
      return;
    }

    setLoading(true);
    setError(null);

    const isEmail = signupIdentifier.includes('@');
    const signupData: any = {
      name: signupName.trim(),
      email: isEmail ? signupIdentifier.trim() : undefined,
      phone: !isEmail ? signupIdentifier.trim() : undefined,
      password: signupPassword,
      language,
    };

    try {
      if (signupRole === 'SENIOR') {
        if (emergencyPhone.trim()) {
          signupData.emergencyContactPhone = emergencyPhone.trim();
        }
        await registerSenior(signupData);
      } else {
        signupData.relationshipToSenior = relationship;
        await registerCaregiver(signupData);
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || t('common.errorGeneral'));
    } finally {
      setLoading(false);
    }
  };

  const cycleFontSize = () => {
    if (fontSize === 'NORMAL') setFontSize('LARGE');
    else if (fontSize === 'LARGE') setFontSize('EXTRA_LARGE');
    else setFontSize('NORMAL');
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
      {/* Top Accessible Bar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 2rem',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '3px solid var(--border-light)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--brand-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.6rem',
            }}
          >
            E
          </div>
          <div>
            <h1 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
              {t('app.title')}
            </h1>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', margin: 0 }}>
              {t('app.tagline')}
            </p>
          </div>
        </div>

        {/* Quick controls: Language, Theme, Text Size */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Globe size={22} color="var(--brand-primary)" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              aria-label={t('settings.language')}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--border-strong)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: 'var(--font-sm)',
                cursor: 'pointer',
              }}
            >
              <option value="mr">मराठी</option>
              <option value="hi">हिंदी</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label={theme === 'light' ? t('settings.themeDark') : t('settings.themeLight')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border-strong)',
              backgroundColor: 'var(--bg-surface)',
              fontWeight: 700,
              fontSize: 'var(--font-sm)',
              cursor: 'pointer',
            }}
          >
            {theme === 'light' ? (
              <>
                <Moon size={20} /> {t('settings.themeDark')}
              </>
            ) : (
              <>
                <Sun size={20} /> {t('settings.themeLight')}
              </>
            )}
          </button>

          {/* Text Size Cycle */}
          <button
            onClick={cycleFontSize}
            aria-label={t('settings.textSize')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border-strong)',
              backgroundColor: 'var(--bg-surface)',
              fontWeight: 700,
              fontSize: 'var(--font-sm)',
              cursor: 'pointer',
            }}
          >
            <Type size={20} />
            {fontSize === 'NORMAL' && t('settings.sizeNormal')}
            {fontSize === 'LARGE' && t('settings.sizeLarge')}
            {fontSize === 'EXTRA_LARGE' && t('settings.sizeXLarge')}
          </button>
        </div>
      </header>

      {/* Main Login / Sign Up Container */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 1.5rem',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '580px',
            backgroundColor: 'var(--bg-surface)',
            border: '3px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem 2rem',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Mode Switcher Tabs (Log In vs Sign Up) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              backgroundColor: 'var(--bg-primary)',
              padding: '0.5rem',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '2rem',
              border: '2px solid var(--border-light)',
            }}
          >
            <button
              onClick={() => {
                setAuthMode('login');
                setError(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: authMode === 'login' ? '2px solid var(--brand-primary)' : '2px solid transparent',
                backgroundColor: authMode === 'login' ? 'var(--bg-surface)' : 'transparent',
                color: authMode === 'login' ? 'var(--brand-primary)' : 'var(--text-muted)',
                fontWeight: 800,
                fontSize: 'var(--font-base)',
                cursor: 'pointer',
                boxShadow: authMode === 'login' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <LogIn size={22} />
              {t('login.logInTab')}
            </button>

            <button
              onClick={() => {
                setAuthMode('signup');
                setError(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: authMode === 'signup' ? '2px solid var(--brand-primary)' : '2px solid transparent',
                backgroundColor: authMode === 'signup' ? 'var(--bg-surface)' : 'transparent',
                color: authMode === 'signup' ? 'var(--brand-primary)' : 'var(--text-muted)',
                fontWeight: 800,
                fontSize: 'var(--font-base)',
                cursor: 'pointer',
                boxShadow: authMode === 'signup' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <UserPlus size={22} />
              {t('login.signUpTab')}
            </button>
          </div>

          {/* Welcoming Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, marginBottom: '0.5rem' }}>
              {authMode === 'login' ? t('login.welcome') : t('login.signUpTab')}
            </h2>
            <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)' }}>
              {authMode === 'login'
                ? t('login.subtitle')
                : language === 'mr'
                ? 'सोप्या आणि सुरक्षित प्रवासासाठी आपले खाते सुरू करा.'
                : language === 'hi'
                ? 'सरल और सुरक्षित डिजिटल सफर के लिए अपना खाता शुरू करें।'
                : 'Create your account for patient, simple digital companionship.'}
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'var(--status-red-bg)',
                color: 'var(--status-red-text)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                fontWeight: 700,
                fontSize: 'var(--font-base)',
                textAlign: 'center',
                border: '2px solid var(--status-red)',
              }}
            >
              {error}
            </div>
          )}

          {/* --- LOGIN MODE --- */}
          {authMode === 'login' ? (
            <>
              {/* 1-Click Demo Login Button */}
              <div style={{ marginBottom: '2rem' }}>
                <button
                  onClick={handleDemoLogin}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1rem',
                    backgroundColor: 'var(--brand-primary)',
                    color: '#ffffff',
                    border: '3px solid var(--brand-primary-hover)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--font-lg)',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    boxShadow: 'var(--shadow-md)',
                    cursor: 'pointer',
                  }}
                >
                  <Sparkles size={28} />
                  {loading ? t('login.loggingIn') : t('login.demoButton')}
                </button>
                <p
                  style={{
                    textAlign: 'center',
                    marginTop: '0.5rem',
                    fontSize: 'var(--font-sm)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {t('login.demoHint')}
                </p>
              </div>

              {/* Divider */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.75rem',
                  color: 'var(--text-muted)',
                }}
              >
                <div style={{ flex: 1, height: '2px', backgroundColor: 'var(--border-light)' }} />
                <span style={{ fontSize: 'var(--font-sm)', fontWeight: 700 }}>{t('login.orLogin')}</span>
                <div style={{ flex: 1, height: '2px', backgroundColor: 'var(--border-light)' }} />
              </div>

              {/* Standard Form Login */}
              <form onSubmit={handleFormLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 'var(--font-base)',
                      fontWeight: 700,
                      marginBottom: '0.5rem',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {t('login.identifier')}
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="aai@elderease.com"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '2px solid var(--border-strong)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--font-base)',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 'var(--font-base)',
                      fontWeight: 700,
                      marginBottom: '0.5rem',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {t('login.password')}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '2px solid var(--border-strong)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--font-base)',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: '0.5rem',
                    width: '100%',
                    padding: '1.25rem',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                    border: '2px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-base)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  {loading ? t('login.loggingIn') : t('login.loginButton')}
                  <ArrowRight size={22} />
                </button>
              </form>

              {/* Prompt to Sign Up */}
              <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setError(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-primary)',
                    fontSize: 'var(--font-base)',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {t('login.dontHaveAccount')}
                </button>
              </div>
            </>
          ) : (
            /* --- SIGN UP MODE --- */
            <form onSubmit={handleFormSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Role Selection */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-base)',
                    fontWeight: 700,
                    marginBottom: '0.6rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  {t('login.role')}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setSignupRole('SENIOR')}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: `3px solid ${signupRole === 'SENIOR' ? 'var(--brand-primary)' : 'var(--border-light)'}`,
                      backgroundColor: signupRole === 'SENIOR' ? 'var(--brand-surface)' : 'var(--bg-primary)',
                      color: signupRole === 'SENIOR' ? 'var(--brand-text)' : 'var(--text-primary)',
                      fontWeight: 800,
                      fontSize: 'var(--font-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.4rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Heart size={24} color={signupRole === 'SENIOR' ? 'var(--brand-primary)' : 'var(--text-muted)'} />
                    {t('login.roleSenior')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupRole('CAREGIVER')}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: `3px solid ${signupRole === 'CAREGIVER' ? 'var(--brand-primary)' : 'var(--border-light)'}`,
                      backgroundColor: signupRole === 'CAREGIVER' ? 'var(--brand-surface)' : 'var(--bg-primary)',
                      color: signupRole === 'CAREGIVER' ? 'var(--brand-text)' : 'var(--text-primary)',
                      fontWeight: 800,
                      fontSize: 'var(--font-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.4rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Users size={24} color={signupRole === 'CAREGIVER' ? 'var(--brand-primary)' : 'var(--text-muted)'} />
                    {t('login.roleCaregiver')}
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-base)',
                    fontWeight: 700,
                    marginBottom: '0.5rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  {t('login.name')}
                </label>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder={signupRole === 'SENIOR' ? 'e.g. सुलोचना ताई / Sulochana Patil' : 'e.g. प्रिया / Priya'}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid var(--border-strong)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--font-base)',
                  }}
                />
              </div>

              {/* Phone or Email */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-base)',
                    fontWeight: 700,
                    marginBottom: '0.5rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  {t('login.identifier')}
                </label>
                <input
                  type="text"
                  value={signupIdentifier}
                  onChange={(e) => setSignupIdentifier(e.target.value)}
                  placeholder="e.g. 9876543210 or yourname@gmail.com"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid var(--border-strong)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--font-base)',
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-base)',
                    fontWeight: 700,
                    marginBottom: '0.5rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  {t('login.password')}
                </label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Choose a simple password"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid var(--border-strong)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--font-base)',
                  }}
                />
              </div>

              {/* Extra optional field based on role */}
              {signupRole === 'SENIOR' ? (
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 'var(--font-base)',
                      fontWeight: 700,
                      marginBottom: '0.5rem',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {t('login.emergencyContact')}
                  </label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="Daughter / Son phone number"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '2px solid var(--border-strong)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--font-base)',
                    }}
                  />
                </div>
              ) : (
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 'var(--font-base)',
                      fontWeight: 700,
                      marginBottom: '0.5rem',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {language === 'mr' ? 'नाते' : language === 'hi' ? 'संबंध' : 'Relationship to Senior'}
                  </label>
                  <input
                    type="text"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    placeholder="e.g. Daughter, Son, Grandchild"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '2px solid var(--border-strong)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--font-base)',
                    }}
                  />
                </div>
              )}

              {/* Submit Sign Up Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '0.75rem',
                  width: '100%',
                  padding: '1.35rem',
                  backgroundColor: 'var(--brand-primary)',
                  color: '#ffffff',
                  border: '3px solid var(--brand-primary-hover)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--font-lg)',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  boxShadow: 'var(--shadow-md)',
                  cursor: 'pointer',
                }}
              >
                <UserPlus size={24} />
                {loading ? t('login.creatingAccount') : t('login.createAccountButton')}
              </button>

              {/* Switch back to Log In */}
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setError(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-primary)',
                    fontSize: 'var(--font-base)',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {t('login.alreadyHaveAccount')}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

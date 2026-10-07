import React, { useState } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { Language } from '../i18n';
import {
  Sun,
  Moon,
  Type,
  Globe,
  Volume2,
  VolumeX,
  Gauge,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';

interface SettingsViewProps {
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const {
    t,
    language,
    theme,
    fontSize,
    voiceSpeed,
    voiceEnabled,
    savePreferences,
  } = usePreferences();

  const [savedNotice, setSavedNotice] = useState(false);

  const showSaved = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
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
      {/* Top Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 2rem',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '3px solid var(--border-light)',
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--border-strong)',
            backgroundColor: 'var(--bg-subtle)',
            fontSize: 'var(--font-md)',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={24} />
          {t('settings.back')}
        </button>

        <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, margin: 0 }}>
          {t('settings.title')}
        </h2>

        <div style={{ width: '80px' }} />
      </header>

      {/* Main Container */}
      <main
        className="app-container"
        style={{
          flex: 1,
          padding: '3rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          maxWidth: '850px',
        }}
      >
        {savedNotice && (
          <div
            style={{
              backgroundColor: 'var(--status-green-bg)',
              color: 'var(--status-green-text)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 800,
              fontSize: 'var(--font-base)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: '2px solid var(--status-green)',
            }}
          >
            <CheckCircle size={24} />
            <span>{t('settings.saved')}</span>
          </div>
        )}

        {/* 1. Language Setting */}
        <section
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '3px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <Globe size={28} color="var(--brand-primary)" />
            <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, margin: 0 }}>
              {t('settings.language')}
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {(['mr', 'hi', 'en'] as Language[]).map((langKey) => (
              <button
                key={langKey}
                onClick={() => {
                  savePreferences({ language: langKey });
                  showSaved();
                }}
                style={{
                  padding: '1.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: `3px solid ${language === langKey ? 'var(--brand-primary)' : 'var(--border-light)'}`,
                  backgroundColor: language === langKey ? 'var(--brand-surface)' : 'var(--bg-primary)',
                  color: language === langKey ? 'var(--brand-text)' : 'var(--text-primary)',
                  fontSize: 'var(--font-lg)',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {langKey === 'mr' && t('settings.langMr')}
                {langKey === 'hi' && t('settings.langHi')}
                {langKey === 'en' && t('settings.langEn')}
              </button>
            ))}
          </div>
        </section>

        {/* 2. Appearance (Light / Dark) */}
        <section
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '3px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {theme === 'light' ? <Sun size={28} color="#f59e0b" /> : <Moon size={28} color="#818cf8" />}
            <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, margin: 0 }}>
              {t('settings.appearance')}
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <button
              onClick={() => {
                savePreferences({ theme: 'light' });
                showSaved();
              }}
              style={{
                padding: '1.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: `3px solid ${theme === 'light' ? 'var(--brand-primary)' : 'var(--border-light)'}`,
                backgroundColor: theme === 'light' ? 'var(--brand-surface)' : 'var(--bg-primary)',
                color: theme === 'light' ? 'var(--brand-text)' : 'var(--text-primary)',
                fontSize: 'var(--font-lg)',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
              }}
            >
              <Sun size={26} />
              {t('settings.themeLight')}
            </button>

            <button
              onClick={() => {
                savePreferences({ theme: 'dark' });
                showSaved();
              }}
              style={{
                padding: '1.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: `3px solid ${theme === 'dark' ? 'var(--brand-primary)' : 'var(--border-light)'}`,
                backgroundColor: theme === 'dark' ? 'var(--brand-surface)' : 'var(--bg-primary)',
                color: theme === 'dark' ? 'var(--brand-text)' : 'var(--text-primary)',
                fontSize: 'var(--font-lg)',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
              }}
            >
              <Moon size={26} />
              {t('settings.themeDark')}
            </button>
          </div>
        </section>

        {/* 3. Text Size */}
        <section
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '3px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <Type size={28} color="var(--brand-primary)" />
            <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, margin: 0 }}>
              {t('settings.textSize')}
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {(['NORMAL', 'LARGE', 'EXTRA_LARGE'] as const).map((size) => (
              <button
                key={size}
                onClick={() => {
                  savePreferences({ fontSize: size });
                  showSaved();
                }}
                style={{
                  padding: '1.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: `3px solid ${fontSize === size ? 'var(--brand-primary)' : 'var(--border-light)'}`,
                  backgroundColor: fontSize === size ? 'var(--brand-surface)' : 'var(--bg-primary)',
                  color: fontSize === size ? 'var(--brand-text)' : 'var(--text-primary)',
                  fontSize: 'var(--font-lg)',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {size === 'NORMAL' && t('settings.sizeNormal')}
                {size === 'LARGE' && t('settings.sizeLarge')}
                {size === 'EXTRA_LARGE' && t('settings.sizeXLarge')}
              </button>
            ))}
          </div>
        </section>

        {/* 4. Voice Assistant & Speed */}
        <section
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '3px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <Volume2 size={28} color="var(--brand-primary)" />
            <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, margin: 0 }}>
              {t('settings.voice')}
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <button
              onClick={() => {
                savePreferences({ voiceEnabled: true });
                showSaved();
              }}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: `3px solid ${voiceEnabled ? 'var(--brand-primary)' : 'var(--border-light)'}`,
                backgroundColor: voiceEnabled ? 'var(--brand-surface)' : 'var(--bg-primary)',
                color: voiceEnabled ? 'var(--brand-text)' : 'var(--text-primary)',
                fontSize: 'var(--font-base)',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <Volume2 size={22} />
              {t('settings.voiceOn')}
            </button>

            <button
              onClick={() => {
                savePreferences({ voiceEnabled: false });
                showSaved();
              }}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: `3px solid ${!voiceEnabled ? 'var(--brand-primary)' : 'var(--border-light)'}`,
                backgroundColor: !voiceEnabled ? 'var(--brand-surface)' : 'var(--bg-primary)',
                color: !voiceEnabled ? 'var(--brand-text)' : 'var(--text-primary)',
                fontSize: 'var(--font-base)',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <VolumeX size={22} />
              {t('settings.voiceOff')}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Gauge size={24} color="var(--brand-primary)" />
            <h4 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, margin: 0 }}>
              {t('settings.voiceSpeed')}
            </h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <button
              onClick={() => {
                savePreferences({ voiceSpeed: 'NORMAL' });
                showSaved();
              }}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: `3px solid ${voiceSpeed === 'NORMAL' ? 'var(--brand-primary)' : 'var(--border-light)'}`,
                backgroundColor: voiceSpeed === 'NORMAL' ? 'var(--brand-surface)' : 'var(--bg-primary)',
                color: voiceSpeed === 'NORMAL' ? 'var(--brand-text)' : 'var(--text-primary)',
                fontSize: 'var(--font-base)',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {t('settings.speedNormal')}
            </button>

            <button
              onClick={() => {
                savePreferences({ voiceSpeed: 'SLOW' });
                showSaved();
              }}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: `3px solid ${voiceSpeed === 'SLOW' ? 'var(--brand-primary)' : 'var(--border-light)'}`,
                backgroundColor: voiceSpeed === 'SLOW' ? 'var(--brand-surface)' : 'var(--bg-primary)',
                color: voiceSpeed === 'SLOW' ? 'var(--brand-text)' : 'var(--text-primary)',
                fontSize: 'var(--font-base)',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {t('settings.speedSlow')}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

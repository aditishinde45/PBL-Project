import React from 'react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { Language } from '../i18n';
import {
  Mic,
  Smartphone,
  Users,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Type,
  Globe,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: 'CHAT' | 'TASKS_LIBRARY' | 'FAMILY_HELP' | 'SETTINGS') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const { t, language, setLanguage, theme, setTheme, fontSize, setFontSize } = usePreferences();

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
      {/* Top Accessible Header */}
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

        {/* Global Controls: Language, Theme, Text Size, Logout */}
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
            }}
          >
            <Type size={20} />
            {fontSize === 'NORMAL' && t('settings.sizeNormal')}
            {fontSize === 'LARGE' && t('settings.sizeLarge')}
            {fontSize === 'EXTRA_LARGE' && t('settings.sizeXLarge')}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            aria-label={t('login.logout')}
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
              color: 'var(--status-red)',
            }}
          >
            <LogOut size={20} />
            {t('login.logout')}
          </button>
        </div>
      </header>

      {/* Main Home Screen */}
      <main className="app-container" style={{ flex: 1, padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {/* Friendly Greeting Card */}
        <section
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '3px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem 2.5rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--font-2xl)',
              fontWeight: 800,
              marginBottom: '0.75rem',
              color: 'var(--brand-primary)',
            }}
          >
            {t('home.greeting')}
          </h2>
          <p
            style={{
              fontSize: 'var(--font-lg)',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              margin: 0,
            }}
          >
            {t('home.howCanIHelp')}
          </p>
        </section>

        {/* Primary Action: Huge Talk to ElderEase Button */}
        <section>
          <button
            onClick={() => onNavigate('CHAT')}
            className="senior-action-button btn-talk-hero"
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.25rem',
              padding: '2.5rem 2rem',
              cursor: 'pointer',
            }}
          >
            <Mic size={48} strokeWidth={2.5} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, lineHeight: 1.2 }}>
                {t('home.talkToElderease')}
              </div>
              <div style={{ fontSize: 'var(--font-md)', fontWeight: 500, opacity: 0.95, marginTop: '0.25rem' }}>
                "{t('home.talkDesc')}"
              </div>
            </div>
          </button>
        </section>

        {/* Secondary Friendly Cards */}
        <section className="senior-card-grid">
          {/* 1. Do Something */}
          <button
            onClick={() => onNavigate('TASKS_LIBRARY')}
            className="senior-action-button card-do-something"
            style={{ cursor: 'pointer' }}
          >
            <Smartphone size={44} color="var(--brand-primary)" strokeWidth={2.5} />
            <span style={{ fontSize: 'var(--font-xl)', fontWeight: 800 }}>
              {t('home.doSomething')}
            </span>
            <span style={{ fontSize: 'var(--font-base)', color: 'var(--text-muted)', fontWeight: 500 }}>
              {t('home.doDesc')}
            </span>
          </button>

          {/* 2. Family Help */}
          <button
            onClick={() => onNavigate('FAMILY_HELP')}
            className="senior-action-button card-family"
            style={{ cursor: 'pointer' }}
          >
            <Users size={44} color="#d97706" strokeWidth={2.5} />
            <span style={{ fontSize: 'var(--font-xl)', fontWeight: 800 }}>
              {t('home.familyHelp')}
            </span>
            <span style={{ fontSize: 'var(--font-base)', color: 'var(--text-muted)', fontWeight: 500 }}>
              {t('home.familyDesc')}
            </span>
          </button>

          {/* 3. Settings */}
          <button
            onClick={() => onNavigate('SETTINGS')}
            className="senior-action-button card-settings"
            style={{ cursor: 'pointer' }}
          >
            <SettingsIcon size={44} color="var(--text-secondary)" strokeWidth={2.5} />
            <span style={{ fontSize: 'var(--font-xl)', fontWeight: 800 }}>
              {t('home.settings')}
            </span>
            <span style={{ fontSize: 'var(--font-base)', color: 'var(--text-muted)', fontWeight: 500 }}>
              {t('home.settingsDesc')}
            </span>
          </button>
        </section>
      </main>
    </div>
  );
};

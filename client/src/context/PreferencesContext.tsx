import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, getTranslation } from '../i18n';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

export type FontSize = 'NORMAL' | 'LARGE' | 'EXTRA_LARGE';
export type VoiceSpeed = 'SLOW' | 'NORMAL';
export type Theme = 'light' | 'dark';

interface PreferencesContextType {
  language: Language;
  theme: Theme;
  fontSize: FontSize;
  voiceSpeed: VoiceSpeed;
  voiceEnabled: boolean;
  highContrast: boolean;
  ttsEnabled: boolean;
  t: (keyPath: string, params?: Record<string, string | number>) => string;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
  setVoiceSpeed: (speed: VoiceSpeed) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setHighContrast: (val: boolean) => void;
  setTtsEnabled: (val: boolean) => void;
  savePreferences: (updates: Partial<{
    language: Language;
    theme: Theme;
    fontSize: FontSize;
    voiceSpeed: VoiceSpeed;
    voiceEnabled: boolean;
    highContrast: boolean;
    ttsEnabled: boolean;
  }>) => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('elderease_lang');
    return (saved === 'en' || saved === 'hi' || saved === 'mr') ? saved : 'mr';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('elderease_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const saved = localStorage.getItem('elderease_fontSize');
    return (saved === 'NORMAL' || saved === 'LARGE' || saved === 'EXTRA_LARGE') ? saved : 'LARGE';
  });

  const [voiceSpeed, setVoiceSpeedState] = useState<VoiceSpeed>(() => {
    const saved = localStorage.getItem('elderease_voiceSpeed');
    return (saved === 'NORMAL' || saved === 'SLOW') ? saved : 'NORMAL';
  });

  const [voiceEnabled, setVoiceEnabledState] = useState<boolean>(() => {
    return localStorage.getItem('elderease_voiceEnabled') !== 'false';
  });

  // Sync from authenticated user profile if available
  useEffect(() => {
    if (user?.preference) {
      if (user.preference.language) {
        const lang = user.preference.language as Language;
        if (lang === 'en' || lang === 'hi' || lang === 'mr') setLanguageState(lang);
      }
      if (user.preference.theme) {
        const th = user.preference.theme as Theme;
        if (th === 'light' || th === 'dark') setThemeState(th);
      }
      if (user.preference.fontSize) {
        setFontSizeState(user.preference.fontSize as FontSize);
      }
      if (user.preference.voiceSpeed) {
        setVoiceSpeedState(user.preference.voiceSpeed as VoiceSpeed);
      }
      if (user.preference.ttsEnabled !== undefined) {
        setVoiceEnabledState(user.preference.ttsEnabled);
      }
    }
  }, [user]);

  // Apply classes to <body> for global styling and dark/light themes
  useEffect(() => {
    const body = document.body;
    body.classList.remove('theme-light', 'theme-dark', 'font-normal', 'font-large', 'font-xlarge');

    // Theme class
    if (theme === 'dark') {
      body.classList.add('theme-dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      body.classList.add('theme-light');
      document.documentElement.setAttribute('data-theme', 'light');
    }

    // Font size class
    if (fontSize === 'NORMAL') body.classList.add('font-normal');
    else if (fontSize === 'LARGE') body.classList.add('font-large');
    else if (fontSize === 'EXTRA_LARGE') body.classList.add('font-xlarge');
  }, [theme, fontSize]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('elderease_lang', lang);
  };

  const setTheme = (th: Theme) => {
    setThemeState(th);
    localStorage.setItem('elderease_theme', th);
  };

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem('elderease_fontSize', size);
  };

  const setVoiceSpeed = (speed: VoiceSpeed) => {
    setVoiceSpeedState(speed);
    localStorage.setItem('elderease_voiceSpeed', speed);
  };

  const setVoiceEnabled = (enabled: boolean) => {
    setVoiceEnabledState(enabled);
    localStorage.setItem('elderease_voiceEnabled', String(enabled));
  };

  const savePreferences = async (updates: any) => {
    if (updates.language) setLanguage(updates.language);
    if (updates.theme) setTheme(updates.theme);
    if (updates.fontSize) setFontSize(updates.fontSize);
    if (updates.voiceSpeed) setVoiceSpeed(updates.voiceSpeed);
    if (updates.voiceEnabled !== undefined) setVoiceEnabled(updates.voiceEnabled);

    if (user) {
      try {
        await api.updatePreferences({
          language: updates.language || language,
          theme: updates.theme || theme,
          fontSize: updates.fontSize || fontSize,
          voiceSpeed: updates.voiceSpeed || voiceSpeed,
          ttsEnabled: updates.voiceEnabled !== undefined ? updates.voiceEnabled : voiceEnabled,
        });
      } catch (e) {
        console.warn('Could not sync preferences with server:', e);
      }
    }
  };

  // Translation helper function
  const t = (keyPath: string, params?: Record<string, string | number>): string => {
    return getTranslation(language, keyPath, params);
  };

  return (
    <PreferencesContext.Provider
      value={{
        language,
        theme,
        fontSize,
        voiceSpeed,
        voiceEnabled,
        highContrast: theme === 'dark',
        ttsEnabled: voiceEnabled,
        t,
        setLanguage,
        setTheme,
        setFontSize,
        setVoiceSpeed,
        setVoiceEnabled,
        setHighContrast: (val: boolean) => setTheme(val ? 'dark' : 'light'),
        setTtsEnabled: (val: boolean) => setVoiceEnabled(val),
        savePreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used within PreferencesProvider');
  return context;
};

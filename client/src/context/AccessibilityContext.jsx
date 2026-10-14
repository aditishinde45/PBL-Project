import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';

const AccessibilityContext = createContext(null);

export const AccessibilityProvider = ({ children }) => {
  const { user, updateProfile } = useAuth();

  // Load initial preferences from localStorage or user object
  const [textSize, setTextSizeState] = useState(() => {
    return localStorage.getItem('elderease_text_size') || 'large';
  });

  const [highContrast, setHighContrastState] = useState(() => {
    return localStorage.getItem('elderease_high_contrast') === 'true';
  });

  const [reducedMotion, setReducedMotionState] = useState(() => {
    return localStorage.getItem('elderease_reduced_motion') === 'true';
  });

  const [voiceSpeed, setVoiceSpeedState] = useState(() => {
    const saved = localStorage.getItem('elderease_voice_speed');
    return saved ? parseFloat(saved) : 0.9;
  });

  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('elderease_language') || 'English';
  });

  const [teachingSpeed, setTeachingSpeedState] = useState(() => {
    return localStorage.getItem('elderease_teaching_speed') || 'Step by Step';
  });

  const [autoRead, setAutoReadState] = useState(() => {
    const saved = localStorage.getItem('elderease_auto_read');
    return saved !== null ? saved === 'true' : true;
  });

  // Sync with user object if available
  useEffect(() => {
    if (user) {
      if (user.preferredLanguage) setLanguageState(user.preferredLanguage);
      if (user.teachingSpeed) setTeachingSpeedState(user.teachingSpeed);
      if (user.accessibilityPreferences) {
        if (user.accessibilityPreferences.textSize) setTextSizeState(user.accessibilityPreferences.textSize);
        if (user.accessibilityPreferences.highContrast !== undefined) setHighContrastState(user.accessibilityPreferences.highContrast);
        if (user.accessibilityPreferences.reducedMotion !== undefined) setReducedMotionState(user.accessibilityPreferences.reducedMotion);
        if (user.accessibilityPreferences.voiceSpeed) setVoiceSpeedState(user.accessibilityPreferences.voiceSpeed);
        if (user.accessibilityPreferences.autoRead !== undefined) setAutoReadState(user.accessibilityPreferences.autoRead);
      }
    }
  }, [user]);

  // Apply DOM classes whenever settings change
  useEffect(() => {
    const root = document.documentElement;

    // Text size
    root.classList.remove('text-normal', 'text-large', 'text-xlarge');
    if (textSize === 'normal') root.classList.add('text-normal');
    else if (textSize === 'extra-large') root.classList.add('text-xlarge');
    else root.classList.add('text-large');

    // High contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  }, [textSize, highContrast, reducedMotion]);

  // Update document language attribute for accessibility and global language behavior
  useEffect(() => {
    const langMap = {
      English: 'en',
      Hindi: 'hi',
      Marathi: 'mr',
      Hinglish: 'en'
    };
    const langTag = langMap[language] || 'en';
    try {
      document.documentElement.lang = langTag;
    } catch (e) {
      // ignore in non-browser environments
    }
  }, [language]);

  // Helpers to update and persist
  const setTextSize = (size) => {
    setTextSizeState(size);
    localStorage.setItem('elderease_text_size', size);
  };

  const increaseTextSize = () => {
    if (textSize === 'normal') setTextSize('large');
    else if (textSize === 'large') setTextSize('extra-large');
  };

  const decreaseTextSize = () => {
    if (textSize === 'extra-large') setTextSize('large');
    else if (textSize === 'large') setTextSize('normal');
  };

  const toggleHighContrast = () => {
    const newVal = !highContrast;
    setHighContrastState(newVal);
    localStorage.setItem('elderease_high_contrast', newVal.toString());
  };

  const toggleReducedMotion = () => {
    const newVal = !reducedMotion;
    setReducedMotionState(newVal);
    localStorage.setItem('elderease_reduced_motion', newVal.toString());
  };

  const setVoiceSpeed = (speed) => {
    setVoiceSpeedState(speed);
    localStorage.setItem('elderease_voice_speed', speed.toString());
  };

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('elderease_language', lang);
  };

  const setTeachingSpeed = (speed) => {
    setTeachingSpeedState(speed);
    localStorage.setItem('elderease_teaching_speed', speed);
  };

  const toggleAutoRead = () => {
    const newVal = !autoRead;
    setAutoReadState(newVal);
    localStorage.setItem('elderease_auto_read', newVal.toString());
  };

  const saveAllPreferences = async () => {
    if (user) {
      await updateProfile({
        preferredLanguage: language,
        teachingSpeed,
        accessibilityPreferences: {
          textSize,
          highContrast,
          reducedMotion,
          voiceSpeed,
          autoRead
        }
      });
    }
  };

  const value = {
    textSize,
    highContrast,
    reducedMotion,
    voiceSpeed,
    language,
    teachingSpeed,
    autoRead,
    setTextSize,
    increaseTextSize,
    decreaseTextSize,
    toggleHighContrast,
    toggleReducedMotion,
    setVoiceSpeed,
    setLanguage,
    setTeachingSpeed,
    toggleAutoRead,
    saveAllPreferences
  };

  // Simple UI translation helper
  const uiStrings = {
    English: {
      textSize: 'Text Size:',
      highContrast: 'High Contrast',
      voiceOn: 'Voice On',
      voiceOff: 'Voice Off',
      languageLabel: 'Language:',
      actionForStep: 'Action for Step'
    },
    Hindi: {
      textSize: 'टेक्स्ट आकार:',
      highContrast: 'हाई कंट्रास्ट',
      voiceOn: 'वॉयस चालू',
      voiceOff: 'वॉयस बंद',
      languageLabel: 'भाषा:',
      actionForStep: 'कदम के लिए कार्रवाई'
    },
    Marathi: {
      textSize: 'मटेरचा आकार:',
      highContrast: 'उच्च कॉन्ट्रास्ट',
      voiceOn: 'आवाज चालू',
      voiceOff: 'आवाज बंद',
      languageLabel: 'भाषा:',
      actionForStep: 'पावल्‍यासाठी कृती'
    },
    Hinglish: {
      textSize: 'Text Size:',
      highContrast: 'High Contrast',
      voiceOn: 'Voice On',
      voiceOff: 'Voice Off',
      languageLabel: 'Language:',
      actionForStep: 'Action for Step'
    }
  };

  const t = (key, vars = {}) => {
    const strings = uiStrings[language] || uiStrings.English;
    let text = strings[key] || uiStrings.English[key] || key;
    Object.keys(vars).forEach(k => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(vars[k]));
    });
    return text;
  };

  // expose translation helper
  value.t = t;

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

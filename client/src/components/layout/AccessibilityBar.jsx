import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext.jsx';
import { useSpeech } from '../../context/SpeechContext.jsx';
import { Volume2, VolumeX, Eye, Sparkles } from 'lucide-react';

export const AccessibilityBar = () => {
  const {
    textSize,
    increaseTextSize,
    decreaseTextSize,
    highContrast,
    toggleHighContrast,
    language,
    setLanguage,
    voiceSpeed,
    setVoiceSpeed
  } = useAccessibility();

  const { t } = useAccessibility();

  const { isMuted, toggleMute } = useSpeech();

  return (
    <aside aria-label="Accessibility quick controls" className="bg-blue-900 text-white px-4 py-2 text-sm sm:text-base border-b border-blue-950">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Quick Label & Text Size */}
        <div className="flex items-center gap-3">
          <span className="font-semibold text-blue-200 hidden sm:inline">{t('textSize')}</span>
          <div className="flex items-center bg-blue-800/80 rounded-xl p-0.5 border border-blue-700">
            <button
              onClick={decreaseTextSize}
              disabled={textSize === 'normal'}
              className="px-3 py-1 font-bold rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
              title="Decrease text size"
              aria-label="Decrease text size"
            >
              A-
            </button>
            <span className="px-2 font-bold text-xs uppercase tracking-wider text-blue-200">
              {textSize === 'extra-large' ? 'Huge' : textSize === 'large' ? 'Large' : 'Normal'}
            </span>
            <button
              onClick={increaseTextSize}
              disabled={textSize === 'extra-large'}
              className="px-3 py-1 font-bold rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
              title="Increase text size"
              aria-label="Increase text size"
            >
              A+
            </button>
          </div>
        </div>

        {/* Center: High Contrast & Audio Mute */}
        <div className="flex items-center gap-2 sm:gap-3">
            <button
            onClick={toggleHighContrast}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-sm font-semibold transition-colors ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-300'
                : 'bg-blue-800/80 hover:bg-blue-700 text-white border-blue-700'
            }`}
            aria-pressed={highContrast}
            >
            <Eye className="w-4 h-4" />
            <span>{t('highContrast')}</span>
          </button>

          <button
            onClick={toggleMute}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-sm font-semibold transition-colors ${
              isMuted
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-blue-800/80 hover:bg-blue-700 text-white border-blue-700'
            }`}
            title={isMuted ? 'Unmute voice' : 'Mute voice'}
            aria-label={isMuted ? 'Unmute voice' : 'Mute voice'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isMuted ? t('voiceOff') : t('voiceOn')}</span>
          </button>
        </div>


      </div>
    </aside>
  );
};

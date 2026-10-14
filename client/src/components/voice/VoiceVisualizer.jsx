import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext.jsx';

export const VoiceVisualizer = ({ state = 'idle', size = 'normal' }) => {
  const { reducedMotion } = useAccessibility();

  if (state === 'idle') {
    return null;
  }

  const barCount = size === 'large' ? 7 : 5;
  const barHeights = ['h-4', 'h-8', 'h-12', 'h-8', 'h-4', 'h-10', 'h-6'];

  const colorClass =
    state === 'listening'
      ? 'bg-blue-600'
      : state === 'speaking'
      ? 'bg-emerald-600'
      : state === 'processing'
      ? 'bg-amber-500'
      : 'bg-rose-500';

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 h-16 py-2" aria-hidden="true">
      {Array.from({ length: barCount }).map((_, i) => (
        <span
          key={i}
          style={{
            animationDelay: reducedMotion ? '0s' : `${i * 0.15}s`,
            animationDuration: '1.2s'
          }}
          className={`w-2 sm:w-2.5 rounded-full ${colorClass} ${
            reducedMotion ? 'h-6 opacity-80' : `${barHeights[i % barHeights.length]} animate-wave-bar`
          } transition-all duration-300`}
        />
      ))}
    </div>
  );
};

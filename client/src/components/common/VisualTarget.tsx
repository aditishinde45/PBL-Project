import React from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import {
  Phone,
  Video,
  Play,
  Camera,
  Send,
  Search,
  Sparkles,
} from 'lucide-react';

export interface VisualTargetProps {
  name: string;
  description: string;
  type?: string;
  icon?: 'whatsapp' | 'video-camera' | 'youtube' | 'camera' | 'send-arrow' | 'search';
  badgeColor?: string;
  highlight?: boolean;
}

export const VisualTarget: React.FC<VisualTargetProps> = ({
  name,
  description,
  icon = 'whatsapp',
  badgeColor,
  highlight = true,
}) => {
  const { language } = usePreferences();

  const getSubtext = () => {
    if (language === 'mr') return 'स्क्रीनवर हे चिन्ह शोधा:';
    if (language === 'hi') return 'स्क्रीन पर यह निशान देखिए:';
    return 'Look for this symbol on your screen:';
  };

  const renderIconGraphic = () => {
    if (icon === 'whatsapp') {
      return (
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            backgroundColor: badgeColor || '#25D366',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(37, 211, 102, 0.4)',
            color: '#ffffff',
          }}
          aria-hidden="true"
        >
          <Phone size={42} strokeWidth={2.5} fill="#ffffff" />
        </div>
      );
    }

    if (icon === 'youtube') {
      return (
        <div
          style={{
            width: '78px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: badgeColor || '#FF0000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(255, 0, 0, 0.4)',
            color: '#ffffff',
          }}
          aria-hidden="true"
        >
          <Play size={32} strokeWidth={2.5} fill="#ffffff" style={{ marginLeft: '4px' }} />
        </div>
      );
    }

    if (icon === 'video-camera') {
      return (
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            backgroundColor: badgeColor || '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(2, 132, 199, 0.4)',
            color: '#ffffff',
          }}
          aria-hidden="true"
        >
          <Video size={42} strokeWidth={2.5} />
        </div>
      );
    }

    if (icon === 'camera') {
      return (
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            backgroundColor: badgeColor || '#0f766e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(15, 118, 110, 0.4)',
            color: '#ffffff',
          }}
          aria-hidden="true"
        >
          <Camera size={40} strokeWidth={2.5} />
        </div>
      );
    }

    if (icon === 'send-arrow') {
      return (
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: badgeColor || '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(22, 163, 74, 0.4)',
            color: '#ffffff',
          }}
          aria-hidden="true"
        >
          <Send size={38} strokeWidth={2.5} fill="#ffffff" style={{ marginLeft: '4px' }} />
        </div>
      );
    }

    // Default search icon
    return (
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          backgroundColor: badgeColor || '#6366f1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 16px rgba(99, 102, 241, 0.4)',
          color: '#ffffff',
        }}
        aria-hidden="true"
      >
        <Search size={40} strokeWidth={2.5} />
      </div>
    );
  };

  return (
    <div
      role="region"
      aria-label={`Visual guide: ${name}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        padding: '1.5rem',
        backgroundColor: 'var(--bg-subtle)',
        border: highlight ? '3px solid var(--brand-primary)' : '2px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: highlight ? '0 4px 14px rgba(15, 118, 110, 0.15)' : 'none',
        margin: '1rem 0',
      }}
    >
      {/* Icon Badge Graphic */}
      <div style={{ flexShrink: 0 }}>{renderIconGraphic()}</div>

      {/* Textual Description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
        <span
          style={{
            fontSize: 'var(--font-sm)',
            fontWeight: 700,
            color: 'var(--brand-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {getSubtext()}
        </span>

        <h3
          style={{
            fontSize: 'var(--font-xl)',
            fontWeight: 800,
            margin: 0,
            color: 'var(--text-primary)',
            lineHeight: 1.2,
          }}
        >
          {name}
        </h3>

        <p
          style={{
            fontSize: 'var(--font-base)',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

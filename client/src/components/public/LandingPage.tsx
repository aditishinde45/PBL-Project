import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import { Mic, Heart, Pill, Shield, Users, Globe, Download, ArrowRight, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (defaultRole: 'SENIOR' | 'CAREGIVER') => void;
  onNavigateToExtension: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onNavigateToExtension,
}) => {
  const { language, setLanguage } = usePreferences();

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Top Navbar */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 2rem',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '2px solid var(--border-light)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--brand-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.5rem',
            }}
          >
            E
          </div>
          <span style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            ElderEase
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <select
            value={language}
            onChange={(e: any) => setLanguage(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border-strong)',
              fontSize: 'var(--font-sm)',
              fontWeight: 700,
            }}
          >
            <option value="mr">मराठी (Marathi)</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="en">English</option>
          </select>

          <button
            onClick={onNavigateToExtension}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border-strong)',
              fontWeight: 700,
              fontSize: 'var(--font-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Download size={18} />
            <span>Browser Helper</span>
          </button>

          <button
            onClick={() => onOpenAuth('SENIOR')}
            style={{
              padding: '0.6rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--brand-primary)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: 'var(--font-sm)',
            }}
          >
            Login / नोंदणी
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '4rem 1.5rem 3rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            backgroundColor: 'var(--brand-surface)',
            color: 'var(--brand-text)',
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            fontWeight: 800,
            fontSize: 'var(--font-md)',
            marginBottom: '1.5rem',
          }}
        >
          ✨ AI Companion for Safe & Independent Digital Living
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 900,
            color: 'var(--text-primary)',
            lineHeight: '1.2',
            marginBottom: '1.5rem',
            letterSpacing: '-0.02em',
          }}
        >
          Technology should feel simple.
        </h1>

        <p
          style={{
            fontSize: 'var(--font-lg)',
            color: 'var(--text-secondary)',
            maxWidth: '800px',
            margin: '0 auto 2.5rem',
            lineHeight: '1.6',
          }}
        >
          ElderEase helps senior citizens use digital services safely and independently, while keeping their trusted family members informed when help is needed.
        </p>

        {/* 3 Main Action CTA Buttons as requested in Section 40 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.25rem',
            flexWrap: 'wrap',
            marginBottom: '3rem',
          }}
        >
          <button
            onClick={() => onOpenAuth('SENIOR')}
            style={{
              padding: '1.25rem 2.5rem',
              backgroundColor: 'var(--brand-primary)',
              color: '#ffffff',
              fontSize: 'var(--font-lg)',
              fontWeight: 800,
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              border: '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <span>TRY ELDER EASE</span>
            <ArrowRight size={24} />
          </button>

          <button
            onClick={() => onOpenAuth('CAREGIVER')}
            style={{
              padding: '1.25rem 2.25rem',
              backgroundColor: '#7c3aed',
              color: '#ffffff',
              fontSize: 'var(--font-lg)',
              fontWeight: 800,
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              border: '3px solid transparent',
            }}
          >
            FOR CAREGIVERS
          </button>

          <button
            onClick={onNavigateToExtension}
            style={{
              padding: '1.25rem 2rem',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-lg)',
              fontWeight: 800,
              borderRadius: 'var(--radius-lg)',
              border: '3px solid var(--border-strong)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Download size={22} />
            <span>GET BROWSER EXTENSION</span>
          </button>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '2rem 1.5rem 5rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.75rem',
          }}
        >
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '2px solid var(--border-light)' }}>
            <Mic size={40} color="var(--brand-primary)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, marginBottom: '0.5rem' }}>
              Patient Voice AI Companion
            </h3>
            <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)' }}>
              Speaks in Marathi, Hindi, and English. Explains things step-by-step with zero technical jargon.
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '2px solid var(--border-light)' }}>
            <Pill size={40} color="#0284c7" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, marginBottom: '0.5rem' }}>
              Proactive Medicine Reminders
            </h3>
            <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)' }}>
              Speaks doses aloud with large [Taken] buttons. Alerts family caregivers if a medicine is missed.
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '2px solid var(--border-light)' }}>
            <Heart size={40} color="var(--status-green)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, marginBottom: '0.5rem' }}>
              Daily "I Am Okay" Check-In
            </h3>
            <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)' }}>
              One tap gives peace of mind to elderly parents and busy children living across cities.
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '2px solid var(--border-light)' }}>
            <Shield size={40} color="#b45309" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, marginBottom: '0.5rem' }}>
              Scam & Suspicious Link Guard
            </h3>
            <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)' }}>
              Detects fraudulent lottery messages, fake electricity bills, and protects bank OTPs.
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '2px solid var(--border-light)' }}>
            <Users size={40} color="#7c3aed" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, marginBottom: '0.5rem' }}>
              Caregiver Supervision Loop
            </h3>
            <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)' }}>
              Real-time health adherence status, prescription AI assistance, and instant emergency alerts.
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '2px solid var(--border-light)' }}>
            <Globe size={40} color="#0d9488" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, marginBottom: '0.5rem' }}>
              Browser Extension Helper
            </h3>
            <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)' }}>
              Guides seniors across railway bookings and utility websites one simple step at a time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

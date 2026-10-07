import React, { useState, useEffect } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { api } from '../services/api';
import {
  Users,
  PhoneCall,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';

interface FamilyHelpViewProps {
  onBack: () => void;
}

export const FamilyHelpView: React.FC<FamilyHelpViewProps> = ({ onBack }) => {
  const { t, language } = usePreferences();

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);

  const loadRequests = async () => {
    try {
      const data = await api.getFamilyHelpRequests();
      setRequests(data);
    } catch (e) {
      console.warn('Could not load family help requests:', e);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleRequestHelp = async () => {
    setLoading(true);
    try {
      await api.triggerFamilyCall('Aaji needs help using ElderEase.');
      setSuccessMessage(true);
      await loadRequests();
    } catch (err) {
      console.warn('Could not trigger family call:', err);
    } finally {
      setLoading(false);
    }
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
          {t('family.back')}
        </button>

        <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, margin: 0 }}>
          {t('family.title')}
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
          gap: '2.5rem',
          maxWidth: '850px',
        }}
      >
        {/* Intro Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '3px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <HeartHandshake size={36} color="#d97706" />
            <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, margin: 0 }}>
              {t('family.caregiverLabel')}
            </h3>
          </div>

          <div
            style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border-light)',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
              {t('family.caregiverName')}
            </div>
            <div style={{ fontSize: 'var(--font-base)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              📞 {t('family.caregiverPhone')}
            </div>
          </div>

          <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            {t('family.subtitle')}
          </p>

          {/* Huge Help Request Button */}
          <button
            onClick={handleRequestHelp}
            disabled={loading}
            style={{
              width: '100%',
              padding: '1.75rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#d97706',
              color: '#ffffff',
              border: '3px solid #b45309',
              fontSize: 'var(--font-xl)',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <PhoneCall size={32} />
            <span>{loading ? t('family.sending') : t('family.requestButton')}</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div
            style={{
              backgroundColor: 'var(--status-green-bg)',
              color: 'var(--status-green-text)',
              border: '3px solid var(--status-green)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <CheckCircle2 size={32} color="var(--status-green)" />
              <h4 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, margin: 0 }}>
                {t('family.sentTitle')}
              </h4>
            </div>
            <p style={{ fontSize: 'var(--font-md)', fontWeight: 600, margin: 0 }}>
              {t('family.sentMessage')}
            </p>
          </div>
        )}

        {/* Visible Recent Requests (Proof of working workflow) */}
        {requests.length > 0 && (
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '3px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
            }}
          >
            <h4
              style={{
                fontSize: 'var(--font-lg)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: '1rem',
              }}
            >
              {t('family.recentRequests')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {requests.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '2px solid var(--border-light)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Clock size={22} color="var(--text-muted)" />
                    <span style={{ fontSize: 'var(--font-base)', fontWeight: 600 }}>
                      {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span
                    style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--font-sm)',
                      fontWeight: 800,
                      backgroundColor: req.status === 'OPEN' ? 'var(--accent-amber-bg)' : 'var(--status-green-bg)',
                      color: req.status === 'OPEN' ? 'var(--accent-amber)' : 'var(--status-green-text)',
                    }}
                  >
                    {req.status === 'OPEN' ? t('family.requestPending') : t('family.requestResolved')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

import React, { useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Wrench, Bell, AlertTriangle, Pill, Heart, RefreshCw, UserCheck } from 'lucide-react';

interface DevDemoPanelProps {
  onEventTriggered?: () => void;
}

export const DevDemoPanel: React.FC<DevDemoPanelProps> = ({ onEventTriggered }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const handleAction = async (fn: () => Promise<any>, actionName: string) => {
    setLoading(true);
    setLastMessage(null);
    try {
      const res = await fn();
      setLastMessage(res.message || `Success: ${actionName}`);
      if (onEventTriggered) onEventTriggered();
    } catch (e: any) {
      setLastMessage(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userType: 'SENIOR' | 'CAREGIVER' | 'ADMIN') => {
    setLoading(true);
    try {
      if (userType === 'SENIOR') await login('aai@elderease.com', 'aai123');
      else if (userType === 'CAREGIVER') await login('daughter@elderease.com', 'daughter123');
      else await login('admin@elderease.com', 'admin123');
      window.location.reload();
    } catch (e: any) {
      alert(`Login failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#1e293b',
        color: '#f8fafc',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        marginTop: '2.5rem',
        border: '3px solid #f59e0b',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ backgroundColor: '#f59e0b', color: '#000000', fontWeight: 900, padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem' }}>
            DEVELOPMENT MODE
          </span>
          <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800 }}>
            Evaluation & Demo Simulation Controls
          </h3>
        </div>
        <span style={{ fontSize: 'var(--font-sm)', color: '#94a3b8' }}>
          Use to test time-based triggers without waiting hours
        </span>
      </div>

      {lastMessage && (
        <div
          style={{
            backgroundColor: '#334155',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1rem',
            fontSize: 'var(--font-sm)',
            color: '#38bdf8',
            fontWeight: 700,
          }}
        >
          ℹ️ {lastMessage}
        </div>
      )}

      {/* Trigger Buttons Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button
          onClick={() => handleAction(api.triggerDemoMedicine, 'Trigger Demo Medicine')}
          disabled={loading}
          style={{
            padding: '0.8rem',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: 'var(--font-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center',
          }}
        >
          <Pill size={18} />
          <span>Trigger Demo Medicine Reminder</span>
        </button>

        <button
          onClick={() => handleAction(api.simulateMissedMedicine, 'Simulate Missed Medicine')}
          disabled={loading}
          style={{
            padding: '0.8rem',
            backgroundColor: '#d97706',
            color: '#ffffff',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: 'var(--font-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center',
          }}
        >
          <Bell size={18} />
          <span>Simulate Missed Medicine Alert</span>
        </button>

        <button
          onClick={() => handleAction(api.simulateMissedCheckin, 'Simulate Missed Check-in')}
          disabled={loading}
          style={{
            padding: '0.8rem',
            backgroundColor: '#b45309',
            color: '#ffffff',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: 'var(--font-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center',
          }}
        >
          <Heart size={18} />
          <span>Simulate Missed Check-in Alert</span>
        </button>

        <button
          onClick={() => handleAction(api.triggerDemoEmergency, 'Trigger Emergency')}
          disabled={loading}
          style={{
            padding: '0.8rem',
            backgroundColor: '#dc2626',
            color: '#ffffff',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: 'var(--font-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center',
          }}
        >
          <AlertTriangle size={18} />
          <span>Trigger Emergency Alert</span>
        </button>
      </div>

      {/* Quick Role Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: '1px solid #334155' }}>
        <span style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: '#94a3b8' }}>
          Quick Role Switch:
        </span>
        <button
          onClick={() => handleQuickLogin('SENIOR')}
          style={{
            padding: '0.4rem 0.8rem',
            backgroundColor: '#0f766e',
            color: '#ffffff',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            fontSize: 'var(--font-sm)',
          }}
        >
          👤 Senior (Demo Aai)
        </button>
        <button
          onClick={() => handleQuickLogin('CAREGIVER')}
          style={{
            padding: '0.4rem 0.8rem',
            backgroundColor: '#7c3aed',
            color: '#ffffff',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            fontSize: 'var(--font-sm)',
          }}
        >
          👨‍👩‍👧 Caregiver (Demo Daughter)
        </button>
        <button
          onClick={() => handleQuickLogin('ADMIN')}
          style={{
            padding: '0.4rem 0.8rem',
            backgroundColor: '#374151',
            color: '#ffffff',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            fontSize: 'var(--font-sm)',
          }}
        >
          🛠️ System Admin
        </button>
      </div>
    </div>
  );
};

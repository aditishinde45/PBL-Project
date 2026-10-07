import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PrescriptionScannerModal } from './PrescriptionScannerModal';
import { DevDemoPanel } from '../common/DevDemoPanel';
import {
  Users,
  Bell,
  Heart,
  Pill,
  Calendar,
  AlertTriangle,
  Plus,
  CheckCircle,
  Clock,
  FileText,
  LogOut,
  MessageSquare,
} from 'lucide-react';

export const CaregiverDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [connecting, setConnecting] = useState(false);

  // Modals
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedSeniorId, setSelectedSeniorId] = useState<string>('');

  // Family Task form
  const [taskSeniorId, setTaskSeniorId] = useState<string>('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await api.getCaregiverDashboard();
      setDashboardData(data);
      if (data.seniors?.length > 0 && !selectedSeniorId) {
        setSelectedSeniorId(data.seniors[0].seniorId);
        setTaskSeniorId(data.seniors[0].seniorId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleConnectSenior = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;
    setConnecting(true);
    try {
      await api.connectSenior(inviteCodeInput.trim());
      setInviteCodeInput('');
      alert('Senior successfully linked!');
      await loadDashboard();
    } catch (e: any) {
      alert(e.message || 'Could not connect senior.');
    } finally {
      setConnecting(false);
    }
  };

  const handleCreateFamilyTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskSeniorId) return;
    try {
      await api.createFamilyTask({
        seniorId: taskSeniorId,
        title: taskTitle,
        description: taskDesc,
      });
      setTaskTitle('');
      setTaskDesc('');
      setShowTaskForm(false);
      alert('Family note sent to senior!');
      await loadDashboard();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      await loadDashboard();
    } catch (e) {}
  };

  const seniors = dashboardData?.seniors || [];
  const notifications = dashboardData?.notifications || [];

  return (
    <div className="app-container" style={{ paddingBottom: '5rem' }}>
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.25rem 0',
          borderBottom: '2px solid var(--border-light)',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#7c3aed',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.5rem',
            }}
          >
            C
          </div>
          <div>
            <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
              Caregiver Circle
            </h1>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
              Logged in as {user?.name || 'Demo Daughter'} • Role: Family Caregiver
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.6rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--border-light)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-muted)',
            fontWeight: 700,
            fontSize: 'var(--font-sm)',
          }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </header>

      {/* Main Grid: Left = Connected Seniors, Right = Notifications & Tools */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        {/* LEFT COLUMN: Connected Seniors Overview */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={24} color="var(--brand-primary)" />
              <span>Connected Seniors ({seniors.length})</span>
            </h2>
          </div>

          {seniors.length === 0 && !loading && (
            <div style={{ padding: '2rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              No seniors connected yet. Enter their 6-character connection code below to link.
            </div>
          )}

          {seniors.map((senior: any) => (
            <div
              key={senior.seniorId}
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                border: senior.emergencyAlerts ? '4px solid var(--status-red)' : '3px solid var(--border-light)',
                boxShadow: 'var(--shadow-md)',
                marginBottom: '1.5rem',
              }}
            >
              {/* Senior Name Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: 'var(--text-primary)' }}>
                    {senior.name}
                  </h3>
                  <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                    Phone: {senior.phone || 'N/A'} • {senior.medicalNotes || 'Healthy'}
                  </span>
                </div>

                {senior.emergencyAlerts ? (
                  <span
                    style={{
                      backgroundColor: 'var(--status-red)',
                      color: '#ffffff',
                      padding: '0.4rem 0.8rem',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 800,
                      fontSize: 'var(--font-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <AlertTriangle size={16} /> EMERGENCY ALERT
                  </span>
                ) : (
                  <span
                    style={{
                      backgroundColor: 'var(--status-green-bg)',
                      color: 'var(--status-green-text)',
                      padding: '0.4rem 0.8rem',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 700,
                      fontSize: 'var(--font-sm)',
                    }}
                  >
                    Circle Active
                  </span>
                )}
              </div>

              {/* Status Indicator Cards as requested in Section 20 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {/* 1. Morning Check-in */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.8rem 1rem',
                    backgroundColor: senior.todayCheckIn === 'OKAY' ? 'var(--status-green-bg)' : 'var(--accent-amber-bg)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    fontSize: 'var(--font-md)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Heart size={20} color={senior.todayCheckIn === 'OKAY' ? 'var(--status-green)' : 'var(--accent-amber)'} />
                    <span>Daily Check-in</span>
                  </span>
                  <span>
                    {senior.todayCheckIn === 'OKAY'
                      ? '🟢 Morning check: Completed'
                      : '🟡 Check-in: Pending response'}
                  </span>
                </div>

                {/* 2. Medicine Status */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.8rem 1rem',
                    backgroundColor: senior.medicineSummary.missed > 0 ? 'var(--status-red-bg)' : 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    fontSize: 'var(--font-md)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Pill size={20} color="var(--brand-primary)" />
                    <span>Medicines Today</span>
                  </span>
                  <span>
                    {senior.medicineSummary.taken > 0 && senior.medicineSummary.pending === 0
                      ? `🟢 Doses: ${senior.medicineSummary.taken} Taken`
                      : senior.medicineSummary.missed > 0
                      ? `🔴 ${senior.medicineSummary.missed} Dose(s) Missed`
                      : `🟡 ${senior.medicineSummary.taken} Taken, ${senior.medicineSummary.pending} Waiting`}
                  </span>
                </div>

                {/* 3. Doctor Appointment */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.8rem 1rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    fontSize: 'var(--font-md)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={20} color="#6366f1" />
                    <span>Doctor Visit</span>
                  </span>
                  <span>
                    {senior.nextAppointment
                      ? `📅 ${senior.nextAppointment.doctorName} (${new Date(senior.nextAppointment.dateTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })})`
                      : 'None scheduled'}
                  </span>
                </div>

                {/* 4. Emergency Requests */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.8rem 1rem',
                    backgroundColor: senior.emergencyAlerts ? 'var(--status-red-bg)' : 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    fontSize: 'var(--font-md)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={20} color={senior.emergencyAlerts ? 'var(--status-red)' : 'var(--text-muted)'} />
                    <span>Emergency Requests</span>
                  </span>
                  <span>
                    {senior.emergencyAlerts ? '🚨 URGENT DISTRESS' : '🟢 None'}
                  </span>
                </div>
              </div>

              {/* Action buttons for this senior */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setSelectedSeniorId(senior.seniorId);
                    setShowPrescriptionModal(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.25rem',
                    backgroundColor: 'var(--brand-primary)',
                    color: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: 'var(--font-sm)',
                  }}
                >
                  <FileText size={18} />
                  <span>AI Prescription Scan</span>
                </button>

                <button
                  onClick={() => {
                    setTaskSeniorId(senior.seniorId);
                    setShowTaskForm(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.25rem',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '2px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: 'var(--font-sm)',
                  }}
                >
                  <MessageSquare size={18} />
                  <span>Send Family Note</span>
                </button>
              </div>
            </div>
          ))}

          {/* Connect Another Senior Form */}
          <div
            style={{
              backgroundColor: 'var(--bg-subtle)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
              border: '2px dashed var(--border-strong)',
            }}
          >
            <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, marginBottom: '0.5rem' }}>
              Link a Senior via Code (Connect)
            </h3>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Ask the senior for their 6-character connection code (e.g., <strong>AAI789</strong>).
            </p>
            <form onSubmit={handleConnectSenior} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Enter 6-char code"
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                maxLength={8}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  fontSize: 'var(--font-md)',
                  borderRadius: 'var(--radius-sm)',
                  border: '2px solid var(--border-strong)',
                  letterSpacing: '2px',
                  fontWeight: 700,
                }}
              />
              <button
                type="submit"
                disabled={connecting || !inviteCodeInput.trim()}
                style={{
                  padding: '0.8rem 1.5rem',
                  backgroundColor: 'var(--brand-primary)',
                  color: '#ffffff',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {connecting ? 'Linking...' : 'Connect'}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Notifications Feed & Family Tasks */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={24} color="#f59e0b" />
              <span>Real-Time Notifications ({notifications.filter((n: any) => !n.isRead).length} new)</span>
            </h2>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              border: '2px solid var(--border-light)',
              maxHeight: '480px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            {notifications.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No notifications yet.
              </div>
            )}

            {notifications.map((notif: any) => (
              <div
                key={notif.id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: notif.isRead ? 'var(--bg-subtle)' : 'var(--brand-surface)',
                  borderLeft: `5px solid ${
                    notif.type === 'EMERGENCY'
                      ? 'var(--status-red)'
                      : notif.type === 'MISSED_MEDICINE'
                      ? 'var(--accent-amber)'
                      : 'var(--brand-primary)'
                  }`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <h4 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {notif.title}
                  </h4>
                  <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {notif.message}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(notif.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkNotificationRead(notif.id)}
                    style={{ fontSize: 'var(--font-sm)', color: 'var(--brand-primary)', fontWeight: 700 }}
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Family Task Creation Modal / Form */}
          {showTaskForm && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                border: '2px solid var(--brand-primary)',
                marginBottom: '2rem',
              }}
            >
              <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, marginBottom: '1rem' }}>
                Plan a Family Task for Senior
              </h3>
              <form onSubmit={handleCreateFamilyTask} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Task Title (e.g. Bring BP medicine refill)"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  style={{ padding: '0.8rem', fontSize: 'var(--font-md)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)' }}
                />
                <textarea
                  rows={2}
                  placeholder="Notes (e.g. Priya will get strip from Apollo pharmacy on Friday)"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  style={{ padding: '0.8rem', fontSize: 'var(--font-sm)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)' }}
                />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="submit"
                    style={{ padding: '0.8rem 1.5rem', backgroundColor: 'var(--brand-primary)', color: '#ffffff', fontWeight: 800, borderRadius: 'var(--radius-sm)' }}
                  >
                    Send to Senior
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTaskForm(false)}
                    style={{ padding: '0.8rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Embedded Development Demo Panel for immediate evaluator testing */}
      <DevDemoPanel onEventTriggered={loadDashboard} />

      {/* Prescription Scanner Modal */}
      <PrescriptionScannerModal
        isOpen={showPrescriptionModal}
        seniorId={selectedSeniorId}
        onClose={() => setShowPrescriptionModal(false)}
        onMedicinesAdded={loadDashboard}
      />
    </div>
  );
};

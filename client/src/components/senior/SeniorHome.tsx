import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import { api } from '../../services/api';
import { CompanionModal } from './CompanionModal';
import { MedicineModal } from './MedicineModal';
import { CheckinModal } from './CheckinModal';
import { EmergencyModal } from './EmergencyModal';
import { CallFamilyModal } from './CallFamilyModal';
import { ScamCheckerModal } from './ScamCheckerModal';
import { SafePaymentModal } from './SafePaymentModal';
import { TasksLibraryModal } from './TasksLibraryModal';
import { TaskRunnerModal } from './TaskRunnerModal';
import { PreferencesModal } from './PreferencesModal';
import { ConsentModal } from './ConsentModal';
import {
  Mic,
  Pill,
  Calendar,
  Heart,
  AlertTriangle,
  PhoneCall,
  BookOpen,
  Shield,
  CreditCard,
  Sliders,
  Lock,
  LogOut,
  Sparkles,
} from 'lucide-react';

export const SeniorHome: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, language } = usePreferences();

  // Modals state
  const [showCompanion, setShowCompanion] = useState(false);
  const [showMedicines, setShowMedicines] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showCallFamily, setShowCallFamily] = useState(false);
  const [showScamChecker, setShowScamChecker] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showRunner, setShowRunner] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showConsent, setShowConsent] = useState(false);

  // Overview data
  const [overview, setOverview] = useState<any>(null);
  const [recoverableSession, setRecoverableSession] = useState<any>(null);

  const loadOverview = async () => {
    try {
      const data = await api.getSeniorOverview();
      setOverview(data);

      const active = await api.getActiveSession();
      setRecoverableSession(active);
    } catch (e) {
      console.warn('Could not load overview:', e);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const handleActionFromAi = (action: string) => {
    setShowCompanion(false);
    if (action === 'MEDICINES') setShowMedicines(true);
    else if (action === 'APPOINTMENTS') setShowMedicines(true); // or appointments
    else if (action === 'CALL_FAMILY') setShowCallFamily(true);
    else if (action === 'SCAM_CHECK') setShowScamChecker(true);
    else if (action === 'TASK_WHATSAPP_PHOTO') {
      setSelectedTaskId('photo-task-id');
      setShowRunner(true);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greetingMorning');
    if (hour < 17) return t('greetingAfternoon');
    return t('greetingEvening');
  };

  return (
    <div className="app-container" style={{ paddingBottom: '4rem' }}>
      {/* Top Accessible Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1rem 0',
          borderBottom: '3px solid var(--border-light)',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '1.75rem',
              fontWeight: 900,
            }}
          >
            E
          </div>
          <div>
            <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
              {t('appTitle')}
            </h1>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
              {user?.name || 'Aai'} • Code: <strong>{user?.inviteCode || 'AAI789'}</strong>
            </p>
          </div>
        </div>

        {/* Accessibility & Settings Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowPreferences(true)}
            aria-label="Settings"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border-strong)',
              backgroundColor: 'var(--bg-surface)',
              fontWeight: 700,
              fontSize: 'var(--font-md)',
            }}
          >
            <Sliders size={22} />
            <span>{t('preferences')}</span>
          </button>

          <button
            onClick={() => setShowConsent(true)}
            aria-label="Privacy"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border-strong)',
              backgroundColor: 'var(--bg-surface)',
              fontWeight: 700,
              fontSize: 'var(--font-md)',
            }}
          >
            <Lock size={20} />
            <span>गोपनीयता</span>
          </button>

          <button
            onClick={logout}
            aria-label="Log out"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border-light)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-muted)',
              fontWeight: 700,
              fontSize: 'var(--font-sm)',
            }}
          >
            <LogOut size={18} />
            <span>बाहेर पडा</span>
          </button>
        </div>
      </header>

      {/* Interrupted Session Recovery Banner (Section 27) */}
      {recoverableSession && (
        <div
          style={{
            backgroundColor: 'var(--brand-surface)',
            border: '3px solid var(--brand-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--brand-text)' }}>
              तुम्ही आधी शिकत होता: {recoverableSession.task?.title}
            </h3>
            <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)' }}>
              तुम्हाला थांबलेल्या जागेवरूनच पुढे सुरू करायचे आहे का? (Continue where you stopped?)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => {
                setSelectedTaskId(recoverableSession.taskId);
                setShowRunner(true);
              }}
              style={{
                padding: '0.8rem 1.5rem',
                backgroundColor: 'var(--brand-primary)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: 'var(--font-md)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              होय, पुढे चला (Continue)
            </button>
            <button
              onClick={() => setRecoverableSession(null)}
              style={{
                padding: '0.8rem 1.2rem',
                backgroundColor: 'var(--bg-surface)',
                border: '2px solid var(--border-strong)',
                fontWeight: 700,
                fontSize: 'var(--font-md)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              नाही (Start Again)
            </button>
          </div>
        </div>
      )}

      {/* Warm Friendly Greeting Card */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          {getGreeting()}
        </h2>
        <p style={{ fontSize: 'var(--font-lg)', color: 'var(--text-secondary)' }}>
          {t('howCanIHelp')}
        </p>

        {/* Quick Health Summary Pill */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          <div
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: overview?.checkInStatus === 'OKAY' ? 'var(--status-green-bg)' : 'var(--accent-amber-bg)',
              color: overview?.checkInStatus === 'OKAY' ? 'var(--status-green-text)' : 'var(--accent-amber)',
              fontWeight: 800,
              fontSize: 'var(--font-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Heart size={20} />
            <span>{overview?.checkInStatus === 'OKAY' ? t('checkInDone') : t('checkInPending')}</span>
          </div>

          {overview?.nextAppointment && (
            <div
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--status-blue-bg)',
                color: 'var(--status-blue-text)',
                fontWeight: 700,
                fontSize: 'var(--font-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Calendar size={20} />
              <span>
                डॉक्टरांची भेट: {overview.nextAppointment.doctorName} (
                {new Date(overview.nextAppointment.dateTime).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })}
                )
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Main Senior Grid of Large Action Cards */}
      <div className="senior-card-grid">
        {/* 1. TALK TO ELDER EASE (Primary Highlight) */}
        <button
          onClick={() => setShowCompanion(true)}
          className="senior-action-button btn-ai-talk"
          aria-label={t('talkToAi')}
          style={{ gridColumn: 'span 1' }}
        >
          <Mic size={52} />
          <span>{t('talkToAi')}</span>
          <span style={{ fontSize: 'var(--font-sm)', opacity: 0.9, fontWeight: 500 }}>
            माइक चालू करा आणि बोला
          </span>
        </button>

        {/* 2. MY MEDICINES */}
        <button
          onClick={() => setShowMedicines(true)}
          className="senior-action-button btn-medicines"
          aria-label={t('myMedicines')}
        >
          <Pill size={48} />
          <span>{t('myMedicines')}</span>
          <span style={{ fontSize: 'var(--font-sm)', opacity: 0.9, fontWeight: 500 }}>
            वेळ आणि गोळ्या तपासा
          </span>
        </button>

        {/* 3. MY APPOINTMENTS */}
        <button
          onClick={() => setShowMedicines(true)} // Opens health/appointments
          className="senior-action-button btn-appointments"
          aria-label={t('myAppointments')}
        >
          <Calendar size={48} />
          <span>{t('myAppointments')}</span>
          <span style={{ fontSize: 'var(--font-sm)', opacity: 0.9, fontWeight: 500 }}>
            दवाखान्याची वेळ
          </span>
        </button>

        {/* 4. I AM OKAY */}
        <button
          onClick={() => setShowCheckin(true)}
          className="senior-action-button btn-checkin-okay"
          aria-label={t('iAmOkay')}
        >
          <Heart size={48} />
          <span>{t('iAmOkay')}</span>
          <span style={{ fontSize: 'var(--font-sm)', opacity: 0.9, fontWeight: 500 }}>
            सकाळची हाजिरी नोंदवा
          </span>
        </button>

        {/* 5. I NEED HELP (Emergency) */}
        <button
          onClick={() => setShowEmergency(true)}
          className="senior-action-button btn-emergency"
          aria-label={t('iNeedHelp')}
        >
          <AlertTriangle size={52} />
          <span>{t('iNeedHelp')}</span>
          <span style={{ fontSize: 'var(--font-sm)', opacity: 0.9, fontWeight: 500 }}>
            तात्काळ आणीबाणी मदत
          </span>
        </button>

        {/* 6. CALL FAMILY */}
        <button
          onClick={() => setShowCallFamily(true)}
          className="senior-action-button btn-family"
          aria-label={t('callFamily')}
        >
          <PhoneCall size={48} />
          <span>{t('callFamily')}</span>
          <span style={{ fontSize: 'var(--font-sm)', opacity: 0.9, fontWeight: 500 }}>
            मुलीला/मुलाला फोन लावा
          </span>
        </button>

        {/* 7. DIGITAL TASKS */}
        <button
          onClick={() => setShowLibrary(true)}
          className="senior-action-button btn-tasks"
          aria-label={t('digitalTasks')}
        >
          <BookOpen size={48} />
          <span>{t('digitalTasks')}</span>
          <span style={{ fontSize: 'var(--font-sm)', opacity: 0.9, fontWeight: 500 }}>
            व्हॉट्सॲप, व्हिडिओ कॉल शिका
          </span>
        </button>

        {/* 8. IS THIS MESSAGE SAFE? */}
        <button
          onClick={() => setShowScamChecker(true)}
          className="senior-action-button btn-scam"
          aria-label={t('scamCheck')}
        >
          <Shield size={48} />
          <span>{t('scamCheck')}</span>
          <span style={{ fontSize: 'var(--font-sm)', opacity: 0.9, fontWeight: 500 }}>
            संशयास्पद मेसेज तपासा
          </span>
        </button>

        {/* 9. SAFE PAYMENT PRACTICE */}
        <button
          onClick={() => setShowPayment(true)}
          className="senior-action-button"
          style={{
            background: 'linear-gradient(135deg, #059669, #047857)',
            color: '#ffffff',
            borderColor: '#34d399',
          }}
          aria-label={t('safePayment')}
        >
          <CreditCard size={48} />
          <span>{t('safePayment')}</span>
          <span style={{ fontSize: 'var(--font-sm)', opacity: 0.9, fontWeight: 500 }}>
            सुरक्षित UPI सराव
          </span>
        </button>
      </div>

      {/* Modals Mounting */}
      <CompanionModal
        isOpen={showCompanion}
        onClose={() => setShowCompanion(false)}
        onTriggerAction={handleActionFromAi}
      />
      <MedicineModal
        isOpen={showMedicines}
        onClose={() => setShowMedicines(false)}
        onRefreshOverview={loadOverview}
      />
      <CheckinModal
        isOpen={showCheckin}
        onClose={() => setShowCheckin(false)}
        onComplete={loadOverview}
      />
      <EmergencyModal
        isOpen={showEmergency}
        onClose={() => setShowEmergency(false)}
      />
      <CallFamilyModal
        isOpen={showCallFamily}
        onClose={() => setShowCallFamily(false)}
      />
      <ScamCheckerModal
        isOpen={showScamChecker}
        onClose={() => setShowScamChecker(false)}
        onAskFamily={() => setShowCallFamily(true)}
      />
      <SafePaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
      />
      <TasksLibraryModal
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        onSelectTask={(tid) => {
          setSelectedTaskId(tid);
          setShowLibrary(false);
          setShowRunner(true);
        }}
      />
      <TaskRunnerModal
        isOpen={showRunner}
        taskId={selectedTaskId}
        onClose={() => setShowRunner(false)}
        onTaskCompleted={() => {
          loadOverview();
        }}
      />
      <PreferencesModal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
      <ConsentModal
        isOpen={showConsent}
        onClose={() => setShowConsent(false)}
      />
    </div>
  );
};

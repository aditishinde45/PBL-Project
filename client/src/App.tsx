import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { usePreferences } from './context/PreferencesContext';
import { LoginView } from './components/LoginView';
import { HomeView } from './components/HomeView';
import { ChatView } from './components/ChatView';
import { TasksLibraryView } from './components/TasksLibraryView';
import { TaskRunnerView } from './components/TaskRunnerView';
import { FamilyHelpView } from './components/FamilyHelpView';
import { SettingsView } from './components/SettingsView';
import { CaregiverDashboard } from './components/caregiver/CaregiverDashboard';

type Screen = 'HOME' | 'CHAT' | 'TASKS_LIBRARY' | 'TASK_RUNNER' | 'FAMILY_HELP' | 'SETTINGS';

export const App: React.FC = () => {
  const { user, loading } = useAuth();
  const { t } = usePreferences();

  const [currentScreen, setCurrentScreen] = useState<Screen>('HOME');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontSize: 'var(--font-xl)',
          fontWeight: 800,
          color: 'var(--brand-primary)',
          backgroundColor: 'var(--bg-primary)',
        }}
      >
        ElderEase...
      </div>
    );
  }

  // Not logged in -> Show elderly-first LoginView
  if (!user) {
    return <LoginView onSuccess={() => setCurrentScreen('HOME')} />;
  }

  // Caregiver user role -> Caregiver view
  if (user.role === 'CAREGIVER') {
    return <CaregiverDashboard />;
  }

  // Senior User Flows (Primary MVP Focus)
  switch (currentScreen) {
    case 'CHAT':
      return (
        <ChatView
          onBack={() => setCurrentScreen('HOME')}
          onStartTask={(taskId) => {
            setSelectedTaskId(taskId);
            setCurrentScreen('TASK_RUNNER');
          }}
        />
      );

    case 'TASKS_LIBRARY':
      return (
        <TasksLibraryView
          onBack={() => setCurrentScreen('HOME')}
          onSelectTask={(taskId) => {
            setSelectedTaskId(taskId);
            setCurrentScreen('TASK_RUNNER');
          }}
        />
      );

    case 'TASK_RUNNER':
      return (
        <TaskRunnerView
          taskId={selectedTaskId || 'whatsapp-photo'}
          onBack={() => setCurrentScreen('TASKS_LIBRARY')}
          onGoHome={() => setCurrentScreen('HOME')}
          onTalkToAi={() => setCurrentScreen('CHAT')}
          onAskFamily={() => setCurrentScreen('FAMILY_HELP')}
        />
      );

    case 'FAMILY_HELP':
      return <FamilyHelpView onBack={() => setCurrentScreen('HOME')} />;

    case 'SETTINGS':
      return <SettingsView onBack={() => setCurrentScreen('HOME')} />;

    case 'HOME':
    default:
      return (
        <HomeView
          onNavigate={(view) => {
            setCurrentScreen(view);
          }}
        />
      );
  }
};

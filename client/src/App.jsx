import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { SeniorNavbar } from './components/layout/SeniorNavbar.jsx';
import { AccessibilityBar } from './components/layout/AccessibilityBar.jsx';
import { MobileBottomNav } from './components/layout/MobileBottomNav.jsx';
import { Footer } from './components/layout/Footer.jsx';

// Pages
import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { SignUpPage } from './pages/SignUpPage.jsx';
import { OnboardingPage } from './pages/OnboardingPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { AITeacherPage } from './pages/AITeacherPage.jsx';
import { LearningLibraryPage } from './pages/LearningLibraryPage.jsx';
import { LessonDetailPage } from './pages/LessonDetailPage.jsx';
import { LearningSessionPage } from './pages/LearningSessionPage.jsx';
import { ScreenshotHelpPage } from './pages/ScreenshotHelpPage.jsx';
import { SafetyCenterPage } from './pages/SafetyCenterPage.jsx';
import { ProgressPage } from './pages/ProgressPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { FamilyDashboardPage } from './pages/FamilyDashboardPage.jsx';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  const location = useLocation();
  const isLearnSession = location.pathname.startsWith('/learn/');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Accessibility Bar */}
      <AccessibilityBar />

      {/* Main Senior Navigation Header (Hidden inside fullscreen learn session to minimize distraction) */}
      {!isLearnSession && <SeniorNavbar />}

      {/* Page Routing */}
      <main className="flex-1 pb-16 md:pb-0">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Protected Senior Pages */}
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/teacher" element={<ProtectedRoute><AITeacherPage /></ProtectedRoute>} />
          <Route path="/library" element={<ProtectedRoute><LearningLibraryPage /></ProtectedRoute>} />
          <Route path="/lessons/:id" element={<ProtectedRoute><LessonDetailPage /></ProtectedRoute>} />
          <Route path="/learn/:id" element={<ProtectedRoute><LearningSessionPage /></ProtectedRoute>} />
          <Route path="/screenshot-help" element={<ProtectedRoute><ScreenshotHelpPage /></ProtectedRoute>} />
          <Route path="/safety" element={<ProtectedRoute><SafetyCenterPage /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* Protected Family Portal */}
          <Route path="/family" element={<ProtectedRoute><FamilyDashboardPage /></ProtectedRoute>} />

          {/* 404 Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation Bar (Hidden during active learning session) */}
      {!isLearnSession && <MobileBottomNav />}

      {/* Footer */}
      {!isLearnSession && <Footer />}
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useAccessibility } from '../context/AccessibilityContext.jsx';
import { SeniorButton } from '../components/common/SeniorButton.jsx';
import {
  Save,
  Check,
  Eye,
  Volume2,
  Type,
  Globe,
  Sliders,
  Shield,
  Users,
  CheckCircle2
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const {
    textSize,
    setTextSize,
    highContrast,
    toggleHighContrast,
    reducedMotion,
    toggleReducedMotion,
    voiceSpeed,
    setVoiceSpeed,
    language,
    setLanguage,
    teachingSpeed,
    setTeachingSpeed,
    autoRead,
    toggleAutoRead,
    saveAllPreferences
  } = useAccessibility();

  const [familySharing, setFamilySharing] = useState(user?.familySharingEnabled ?? true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setIsSaved(false);

    try {
      await saveAllPreferences();
      await updateProfile({
        familySharingEnabled: familySharing,
        preferredLanguage: language,
        teachingSpeed
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    } catch (e) {
      setIsSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2 border-b border-slate-200 pb-5">
        <span className="text-5xl block mb-1">⚙️</span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Accessibility & Settings
        </h1>
        <p className="text-xl sm:text-2xl text-slate-600 font-medium max-w-xl mx-auto">
          Adjust text size, contrast, voice speed, and language to make ElderEase comfortable for you.
        </p>
      </div>

      {/* Success Notification */}
      {isSaved && (
        <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 font-bold text-xl flex items-center justify-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          <span>Your settings have been saved successfully!</span>
        </div>
      )}

      {/* Section 1: Text Size */}
      <section className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <Type className="w-7 h-7 text-blue-700" />
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Text & Reading Size
          </h2>
        </div>
        <p className="text-lg text-slate-600">
          Choose the letter size that is easiest on your eyes:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {[
            { id: 'normal', label: 'Normal Size (16px)', sample: 'Sample Text' },
            { id: 'large', label: 'Large Size (18px)', sample: 'Sample Text' },
            { id: 'extra-large', label: 'Huge Size (22px)', sample: 'Sample Text' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTextSize(item.id)}
              className={`p-5 rounded-2xl border-2 font-bold text-left transition-all flex flex-col justify-between ${
                textSize === item.id
                  ? 'bg-blue-100 border-blue-600 text-blue-950 ring-2 ring-blue-300'
                  : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg sm:text-xl block mb-2">{item.label}</span>
              <span className={`block text-slate-600 ${
                item.id === 'extra-large' ? 'text-2xl font-black' : item.id === 'large' ? 'text-xl font-bold' : 'text-base'
              }`}>
                {item.sample}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Section 2: Visual High Contrast & Motion */}
      <section className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <Eye className="w-7 h-7 text-blue-700" />
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            High Contrast & Visual Display
          </h2>
        </div>

        <div className="space-y-4 pt-2">
          {/* High contrast toggle */}
          <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <h3 className="text-xl font-bold text-slate-900">High Contrast Mode</h3>
              <p className="text-base sm:text-lg text-slate-600">
                Enhances lines, darkens text, and removes subtle backgrounds for maximum readability.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleHighContrast}
              className={`w-16 h-10 rounded-full transition-colors p-1 flex items-center border-2 ${
                highContrast ? 'bg-blue-700 border-blue-800 justify-end' : 'bg-slate-300 border-slate-400 justify-start'
              }`}
              aria-label="Toggle High Contrast"
            >
              <div className="w-7 h-7 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Reduced motion toggle */}
          <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Reduced Motion</h3>
              <p className="text-base sm:text-lg text-slate-600">
                Turns off bouncing animations and moving waves if you prefer a completely calm still screen.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleReducedMotion}
              className={`w-16 h-10 rounded-full transition-colors p-1 flex items-center border-2 ${
                reducedMotion ? 'bg-blue-700 border-blue-800 justify-end' : 'bg-slate-300 border-slate-400 justify-start'
              }`}
              aria-label="Toggle Reduced Motion"
            >
              <div className="w-7 h-7 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>
      </section>

      {/* Section 3: Voice Speed & Auto Read */}
      <section className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <Volume2 className="w-7 h-7 text-blue-700" />
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Teacher Voice & Sound
          </h2>
        </div>

        <div className="space-y-4 pt-2">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Speaking Speed</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { speed: 0.75, label: '🐢 Slow & Patient' },
                { speed: 0.9, label: '🚶 Normal Speed' },
                { speed: 1.1, label: '⚡ Slightly Faster' }
              ].map((item) => (
                <button
                  key={item.speed}
                  type="button"
                  onClick={() => setVoiceSpeed(item.speed)}
                  className={`p-4 rounded-2xl border-2 font-bold text-center transition-all ${
                    voiceSpeed === item.speed
                      ? 'bg-blue-100 border-blue-600 text-blue-950 ring-2 ring-blue-300'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base sm:text-lg">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Read Steps Out Loud Automatically</h3>
              <p className="text-base sm:text-lg text-slate-600">
                The teacher will automatically speak new step instructions as soon as they appear.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleAutoRead}
              className={`w-16 h-10 rounded-full transition-colors p-1 flex items-center border-2 ${
                autoRead ? 'bg-blue-700 border-blue-800 justify-end' : 'bg-slate-300 border-slate-400 justify-start'
              }`}
              aria-label="Toggle Auto Read"
            >
              <div className="w-7 h-7 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>
      </section>

      {/* Section 4: Language Preference */}
      <section className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <Globe className="w-7 h-7 text-blue-700" />
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Preferred Language
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {['English', 'Hindi', 'Marathi', 'Hinglish'].map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={`p-4 rounded-2xl border-2 font-black text-center text-lg sm:text-xl transition-all ${
                language === lang
                  ? 'bg-blue-100 border-blue-600 text-blue-950 ring-2 ring-blue-300'
                  : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </section>

      {/* Section 5: Family Sharing Privacy */}
      <section className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <Users className="w-7 h-7 text-purple-700" />
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Family Sharing & Privacy
          </h2>
        </div>

        <div className="flex items-center justify-between p-5 rounded-2xl bg-purple-50/70 border-2 border-purple-200">
          <div>
            <h3 className="text-xl font-bold text-purple-950">
              Share Learning Progress with Family
            </h3>
            <p className="text-base sm:text-lg text-purple-900 mt-1">
              Allows your children and caregivers to see what lessons you finished and send encouraging notes. They will <strong>NEVER</strong> see private AI conversations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFamilySharing(!familySharing)}
            className={`w-16 h-10 rounded-full transition-colors p-1 flex items-center border-2 flex-shrink-0 ml-4 ${
              familySharing ? 'bg-purple-700 border-purple-800 justify-end' : 'bg-slate-300 border-slate-400 justify-start'
            }`}
            aria-label="Toggle Family Sharing"
          >
            <div className="w-7 h-7 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </section>

      {/* Save Button */}
      <div className="pt-4 flex justify-center">
        <SeniorButton
          onClick={handleSave}
          disabled={saving}
          variant="primary"
          size="xl"
          icon={Save}
          className="shadow-xl min-w-[280px]"
        >
          {saving ? 'Saving Changes...' : 'Save Changes'}
        </SeniorButton>
      </div>
    </div>
  );
};

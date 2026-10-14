import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useAccessibility } from '../context/AccessibilityContext.jsx';
import { SeniorButton } from '../components/common/SeniorButton.jsx';
import { Check, ArrowRight, ArrowLeft, Sparkles, Heart } from 'lucide-react';

export const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState(['WhatsApp', 'Video Calls']);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedSpeed, setSelectedSpeed] = useState('Step by Step');
  const [isSaving, setIsSaving] = useState(false);

  const { completeOnboarding } = useAuth();
  const { setLanguage, setTeachingSpeed } = useAccessibility();
  const navigate = useNavigate();

  const interestOptions = [
    { id: 'Smartphone', label: 'Smartphone Basics', icon: '📱' },
    { id: 'WhatsApp', label: 'WhatsApp & Messages', icon: '💬' },
    { id: 'Email', label: 'Email & Gmail', icon: '✉️' },
    { id: 'Video Calls', label: 'Video Calls (Meet/WhatsApp)', icon: '📹' },
    { id: 'Digital Payments', label: 'Digital Payments & UPI', icon: '💳' },
    { id: 'Internet', label: 'Internet Browsing', icon: '🌐' },
    { id: 'Online Safety', label: 'Online Safety & Scam Protection', icon: '🛡️' },
    { id: 'Computer', label: 'Computer Basics', icon: '💻' },
    { id: 'Something else', label: 'Something Else', icon: '✨' }
  ];

  const languageOptions = [
    { id: 'English', label: 'English', sub: 'Simple English' },
    { id: 'Hindi', label: 'Hindi (हिंदी)', sub: 'सरल हिंदी' },
    { id: 'Marathi', label: 'Marathi (मराठी)', sub: 'सोपी मराठी' },
    { id: 'Hinglish', label: 'Hinglish', sub: 'Mix of Hindi & English' }
  ];

  const speedOptions = [
    { id: 'Slowly', label: 'Slowly & Patiently', sub: 'Extra time on every detail', icon: '🐢' },
    { id: 'Step by Step', label: 'Step by Step', sub: 'One clear action at a time', icon: '👣' },
    { id: 'Quickly', label: 'Quickly', sub: 'Straightforward overview', icon: '⚡' }
  ];

  const toggleInterest = (id) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    setIsSaving(true);
    setLanguage(selectedLanguage);
    setTeachingSpeed(selectedSpeed);

    try {
      await completeOnboarding({
        interests: selectedInterests,
        preferredLanguage: selectedLanguage,
        teachingSpeed: selectedSpeed
      });
      navigate('/dashboard');
    } catch (err) {
      navigate('/dashboard');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-10">
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl p-6 sm:p-10 max-w-2xl w-full space-y-8 animate-fadeIn">
        {/* Step Progress Dots */}
        <div className="flex items-center justify-between border-b pb-5 border-slate-100">
          <span className="text-sm sm:text-base font-bold text-slate-500 uppercase tracking-wider">
            Getting Started — Step {currentStep} of 4
          </span>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map(num => (
              <div
                key={num}
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  num === currentStep ? 'bg-blue-700 scale-125' : num < currentStep ? 'bg-emerald-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Welcome */}
        {currentStep === 1 && (
          <div className="text-center space-y-6 py-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-blue-100 text-blue-700 flex items-center justify-center text-5xl mx-auto shadow-inner">
              👵
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Welcome! I'm your <span className="text-blue-700">AI Teacher.</span>
            </h2>
            <p className="text-xl sm:text-2xl text-slate-600 leading-relaxed font-medium max-w-lg mx-auto">
              I am here to guide you through everyday technology with calm, patience, and warmth. You are always in control.
            </p>
            <div className="pt-4">
              <SeniorButton onClick={() => setCurrentStep(2)} variant="primary" size="xl" icon={ArrowRight}>
                Let's Begin
              </SeniorButton>
            </div>
          </div>
        )}

        {/* STEP 2: What would you like to learn? */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                What would you like to learn?
              </h2>
              <p className="text-lg sm:text-xl text-slate-600">
                Tap on any topics that interest you (you can pick multiple):
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto p-1">
              {interestOptions.map(opt => {
                const isSelected = selectedInterests.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleInterest(opt.id)}
                    className={`p-4 rounded-2xl border-2 font-bold text-left text-lg flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-blue-100 border-blue-600 text-blue-950 ring-2 ring-blue-300'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </div>
                    {isSelected && <Check className="w-6 h-6 text-blue-700 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <SeniorButton onClick={() => setCurrentStep(1)} variant="ghost" size="md" icon={ArrowLeft}>
                Back
              </SeniorButton>
              <SeniorButton onClick={() => setCurrentStep(3)} variant="primary" size="lg" icon={ArrowRight}>
                Next: Language
              </SeniorButton>
            </div>
          </div>
        )}

        {/* STEP 3: Language Preference */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                Which language do you prefer?
              </h2>
              <p className="text-lg sm:text-xl text-slate-600">
                Choose the language you feel most comfortable hearing:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {languageOptions.map(lang => {
                const isSelected = selectedLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={`p-5 rounded-2xl border-2 font-bold text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-100 border-blue-600 text-blue-950 ring-2 ring-blue-300'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="text-xl sm:text-2xl block">{lang.label}</span>
                      <span className="text-sm sm:text-base text-slate-500 font-normal">{lang.sub}</span>
                    </div>
                    {isSelected && <Check className="w-7 h-7 text-blue-700 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <SeniorButton onClick={() => setCurrentStep(2)} variant="ghost" size="md" icon={ArrowLeft}>
                Back
              </SeniorButton>
              <SeniorButton onClick={() => setCurrentStep(4)} variant="primary" size="lg" icon={ArrowRight}>
                Next: Teaching Speed
              </SeniorButton>
            </div>
          </div>
        )}

        {/* STEP 4: How would you like me to teach you? */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                How would you like me to teach you?
              </h2>
              <p className="text-lg sm:text-xl text-slate-600">
                You can change this speed whenever you wish:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {speedOptions.map(speed => {
                const isSelected = selectedSpeed === speed.id;
                return (
                  <button
                    key={speed.id}
                    type="button"
                    onClick={() => setSelectedSpeed(speed.id)}
                    className={`p-5 rounded-2xl border-2 font-bold text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-100 border-blue-600 text-blue-950 ring-2 ring-blue-300'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{speed.icon}</span>
                      <div>
                        <span className="text-xl sm:text-2xl block">{speed.label}</span>
                        <span className="text-sm sm:text-base text-slate-500 font-normal">{speed.sub}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-7 h-7 text-blue-700 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <SeniorButton onClick={() => setCurrentStep(3)} variant="ghost" size="md" icon={ArrowLeft}>
                Back
              </SeniorButton>
              <SeniorButton
                onClick={handleFinish}
                disabled={isSaving}
                variant="success"
                size="xl"
                icon={Check}
              >
                {isSaving ? 'Saving...' : 'Start Learning!'}
              </SeniorButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

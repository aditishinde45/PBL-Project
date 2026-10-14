import React from 'react';
import { SeniorButton } from '../common/SeniorButton.jsx';
import { useSpeech } from '../../context/SpeechContext.jsx';
import { Volume2, CheckCircle2, AlertCircle, Sparkles, Smartphone } from 'lucide-react';

export const ScreenshotViewer = ({ analysis, onReset }) => {
  const { speak } = useSpeech();

  if (!analysis) return null;

  const {
    detectedScreen = 'Phone Screen',
    identifiedElements = [],
    targetAction = '',
    targetHighlight = null,
    calmGuidance = '',
    isDemoMode = false,
    demoNotice = ''
  } = analysis;

  const handleListen = () => {
    speak(calmGuidance || targetAction);
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-10 shadow-md max-w-3xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <span className="px-3.5 py-1 rounded-full bg-blue-100 text-blue-900 font-extrabold text-sm sm:text-base inline-flex items-center gap-1.5 mb-2">
            <Sparkles className="w-4 h-4 text-blue-700" />
            Screen Analysis Complete
          </span>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900">
            {detectedScreen}
          </h3>
        </div>
        {isDemoMode && (
          <span className="text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
            Built-in AI Vision Engine
          </span>
        )}
      </div>

      {/* Big Action Callout */}
      <div className="bg-blue-50 border-3 border-blue-400 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-blue-800 bg-white px-3 py-1 rounded-full inline-block">
          What You Should Do Now:
        </span>
        <p className="text-2xl sm:text-3xl font-extrabold text-blue-950 leading-snug">
          {targetAction}
        </p>
        <p className="text-lg sm:text-xl text-slate-700 leading-relaxed pt-2 border-t border-blue-200">
          {calmGuidance}
        </p>
        <div className="pt-2">
          <SeniorButton
            onClick={handleListen}
            variant="primary"
            size="lg"
            icon={Volume2}
            className="shadow-sm"
          >
            🔊 Listen to Teacher’s Voice
          </SeniorButton>
        </div>
      </div>

      {/* Visual Bounding Box Pointer Mockup */}
      {targetHighlight && (
        <div className="bg-slate-900 rounded-3xl p-6 text-white text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-slate-300 font-semibold text-lg">
            <Smartphone className="w-6 h-6" />
            <span>Target Location On Your Phone:</span>
          </div>

          <div className="relative max-w-sm mx-auto h-64 bg-slate-800 rounded-2xl border-2 border-slate-700 p-4 flex flex-col justify-between overflow-hidden shadow-inner">
            <div className="text-slate-400 text-sm font-bold text-center">
              Top of Phone Screen
            </div>

            {/* Target Highlight Box */}
            <div
              style={{
                top: `${targetHighlight.top || 60}%`,
                left: `${targetHighlight.left || 40}%`,
                width: `${targetHighlight.width || 40}%`,
                height: `${targetHighlight.height || 20}%`
              }}
              className="absolute border-4 border-emerald-400 bg-emerald-500/30 rounded-xl flex flex-col items-center justify-center p-2 animate-pulse shadow-lg transform -translate-x-1/2 -translate-y-1/2"
            >
              <span className="bg-emerald-600 text-white font-black text-xs px-2 py-0.5 rounded-full mb-0.5">
                👉 TAP HERE
              </span>
              <span className="text-sm sm:text-base font-extrabold text-white text-center leading-tight">
                {targetHighlight.label}
              </span>
            </div>

            <div className="text-slate-400 text-sm font-bold text-center">
              Bottom of Phone Screen
            </div>
          </div>
        </div>
      )}

      {/* Identified Screen Elements */}
      {identifiedElements.length > 0 && (
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 space-y-3">
          <h4 className="text-xl font-bold text-slate-900">
            What I Saw on Your Screen:
          </h4>
          <ul className="space-y-2">
            {identifiedElements.map((elem, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-base sm:text-lg text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{elem}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom Buttons */}
      <div className="pt-4 flex flex-wrap gap-4 justify-center">
        <SeniorButton onClick={onReset} variant="outline" size="lg">
          Check Another Screen
        </SeniorButton>
      </div>
    </div>
  );
};

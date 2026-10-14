import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext.jsx';
import { Sparkles, Info, Smartphone } from 'lucide-react';

export const TutorInstruction = ({ step, isSlowMode = false }) => {
  const { language } = useAccessibility();

  if (!step) return null;

  // Language translation lookup if present
  const translation = step.translations?.[language];
  const displayInstruction = translation?.instruction || step.instruction;
  const displayExplanation = isSlowMode
    ? (translation?.slowExplanation || step.slowExplanation || translation?.explanation || step.explanation)
    : (translation?.explanation || step.explanation);

  const { t } = useAccessibility();

  return (
    <div className="space-y-6">
      {/* Primary Instruction Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden">
        {/* Step Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-900 font-extrabold text-sm sm:text-base">
            {t('actionForStep')} {step.stepNumber}
          </span>
          {isSlowMode && (
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-sm flex items-center gap-1">
              🐢 Explaining Slowly
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          {step.title}
        </h3>

        {/* Big Instruction Text */}
        <div className="bg-blue-50/80 border-2 border-blue-200 rounded-2xl p-6 mb-6">
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-950 leading-snug">
            {displayInstruction}
          </p>
        </div>

        {/* Calm Explanation */}
        <div className="flex items-start gap-3 text-slate-700 bg-slate-50 rounded-2xl p-5 border border-slate-200">
          <Info className="w-7 h-7 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-lg sm:text-xl leading-relaxed">
            {displayExplanation}
          </p>
        </div>
      </div>

      {/* Visual Screen Mockup / Phone Simulator */}
      {step.visual && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-slate-700" />
              <span>What Your Phone Looks Like:</span>
            </h4>
            <span className="text-sm sm:text-base font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {step.visual.screenName || 'Phone Screen'}
            </span>
          </div>

          {/* Simulated Mobile Device Preview */}
          <div className="max-w-md mx-auto bg-slate-900 rounded-[2.5rem] p-3 shadow-xl border-4 border-slate-800 relative">
            {/* Phone Speaker Notch */}
            <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2" />

            {/* Simulated Screen Body */}
            <div className="bg-slate-100 rounded-[2rem] p-4 min-h-[280px] sm:min-h-[320px] flex flex-col justify-between relative overflow-hidden border border-slate-300">
              {/* Header */}
              <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-200 font-bold text-slate-800 text-center text-base">
                {step.visual.screenPreview?.header || 'App Header'}
              </div>

              {/* Content with Target Highlight Box */}
              <div className="my-auto py-6 text-center text-slate-700 font-medium relative">
                <p className="text-base sm:text-lg mb-4 whitespace-pre-line leading-relaxed">
                  {step.visual.screenPreview?.content || 'Main screen elements'}
                </p>

                {/* Highlighted Bounding Box Area */}
                {step.visual.targetHighlight && (
                  <div
                    className="border-4 border-emerald-500 bg-emerald-500/20 rounded-2xl p-3 animate-pulse flex flex-col items-center justify-center shadow-lg my-2 mx-auto max-w-[280px]"
                  >
                    <span className="bg-emerald-700 text-white text-xs sm:text-sm font-black px-2.5 py-0.5 rounded-full mb-1">
                      👉 TAP HERE
                    </span>
                    <span className="font-extrabold text-slate-900 text-base sm:text-lg">
                      {step.visual.targetHighlight.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-white rounded-xl p-2.5 shadow-xs border border-slate-200 text-center text-sm font-semibold text-slate-600">
                {step.visual.screenPreview?.footer || 'Bottom actions'}
              </div>
            </div>

            {/* Bottom Home Indicator */}
            <div className="w-28 h-1 bg-slate-700 rounded-full mx-auto mt-2" />
          </div>
        </div>
      )}
    </div>
  );
};

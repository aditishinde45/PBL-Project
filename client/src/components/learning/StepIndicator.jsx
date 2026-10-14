import React from 'react';

export const StepIndicator = ({ currentStep = 1, totalSteps = 5, category = 'Lesson' }) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-xl">
            {category}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Step {currentStep} of {totalSteps}
          </h2>
        </div>
        <div className="text-right">
          <span className="text-xl sm:text-2xl font-black text-blue-800">
            {percentage}%
          </span>
          <span className="text-slate-500 text-sm sm:text-base font-semibold block">
            Completed
          </span>
        </div>
      </div>

      {/* Visual Step Progress Bar & Bubbles */}
      <div className="space-y-3">
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const stepNum = idx + 1;
            const isDone = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div
                key={stepNum}
                className="flex flex-col items-center gap-1"
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-extrabold text-base sm:text-lg border-2 transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : isCurrent
                      ? 'bg-blue-700 text-white border-blue-700 ring-4 ring-blue-100 scale-110'
                      : 'bg-white text-slate-400 border-slate-300'
                  }`}
                >
                  {isDone ? '✓' : stepNum}
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-500 hidden sm:inline">
                  Step {stepNum}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

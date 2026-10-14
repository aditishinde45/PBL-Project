import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

export const ScamCard = ({ scam }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-7 shadow-sm transition-all hover:border-blue-400">
      <div className="flex items-start justify-between gap-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-start gap-4">
          <span className="text-4xl sm:text-5xl" role="img" aria-label="Scam type">
            {scam.icon || '⚠️'}
          </span>
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
              {scam.title}
            </h3>
            <p className="text-base sm:text-lg text-slate-600 mt-1 leading-relaxed">
              {scam.shortDescription}
            </p>
          </div>
        </div>
        <button
          className="p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 flex-shrink-0"
          aria-label={isOpen ? 'Collapse scam details' : 'Expand scam details'}
        >
          {isOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-6 pt-6 border-t border-slate-200 space-y-4 animate-fadeIn">
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">How the scam works:</h4>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {scam.howItWorks}
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold text-rose-800 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>Red Flags to Watch For:</span>
            </h4>
            <ul className="space-y-1.5 pl-2">
              {scam.redFlags?.map((flag, idx) => (
                <li key={idx} className="text-base sm:text-lg text-slate-800 flex items-start gap-2">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <h4 className="text-lg font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>What You Should Do:</span>
            </h4>
            <p className="text-base sm:text-lg text-emerald-900 font-medium leading-relaxed">
              {scam.whatToDo}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

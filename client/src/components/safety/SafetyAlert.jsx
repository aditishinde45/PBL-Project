import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

export const SafetyAlert = ({ analysis }) => {
  if (!analysis) return null;

  const {
    riskLevel = 'safe',
    riskScore = 10,
    headline = '',
    reasons = [],
    actionAdvice = [],
    flaggedKeywords = []
  } = analysis;

  const config = {
    safe: {
      bg: 'bg-emerald-50 border-emerald-300 text-emerald-950',
      badge: 'bg-emerald-600 text-white',
      icon: CheckCircle2,
      label: 'Safe / Low Risk'
    },
    caution: {
      bg: 'bg-amber-50 border-amber-300 text-amber-950',
      badge: 'bg-amber-600 text-white',
      icon: AlertTriangle,
      label: 'Caution Recommended'
    },
    suspicious: {
      bg: 'bg-orange-50 border-orange-400 text-orange-950',
      badge: 'bg-orange-600 text-white',
      icon: AlertTriangle,
      label: 'Suspicious / Potential Scam'
    },
    dangerous: {
      bg: 'bg-rose-50 border-rose-500 text-rose-950',
      badge: 'bg-rose-700 text-white',
      icon: AlertOctagon,
      label: 'High Risk / Severe Danger'
    }
  };

  const currentConfig = config[riskLevel] || config.caution;
  const Icon = currentConfig.icon;

  return (
    <div className={`rounded-3xl border-3 p-6 sm:p-8 space-y-6 shadow-md ${currentConfig.bg} animate-fadeIn`}>
      {/* Risk Badge & Headline */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-slate-200/60">
        <span className={`px-4 py-1.5 rounded-full font-black text-sm sm:text-base inline-flex items-center gap-2 ${currentConfig.badge}`}>
          <Icon className="w-5 h-5" />
          <span>{currentConfig.label}</span>
        </span>
        <span className="text-base sm:text-lg font-bold">
          Risk Score: <strong>{riskScore}/100</strong>
        </span>
      </div>

      {/* Main Headline */}
      <h3 className="text-2xl sm:text-3xl font-extrabold leading-snug">
        {headline}
      </h3>

      {/* Flagged Keywords if any */}
      {flaggedKeywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold opacity-80">Flagged warning words:</span>
          {flaggedKeywords.map((word, i) => (
            <span key={i} className="px-2.5 py-0.5 rounded-lg bg-black/10 text-xs sm:text-sm font-extrabold">
              "{word}"
            </span>
          ))}
        </div>
      )}

      {/* Why it may be risky */}
      {reasons.length > 0 && (
        <div className="bg-white/80 rounded-2xl p-5 border border-black/10 space-y-3">
          <h4 className="text-xl font-bold">Why this was flagged:</h4>
          <ul className="space-y-2">
            {reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-base sm:text-lg leading-relaxed">
                <span className="text-rose-600 font-bold">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* What you should do */}
      {actionAdvice.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-black/10 space-y-3">
          <h4 className="text-xl font-bold text-slate-900">What you should do next:</h4>
          <ul className="space-y-2.5">
            {actionAdvice.map((advice, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-base sm:text-lg text-slate-800 leading-relaxed">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{advice}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Golden Rule Reminder */}
      <div className="p-4 rounded-xl bg-blue-900 text-white text-base sm:text-lg font-medium flex items-center gap-3">
        <ShieldAlert className="w-7 h-7 text-yellow-300 flex-shrink-0" />
        <span>
          <strong>Golden Rule:</strong> Never share your 4-digit or 6-digit OTP or PIN with anyone. Real banks and ElderEase will NEVER ask for it.
        </span>
      </div>
    </div>
  );
};

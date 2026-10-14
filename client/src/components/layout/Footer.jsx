import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-white border-t-2 border-slate-200 mt-16 pt-12 pb-24 md:pb-12 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl">👵</span>
              <span className="text-2xl font-bold text-slate-900">ElderEase</span>
            </div>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Your patient, trustworthy technology teacher. Designed with respect and deep care for senior citizens.
            </p>
          </div>

          {/* Safety Notice */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-lg">
              <ShieldCheck className="w-6 h-6 text-amber-700" />
              <span>ElderEase Safety Promise</span>
            </div>
            <p className="text-base text-amber-800 leading-relaxed">
              We will NEVER ask you for your bank passwords, ATM PINs, or OTPs. If anyone asks, please contact family or dial <strong>1930</strong> (National Cyber Helpline).
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-lg font-bold text-slate-900">Quick Navigation</h4>
            <div className="flex flex-col gap-2 text-base sm:text-lg">
              <Link to="/library" className="hover:text-blue-700 transition-colors">Learning Library</Link>
              <Link to="/safety" className="hover:text-blue-700 transition-colors">Safety Center & Scam Checker</Link>
              <Link to="/settings" className="hover:text-blue-700 transition-colors">Accessibility Controls & Text Size</Link>
              <Link to="/family" className="hover:text-blue-700 transition-colors">Family & Caregiver Portal</Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-sm sm:text-base text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ElderEase. Technology Made Simple for Seniors.</p>
          <div className="flex items-center gap-1 font-medium">
            <span>Built with patience and</span>
            <Heart className="w-4 h-4 text-rose-600 inline fill-rose-600" />
            <span>for our elders.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

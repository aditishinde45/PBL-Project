import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`bg-white rounded-3xl shadow-2xl border-2 border-slate-300 w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-200`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-slate-100 bg-slate-50/70">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">{title}</h2>
          <button
            onClick={onClose}
            className="p-3 rounded-full hover:bg-slate-200 text-slate-700 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-8 h-8" strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};

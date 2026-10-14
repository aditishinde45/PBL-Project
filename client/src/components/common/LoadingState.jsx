import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = 'Thinking and preparing...', subtitle = 'Please take your time' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-3xl border-2 border-slate-200 shadow-sm my-6">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-5 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-60"></div>
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
          <Loader2 className="w-8 h-8 animate-spin" strokeWidth={2.5} />
        </div>
      </div>
      <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{message}</h3>
      <p className="text-lg sm:text-xl text-slate-600 max-w-md">{subtitle}</p>
    </div>
  );
};

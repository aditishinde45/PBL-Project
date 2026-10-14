import React from 'react';
import { SeniorButton } from './SeniorButton.jsx';

export const EmptyState = ({
  icon = '📚',
  title = 'Nothing here yet',
  description = 'You haven’t started any lessons in this section yet.',
  actionLabel = 'Start Learning',
  onAction = null,
  actionIcon = null
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-3xl border-2 border-slate-200 shadow-sm my-6 max-w-xl mx-auto">
      <div className="text-6xl sm:text-7xl mb-5" role="img" aria-label="Icon">
        {icon}
      </div>
      <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-md leading-relaxed">{description}</p>
      {onAction && (
        <SeniorButton onClick={onAction} variant="primary" size="lg" icon={actionIcon}>
          {actionLabel}
        </SeniorButton>
      )}
    </div>
  );
};

import React from 'react';

export default function LoadingSpinner({ message = 'Loading...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }[size] || 'w-8 h-8 border-3';

  return (
    <div className="flex flex-col items-center justify-center p-6 text-slate-500">
      <div
        className={`${sizeClasses} border-brand-200 border-t-brand-600 rounded-full animate-spin`}
        role="status"
        aria-label="loading"
      />
      {message && <p className="mt-3 text-sm font-medium text-slate-600">{message}</p>}
    </div>
  );
}


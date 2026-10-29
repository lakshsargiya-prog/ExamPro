import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export default function Alert({ type = 'info', title, message, onClose }) {
  const styles = {
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: <XCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    },
  }[type] || styles.info;

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 ${styles.bg}`}>
      {styles.icon}
      <div className="flex-1 text-sm">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <div className="leading-relaxed">{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition p-1"
          aria-label="Close alert"
        >
          &times;
        </button>
      )}
    </div>
  );
}


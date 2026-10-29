import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-3xl font-black text-slate-900 mb-2">404</h1>
        <h2 className="text-lg font-bold text-slate-700 mb-2">Page Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">
          The requested page does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}


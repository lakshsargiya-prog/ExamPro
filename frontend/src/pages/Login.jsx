import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { LogIn, KeyRound, Mail, Sparkles } from 'lucide-react';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      const res = await login(email, password);
      if (from) {
        navigate(from, { replace: true });
      } else if (res.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-100">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sign in to ExamPro
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Enter your credentials to access your examinations and results
          </p>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-md shadow-brand-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Quick-fill for Testing */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Demo Quick-Fill Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@example.com', 'ExamProAdmin2026!')}
              className="px-3 py-2 text-xs font-medium bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg border border-purple-200 transition text-center"
            >
              Fill Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('student_test_1@example.com', 'Password123!')}
              className="px-3 py-2 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition text-center"
            >
              Fill Student
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          Don&apos;t have an account yet?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}


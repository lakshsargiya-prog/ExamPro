import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { UserPlus, User, Mail, KeyRound, ShieldAlert } from 'lucide-react';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !password) {
      setError('All fields are required.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await register(fullName, email, password);
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Email may already be in use.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-100">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Create Student Account
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Register to browse examinations and begin your assessments
          </p>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                maxLength={120}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
              />
            </div>
          </div>

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
                placeholder="jane@example.com"
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Password (min. 8 characters)
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={8}
                maxLength={100}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5 text-xs text-slate-500">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>Public registration assigns the <strong className="text-slate-700">STUDENT</strong> role by default. Admin accounts are provisioned securely via server environment variables.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-md shadow-brand-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}


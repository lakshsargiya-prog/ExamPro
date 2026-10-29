import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { systemApi } from '../api/client';
import {
  GraduationCap,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Award,
  ArrowRight,
  BookOpen,
  Sparkles,
  Server
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated, user, isStudent, isAdmin } = useAuth();
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    systemApi.getStatus()
      .then(setSystemStatus)
      .catch(() => setSystemStatus(null));
  }, []);

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/80 via-white to-slate-50 pt-16 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <Server className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Backend {systemStatus?.status === 'UP' ? 'Online & Healthy' : 'Ready'} (v{systemStatus?.version || '1.0.0'})
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              Precision Online Examination & <span className="text-brand-600">Automated Grading</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-8">
              ExamPro provides a secure, timed assessment engine for educational institutions and certification bodies with instantaneous automated scoring.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <>
                  {isStudent && (
                    <Link
                      to="/student/dashboard"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 transition"
                    >
                      Go to Student Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-500/20 transition"
                    >
                      Open Admin Portal
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  <Link
                    to="/exams"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition"
                  >
                    View All Exams
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 transition"
                  >
                    Create Free Student Account
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">Platform Capabilities</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Built for Security, Speed, and Reliability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 transition group">
              <div className="w-12 h-12 bg-blue-100 text-brand-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Timed Assessments</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Live countdown timers, automatic answer saving, and server-side deadline enforcement ensure exams expire exactly on schedule.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 transition group">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Instant Automated Evaluation</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Objective scoring calculates total marks, percentage, and passing criteria immediately upon student submission.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 transition group">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">JWT Security & Roles</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Stateless HMAC-SHA JWT authentication cleanly isolates student attempt privileges from administrative exam configuration.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 transition group">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Subject & Question Banks</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Admins organize multiple-choice questions by subjects and difficulty levels (EASY, MEDIUM, HARD) with customized mark weights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works steps */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">Workflow</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Taking an Exam in 4 Simple Steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Register Account', desc: 'Sign up in seconds with your name and email. Default role is Student.' },
              { step: '02', title: 'Select an Active Exam', desc: 'Browse exams currently available for test-takers and review duration.' },
              { step: '03', title: 'Answer & Save', desc: 'Answer questions in any order. The countdown timer guides your pacing.' },
              { step: '04', title: 'Instant Scorecard', desc: 'Submit with one click to see your score, percentage, and pass/fail outcome.' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 relative shadow-xs">
                <div className="text-3xl font-black text-brand-200 mb-2">{item.step}</div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}


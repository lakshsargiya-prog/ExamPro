import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { attemptsApi, examsApi } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
  GraduationCap,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  PlayCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myAttempts, setMyAttempts] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [attemptsData, examsData] = await Promise.all([
        attemptsApi.getMyResults(),
        examsApi.getAll(),
      ]);
      setMyAttempts(attemptsData || []);
      setExams(examsData || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const totalAttempts = myAttempts.length;
  const passedCount = myAttempts.filter((a) => a.passed).length;
  const completedAttempts = myAttempts.filter((a) => a.status === 'SUBMITTED' || a.status === 'EXPIRED');
  const avgScore = completedAttempts.length
    ? Math.round(
        completedAttempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) /
          completedAttempts.length
      )
    : 0;

  const inProgressAttempt = myAttempts.find((a) => a.status === 'IN_PROGRESS');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-3xl p-8 mb-8 shadow-lg shadow-brand-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-semibold mb-3">
            Student Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-brand-100 text-sm mt-1">
            Track your assessment history, ongoing test attempts, and evaluation scores.
          </p>
        </div>

        <Link
          to="/exams"
          className="inline-flex items-center gap-2 px-5 py-3 bg-white text-brand-700 hover:bg-brand-50 rounded-xl font-bold text-sm shadow-sm transition shrink-0"
        >
          <span>Browse All Exams</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* In-Progress Attempt Banner */}
      {inProgressAttempt && (
        <div className="mb-8 p-5 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                You have an exam in progress: {inProgressAttempt.examTitle}
              </h4>
              <p className="text-xs text-amber-700">
                Deadline: {new Date(inProgressAttempt.deadline).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <Link
            to={`/student/exam/${inProgressAttempt.examId}`}
            state={{ attempt: inProgressAttempt }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Resume Exam Now</span>
          </Link>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading your assessment profile..." />
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Attempts</span>
                <FileText className="w-5 h-5 text-brand-500" />
              </div>
              <p className="text-3xl font-black text-slate-900">{totalAttempts}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Passed Exams</span>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-3xl font-black text-slate-900">{passedCount}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Score</span>
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-black text-slate-900">{avgScore}%</p>
            </div>
          </div>

          {/* Recent Attempts History */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden mb-10">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">My Examination History</h3>
              <span className="text-xs text-slate-400 font-semibold">{myAttempts.length} Total Records</span>
            </div>

            {myAttempts.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">You have not attempted any exams yet.</p>
                <Link to="/exams" className="mt-3 inline-block text-xs font-bold text-brand-600 hover:underline">
                  Browse available examinations &rarr;
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-bold border-b border-slate-200 uppercase">
                    <tr>
                      <th className="py-3 px-6">Exam Title</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6">Score</th>
                      <th className="py-3 px-6">Result</th>
                      <th className="py-3 px-6">Submitted</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myAttempts.map((attempt) => (
                      <tr key={attempt.attemptId} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-6 font-semibold text-slate-800">
                          {attempt.examTitle}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              attempt.status === 'SUBMITTED'
                                ? 'bg-emerald-50 text-emerald-700'
                                : attempt.status === 'IN_PROGRESS'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {attempt.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-slate-700">
                          {attempt.status === 'IN_PROGRESS' ? '—' : `${attempt.score} pts (${attempt.percentage}%)`}
                        </td>
                        <td className="py-4 px-6">
                          {attempt.status === 'IN_PROGRESS' ? (
                            <span className="text-xs text-slate-400">In Progress</span>
                          ) : attempt.passed ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                              <CheckCircle className="w-4 h-4" /> PASSED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                              <XCircle className="w-4 h-4" /> FAILED
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-500">
                          {attempt.submittedAt
                            ? new Date(attempt.submittedAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '—'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {attempt.status === 'IN_PROGRESS' ? (
                            <Link
                              to={`/student/exam/${attempt.examId}`}
                              state={{ attempt }}
                              className="text-xs font-bold text-amber-600 hover:text-amber-700"
                            >
                              Resume &rarr;
                            </Link>
                          ) : (
                            <Link
                              to={`/student/results/${attempt.attemptId}`}
                              className="text-xs font-bold text-brand-600 hover:text-brand-700"
                            >
                              View Scorecard &rarr;
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}


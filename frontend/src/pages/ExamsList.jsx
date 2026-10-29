import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { examsApi, attemptsApi } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
  Clock,
  Award,
  HelpCircle,
  Calendar,
  CheckCircle,
  AlertCircle,
  Search,
  ArrowRight,
  Lock
} from 'lucide-react';

export default function ExamsList() {
  const { isAuthenticated, isStudent, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startingId, setStartingId] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadExams();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadExams = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await examsApi.getAll();
      setExams(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load examinations.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (examId) => {
    if (!isStudent) {
      alert('Only registered students can start an exam attempt.');
      return;
    }

    setStartingId(examId);
    setError('');
    try {
      const attempt = await attemptsApi.start(examId);
      navigate(`/student/exam/${examId}`, { state: { attempt } });
    } catch (err) {
      setError(err.message || 'Unable to start this exam.');
      setStartingId(null);
    }
  };

  const filteredExams = exams.filter((e) =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (iso) => {
    if (!iso) return 'Always';
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Examinations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse active assessments, test durations, and passing standards
          </p>
        </div>

        {isAuthenticated && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search exams..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {!isAuthenticated ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-lg mx-auto">
          <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-100">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Authentication Required</h2>
          <p className="text-sm text-slate-500 mb-6">
            Exam schedules and question banks are protected. Sign in with your student or administrator account to view and participate in exams.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-sm transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      ) : loading ? (
        <LoadingSpinner message="Fetching exam catalog..." size="lg" />
      ) : filteredExams.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No Examinations Found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'No exams matched your search query. Try clearing the search.'
              : 'There are currently no exams configured in the system. Check back soon or contact an administrator.'}
          </p>
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
            >
              Create First Exam in Admin Portal
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
            const hasQuestions = (exam.questionIds?.length || 0) > 0;
            const canStart = exam.availableNow && hasQuestions && isStudent;

            return (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-lg hover:border-brand-200 transition group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        exam.availableNow
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          exam.availableNow ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      {exam.availableNow ? 'Available' : 'Unavailable'}
                    </span>

                    <span className="text-xs font-semibold text-slate-400">
                      ID #{exam.id}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition leading-snug mb-2">
                    {exam.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-6">
                    {exam.description || 'No description provided.'}
                  </p>

                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs mb-6">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4 text-brand-500 shrink-0" />
                      <span>{exam.durationMinutes} minutes</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <Award className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Pass: {exam.passingPercentage}%</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <HelpCircle className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>{exam.questionIds?.length || 0} Questions</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">Until: {formatDate(exam.availableUntil)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  {isStudent ? (
                    <button
                      onClick={() => handleStartExam(exam.id)}
                      disabled={!canStart || startingId === exam.id}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                        canStart
                          ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {startingId === exam.id ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Initializing Attempt...</span>
                        </>
                      ) : !exam.availableNow ? (
                        <span>Currently Unavailable</span>
                      ) : !hasQuestions ? (
                        <span>No Questions Assigned Yet</span>
                      ) : (
                        <>
                          <span>Take Examination</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  ) : isAdmin ? (
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/questions?examId=${exam.id}`}
                        className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-center bg-purple-600 text-white hover:bg-purple-700 shadow-xs transition block"
                      >
                        {hasQuestions ? `Manage Questions (${exam.questionIds?.length})` : 'Assign Questions (0)'}
                      </Link>
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-center bg-slate-100 hover:bg-slate-200 text-slate-700 transition block"
                    >
                      Log in as Student to Start
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


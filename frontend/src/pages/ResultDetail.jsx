import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { attemptsApi } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
  CheckCircle,
  XCircle,
  Award,
  Calendar,
  Clock,
  ArrowLeft,
  Mail,
  GraduationCap
} from 'lucide-react';

export default function ResultDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResult();
  }, [id]);

  const loadResult = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await attemptsApi.getResultById(id);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Unable to retrieve assessment scorecard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Calculating and retrieving scorecard..." size="lg" />;
  }

  if (error || !result) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 text-center">
        <Alert type="error" message={error || 'Scorecard not found.'} />
        <Link
          to="/student/dashboard"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to student dashboard</span>
        </Link>
      </div>
    );
  }

  const isPassed = result.passed;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Top Banner indicating Pass / Fail */}
        <div
          className={`p-8 text-center text-white ${
            isPassed
              ? 'bg-gradient-to-br from-emerald-600 to-teal-700'
              : 'bg-gradient-to-br from-rose-600 to-red-700'
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-4 border border-white/30">
            {isPassed ? (
              <CheckCircle className="w-10 h-10 text-white" />
            ) : (
              <XCircle className="w-10 h-10 text-white" />
            )}
          </div>

          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider uppercase mb-2">
            Assessment Outcome
          </span>

          <h1 className="text-3xl font-black tracking-tight mb-1">
            {isPassed ? 'Congratulations! You Passed' : 'Assessment Not Passed'}
          </h1>

          <p className="text-white/80 text-sm max-w-sm mx-auto">
            {result.examTitle}
          </p>
        </div>

        {/* Detailed Metrics */}
        <div className="p-8 sm:p-10 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Your Score
              </span>
              <p className="text-2xl font-black text-slate-900 font-mono">
                {result.score} <span className="text-sm font-semibold text-slate-400">/ {result.maximumMarks}</span>
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Percentage
              </span>
              <p
                className={`text-2xl font-black font-mono ${
                  isPassed ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {result.percentage}%
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Status
              </span>
              <span
                className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                  result.status === 'SUBMITTED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {result.status}
              </span>
            </div>
          </div>

          {/* Metadata Table */}
          <div className="border border-slate-100 rounded-2xl divide-y divide-slate-100 text-sm">
            <div className="flex items-center justify-between p-4">
              <span className="text-slate-500 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                Student Account
              </span>
              <span className="font-semibold text-slate-800">{result.studentEmail}</span>
            </div>

            <div className="flex items-center justify-between p-4">
              <span className="text-slate-500 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-slate-400" />
                Attempt Reference
              </span>
              <span className="font-mono text-xs font-bold text-slate-600">
                #{result.attemptId} (Exam #{result.examId})
              </span>
            </div>

            <div className="flex items-center justify-between p-4">
              <span className="text-slate-500 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                Submitted At
              </span>
              <span className="text-slate-700">
                {result.submittedAt ? new Date(result.submittedAt).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-100">
            <Link
              to="/student/dashboard"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 text-center transition"
            >
              &larr; Back to Dashboard
            </Link>

            <Link
              to="/exams"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 text-center shadow-xs transition"
            >
              Browse Other Examinations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { examsApi, questionsApi, attemptsApi } from '../api/client';
import CountdownTimer from '../components/CountdownTimer';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import {
  Clock,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  Save,
  Check
} from 'lucide-react';

export default function ExamTaking() {
  const { id: examIdParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(location.state?.attempt || null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: optionId }

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);

  useEffect(() => {
    initializeExamSession();
  }, [examIdParam]);

  const initializeExamSession = async () => {
    setLoading(true);
    setError('');

    try {
      const examId = Number(examIdParam);

      // 1. Fetch exam details
      const examData = await examsApi.getById(examId);
      setExam(examData);

      // 2. Fetch or create active attempt
      let currentAttempt = attempt;
      if (!currentAttempt) {
        // Check my past attempts to see if an active one exists
        const myAttempts = await attemptsApi.getMyResults();
        const active = myAttempts.find(
          (a) => a.examId === examId && a.status === 'IN_PROGRESS'
        );
        if (active) {
          currentAttempt = active;
        } else {
          // Start fresh attempt
          currentAttempt = await attemptsApi.start(examId);
        }
      }
      setAttempt(currentAttempt);

      // If attempt is already submitted or expired
      if (currentAttempt.status !== 'IN_PROGRESS') {
        navigate(`/student/results/${currentAttempt.attemptId}`, { replace: true });
        return;
      }

      // Check deadline
      if (new Date(currentAttempt.deadline).getTime() <= Date.now()) {
        setTimeExpired(true);
      }

      // 3. Fetch questions assigned to this exam
      let examQuestions = await examsApi.getQuestions(examId).catch(() => []);
      if (!examQuestions || examQuestions.length === 0) {
        const allQuestions = await questionsApi.getAll();
        examQuestions = allQuestions.filter((q) =>
          examData.questionIds?.includes(q.id)
        );
      }

      if (examQuestions.length === 0) {
        throw new Error('This examination has no questions assigned yet.');
      }

      setQuestions(examQuestions);
    } catch (err) {
      setError(err.message || 'Unable to load examination session.');
    } finally {
      setLoading(false);
    }
  };

  // Handle option selection
  const handleSelectOption = (questionId, optionId) => {
    if (timeExpired || submitting) return;

    const updated = { ...selectedAnswers, [questionId]: optionId };
    setSelectedAnswers(updated);

    // Auto-save progress
    saveProgress(updated);
  };

  // Save answers to backend
  const saveProgress = async (answersState = selectedAnswers) => {
    if (!attempt?.attemptId || timeExpired) return;

    setSaving(true);
    try {
      const payload = Object.entries(answersState).map(([qId, oId]) => ({
        questionId: Number(qId),
        optionId: Number(oId),
      }));

      if (payload.length > 0) {
        await attemptsApi.saveAnswers(attempt.attemptId, payload);
        setLastSaved(new Date());
      }
    } catch (err) {
      console.warn('Auto-save warning:', err.message);
    } finally {
      setSaving(false);
    }
  };

  // Final submission
  const handleSubmitExam = async () => {
    if (!attempt?.attemptId || submitting) return;

    setSubmitting(true);
    setError('');
    setShowSubmitModal(false);

    try {
      // 1. Flush any unsaved answers first
      await saveProgress();

      // 2. Submit attempt to trigger automatic grading
      const finalAttempt = await attemptsApi.submit(attempt.attemptId);
      navigate(`/student/results/${finalAttempt.attemptId}`, { replace: true });
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  const handleTimerExpire = () => {
    setTimeExpired(true);
    // Automatically submit when timer runs out
    handleSubmitExam();
  };

  if (loading) {
    return <LoadingSpinner message="Preparing your examination session..." size="lg" />;
  }

  if (error && !exam) {
    return (
      <div className="max-w-xl mx-auto my-12 px-4">
        <Alert type="error" message={error} />
        <button
          onClick={() => navigate('/exams')}
          className="mt-4 px-4 py-2 text-sm font-semibold text-brand-600 hover:underline"
        >
          &larr; Back to available exams
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalCount = questions.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Test Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4 sticky top-20 z-30">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">{exam?.title}</h1>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
            <span>Pass standard: {exam?.passingPercentage}%</span>
            <span>•</span>
            <span>Total marks: {exam?.maximumMarks}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {attempt?.deadline && (
            <CountdownTimer deadline={attempt.deadline} onExpire={handleTimerExpire} />
          )}

          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Finish & Submit</span>
          </button>
        </div>
      </div>

      {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}

      {timeExpired && (
        <div className="mb-4">
          <Alert
            type="warning"
            title="Time Has Expired"
            message="Your allocated exam time has passed. Please submit your answers immediately for scoring."
          />
        </div>
      )}

      {/* Main Examination Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left/Center: Question and Multiple Choice Options */}
        <div className="lg:col-span-3 space-y-6">
          {currentQ ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                  Question {currentIndex + 1} of {totalCount}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                    {currentQ.difficulty}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-brand-50 text-brand-700 rounded">
                    {currentQ.marks} {currentQ.marks === 1 ? 'Mark' : 'Marks'}
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 leading-relaxed mb-8">
                {currentQ.text}
              </h2>

              {/* Options Radio List */}
              <div className="space-y-3 mb-8">
                {currentQ.options?.map((option, idx) => {
                  const isSelected = selectedAnswers[currentQ.id] === option.id;

                  return (
                    <label
                      key={option.id}
                      onClick={() => handleSelectOption(currentQ.id, option.id)}
                      className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition select-none ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/50 shadow-xs ring-1 ring-brand-500'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition ${
                          isSelected
                            ? 'border-brand-600 bg-brand-600 text-white'
                            : 'border-slate-300 text-slate-500'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>

                      <div className="text-sm text-slate-800 leading-relaxed pt-0.5">
                        {option.text}
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Navigation & Save status bottom bar */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  {saving ? (
                    <span className="flex items-center gap-1 text-slate-500">
                      <div className="w-3 h-3 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : lastSaved ? (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <Check className="w-3.5 h-3.5" /> Progress saved
                    </span>
                  ) : null}
                </div>

                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(totalCount - 1, prev + 1))}
                  disabled={currentIndex === totalCount - 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-500">No question data available.</p>
          )}
        </div>

        {/* Right Sidebar: Question Palette & Overview */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Question Palette</h3>
            <p className="text-xs text-slate-500 mb-4">
              {answeredCount} of {totalCount} answered
            </p>

            <div className="grid grid-cols-5 gap-2 mb-6">
              {questions.map((q, idx) => {
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg font-bold text-xs transition flex items-center justify-center ${
                      isCurrent
                        ? 'ring-2 ring-brand-500 ring-offset-2'
                        : ''
                    } ${
                      isAnswered
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 text-xs border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-3 h-3 rounded bg-emerald-600"></span>
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-3 h-3 rounded bg-slate-200"></span>
                <span>Unanswered ({totalCount - answeredCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal before Final Submit */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Confirm Exam Submission"
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 leading-relaxed">
              Once submitted, you cannot change your answers. Your exam will be graded automatically immediately.
            </div>
          </div>

          <div className="py-2 text-sm text-slate-700 space-y-1">
            <p>
              Answered Questions: <strong className="text-slate-900">{answeredCount}</strong> / {totalCount}
            </p>
            {totalCount - answeredCount > 0 && (
              <p className="text-xs text-rose-600 font-semibold">
                You have {totalCount - answeredCount} unanswered questions!
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Review Answers
            </button>
            <button
              onClick={handleSubmitExam}
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Yes, Submit Final Exam'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


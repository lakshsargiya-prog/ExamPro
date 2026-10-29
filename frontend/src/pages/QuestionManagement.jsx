import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { examsApi, subjectsApi, questionsApi } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import {
  HelpCircle,
  Plus,
  CheckCircle,
  Trash2,
  BookOpen,
  Layers,
  Award,
  Filter,
  Search,
  Check,
  AlertCircle,
  RefreshCw,
  Clock,
  ArrowRight,
  Shield,
  FileQuestion,
  Sparkles,
  MinusCircle
} from 'lucide-react';

export default function QuestionManagement() {
  const location = useLocation();

  // Data states
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [assignedQuestions, setAssignedQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // UI & Loading states
  const [loading, setLoading] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' | 'create' | 'bank'

  // Question Form State (Multiple Choice)
  const [questionForm, setQuestionForm] = useState({
    text: '',
    subjectId: '',
    difficulty: 'MEDIUM',
    marks: 5.0,
    assignToSelectedExam: true,
    options: [
      { text: '', correct: true },
      { text: '', correct: false },
      { text: '', correct: false },
      { text: '', correct: false },
    ],
  });

  // Bank selection state
  const [bankSearch, setBankSearch] = useState('');
  const [selectedBankIds, setSelectedBankIds] = useState([]);

  // Unassign confirmation modal
  const [unassignTarget, setUnassignTarget] = useState(null);

  // Initialize data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // When selectedExamId changes, load assigned questions for that exam
  useEffect(() => {
    if (selectedExamId) {
      const found = exams.find((e) => e.id === Number(selectedExamId));
      setSelectedExam(found || null);
      loadExamQuestions(Number(selectedExamId));
    } else {
      setSelectedExam(null);
      setAssignedQuestions([]);
    }
  }, [selectedExamId, exams]);

  const loadInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      const [examsData, subjectsData, questionsData] = await Promise.all([
        examsApi.getAll().catch(() => []),
        subjectsApi.getAll().catch(() => []),
        questionsApi.getAdminAll().catch(() => questionsApi.getAll().catch(() => [])),
      ]);

      setExams(examsData || []);
      setSubjects(subjectsData || []);
      setAllQuestions(questionsData || []);

      if (subjectsData?.length > 0 && !questionForm.subjectId) {
        setQuestionForm((prev) => ({ ...prev, subjectId: subjectsData[0].id }));
      }

      // Check query parameter for initial exam selection (?examId=1)
      const queryParams = new URLSearchParams(location.search);
      const queryExamId = queryParams.get('examId');

      if (queryExamId && examsData.some((e) => e.id === Number(queryExamId))) {
        setSelectedExamId(Number(queryExamId));
      } else if (examsData.length > 0) {
        setSelectedExamId(examsData[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load question management data.');
    } finally {
      setLoading(false);
    }
  };

  const loadExamQuestions = async (examId) => {
    setLoadingQuestions(true);
    try {
      // First try admin endpoint (includes correct flags)
      let questionsList = await examsApi.getAdminQuestions(examId).catch(() => null);

      // Fallback if not available
      if (!questionsList) {
        questionsList = await examsApi.getQuestions(examId).catch(() => []);
      }

      setAssignedQuestions(questionsList || []);
    } catch (err) {
      console.warn('Failed to load exam questions:', err.message);
      setAssignedQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const refreshAll = async () => {
    try {
      const [examsData, questionsData] = await Promise.all([
        examsApi.getAll(),
        questionsApi.getAdminAll().catch(() => questionsApi.getAll()),
      ]);
      setExams(examsData || []);
      setAllQuestions(questionsData || []);

      if (selectedExamId) {
        const updated = examsData.find((e) => e.id === Number(selectedExamId));
        setSelectedExam(updated || null);
        loadExamQuestions(Number(selectedExamId));
      }
    } catch (err) {
      console.warn('Silent refresh error:', err.message);
    }
  };

  // Option change in multiple-choice form
  const handleOptionChange = (idx, value) => {
    const updated = [...questionForm.options];
    updated[idx].text = value;
    setQuestionForm({ ...questionForm, options: updated });
  };

  const handleCorrectRadio = (idx) => {
    const updated = questionForm.options.map((opt, i) => ({
      ...opt,
      correct: i === idx,
    }));
    setQuestionForm({ ...questionForm, options: updated });
  };

  const addOptionField = () => {
    if (questionForm.options.length >= 6) return;
    setQuestionForm({
      ...questionForm,
      options: [...questionForm.options, { text: '', correct: false }],
    });
  };

  const removeOptionField = (idx) => {
    if (questionForm.options.length <= 2) return;
    const removedWasCorrect = questionForm.options[idx].correct;
    const updated = questionForm.options.filter((_, i) => i !== idx);
    // If the removed option was marked correct, make option 0 correct
    if (removedWasCorrect && updated.length > 0) {
      updated[0].correct = true;
    }
    setQuestionForm({ ...questionForm, options: updated });
  };

  // Create Question Submission
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Form validation
    if (!questionForm.text.trim()) {
      setError('Please provide the question prompt.');
      return;
    }

    if (!questionForm.subjectId) {
      setError('Please select a subject.');
      return;
    }

    if (Number(questionForm.marks) <= 0) {
      setError('Marks must be greater than zero.');
      return;
    }

    const filledOptions = questionForm.options.filter((o) => o.text.trim().length > 0);
    if (filledOptions.length < 2) {
      setError('A multiple-choice question must have at least 2 non-empty options.');
      return;
    }

    const correctCount = questionForm.options.filter((o) => o.correct && o.text.trim().length > 0).length;
    if (correctCount !== 1) {
      setError('Exactly one non-empty option must be marked as the correct answer.');
      return;
    }

    setActionLoading(true);

    try {
      // 1. Create Question in Question Bank
      const payload = {
        text: questionForm.text.trim(),
        subjectId: Number(questionForm.subjectId),
        difficulty: questionForm.difficulty,
        marks: Number(questionForm.marks),
        options: filledOptions.map((o) => ({
          text: o.text.trim(),
          correct: !!o.correct,
        })),
      };

      const createdQuestion = await questionsApi.create(payload);

      // 2. If assignToSelectedExam is checked, immediately assign to selected exam
      if (questionForm.assignToSelectedExam && selectedExamId && createdQuestion?.id) {
        await examsApi.assignQuestions(selectedExamId, [createdQuestion.id]);
        setSuccess(
          `Question created and successfully assigned to "${selectedExam?.title || 'Exam'}"! Question count updated.`
        );
      } else {
        setSuccess('Question successfully created and saved to the Question Bank.');
      }

      // Reset form
      setQuestionForm({
        text: '',
        subjectId: subjects[0]?.id || '',
        difficulty: 'MEDIUM',
        marks: 5.0,
        assignToSelectedExam: true,
        options: [
          { text: '', correct: true },
          { text: '', correct: false },
          { text: '', correct: false },
          { text: '', correct: false },
        ],
      });

      // Refresh data
      await refreshAll();
      setActiveTab('assigned');
    } catch (err) {
      setError(err.message || 'Failed to create question.');
    } finally {
      setActionLoading(false);
    }
  };

  // Assign selected questions from Question Bank
  const handleAssignFromBank = async () => {
    if (!selectedExamId || selectedBankIds.length === 0) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      await examsApi.assignQuestions(selectedExamId, selectedBankIds);
      setSuccess(
        `Successfully assigned ${selectedBankIds.length} question(s) to "${selectedExam?.title}".`
      );
      setSelectedBankIds([]);
      await refreshAll();
      setActiveTab('assigned');
    } catch (err) {
      setError(err.message || 'Failed to assign questions from bank.');
    } finally {
      setActionLoading(false);
    }
  };

  // Unassign Question from Exam
  const confirmUnassign = async () => {
    if (!unassignTarget || !selectedExamId) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      await examsApi.unassignQuestion(selectedExamId, unassignTarget.id);
      setSuccess(`Question "${unassignTarget.text.slice(0, 40)}..." unassigned from this exam.`);
      setUnassignTarget(null);
      await refreshAll();
    } catch (err) {
      setError(err.message || 'Failed to unassign question.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter bank questions (exclude already assigned)
  const assignedIds = new Set(assignedQuestions.map((q) => q.id));
  const availableBankQuestions = allQuestions.filter(
    (q) =>
      !assignedIds.has(q.id) &&
      (bankSearch.trim() === '' ||
        q.text.toLowerCase().includes(bankSearch.toLowerCase()) ||
        q.subjectName?.toLowerCase().includes(bankSearch.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <LoadingSpinner message="Loading Question Management Center..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
              <FileQuestion className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-purple-700 uppercase tracking-widest">
              Exam Administration
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Question Management Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Author multiple-choice questions, manage option keys, and assign questions to examinations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition"
          >
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span>Admin Portal</span>
          </Link>

          <Link
            to="/exams"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 hover:bg-brand-100 rounded-xl transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-brand-600" />
            <span>View Public Exams</span>
          </Link>
        </div>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}
      {success && (
        <div className="mb-6">
          <Alert type="success" message={success} onClose={() => setSuccess('')} />
        </div>
      )}

      {/* Exam Selector Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Examination to Manage Questions
            </label>
            <div className="relative">
              <select
                value={selectedExamId || ''}
                onChange={(e) => setSelectedExamId(Number(e.target.value))}
                className="w-full sm:max-w-lg px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white"
              >
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title} ({exam.questionIds?.length || 0} Questions Assigned — {exam.maximumMarks || 0} Marks)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedExam && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="block text-[10px] font-bold uppercase text-slate-400">Questions</span>
                <span className="text-lg font-black text-slate-900">
                  {selectedExam.questionIds?.length || 0}
                </span>
              </div>

              <div className="px-3.5 py-2 bg-purple-50 border border-purple-200 rounded-xl text-center">
                <span className="block text-[10px] font-bold uppercase text-purple-600">Total Marks</span>
                <span className="text-lg font-black text-purple-700">
                  {selectedExam.maximumMarks || 0}
                </span>
              </div>

              <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="block text-[10px] font-bold uppercase text-slate-400">Duration</span>
                <span className="text-lg font-black text-slate-800">
                  {selectedExam.durationMinutes}m
                </span>
              </div>

              <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <span className="block text-[10px] font-bold uppercase text-emerald-600">Pass Req.</span>
                <span className="text-lg font-black text-emerald-700">
                  {selectedExam.passingPercentage}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-slate-200 mb-6 flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 ${
              activeTab === 'assigned'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Assigned Questions ({assignedQuestions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 ${
              activeTab === 'create'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Create New Question</span>
          </button>

          <button
            onClick={() => setActiveTab('bank')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 ${
              activeTab === 'bank'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Assign from Bank ({availableBankQuestions.length} Available)</span>
          </button>
        </div>

        <button
          onClick={refreshAll}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
          title="Refresh Data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* TAB 1: ASSIGNED QUESTIONS */}
      {activeTab === 'assigned' && (
        <div>
          {loadingQuestions ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner message="Loading assigned questions..." />
            </div>
          ) : assignedQuestions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                No Questions Assigned Yet
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                "{selectedExam?.title || 'This examination'}" currently has 0 questions assigned. Candidates will not be able to start an attempt until questions are added.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setActiveTab('create')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Question</span>
                </button>
                <button
                  onClick={() => setActiveTab('bank')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Assign from Question Bank</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  Showing {assignedQuestions.length} question(s) assigned to <strong>{selectedExam?.title}</strong>
                </span>
                <span className="font-semibold text-purple-700">
                  Total Exam Score: {selectedExam?.maximumMarks || 0} marks
                </span>
              </div>

              {assignedQuestions.map((q, qIndex) => (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {qIndex + 1}
                      </span>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 leading-snug">
                          {q.text}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                            {q.subjectName || 'General'}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            q.difficulty === 'EASY'
                              ? 'bg-emerald-100 text-emerald-800'
                              : q.difficulty === 'HARD'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {q.difficulty}
                          </span>
                          <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                            {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setUnassignTarget(q)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition shrink-0"
                      title="Unassign question from this exam"
                    >
                      <MinusCircle className="w-4 h-4" />
                      <span>Remove from Exam</span>
                    </button>
                  </div>

                  {/* Options List with Admin Correct Key highlighted */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 pt-4 border-t border-slate-100">
                    {q.options?.map((opt, optIndex) => {
                      const isCorrect = !!opt.correct;
                      return (
                        <div
                          key={opt.id || optIndex}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs transition ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border border-slate-300 text-slate-600'
                            }`}
                          >
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                          {isCorrect && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                              <Check className="w-3 h-3" />
                              <span>Correct Key</span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CREATE NEW QUESTION */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Author Multiple-Choice Question
              </h3>
              <p className="text-xs text-slate-500">
                Add question text, assign points weight, and mark exactly one correct option.
              </p>
            </div>
            {selectedExam && (
              <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold">
                Target: {selectedExam.title}
              </span>
            )}
          </div>

          <form onSubmit={handleCreateQuestion} className="space-y-6">
            {/* Question Prompt */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Question Text <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                maxLength={2000}
                value={questionForm.text}
                onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                placeholder="e.g. Which Java interface must be implemented to allow sorting objects using Collections.sort()?"
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 placeholder:text-slate-400"
              />
              <span className="text-[11px] text-slate-400 mt-1 block text-right">
                {questionForm.text.length} / 2000 characters
              </span>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Subject Category <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={questionForm.subjectId}
                  onChange={(e) => setQuestionForm({ ...questionForm, subjectId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Difficulty Level
                </label>
                <select
                  value={questionForm.difficulty}
                  onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Marks Weight <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={0.5}
                  max={100}
                  step="0.5"
                  required
                  value={questionForm.marks}
                  onChange={(e) => setQuestionForm({ ...questionForm, marks: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Options Management */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Options & Answer Key <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs text-purple-700 font-medium">
                  Select the radio button beside the single correct option
                </span>
              </div>

              <div className="space-y-3">
                {questionForm.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                      opt.correct
                        ? 'border-emerald-300 bg-emerald-50/60'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <label className="flex items-center cursor-pointer shrink-0" title="Mark as correct answer">
                      <input
                        type="radio"
                        name="correctAnswerKey"
                        checked={opt.correct}
                        onChange={() => handleCorrectRadio(idx)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                    </label>

                    <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>

                    <input
                      type="text"
                      required={idx < 2}
                      value={opt.text}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Enter text for Option ${String.fromCharCode(65 + idx)}...`}
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                    />

                    {opt.correct && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full shrink-0">
                        Correct Answer
                      </span>
                    )}

                    {questionForm.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOptionField(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition shrink-0"
                        title="Remove option"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {questionForm.options.length < 6 && (
                <button
                  type="button"
                  onClick={addOptionField}
                  className="mt-3 text-xs font-bold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-purple-50 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Option (Up to 6)</span>
                </button>
              )}
            </div>

            {/* Direct Exam Assignment Checkbox */}
            {selectedExam && (
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-purple-900">
                  <input
                    type="checkbox"
                    checked={questionForm.assignToSelectedExam}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, assignToSelectedExam: e.target.checked })
                    }
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span>
                    Immediately assign this question to <strong>"{selectedExam.title}"</strong> and update exam total marks
                  </span>
                </label>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('assigned')}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Question...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Save & Assign Question</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: ASSIGN FROM QUESTION BANK */}
      {activeTab === 'bank' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Question Bank Library
              </h3>
              <p className="text-xs text-slate-500">
                Select questions from your library to add to "{selectedExam?.title}".
              </p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {availableBankQuestions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold">No unassigned questions found in the Question Bank.</p>
              <p className="mt-1">All existing questions may already be assigned, or no questions match your search.</p>
              <button
                onClick={() => setActiveTab('create')}
                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition"
              >
                Create a New Question
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                <span>{availableBankQuestions.length} Questions Available</span>
                {selectedBankIds.length > 0 && (
                  <span className="text-purple-700 font-bold">
                    {selectedBankIds.length} Selected
                  </span>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3">
                {availableBankQuestions.map((q) => {
                  const isChecked = selectedBankIds.includes(q.id);
                  return (
                    <label
                      key={q.id}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition text-xs ${
                        isChecked
                          ? 'border-purple-300 bg-purple-50/80 text-purple-950 font-medium'
                          : 'border-slate-100 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBankIds([...selectedBankIds, q.id]);
                          } else {
                            setSelectedBankIds(selectedBankIds.filter((id) => id !== q.id));
                          }
                        }}
                        className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 leading-snug">
                          {q.text}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
                          <span className="font-semibold text-slate-700">{q.subjectName}</span>
                          <span>•</span>
                          <span className="text-purple-700 font-bold">{q.marks} pts</span>
                          <span>•</span>
                          <span className="uppercase font-semibold">{q.difficulty}</span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  {selectedBankIds.length} question(s) will be added to "{selectedExam?.title}".
                </span>

                <button
                  type="button"
                  onClick={handleAssignFromBank}
                  disabled={selectedBankIds.length === 0 || actionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign Selected ({selectedBankIds.length})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: UNASSIGN CONFIRMATION */}
      <Modal
        isOpen={!!unassignTarget}
        onClose={() => setUnassignTarget(null)}
        title="Remove Question from Exam"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to remove this question from <strong>"{selectedExam?.title}"</strong>?
          </p>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800">
            "{unassignTarget?.text}"
          </div>

          <p className="text-xs text-slate-400">
            The question will remain safely stored in your overall Question Bank and can be reassigned at any time.
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUnassignTarget(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmUnassign}
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
            >
              Remove Question
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


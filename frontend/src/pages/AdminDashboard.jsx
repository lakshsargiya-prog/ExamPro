import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  examsApi,
  subjectsApi,
  questionsApi,
  attemptsApi,
} from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import {
  Shield,
  BookOpen,
  HelpCircle,
  Award,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  Layers,
  FileText,
  Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('exams'); // 'exams' | 'questions' | 'subjects' | 'results'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);

  // Modals
  const [showExamModal, setShowExamModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedExamForAssign, setSelectedExamForAssign] = useState(null);

  // Form States
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    durationMinutes: 60,
    passingPercentage: 70.0,
    availableFrom: '',
    availableUntil: '',
  });

  const [subjectForm, setSubjectForm] = useState({
    name: '',
    description: '',
  });

  const [questionForm, setQuestionForm] = useState({
    text: '',
    subjectId: '',
    difficulty: 'MEDIUM',
    marks: 1.0,
    options: [
      { text: '', correct: true },
      { text: '', correct: false },
      { text: '', correct: false },
      { text: '', correct: false },
    ],
  });

  const [assignQuestionIds, setAssignQuestionIds] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [eData, sData, qData, rData] = await Promise.all([
        examsApi.getAll().catch(() => []),
        subjectsApi.getAll().catch(() => []),
        questionsApi.getAll().catch(() => []),
        attemptsApi.getAdminResults().catch(() => []),
      ]);
      setExams(eData || []);
      setSubjects(sData || []);
      setQuestions(qData || []);
      setResults(rData || []);

      if (sData?.length > 0 && !questionForm.subjectId) {
        setQuestionForm((prev) => ({ ...prev, subjectId: sData[0].id }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------- EXAMS -----------------
  const handleCreateExam = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        title: examForm.title.trim(),
        description: examForm.description.trim() || null,
        durationMinutes: Number(examForm.durationMinutes),
        passingPercentage: Number(examForm.passingPercentage),
        availableFrom: examForm.availableFrom ? new Date(examForm.availableFrom).toISOString() : null,
        availableUntil: examForm.availableUntil ? new Date(examForm.availableUntil).toISOString() : null,
      };
      await examsApi.create(payload);
      setSuccess('Examination created successfully.');
      setShowExamModal(false);
      setExamForm({
        title: '',
        description: '',
        durationMinutes: 60,
        passingPercentage: 70.0,
        availableFrom: '',
        availableUntil: '',
      });
      loadAllData();
    } catch (err) {
      setError(err.message || 'Failed to create exam.');
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm('Are you sure you want to delete this examination?')) return;
    try {
      await examsApi.delete(id);
      setSuccess('Exam deleted.');
      loadAllData();
    } catch (err) {
      setError(err.message || 'Failed to delete exam.');
    }
  };

  const openAssignModal = (exam) => {
    setSelectedExamForAssign(exam);
    setAssignQuestionIds(exam.questionIds || []);
    setShowAssignModal(true);
  };

  const handleSaveAssignedQuestions = async () => {
    if (!selectedExamForAssign) return;
    try {
      // Find questions that aren't already assigned
      const newlySelected = assignQuestionIds.filter(
        (id) => !selectedExamForAssign.questionIds?.includes(id)
      );

      if (newlySelected.length === 0) {
        setShowAssignModal(false);
        return;
      }

      await examsApi.assignQuestions(selectedExamForAssign.id, newlySelected);
      setSuccess('Questions successfully assigned to examination.');
      setShowAssignModal(false);
      loadAllData();
    } catch (err) {
      setError(err.message || 'Failed to assign questions.');
    }
  };

  // ----------------- SUBJECTS -----------------
  const handleCreateSubject = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await subjectsApi.create({
        name: subjectForm.name.trim(),
        description: subjectForm.description.trim() || null,
      });
      setSuccess('Subject created successfully.');
      setShowSubjectModal(false);
      setSubjectForm({ name: '', description: '' });
      loadAllData();
    } catch (err) {
      setError(err.message || 'Failed to create subject.');
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Delete this subject? Questions tied to it may be affected.')) return;
    try {
      await subjectsApi.delete(id);
      setSuccess('Subject deleted.');
      loadAllData();
    } catch (err) {
      setError(err.message || 'Failed to delete subject.');
    }
  };

  // ----------------- QUESTIONS -----------------
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    setError('');

    const correctCount = questionForm.options.filter((o) => o.correct).length;
    if (correctCount !== 1) {
      setError('Exactly one option must be marked as correct.');
      return;
    }

    const filledOptions = questionForm.options.filter((o) => o.text.trim().length > 0);
    if (filledOptions.length < 2) {
      setError('Provide at least 2 options for this question.');
      return;
    }

    try {
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

      await questionsApi.create(payload);
      setSuccess('Question added to question bank.');
      setShowQuestionModal(false);
      setQuestionForm({
        text: '',
        subjectId: subjects[0]?.id || '',
        difficulty: 'MEDIUM',
        marks: 1.0,
        options: [
          { text: '', correct: true },
          { text: '', correct: false },
          { text: '', correct: false },
          { text: '', correct: false },
        ],
      });
      loadAllData();
    } catch (err) {
      setError(err.message || 'Failed to create question.');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Delete this question from question bank?')) return;
    try {
      await questionsApi.delete(id);
      setSuccess('Question deleted.');
      loadAllData();
    } catch (err) {
      setError(err.message || 'Failed to delete question.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 bg-purple-100 text-purple-700 rounded-lg">
              <Shield className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-purple-700 uppercase tracking-widest">
              Administrator Control Center
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Portal</h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/questions"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Question Manager</span>
          </Link>

          {activeTab === 'exams' && (
            <button
              onClick={() => setShowExamModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Exam</span>
            </button>
          )}

          {activeTab === 'subjects' && (
            <button
              onClick={() => setShowSubjectModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          )}

          {activeTab === 'questions' && (
            <button
              onClick={() => setShowQuestionModal(true)}
              disabled={subjects.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          )}
        </div>
      </div>

      {error && <div className="mb-6"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
      {success && <div className="mb-6"><Alert type="success" message={success} onClose={() => setSuccess('')} /></div>}

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Exams
          </span>
          <p className="text-2xl font-black text-slate-900">{exams.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Questions Bank
          </span>
          <p className="text-2xl font-black text-slate-900">{questions.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Subjects
          </span>
          <p className="text-2xl font-black text-slate-900">{subjects.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Student Submissions
          </span>
          <p className="text-2xl font-black text-slate-900">{results.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 space-x-2">
        {[
          { id: 'exams', label: 'Examinations', icon: BookOpen, count: exams.length },
          { id: 'questions', label: 'Question Bank', icon: HelpCircle, count: questions.length },
          { id: 'subjects', label: 'Subjects', icon: Layers, count: subjects.length },
          { id: 'results', label: 'Results & Grading', icon: Award, count: results.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-bold transition ${
                isActive
                  ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`text-xs px-1.5 py-0.2 rounded-full ${isActive ? 'bg-purple-200 text-purple-800' : 'bg-slate-100 text-slate-600'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading admin entities..." />
      ) : (
        <>
          {/* TAB 1: EXAMS */}
          {activeTab === 'exams' && (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-bold border-b border-slate-200 uppercase">
                    <tr>
                      <th className="py-3 px-6">ID</th>
                      <th className="py-3 px-6">Title</th>
                      <th className="py-3 px-6">Duration</th>
                      <th className="py-3 px-6">Passing %</th>
                      <th className="py-3 px-6">Questions</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {exams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-6 text-xs text-slate-400 font-mono">#{exam.id}</td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-800">{exam.title}</p>
                          <p className="text-xs text-slate-400 truncate max-w-xs">{exam.description || '—'}</p>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-600">{exam.durationMinutes} mins</td>
                        <td className="py-4 px-6 font-mono text-xs font-semibold">{exam.passingPercentage}%</td>
                        <td className="py-4 px-6 text-xs">
                          <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                            {exam.questionIds?.length || 0} questions
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                              exam.availableNow
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {exam.availableNow ? 'Available' : 'Closed'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <Link
                            to={`/admin/questions?examId=${exam.id}`}
                            className="px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition inline-block"
                          >
                            Manage Questions
                          </Link>
                          <button
                            onClick={() => handleDeleteExam(exam.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                            title="Delete exam"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: QUESTIONS */}
          {activeTab === 'questions' && (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-bold border-b border-slate-200 uppercase">
                    <tr>
                      <th className="py-3 px-6">ID</th>
                      <th className="py-3 px-6">Question Text</th>
                      <th className="py-3 px-6">Subject</th>
                      <th className="py-3 px-6">Difficulty</th>
                      <th className="py-3 px-6">Marks</th>
                      <th className="py-3 px-6">Options Count</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {questions.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-6 text-xs text-slate-400 font-mono">#{q.id}</td>
                        <td className="py-4 px-6 max-w-sm">
                          <p className="font-semibold text-slate-800 line-clamp-2">{q.text}</p>
                        </td>
                        <td className="py-4 px-6 text-xs font-medium text-slate-600">{q.subjectName}</td>
                        <td className="py-4 px-6 text-xs">
                          <span className="font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs font-mono font-bold text-slate-800">{q.marks}</td>
                        <td className="py-4 px-6 text-xs text-slate-500">{q.options?.length || 0} options</td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                            title="Delete Question"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SUBJECTS */}
          {activeTab === 'subjects' && (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-bold border-b border-slate-200 uppercase">
                    <tr>
                      <th className="py-3 px-6">ID</th>
                      <th className="py-3 px-6">Subject Name</th>
                      <th className="py-3 px-6">Description</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subjects.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-6 text-xs text-slate-400 font-mono">#{s.id}</td>
                        <td className="py-4 px-6 font-bold text-slate-800">{s.name}</td>
                        <td className="py-4 px-6 text-xs text-slate-500">{s.description || '—'}</td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDeleteSubject(s.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                            title="Delete subject"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: RESULTS */}
          {activeTab === 'results' && (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-bold border-b border-slate-200 uppercase">
                    <tr>
                      <th className="py-3 px-6">Attempt</th>
                      <th className="py-3 px-6">Student</th>
                      <th className="py-3 px-6">Exam</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6">Score</th>
                      <th className="py-3 px-6">Percentage</th>
                      <th className="py-3 px-6">Result</th>
                      <th className="py-3 px-6">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map((res) => (
                      <tr key={res.attemptId} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-6 text-xs font-mono text-slate-400">#{res.attemptId}</td>
                        <td className="py-4 px-6 font-semibold text-slate-800">{res.studentEmail}</td>
                        <td className="py-4 px-6 text-xs text-slate-600">{res.examTitle}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                              res.status === 'SUBMITTED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {res.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-slate-800">
                          {res.score} / {res.maximumMarks}
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-slate-800">{res.percentage}%</td>
                        <td className="py-4 px-6">
                          {res.passed ? (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> PASSED
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> FAILED
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-400">
                          {res.submittedAt ? new Date(res.submittedAt).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL: CREATE EXAM */}
      <Modal isOpen={showExamModal} onClose={() => setShowExamModal(false)} title="Create New Examination">
        <form onSubmit={handleCreateExam} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title</label>
            <input
              type="text"
              required
              maxLength={180}
              value={examForm.title}
              onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
              placeholder="Java 21 Certification"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              maxLength={2000}
              value={examForm.description}
              onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
              placeholder="Exam scope and instructions..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration (Mins)</label>
              <input
                type="number"
                min={1}
                max={600}
                required
                value={examForm.durationMinutes}
                onChange={(e) => setExamForm({ ...examForm, durationMinutes: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Passing % (0-100)</label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.1"
                required
                value={examForm.passingPercentage}
                onChange={(e) => setExamForm({ ...examForm, passingPercentage: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Available From (Optional)</label>
              <input
                type="datetime-local"
                value={examForm.availableFrom}
                onChange={(e) => setExamForm({ ...examForm, availableFrom: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Available Until (Optional)</label>
              <input
                type="datetime-local"
                value={examForm.availableUntil}
                onChange={(e) => setExamForm({ ...examForm, availableUntil: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowExamModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs"
            >
              Save Exam
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ASSIGN QUESTIONS TO EXAM */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title={`Assign Questions to "${selectedExamForAssign?.title}"`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Select the questions from the bank to include in this examination.
          </p>

          <div className="max-h-80 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3">
            {questions.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No questions in question bank.</p>
            ) : (
              questions.map((q) => {
                const isSelected = assignQuestionIds.includes(q.id);
                return (
                  <label
                    key={q.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition text-xs ${
                      isSelected
                        ? 'border-purple-300 bg-purple-50 text-purple-900'
                        : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAssignQuestionIds([...assignQuestionIds, q.id]);
                        } else {
                          setAssignQuestionIds(assignQuestionIds.filter((id) => id !== q.id));
                        }
                      }}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{q.text}</p>
                      <div className="flex gap-2 text-[10px] text-slate-400 mt-1">
                        <span>{q.subjectName}</span>
                        <span>•</span>
                        <span>{q.marks} pts</span>
                        <span>•</span>
                        <span>{q.difficulty}</span>
                      </div>
                    </div>
                  </label>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-semibold">
              Selected: {assignQuestionIds.length} questions
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAssignedQuestions}
                className="px-5 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-xl font-bold shadow-xs"
              >
                Save Questions
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL: CREATE SUBJECT */}
      <Modal isOpen={showSubjectModal} onClose={() => setShowSubjectModal(false)} title="Add Subject">
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject Name</label>
            <input
              type="text"
              required
              maxLength={100}
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
              placeholder="e.g. Computer Science"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description (Optional)</label>
            <textarea
              rows={3}
              maxLength={1000}
              value={subjectForm.description}
              onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
              placeholder="Subject summary..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowSubjectModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs"
            >
              Add Subject
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CREATE QUESTION */}
      <Modal
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        title="Add Question to Question Bank"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateQuestion} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Question Prompt</label>
            <textarea
              rows={2}
              required
              maxLength={2000}
              value={questionForm.text}
              onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
              placeholder="Enter question text here..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject</label>
              <select
                required
                value={questionForm.subjectId}
                onChange={(e) => setQuestionForm({ ...questionForm, subjectId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Difficulty</label>
              <select
                value={questionForm.difficulty}
                onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Marks Weight</label>
              <input
                type="number"
                min={0.5}
                max={100}
                step="0.5"
                required
                value={questionForm.marks}
                onChange={(e) => setQuestionForm({ ...questionForm, marks: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Options */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Answer Options (Mark exactly 1 correct)
              </label>
            </div>

            <div className="space-y-2">
              {questionForm.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={opt.correct}
                    onChange={() => {
                      const updated = questionForm.options.map((o, i) => ({
                        ...o,
                        correct: i === idx,
                      }));
                      setQuestionForm({ ...questionForm, options: updated });
                    }}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    required={idx < 2}
                    value={opt.text}
                    onChange={(e) => {
                      const updated = [...questionForm.options];
                      updated[idx].text = e.target.value;
                      setQuestionForm({ ...questionForm, options: updated });
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowQuestionModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs"
            >
              Save Question
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


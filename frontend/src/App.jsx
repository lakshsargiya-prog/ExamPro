import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ExamsList from './pages/ExamsList';
import StudentDashboard from './pages/StudentDashboard';
import ExamTaking from './pages/ExamTaking';
import ResultDetail from './pages/ResultDetail';
import AdminDashboard from './pages/AdminDashboard';
import QuestionManagement from './pages/QuestionManagement';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans selection:bg-brand-500 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/exams" element={<ExamsList />} />

          {/* Student Protected Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/results"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/exam/:id"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <ExamTaking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/results/:id"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                <ResultDetail />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/questions"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <QuestionManagement />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}


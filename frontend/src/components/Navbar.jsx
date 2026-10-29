import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, User, Menu, X, Shield, BookOpen, CheckSquare } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isStudent, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive(path)
        ? 'text-brand-600 bg-brand-50'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-tr from-brand-600 to-brand-500 text-white rounded-xl flex items-center justify-center shadow-sm shadow-brand-500/30">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900">Exam</span>
                <span className="text-xl font-black text-brand-600">Pro</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex md:items-center md:ml-8 space-x-1">
              <Link to="/" className={linkClass('/')}>Home</Link>
              <Link to="/exams" className={linkClass('/exams')}>Exams</Link>

              {isStudent && (
                <>
                  <Link to="/student/dashboard" className={linkClass('/student/dashboard')}>
                    My Dashboard
                  </Link>
                  <Link to="/student/results" className={linkClass('/student/results')}>
                    My Results
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link to="/admin/dashboard" className={`flex items-center gap-1.5 ${linkClass('/admin/dashboard')}`}>
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span>Admin Panel</span>
                  </Link>
                  <Link to="/admin/questions" className={`flex items-center gap-1.5 ${linkClass('/admin/questions')}`}>
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <span>Manage Questions</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Action / Auth info */}
          <div className="hidden md:flex md:items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-7 h-7 bg-brand-100 text-brand-700 rounded-lg flex items-center justify-center font-bold text-xs">
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                      {user?.fullName}
                    </p>
                    <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user?.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            to="/exams"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Available Exams
          </Link>

          {isStudent && (
            <>
              <Link
                to="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                My Dashboard
              </Link>
              <Link
                to="/student/results"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                My Results
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-purple-700 bg-purple-50"
              >
                Admin Dashboard
              </Link>
              <Link
                to="/admin/questions"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-purple-700 hover:bg-purple-50"
              >
                Manage Questions
              </Link>
            </>
          )}

          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-slate-50 rounded-lg">
                  <p className="text-sm font-semibold text-slate-800">{user?.fullName}</p>
                  <p className="text-xs text-slate-500">{user?.email} ({user?.role})</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-rose-600 bg-rose-50 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}


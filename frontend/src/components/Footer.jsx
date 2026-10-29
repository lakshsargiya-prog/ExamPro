import React from 'react';
import { GraduationCap, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-slate-900">ExamPro</span>
            </div>
            <p className="text-sm text-slate-500 max-w-sm mb-4">
              Enterprise-grade online examination and automated assessment system built with Spring Boot 3, JWT security, and React.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Backend Connected: http://localhost:8081</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link to="/" className="hover:text-brand-600 transition">Home</Link></li>
              <li><Link to="/exams" className="hover:text-brand-600 transition">Exams</Link></li>
              <li><Link to="/login" className="hover:text-brand-600 transition">Student Login</Link></li>
              <li><Link to="/register" className="hover:text-brand-600 transition">Create Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Documentation & API</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a
                  href="http://localhost:8081/swagger-ui.html"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-600 transition flex items-center gap-1"
                >
                  Swagger UI &rarr;
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:8081/v3/api-docs"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-600 transition flex items-center gap-1"
                >
                  OpenAPI Spec &rarr;
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:8081/api/status"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-600 transition flex items-center gap-1"
                >
                  System Status &rarr;
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-2">
          <p>&copy; {new Date().getFullYear()} ExamPro Online Examination System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered for high-integrity academic evaluation
          </p>
        </div>
      </div>
    </footer>
  );
}


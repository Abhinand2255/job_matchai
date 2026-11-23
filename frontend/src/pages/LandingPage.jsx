import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Briefcase,
  UserCheck,
  TrendingUp,
  FileCheck2,
  Cpu,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-white py-16 sm:py-24 rounded-3xl border border-indigo-100/50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
          <span>Intelligent Skill Matching & Resume Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Smarter Hiring, <span className="text-indigo-600">Precise Matching</span> with JobMatch AI
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Bridging the gap between ambitious job seekers and forward-thinking recruiters using transparent AI skill scoring, automated resume extraction, and real-time gap analysis.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md hover:shadow-lg transition"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                to="/jobs"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition"
              >
                Browse Open Roles
              </Link>
            </>
          ) : (
            <Link
              to={
                user?.role === 'CANDIDATE'
                  ? '/candidate/dashboard'
                  : user?.role === 'RECRUITER'
                  ? '/recruiter/dashboard'
                  : '/admin/dashboard'
              }
              className="inline-flex items-center px-6 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition"
            >
              Go to Your Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          )}
        </div>
      </section>

      {/* Core Features Breakdown */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Why JobMatch AI?</h2>
          <p className="mt-2 text-slate-600">Tailored experiences built for both candidates and recruiters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Automated Resume Parser</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Upload your PDF resume and let our PyMuPDF extraction engine parse your technical skills, work history, and qualifications instantly.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Explainable AI Scoring</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Transparent weighted match percentages that reveal exactly which skills matched and which skills you can learn to stand out.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Ranked Talent Funnel</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Recruiters instantly see applicants ranked by matching score, minimizing review fatigue and accelerating the hiring lifecycle.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

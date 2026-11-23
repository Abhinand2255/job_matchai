import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import {
  Briefcase,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  FileText,
  Building2,
  ShieldCheck,
  Search,
  Bell,
  Bookmark,
  Settings,
  Users,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      axiosClient
        .get('/notifications/unread-count/')
        .then((res) => setUnreadCount(res.data.count || 0))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (user?.role === 'CANDIDATE') return '/candidate/dashboard';
    if (user?.role === 'RECRUITER') return '/recruiter/dashboard';
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    return '/';
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 font-bold text-xl tracking-tight">
              <div className="bg-gradient-to-tr from-slate-900 to-blue-700 text-white p-2 rounded-xl shadow-sm">
                <Briefcase className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-slate-900 font-extrabold text-lg">
                JobMatch <span className="text-blue-700">AI</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex lg:ml-8 lg:space-x-1">
              <Link
                to="/jobs"
                className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition"
              >
                <Search className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Find Jobs
              </Link>

              {isAuthenticated && user?.role === 'CANDIDATE' && (
                <>
                  <Link
                    to="/candidate/dashboard"
                    className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Dashboard
                  </Link>
                  <Link
                    to="/candidate/applications"
                    className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition"
                  >
                    Applications
                  </Link>
                  <Link
                    to="/candidate/saved-jobs"
                    className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition"
                  >
                    <Bookmark className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Saved
                  </Link>
                  <Link
                    to="/candidate/resume"
                    className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Resume AI
                  </Link>
                  <Link
                    to="/candidate/profile"
                    className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition"
                  >
                    <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Profile
                  </Link>
                </>
              )}

              {isAuthenticated && user?.role === 'RECRUITER' && (
                <>
                  <Link
                    to="/recruiter/dashboard"
                    className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Dashboard
                  </Link>
                  <Link
                    to="/recruiter/post-job"
                    className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition"
                  >
                    Post Job
                  </Link>
                  <Link
                    to="/recruiter/jobs"
                    className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition"
                  >
                    Manage Postings
                  </Link>
                  <Link
                    to="/recruiter/company"
                    className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition"
                  >
                    <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Company
                  </Link>
                </>
              )}

              {isAuthenticated && user?.role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-600" />
                    Admin Overview
                  </Link>
                  <Link
                    to="/admin/users"
                    className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition"
                  >
                    <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Users
                  </Link>
                  <Link
                    to="/admin/jobs"
                    className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition"
                  >
                    <Briefcase className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Jobs
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* User Auth Buttons / Profile */}
          <div className="hidden lg:flex lg:items-center lg:space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {/* Notifications Bell */}
                <Link
                  to="/notifications"
                  className="relative p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-xl transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Settings Link */}
                <Link
                  to={user?.role === 'RECRUITER' ? '/recruiter/settings' : '/candidate/settings'}
                  className="p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-xl transition"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </Link>

                {/* User Pill */}
                <Link
                  to={getDashboardPath()}
                  className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs px-3 py-1.5 rounded-full transition"
                >
                  <span className="font-semibold text-slate-700 max-w-[120px] truncate">
                    {user?.first_name || user?.username}
                  </span>
                  <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase text-[10px]">
                    {user?.role}
                  </span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center text-slate-600 hover:text-rose-600 text-xs font-semibold p-2 rounded-lg hover:bg-slate-50 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-slate-700 hover:text-blue-700 px-3 py-2 text-xs font-semibold transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 text-xs font-semibold rounded-xl shadow-sm transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600 hover:text-slate-900 p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 px-4 pt-2 pb-4 space-y-1 bg-white">
          <Link
            to="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Find Jobs
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                Dashboard ({user?.role})
              </Link>
              {user?.role === 'CANDIDATE' && (
                <>
                  <Link
                    to="/candidate/applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    My Applications
                  </Link>
                  <Link
                    to="/candidate/saved-jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Saved Jobs
                  </Link>
                  <Link
                    to="/candidate/resume"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Resume Management
                  </Link>
                  <Link
                    to="/candidate/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Profile & Skills
                  </Link>
                </>
              )}
              {user?.role === 'RECRUITER' && (
                <>
                  <Link
                    to="/recruiter/post-job"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Post a Job
                  </Link>
                  <Link
                    to="/recruiter/jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Manage Postings
                  </Link>
                  <Link
                    to="/recruiter/company"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Company Profile
                  </Link>
                </>
              )}
              {user?.role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Manage Users
                  </Link>
                  <Link
                    to="/admin/jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Moderate Jobs
                  </Link>
                </>
              )}
              <Link
                to="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Notifications {unreadCount > 0 && `(${unreadCount})`}
              </Link>
              <Link
                to={user?.role === 'RECRUITER' ? '/recruiter/settings' : '/candidate/settings'}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left block px-3 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

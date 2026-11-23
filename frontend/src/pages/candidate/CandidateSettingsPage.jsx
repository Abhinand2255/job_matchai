import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  User,
  Mail,
  Shield,
  CheckCircle,
  AlertCircle,
  KeyRound,
  LogOut,
} from 'lucide-react';

export default function CandidateSettingsPage() {
  const { user, logout } = useAuth();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axiosClient.post('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setSuccess(res.data.message || 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your credentials, authentication preferences, and account security.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-700" /> Account Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-slate-50 rounded-xl space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Email Address
            </span>
            <p className="font-semibold text-slate-800 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" /> {user?.email}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Account Role
            </span>
            <p className="font-semibold text-slate-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" /> {user?.role}
            </p>
          </div>
        </div>
      </div>

      {/* Password Change Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-blue-700" /> Change Password
        </h2>

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-2 text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" /> {success}
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center gap-2 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase">
              Current Password
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-sm transition flex items-center gap-2"
          >
            {submitting ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-rose-200 p-6 md:p-8 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-rose-800 flex items-center gap-2">
          <LogOut className="w-5 h-5 text-rose-600" /> Session Management
        </h2>
        <p className="text-sm text-slate-600">
          Want to log out of your current session on this device?
        </p>
        <button
          onClick={logout}
          className="px-5 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold rounded-xl text-sm transition"
        >
          Sign Out of JobMatch AI
        </button>
      </div>
    </div>
  );
}

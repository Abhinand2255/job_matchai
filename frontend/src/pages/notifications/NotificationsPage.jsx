import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Briefcase,
  Users,
  CheckCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';

const NOTIF_ICONS = {
  APPLICATION_SUBMITTED: { icon: Briefcase, color: 'text-blue-600 bg-blue-50 border-blue-100' },
  APPLICATION_SHORTLISTED: { icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  APPLICATION_REJECTED: { icon: XCircle, color: 'text-rose-600 bg-rose-50 border-rose-100' },
  APPLICATION_STATUS_CHANGED: { icon: Sparkles, color: 'text-amber-600 bg-amber-50 border-amber-100' },
  NEW_APPLICANT: { icon: Users, color: 'text-purple-600 bg-purple-50 border-purple-100' },
  JOB_CLOSED: { icon: AlertCircle, color: 'text-slate-600 bg-slate-50 border-slate-200' },
  GENERAL: { icon: Bell, color: 'text-blue-600 bg-blue-50 border-blue-100' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterUnread, setFilterUnread] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = () => {
    setLoading(true);
    const params = filterUnread ? { unread: 'true' } : {};
    axiosClient
      .get('/notifications/', { params })
      .then((res) => {
        setNotifications(res.data.results || res.data || []);
      })
      .catch(() => setError('Failed to load notifications.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, [filterUnread]);

  const handleMarkRead = async (notifId) => {
    try {
      await axiosClient.post(`/notifications/${notifId}/read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
    } catch {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await axiosClient.post('/notifications/read-all/');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      alert('Failed to mark all as read.');
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Bell className="w-7 h-7 text-blue-700" /> Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Stay updated with application milestones, recruiter decisions, and new opportunities.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll || unreadCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilterUnread(false)}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            !filterUnread ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Notifications
        </button>
        <button
          onClick={() => setFilterUnread(true)}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
            filterUnread ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Unread
          {unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
          <Bell className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800">No Notifications</h3>
          <p className="text-sm text-slate-500">
            {filterUnread ? 'You have no unread notifications.' : "You're all caught up!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const config = NOTIF_ICONS[n.notification_type] || NOTIF_ICONS.GENERAL;
            const Icon = config.icon;

            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
                className={`bg-white rounded-2xl border p-5 shadow-2xs hover:shadow-md transition flex items-start gap-4 cursor-pointer ${
                  n.is_read
                    ? 'border-slate-200 opacity-80'
                    : 'border-blue-200 bg-blue-50/20'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${config.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-sm ${n.is_read ? 'font-semibold text-slate-800' : 'font-extrabold text-slate-900'}`}>
                      {n.title}
                    </h3>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 flex-shrink-0">
                      <Calendar className="w-3 h-3" />
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                </div>

                {!n.is_read && (
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0 mt-1.5"
                    title="Unread"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

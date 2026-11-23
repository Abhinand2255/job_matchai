import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Shield,
  AlertCircle,
  Power,
  ChevronLeft,
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    const params = {};
    if (roleFilter) params.role = roleFilter;
    if (search.trim()) params.search = search.trim();

    axiosClient
      .get('/admin/users/', { params })
      .then((res) => {
        setUsers(res.data.results || res.data || []);
      })
      .catch(() => setError('Failed to load user accounts.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleActive = async (userId) => {
    setTogglingId(userId);
    try {
      const res = await axiosClient.patch(`/admin/users/${userId}/toggle-active/`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: res.data.is_active } : u))
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update account status.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-2"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review registered candidate and recruiter accounts, toggle activation, and moderate access.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Role Tabs */}
        <div className="flex gap-2 w-full md:w-auto">
          {[
            { id: '', label: 'All Users' },
            { id: 'CANDIDATE', label: 'Candidates' },
            { id: 'RECRUITER', label: 'Recruiters' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                roleFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-72">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center space-y-2 text-slate-500 text-sm">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">No users found</p>
            <p className="text-xs">Try adjusting your search criteria or role filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">User Account</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Joined Date</th>
                  <th className="py-3 px-6">Account Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{u.name || u.username}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          u.role === 'RECRUITER'
                            ? 'bg-purple-100 text-purple-700'
                            : u.role === 'ADMIN'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(u.date_joined).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-xs font-semibold inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                          u.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            u.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleActive(u.id)}
                          disabled={togglingId === u.id}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${
                            u.is_active
                              ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Building2, Globe, MapPin, Users, Save, CheckCircle2, AlertCircle } from 'lucide-react';

const CompanyProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [company, setCompany] = useState({
    name: '',
    website: '',
    industry: '',
    company_size: '11-50',
    location: '',
    description: '',
  });
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchRecruiterProfile();
  }, []);

  const fetchRecruiterProfile = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/recruiters/profile/me/');
      setProfile(res.data);
      setJobTitle(res.data.job_title || '');
      setPhone(res.data.phone || '');
      if (res.data.company) {
        setCompany(res.data.company);
      }
    } catch (err) {
      setErrorMsg('Failed to load company profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let companyId = company.id;

      if (companyId) {
        // Update existing company
        const res = await axiosClient.patch(`/recruiters/companies/${companyId}/`, company);
        setCompany(res.data);
      } else {
        // Create new company
        const res = await axiosClient.post('/recruiters/companies/', company);
        companyId = res.data.id;
        setCompany(res.data);
      }

      // Update recruiter profile details
      await axiosClient.patch('/recruiters/profile/me/', {
        job_title: jobTitle,
        phone: phone,
        company_id: companyId,
      });

      setSuccessMsg('Company & Recruiter profile saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to save company information.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {successMsg && (
        <div className="flex items-center bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl shadow-xs space-x-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl shadow-xs space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span className="text-sm font-medium">{errorMsg}</span>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <Building2 className="w-6 h-6 mr-2 text-indigo-600" />
            Company & Recruiter Profile
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Configure your organization details so candidates can learn about your company culture and mission.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Company Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Technologies"
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Website
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={company.website}
                  onChange={(e) => setCompany({ ...company, website: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Industry / Domain
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fintech, Healthcare"
                  value={company.industry}
                  onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Size
                </label>
                <select
                  value={company.company_size}
                  onChange={(e) => setCompany({ ...company, company_size: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Headquarters Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Austin, TX / Remote"
                  value={company.location}
                  onChange={(e) => setCompany({ ...company, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Overview & Culture
              </label>
              <textarea
                rows="4"
                placeholder="Tell candidates what makes your team unique..."
                value={company.description}
                onChange={(e) => setCompany({ ...company, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Your Recruiter Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Job Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Technical Recruiter"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="+1 555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfilePage;

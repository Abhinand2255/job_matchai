import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  Users,
  Briefcase,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

const JobApplicantsPage = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchJobAndApplicants();
  }, [jobId]);

  const fetchJobAndApplicants = async () => {
    try {
      setLoading(true);
      const [jobRes, appRes] = await Promise.all([
        axiosClient.get(`/jobs/${jobId}/`),
        axiosClient.get(`/jobs/${jobId}/applicants/`),
      ]);
      setJob(jobRes.data);
      setApplicants(appRes.data);
    } catch (err) {
      setErrorMsg('Failed to load applicants for this job.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await axiosClient.patch(`/jobs/applications/${appId}/status/`, {
        status: newStatus,
      });
      setApplicants(
        applicants.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      setActionSuccess(`Applicant status changed to ${newStatus}.`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      alert('Failed to update applicant status.');
    }
  };

  const getScoreBadgeClass = (score) => {
    const num = parseFloat(score);
    if (num >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (num >= 60) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (num >= 40) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/recruiter/jobs"
        className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to All Postings
      </Link>

      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Applicants Funnel
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">{job?.title}</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {job?.company?.name} • {job?.location} • {applicants.length} Total Candidates Applied
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="flex items-center bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl shadow-xs space-x-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span className="text-sm font-medium">{actionSuccess}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl shadow-xs space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span className="text-sm font-medium">{errorMsg}</span>
        </div>
      )}

      {applicants.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Applicants Yet</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Candidates haven't submitted applications for this position yet. As soon as candidates apply, our AI matching engine will rank them here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map((app, index) => {
            const candidate = app.candidate;
            const userObj = candidate?.user;
            const score = parseFloat(app.match_score);

            return (
              <div
                key={app.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  {/* Candidate Overview */}
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                      #{index + 1}
                    </div>

                    <div>
                      <div className="flex items-center space-x-3">
                        <h2 className="text-lg font-bold text-slate-900">
                          {userObj?.first_name ? `${userObj.first_name} ${userObj.last_name}` : userObj?.username}
                        </h2>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1 ${getScoreBadgeClass(
                            score
                          )}`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {score.toFixed(1)}% Match
                        </span>
                      </div>
                      <p className="text-xs text-indigo-600 font-medium mt-0.5">
                        {candidate?.headline || 'No headline set'}
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        {userObj?.email} {candidate?.phone && `• ${candidate.phone}`} • Applied {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center space-x-2 self-end md:self-auto">
                    <span
                      className={`text-[11px] uppercase font-bold px-3 py-1 rounded-full ${
                        app.status === 'SHORTLISTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : app.status === 'UNDER_REVIEW'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {app.status.replace('_', ' ')}
                    </span>

                    <button
                      onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                      className="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                      title="Shortlist Candidate"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Shortlist
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                      className="inline-flex items-center px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition"
                      title="Reject"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Reject
                    </button>
                  </div>
                </div>

                {/* AI Match Breakdown Badges */}
                {app.match_breakdown && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-700">Matched Skills:</span>
                      {app.match_breakdown.matched_skills && app.match_breakdown.matched_skills.length > 0 ? (
                        app.match_breakdown.matched_skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-medium"
                          >
                            ✓ {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">None matched</span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-700">Missing Skills:</span>
                      {app.match_breakdown.missing_skills && app.match_breakdown.missing_skills.length > 0 ? (
                        app.match_breakdown.missing_skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md font-medium"
                          >
                            ✗ {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-emerald-600 font-semibold">All required skills matched!</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Resume Download / Cover Letter */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  {app.cover_letter ? (
                    <p className="text-slate-600 italic truncate max-w-lg">
                      "{app.cover_letter}"
                    </p>
                  ) : (
                    <span className="text-slate-400">No cover letter submitted.</span>
                  )}

                  {app.resume?.file && (
                    <a
                      href={app.resume.file}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      <FileText className="w-3.5 h-3.5 mr-1" />
                      Download Resume (PDF) <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobApplicantsPage;

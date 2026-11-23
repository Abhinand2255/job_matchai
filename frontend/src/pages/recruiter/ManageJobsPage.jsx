import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  Briefcase,
  Users,
  MapPin,
  Calendar,
  Edit3,
  Trash2,
  Plus,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

const ManageJobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/jobs/my-postings/');
      setJobs(res.data);
    } catch (err) {
      setErrorMsg('Failed to load job postings.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This cannot be undone.')) {
      return;
    }

    try {
      await axiosClient.delete(`/jobs/${jobId}/`);
      setJobs(jobs.filter((j) => j.id !== jobId));
    } catch (err) {
      alert('Failed to delete job posting.');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <Briefcase className="w-6 h-6 mr-2 text-indigo-600" />
            Manage Job Postings
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Review your active postings, inspect candidate matches, and review talent funnels.
          </p>
        </div>

        <Link
          to="/recruiter/post-job"
          className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Post a New Job
        </Link>
      </div>

      {errorMsg && (
        <div className="flex items-center bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl shadow-xs space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span className="text-sm font-medium">{errorMsg}</span>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Job Postings Yet</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            You haven't posted any jobs yet. Create your first opening with weighted skill requirements to start receiving AI-ranked applicants!
          </p>
          <Link
            to="/recruiter/post-job"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm"
          >
            Create Job Posting
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-bold text-slate-900">{job.title}</h2>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      job.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : job.status === 'DRAFT'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {job.location}
                  </span>
                  <span>•</span>
                  <span>{job.job_type.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>{job.experience_level}</span>
                  {job.min_salary && (
                    <>
                      <span>•</span>
                      <span>
                        ${Number(job.min_salary).toLocaleString()} - ${Number(job.max_salary).toLocaleString()}
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>

                {job.required_skills && job.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.required_skills.slice(0, 5).map((rs) => (
                      <span
                        key={rs.id}
                        className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                      >
                        {rs.skill.name} (wt: {rs.weight})
                      </span>
                    ))}
                    {job.required_skills.length > 5 && (
                      <span className="text-[11px] text-slate-400 self-center">
                        +{job.required_skills.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-3 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-0 border-slate-100">
                <Link
                  to={`/recruiter/jobs/${job.id}/applicants`}
                  className="inline-flex items-center px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition"
                >
                  <Users className="w-4 h-4 mr-1.5" />
                  View Applicants ({job.applications_count || 0})
                </Link>

                <Link
                  to={`/recruiter/edit-job/${job.id}`}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                  title="Edit Job"
                >
                  <Edit3 className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => handleDeleteJob(job.id)}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Delete Job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageJobsPage;

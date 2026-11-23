import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import {
  UploadCloud,
  FileText,
  Trash2,
  Download,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Check,
  Calendar,
  HardDrive,
} from 'lucide-react';

export default function ResumeManagementPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [autoAddSkills, setAutoAddSkills] = useState(true);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  const fetchResumes = () => {
    setLoading(true);
    axiosClient
      .get('/candidates/resumes/')
      .then((res) => {
        const list = res.data.results || res.data || [];
        setResumes(list);
      })
      .catch(() => setError('Failed to load resumes.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF resumes are supported.');
        setFile(null);
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        setError('File size must not exceed 5MB.');
        setFile(null);
        return;
      }
      setError('');
      setFile(selected);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError('');
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('auto_add_skills', autoAddSkills);

    try {
      const res = await axiosClient.post('/candidates/resumes/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult(res.data);
      setFile(null);
      fetchResumes();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload resume.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await axiosClient.delete(`/candidates/resumes/${resumeId}/`);
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
    } catch {
      alert('Failed to delete resume.');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Resume Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload your PDF resume to unlock automatic skill extraction and improve AI job matching accuracy.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900">Upload New Resume</h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center transition bg-slate-50/50">
            <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">
              {file ? file.name : 'Choose a PDF file or drag & drop here'}
            </p>
            <p className="text-xs text-slate-400 mt-1">PDF format up to 5MB</p>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="mt-4 block mx-auto text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoAddSkills}
                onChange={(e) => setAutoAddSkills(e.target.checked)}
                className="w-4 h-4 rounded text-blue-700 focus:ring-blue-600 border-slate-300"
              />
              Automatically add extracted skills to my profile
            </label>

            <button
              type="submit"
              disabled={!file || uploading}
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white rounded-xl text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Extracting skills...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Upload & Parse with AI
                </>
              )}
            </button>
          </div>
        </form>

        {/* Upload Success & AI Extraction Results */}
        {uploadResult && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-blue-900 font-bold">
              <CheckCircle className="w-5 h-5 text-blue-700" />
              <span>Resume processed! Found {uploadResult.extracted_skills_count} skills</span>
            </div>

            {uploadResult.matched_skills && uploadResult.matched_skills.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Extracted Technical Skills:</p>
                <div className="flex flex-wrap gap-1.5">
                  {uploadResult.matched_skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="bg-white border border-blue-200 text-blue-800 text-xs px-2.5 py-1 rounded-lg font-medium shadow-2xs"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {uploadResult.auto_added_to_profile > 0 && (
              <p className="text-xs text-blue-700">
                ✨ {uploadResult.auto_added_to_profile} new skills were automatically saved to your profile!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Resumes List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Your Resumes ({resumes.length})</h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            No resumes uploaded yet. Upload one above to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900">{r.filename}</h3>
                        {r.is_primary && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            Primary Resume
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3.5 h-3.5" /> {formatFileSize(r.file_size)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Uploaded {new Date(r.uploaded_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {r.file && (
                      <a
                        href={r.file}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-xl transition"
                        title="Download / View Resume"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Extracted Skills Chips */}
                {r.extracted_skills && r.extracted_skills.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 mb-2">
                      Extracted Skills ({r.extracted_skills.length}):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {r.extracted_skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-md font-medium"
                        >
                          {typeof s === 'string' ? s : s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

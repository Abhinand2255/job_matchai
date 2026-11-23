import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public & Auth Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateProfilePage from './pages/candidate/CandidateProfilePage';
import JobSearchPage from './pages/candidate/JobSearchPage';
import JobDetailPage from './pages/candidate/JobDetailPage';
import MyApplicationsPage from './pages/candidate/MyApplicationsPage';
import SavedJobsPage from './pages/candidate/SavedJobsPage';
import ResumeManagementPage from './pages/candidate/ResumeManagementPage';
import CandidateSettingsPage from './pages/candidate/CandidateSettingsPage';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import CompanyProfilePage from './pages/recruiter/CompanyProfilePage';
import PostJobPage from './pages/recruiter/PostJobPage';
import ManageJobsPage from './pages/recruiter/ManageJobsPage';
import JobApplicantsPage from './pages/recruiter/JobApplicantsPage';
import RecruiterSettingsPage from './pages/recruiter/RecruiterSettingsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminJobsPage from './pages/admin/AdminJobsPage';

// Shared Authenticated Pages
import NotificationsPage from './pages/notifications/NotificationsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jobs" element={<JobSearchPage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />

              {/* Candidate Protected Routes */}
              <Route
                path="/candidate/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['CANDIDATE']}>
                    <CandidateDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/profile"
                element={
                  <ProtectedRoute allowedRoles={['CANDIDATE']}>
                    <CandidateProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/jobs"
                element={
                  <ProtectedRoute allowedRoles={['CANDIDATE']}>
                    <JobSearchPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/jobs/:id"
                element={
                  <ProtectedRoute allowedRoles={['CANDIDATE']}>
                    <JobDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/applications"
                element={
                  <ProtectedRoute allowedRoles={['CANDIDATE']}>
                    <MyApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/saved-jobs"
                element={
                  <ProtectedRoute allowedRoles={['CANDIDATE']}>
                    <SavedJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/resume"
                element={
                  <ProtectedRoute allowedRoles={['CANDIDATE']}>
                    <ResumeManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/settings"
                element={
                  <ProtectedRoute allowedRoles={['CANDIDATE']}>
                    <CandidateSettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Recruiter Protected Routes */}
              <Route
                path="/recruiter/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER']}>
                    <RecruiterDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/company"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER']}>
                    <CompanyProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/post-job"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER']}>
                    <PostJobPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/edit-job/:id"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER']}>
                    <PostJobPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER']}>
                    <ManageJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/:jobId/applicants"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER']}>
                    <JobApplicantsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/settings"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER']}>
                    <RecruiterSettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/jobs"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminJobsPage />
                  </ProtectedRoute>
                }
              />

              {/* Shared Authenticated Routes */}
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute allowedRoles={['CANDIDATE', 'RECRUITER', 'ADMIN']}>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

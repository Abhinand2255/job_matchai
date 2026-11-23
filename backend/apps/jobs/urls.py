from django.urls import path
from .views import (
    JobPostListCreateView,
    JobPostDetailView,
    JobDetailWithMatchView,
    RecruiterJobsListView,
    RecruiterJobApplicantsView,
    RecruiterApplicationStatusUpdateView,
    JobMatchPreviewView,
    ApplyToJobView,
    WithdrawApplicationView,
    CandidateApplicationsListView,
    SavedJobsListView,
    ToggleSaveJobView,
)

urlpatterns = [
    path('', JobPostListCreateView.as_view(), name='job_list_create'),
    path('saved/', SavedJobsListView.as_view(), name='saved_jobs_list'),
    path('my-postings/', RecruiterJobsListView.as_view(), name='recruiter_job_postings'),
    path('my-applications/', CandidateApplicationsListView.as_view(), name='candidate_applications'),
    path('<int:pk>/', JobPostDetailView.as_view(), name='job_detail'),
    path('<int:pk>/detail/', JobDetailWithMatchView.as_view(), name='job_detail_with_match'),
    path('<int:pk>/match-preview/', JobMatchPreviewView.as_view(), name='job_match_preview'),
    path('<int:pk>/apply/', ApplyToJobView.as_view(), name='job_apply'),
    path('<int:pk>/save/', ToggleSaveJobView.as_view(), name='job_toggle_save'),
    path('<int:job_id>/applicants/', RecruiterJobApplicantsView.as_view(), name='job_applicants'),
    path('applications/<int:pk>/status/', RecruiterApplicationStatusUpdateView.as_view(), name='update_application_status'),
    path('applications/<int:pk>/withdraw/', WithdrawApplicationView.as_view(), name='withdraw_application'),
]

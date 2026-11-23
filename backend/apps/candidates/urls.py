from django.urls import path
from .views import (
    SkillListCreateView,
    CandidateProfileView,
    CandidateSkillListCreateView,
    CandidateSkillDetailView,
    CandidateEducationListCreateView,
    CandidateEducationDetailView,
    CandidateExperienceListCreateView,
    CandidateExperienceDetailView,
    ResumeUploadView,
    ResumeListView,
    ResumeDetailView,
    CandidatePublicDetailView,
)
from jobs.views import CandidateApplicationsListView

urlpatterns = [
    path('skills/catalog/', SkillListCreateView.as_view(), name='skill_catalog'),
    path('profile/me/', CandidateProfileView.as_view(), name='candidate_profile_me'),
    path('skills/', CandidateSkillListCreateView.as_view(), name='candidate_skills'),
    path('skills/<int:pk>/', CandidateSkillDetailView.as_view(), name='candidate_skill_detail'),
    path('education/', CandidateEducationListCreateView.as_view(), name='candidate_education'),
    path('education/<int:pk>/', CandidateEducationDetailView.as_view(), name='candidate_education_detail'),
    path('experience/', CandidateExperienceListCreateView.as_view(), name='candidate_experience'),
    path('experience/<int:pk>/', CandidateExperienceDetailView.as_view(), name='candidate_experience_detail'),
    path('resumes/', ResumeListView.as_view(), name='resume_list'),
    path('resumes/upload/', ResumeUploadView.as_view(), name='resume_upload'),
    path('resumes/<int:pk>/', ResumeDetailView.as_view(), name='resume_detail'),
    path('applications/', CandidateApplicationsListView.as_view(), name='candidate_applications'),
    path('<int:pk>/', CandidatePublicDetailView.as_view(), name='candidate_public_detail'),
]

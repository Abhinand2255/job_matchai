from django.urls import path
from .views import (
    CandidateDashboardStatsView,
    RecruiterDashboardStatsView,
    AdminDashboardStatsView,
)

urlpatterns = [
    path('candidate/', CandidateDashboardStatsView.as_view(), name='analytics_candidate'),
    path('recruiter/', RecruiterDashboardStatsView.as_view(), name='analytics_recruiter'),
    path('admin/', AdminDashboardStatsView.as_view(), name='analytics_admin'),
]

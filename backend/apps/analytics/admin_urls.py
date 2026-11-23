from django.urls import path
from .views import (
    AdminUsersListView,
    AdminUserToggleActiveView,
    AdminJobsListView,
    AdminJobToggleStatusView,
    AdminJobDeleteView,
)

urlpatterns = [
    path('users/', AdminUsersListView.as_view(), name='admin_users_list'),
    path('users/<int:pk>/toggle-active/', AdminUserToggleActiveView.as_view(), name='admin_user_toggle_active'),
    path('jobs/', AdminJobsListView.as_view(), name='admin_jobs_list'),
    path('jobs/<int:pk>/toggle-status/', AdminJobToggleStatusView.as_view(), name='admin_job_toggle_status'),
    path('jobs/<int:pk>/', AdminJobDeleteView.as_view(), name='admin_job_delete'),
]

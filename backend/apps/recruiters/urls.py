from django.urls import path
from .views import (
    CompanyListCreateView,
    CompanyDetailView,
    RecruiterProfileView,
)

urlpatterns = [
    path('companies/', CompanyListCreateView.as_view(), name='company_list_create'),
    path('companies/<int:pk>/', CompanyDetailView.as_view(), name='company_detail'),
    path('profile/me/', RecruiterProfileView.as_view(), name='recruiter_profile_me'),
]

from rest_framework import generics, permissions
from django.db.models import Q
from accounts.permissions import IsRecruiter
from .models import Company, RecruiterProfile
from .serializers import CompanySerializer, RecruiterProfileSerializer


class CompanyListCreateView(generics.ListCreateAPIView):
    """
    GET /api/recruiters/companies/
    POST /api/recruiters/companies/
    List all companies or register a new company.
    """
    serializer_class = CompanySerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        queryset = Company.objects.all()
        search = self.request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(industry__icontains=search))
        return queryset

    def perform_create(self, serializer):
        company = serializer.save()
        # Automatically associate newly registered company to current recruiter profile
        if self.request.user.is_recruiter:
            profile, _ = RecruiterProfile.objects.get_or_create(user=self.request.user)
            profile.company = company
            profile.save()


class CompanyDetailView(generics.RetrieveUpdateAPIView):
    """
    GET/PUT/PATCH /api/recruiters/companies/<int:pk>/
    """
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = (permissions.IsAuthenticated,)


class RecruiterProfileView(generics.RetrieveUpdateAPIView):
    """
    GET /api/recruiters/profile/me/
    PATCH /api/recruiters/profile/me/
    """
    serializer_class = RecruiterProfileSerializer
    permission_classes = (IsRecruiter,)

    def get_object(self):
        profile, _ = RecruiterProfile.objects.get_or_create(user=self.request.user)
        return profile

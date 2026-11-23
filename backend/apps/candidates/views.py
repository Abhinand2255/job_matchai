from rest_framework import generics, viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.db.models import Q

from accounts.permissions import IsCandidate
from .models import (
    Skill,
    CandidateProfile,
    CandidateSkill,
    Education,
    Experience,
    Resume,
)
from .serializers import (
    SkillSerializer,
    CandidateProfileSerializer,
    CandidateSkillSerializer,
    EducationSerializer,
    ExperienceSerializer,
    ResumeSerializer,
)
from matching.resume_parser import extract_text_from_pdf, extract_skills_from_text


class SkillListCreateView(generics.ListCreateAPIView):
    """
    GET /api/candidates/skills/catalog/
    Returns list of all recognized skills, searchable with ?search=python
    """
    serializer_class = SkillSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        queryset = Skill.objects.all()
        search = self.request.query_params.get('search', '').strip()
        category = self.request.query_params.get('category', '').strip()

        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(aliases__icontains=search))
        if category:
            queryset = queryset.filter(category=category)
        return queryset


class CandidateProfileView(generics.RetrieveUpdateAPIView):
    """
    GET /api/candidates/profile/me/
    PATCH /api/candidates/profile/me/
    Retrieve or update the authenticated candidate's profile.
    """
    serializer_class = CandidateProfileSerializer
    permission_classes = (IsCandidate,)

    def get_object(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return profile


class CandidateSkillListCreateView(generics.ListCreateAPIView):
    """
    GET /api/candidates/skills/
    POST /api/candidates/skills/
    List or add skills to candidate's profile.
    """
    serializer_class = CandidateSkillSerializer
    permission_classes = (IsCandidate,)

    def get_queryset(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return profile.skills.all()

    def perform_create(self, serializer):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)


class CandidateSkillDetailView(generics.DestroyAPIView):
    """
    DELETE /api/candidates/skills/<int:pk>/
    Remove a skill from candidate's profile.
    """
    serializer_class = CandidateSkillSerializer
    permission_classes = (IsCandidate,)

    def get_queryset(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return profile.skills.all()


class CandidateEducationListCreateView(generics.ListCreateAPIView):
    """
    GET /api/candidates/education/
    POST /api/candidates/education/
    """
    serializer_class = EducationSerializer
    permission_classes = (IsCandidate,)

    def get_queryset(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return profile.education.all()

    def perform_create(self, serializer):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)


class CandidateEducationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PUT/PATCH/DELETE /api/candidates/education/<int:pk>/
    """
    serializer_class = EducationSerializer
    permission_classes = (IsCandidate,)

    def get_queryset(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return profile.education.all()


class CandidateExperienceListCreateView(generics.ListCreateAPIView):
    """
    GET /api/candidates/experience/
    POST /api/candidates/experience/
    """
    serializer_class = ExperienceSerializer
    permission_classes = (IsCandidate,)

    def get_queryset(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return profile.experience.all()

    def perform_create(self, serializer):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)


class CandidateExperienceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PUT/PATCH/DELETE /api/candidates/experience/<int:pk>/
    """
    serializer_class = ExperienceSerializer
    permission_classes = (IsCandidate,)

    def get_queryset(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return profile.experience.all()


class ResumeUploadView(APIView):
    """
    POST /api/candidates/resumes/upload/
    Uploads a PDF resume, parses text via PyMuPDF, extracts skills automatically,
    and returns parsed results.
    """
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = (IsCandidate,)

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file was provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file extension
        if not file_obj.name.lower().endswith('.pdf'):
            return Response({'error': 'Only PDF files are supported.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file size (max 5MB)
        if file_obj.size > 5 * 1024 * 1024:
            return Response({'error': 'File size must not exceed 5MB.'}, status=status.HTTP_400_BAD_REQUEST)

        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)

        # Extract text via PyMuPDF
        extracted_text = extract_text_from_pdf(file_obj)

        # Match recognized skills from database
        all_skills = list(Skill.objects.all())
        matched_skills = extract_skills_from_text(extracted_text, all_skills)

        # Demote previous primary resumes
        Resume.objects.filter(profile=profile).update(is_primary=False)

        resume = Resume.objects.create(
            profile=profile,
            file=file_obj,
            filename=file_obj.name,
            file_size=file_obj.size,
            extracted_text=extracted_text,
            extracted_skills=matched_skills,
            is_primary=True,
        )

        # Automatically associate newly discovered skills to candidate profile
        auto_add = request.data.get('auto_add_skills', 'true').lower() == 'true'
        added_skills_count = 0
        if auto_add and matched_skills:
            for s in matched_skills:
                skill_obj = Skill.objects.filter(id=s['id']).first()
                if skill_obj:
                    _, created = CandidateSkill.objects.get_or_create(
                        profile=profile,
                        skill=skill_obj,
                        defaults={'proficiency': 'INTERMEDIATE', 'years_of_experience': 1.0}
                    )
                    if created:
                        added_skills_count += 1

        return Response({
            'message': 'Resume successfully uploaded and processed with AI extractor.',
            'resume': ResumeSerializer(resume).data,
            'extracted_skills_count': len(matched_skills),
            'matched_skills': matched_skills,
            'auto_added_to_profile': added_skills_count,
        }, status=status.HTTP_201_CREATED)


class CandidatePublicDetailView(generics.RetrieveAPIView):
    """
    GET /api/candidates/<int:pk>/
    View a candidate profile (accessible to Recruiters and Admins).
    """
    queryset = CandidateProfile.objects.all()
    serializer_class = CandidateProfileSerializer
    permission_classes = (permissions.IsAuthenticated,)


class ResumeListView(generics.ListAPIView):
    """
    GET /api/candidates/resumes/
    List all resumes for the authenticated candidate.
    """
    serializer_class = ResumeSerializer
    permission_classes = (IsCandidate,)

    def get_queryset(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return profile.resumes.all()


class ResumeDetailView(generics.RetrieveDestroyAPIView):
    """
    GET/DELETE /api/candidates/resumes/<int:pk>/
    """
    serializer_class = ResumeSerializer
    permission_classes = (IsCandidate,)

    def get_queryset(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return profile.resumes.all()


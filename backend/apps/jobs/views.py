from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.core.paginator import Paginator

from accounts.permissions import IsRecruiter, IsCandidate
from candidates.models import CandidateProfile, Resume
from matching.matcher import calculate_job_match
from .models import JobPost, JobRequiredSkill, JobApplication, JobStatus, ApplicationStatus, SavedJob
from .serializers import (
    JobPostSerializer,
    JobApplicationSerializer,
    ApplicationStatusUpdateSerializer,
    SavedJobSerializer,
)


class JobPostListCreateView(generics.ListCreateAPIView):
    """
    GET /api/jobs/ (Public / Candidate search)
    POST /api/jobs/ (Recruiter create new job posting)
    """
    serializer_class = JobPostSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsRecruiter()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = JobPost.objects.filter(status=JobStatus.ACTIVE).select_related('company', 'recruiter')

        search = self.request.query_params.get('search', '').strip()
        location = self.request.query_params.get('location', '').strip()
        job_type = self.request.query_params.get('job_type', '').strip()
        experience_level = self.request.query_params.get('experience_level', '').strip()
        skill = self.request.query_params.get('skill', '').strip()

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(company__name__icontains=search)
            )
        if location:
            queryset = queryset.filter(location__icontains=location)
        if job_type:
            queryset = queryset.filter(job_type=job_type)
        if experience_level:
            queryset = queryset.filter(experience_level=experience_level)
        if skill:
            queryset = queryset.filter(required_skills__skill__name__icontains=skill).distinct()

        return queryset


class JobPostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/jobs/<int:pk>/
    PUT/PATCH /api/jobs/<int:pk>/ (Recruiter only)
    DELETE /api/jobs/<int:pk>/ (Recruiter only)
    """
    queryset = JobPost.objects.all().select_related('company', 'recruiter')
    serializer_class = JobPostSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsRecruiter()]
        return [permissions.AllowAny()]

    def perform_destroy(self, instance):
        # Only the owner recruiter or admin can delete
        if instance.recruiter != self.request.user and not self.request.user.is_admin_role:
            self.permission_denied(self.request, message="You do not own this job posting.")
        instance.delete()


class JobDetailWithMatchView(APIView):
    """
    GET /api/jobs/<int:pk>/detail/
    Public endpoint that returns full job data.
    If the authenticated user is a candidate, also returns match_preview.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        job = get_object_or_404(
            JobPost.objects.select_related('company', 'recruiter').prefetch_related('required_skills__skill'),
            id=pk
        )
        serializer = JobPostSerializer(job, context={'request': request})
        data = serializer.data

        # Include match preview for authenticated candidates
        if request.user and request.user.is_authenticated and hasattr(request.user, 'is_candidate') and request.user.is_candidate:
            try:
                profile = CandidateProfile.objects.get(user=request.user)
                match_result = calculate_job_match(profile, job)
                data['match_preview'] = {
                    'match_percentage': match_result['match_score'],
                    'matched_skills': match_result['matched_skills'],
                    'missing_skills': match_result['missing_skills'],
                    'mandatory_met': match_result.get('mandatory_met', True),
                }
            except CandidateProfile.DoesNotExist:
                data['match_preview'] = None

        return Response(data, status=status.HTTP_200_OK)


class RecruiterJobsListView(generics.ListAPIView):
    """
    GET /api/jobs/my-postings/
    Lists all jobs created by the authenticated recruiter.
    """
    serializer_class = JobPostSerializer
    permission_classes = (IsRecruiter,)

    def get_queryset(self):
        return JobPost.objects.filter(recruiter=self.request.user).order_by('-created_at')


class RecruiterJobApplicantsView(generics.ListAPIView):
    """
    GET /api/jobs/<int:job_id>/applicants/
    Returns all applicants for a given job, ranked by AI match_score descending.
    """
    serializer_class = JobApplicationSerializer
    permission_classes = (IsRecruiter,)

    def get_queryset(self):
        job_id = self.kwargs.get('job_id')
        job = get_object_or_404(JobPost, id=job_id, recruiter=self.request.user)
        return job.applications.select_related('candidate__user', 'resume').order_by('-match_score', '-applied_at')


class RecruiterApplicationStatusUpdateView(generics.UpdateAPIView):
    """
    PATCH /api/jobs/applications/<int:pk>/status/
    Shortlist, reject, or mark applicant under review.
    """
    queryset = JobApplication.objects.all()
    serializer_class = ApplicationStatusUpdateSerializer
    permission_classes = (IsRecruiter,)

    def patch(self, request, *args, **kwargs):
        application = self.get_object()
        # Verify the current recruiter owns this job
        if application.job.recruiter != request.user and not request.user.is_admin_role:
            return Response(
                {'error': 'You do not have permission to manage applicants for this job.'},
                status=status.HTTP_403_FORBIDDEN
            )
        new_status = request.data.get('status')
        if new_status not in ApplicationStatus.values:
            return Response(
                {'error': f"Invalid status. Must be one of {ApplicationStatus.values}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        application.status = new_status
        application.save()

        # Trigger notification for candidate (gracefully skip if notifications app unavailable)
        try:
            from notifications.utils import create_notification
            status_labels = {
                ApplicationStatus.SHORTLISTED: ('Application Shortlisted', 'APPLICATION_SHORTLISTED'),
                ApplicationStatus.REJECTED: ('Application Rejected', 'APPLICATION_REJECTED'),
                ApplicationStatus.UNDER_REVIEW: ('Application Under Review', 'APPLICATION_STATUS_CHANGED'),
                ApplicationStatus.APPLIED: ('Application Status Updated', 'APPLICATION_STATUS_CHANGED'),
            }
            label, notif_type = status_labels.get(new_status, ('Application Status Updated', 'APPLICATION_STATUS_CHANGED'))
            create_notification(
                recipient=application.candidate.user,
                notification_type=notif_type,
                title=label,
                message=f"Your application for {application.job.title} is now {new_status}.",
                related_job_id=application.job.id,
                related_application_id=application.id,
            )
        except Exception:
            pass

        return Response({
            'message': f"Application status updated to {new_status}.",
            'application_id': application.id,
            'status': application.status
        }, status=status.HTTP_200_OK)


class JobMatchPreviewView(APIView):
    """
    GET /api/jobs/<int:pk>/match-preview/
    Returns live matching percentage, matched skills, and missing skills for authenticated candidate.
    """
    permission_classes = (IsCandidate,)

    def get(self, request, pk):
        job = get_object_or_404(JobPost, id=pk)
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        match_result = calculate_job_match(profile, job)
        return Response(match_result, status=status.HTTP_200_OK)


class ApplyToJobView(APIView):
    """
    POST /api/jobs/<int:pk>/apply/
    Allows candidate to apply for a job. Automatically calculates and stores
    AI match score and skills breakdown at the moment of application.
    """
    permission_classes = (IsCandidate,)

    def post(self, request, pk):
        job = get_object_or_404(JobPost, id=pk, status=JobStatus.ACTIVE)

        # Ensure candidate has a profile
        try:
            profile = CandidateProfile.objects.get(user=request.user)
        except CandidateProfile.DoesNotExist:
            return Response(
                {'error': 'You must complete your candidate profile before applying.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Prevent duplicate applications (409 Conflict)
        existing_app = JobApplication.objects.filter(job=job, candidate=profile).first()
        if existing_app:
            return Response(
                {'error': 'You have already applied for this job.'},
                status=status.HTTP_409_CONFLICT
            )

        cover_letter = request.data.get('cover_letter', '').strip()
        resume_id = request.data.get('resume_id')

        if resume_id:
            resume = Resume.objects.filter(id=resume_id, profile=profile).first()
        else:
            resume = profile.resumes.filter(is_primary=True).first()

        # Compute AI match score and breakdown
        match_data = calculate_job_match(profile, job)

        application = JobApplication.objects.create(
            job=job,
            candidate=profile,
            match_score=match_data['match_score'],
            match_breakdown=match_data,
            cover_letter=cover_letter,
            resume=resume,
            status=ApplicationStatus.APPLIED
        )

        # Trigger notifications (gracefully skip if notifications app unavailable)
        try:
            from notifications.utils import create_notification
            candidate_name = request.user.get_full_name() or request.user.username
            # Notify candidate
            create_notification(
                recipient=request.user,
                notification_type='APPLICATION_SUBMITTED',
                title='Application Submitted',
                message=f"Your application to {job.title} has been submitted successfully.",
                related_job_id=job.id,
                related_application_id=application.id,
            )
            # Notify recruiter
            create_notification(
                recipient=job.recruiter,
                notification_type='NEW_APPLICANT',
                title='New Applicant',
                message=f"New applicant for {job.title}: {candidate_name}",
                related_job_id=job.id,
                related_application_id=application.id,
            )
        except Exception:
            pass

        return Response({
            'message': 'Application submitted successfully!',
            'application': JobApplicationSerializer(application, context={'request': request}).data,
            'match_score': match_data['match_score'],
            'matched_skills': match_data['matched_skills'],
            'missing_skills': match_data['missing_skills'],
        }, status=status.HTTP_201_CREATED)


class WithdrawApplicationView(APIView):
    """
    DELETE /api/jobs/applications/<int:pk>/withdraw/
    Candidate can withdraw if status is APPLIED or UNDER_REVIEW.
    Returns 400 if already shortlisted/rejected.
    """
    permission_classes = (IsCandidate,)

    def delete(self, request, pk):
        try:
            profile = CandidateProfile.objects.get(user=request.user)
        except CandidateProfile.DoesNotExist:
            return Response({'error': 'Candidate profile not found.'}, status=status.HTTP_400_BAD_REQUEST)

        application = get_object_or_404(JobApplication, id=pk, candidate=profile)

        if application.status in [ApplicationStatus.SHORTLISTED, ApplicationStatus.REJECTED]:
            return Response(
                {'error': f'Cannot withdraw application with status "{application.status}". Only APPLIED or UNDER_REVIEW applications can be withdrawn.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        application.delete()
        return Response({'message': 'Application withdrawn successfully.'}, status=status.HTTP_200_OK)


class CandidateApplicationsListView(generics.ListAPIView):
    """
    GET /api/jobs/my-applications/
    GET /api/candidates/applications/
    Returns all jobs applied to by the authenticated candidate, with filtering and pagination.
    """
    serializer_class = JobApplicationSerializer
    permission_classes = (IsCandidate,)

    def get_queryset(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        queryset = JobApplication.objects.filter(candidate=profile).select_related(
            'job__company', 'job__recruiter', 'resume'
        ).order_by('-applied_at')

        # Filter by status if provided
        status_filter = self.request.query_params.get('status', '').strip().upper()
        if status_filter and status_filter in ApplicationStatus.values:
            queryset = queryset.filter(status=status_filter)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page_size = 10
        paginator = Paginator(queryset, page_size)
        page_number = request.query_params.get('page', 1)

        try:
            page = paginator.page(page_number)
        except Exception:
            page = paginator.page(1)

        serializer = self.get_serializer(page.object_list, many=True)
        return Response({
            'count': paginator.count,
            'num_pages': paginator.num_pages,
            'current_page': int(page_number),
            'results': serializer.data
        })


class SavedJobsListView(generics.ListAPIView):
    """
    GET /api/jobs/saved/
    Lists all jobs saved by the authenticated candidate.
    """
    serializer_class = SavedJobSerializer
    permission_classes = (IsCandidate,)

    def get_queryset(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return SavedJob.objects.filter(candidate=profile).select_related('job__company', 'job__recruiter')


class ToggleSaveJobView(APIView):
    """
    POST /api/jobs/<int:pk>/save/
    Toggles save/unsave on a job for the authenticated candidate.
    """
    permission_classes = (IsCandidate,)

    def post(self, request, pk):
        job = get_object_or_404(JobPost, id=pk)
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        saved_obj = SavedJob.objects.filter(candidate=profile, job=job).first()
        if saved_obj:
            saved_obj.delete()
            return Response({'saved': False, 'message': 'Job removed from saved list.'}, status=status.HTTP_200_OK)
        else:
            SavedJob.objects.create(candidate=profile, job=job)
            return Response({'saved': True, 'message': 'Job saved successfully.'}, status=status.HTTP_201_CREATED)


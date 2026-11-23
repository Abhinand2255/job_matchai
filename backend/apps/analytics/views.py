from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status, generics
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Avg, Q
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from accounts.permissions import IsCandidate, IsRecruiter, IsAdmin
from candidates.models import CandidateProfile, Skill, CandidateSkill, Resume
from jobs.models import JobPost, JobApplication, JobRequiredSkill, JobStatus, ApplicationStatus
from matching.matcher import calculate_job_match

User = get_user_model()


class CandidateDashboardStatsView(APIView):
    """
    GET /api/analytics/candidate/
    Returns full metrics, completion score, recent apps, and recommended jobs for candidate dashboard.
    """
    permission_classes = (IsCandidate,)

    def get(self, request):
        user = request.user
        profile, _ = CandidateProfile.objects.get_or_create(user=user)

        # Profile completion calculation
        checkpoints = [
            bool(user.first_name or user.last_name or user.username),
            bool(user.email),
            bool(profile.phone or user.phone),
            bool(profile.headline),
            bool(profile.bio),
            bool(profile.location),
            bool(profile.linkedin_url),
            bool(profile.github_url),
            profile.skills.exists(),
            profile.education.exists(),
            profile.experience.exists(),
            profile.resumes.exists(),
        ]
        completion_score = int(round((sum(1 for c in checkpoints if c) / len(checkpoints)) * 100))

        # Application metrics
        apps = profile.applications.all()
        total_applications = apps.count()
        applied_count = apps.filter(status=ApplicationStatus.APPLIED).count()
        under_review_count = apps.filter(status=ApplicationStatus.UNDER_REVIEW).count()
        shortlisted_count = apps.filter(status=ApplicationStatus.SHORTLISTED).count()
        interview_count = apps.filter(status=ApplicationStatus.INTERVIEW).count()
        selected_count = apps.filter(status=ApplicationStatus.SELECTED).count()
        rejected_count = apps.filter(status=ApplicationStatus.REJECTED).count()

        # Recent applications
        recent_apps = apps.select_related('job__company', 'resume').order_by('-applied_at')[:5]
        recent_applications_data = []
        for a in recent_apps:
            logo_url = None
            if a.job.company and a.job.company.logo:
                try:
                    logo_url = request.build_absolute_uri(a.job.company.logo.url)
                except Exception:
                    logo_url = str(a.job.company.logo.url)

            recent_applications_data.append({
                'id': a.id,
                'job_id': a.job.id,
                'job_title': a.job.title,
                'company_name': a.job.company.name if a.job.company else '',
                'company_logo': logo_url,
                'status': a.status,
                'match_score': float(a.match_score),
                'applied_at': a.applied_at.isoformat(),
            })

        # Recommended active jobs candidate hasn't applied to yet
        applied_job_ids = set(apps.values_list('job_id', flat=True))
        candidate_active_jobs = JobPost.objects.filter(
            status=JobStatus.ACTIVE
        ).exclude(id__in=applied_job_ids).select_related('company')[:10]

        recommended_jobs = []
        for job in candidate_active_jobs:
            match_res = calculate_job_match(profile, job)
            logo_url = None
            if job.company and job.company.logo:
                try:
                    logo_url = request.build_absolute_uri(job.company.logo.url)
                except Exception:
                    logo_url = str(job.company.logo.url)

            recommended_jobs.append({
                'id': job.id,
                'title': job.title,
                'company_name': job.company.name if job.company else '',
                'company_logo': logo_url,
                'location': job.location,
                'job_type': job.job_type,
                'experience_level': job.experience_level,
                'min_salary': float(job.min_salary) if job.min_salary else None,
                'max_salary': float(job.max_salary) if job.max_salary else None,
                'match_score': match_res['match_score'],
                'matched_skills': match_res['matched_skills'],
                'missing_skills': match_res['missing_skills'],
            })

        # Sort recommendations by highest match score
        recommended_jobs.sort(key=lambda x: x['match_score'], reverse=True)

        return Response({
            'profile_completion': completion_score,
            'total_applications': total_applications,
            'applied': applied_count,
            'under_review': under_review_count,
            'shortlisted': shortlisted_count,
            'interview': interview_count,
            'selected': selected_count,
            'rejected': rejected_count,
            'total_skills': profile.skills.count(),
            'recent_applications': recent_applications_data,
            'recommended_jobs': recommended_jobs[:5],
        }, status=status.HTTP_200_OK)


class RecruiterDashboardStatsView(APIView):
    """
    GET /api/analytics/recruiter/
    Returns recruiter metrics, job stats, recent applicants, and application breakdown.
    """
    permission_classes = (IsRecruiter,)

    def get(self, request):
        user = request.user
        jobs = JobPost.objects.filter(recruiter=user)
        total_jobs = jobs.count()
        active_jobs = jobs.filter(status=JobStatus.ACTIVE).count()

        # All applications across recruiter's jobs
        apps = JobApplication.objects.filter(job__in=jobs)
        total_applicants = apps.count()
        pending_applicants = apps.filter(status__in=[ApplicationStatus.APPLIED, ApplicationStatus.UNDER_REVIEW]).count()
        shortlisted = apps.filter(status=ApplicationStatus.SHORTLISTED).count()
        interview = apps.filter(status=ApplicationStatus.INTERVIEW).count()
        selected = apps.filter(status=ApplicationStatus.SELECTED).count()
        rejected = apps.filter(status=ApplicationStatus.REJECTED).count()

        # Recent applications
        recent_apps = apps.select_related('candidate__user', 'job').order_by('-applied_at')[:6]
        recent_applications_data = []
        for a in recent_apps:
            name = a.candidate.user.get_full_name() or a.candidate.user.username
            recent_applications_data.append({
                'id': a.id,
                'candidate_id': a.candidate.id,
                'candidate_name': name,
                'candidate_headline': a.candidate.headline,
                'job_id': a.job.id,
                'job_title': a.job.title,
                'match_score': float(a.match_score),
                'status': a.status,
                'applied_at': a.applied_at.isoformat(),
            })

        # Top jobs by applicant count
        top_jobs_qs = jobs.annotate(
            applicant_count=Count('applications'),
            avg_match_score=Avg('applications__match_score')
        ).order_by('-applicant_count')[:5]

        top_jobs_data = []
        for j in top_jobs_qs:
            top_jobs_data.append({
                'id': j.id,
                'title': j.title,
                'status': j.status,
                'applicant_count': j.applicant_count,
                'avg_match_score': round(float(j.avg_match_score or 0.0), 1),
            })

        # Status breakdown for charts
        status_breakdown = [
            {'name': 'Applied', 'count': apps.filter(status=ApplicationStatus.APPLIED).count(), 'color': '#3b82f6'},
            {'name': 'Under Review', 'count': apps.filter(status=ApplicationStatus.UNDER_REVIEW).count(), 'color': '#f59e0b'},
            {'name': 'Shortlisted', 'count': shortlisted, 'color': '#10b981'},
            {'name': 'Interview', 'count': interview, 'color': '#8b5cf6'},
            {'name': 'Selected', 'count': selected, 'color': '#06b6d4'},
            {'name': 'Rejected', 'count': rejected, 'color': '#ef4444'},
        ]

        return Response({
            'total_jobs': total_jobs,
            'active_jobs': active_jobs,
            'total_applicants': total_applicants,
            'pending_applicants': pending_applicants,
            'shortlisted': shortlisted,
            'interview': interview,
            'selected': selected,
            'rejected': rejected,
            'recent_applications': recent_applications_data,
            'top_jobs': top_jobs_data,
            'application_status_breakdown': status_breakdown,
        }, status=status.HTTP_200_OK)


class AdminDashboardStatsView(APIView):
    """
    GET /api/analytics/admin/
    Returns platform-wide metrics, trends, top skills, and recent user signups.
    """
    permission_classes = (IsAdmin,)

    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        total_users = User.objects.count()
        total_candidates = User.objects.filter(role='CANDIDATE').count()
        total_recruiters = User.objects.filter(role='RECRUITER').count()
        total_jobs = JobPost.objects.count()
        active_jobs = JobPost.objects.filter(status=JobStatus.ACTIVE).count()
        total_applications = JobApplication.objects.count()

        registrations_last_30_days = User.objects.filter(date_joined__gte=thirty_days_ago).count()
        jobs_last_30_days = JobPost.objects.filter(created_at__gte=thirty_days_ago).count()

        # Top in-demand skills from job requirements
        top_skills_qs = JobRequiredSkill.objects.values('skill__name').annotate(
            count=Count('id')
        ).order_by('-count')[:8]

        top_skills = [
            {'name': s['skill__name'], 'count': s['count']}
            for s in top_skills_qs if s['skill__name']
        ]

        # Application status breakdown
        status_breakdown = [
            {'name': 'Applied', 'count': JobApplication.objects.filter(status=ApplicationStatus.APPLIED).count(), 'color': '#3b82f6'},
            {'name': 'Under Review', 'count': JobApplication.objects.filter(status=ApplicationStatus.UNDER_REVIEW).count(), 'color': '#f59e0b'},
            {'name': 'Shortlisted', 'count': JobApplication.objects.filter(status=ApplicationStatus.SHORTLISTED).count(), 'color': '#10b981'},
            {'name': 'Interview', 'count': JobApplication.objects.filter(status=ApplicationStatus.INTERVIEW).count(), 'color': '#8b5cf6'},
            {'name': 'Selected', 'count': JobApplication.objects.filter(status=ApplicationStatus.SELECTED).count(), 'color': '#06b6d4'},
            {'name': 'Rejected', 'count': JobApplication.objects.filter(status=ApplicationStatus.REJECTED).count(), 'color': '#ef4444'},
        ]

        # Recent 8 registered users
        recent_users_qs = User.objects.order_by('-date_joined')[:8]
        recent_users = [
            {
                'id': u.id,
                'email': u.email,
                'username': u.username,
                'name': u.get_full_name() or u.username,
                'role': u.role,
                'is_active': u.is_active,
                'date_joined': u.date_joined.isoformat(),
            }
            for u in recent_users_qs
        ]

        return Response({
            'total_users': total_users,
            'total_candidates': total_candidates,
            'total_recruiters': total_recruiters,
            'total_jobs': total_jobs,
            'active_jobs': active_jobs,
            'total_applications': total_applications,
            'registrations_last_30_days': registrations_last_30_days,
            'jobs_last_30_days': jobs_last_30_days,
            'top_skills': top_skills,
            'application_status_breakdown': status_breakdown,
            'recent_users': recent_users,
        }, status=status.HTTP_200_OK)


class AdminUsersListView(APIView):
    """
    GET /api/admin/users/
    List users with filtering by role and email/name search.
    """
    permission_classes = (IsAdmin,)

    def get(self, request):
        qs = User.objects.all().order_by('-date_joined')
        role = request.query_params.get('role', '').strip().upper()
        search = request.query_params.get('search', '').strip()

        if role:
            qs = qs.filter(role=role)
        if search:
            qs = qs.filter(
                Q(email__icontains=search) |
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )

        data = [
            {
                'id': u.id,
                'email': u.email,
                'username': u.username,
                'name': u.get_full_name() or u.username,
                'role': u.role,
                'is_active': u.is_active,
                'date_joined': u.date_joined.isoformat(),
            }
            for u in qs[:100]
        ]
        return Response({'count': qs.count(), 'results': data}, status=status.HTTP_200_OK)


class AdminUserToggleActiveView(APIView):
    """
    PATCH /api/admin/users/<int:pk>/toggle-active/
    Toggles a user's active status (activate / deactivate).
    """
    permission_classes = (IsAdmin,)

    def patch(self, request, pk):
        user = get_object_or_404(User, id=pk)
        if user == request.user:
            return Response({'error': 'You cannot deactivate your own admin account.'}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])
        state = 'activated' if user.is_active else 'deactivated'
        return Response({'message': f'User {user.email} has been {state}.', 'is_active': user.is_active}, status=status.HTTP_200_OK)


class AdminJobsListView(APIView):
    """
    GET /api/admin/jobs/
    List all jobs for administration with moderation controls.
    """
    permission_classes = (IsAdmin,)

    def get(self, request):
        qs = JobPost.objects.select_related('company', 'recruiter').order_by('-created_at')
        job_status = request.query_params.get('status', '').strip().upper()
        search = request.query_params.get('search', '').strip()

        if job_status:
            qs = qs.filter(status=job_status)
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(company__name__icontains=search) |
                Q(recruiter__email__icontains=search)
            )

        data = [
            {
                'id': j.id,
                'title': j.title,
                'company_name': j.company.name if j.company else '',
                'recruiter_email': j.recruiter.email if j.recruiter else '',
                'status': j.status,
                'job_type': j.job_type,
                'location': j.location,
                'applicant_count': j.applications.count(),
                'created_at': j.created_at.isoformat(),
            }
            for j in qs[:100]
        ]
        return Response({'count': qs.count(), 'results': data}, status=status.HTTP_200_OK)


class AdminJobToggleStatusView(APIView):
    """
    PATCH /api/admin/jobs/<int:pk>/toggle-status/
    Toggles job between ACTIVE and CLOSED.
    """
    permission_classes = (IsAdmin,)

    def patch(self, request, pk):
        job = get_object_or_404(JobPost, id=pk)
        if job.status == JobStatus.ACTIVE:
            job.status = JobStatus.CLOSED
        else:
            job.status = JobStatus.ACTIVE
        job.save(update_fields=['status'])
        return Response({'message': f'Job status updated to {job.status}.', 'status': job.status}, status=status.HTTP_200_OK)


class AdminJobDeleteView(APIView):
    """
    DELETE /api/admin/jobs/<int:pk>/
    Permanently deletes a job posting.
    """
    permission_classes = (IsAdmin,)

    def delete(self, request, pk):
        job = get_object_or_404(JobPost, id=pk)
        title = job.title
        job.delete()
        return Response({'message': f'Job "{title}" has been deleted.'}, status=status.HTTP_200_OK)

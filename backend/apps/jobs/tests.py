from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from accounts.models import User, UserRole
from candidates.models import Skill, SkillCategory, CandidateProfile, CandidateSkill
from recruiters.models import Company, RecruiterProfile
from .models import JobPost, JobRequiredSkill, JobApplication, JobStatus, ApplicationStatus


class RecruiterAndJobsModuleTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create Recruiter
        self.recruiter_user = User.objects.create_user(
            username='recruiter_sarah',
            email='sarah@techcorp.io',
            password='Password123!',
            role=UserRole.RECRUITER,
            first_name='Sarah',
            last_name='Connor'
        )
        self.company = Company.objects.create(
            name='TechCorp Innovations',
            website='https://techcorp.io',
            location='San Francisco, CA',
            industry='Cloud Computing'
        )
        self.recruiter_profile = RecruiterProfile.objects.create(
            user=self.recruiter_user,
            company=self.company,
            job_title='Principal Recruiter'
        )

        # Create Candidate
        self.candidate_user = User.objects.create_user(
            username='dev_bob',
            email='bob@dev.io',
            password='Password123!',
            role=UserRole.CANDIDATE
        )
        self.candidate_profile = CandidateProfile.objects.create(
            user=self.candidate_user,
            headline='Software Engineer'
        )

        # Skills
        self.skill_python = Skill.objects.create(name='Python', category=SkillCategory.BACKEND)
        self.skill_django = Skill.objects.create(name='Django', category=SkillCategory.BACKEND)
        self.skill_docker = Skill.objects.create(name='Docker', category=SkillCategory.CLOUD_DEVOPS)

    def test_recruiter_creates_job_post_with_skills(self):
        self.client.force_authenticate(user=self.recruiter_user)
        url = reverse('job_list_create')

        payload = {
            'title': 'Senior Backend Engineer (Python/Django)',
            'description': 'We are looking for a senior backend engineer to architect our REST APIs.',
            'job_type': 'FULL_TIME',
            'experience_level': 'SENIOR',
            'location': 'Remote',
            'min_salary': 120000,
            'max_salary': 150000,
            'required_skills': [
                {'skill_id': self.skill_python.id, 'weight': 5, 'is_mandatory': True},
                {'skill_id': self.skill_django.id, 'weight': 4, 'is_mandatory': True},
                {'skill_id': self.skill_docker.id, 'weight': 2, 'is_mandatory': False},
            ]
        }

        res = self.client.post(url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['title'], 'Senior Backend Engineer (Python/Django)')
        self.assertEqual(res.data['company']['name'], 'TechCorp Innovations')
        self.assertEqual(len(res.data['required_skills']), 3)

    def test_candidate_cannot_post_job(self):
        self.client.force_authenticate(user=self.candidate_user)
        url = reverse('job_list_create')
        res = self.client.post(url, {'title': 'Hacker Job'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_public_job_search(self):
        # Create active job
        job = JobPost.objects.create(
            recruiter=self.recruiter_user,
            company=self.company,
            title='Full Stack React & Django Dev',
            description='Exciting full-stack position with modern web tech.',
            job_type='FULL_TIME',
            location='New York, NY',
            status=JobStatus.ACTIVE
        )
        JobRequiredSkill.objects.create(job=job, skill=self.skill_django, weight=4)

        # Unauthenticated client searches for django jobs
        unauth_client = APIClient()
        res = unauth_client.get(reverse('job_list_create') + '?search=React')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

    def test_recruiter_status_update_for_applicant(self):
        job = JobPost.objects.create(
            recruiter=self.recruiter_user,
            company=self.company,
            title='Lead Architect',
            description='Architecture role',
            status=JobStatus.ACTIVE
        )
        application = JobApplication.objects.create(
            job=job,
            candidate=self.candidate_profile,
            match_score=88.50,
            status=ApplicationStatus.APPLIED
        )

        self.client.force_authenticate(user=self.recruiter_user)
        update_url = reverse('update_application_status', kwargs={'pk': application.id})
        res = self.client.patch(update_url, {'status': ApplicationStatus.SHORTLISTED}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['status'], ApplicationStatus.SHORTLISTED)

        application.refresh_from_db()
        self.assertEqual(application.status, ApplicationStatus.SHORTLISTED)

    def test_ai_matching_and_application_flow(self):
        # Add Python and Django to candidate's skills
        CandidateSkill.objects.create(profile=self.candidate_profile, skill=self.skill_python, proficiency='ADVANCED')
        CandidateSkill.objects.create(profile=self.candidate_profile, skill=self.skill_django, proficiency='EXPERT')

        # Create job requiring Python (5), Django (4), Docker (2) -> total weight 11, candidate has 9 -> ~81.82%
        job = JobPost.objects.create(
            recruiter=self.recruiter_user,
            company=self.company,
            title='Python Full Stack',
            description='Building Python and Django cloud apps with Docker.',
            status=JobStatus.ACTIVE
        )
        JobRequiredSkill.objects.create(job=job, skill=self.skill_python, weight=5, is_mandatory=True)
        JobRequiredSkill.objects.create(job=job, skill=self.skill_django, weight=4, is_mandatory=True)
        JobRequiredSkill.objects.create(job=job, skill=self.skill_docker, weight=2, is_mandatory=False)

        # 1. Candidate tests live match preview
        self.client.force_authenticate(user=self.candidate_user)
        preview_url = reverse('job_match_preview', kwargs={'pk': job.id})
        preview_res = self.client.get(preview_url)
        self.assertEqual(preview_res.status_code, status.HTTP_200_OK)
        self.assertIn('Python', preview_res.data['matched_skills'])
        self.assertIn('Django', preview_res.data['matched_skills'])
        self.assertIn('Docker', preview_res.data['missing_skills'])
        self.assertAlmostEqual(preview_res.data['skill_score'], 81.82, delta=0.5)

        # 2. Candidate applies for the job
        apply_url = reverse('job_apply', kwargs={'pk': job.id})
        apply_res = self.client.post(apply_url, {
            'cover_letter': 'I am passionate about Python and Django development!'
        }, format='json')
        self.assertEqual(apply_res.status_code, status.HTTP_201_CREATED)
        self.assertIn('match_score', apply_res.data)
        self.assertEqual(apply_res.data['application']['status'], 'APPLIED')

        # 3. Duplicate application prevention
        dup_res = self.client.post(apply_url, {}, format='json')
        self.assertIn(dup_res.status_code, [status.HTTP_400_BAD_REQUEST, status.HTTP_409_CONFLICT])

        # 4. Candidate views their application in /api/jobs/my-applications/
        my_apps_res = self.client.get(reverse('candidate_applications'))
        self.assertEqual(my_apps_res.status_code, status.HTTP_200_OK)
        results = my_apps_res.data.get('results', my_apps_res.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['job']['title'], 'Python Full Stack')

        # 5. Toggle Save Job
        save_url = reverse('job_toggle_save', kwargs={'pk': job.id})
        save_res = self.client.post(save_url)
        self.assertEqual(save_res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(save_res.data['saved'])

        saved_list_res = self.client.get(reverse('saved_jobs_list'))
        self.assertEqual(saved_list_res.status_code, status.HTTP_200_OK)
        saved_items = saved_list_res.data.get('results', saved_list_res.data)
        self.assertEqual(len(saved_items), 1)

        # Unsave job
        unsave_res = self.client.post(save_url)
        self.assertEqual(unsave_res.status_code, status.HTTP_200_OK)
        self.assertFalse(unsave_res.data['saved'])



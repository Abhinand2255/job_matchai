import io
import pymupdf
from django.test import TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status

from accounts.models import User, UserRole
from .models import Skill, SkillCategory, CandidateProfile, CandidateSkill


class CandidateModuleTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='candidatetest',
            email='candidate@test.com',
            password='Password123!',
            role=UserRole.CANDIDATE,
            first_name='Alex',
            last_name='Taylor'
        )
        self.client.force_authenticate(user=self.user)

        # Seed test skills
        self.skill_python = Skill.objects.create(name='Python', category=SkillCategory.BACKEND, aliases='py')
        self.skill_django = Skill.objects.create(name='Django', category=SkillCategory.BACKEND, aliases='drf')
        self.skill_react = Skill.objects.create(name='React', category=SkillCategory.FRONTEND, aliases='reactjs')
        self.skill_docker = Skill.objects.create(name='Docker', category=SkillCategory.CLOUD_DEVOPS)

    def test_candidate_profile_retrieval_and_update(self):
        url = reverse('candidate_profile_me')
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['user']['email'], 'candidate@test.com')

        # Update headline and bio
        update_res = self.client.patch(url, {
            'headline': 'Full Stack Django & React Specialist',
            'location': 'New York, USA',
            'experience_years': 4.5
        }, format='json')
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)
        self.assertEqual(update_res.data['headline'], 'Full Stack Django & React Specialist')

    def test_candidate_add_skill(self):
        url = reverse('candidate_skills')
        res = self.client.post(url, {
            'skill_id': self.skill_python.id,
            'proficiency': 'ADVANCED',
            'years_of_experience': 3.0
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['skill']['name'], 'Python')

    def test_resume_upload_and_pymupdf_extraction(self):
        # Dynamically create a real in-memory PDF using PyMuPDF
        doc = pymupdf.open()
        page = doc.new_page()
        resume_text = (
            "Alex Taylor - Senior Full Stack Engineer\n"
            "Summary: Experienced software engineer building scalable web applications.\n"
            "Core Technologies: Expert in Python and Django backends. Skilled in React frontend "
            "and Docker containerization."
        )
        page.insert_text((50, 72), resume_text, fontsize=11)
        pdf_bytes = doc.tobytes()
        doc.close()

        pdf_file = SimpleUploadedFile(
            "alex_taylor_resume.pdf",
            pdf_bytes,
            content_type="application/pdf"
        )

        upload_url = reverse('resume_upload')
        res = self.client.post(
            upload_url,
            {'file': pdf_file, 'auto_add_skills': 'true'},
            format='multipart'
        )

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('matched_skills', res.data)
        
        # Verify PyMuPDF extracted text and matched skills
        matched_names = [s['name'] for s in res.data['matched_skills']]
        self.assertIn('Python', matched_names)
        self.assertIn('Django', matched_names)
        self.assertIn('React', matched_names)
        self.assertIn('Docker', matched_names)

        # Verify skills were automatically added to candidate's profile
        profile = CandidateProfile.objects.get(user=self.user)
        candidate_skill_names = [cs.skill.name for cs in profile.skills.all()]
        self.assertIn('Python', candidate_skill_names)
        self.assertIn('Django', candidate_skill_names)

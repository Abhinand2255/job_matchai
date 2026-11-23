from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, UserRole


class AccountsAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.candidate_data = {
            'username': 'john_doe',
            'email': 'john@example.com',
            'password': 'SecurePassword123!',
            'confirm_password': 'SecurePassword123!',
            'role': UserRole.CANDIDATE,
            'first_name': 'John',
            'last_name': 'Doe',
            'phone': '1234567890'
        }
        self.recruiter_data = {
            'username': 'jane_recruiter',
            'email': 'jane@techcorp.com',
            'password': 'RecruiterPass123!',
            'confirm_password': 'RecruiterPass123!',
            'role': UserRole.RECRUITER,
            'first_name': 'Jane',
            'last_name': 'Smith'
        }

    def test_candidate_registration(self):
        response = self.client.post(reverse('auth_register'), self.candidate_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertEqual(response.data['user']['role'], UserRole.CANDIDATE)
        self.assertTrue(User.objects.filter(email='john@example.com').exists())

    def test_registration_password_mismatch(self):
        bad_data = self.candidate_data.copy()
        bad_data['confirm_password'] = 'WrongPassword!'
        bad_data['email'] = 'bad@example.com'
        bad_data['username'] = 'bad_user'
        response = self.client.post(reverse('auth_register'), bad_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_and_token_generation(self):
        # Register user first
        self.client.post(reverse('auth_register'), self.candidate_data, format='json')

        # Login with email
        login_response = self.client.post(reverse('auth_login'), {
            'username': 'john@example.com',
            'password': 'SecurePassword123!'
        }, format='json')
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_response.data)
        self.assertEqual(login_response.data['user']['role'], UserRole.CANDIDATE)

        # Test authenticated /me endpoint
        token = login_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        profile_response = self.client.get(reverse('current_user'))
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data['email'], 'john@example.com')

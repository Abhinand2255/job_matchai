from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from notifications.models import Notification, NotificationTypes
from notifications.utils import create_notification

User = get_user_model()


class NotificationAPITests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            email='alice@example.com',
            username='alice',
            password='Password123!',
            role='CANDIDATE'
        )
        self.user2 = User.objects.create_user(
            email='bob@example.com',
            username='bob',
            password='Password123!',
            role='RECRUITER'
        )

        self.notif1 = create_notification(
            recipient=self.user1,
            notification_type=NotificationTypes.APPLICATION_SUBMITTED,
            title='Application Sent',
            message='Your application was submitted.'
        )
        self.notif2 = create_notification(
            recipient=self.user1,
            notification_type=NotificationTypes.APPLICATION_SHORTLISTED,
            title='Shortlisted!',
            message='You have been shortlisted.'
        )
        self.notif3 = create_notification(
            recipient=self.user2,
            notification_type=NotificationTypes.NEW_APPLICANT,
            title='New Applicant',
            message='Alice applied for your job.'
        )

    def test_list_own_notifications(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only see user1's 2 notifications, not user2's
        self.assertEqual(len(response.data.get('results', [])), 2)

    def test_unread_count(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/notifications/unread-count/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('count'), 2)

    def test_mark_single_as_read(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(f'/api/notifications/{self.notif1.id}/read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notif1.refresh_from_db()
        self.assertTrue(self.notif1.is_read)

    def test_mark_all_read(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post('/api/notifications/read-all/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Notification.objects.filter(recipient=self.user1, is_read=False).count(), 0)

    def test_user_cannot_read_another_users_notification(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(f'/api/notifications/{self.notif3.id}/read/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

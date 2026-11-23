from django.db import models
from django.conf import settings


class NotificationTypes(models.TextChoices):
    APPLICATION_SUBMITTED = 'APPLICATION_SUBMITTED', 'Application Submitted'
    APPLICATION_SHORTLISTED = 'APPLICATION_SHORTLISTED', 'Application Shortlisted'
    APPLICATION_REJECTED = 'APPLICATION_REJECTED', 'Application Rejected'
    APPLICATION_STATUS_CHANGED = 'APPLICATION_STATUS_CHANGED', 'Application Status Changed'
    NEW_APPLICANT = 'NEW_APPLICANT', 'New Applicant'
    JOB_CLOSED = 'JOB_CLOSED', 'Job Closed'
    INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED', 'Interview Scheduled'
    GENERAL = 'GENERAL', 'General'


class Notification(models.Model):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=50,
        choices=NotificationTypes.choices,
        default=NotificationTypes.GENERAL
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    related_job_id = models.IntegerField(null=True, blank=True)
    related_application_id = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.recipient.email} - {self.title}"

from django.db import models
from django.conf import settings


class Company(models.Model):
    name = models.CharField(max_length=200, unique=True)
    website = models.URLField(blank=True, default='')
    industry = models.CharField(max_length=100, blank=True, default='')
    company_size = models.CharField(
        max_length=50,
        blank=True,
        default='11-50',
        help_text="e.g. 1-10, 11-50, 51-200, 201-500, 500+"
    )
    location = models.CharField(max_length=150, blank=True, default='')
    description = models.TextField(blank=True, default='')
    logo = models.FileField(upload_to='companies/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Companies'
        ordering = ['name']

    def __str__(self):
        return self.name


class RecruiterProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recruiter_profile'
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recruiters'
    )
    job_title = models.CharField(max_length=150, blank=True, default='Talent Acquisition')
    phone = models.CharField(max_length=30, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        comp = self.company.name if self.company else 'No Company'
        return f"{self.user.username} ({comp})"

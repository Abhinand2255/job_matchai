from django.contrib.auth.models import AbstractUser
from django.db import models


class UserRole(models.TextChoices):
    CANDIDATE = 'CANDIDATE', 'Candidate'
    RECRUITER = 'RECRUITER', 'Recruiter'
    ADMIN = 'ADMIN', 'Admin'


class User(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.CANDIDATE
    )
    phone = models.CharField(max_length=20, blank=True, null=True)

    # Let users login with either email or username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def is_candidate(self):
        return self.role == UserRole.CANDIDATE

    @property
    def is_recruiter(self):
        return self.role == UserRole.RECRUITER

    @property
    def is_admin_role(self):
        return self.role == UserRole.ADMIN or self.is_superuser

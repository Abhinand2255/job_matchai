from django.db import models
from django.conf import settings


class SkillCategory(models.TextChoices):
    FRONTEND = 'FRONTEND', 'Frontend'
    BACKEND = 'BACKEND', 'Backend'
    DATABASE = 'DATABASE', 'Database'
    CLOUD_DEVOPS = 'CLOUD_DEVOPS', 'Cloud & DevOps'
    AI_ML = 'AI_ML', 'AI & Machine Learning'
    MOBILE = 'MOBILE', 'Mobile Development'
    TESTING = 'TESTING', 'Testing & QA'
    OTHER = 'OTHER', 'Other'


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(
        max_length=30,
        choices=SkillCategory.choices,
        default=SkillCategory.OTHER
    )
    aliases = models.CharField(
        max_length=255,
        blank=True,
        help_text="Comma-separated synonyms or aliases for matching, e.g. 'js,javascript,es6'"
    )

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class ProficiencyLevel(models.TextChoices):
    BEGINNER = 'BEGINNER', 'Beginner'
    INTERMEDIATE = 'INTERMEDIATE', 'Intermediate'
    ADVANCED = 'ADVANCED', 'Advanced'
    EXPERT = 'EXPERT', 'Expert'


class CandidateProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='candidate_profile'
    )
    headline = models.CharField(max_length=200, blank=True, default='')
    bio = models.TextField(blank=True, default='')
    location = models.CharField(max_length=150, blank=True, default='')
    phone = models.CharField(max_length=30, blank=True, default='')
    github_url = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    portfolio_url = models.URLField(blank=True, null=True)
    experience_years = models.DecimalField(max_digits=4, decimal_places=1, default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} Profile"


class CandidateSkill(models.Model):
    profile = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='skills'
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name='candidate_skills'
    )
    proficiency = models.CharField(
        max_length=20,
        choices=ProficiencyLevel.choices,
        default=ProficiencyLevel.INTERMEDIATE
    )
    years_of_experience = models.DecimalField(max_digits=4, decimal_places=1, default=1.0)

    class Meta:
        unique_together = ('profile', 'skill')

    def __str__(self):
        return f"{self.profile.user.username} - {self.skill.name} ({self.proficiency})"


class Education(models.Model):
    profile = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='education'
    )
    institution = models.CharField(max_length=200)
    degree = models.CharField(max_length=150)
    field_of_study = models.CharField(max_length=150)
    start_year = models.IntegerField()
    end_year = models.IntegerField(null=True, blank=True)
    grade = models.CharField(max_length=50, blank=True, default='')

    class Meta:
        ordering = ['-start_year']

    def __str__(self):
        return f"{self.degree} in {self.field_of_study} at {self.institution}"


class Experience(models.Model):
    profile = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='experience'
    )
    company_name = models.CharField(max_length=200)
    job_title = models.CharField(max_length=150)
    location = models.CharField(max_length=150, blank=True, default='')
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.job_title} at {self.company_name}"


class Resume(models.Model):
    profile = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='resumes'
    )
    file = models.FileField(upload_to='resumes/')
    filename = models.CharField(max_length=255)
    file_size = models.IntegerField(help_text="Size in bytes")
    extracted_text = models.TextField(blank=True, default='')
    extracted_skills = models.JSONField(default=list, blank=True)
    is_primary = models.BooleanField(default=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.filename} ({self.profile.user.username})"

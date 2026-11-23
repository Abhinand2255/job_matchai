from django.db import models
from django.conf import settings


class JobType(models.TextChoices):
    FULL_TIME = 'FULL_TIME', 'Full-Time'
    PART_TIME = 'PART_TIME', 'Part-Time'
    CONTRACT = 'CONTRACT', 'Contract'
    REMOTE = 'REMOTE', 'Remote'
    INTERNSHIP = 'INTERNSHIP', 'Internship'


class ExperienceLevel(models.TextChoices):
    ENTRY = 'ENTRY', 'Entry Level'
    MID = 'MID', 'Mid Level'
    SENIOR = 'SENIOR', 'Senior Level'
    LEAD = 'LEAD', 'Lead / Staff'
    EXECUTIVE = 'EXECUTIVE', 'Director / Executive'


class JobStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'Active'
    CLOSED = 'CLOSED', 'Closed'
    DRAFT = 'DRAFT', 'Draft'


class ApplicationStatus(models.TextChoices):
    APPLIED = 'APPLIED', 'Applied'
    UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
    SHORTLISTED = 'SHORTLISTED', 'Shortlisted'
    INTERVIEW = 'INTERVIEW', 'Interview'
    SELECTED = 'SELECTED', 'Selected'
    REJECTED = 'REJECTED', 'Rejected'
    WITHDRAWN = 'WITHDRAWN', 'Withdrawn'


class JobPost(models.Model):
    recruiter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posted_jobs'
    )
    company = models.ForeignKey(
        'recruiters.Company',
        on_delete=models.CASCADE,
        related_name='job_posts'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    job_type = models.CharField(
        max_length=30,
        choices=JobType.choices,
        default=JobType.FULL_TIME
    )
    experience_level = models.CharField(
        max_length=30,
        choices=ExperienceLevel.choices,
        default=ExperienceLevel.MID
    )
    location = models.CharField(max_length=150, default='Remote')
    min_salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    max_salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=JobStatus.choices,
        default=JobStatus.ACTIVE
    )
    deadline = models.DateField(null=True, blank=True, help_text="Application deadline")
    vacancies = models.IntegerField(default=1, help_text="Number of open positions")
    responsibilities = models.TextField(blank=True, default='', help_text="Key responsibilities")
    requirements = models.TextField(blank=True, default='', help_text="Requirements / qualifications")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} at {self.company.name}"


class JobRequiredSkill(models.Model):
    job = models.ForeignKey(
        JobPost,
        on_delete=models.CASCADE,
        related_name='required_skills'
    )
    skill = models.ForeignKey(
        'candidates.Skill',
        on_delete=models.CASCADE,
        related_name='job_requirements'
    )
    weight = models.PositiveSmallIntegerField(
        default=3,
        help_text="Importance weight from 1 (Nice-to-have) to 5 (Crucial)"
    )
    is_mandatory = models.BooleanField(
        default=False,
        help_text="If True, missing this skill significantly impacts eligibility"
    )

    class Meta:
        unique_together = ('job', 'skill')

    def __str__(self):
        return f"{self.job.title} - {self.skill.name} (wt: {self.weight})"


class JobApplication(models.Model):
    job = models.ForeignKey(
        JobPost,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    candidate = models.ForeignKey(
        'candidates.CandidateProfile',
        on_delete=models.CASCADE,
        related_name='applications'
    )
    match_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.0,
        help_text="Overall AI Match percentage score (0-100)"
    )
    match_breakdown = models.JSONField(
        default=dict,
        blank=True,
        help_text="Breakdown containing matched skills, missing skills, and score formula"
    )
    cover_letter = models.TextField(blank=True, default='')
    resume = models.ForeignKey(
        'candidates.Resume',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='job_applications'
    )
    status = models.CharField(
        max_length=30,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.APPLIED
    )
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('job', 'candidate')
        ordering = ['-match_score', '-applied_at']

    def __str__(self):
        return f"{self.candidate.user.get_full_name() or self.candidate.user.username} -> {self.job.title} ({self.match_score}%)"


class SavedJob(models.Model):
    candidate = models.ForeignKey(
        'candidates.CandidateProfile',
        on_delete=models.CASCADE,
        related_name='saved_jobs'
    )
    job = models.ForeignKey(
        JobPost,
        on_delete=models.CASCADE,
        related_name='saved_by'
    )
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('candidate', 'job')
        ordering = ['-saved_at']

    def __str__(self):
        return f"{self.candidate.user.username} saved {self.job.title}"


from django.contrib import admin
from .models import JobPost, JobRequiredSkill, JobApplication, SavedJob


class JobRequiredSkillInline(admin.TabularInline):
    model = JobRequiredSkill
    extra = 1


@admin.register(JobPost)
class JobPostAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'company', 'recruiter', 'job_type', 'experience_level', 'status', 'created_at')
    list_filter = ('status', 'job_type', 'experience_level', 'created_at')
    search_fields = ('title', 'description', 'company__name', 'recruiter__email')
    inlines = [JobRequiredSkillInline]


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('id', 'candidate', 'job', 'match_score', 'status', 'applied_at')
    list_filter = ('status', 'applied_at')
    search_fields = ('candidate__user__email', 'job__title')


@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ('id', 'candidate', 'job', 'saved_at')
    search_fields = ('candidate__user__email', 'job__title')

from django.contrib import admin
from .models import Skill, CandidateProfile, CandidateSkill, Education, Experience, Resume


class CandidateSkillInline(admin.TabularInline):
    model = CandidateSkill
    extra = 1


class EducationInline(admin.TabularInline):
    model = Education
    extra = 1


class ExperienceInline(admin.TabularInline):
    model = Experience
    extra = 1


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'aliases')
    list_filter = ('category',)
    search_fields = ('name', 'aliases')


@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'headline', 'location', 'phone', 'experience_years')
    search_fields = ('user__email', 'user__username', 'headline', 'location')
    inlines = [CandidateSkillInline, EducationInline, ExperienceInline]


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ('id', 'profile', 'filename', 'file_size', 'is_primary', 'uploaded_at')
    search_fields = ('profile__user__email', 'filename')

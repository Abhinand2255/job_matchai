from rest_framework import serializers
from .models import (
    Skill,
    CandidateProfile,
    CandidateSkill,
    Education,
    Experience,
    Resume,
    ProficiencyLevel,
)
from accounts.serializers import UserSerializer


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ('id', 'name', 'category', 'aliases')


class CandidateSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    skill_id = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        source='skill',
        write_only=True
    )

    class Meta:
        model = CandidateSkill
        fields = ('id', 'skill', 'skill_id', 'proficiency', 'years_of_experience')


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ('id', 'institution', 'degree', 'field_of_study', 'start_year', 'end_year', 'grade')


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = (
            'id',
            'company_name',
            'job_title',
            'location',
            'start_date',
            'end_date',
            'is_current',
            'description',
        )


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = (
            'id',
            'file',
            'filename',
            'file_size',
            'extracted_skills',
            'is_primary',
            'uploaded_at',
        )
        read_only_fields = ('filename', 'file_size', 'extracted_skills', 'uploaded_at')


class CandidateProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    skills = CandidateSkillSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    experience = ExperienceSerializer(many=True, read_only=True)
    resumes = ResumeSerializer(many=True, read_only=True)

    class Meta:
        model = CandidateProfile
        fields = (
            'id',
            'user',
            'headline',
            'bio',
            'location',
            'phone',
            'github_url',
            'linkedin_url',
            'portfolio_url',
            'experience_years',
            'skills',
            'education',
            'experience',
            'resumes',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')

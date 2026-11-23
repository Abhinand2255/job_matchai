from rest_framework import serializers
from .models import JobPost, JobRequiredSkill, JobApplication, JobStatus, ApplicationStatus, SavedJob
from candidates.models import Skill, CandidateProfile, Resume
from candidates.serializers import SkillSerializer, CandidateProfileSerializer, ResumeSerializer
from recruiters.models import Company, RecruiterProfile
from recruiters.serializers import CompanySerializer
from accounts.serializers import UserSerializer


class JobRequiredSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    skill_id = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        source='skill',
        write_only=True
    )
    skill_name = serializers.SerializerMethodField()

    class Meta:
        model = JobRequiredSkill
        fields = ('id', 'skill', 'skill_id', 'skill_name', 'weight', 'is_mandatory')

    def get_skill_name(self, obj):
        return obj.skill.name


class JobPostSerializer(serializers.ModelSerializer):
    recruiter = UserSerializer(read_only=True)
    company = CompanySerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        source='company',
        write_only=True,
        required=False
    )
    required_skills = JobRequiredSkillSerializer(many=True, required=False)
    applications_count = serializers.SerializerMethodField()

    # Enhanced read fields
    company_name = serializers.SerializerMethodField()
    company_logo = serializers.SerializerMethodField()
    recruiter_name = serializers.SerializerMethodField()
    applicant_count = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = JobPost
        fields = (
            'id',
            'recruiter',
            'company',
            'company_id',
            'company_name',
            'company_logo',
            'recruiter_name',
            'title',
            'description',
            'responsibilities',
            'requirements',
            'job_type',
            'experience_level',
            'location',
            'min_salary',
            'max_salary',
            'deadline',
            'vacancies',
            'status',
            'required_skills',
            'applications_count',
            'applicant_count',
            'is_saved',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'recruiter', 'created_at', 'updated_at')

    def get_applications_count(self, obj):
        return obj.applications.count()

    def get_company_name(self, obj):
        return obj.company.name if obj.company else None

    def get_company_logo(self, obj):
        if obj.company and obj.company.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.company.logo.url)
            return obj.company.logo.url
        return None

    def get_recruiter_name(self, obj):
        if obj.recruiter:
            full_name = obj.recruiter.get_full_name()
            return full_name if full_name.strip() else obj.recruiter.username
        return None

    def get_applicant_count(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.applications.count()
        return 0

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            profile = getattr(request.user, 'candidate_profile', None)
            if profile:
                return obj.saved_by.filter(candidate=profile).exists()
        return False

    def create(self, validated_data):
        required_skills_data = validated_data.pop('required_skills', [])
        request = self.context.get('request')

        # Associate current recruiter's company if company_id wasn't explicitly supplied
        if 'company' not in validated_data and request:
            recruiter_profile = getattr(request.user, 'recruiter_profile', None)
            if recruiter_profile and recruiter_profile.company:
                validated_data['company'] = recruiter_profile.company
            else:
                raise serializers.ValidationError({"company_id": "Please select or register a company first."})

        if request:
            validated_data['recruiter'] = request.user

        job = JobPost.objects.create(**validated_data)

        # Create required skills
        for item in required_skills_data:
            JobRequiredSkill.objects.create(
                job=job,
                skill=item['skill'],
                weight=item.get('weight', 3),
                is_mandatory=item.get('is_mandatory', False)
            )

        return job

    def update(self, instance, validated_data):
        required_skills_data = validated_data.pop('required_skills', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update skills if passed
        if required_skills_data is not None:
            instance.required_skills.all().delete()
            for item in required_skills_data:
                JobRequiredSkill.objects.create(
                    job=instance,
                    skill=item['skill'],
                    weight=item.get('weight', 3),
                    is_mandatory=item.get('is_mandatory', False)
                )

        return instance


class JobApplicationSerializer(serializers.ModelSerializer):
    job = JobPostSerializer(read_only=True)
    candidate = CandidateProfileSerializer(read_only=True)
    resume = ResumeSerializer(read_only=True)
    job_title = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    company_logo = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = (
            'id',
            'job',
            'job_title',
            'company_name',
            'company_logo',
            'candidate',
            'match_score',
            'match_breakdown',
            'cover_letter',
            'resume',
            'status',
            'applied_at',
            'updated_at',
        )
        read_only_fields = ('id', 'match_score', 'match_breakdown', 'applied_at', 'updated_at')

    def get_job_title(self, obj):
        return obj.job.title if obj.job else None

    def get_company_name(self, obj):
        return obj.job.company.name if (obj.job and obj.job.company) else None

    def get_company_logo(self, obj):
        if obj.job and obj.job.company and obj.job.company.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.job.company.logo.url)
            return obj.job.company.logo.url
        return None


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ('id', 'status')


class SavedJobSerializer(serializers.ModelSerializer):
    job = JobPostSerializer(read_only=True)

    class Meta:
        model = SavedJob
        fields = ('id', 'job', 'saved_at')


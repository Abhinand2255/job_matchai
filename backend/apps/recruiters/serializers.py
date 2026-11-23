from rest_framework import serializers
from .models import Company, RecruiterProfile
from accounts.serializers import UserSerializer


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = (
            'id',
            'name',
            'website',
            'industry',
            'company_size',
            'location',
            'description',
            'logo',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class RecruiterProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    company = CompanySerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        source='company',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = RecruiterProfile
        fields = ('id', 'user', 'company', 'company_id', 'job_title', 'phone', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')

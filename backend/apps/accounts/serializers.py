from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.password_validation import validate_password
from .models import User, UserRole


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'phone', 'first_name', 'last_name', 'date_joined')
        read_only_fields = ('id', 'date_joined')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'confirm_password', 'role', 'phone', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'phone': {'required': False},
        }

    def validate_role(self, value):
        if value == UserRole.ADMIN:
            raise serializers.ValidationError("Cannot register as Admin directly. Contact the administrator.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        return user


class CustomTokenObtainPairSerializer(serializers.Serializer):
    """
    Accepts either 'email' or 'username' alongside 'password'.
    Returns JWT access + refresh tokens and user profile details.
    """
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        identifier = (attrs.get('email') or attrs.get('username') or '').strip()
        password = attrs.get('password')

        if not identifier:
            raise serializers.ValidationError({"detail": "Email or username is required."})

        if '@' in identifier:
            user = User.objects.filter(email__iexact=identifier).first()
        else:
            user = User.objects.filter(username__iexact=identifier).first()

        if user and user.check_password(password):
            if not user.is_active:
                raise serializers.ValidationError({"detail": "User account is disabled."})
            
            refresh = RefreshToken.for_user(user)
            refresh['email'] = user.email
            refresh['username'] = user.username
            refresh['role'] = user.role

            return {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'role': user.role,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            }
        raise serializers.ValidationError({"detail": "Invalid email/username or password."})

from rest_framework import permissions


class IsCandidate(permissions.BasePermission):
    """
    Allows access only to candidate users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_candidate)


class IsRecruiter(permissions.BasePermission):
    """
    Allows access only to recruiter users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_recruiter)


class IsAdminUserRole(permissions.BasePermission):
    """
    Allows access only to admin role users or Django superusers.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin_role)


IsAdmin = IsAdminUserRole


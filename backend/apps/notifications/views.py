from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404

from .models import Notification
from .serializers import NotificationSerializer


class NotificationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class NotificationListView(generics.ListAPIView):
    """
    GET /api/notifications/
    List own notifications, paginated (20/page). Filter by ?unread=true
    """
    serializer_class = NotificationSerializer
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = NotificationPagination

    def get_queryset(self):
        qs = Notification.objects.filter(recipient=self.request.user)
        unread = self.request.query_params.get('unread', '').lower()
        if unread == 'true':
            qs = qs.filter(is_read=False)
        return qs


class NotificationMarkReadView(APIView):
    """
    POST /api/notifications/<id>/read/
    Mark a single notification as read.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, recipient=request.user)
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response({'message': 'Notification marked as read.'}, status=status.HTTP_200_OK)


class NotificationMarkAllReadView(APIView):
    """
    POST /api/notifications/read-all/
    Mark all notifications as read for the authenticated user.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        updated = Notification.objects.filter(
            recipient=request.user, is_read=False
        ).update(is_read=True)
        return Response({'message': f'{updated} notification(s) marked as read.'}, status=status.HTTP_200_OK)


class NotificationUnreadCountView(APIView):
    """
    GET /api/notifications/unread-count/
    Returns the number of unread notifications for the authenticated user.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        count = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({'count': count}, status=status.HTTP_200_OK)

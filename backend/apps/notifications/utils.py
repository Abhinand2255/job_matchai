import logging
from .models import Notification

logger = logging.getLogger(__name__)


def create_notification(
    recipient,
    notification_type,
    title,
    message,
    related_job_id=None,
    related_application_id=None,
):
    """
    Helper to create a Notification for a given recipient user.
    Returns the created Notification instance, or None on error.
    """
    try:
        notification = Notification.objects.create(
            recipient=recipient,
            notification_type=notification_type,
            title=title,
            message=message,
            related_job_id=related_job_id,
            related_application_id=related_application_id,
        )
        return notification
    except Exception as e:
        logger.error(f"Failed to create notification for {recipient}: {e}")
        return None

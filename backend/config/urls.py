from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/candidates/', include('candidates.urls')),
    path('api/recruiters/', include('recruiters.urls')),
    path('api/jobs/', include('jobs.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/admin/', include('analytics.admin_urls')),
]

admin.site.site_header = "JobMatch AI Administration"
admin.site.site_title = "JobMatch AI Admin"
admin.site.index_title = "Welcome to JobMatch AI Admin Panel"


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

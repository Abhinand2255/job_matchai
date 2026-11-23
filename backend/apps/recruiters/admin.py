from django.contrib import admin
from .models import Company, RecruiterProfile


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'industry', 'location', 'company_size', 'website')
    search_fields = ('name', 'industry', 'location')


@admin.register(RecruiterProfile)
class RecruiterProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'company', 'job_title', 'phone')
    search_fields = ('user__email', 'user__username', 'company__name', 'job_title')

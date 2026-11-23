from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notification_type', models.CharField(
                    choices=[
                        ('APPLICATION_SUBMITTED', 'Application Submitted'),
                        ('APPLICATION_SHORTLISTED', 'Application Shortlisted'),
                        ('APPLICATION_REJECTED', 'Application Rejected'),
                        ('APPLICATION_STATUS_CHANGED', 'Application Status Changed'),
                        ('NEW_APPLICANT', 'New Applicant'),
                        ('JOB_CLOSED', 'Job Closed'),
                        ('INTERVIEW_SCHEDULED', 'Interview Scheduled'),
                        ('GENERAL', 'General'),
                    ],
                    default='GENERAL',
                    max_length=50
                )),
                ('title', models.CharField(max_length=200)),
                ('message', models.TextField()),
                ('is_read', models.BooleanField(default=False)),
                ('related_job_id', models.IntegerField(blank=True, null=True)),
                ('related_application_id', models.IntegerField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('recipient', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='notifications',
                    to=settings.AUTH_USER_MODEL
                )),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]

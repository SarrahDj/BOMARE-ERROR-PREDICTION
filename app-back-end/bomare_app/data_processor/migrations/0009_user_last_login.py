# Generated by Django 5.1.4 on 2025-05-18 19:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data_processor', '0008_remove_processinghistory_job_processinghistory_file'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='last_login',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]

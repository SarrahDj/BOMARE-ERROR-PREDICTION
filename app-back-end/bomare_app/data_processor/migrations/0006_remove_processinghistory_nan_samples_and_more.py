# Generated by Django 5.1.4 on 2025-05-16 15:08

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('data_processor', '0005_processinghistory'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='processinghistory',
            name='nan_samples',
        ),
        migrations.RemoveField(
            model_name='processinghistory',
            name='predicted_errors',
        ),
        migrations.RemoveField(
            model_name='processinghistory',
            name='top_error_partnumbers',
        ),
        migrations.RemoveField(
            model_name='processinghistory',
            name='top_modules',
        ),
        migrations.RemoveField(
            model_name='processinghistory',
            name='top_shapes',
        ),
        migrations.RemoveField(
            model_name='processinghistory',
            name='valid_samples',
        ),
    ]

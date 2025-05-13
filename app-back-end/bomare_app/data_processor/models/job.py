from django.db import models
from .file import File


class ProcessingJob(models.Model):
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='processing_jobs')
    status = models.CharField(max_length=50, default='pending')
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Job #{self.id} for {self.file.filename}"
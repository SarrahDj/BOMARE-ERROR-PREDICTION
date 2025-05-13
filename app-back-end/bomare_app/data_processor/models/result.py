from django.db import models
from .job import ProcessingJob


class ProcessingResult(models.Model):
    job = models.ForeignKey(ProcessingJob, on_delete=models.CASCADE, related_name='results')
    ai_score = models.FloatField()
    prediction_data = models.JSONField()
    confidence_level = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Result for Job #{self.job.id}"
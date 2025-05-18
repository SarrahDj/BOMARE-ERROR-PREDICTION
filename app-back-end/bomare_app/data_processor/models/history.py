from django.db import models

class ProcessingHistory(models.Model):
    file = models.ForeignKey('File', on_delete=models.CASCADE, related_name='history')
    accuracy = models.FloatField()
    precision = models.FloatField()
    recall = models.FloatField()
    f1_score = models.FloatField()
    #valid_samples = models.IntegerField()
    total_samples = models.IntegerField()
    #nan_samples = models.IntegerField()
    #predicted_errors = models.IntegerField()
    error_rate = models.FloatField()

    #top_shapes = models.JSONField()
    #top_modules = models.JSONField()
    #top_error_partnumbers = models.JSONField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"History for Job {self.job.id}"

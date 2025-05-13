from django.db import models
from .user import User
from .result import ProcessingResult


class Export(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exports')
    result = models.ForeignKey(ProcessingResult, on_delete=models.CASCADE, related_name='exports')
    export_type = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.export_type} export by {self.user.username}"
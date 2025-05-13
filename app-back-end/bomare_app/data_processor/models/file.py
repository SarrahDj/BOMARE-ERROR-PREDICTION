from django.db import models
from .user import User


class File(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files')
    filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)
    file_size = models.IntegerField()
    storage_path = models.CharField(max_length=500)
    upload_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default='uploaded')
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.filename} ({self.user.username})"
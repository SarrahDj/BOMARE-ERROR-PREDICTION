from gotrue import model
from rest_framework import serializers
from ..models.file import File , User

class FileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    class Meta:
        model = File

        fields = ['id', 'user', 'filename', 'file_type', 'file_size',
                  'storage_path', 'upload_date', 'status', 'is_deleted', 'username']
        read_only_fields = ['id', 'upload_date', 'username']
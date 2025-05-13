from gotrue import model
from rest_framework import serializers
from ..models.file import File

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        #username = serializers.ReadOnlyField(source='user.username')
        fields = ['id', 'user', 'filename', 'file_type', 'file_size',
                  'storage_path', 'upload_date', 'status', 'is_deleted']
        read_only_fields = ['id', 'upload_date']
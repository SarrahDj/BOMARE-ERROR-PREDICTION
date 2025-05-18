# api/serializers/history.py
from rest_framework import serializers
from ..models.history import ProcessingHistory


class ProcessingHistorySerializer(serializers.ModelSerializer):
    file_id = serializers.IntegerField(source='file.id')

    class Meta:
        model = ProcessingHistory
        fields = [
            'id', 'file_id', 'accuracy', 'precision',
            'recall', 'f1_score', 'total_samples',
            'error_rate', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
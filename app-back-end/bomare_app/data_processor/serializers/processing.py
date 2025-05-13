from rest_framework import serializers
from ..models.job import ProcessingJob
from ..models.result import ProcessingResult
from ..models.export import Export


class ProcessingJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessingJob
        fields = ['id', 'file', 'status', 'started_at', 'completed_at', 'error_message']
        read_only_fields = ['id']


class ProcessingResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessingResult
        fields = ['id', 'job', 'ai_score', 'prediction_data', 'confidence_level', 'created_at']
        read_only_fields = ['id', 'created_at']


class ExportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Export
        fields = ['id', 'user', 'result', 'export_type', 'created_at']
        read_only_fields = ['id', 'created_at']

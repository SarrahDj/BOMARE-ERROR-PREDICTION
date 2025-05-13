# api/views/file_views.py
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
import os
from django.conf import settings
from ..models.file import File
from ..models.job import ProcessingJob
from ..serializers.file import FileSerializer
from ..serializers.processing import ProcessingJobSerializer
from ..serializers.file import FileSerializer
from ..utils.auth import verify_jwt_token

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(settings.BASE_DIR, 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)


@csrf_exempt  # Add CSRF exemption
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])  # Add parsers for file upload
def upload_file(request):
    # Get token from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'error': 'Authorization required'}, status=401)

    # Extract and verify token
    token = auth_header.split(' ')[1]
    payload = verify_jwt_token(token)
    if not payload:
        return Response({'error': 'Invalid or expired token'}, status=401)

    # Get the file from request
    file = request.FILES.get('file')
    if not file:
        return Response({'error': 'No file provided'}, status=400)

    # Create file path
    user_id = payload['user_id']
    user_dir = os.path.join(UPLOAD_DIR, f'user_{user_id}')
    os.makedirs(user_dir, exist_ok=True)

    # Save file to disk
    file_path = os.path.join(user_dir, file.name)
    with open(file_path, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)

    # Determine file type
    file_type = file.name.split('.')[-1].lower()

    # Create file record in database
    file_data = {
        'user': user_id,
        'filename': file.name,
        'file_type': file_type,
        'file_size': file.size,
        'storage_path': file_path,
        'status': 'uploaded'  # Initial status
    }

    serializer = FileSerializer(data=file_data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_user_files(request):
    # Get token from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'error': 'Authorization required'}, status=401)

    # Extract and verify token
    token = auth_header.split(' ')[1]
    payload = verify_jwt_token(token)
    if not payload:
        return Response({'error': 'Invalid or expired token'}, status=401)

    # Get files for the user
    user_id = payload['user_id']
    files = File.objects.filter(user=user_id, is_deleted=False).order_by('-upload_date')

    serializer = FileSerializer(files, many=True)
    return Response(serializer.data)

from django.shortcuts import get_object_or_404

@api_view(['DELETE'])
def delete_file(request, file_id):
    # Get the file or return 404
    file_instance = get_object_or_404(File, id=file_id, is_deleted=False)

    # Soft delete - mark as deleted
    file_instance.delete()

    # Optional: Also delete from disk
    try:
        if os.path.exists(file_instance.storage_path):
            os.remove(file_instance.storage_path)
    except Exception as e:
        return Response({'error': f'File marked deleted, but failed to remove from disk: {str(e)}'}, status=500)

    return Response({'message': 'File deleted successfully'}, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_file_by_id(request, file_id):
    """Get a single file by ID"""
    # Authenticate user
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'error': 'Authorization required'}, status=401)

    # Extract and verify token
    token = auth_header.split(' ')[1]
    payload = verify_jwt_token(token)
    if not payload:
        return Response({'error': 'Invalid or expired token'}, status=401)

    user_id = payload['user_id']

    # Get the file or return 404
    file_instance = get_object_or_404(File, id=file_id, user=user_id, is_deleted=False)

    serializer = FileSerializer(file_instance)
    return Response(serializer.data)


@api_view(['GET'])
def get_file_jobs(request, file_id):
    """Get all processing jobs for a specific file"""
    # Authenticate user
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'error': 'Authorization required'}, status=401)

    # Extract and verify token
    token = auth_header.split(' ')[1]
    payload = verify_jwt_token(token)
    if not payload:
        return Response({'error': 'Invalid or expired token'}, status=401)

    user_id = payload['user_id']

    # Get the file or return 404
    file_instance = get_object_or_404(File, id=file_id, user=user_id, is_deleted=False)

    # Get all jobs for this file, ordered by most recent first
    jobs = ProcessingJob.objects.filter(file=file_instance).order_by('-started_at', '-id')

    serializer = ProcessingJobSerializer(jobs, many=True)
    return Response(serializer.data)
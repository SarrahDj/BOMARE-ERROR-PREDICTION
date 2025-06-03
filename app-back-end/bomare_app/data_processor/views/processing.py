import csv


from django.http import JsonResponse, FileResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import pandas as pd
import os
import json
from datetime import datetime
from django.conf import settings

from ..models import Export, User, ProcessingHistory
from ..models.file import File
from ..models.job import ProcessingJob
from ..models.result import ProcessingResult
from ..serializers.processing import ProcessingJobSerializer, ExportSerializer
from ..serializers.processing import ProcessingResultSerializer
from ..serializers.file import FileSerializer
from ..services.backend_file1 import predict_feeder_errors
from ..utils.auth import verify_jwt_token
from ..services import predict_feeder_errors_detailed


@api_view(['POST'])
def process_file(request, file_id):
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

    # Get the file
    file_instance = get_object_or_404(File, id=file_id, user=user_id, is_deleted=False)

    # Create a processing job
    job = ProcessingJob.objects.create(
        file=file_instance,
        status='pending',
    )

    # Update file status
    file_instance.status = 'processing'
    file_instance.save()

    # Return job details
    serializer = ProcessingJobSerializer(job)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_processing_status(request, job_id):
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

    # Get the job and ensure it belongs to the user
    job = get_object_or_404(ProcessingJob, id=job_id, file__user=user_id)

    # Get job details
    job_serializer = ProcessingJobSerializer(job)

    # Get results if available
    results = job.results.all() if job.status == 'completed' else None
    result_serializer = ProcessingResultSerializer(results, many=True) if results else None

    response_data = {
        'job': job_serializer.data,
        'results': result_serializer.data if result_serializer else None
    }

    return Response(response_data)


# This would typically be an async task, but we'll make it a separate endpoint because it is more simple

@api_view(['POST'])
def execute_processing(request, job_id):
    # In production, this would be triggered by a worker/scheduler
    # Authenticate as admin or system user
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'error': 'Authorization required'}, status=401)

    # Extract and verify token
    token = auth_header.split(' ')[1]
    payload = verify_jwt_token(token)
    if not payload:
        return Response({'error': 'Invalid or expired token'}, status=401)

    user_id = payload['user_id']
    user = get_object_or_404(User, id=user_id)
    print("1")
    # Get the job
    job = get_object_or_404(ProcessingJob, id=job_id)
    print("2")

    # Update job status
    job.status = 'processing'
    job.started_at = datetime.now()
    job.save()
    print("3")

    try:
        # Get the file data
        file_path = job.file.storage_path
        file_type = job.file.file_type.lower()
        print("4")

        # Read the file
        #if file_type in ['csv']:
            #df = pd.read_csv(file_path)
       # elif file_type in ['xls', 'xlsx', 'excel']:
            #df = pd.read_excel(file_path)
        #else:
            #raise ValueError(f"Unsupported file type: {file_type}")

        # Process with model
        model_output = predict_feeder_errors(file_path)['json_output']
        print(type(model_output))
        import json
        cleaned_output = make_json_serializable(model_output)


        # Extract AI score from model output
        ai_score = model_output['model_performance']['accuracy']
        print("ai score khlas")

        # Save prediction result
        result = ProcessingResult.objects.create(
            job=job,
            ai_score=ai_score,
            prediction_data=cleaned_output,  # Store the entire model output
            confidence_level=ai_score # Use precision as confidence level
        )
        print("output result khlas")

        # Update job status
        job.status = 'completed'
        job.completed_at = datetime.now()
        job.save()
        print("job status khlas")
        # Update file status
        job.file.status = 'processed'
        job.file.save()
        print("file status khlas")

        # Save the historical data
        ProcessingHistory.objects.create(
            file=job.file,
            accuracy=model_output['model_performance']['accuracy'],
            precision=model_output['model_performance']['precision'],
            recall=model_output['model_performance']['recall'],
            f1_score=model_output['model_performance']['f1_score'],
            total_samples=model_output['model_performance']['total_samples'],
            #nan_samples=model_output['model_performance']['nan_samples'],
            #predicted_errors=model_output['error_summary']['PredictedErrors'],
            error_rate=model_output['model_performance']['error_rate'],
            #top_shapes=model_output['top_shapes'],
            #top_modules=model_output['top_modules'],
            #top_error_partnumbers=model_output['top_error_partnumbers']
        )
        print("his data khlas")

        # Create export records
        exports = []
        for export_key, file_path in model_output['output_files'].items():
            if export_key == 'csv':
                export_type = 'CSV'
            elif export_key == 'excel':
                export_type = 'Excel'
            elif export_key == 'json':
                export_type = 'JSON'
            else:
                export_type = 'Other'

            export_obj = Export.objects.create(
                user=user,
                result=result,  # Link to the result object
                export_type=export_type
            )
            exports.append(export_obj)

        # Serialize export objects
        export_serializer = ExportSerializer(exports, many=True)
        print("export khlas")
        # Prepare complete response data
        response_data = {
            'status': 'success',
            'job_id': job.id,
            'result_id': result.id,
            'exports': export_serializer.data,
            'model_output': {
                # Include all the fields from model_output, preserving the original structure
                'model_performance': model_output['model_performance'],
                'total_parts': model_output.get('total_parts'),
                'unique_part_numbers': model_output.get('unique_part_numbers'),
                'unique_feeder_ids': model_output.get('unique_feeder_ids'),
                'most_used_feeder_id': model_output.get('most_used_feeder_id'),
                'part_number_count_per_feeder': model_output.get('part_number_count_per_feeder'),
                'unique_shapes': model_output.get('unique_shapes'),
                'shape_distribution': model_output.get('shape_distribution', {}),
                'most_common_shape': model_output.get('most_common_shape'),
                'unique_package_names': model_output.get('unique_package_names'),
                'most_common_package': model_output.get('most_common_package'),
                'package_type_distribution': model_output.get('package_type_distribution', {}),
                'tape_width_distribution': model_output.get('tape_width_distribution', {}),
                'feeder_type_distribution': model_output.get('feeder_type_distribution', {}),
                'total_errors': model_output.get('total_errors'),
                'error_rate': model_output.get('error_rate'),
                'error_distribution_by_shape': model_output.get('error_distribution_by_shape', {}),
                'shape_with_most_error': model_output.get('shape_with_most_error'),
                'top_5_shapes_with_errors': model_output.get('top_5_shapes_with_errors', {}),
                'all_shapes_errors': {'somth': 1},
                'error_distribution_by_part_number': model_output.get('error_distribution_by_part_number', {}),
                'part_number_with_most_error': model_output.get('part_number_with_most_error'),
                'top_5_parts_with_errors': model_output.get('top_5_parts_with_errors', {}),
                'all_parts_errors': model_output.get('all_parts_errors', {}),
                'error_distribution_by_module': model_output.get('error_distribution_by_module', {}),
                'module_with_most_error': model_output.get('module_with_most_error'),
                'top_5_modules_with_errors': model_output.get('top_5_modules_with_errors', {}),
                'all_modules_errors': model_output.get('all_modules_errors', {}),
                'output_files': model_output.get('output_files')
            }
        }

        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        # Handle error
        job.status = 'failed'
        job.error_message = str(e)
        job.completed_at = datetime.now()
        job.save()

        # Update file status
        job.file.status = 'error'
        job.file.save()

        return Response({'error': str(e)}, status=500)



@api_view(['GET'])
def get_job_results(request, result_id):
    """Get all results for a specific job"""
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

    # Get the job and ensure it belongs to the user
# Get results for this job
    results = ProcessingResult.objects.filter(id = result_id)

    serializer = ProcessingResultSerializer(results, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_latest_file_processing(request, file_id):
    """Get the latest processing job and results for a specific file"""
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
    file_serializer = FileSerializer(file_instance)

    # Get the most recent job for this file
    try:
        latest_job = ProcessingJob.objects.filter(file=file_instance).order_by('-started_at', '-id')[0]
        job_serializer = ProcessingJobSerializer(latest_job)

        # If job is completed, get results
        if latest_job.status == 'completed':
            results = ProcessingResult.objects.filter(job=latest_job)
            result_serializer = ProcessingResultSerializer(results, many=True)
            results_data = result_serializer.data
        else:
            results_data = None

        return Response({
            'file': file_serializer.data,
            'job': job_serializer.data,
            'results': results_data,
            'isLoading': latest_job.status in ['pending', 'processing'],
            'error': latest_job.error_message if latest_job.status == 'failed' else None
        })

    except IndexError:
        # No jobs found for this file
        return Response({
            'file': file_serializer.data,
            'job': None,
            'results': None,
            'isLoading': False,
            'error': None
        })


class Job:
    pass


@api_view(["GET"])
def get_export_content(request, job_id):
    """
    Retrieve the contents of an export file and return it as JSON.

    This endpoint returns the parsed content of the export file regardless
    of its original format (CSV, JSON, etc.).

    Args:
        request: HTTP request object
        export_id: ID of the export to retrieve

    Returns:
        JsonResponse with the parsed content of the export file
    """
    result = get_object_or_404(ProcessingResult,job= job_id)
    # Get the export object, ensuring it belongs to the requesting user
    export = get_object_or_404(Export, result=result, user=request.user)

    # Determine the file path based on your storage strategy
    # This assumes you're storing exports in a directory structure like:
    # /media/exports/{result_id}/{export_type}_{export_id}.{extension}
    file_dir = os.path.join( str(export.result.id))
    file_extension = 'csv' if export.export_type == 'csv' else 'json'
    file_path = export.result

    try:
        # Read and parse the file based on its type
        if export.export_type == 'csv':
            return parse_csv_export(file_path)
        elif export.export_type == 'json':
            return parse_json_export(file_path)
        else:
            return JsonResponse({"error": "Unsupported export type"}, status=400)

    except FileNotFoundError:
        return JsonResponse({"error": "Export file not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": f"Error reading export file: {str(e)}"}, status=500)


def parse_csv_export(file_path):
    """Parse a CSV export file and return its contents as JSON"""
    data = []

    with open(file_path, 'r', newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            # Convert any numeric strings to numbers
            processed_row = {}
            for key, value in row.items():
                if value.replace('.', '', 1).isdigit():
                    # It's a number
                    processed_row[key] = float(value) if '.' in value else int(value)
                else:
                    processed_row[key] = value
            data.append(processed_row)

    return JsonResponse(data, safe=False)


def parse_json_export(file_path):
    """Parse a JSON export file and return its contents"""
    with open(file_path, 'r', encoding='utf-8') as jsonfile:
        data = json.load(jsonfile)

    return JsonResponse(data, safe=False)

import numpy as np
def make_json_serializable(obj):
    if isinstance(obj, dict):
        return {k: make_json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [make_json_serializable(v) for v in obj]
    elif isinstance(obj, (np.ndarray,)):
        return obj.tolist()
    elif isinstance(obj, (np.float32, np.float64)):
        return float(obj)
    elif isinstance(obj, (np.int32, np.int64)):
        return int(obj)
    else:
        return obj  # assume already serializable


@api_view(['GET'])
def download_export_file(request, result_id, export_type):
    """
    Download the actual export file by result ID and export type
    """
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
    print("passed auth")
    # Get the result
    result = get_object_or_404(ProcessingResult, id=result_id)
    print("passed result fetching")
    # Check if user has access to this result
    job = result.job
    print("passed job thing")
    if job.file.user.id != user_id:
        return Response({'error': 'Unauthorized access'}, status=403)

    # Get file path from model_output
    try:
        if (export_type == 'excel'):
            export = 'xlsx'
        export = 'csv'
        file_path = result.prediction_data['output_files'][export]
        print("passed file path")
        # Ensure file exists
        if not os.path.exists(file_path):
            return Response({'error': 'Export file not found'}, status=404)

        # Determine filename
        filename = f"feeder-error-prediction-{job.id}.{export_type.lower()}"

        # Serve the file
        response = FileResponse(open(file_path, 'rb'))
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

    except KeyError:
        return Response({'error': f'Export file of type {export_type} not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
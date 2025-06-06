from django.urls import path
from django.views.decorators.csrf import csrf_exempt

from . import views

urlpatterns = [
    path('auth/login/', views.login, name='login'),
    path('auth/logout/', views.logout, name='logout'),
    path('auth/register/', views.register, name='register'),
    path('users/', views.get_all_users, name='get_users'),
    path('users/<int:user_id>/', views.get_user_by_id, name='get_user_by_id'),
    path('users/create/', views.create_user, name='create_user'),
    path('users/<int:user_id>/update/', views.update_user, name='update_user'),
    path('users/<int:user_id>/delete/', views.delete_user, name='delete_user'),
    path('users/<int:user_id>/reset-password/', views.reset_password, name='reset_password'),

    path('files/upload/', csrf_exempt(views.upload_file), name='upload_file'),
    path('files/recent/', views.get_user_files, name='get_recent_uploads'),
    path('files/<int:file_id>/delete/',views.delete_file),
    path('files/<int:file_id>/', views.get_file_by_id, name='get_file_by_id'),
    path('files/<int:file_id>/jobs/', views.get_file_jobs, name='get_file_jobs'),

    # Processing endpoints
    path('files/<int:file_id>/process/', views.process_file, name='process_file'),
    path('files/<int:file_id>/processing/', views.get_latest_file_processing,
         name='get_latest_file_processing'),
    path('jobs/<int:job_id>/status/', views.get_processing_status, name='get_processing_status'),
    path('jobs/<int:job_id>/execute/', views.execute_processing, name='execute_processing'),
    path('results/<int:result_id>/', views.get_job_results, name='get_job_results'),
    path('exports/<int:job_id>/content/', views.get_export_content, name='export-content'),

# Add to urls.py
path('results/<int:result_id>/download/<str:export_type>/', views.download_export_file, name='download_export_file'),
path('files/<int:file_id>/processing-history/', views.get_processing_history, name='get_file_processing_history'),

]
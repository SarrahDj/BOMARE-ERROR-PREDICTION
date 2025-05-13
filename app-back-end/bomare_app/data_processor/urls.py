from django.urls import path
from django.views.decorators.csrf import csrf_exempt

from . import views

urlpatterns = [
    path('auth/login/', views.login, name='login'),
    path('auth/register/', views.register, name='register'),
    path('users/', views.get_all_users, name='get_users'),


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
    path('jobs/<int:job_id>/results/', views.get_job_results, name='get_job_results'),
    path('exports/<int:job_id>/content/', views.get_export_content, name='export-content'),

]
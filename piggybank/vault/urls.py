from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.vault),
    path('upload/', views.upload_file_view, name='upload_file'),
    path('upload-success/', views.upload_success_view, name='upload_success'),
]
    
# This will serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
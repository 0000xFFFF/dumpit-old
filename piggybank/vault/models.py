import os
import uuid
from django.db import models
from datetime import datetime

# Helper function to generate unique file names
def generate_file_name(instance, filename):
    ext = filename.split('.')[-1]
    new_filename = f"{uuid.uuid1()}_{datetime.now().strftime('%Y%m%d%H%M%S')}.{ext}"
    return os.path.join('uploads', 'files', new_filename)

class UploadedFile(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to=generate_file_name)  # or use ImageField for images
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
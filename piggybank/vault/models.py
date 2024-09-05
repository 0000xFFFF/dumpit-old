import os
import uuid
from django.db import models
from datetime import datetime

def generate_file_name(instance, filename):
    ext = filename.split('.')[-1]
    new_filename = f"{uuid.uuid1()}_{datetime.now().strftime('%Y%m%d%H%M%S')}.{ext}"
    return os.path.join('uploads', 'files', new_filename)

class UploadBase(models.Model):
    filename = models.CharField(max_length=255, help_text="File name")
    title = models.CharField(max_length=255, help_text="Title of the file")
    description = models.TextField(blank=True, help_text="Description of the file")
    upload_date = models.DateTimeField(auto_now_add=True)
    file_type = models.CharField(max_length=50, blank=True)

    class Meta:
        abstract = True  # Marks this as an abstract base class

    def __str__():
        return f"{self.id},{self.name}"

class Picture(UploadBase):
    image = models.ImageField(upload_to=generate_file_name, default='uploads/images/default.jpg')
    
    def __str__(self):
        return self.title

# Model for Video files
class Video(UploadBase):
    video = models.FileField(upload_to=generate_file_name)
    
    def __str__(self):
        return self.title

# Model for Other types of Files (Documents, PDFs, etc.)
class OtherFile(UploadBase):
    file = models.FileField(upload_to=generate_file_name)
    
    def __str__(self):
        return self.title

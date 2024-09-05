from django import forms
from .models import UploadedFile

class SimpleFileUploadForm(forms.Form):
    file = forms.FileField()

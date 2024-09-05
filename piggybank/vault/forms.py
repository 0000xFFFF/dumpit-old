from django import forms
from .models import UploadedFile

class FileUploadForm(forms.ModelForm):
    class Meta:
        model = UploadedFile
        fields = ['title', 'file']
        
    #def clean_file(self):
    #    file = self.cleaned_data.get('file')
    #    
    #    # Example: Restrict file size (max 5MB)
    #    if file.size > 5 * 1024 * 1024:
    #        raise forms.ValidationError("File too large. Size should not exceed 5MB.")
    #    
    #    # Example: Restrict file types (allow only certain file types)
    #    allowed_extensions = ['pdf', 'docx', 'jpg']
    #    ext = file.name.split('.')[-1].lower()
    #    if ext not in allowed_extensions:
    #        raise forms.ValidationError("Unsupported file type.")
    #    
    #    return file
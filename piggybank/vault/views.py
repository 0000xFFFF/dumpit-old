import os
from django.conf import settings
from django.shortcuts import render, redirect
from django.http import HttpResponse

from .forms import SimpleFileUploadForm

def vault(request):
    return render(request, "vault.html")

def handle_file_upload(uploaded_file):
    save_path = os.path.join(settings.MEDIA_ROOT, 'uploads', uploaded_file.name)
    with open(save_path, 'wb+') as destination:
        for chunk in uploaded_file.chunks():
            destination.write(chunk)
    return save_path

def upload_file_view(request):
    if request.method == 'POST':
        form = SimpleFileUploadForm(request.POST, request.FILES)
        if form.is_valid():
            # Save the file to the filesystem
            file_path = handle_file_upload(request.FILES['file'])
            return redirect('upload_success')  # or return a file path for the user
    else:
        form = SimpleFileUploadForm()
    
    return render(request, 'upload.html', {'form': form})

def upload_success_view(request):
    return render(request, 'upload_success.html')
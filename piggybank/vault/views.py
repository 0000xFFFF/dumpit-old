from django.shortcuts import render, redirect
from django.http import HttpResponse

from .forms import FileUploadForm

def vault(request):
    return render(request, "vault.html")

def file_upload_view(request):
    if request.method == 'POST':
        form = FileUploadForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()  # This saves the file and title to the database
            return redirect('success_url')  # Replace with your success URL
    else:
        form = FileUploadForm()
    
    return render(request, 'upload.html', {'form': form})
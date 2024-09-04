from django.shortcuts import render, redirect
from django.http import HttpResponse
from .form import ContactForm

def index_view(request):
    return render(request, 'index.html')

def login_view(request):
    return render(request, "login.html")

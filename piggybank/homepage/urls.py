from django.urls import path
from . import views

urlpatterns = [
    path('', views.index),
    path('index', views.index),
    path('index/', views.index),
    path('home', views.index),
    path('home/', views.index),
    path('login', views.login),
    path('login/', views.login),
]
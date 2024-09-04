from django.urls import path
from . import views

urlpatterns = [
    path('', views.index_view, name="index"),
    path('home', views.index_view),
    path('index', views.index_view),
    path('login', views.login_view),
]
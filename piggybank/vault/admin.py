from django.contrib import admin

from .models import Picture, Video, OtherFile

# Register your models here.
admin.site.register(Picture)
admin.site.register(Video)
admin.site.register(OtherFile)
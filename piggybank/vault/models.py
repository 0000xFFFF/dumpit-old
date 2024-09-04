from django.db import models

# Create your models here.

class Picture(models.Model):
    filename = models.CharField(max_length=255)
    metadata = models.CharField(max_length=255)
    width = models.IntegerField()
    height = models.IntegerField()
    size_in_bytes = models.IntegerField()
    
    def __str__():
        return f"{self.id},{self.filename},{self.metadata},{self.width},{self.height},{self.size_in_bytes}"
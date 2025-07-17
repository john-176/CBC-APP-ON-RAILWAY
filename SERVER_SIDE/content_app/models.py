from django.db import models

# Create your models here.
# models.py
from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.conf import settings
import os


#------------------------------------------------------------------------------------------------------------------------------------------------------#

def validate_image_size(value):
    filesize = value.size
    if filesize > 2 * 1024 * 1024:  # 2MB limit
        raise ValidationError("The maximum file size that can be uploaded is 2MB")

class Achiever(models.Model):
    name = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
    bio = models.TextField()
    image = models.ImageField(
        upload_to='achievers/',
        null=True,
        blank=True,
        validators=[validate_image_size]
    )
    years_active = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
        
        
#-------------------------------------------------------------------------------------------------------------------------------#

class ShowcaseImage(models.Model):
    image = models.ImageField(upload_to='showcase/')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Showcase Image {self.id}"
    
    
    
#------------------------------------------------------------------------------------------------------------------------------#

def video_upload_path(instance, filename):
    # Upload to "videos/year/month/filename"
    import datetime
    now = datetime.datetime.now()
    return os.path.join('videos', now.strftime('%Y'), now.strftime('%m'), filename)

class VideoShowcase(models.Model):
    title = models.CharField(max_length=255, blank=True)
    video_file = models.FileField(upload_to=video_upload_path)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Showcase Video"
        verbose_name_plural = "Showcase Videos"
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.title or f"Video {self.id}"

    @property
    def url(self):
        return self.video_file.url

    @property
    def format(self):
        return os.path.splitext(self.video_file.name)[1][1:].lower()  # 'mp4', 'webm', etc.
    
    
    #------------------------------------------------------------------------------------------------------------------------------#
    
class Announcement(models.Model):
    title = models.CharField(max_length=255)
    message = models.TextField()
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.title


#------------------------------------------------------------------------------------------------------------------------------#

class YouTubeVideo(models.Model):
    title = models.CharField(max_length=255)
    url = models.URLField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Achiever, ShowcaseImage, VideoShowcase, Announcement

# Register your models here.
admin.site.register(Achiever)
admin.site.register(ShowcaseImage)
admin.site.register(VideoShowcase)
admin.site.register(Announcement)
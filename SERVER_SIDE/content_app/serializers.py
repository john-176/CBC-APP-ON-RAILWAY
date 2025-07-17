# serializers.py
from rest_framework import serializers
from .models import Achiever, ShowcaseImage, VideoShowcase, Announcement, YouTubeVideo
from django.conf import settings
from django.contrib.auth import get_user_model
import re

class AchieverSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Achiever
        fields = ['id', 'name', 'title', 'bio', 'image', 'years_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_image(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None
    
    def validate(self, data):
        # Example validation - ensure years_active format is correct
        if 'years_active' in data and not data['years_active'].isdigit():
            raise serializers.ValidationError("Years active should be a numeric value")
        return data
    
    
# serializers.py


User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'is_superuser']
        read_only_fields = ['id', 'username', 'email', 'is_staff', 'is_superuser']
        


# serializers.py
class AchieverCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achiever
        fields = ['name', 'title', 'bio', 'image', 'years_active']
    
    def create(self, validated_data):
        # Only staff/superusers can create achievers
        if not self.context['request'].user.is_staff and not self.context['request'].user.is_superuser:
            raise serializers.ValidationError("Only staff can create achievers")
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Only staff/superusers can update achievers
        if not self.context['request'].user.is_staff and not self.context['request'].user.is_superuser:
            raise serializers.ValidationError("Only staff can update achievers")
        return super().update(instance, validated_data)
    
    
#-----------------------------------------------------------------------------------------------------------------------#

class ShowcaseImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ShowcaseImage
        fields = ['id', 'image', 'url', 'uploaded_at']
        read_only_fields = ['uploaded_by', 'uploaded_at']

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None  # or return a default URL if you want


#-------------------------------------------------------------------------------------------------------------------#

class VideoShowcaseSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    format = serializers.SerializerMethodField()

    class Meta:
        model = VideoShowcase
        fields = ['id', 'title', 'url', 'format', 'uploaded_at']
        read_only_fields = ['id', 'url', 'format', 'uploaded_at']

    def get_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.url)
        return obj.url

    def get_format(self, obj):
        return obj.format

class VideoShowcaseUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoShowcase
        fields = ['video_file', 'title']
        
        
class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ['id', 'title', 'message', 'date']
        
        
        
#-------------------------------------------------------------------------------------------------------------------


class YouTubeVideoSerializer(serializers.ModelSerializer):
    def validate_url(self, value):
        # Accept watch, youtu.be, embed, shorts
        pattern = re.compile(
            r'^(https?://)?(www\.)?(youtube\.com/(watch\?v=|embed/|shorts/)|youtu\.be/)([\w-]{11})'
        )
        if not pattern.match(value):
            raise serializers.ValidationError("Invalid YouTube URL format.")
        return value

    class Meta:
        model = YouTubeVideo
        fields = ['id', 'title', 'url', 'is_active', 'created_at']
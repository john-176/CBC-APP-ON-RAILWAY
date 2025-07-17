from django.shortcuts import render

# Create your views here.
from django.shortcuts import render

# Create your views here.
# views.py
from rest_framework import generics, permissions, status
from .models import Achiever, ShowcaseImage, VideoShowcase, Announcement
from .serializers import (
    AchieverSerializer,
    AchieverCreateUpdateSerializer,
    UserSerializer, 
    ShowcaseImageSerializer, 
    VideoShowcaseSerializer, 
    VideoShowcaseUploadSerializer, 
    AnnouncementSerializer,
    YouTubeVideoSerializer,
    YouTubeVideo,
)
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.http import Http404
from rest_framework.permissions import AllowAny


class AchieverListCreate(generics.ListCreateAPIView):
    queryset = Achiever.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AchieverCreateUpdateSerializer
        return AchieverSerializer

    def perform_create(self, serializer):
        if self.request.user.is_staff or self.request.user.is_superuser:
            serializer.save()
        else:
            raise PermissionDenied("Only staff can create achievers")

class AchieverRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Achiever.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return AchieverCreateUpdateSerializer
        return AchieverSerializer

    def perform_update(self, serializer):
        if self.request.user.is_staff or self.request.user.is_superuser:
            serializer.save()
        else:
            raise PermissionDenied("Only staff can update achievers")

    def perform_destroy(self, instance):
        if self.request.user.is_staff or self.request.user.is_superuser:
            instance.delete()
        else:
            raise PermissionDenied("Only staff can delete achievers")

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)
    


class ShowcaseImageListCreate(generics.ListCreateAPIView):
    queryset = ShowcaseImage.objects.all()
    serializer_class = ShowcaseImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
        if self.request.user.is_staff or self.request.user.is_superuser:
            serializer.save(uploaded_by=self.request.user)
        else:
            raise PermissionDenied("Only staff can add showcase images")


class ShowcaseImageDestroy(generics.DestroyAPIView):
    queryset = ShowcaseImage.objects.all()
    serializer_class = ShowcaseImageSerializer
    permission_classes = [permissions.IsAdminUser]  # Only superusers can delete
    
    
#-------------------------------------------------------------------------------------------------------------------------#



class VideoShowcaseListCreateView(generics.ListCreateAPIView):
    queryset = VideoShowcase.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return VideoShowcaseUploadSerializer
        return VideoShowcaseSerializer

    def perform_create(self, serializer):
        serializer.save(
            uploaded_by=self.request.user,
            title=self.request.data.get('title', '')
        )

class VideoShowcaseDestroyView(generics.DestroyAPIView):
    queryset = VideoShowcase.objects.all()
    serializer_class = VideoShowcaseSerializer
    permission_classes = [permissions.IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Soft delete instead of actual deletion
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    
    
#-------------------------------------------------------------------------------------------------------------------------#

class AnnouncementListCreateView(generics.ListCreateAPIView):
    queryset = Announcement.objects.order_by('-date')
    serializer_class = AnnouncementSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            serializer.save()
        else:
            raise PermissionDenied("Only staff or superusers can add announcements.")


class AnnouncementDeleteView(generics.DestroyAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            instance.delete()
        else:
            raise PermissionDenied("Only staff or superusers can delete announcements.")


#-------------------------------------------------------------------------------------------------------------------------

# Public can view; only staff/superuser can create
from rest_framework.permissions import IsAuthenticatedOrReadOnly

class YouTubeVideoListCreateView(generics.ListCreateAPIView):
    queryset = YouTubeVideo.objects.all().order_by('-created_at')
    serializer_class = YouTubeVideoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        if not self.request.user.is_staff and not self.request.user.is_superuser:
            raise PermissionDenied("Only staff or superusers can create YouTube videos.")
        serializer.save()


# Public can retrieve; only staff/superuser can update/delete
class YouTubeVideoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = YouTubeVideo.objects.all()
    serializer_class = YouTubeVideoSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
# session_auth/content_app/urls.py
from django.urls import path

from .views import ( 
                    AchieverListCreate,
                    AchieverRetrieveUpdateDestroy,
                    CurrentUserView,      
                    ShowcaseImageListCreate,
                    ShowcaseImageDestroy,
                    VideoShowcaseListCreateView,
                    VideoShowcaseDestroyView,
                    AnnouncementListCreateView,
                    AnnouncementDeleteView,
                    YouTubeVideoListCreateView,
                    YouTubeVideoDetailView
)

urlpatterns = [
    path('achievers/', AchieverListCreate.as_view(), name='achievers-list'), # path('achievers/', AchieverListCreate.as_view(), name='achievers-list'),
    path('achievers/<int:pk>/', AchieverRetrieveUpdateDestroy.as_view(), name='achievers-detail'),
    path('auth/user/', CurrentUserView.as_view(), name='current-user'),
    path('showcase/images/', ShowcaseImageListCreate.as_view(), name='showcase-image-list'),
    path('showcase/images/<int:pk>/', ShowcaseImageDestroy.as_view(), name='showcase-image-detail'),
    path('videos/', VideoShowcaseListCreateView.as_view(), name='videoshowcase-list'),
    path('videos/<int:pk>/', VideoShowcaseDestroyView.as_view(), name='videoshowcase-detail'),
    path('announcements/', AnnouncementListCreateView.as_view(), name='announcement-list-create'),
    path('announcements/<int:pk>/', AnnouncementDeleteView.as_view(), name='announcement-delete'),
    path("youtube/", YouTubeVideoListCreateView.as_view(), name="youtube-list"),
    path("youtube/<int:pk>/", YouTubeVideoDetailView.as_view(), name="youtube-detail"),
]
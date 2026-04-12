from django.urls import path
from django.urls import include

from rest_framework.routers import DefaultRouter

from .views import UserSavedVideoViewSet
from .views import VideoViewSet
from .views import TopicViewSet
from .views import SubtopicViewSet


app_name = "api"

router = DefaultRouter()
router.register(r"user-saved-videos", UserSavedVideoViewSet, basename="user-saved-videos")
router.register(r"videos", VideoViewSet, basename="videos")
router.register(r"topics", TopicViewSet, basename="topics")
router.register(r"subtopics", SubtopicViewSet, basename="subtopics")

urlpatterns = [
    path("", include(router.urls)),
]

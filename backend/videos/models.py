from django.db import models
from topics.models import Topic
from topics.models import Subtopic
from django.contrib.auth import get_user_model


# Create your models here.
class Video(models.Model):
    """
    A model representing a video.

    Attributes:
        video_id (str): The unique identifier for the video.
        title (str): The title of the video.
        description (str): The description of the video.
        tags (list): An array of strings representing the tags for the video.        
        duration (str): The duration of the video in ISO 8601 format.
        publishedAt (str): The date and time the video was published in ISO 8601 format.
        likes (int): The number of likes for the video.
        views (int): The number of views for the video.

    Methods:
        __str__: Returns a string representation of the video.
    """

    video_id = models.CharField(max_length=255, unique=True)
    title = models.TextField(max_length=255)    
    subtopics = models.ManyToManyField(Subtopic, related_name="videos")
    description = models.TextField(blank=True, null=True)    
    tags = models.JSONField(default=list, null=True, blank=True)
    duration = models.CharField(max_length=50, blank=True)
    publishedAt = models.CharField(max_length=50, blank=True)
    likes = models.IntegerField(default=0)
    userLikes = models.ManyToManyField(get_user_model(), related_name='liked_videos', blank=True)
    userSaves = models.ManyToManyField(get_user_model(), related_name='saved_videos', blank=True)
    views = models.IntegerField(default=0)
    userViews = models.ManyToManyField(get_user_model(), related_name='viewed_videos', blank=True)

    def __str__(self):
        return f"{self.title} - {', '.join(str(subtopic) for subtopic in self.subtopics.all())}"

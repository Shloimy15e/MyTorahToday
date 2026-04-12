from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


# Create your models here.
class UserVideoList(models.Model):
    """
    A model to represent a user's video list.

    Args:
        user: The user who owns the video list.
        list_id: The unique identifier for the video list.
        title: The title of the video list.
        description: The description of the video list.
        thumbnail: The URL of the thumbnail for the video list.
        created_at: The date and time when the video list was created.

    Returns:
        str: The title of the video list.
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    list_id = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
    description = models.TextField()
    thumbnail = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title}"


class ListVideo(models.Model):
    """
    A model to represent a video within a user's video list.

    Args:
        list_id: The video list to which the video belongs.
        video_id: The unique identifier for the video.

    Returns:
        str: The identifier of the video.
    """

    list_id = models.ForeignKey(UserVideoList, on_delete=models.CASCADE)
    video_id = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.video_id}"


class UserSavedVideo(models.Model):
    """
    A model to represent a video saved by a user.

    Args:
        user: The user who saved the video.
        video_id: The unique identifier for the saved video.

    Returns:
        str: The identifier of the saved video.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    video_id = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.video_id}"

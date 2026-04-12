from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Video


@admin.register(Video)
class VideoAdmin(ModelAdmin):
    list_display = ["title", "video_id", "likes", "views"]
    search_fields = ["title", "video_id"]
    list_filter = ["subtopics__topic"]
    filter_horizontal = ["subtopics"]

from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import UserSavedVideo, UserVideoList, ListVideo


@admin.register(UserSavedVideo)
class UserSavedVideoAdmin(ModelAdmin):
    list_display = ["user", "video_id"]
    search_fields = ["user__username", "video_id"]


@admin.register(UserVideoList)
class UserVideoListAdmin(ModelAdmin):
    list_display = ["title", "user", "created_at"]
    search_fields = ["title", "user__username"]


@admin.register(ListVideo)
class ListVideoAdmin(ModelAdmin):
    list_display = ["list_id", "video_id"]

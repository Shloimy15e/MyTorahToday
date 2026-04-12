from django.contrib import admin
from .models import UserSavedVideo, UserVideoList, ListVideo
# Register your models here.
admin.site.register(UserSavedVideo)
admin.site.register(UserVideoList)
admin.site.register(ListVideo)

from django.contrib import admin
from .models import Topic, Subtopic, Journal


class JournalInline(admin.TabularInline):
    model = Journal
    extra = 1


class SubtopicAdmin(admin.ModelAdmin):
    inlines = [JournalInline]
    list_display = ["name", "topic", "order"]
    list_filter = ["topic"]
    search_fields = ["name"]


admin.site.register(Topic)
admin.site.register(Subtopic, SubtopicAdmin)
admin.site.register(Journal)

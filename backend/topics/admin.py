from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline
from .models import Topic, Subtopic, Journal


class JournalInline(TabularInline):
    model = Journal
    extra = 1


@admin.register(Topic)
class TopicAdmin(ModelAdmin):
    list_display = ["name", "order"]
    search_fields = ["name"]
    ordering_field = "order"
    hide_ordering_field = True


@admin.register(Subtopic)
class SubtopicAdmin(ModelAdmin):
    inlines = [JournalInline]
    list_display = ["name", "topic", "order"]
    list_filter = ["topic"]
    search_fields = ["name"]
    ordering_field = "order"
    hide_ordering_field = True


@admin.register(Journal)
class JournalAdmin(ModelAdmin):
    list_display = ["title", "subtopic", "created_at"]
    list_filter = ["subtopic__topic"]
    search_fields = ["title", "subtopic__name"]

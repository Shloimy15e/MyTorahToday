from django.contrib import admin
from django import forms
from unfold.admin import ModelAdmin, TabularInline
from .models import Topic, Subtopic, Journal


class JournalInline(TabularInline):
    model = Journal
    extra = 1


class DiscoveryScheduleForm(forms.ModelForm):
    def clean_discovery_schedule(self):
        if self.data.get("discovery_schedule") in ("", None):
            return []
        return self.cleaned_data["discovery_schedule"]


class TopicAdminForm(DiscoveryScheduleForm):
    class Meta:
        model = Topic
        fields = "__all__"


class SubtopicAdminForm(DiscoveryScheduleForm):
    class Meta:
        model = Subtopic
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["description"].help_text = (
            "Optional introduction below this subtopic's title. Leave blank to hide it."
        )
        videos = self.fields["featured_video"].queryset
        self.fields["featured_video"].queryset = (
            videos.filter(subtopics=self.instance) if self.instance.pk else videos.none()
        )


@admin.register(Topic)
class TopicAdmin(ModelAdmin):
    form = TopicAdminForm
    list_display = ["name", "order"]
    search_fields = ["name"]
    ordering_field = "order"
    hide_ordering_field = True


@admin.register(Subtopic)
class SubtopicAdmin(ModelAdmin):
    form = SubtopicAdminForm
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

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("topics", "0005_journal"),
        ("videos", "0010_remove_video_topic"),
    ]

    operations = [
        migrations.AddField(
            model_name="subtopic",
            name="featured_video",
            field=models.ForeignKey(
                to="videos.video", on_delete=django.db.models.deletion.SET_NULL,
                null=True, blank=True, related_name="featured_in_subtopics",
            ),
        ),
    ]

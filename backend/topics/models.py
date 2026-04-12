from django.db import models


# Create your models here.
class Topic(models.Model):
    """
    A model representing a topic.
    Attributes:
    name (str): The name of the topic.
    description (str): The description of the topic.
    """

    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    order = models.IntegerField(default=0, db_index=True)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return self.name

class Subtopic(models.Model):
    """
    A model representing a subtopic.
    Attributes:
    name (str): The name of the subtopic.
    description (str): The description of the subtopic.
    topic (Topic): The topic that the subtopic belongs to.
    """
    
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    sefaria_text = models.CharField(max_length=255, null=True, blank=True)
    order = models.IntegerField(default=0, db_index=True)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return self.name


class Journal(models.Model):
    subtopic = models.ForeignKey(Subtopic, on_delete=models.CASCADE, related_name="journals")
    title = models.CharField(max_length=255)
    pdf = models.FileField(upload_to="journals/")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.subtopic.name})"
    
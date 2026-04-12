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
    
    def __str__(self):
        return self.name
    
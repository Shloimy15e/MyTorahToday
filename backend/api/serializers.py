from rest_framework import serializers
from django.contrib.auth import get_user_model
from users.models import UserSavedVideo
from users.models import UserVideoList
from videos.models import Video
from topics.models import Topic
from topics.models import Subtopic

User = get_user_model()

class TopicSerializer(serializers.ModelSerializer):
    """
    A serializer for the topic model
    
    Returns:
        dict: Serialized data for the topic model fields.
    """
    
    # Return all subtopics in this topic
    subtopics = serializers.SerializerMethodField()
    def get_subtopics(self, obj):
        """
        Get subtopics for the topic.

        Args:
            obj (Topic): The topic object.

        Returns:
            list: List of subtopics for the topic.
        """
        subtopics = Subtopic.objects.filter(topic=obj)
        return SubtopicSerializer(subtopics, many=True).data
    
    class Meta:
        """
        Meta options for the TopicSerializer class.
        """
        model = Topic
        fields = ["id", "name", "description", "subtopics"]
        
class SubtopicSerializer(serializers.ModelSerializer):
    """
    A serializer for the subtopic model

    Returns:
        dict: Serialized data for the subtopic model fields.
    """
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    
    class Meta:
        """
        Meta options for the SubtopicSerializer class.
        """
        model = Subtopic
        fields = ["id", "name", "description", "topic", "topic_name"] 
    

class VideoSerializer(serializers.ModelSerializer):
    """
    A serializer for the Video model.
    
    Returns:
        dict: Serialized data for the Video model fields.
    """
    
    subtopics_data = serializers.SerializerMethodField()
    topics_data = serializers.SerializerMethodField()
    userLikes = serializers.SerializerMethodField()
    userViews = serializers.SerializerMethodField()
    is_liked_by_user = serializers.SerializerMethodField()
    is_viewed_by_user = serializers.SerializerMethodField()
    is_saved_by_user = serializers.SerializerMethodField()

    def get_subtopics_data(self, obj):
        """
        Get the subtopics data for the video.
        """
        return [{"id": subtopic.id, "name": subtopic.name, "topic": {"id": subtopic.topic.id, "name": subtopic.topic.name}} 
                for subtopic in obj.subtopics.all()]

    def get_topics_data(self, obj):
        """
        Get unique topics data from the video's subtopics.
        """
        topics = {}
        for subtopic in obj.subtopics.all():
            topic = subtopic.topic
            if topic.id not in topics:
                topics[topic.id] = {"id": topic.id, "name": topic.name}
        return list(topics.values())

    class Meta:
        """
        Meta options for the VideoSerializer class.
        """
        model = Video
        fields = ["id", "video_id", "title", "subtopics", "subtopics_data", "topics_data", "description", 
                 "tags", "duration", "publishedAt", "likes", "userLikes", "is_liked_by_user", 
                 "views", "is_viewed_by_user", "userViews", "is_saved_by_user"]
        
    def get_userLikes(self, obj):
        """
        Get the count of userLikes for the video.
        """
        return obj.userLikes.count()
    
    def get_userViews(self, obj):
        """
        Get the count of userViews for the video.
        """
        return obj.userViews.count()

    def get_is_liked_by_user(self, obj):
        """
        Check if the user has liked the video.
        """
        user = self.context.get('request').user
        return user in obj.userLikes.all() if user.is_authenticated else False
    
    def get_is_viewed_by_user(self, obj):
        """
        Check if the user has viewed the video.
        """
        user = self.context.get('request').user
        return user in obj.userViews.all() if user.is_authenticated else False
    
    def get_is_saved_by_user(self, obj):
        """
        Check if the user has saved the video.
        """
        user = self.context.get('request').user
        return user in obj.userSaves.all() if user.is_authenticated else False

class UserSavedVideoSerializer(serializers.ModelSerializer):
    """
    A serializer for the UserSavedVideo model.

    Returns:
        dict: Serialized data for the UserSavedVideo model fields.
    """

    class Meta:
        """
        Meta options for the UserSavedVideoSerializer class.

        Returns:
            None
        """

        model = UserSavedVideo
        fields = ["id", "user", "video_id"]

    
    


class UserVideoListSerializer(serializers.ModelSerializer):
    """
    A serializer for the UserVideoList model.

    Returns:
        dict: Serialized data for the UserVideoList model fields.
    """

    class Meta:
        """
        Meta options for the UserVideoListSerializer class.

        Returns:
            None
        """

        model = UserVideoList
        fields = [
            "id",
            "user",
            "list_id",
            "title",
            "description",
            "thumbnail",
            "created_at",
        ]

    def to_representation(self, instance):
        """
            Customize the representation of the UserVideoList model.
            Args:
                instance: The instance of the UserVideoList model to be serialized.
                Returns:
                    dict: Serialized data for the UserVideoList model fields.
        """
        data = super().to_representation(instance)
        data["list_id"] = instance.list_id
        data["title"] = instance.title
        data["description"] = instance.description
        data["thumbnail"] = instance.thumbnail
        data["created_at"] = instance.created_at
        return data
    
    def create(self, validated_data):
        """
            Create a new UserVideoList instance.
            Args:
                validated_data: The validated data to create the UserVideoList instance with.
                Returns:
                    UserVideoList: The created UserVideoList instance.
        """
        user = self.context["request"].user
        list_id = validated_data.pop("list_id")
        title = validated_data.pop("title")
        description = validated_data.pop("description")
        thumbnail = validated_data.pop("thumbnail")
        user_video_list, created = UserVideoList.objects.get_or_create(
            user=user,
            list_id=list_id,
            title=title,
            description=description,
            thumbnail=thumbnail,
        )
        if not created:
            raise serializers.ValidationError("Video list already exists.")
        return user_video_list
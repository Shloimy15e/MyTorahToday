from rest_framework import serializers
from django.contrib.auth import get_user_model
from users.models import UserSavedVideo
from users.models import UserVideoList
from videos.models import Video
from topics.models import Topic, Subtopic, Journal

User = get_user_model()

class TopicSerializer(serializers.ModelSerializer):
    """
    A serializer for the topic model
    
    Returns:
        dict: Serialized data for the topic model fields.
    """
    
    # Uses prefetched subtopic_set from the viewset queryset
    subtopics = serializers.SerializerMethodField()
    def get_subtopics(self, obj):
        return SubtopicSerializer(obj.subtopic_set.all(), many=True).data
    
    class Meta:
        """
        Meta options for the TopicSerializer class.
        """
        model = Topic
        fields = ["id", "name", "description", "subtopics"]
        
class JournalSerializer(serializers.ModelSerializer):
    pdf = serializers.SerializerMethodField()

    def get_pdf(self, obj):
        if not obj.pdf:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.pdf.url)
        return obj.pdf.url

    class Meta:
        model = Journal
        fields = ["id", "title", "pdf", "created_at"]


class SubtopicSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    journals = serializers.SerializerMethodField()

    def get_journals(self, obj):
        return JournalSerializer(obj.journals.all(), many=True, context=self.context).data

    class Meta:
        model = Subtopic
        fields = ["id", "name", "description", "topic", "topic_name", "sefaria_text", "journals"]


class VideoSerializer(serializers.ModelSerializer):
    """
    A serializer for the Video model.
    
    Returns:
        dict: Serialized data for the Video model fields.
    """
    
    topics = serializers.SerializerMethodField()
    subtopics_data = serializers.SerializerMethodField()
    topics_data = serializers.SerializerMethodField()
    userLikes = serializers.SerializerMethodField()
    userViews = serializers.SerializerMethodField()
    is_liked_by_user = serializers.SerializerMethodField()
    is_viewed_by_user = serializers.SerializerMethodField()
    is_saved_by_user = serializers.SerializerMethodField()

    def get_topics(self, obj):
        seen = set()
        result = []
        for subtopic in obj.subtopics.all():
            if subtopic.topic_id not in seen:
                seen.add(subtopic.topic_id)
                result.append(subtopic.topic_id)
        return result

    def get_subtopics_data(self, obj):
        return [{"id": s.id, "name": s.name, "topic": {"id": s.topic.id, "name": s.topic.name}}
                for s in obj.subtopics.all()]

    def get_topics_data(self, obj):
        topics = {}
        for subtopic in obj.subtopics.all():
            topic = subtopic.topic
            if topic.id not in topics:
                topics[topic.id] = {"id": topic.id, "name": topic.name}
        return list(topics.values())

    class Meta:
        model = Video
        fields = ["id", "video_id", "title", "topics", "subtopics", "subtopics_data",
                 "topics_data", "description", "tags", "duration", "publishedAt",
                 "likes", "userLikes", "is_liked_by_user",
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
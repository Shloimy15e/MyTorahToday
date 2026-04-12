from django.db.models import Prefetch
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.authentication import TokenAuthentication
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.filters import OrderingFilter
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from django_filters import rest_framework as filters

from videos.models import Video
from topics.models import Subtopic


class CustomLimitOffsetPagination(LimitOffsetPagination):
    default_limit = 50
    max_limit = 100


from .serializers import UserSavedVideoSerializer
from .serializers import VideoSerializer
from .serializers import TopicSerializer
from .serializers import SubtopicSerializer


class TopicViewSet(ModelViewSet):
    """
    A viewset for the Topic model.
    """

    serializer_class = TopicSerializer
    queryset = TopicSerializer.Meta.model.objects.prefetch_related(
        Prefetch("subtopic_set", queryset=Subtopic.objects.select_related("topic"))
    ).all()
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        "id": ["exact"],
        "name": ["iexact"],
        "description": ["exact", "icontains"],
    }
    ordering_fields = ["id", "name"]


class SubtopicViewSet(ModelViewSet):
    """
    A viewset for the Subtopic model.
    """

    serializer_class = SubtopicSerializer
    queryset = SubtopicSerializer.Meta.model.objects.select_related("topic").all()
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        "id": ["exact"],
        "name": ["iexact"],
        "description": ["exact", "icontains"],
        "topic": ["exact"],
        "topic__name": ["iexact"],
    }
    ordering_fields = ["id", "name", "topic"]


class RepeatParamFilter(filters.Filter):
    """Handles ?param=1&param=2 (repeated query params) as an OR filter.

    `param_name` is the query string key (e.g. "topics").
    `field_name` is the ORM lookup (e.g. "subtopics__topic").
    """

    def __init__(self, param_name=None, **kwargs):
        self._param_name = param_name
        super().__init__(**kwargs)

    def filter(self, qs, value):
        if not value:
            return qs
        param = self._param_name or self.field_name
        values = self.parent.request.GET.getlist(param)
        if not values:
            return qs
        return qs.filter(**{f"{self.field_name}__in": values}).distinct()


class VideoFilter(filters.FilterSet):
    is_saved_by_user = filters.BooleanFilter(method="filter_is_saved_by_user")
    is_liked_by_user = filters.BooleanFilter(method="filter_is_liked_by_user")
    is_viewed_by_user = filters.BooleanFilter(method="filter_is_viewed_by_user")
    # FE sends ?topics=1&topics=2
    topics = RepeatParamFilter(param_name="topics", field_name="subtopics__topic")
    # FE sends ?topic__name__iexact=parshah
    topic__name__iexact = filters.CharFilter(field_name="subtopics__topic__name", lookup_expr="iexact", distinct=True)
    # FE sends ?subtopics=1&subtopics=2
    subtopics = RepeatParamFilter(param_name="subtopics", field_name="subtopics")
    # FE sends ?subtopic__name__iexact=noach
    subtopic__name__iexact = filters.CharFilter(field_name="subtopics__name", lookup_expr="iexact", distinct=True)

    class Meta:
        model = Video
        fields = {
            "video_id": ["exact"],
            "likes": ["exact", "gte", "lte", "range"],
            "views": ["exact", "gte", "lte", "range"],
        }

    def filter_is_saved_by_user(self, queryset, name, value):
        user = self.request.user
        if user.is_authenticated:
            if value:
                return queryset.filter(userSaves=user)
            return queryset.exclude(userSaves=user)
        return queryset.none()  # If user is not authenticated, return an empty queryset

    def filter_is_liked_by_user(self, queryset, name, value):
        user = self.request.user
        if user.is_authenticated:
            if value:
                return queryset.filter(userLikes=user)
            return queryset.exclude(userLikes=user)
        return queryset.none()  # If user is not authenticated, return an empty queryset

    def filter_is_viewed_by_user(self, queryset, name, value):
        user = self.request.user
        if user.is_authenticated:
            if value:
                return queryset.filter(userViews=user)
            return queryset.exclude(userViews=user)
        return queryset.none()  # If user is not authenticated, return an empty queryset


class VideoViewSet(ModelViewSet):
    """
    A viewset for the Video model.
    """

    serializer_class = VideoSerializer
    queryset = VideoSerializer.Meta.model.objects.prefetch_related(
        Prefetch("subtopics", queryset=Subtopic.objects.select_related("topic")),
        "userLikes", "userSaves", "userViews",
    ).all()
    permission_classes = [IsAdminUser | AllowAny | IsAuthenticated]

    def get_permissions(self):
        if self.action in [
            "create",
            "update",
            "partial_update",
            "destroy",
            "update_and_create_bulk",
            "delete_all",
        ]:
            return [IsAdminUser()]
        elif self.action in [
            "like",
            "save",
            "view",
        ]:
            return [IsAuthenticated()]
        return [AllowAny()]

    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = VideoFilter
    ordering_fields = ["likes", "views", "publishedAt"]
    search_fields = ["title", "subtopics__topic__name", "subtopics__name", "description", "tags"]

    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        """
        Like a video.
        """
        video = self.get_object()
        user = request.user
        if user in video.userLikes.all():
            video.userLikes.remove(user)
            return Response({"detail": "Video unliked"}, status=status.HTTP_200_OK)
        else:
            video.userLikes.add(user)
            return Response({"detail": "Video liked"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def save(self, request, pk=None):
        """
        Save a video.
        """
        video = self.get_object()
        user = request.user
        if user in video.userSaves.all():
            video.userSaves.remove(user)
            return Response({"detail": "Video unsaved"}, status=status.HTTP_200_OK)
        else:
            video.userSaves.add(user)
            return Response({"detail": "Video saved"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def view(self, request, pk=None):
        """
        View a video.
        """
        video = self.get_object()
        user = request.user
        if user in video.userViews.all():
            return Response(
                {"detail": "Video already viewed"}, status=status.HTTP_200_OK
            )
        video.userViews.add(user)
        return Response({"detail": "Video viewed"}, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        """
        create one or more video instances.
        """
        try:
            if videos := request.data.get("videos"):
                created_videos = []
                errors = []
                for video in videos:
                    try:
                        serializer = self.get_serializer(data=video)
                        serializer.is_valid(raise_exception=True)
                        self.perform_create(serializer)
                        created_videos.append(serializer.data)
                    except Exception as e:
                        errors.append({"video": video, "error": str(e)})

                if errors and created_videos:
                    return Response(
                        {"created_videos": created_videos, "errors": errors},
                        status=status.HTTP_206_PARTIAL_CONTENT,
                    )
                elif created_videos:
                    return Response(
                        {"created_videos": created_videos},
                        status=status.HTTP_201_CREATED,
                    )
                else:
                    return Response(
                        {"errors": errors}, status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                try:
                    serializer = self.get_serializer(data=request.data)
                    serializer.is_valid(raise_exception=True)
                    self.perform_create(serializer)
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                except Exception as e:
                    return Response(
                        {"error": str(e)}, status=status.HTTP_400_BAD_REQUEST
                    )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"], url_path="update-and-create-bulk")
    def update_and_create_bulk(self, request, *args, **kwargs):
        """
        Update or create multiple videos in bulk.
        Iterate over the videos list and if video_id matches an existing video, update the video
        If video_id does not match an existing video, create a new video.
        """
        try:
            videos = request.data.get("videos")
            created_videos = []
            updated_videos = []
            errors = []
            for video in videos:
                if video_id := video.get("video_id"):
                    try:
                        existing_video = self.queryset.get(video_id=video_id)
                        serializer = self.get_serializer(
                            existing_video, data=video, partial=True
                        )
                        if serializer.is_valid():
                            self.perform_update(serializer)
                            updated_videos.append(serializer.data)
                        elif (
                            "Video matching query does not exist." in serializer.errors
                        ):
                            serializer = self.get_serializer(data=video)
                            if serializer.is_valid():
                                self.perform_create(serializer)
                                created_videos.append(serializer.data)
                            else:
                                errors.append(
                                    {"video": video, "error": serializer.errors}
                                )
                        else:
                            errors.append({"video": video, "error": serializer.errors})
                    except Exception as e:
                        errors.append({"video": video, "error": str(e)})
                else:
                    errors.append({"video": video, "error": "video_id is required"})

            if errors and created_videos and updated_videos:
                return Response(
                    {
                        "created_videos": created_videos,
                        "updated_videos": updated_videos,
                        "errors": errors,
                    },
                    status=status.HTTP_206_PARTIAL_CONTENT,
                )
            elif created_videos and updated_videos:
                return Response(
                    {
                        "created_videos": created_videos,
                        "updated_videos": updated_videos,
                    },
                    status=status.HTTP_201_CREATED,
                )
            elif errors and created_videos:
                return Response(
                    {"created_videos": created_videos, "errors": errors},
                    status=status.HTTP_206_PARTIAL_CONTENT,
                )
            elif errors and updated_videos:
                return Response(
                    {"updated_videos": updated_videos, "errors": errors},
                    status=status.HTTP_206_PARTIAL_CONTENT,
                )
            elif created_videos:
                return Response(
                    {"created_videos": created_videos}, status=status.HTTP_201_CREATED
                )
            elif updated_videos:
                return Response(
                    {"updated_videos": updated_videos}, status=status.HTTP_200_OK
                )
            else:
                return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request, *args, **kwargs):
        """
        List all videos.
        """
        try:
            paginator = CustomLimitOffsetPagination()
            queryset = self.filter_queryset(self.get_queryset())
            page = paginator.paginate_queryset(queryset, request)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return paginator.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a single video by id or video_id.
        """
        queryset = self.filter_queryset(self.get_queryset())

        # Try to get the object by video_id first
        video_id = self.kwargs.get("pk")
        try:
            obj = queryset.get(video_id=video_id)
        except queryset.model.DoesNotExist:
            # If video_id lookup fails, try with pk (id)
            try:
                obj = queryset.get(pk=video_id)
            except queryset.model.DoesNotExist as e:
                raise NotFound(f"No video found with id or video_id: {video_id}") from e

        serializer = self.get_serializer(obj)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        """
        Update a video by id or video_id.
        Requires admin user.
        """
        try:
            partial = kwargs.pop("partial", False)
            # Try to get the object by id first
            try:
                instance = self.get_object()
            except Exception:
                # If not found, try to get the object by video_id
                video_id = request.data.get("video_id") or kwargs.get("pk")
                instance = self.queryset.get(video_id=video_id)

            serializer = self.get_serializer(
                instance, data=request.data, partial=partial
            )
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        """
        Delete a video by id or video_id.
        """
        try:
            if video_id := request.query_params.get("video_id"):
                instance = self.queryset.filter(
                    video_id=video_id, user=request.user
                ).first()
            else:
                instance = self.get_object()
            if not instance:
                return Response(
                    {"error": "Video not found"}, status=status.HTTP_404_NOT_FOUND
                )

            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["delete"], detail=False, url_path="delete-all")
    def delete_all(self, request):
        """
        Delete all videos.
        """
        try:
            self.queryset.all().delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# Create your views here.
class UserSavedVideoViewSet(ModelViewSet):
    """
    A viewset for the UserSavedVideo model.
    """

    serializer_class = UserSavedVideoSerializer
    queryset = UserSavedVideoSerializer.Meta.model.objects.all()
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def create(self, request, *args, **kwargs):
        """
        Create a new UserSavedVideo instance.
        """
        try:
            data = request.data.copy()
            data["user"] = request.user.id
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)

            if serializer.data.get("user") != request.user.id:
                return Response(
                    {"error": "User does not match"}, status=status.HTTP_400_BAD_REQUEST
                )

            # Check if video_id + user.id match is already in the UserSavedVideo table
            if self.queryset.filter(
                video_id=serializer.data.get("video_id"), user=request.user
            ).exists():
                return Response(
                    {"error": "Video already saved"}, status=status.HTTP_400_BAD_REQUEST
                )

            return Response(
                serializer.data, status=status.HTTP_201_CREATED, headers=headers
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request, *args, **kwargs):
        """
        List all UserSavedVideo instances for the authenticated user.
        Args:
            request (Request): The request object.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.
        Returns:
            Response: A response object with the serialized data.
        """
        try:
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a single UserSavedVideo instance for the authenticated user.
        Args:
            request (Request): The request object.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.
        Returns:
            Response: A response object with the serialized data.
        """
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        """
        Delete a UserSavedVideo instance for the authenticated user.
        Args:
            request (Request): The request object.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.
        Returns:
                Response: A response object with the serialized data.
        """
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

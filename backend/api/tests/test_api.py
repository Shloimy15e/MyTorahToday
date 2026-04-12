"""Tests for API endpoints — verifying the BE matches what the FE expects."""
from django.test import TestCase, TransactionTestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from topics.models import Topic, Subtopic
from videos.models import Video

User = get_user_model()


class APITestBase(TestCase):
    """Base class that sets up test data matching the production schema."""

    @classmethod
    def setUpTestData(cls):
        cls.topic_parshah = Topic.objects.create(name="Parshah")
        cls.topic_neviim = Topic.objects.create(name="Neviim")
        cls.topic_moadim = Topic.objects.create(name="Mo'adim")

        cls.sub_noach = Subtopic.objects.create(
            name="Noach", topic=cls.topic_parshah
        )
        cls.sub_balak = Subtopic.objects.create(
            name="Balak", topic=cls.topic_parshah,
            sefaria_text="Bamidbar 22:2-25:9"
        )
        cls.sub_yeshayahu = Subtopic.objects.create(
            name="Yeshayahu", topic=cls.topic_neviim
        )
        cls.sub_pesach = Subtopic.objects.create(
            name="Pesach", topic=cls.topic_moadim
        )

        cls.video1 = Video.objects.create(
            video_id="abc123", title="Noach: Building the Ark",
            description="A video about Noach", duration="PT10M", likes=5, views=100,
        )
        cls.video1.subtopics.add(cls.sub_noach)

        cls.video2 = Video.objects.create(
            video_id="def456", title="Balak: The enemy king",
            description="A video about Balak", duration="PT15M", likes=10, views=200,
        )
        cls.video2.subtopics.add(cls.sub_balak)

        cls.video3 = Video.objects.create(
            video_id="ghi789", title="Yeshayahu 32",
            description="A video about Yeshayahu", duration="PT20M", likes=3, views=50,
        )
        cls.video3.subtopics.add(cls.sub_yeshayahu)

        cls.video4 = Video.objects.create(
            video_id="jkl012", title="Pesach Seder",
            description="A video about Pesach", duration="PT30M", likes=8, views=150,
        )
        cls.video4.subtopics.add(cls.sub_pesach)

        cls.user = User.objects.create_user(username="testuser", password="testpass")
        cls.client = APIClient()


class TestVideoSerializerOutput(APITestBase):
    """The FE Video type expects specific fields from the API."""

    def test_video_has_topics_field(self):
        """FE expects video.topics as number[] (array of topic IDs)."""
        response = self.client.get(f"/api/videos/{self.video1.video_id}/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("topics", data)
        self.assertIsInstance(data["topics"], list)
        self.assertEqual(data["topics"], [self.topic_parshah.id])

    def test_video_has_topics_data_field(self):
        """FE expects video.topics_data as {id, name}[]."""
        response = self.client.get(f"/api/videos/{self.video1.video_id}/")
        data = response.json()
        self.assertIn("topics_data", data)
        self.assertEqual(len(data["topics_data"]), 1)
        self.assertEqual(data["topics_data"][0]["id"], self.topic_parshah.id)
        self.assertEqual(data["topics_data"][0]["name"], "Parshah")

    def test_video_has_subtopics_field(self):
        """FE expects video.subtopics as number[] (array of subtopic IDs)."""
        response = self.client.get(f"/api/videos/{self.video1.video_id}/")
        data = response.json()
        self.assertIn("subtopics", data)
        self.assertIsInstance(data["subtopics"], list)
        self.assertEqual(data["subtopics"], [self.sub_noach.id])

    def test_video_has_subtopics_data_field(self):
        """FE expects video.subtopics_data as {id, name}[]."""
        response = self.client.get(f"/api/videos/{self.video1.video_id}/")
        data = response.json()
        self.assertIn("subtopics_data", data)
        self.assertEqual(len(data["subtopics_data"]), 1)
        self.assertEqual(data["subtopics_data"][0]["id"], self.sub_noach.id)
        self.assertEqual(data["subtopics_data"][0]["name"], "Noach")

    def test_video_has_user_interaction_fields(self):
        """FE expects is_liked_by_user, is_saved_by_user, etc."""
        response = self.client.get(f"/api/videos/{self.video1.video_id}/")
        data = response.json()
        self.assertIn("is_liked_by_user", data)
        self.assertIn("is_saved_by_user", data)
        self.assertIn("is_viewed_by_user", data)
        self.assertIn("userLikes", data)
        self.assertIn("userViews", data)


class TestVideoFiltering(APITestBase):
    """The FE sends specific query params — the BE must accept them."""

    def test_filter_by_topics_multi_value(self):
        """FE sends ?topics=1&topics=2 to get videos from multiple topics."""
        url = f"/api/videos/?topics={self.topic_parshah.id}&topics={self.topic_neviim.id}"
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        video_ids = [v["video_id"] for v in response.json()["results"]]
        self.assertIn("abc123", video_ids)  # Parshah
        self.assertIn("def456", video_ids)  # Parshah
        self.assertIn("ghi789", video_ids)  # Neviim
        self.assertNotIn("jkl012", video_ids)  # Mo'adim

    def test_filter_by_topics_single_value(self):
        """FE sends ?topics=1 to get videos from one topic."""
        url = f"/api/videos/?topics={self.topic_neviim.id}"
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        video_ids = [v["video_id"] for v in response.json()["results"]]
        self.assertEqual(video_ids, ["ghi789"])

    def test_filter_by_subtopics_multi_value(self):
        """FE sends ?subtopics=1&subtopics=2 to get videos from multiple subtopics."""
        url = f"/api/videos/?subtopics={self.sub_noach.id}&subtopics={self.sub_yeshayahu.id}"
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        video_ids = [v["video_id"] for v in response.json()["results"]]
        self.assertIn("abc123", video_ids)
        self.assertIn("ghi789", video_ids)
        self.assertNotIn("def456", video_ids)

    def test_filter_by_topic_name_iexact(self):
        """FE sends ?topic__name__iexact=parshah."""
        url = "/api/videos/?topic__name__iexact=parshah"
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        video_ids = [v["video_id"] for v in response.json()["results"]]
        self.assertIn("abc123", video_ids)
        self.assertIn("def456", video_ids)
        self.assertNotIn("ghi789", video_ids)

    def test_filter_by_subtopic_name_iexact(self):
        """FE sends ?subtopic__name__iexact=noach."""
        url = "/api/videos/?subtopic__name__iexact=noach"
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        video_ids = [v["video_id"] for v in response.json()["results"]]
        self.assertEqual(video_ids, ["abc123"])


class TestSubtopicSerializer(APITestBase):
    """The FE Subtopic type expects sefaria_text."""

    def test_subtopic_has_sefaria_text(self):
        response = self.client.get(f"/api/subtopics/{self.sub_balak.id}/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("sefaria_text", data)
        self.assertEqual(data["sefaria_text"], "Bamidbar 22:2-25:9")

    def test_subtopic_has_topic_name(self):
        response = self.client.get(f"/api/subtopics/{self.sub_noach.id}/")
        data = response.json()
        self.assertIn("topic_name", data)
        self.assertEqual(data["topic_name"], "Parshah")

    def test_subtopic_sefaria_text_null(self):
        response = self.client.get(f"/api/subtopics/{self.sub_noach.id}/")
        data = response.json()
        self.assertIsNone(data["sefaria_text"])


class TestTopicSerializer(APITestBase):
    """The FE Topic type expects nested subtopics."""

    def test_topic_has_nested_subtopics(self):
        response = self.client.get(f"/api/topics/{self.topic_parshah.id}/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("subtopics", data)
        subtopic_names = [s["name"] for s in data["subtopics"]]
        self.assertIn("Noach", subtopic_names)
        self.assertIn("Balak", subtopic_names)

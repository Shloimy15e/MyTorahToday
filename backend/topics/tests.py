from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient

from topics.admin import SubtopicAdminForm, TopicAdminForm
from topics.models import Journal, Subtopic, Topic
from videos.models import Video
from api.serializers import SubtopicSerializer, TopicSerializer
import json


class FeaturedVideoTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.topic = Topic.objects.create(name="Learning")
        cls.subtopic = Subtopic.objects.create(name="Sample", topic=cls.topic)
        cls.video = Video.objects.create(video_id="sample-video", title="Sample lesson")
        cls.video.subtopics.add(cls.subtopic)
        cls.other = Video.objects.create(video_id="other-video", title="Other lesson")
        cls.admin = get_user_model().objects.create_user(
            username="editor", password="test", is_staff=True,
        )
        cls.user = get_user_model().objects.create_user(username="reader", password="test")

    def setUp(self):
        self.client = APIClient()
        self.url = f"/api/subtopics/{self.subtopic.pk}/"

    def feature_video(self):
        self.subtopic.featured_video = self.video
        self.subtopic.save(update_fields=["featured_video"])

    def test_model_and_admin_require_membership(self):
        self.subtopic.featured_video = self.other
        with self.assertRaises(ValidationError):
            self.subtopic.full_clean()
        form = SubtopicAdminForm(instance=self.subtopic)
        self.assertEqual(list(form.fields["featured_video"].queryset), [self.video])
        self.assertFalse(SubtopicAdminForm().fields["featured_video"].queryset.exists())
        form = SubtopicAdminForm(data={
            "name": self.subtopic.name, "topic": self.topic.pk, "order": 0,
            "featured_video": self.other.pk,
        }, instance=self.subtopic)
        self.assertFalse(form.is_valid())
        self.assertIn("featured_video", form.errors)
        self.subtopic.featured_video = self.video
        self.subtopic.full_clean()
        form = SubtopicAdminForm(data={
            "name": self.subtopic.name, "topic": self.topic.pk, "order": 0,
            "featured_video": self.video.pk,
        }, instance=self.subtopic)
        self.assertTrue(form.is_valid(), form.errors)
        saved = form.save()
        self.assertEqual(saved.featured_video_id, self.video.pk)

    def test_admin_api_selects_and_clears_feature(self):
        self.client.force_authenticate(self.admin)
        response = self.client.patch(self.url, {"featured_video": self.video.pk}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["featured_video"], self.video.pk)
        self.assertEqual(response.data["featured_video_data"]["video_id"], self.video.video_id)
        response = self.client.patch(self.url, {"featured_video": self.other.pk}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("featured_video", response.data)
        response = self.client.patch(self.url, {"featured_video": None}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.data["featured_video_data"])
        self.subtopic.refresh_from_db()
        self.assertIsNone(self.subtopic.featured_video_id)

    def test_public_and_regular_users_read_but_cannot_edit(self):
        for user in (None, self.user):
            self.client.force_authenticate(user)
            self.assertEqual(self.client.get(self.url).status_code, 200)
            response = self.client.patch(self.url, {"featured_video": self.video.pk}, format="json")
            self.assertIn(response.status_code, (401, 403))
        self.subtopic.refresh_from_db()
        self.assertIsNone(self.subtopic.featured_video_id)

    def test_feature_is_embedded_without_video_list_lookup_and_preserves_context(self):
        self.feature_video()
        self.video.userLikes.add(self.user)
        self.client.force_authenticate(self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.data["featured_video_data"]["id"], self.video.pk)
        self.assertTrue(response.data["featured_video_data"]["is_liked_by_user"])
        response = self.client.get(f"/api/topics/{self.topic.pk}/")
        self.assertEqual(response.status_code, 200)
        feature = response.data["subtopics"][0]["featured_video_data"]
        self.assertEqual(feature["video_id"], self.video.video_id)
        self.assertTrue(feature["is_liked_by_user"])

    def test_removed_membership_suppresses_feature(self):
        self.feature_video()
        self.video.subtopics.remove(self.subtopic)
        response = self.client.get(self.url)
        self.assertIsNone(response.data["featured_video"])
        self.assertIsNone(response.data["featured_video_data"])

    def test_deleted_video_clears_feature(self):
        self.feature_video()
        self.video.delete()
        self.subtopic.refresh_from_db()
        self.assertIsNone(self.subtopic.featured_video_id)
        response = self.client.get(self.url)
        self.assertIsNone(response.data["featured_video"])
        self.assertIsNone(response.data["featured_video_data"])

    def test_new_subtopic_cannot_feature_unassigned_video(self):
        self.client.force_authenticate(self.admin)
        response = self.client.post("/api/subtopics/", {
            "name": "New sample", "topic": self.topic.pk, "featured_video": self.video.pk,
        }, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("featured_video", response.data)

    def test_journal_preview_preserves_http_on_loopback(self):
        Journal.objects.create(subtopic=self.subtopic, title="Sample journal", pdf="journals/sample.pdf")
        response = self.client.get(self.url, HTTP_HOST="127.0.0.1:8127")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["journals"][0]["pdf"],
                         "http://127.0.0.1:8127/media/journals/sample.pdf")


class DiscoveryScheduleTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.topic = Topic.objects.create(name="General learning", order=7)
        cls.subtopic = Subtopic.objects.create(name="A subject", topic=cls.topic, order=3)
        cls.admin = get_user_model().objects.create_user(username="schedule-editor", is_staff=True)

    def test_empty_defaults_are_independent_and_exposed_with_order(self):
        self.assertEqual(self.topic.discovery_schedule, [])
        self.assertEqual(self.subtopic.discovery_schedule, [])
        response = APIClient().get(f"/api/topics/{self.topic.pk}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["order"], 7)
        self.assertEqual(response.data["discovery_schedule"], [])
        self.assertEqual(response.data["subtopics"][0]["order"], 3)
        self.assertEqual(response.data["subtopics"][0]["discovery_schedule"], [])
        one = Topic(name="One")
        two = Topic(name="Two")
        one.discovery_schedule.append({"weekdays": [5]})
        self.assertEqual(two.discovery_schedule, [])

    def test_valid_rules_round_trip_through_model_and_api(self):
        schedule = [
            {"weekdays": [0, 6], "hebrew_months": ["Adar I", "Adar II"], "hebrew_days": [1, 30],
             "gregorian_months": [1, 12], "starts_on": "2028-02-29", "ends_on": "2028-03-01", "priority": 100},
            {"calendar_refs": ["Genesis 12:1-17:27"]},
            {"ends_on": "2029-12-31", "priority": 1},
        ]
        client = APIClient()
        client.force_authenticate(self.admin)
        for instance, resource in ((self.topic, "topics"), (self.subtopic, "subtopics")):
            instance.discovery_schedule = schedule
            instance.full_clean()
            response = client.patch(f"/api/{resource}/{instance.pk}/", {"discovery_schedule": schedule}, format="json")
            self.assertEqual(response.status_code, 200, response.data)
            self.assertEqual(response.data["discovery_schedule"], schedule)
            instance.refresh_from_db()
            self.assertEqual(instance.discovery_schedule, schedule)
        self.topic.discovery_schedule = [{"weekdays": [5]}] * 24
        self.topic.full_clean()

    def test_invalid_shapes_values_and_dates_fail_model_and_serializer(self):
        invalid = [
            None, {}, "[]", True, [None], [True], [{}], [{"priority": 10}],
            [{"weekdays": [5], "unknown": True}], [{"weekdays": []}], [{"weekdays": [True]}],
            [{"weekdays": [-1]}], [{"weekdays": [7]}], [{"weekdays": "5"}],
            [{"hebrew_days": [0]}], [{"hebrew_days": [31]}], [{"hebrew_days": [1.5]}],
            [{"gregorian_months": []}], [{"gregorian_months": [13]}],
            [{"hebrew_months": []}], [{"hebrew_months": ["Tishrei"]}], [{"hebrew_months": [True]}],
            [{"weekdays": [5], "priority": True}], [{"weekdays": [5], "priority": 0}],
            [{"weekdays": [5], "priority": 101}], [{"weekdays": [5], "priority": 1.5}],
            [{"starts_on": "2027-02-29"}], [{"starts_on": "20270101"}],
            [{"starts_on": "2027-01-01T00:00:00Z"}], [{"ends_on": False}],
            [{"starts_on": "2027-02-01", "ends_on": "2027-01-31"}],
            [{"calendar_refs": []}], [{"calendar_refs": "Genesis 1"}], [{"calendar_refs": [""]}],
            [{"calendar_refs": ["   "]}], [{"calendar_refs": [False]}],
            [{"calendar_refs": ["x" * 256]}], [{"calendar_refs": ["Genesis 1"] * 21}],
            [{"weekdays": [5]}] * 25,
        ]
        for schedule in invalid:
            for instance, serializer_class in ((self.topic, TopicSerializer), (self.subtopic, SubtopicSerializer)):
                with self.subTest(schedule=schedule, model=type(instance).__name__):
                    instance.discovery_schedule = schedule
                    with self.assertRaises(ValidationError):
                        instance.full_clean()
                    serializer = serializer_class(instance, data={"discovery_schedule": schedule}, partial=True)
                    self.assertFalse(serializer.is_valid())
                    self.assertIn("discovery_schedule", serializer.errors)

    def test_admin_forms_validate_and_blank_input_clears_schedule(self):
        for instance, form_class in ((self.topic, TopicAdminForm), (self.subtopic, SubtopicAdminForm)):
            fields = {"name": instance.name, "order": instance.order}
            if isinstance(instance, Subtopic):
                fields["topic"] = self.topic.pk
            for raw, valid in (("", True), ("[]", True), ("null", False),
                               (json.dumps([{"weekdays": [5]}]), True),
                               (json.dumps([{"weekdays": [True]}]), False)):
                with self.subTest(model=type(instance).__name__, raw=raw):
                    form = form_class(data={**fields, "discovery_schedule": raw}, instance=instance)
                    self.assertEqual(form.is_valid(), valid, form.errors)
                    if valid:
                        self.assertIsInstance(form.cleaned_data["discovery_schedule"], list)
                    else:
                        self.assertIn("discovery_schedule", form.errors)
            help_text = form_class(instance=instance).fields["discovery_schedule"].help_text
            self.assertIn("Rules are OR", help_text)
            self.assertIn("civil date", help_text)
            self.assertIn("calendar_refs", help_text)

    def test_anonymous_clients_can_read_but_cannot_change_editorial_schedule(self):
        client = APIClient()
        for resource, instance in (("topics", self.topic), ("subtopics", self.subtopic)):
            url = f"/api/{resource}/{instance.pk}/"
            self.assertEqual(client.get(url).status_code, 200)
            response = client.patch(url, {"discovery_schedule": [{"weekdays": [5]}]}, format="json")
            self.assertIn(response.status_code, (401, 403))


class DiscoveryConfigCommandTests(TestCase):
    def setUp(self):
        from pathlib import Path
        self.manifest_path = Path("reviewed-discovery.json")
        self.topic = Topic.objects.create(name="General")
        self.subtopic = Subtopic.objects.create(name="Subject", topic=self.topic)
        self.video = Video.objects.create(video_id="reviewed", title="Reviewed teaching")
        self.video.subtopics.add(self.subtopic)
        self.journal = Journal.objects.create(subtopic=self.subtopic, title="Journal", pdf="journals/preserved.pdf")
        self.manifest = {
            "schema_version": 1,
            "topics": [{"id": self.topic.pk, "name": self.topic.name, "order": 10, "discovery_schedule": []}],
            "subtopics": [{"id": self.subtopic.pk, "name": self.subtopic.name,
                          "topic": {"id": self.topic.pk, "name": self.topic.name},
                          "order": 20, "discovery_schedule": [{"weekdays": [5]}],
                          "description": "Reviewed introduction", "sefaria_text": "Genesis 1",
                          "featured_video": self.video.pk}],
        }

    def run_manifest(self, *args):
        from io import StringIO
        from unittest.mock import patch
        from django.core.management import call_command
        output = StringIO()
        with patch("topics.management.commands.apply_discovery_config.Path.read_text", return_value=json.dumps(self.manifest)):
            call_command("apply_discovery_config", str(self.manifest_path), *args, stdout=output)
        return json.loads(output.getvalue())

    def test_dry_run_is_read_only_then_apply_is_idempotent_and_preserves_materials(self):
        report = self.run_manifest("--dry-run")
        self.assertEqual(report["records_changed"], 2)
        self.topic.refresh_from_db()
        self.subtopic.refresh_from_db()
        self.assertEqual(self.topic.order, 0)
        self.assertIsNone(self.subtopic.description)
        self.assertIsNone(self.subtopic.featured_video_id)
        report = self.run_manifest()
        self.assertEqual(report["mode"], "applied")
        self.subtopic.refresh_from_db()
        self.assertEqual(self.subtopic.featured_video_id, self.video.pk)
        self.assertEqual(self.subtopic.discovery_schedule, [{"weekdays": [5]}])
        self.assertEqual(self.subtopic.videos.get().pk, self.video.pk)
        self.assertEqual(self.subtopic.journals.get().pk, self.journal.pk)
        self.journal.refresh_from_db()
        self.assertEqual(self.journal.pdf.name, "journals/preserved.pdf")
        self.assertEqual(self.run_manifest()["records_changed"], 0)

    def test_conflicting_nonempty_metadata_requires_explicit_reviewed_override(self):
        from django.core.management.base import CommandError
        self.topic.order = 99
        self.topic.save(update_fields=["order"])
        with self.assertRaisesMessage(CommandError, "Nonempty metadata conflicts"):
            self.run_manifest("--dry-run")
        self.assertEqual(Subtopic.objects.get(pk=self.subtopic.pk).order, 0)
        report = self.run_manifest("--overwrite-reviewed")
        self.assertEqual(len(report["conflicts"]), 1)
        self.assertEqual(Topic.objects.get(pk=self.topic.pk).order, 10)

    def test_all_identities_and_parent_memberships_validate_before_any_save(self):
        from django.core.management.base import CommandError
        for key, value in (("name", "Wrong subject"), ("topic", {"id": self.topic.pk, "name": "Wrong parent"})):
            original = self.manifest["subtopics"][0][key]
            self.manifest["subtopics"][0][key] = value
            with self.assertRaises(CommandError):
                self.run_manifest("--overwrite-reviewed")
            self.assertEqual(Topic.objects.get(pk=self.topic.pk).order, 0)
            self.manifest["subtopics"][0][key] = original

    def test_invalid_schedule_or_unrelated_feature_aborts_every_update(self):
        from django.core.management.base import CommandError
        for key, value in (("discovery_schedule", [{"weekdays": [True]}]), ("featured_video", 999999)):
            original = self.manifest["subtopics"][0][key]
            self.manifest["subtopics"][0][key] = value
            with self.assertRaises(CommandError):
                self.run_manifest("--overwrite-reviewed")
            self.assertEqual(Topic.objects.get(pk=self.topic.pk).order, 0)
            self.manifest["subtopics"][0][key] = original

    def test_unknown_fields_and_duplicate_records_are_rejected(self):
        from django.core.management.base import CommandError
        self.manifest["topics"][0]["delete"] = True
        with self.assertRaises(CommandError):
            self.run_manifest()
        del self.manifest["topics"][0]["delete"]
        self.manifest["topics"].append(self.manifest["topics"][0].copy())
        with self.assertRaises(CommandError):
            self.run_manifest()
        self.assertEqual(Topic.objects.get(pk=self.topic.pk).order, 0)

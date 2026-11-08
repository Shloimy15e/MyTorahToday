"""Apply a reviewed, identity-checked discovery/content manifest atomically."""
import json
from pathlib import Path

from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from topics.models import Subtopic, Topic


class Command(BaseCommand):
    help = "Validate and apply reviewed topic/subtopic metadata without changing memberships or journals."

    def add_arguments(self, parser):
        parser.add_argument("manifest", type=Path)
        parser.add_argument("--dry-run", action="store_true", help="Print the complete change/conflict report without saving.")
        parser.add_argument("--overwrite-reviewed", action="store_true", help="Apply manifest values over conflicting nonempty metadata after reviewing the dry run.")

    def handle(self, *args, **options):
        try:
            manifest = json.loads(options["manifest"].read_text(encoding="utf-8"))
        except (OSError, ValueError) as error:
            raise CommandError(f"Cannot read manifest: {error}") from error
        if not isinstance(manifest, dict) or set(manifest) - {"schema_version", "topics", "subtopics", "sources"}:
            raise CommandError("Manifest must be an object with schema_version, topics and subtopics.")
        if type(manifest.get("schema_version")) is not int or manifest["schema_version"] != 1:
            raise CommandError("Manifest schema_version must be 1.")
        if not all(isinstance(manifest.get(key), list) for key in ("topics", "subtopics")):
            raise CommandError("Manifest topics and subtopics must both be lists.")
        if not manifest["topics"] and not manifest["subtopics"]:
            raise CommandError("Manifest must contain at least one record.")

        changes = []
        conflicts = []
        pending = []
        with transaction.atomic():
            for collection, model in (("topics", Topic), ("subtopics", Subtopic)):
                seen = set()
                for record in manifest[collection]:
                    allowed = {"id", "name", "order", "discovery_schedule"}
                    required = {"id", "name"}
                    if model is Subtopic:
                        allowed |= {"topic", "description", "sefaria_text", "featured_video"}
                        required.add("topic")
                    if not isinstance(record, dict) or set(record) - allowed or not required <= set(record):
                        raise CommandError(f"Invalid {collection} record fields: {record!r}")
                    identifier = record["id"]
                    if type(identifier) is not int or identifier < 1 or identifier in seen:
                        raise CommandError(f"Invalid or duplicate {collection} ID: {identifier!r}")
                    seen.add(identifier)
                    instance = model.objects.select_for_update().filter(pk=identifier).first()
                    if instance is None or instance.name != record["name"]:
                        raise CommandError(f"Identity mismatch for {collection} ID {identifier}: expected name {record['name']!r}.")
                    if model is Subtopic:
                        topic = record["topic"]
                        if not isinstance(topic, dict) or set(topic) != {"id", "name"} or type(topic["id"]) is not int:
                            raise CommandError(f"Subtopic {identifier}: topic must contain its verified id and name.")
                        if instance.topic_id != topic["id"] or instance.topic.name != topic["name"]:
                            raise CommandError(f"Parent topic mismatch for subtopic {identifier}.")
                    updates = {}
                    for field in set(record) - required:
                        after = record[field]
                        if field == "order" and type(after) is not int:
                            raise CommandError(f"{collection} {identifier}: order must be an integer.")
                        if field == "featured_video" and after is not None and (type(after) is not int or after < 1):
                            raise CommandError(f"Subtopic {identifier}: featured_video must be a positive database ID or null.")
                        if field in {"description", "sefaria_text"} and after is not None and not isinstance(after, str):
                            raise CommandError(f"Subtopic {identifier}: {field} must be text or null.")
                        attribute = "featured_video_id" if field == "featured_video" else field
                        before = getattr(instance, attribute)
                        if before != after:
                            updates[field] = {"before": before, "after": after}
                            if before not in (None, "", [], 0):
                                conflicts.append({"model": collection, "id": identifier, "field": field, "before": before, "after": after})
                            setattr(instance, attribute, after)
                    try:
                        instance.full_clean()
                    except ValidationError as error:
                        raise CommandError(f"Invalid {collection} {identifier}: {error}") from error
                    if updates:
                        changes.append({"model": collection, "id": identifier, "name": instance.name, "fields": updates})
                        pending.append((instance, list(updates)))
            blocked = bool(conflicts and not options["overwrite_reviewed"])
            report = {"mode": "dry-run" if options["dry_run"] else "blocked" if blocked else "applied",
                      "records_checked": len(manifest["topics"]) + len(manifest["subtopics"]),
                      "records_changed": len(changes), "changes": changes, "conflicts": conflicts}
            if blocked:
                self.stdout.write(json.dumps(report, indent=2, ensure_ascii=False))
                raise CommandError("Nonempty metadata conflicts found; no records changed. Review the report before using --overwrite-reviewed.")
            if not options["dry_run"]:
                for instance, fields in pending:
                    instance.save(update_fields=fields)
            self.stdout.write(json.dumps(report, indent=2, ensure_ascii=False))

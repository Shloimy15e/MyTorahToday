from django.db import models
from django.core.exceptions import ValidationError
from datetime import date
import re


HEBREW_MONTHS = {
    "Tishri", "Heshvan", "Kislev", "Tevet", "Shevat", "Adar", "Adar I", "Adar II",
    "Nisan", "Iyar", "Sivan", "Tamuz", "Av", "Elul",
}
DISCOVERY_SCHEDULE_HELP = (
    'Optional discovery windows by civil date, not ritual timing. Use [] for stable editorial order. '
    'Rules are OR; fields within each rule are AND. Up to 24 rules. '
    'Examples: [{"weekdays":[5],"priority":20}] for Fridays (Sunday=0); '
    '[{"hebrew_months":["Kislev"],"hebrew_days":[25,26,27,28,29,30]}] for recurring Hebrew dates; '
    '[{"starts_on":"2027-01-01","ends_on":"2027-01-31"}] for a Gregorian date window. '
    'Use calendar_refs, for example ["Genesis 12:1-17:27"], to match current external calendar references '
    'independently of source reading. Also supports gregorian_months [1..12]. '
    'Hebrew days are 1..30. Priority is 1..100 (default 10).'
)


def validate_discovery_schedule(value):
    if not isinstance(value, list) or len(value) > 24:
        raise ValidationError("Use a list containing at most 24 discovery rules.")
    date_fields = {"weekdays", "hebrew_months", "hebrew_days", "gregorian_months", "starts_on", "ends_on", "calendar_refs"}
    numeric_ranges = {"weekdays": (0, 6), "hebrew_days": (1, 30), "gregorian_months": (1, 12)}
    for index, rule in enumerate(value, start=1):
        prefix = f"Rule {index}: "
        if not isinstance(rule, dict):
            raise ValidationError(prefix + "each rule must be an object.")
        if set(rule) - (date_fields | {"priority"}):
            raise ValidationError(prefix + "contains an unknown field.")
        if not date_fields.intersection(rule):
            raise ValidationError(prefix + "include at least one date predicate.")
        priority = rule.get("priority", 10)
        if type(priority) is not int or not 1 <= priority <= 100:
            raise ValidationError(prefix + "priority must be an integer from 1 to 100.")
        for field, (minimum, maximum) in numeric_ranges.items():
            if field in rule:
                items = rule[field]
                if not isinstance(items, list) or not items or any(
                    type(item) is not int or not minimum <= item <= maximum for item in items
                ):
                    raise ValidationError(prefix + f"{field} must be a nonempty integer list from {minimum} to {maximum}.")
        if "hebrew_months" in rule:
            months = rule["hebrew_months"]
            if not isinstance(months, list) or not months or any(
                not isinstance(month, str) or month not in HEBREW_MONTHS for month in months
            ):
                raise ValidationError(prefix + "hebrew_months must contain canonical English Hebrew month names.")
        if "calendar_refs" in rule:
            references = rule["calendar_refs"]
            if not isinstance(references, list) or not 1 <= len(references) <= 20 or any(
                not isinstance(reference, str) or not reference.strip() or len(reference) > 255
                for reference in references
            ):
                raise ValidationError(prefix + "calendar_refs must contain 1 to 20 nonempty reference strings of at most 255 characters.")
        dates = {}
        for field in ("starts_on", "ends_on"):
            if field in rule:
                raw = rule[field]
                if not isinstance(raw, str) or not re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", raw):
                    raise ValidationError(prefix + f"{field} must be a YYYY-MM-DD date.")
                try:
                    dates[field] = date.fromisoformat(raw)
                except ValueError as error:
                    raise ValidationError(prefix + f"{field} is not a valid date.") from error
        if "starts_on" in dates and "ends_on" in dates and dates["ends_on"] < dates["starts_on"]:
            raise ValidationError(prefix + "ends_on must be on or after starts_on.")


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
    discovery_schedule = models.JSONField(
        default=list, blank=True, validators=[validate_discovery_schedule], help_text=DISCOVERY_SCHEDULE_HELP,
    )

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return self.name

    def clean(self):
        super().clean()
        try:
            validate_discovery_schedule(self.discovery_schedule)
        except ValidationError as error:
            raise ValidationError({"discovery_schedule": error.messages}) from error

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
    featured_video = models.ForeignKey(
        "videos.Video", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="featured_in_subtopics",
    )
    order = models.IntegerField(default=0, db_index=True)
    discovery_schedule = models.JSONField(
        default=list, blank=True, validators=[validate_discovery_schedule], help_text=DISCOVERY_SCHEDULE_HELP,
    )

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return self.name

    def clean(self):
        super().clean()
        try:
            validate_discovery_schedule(self.discovery_schedule)
        except ValidationError as error:
            raise ValidationError({"discovery_schedule": error.messages}) from error
        if self.featured_video_id and (
            not self.pk or not self.videos.filter(pk=self.featured_video_id).exists()
        ):
            raise ValidationError({
                "featured_video": "Choose a video assigned to this subtopic."
            })


class Journal(models.Model):
    subtopic = models.ForeignKey(Subtopic, on_delete=models.CASCADE, related_name="journals")
    title = models.CharField(max_length=255)
    pdf = models.FileField(upload_to="journals/")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.subtopic.name})"

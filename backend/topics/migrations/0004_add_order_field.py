"""
Add an `order` field to Topic and Subtopic, then populate it
following the traditional Tanach sequence:
  Torah parshahs → Nevi'im → Kesuvim (+ Chassidus, Life's ways last).

Subtopics are matched case-insensitively by name so the migration
is resilient to minor spelling differences in the production DB.
"""

import re
from django.db import migrations, models


# ── Topic ordering ────────────────────────────────────────────────
TOPIC_ORDER = {
    "parshah": 1,
    "neviim": 2,
    "chassidus": 3,
    "lifes ways": 4,
}

# ── Subtopic ordering — Tanach sequence ───────────────────────────
# Each entry is (regex_pattern, order_value).
# Matched case-insensitively against subtopic.name.
# Parshahs first (Bereishis…Vezos Haberacha), then Nevi'im in
# canonical order (Yehoshua…Trei Asar), then everything else.

SUBTOPIC_ORDER = [
    # ── Torah / Parshahs ──────────────────────────────────────────
    # Sefer Bereishis
    (r"^Be?re[i']?[sz]h?i[st]$", 1),
    (r"^Noach$", 2),
    (r"^Lech[\s-]*[Ll]echa$", 3),
    (r"^Vaye[ie]?ra$", 4),
    (r"^Cha(?:yei|ya)[\s-]*Sara[h]?$", 5),
    (r"^Told[oa][st]$", 6),
    (r"^Vaye[ie]?tzei$", 7),
    (r"^Va'?yislach$|^Vayishlach$", 8),
    (r"^Vaye[i]?shev$", 9),
    (r"^Mike?[ie]?tz$", 10),
    (r"^Vayigash$", 11),
    (r"^Vaye?chi$|^Vayechy$", 12),

    # Sefer Shemos
    (r"^Sh[ei]?mo[st]$", 13),
    (r"^Va'?e?[ie]?ra$|^Vaera$", 14),
    (r"^Bo$", 15),
    (r"^B'?[Ee]?shalach$", 16),
    (r"^Yi[st]ro$", 17),
    (r"^Mishpatim$", 18),
    (r"^Te?ruma[h]?$", 19),
    (r"^Te[tz]+ave[h]?$", 20),
    (r"^Ki[\s-]*(?:Tisa|Sisa)$", 21),
    (r"^Vayakhel$", 22),
    (r"^P[ie]kudei$|^Pekudei$", 23),

    # Sefer Vayikra
    (r"^Vayikra$", 24),
    (r"^Tzav$", 25),
    (r"^Shm?ini$|^Shemini$", 26),
    (r"^Tazria[\s-]*Metzora$", 27),
    (r"^Tazria$", 28),
    (r"^Metzora$", 29),
    (r"^Ach[a]?rei[\s-]*Mot?$", 30),
    (r"^Kedoshim$", 31),
    (r"^Emor$", 32),
    (r"^B'?[Ee]har$", 33),
    (r"^Bechuko[st]ai$", 34),

    # Sefer Bamidbar
    (r"^Bamidbar$", 35),
    (r"^Nass?o$", 36),
    (r"^B[Hh]?[Ee]?[Hh]?[Aa]?'?[Aa]?los[ec]?h?a$|^Behaaloscha$|^Behaalosecha$", 37),
    (r"^Sh[e']?lach$", 38),
    (r"^Korach$", 39),
    (r"^Chuka[st]$", 40),
    (r"^Balak$", 41),
    (r"^Pinchas$", 42),
    (r"^Matot[\s-]*Ma[sa]+ei$", 43),
    (r"^Matot$|^Matos$", 44),
    (r"^Ma[sa]+ei$", 45),

    # Sefer Devarim
    (r"^Dev[ao]rim$", 46),
    (r"^V[a']'?e[st]chanan$|^Vaetchanan$", 47),
    (r"^Eikev$|^Ekev$", 48),
    (r"^Re'?eh$", 49),
    (r"^Shoftim$", 50),
    (r"^Ki[\s-]*(?:Teit?zei|Seit?zei)$", 51),
    (r"^Ki[\s-]*(?:Tavo|Savo|Savoi)$", 52),
    (r"^Ni?tzavim$|^Netzavim$", 53),
    (r"^Vaye[ie]?l[ae]ch$", 54),
    (r"^Ha'?[Aa]zinu$", 55),
    (r"^V'?[Zz]os[\s-]*Ha[bB]e?r[ao]cha[h]?$|^Vezos[\s-]*Ha[bB]e?r[ao]cha[h]?$", 56),

    # ── Nevi'im (canonical Tanach order) ──────────────────────────
    # Yehoshua — not in DB yet, but future-proof
    (r"^Yehoshua$", 100),
    # Shoftim (Judges) would conflict with parshah, skip
    (r"^Shmuel[\s-]*A$|^Shmuel[\s-]*1$", 101),
    (r"^Shmuel[\s-]*B$|^Shmuel[\s-]*2$|^Shmuel[\s-]*Beis$", 102),
    (r"^Mel[aq]chim[\s-]*A$|^Mel[aq]chim[\s-]*1$", 103),
    (r"^Mel[aq]chim[\s-]*B$|^Mel[aq]chim[\s-]*2$|^Mel[aq]chim[\s-]*Beis$", 104),
    (r"^Yeshayahu$", 105),
    (r"^Yirmiyahu$", 106),
    (r"^Yechezkel$", 107),

    # ── Mo'adim / Holidays (chronological by Jewish calendar) ─────
    (r"^Rosh[\s-]*Ha[Ss]hana[h]?$", 200),
    (r"^Aseres[\s-]*Yemei", 201),
    (r"^Yom[\s-]*Kippur$", 202),
    (r"^Sukk[oa][st]?$", 203),
    (r"^Chanuk[ah]+$", 204),
    (r"^Tu[\s-]*B'?[Ss]hvat$", 205),
    (r"^Purim$|^Megillah$", 206),
    (r"^Pesach$", 207),
    (r"^Sefiras?[\s-]*Ha'?[Oo]mer$", 208),
    (r"^Lag[\s-]*B[a']'?omer$", 209),
    (r"^Shavu[oi][st]$", 210),
    (r"^17[\s-]*of[\s-]*Tamuz$|^Shiv'?ah?[\s-]*Assar$", 211),
    (r"^Bein[\s-]*Ham['\s]*tzarim$", 212),
    (r"^Tish[a']?h?[\s-]*B[e']*[Aa]v$", 213),
    (r"^Tu[\s-]*B'?[Aa]v$", 214),
    (r"^S[ei]?lichos$|^Elul$", 215),
    (r"^Nachamu$", 216),
    (r"^Shabbos$", 217),

    # ── Chassidus ─────────────────────────────────────────────────
    (r"^Baal[\s-]*Shem[\s-]*Tov$", 300),
    (r"^Maggid$", 301),
    (r"^R[eb']*[\s-]*Nachman$|^Rebbe[\s-]*Nachman$", 302),
    (r"^Reb[\s-]*Nosson$|^Breslov$", 303),
    (r"^Baal[\s-]*Hatanya$|^Bal[\s-]*Hatanya$", 304),
    (r"^Reb[\s-]*Shayala$", 305),
    (r"^Yud[\s-]*Shevat$|^Yud[\s-]*Shvat$", 306),
    (r"^Chassidic", 307),
    (r"^Ropshitzer$", 308),

    # ── Life's Ways / Other ───────────────────────────────────────
    (r"^Smarts$", 400),
    (r"^Mashiach$", 401),
    (r"^Eretz[\s-]*Yisra?[oe]+l$", 402),
    (r"^Other$", 403),
]


def set_order(apps, schema_editor):
    Topic = apps.get_model("topics", "Topic")
    Subtopic = apps.get_model("topics", "Subtopic")

    # ── Topics ────────────────────────────────────────────────────
    for topic in Topic.objects.all():
        key = topic.name.strip().lower()
        topic.order = TOPIC_ORDER.get(key, 999)
        topic.save(update_fields=["order"])

    # ── Subtopics ─────────────────────────────────────────────────
    for subtopic in Subtopic.objects.all():
        name = subtopic.name.strip()
        matched = False
        for pattern, order_val in SUBTOPIC_ORDER:
            if re.search(pattern, name, re.IGNORECASE):
                subtopic.order = order_val
                subtopic.save(update_fields=["order"])
                matched = True
                break
        if not matched:
            # Unmatched subtopics get a high order so they sort last
            subtopic.order = 999
            subtopic.save(update_fields=["order"])


def reverse_order(apps, schema_editor):
    """Set all orders back to 0 on reverse."""
    Topic = apps.get_model("topics", "Topic")
    Subtopic = apps.get_model("topics", "Subtopic")
    Topic.objects.all().update(order=0)
    Subtopic.objects.all().update(order=0)


class Migration(migrations.Migration):

    dependencies = [
        ("topics", "0003_alter_subtopic_sefaria_text"),
    ]

    operations = [
        migrations.AddField(
            model_name="topic",
            name="order",
            field=models.IntegerField(default=0, db_index=True),
        ),
        migrations.AddField(
            model_name="subtopic",
            name="order",
            field=models.IntegerField(default=0, db_index=True),
        ),
        migrations.AlterModelOptions(
            name="topic",
            options={"ordering": ["order", "name"]},
        ),
        migrations.AlterModelOptions(
            name="subtopic",
            options={"ordering": ["order", "name"]},
        ),
        migrations.RunPython(set_order, reverse_order),
    ]

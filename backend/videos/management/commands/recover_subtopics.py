"""
Management command to recover video-subtopic M2M links from video titles.

Run against production DB:
    python manage.py recover_subtopics --dry-run   # preview only
    python manage.py recover_subtopics              # actually write to DB
"""
import re
from django.core.management.base import BaseCommand
from videos.models import Video
from topics.models import Subtopic

# Maps title patterns -> production subtopic IDs
# Ordered: longest/most-specific patterns first to avoid false matches
PATTERN_MAP = [
    # Combined parshiot (must come before individual)
    (r'\bMatot[\s-]*Ma[sa]+ei\b', [28, 43]),
    (r'\bTazria[\s-]*Metzora\b', [116]),
    (r'\bAch[a]?rei[\s-]*Mot?\b', [86]),

    # Multi-word parshiot
    (r"\bCha(?:yei|ya)[\s-]*Sara[h]?\b", [58]),
    (r"\bLech[\s-]*Lecha\b", [60]),
    (r"\bKi[\s-]*(?:Tisa|Sisa)\b", [49]),
    (r"\bKi[\s-]*(?:Tavo|Savo|Savoi)\b", [40]),
    (r"\bKi[\s-]*(?:Teit?zei|Seit?zei)\b", [39]),
    (r"\bV'?[Zz]ot[\s-]*Ha[Bb]e?racha[h]?\b", [73]),
    (r"\bVezos[\s-]*Ha[bB]e?r[ao]cha[h]?\b", [73]),
    (r"\bHa'?[Aa]zinu\b", [72]),
    (r"\bSefiras?[\s-]*(?:Ha'?omer|Ha'?Omer)\b", [112]),
    (r"\bBein[\s-]*Ham['\s]*tzarim\b", [70]),

    # Neviim (numbered forms before bare names)
    (r"\bMel[aq]chim[\s-]*(?:2|[Bb]|Beis)\b", [100]),
    (r"\bMel[aq]chim[\s-]*(?:1|[Aa])\b", [22]),
    (r"\bMel[aq]chim\b", [22]),
    (r"\bShmuel[\s-]*(?:2|[Bb]|Beis|Bais)\b", [23]),
    (r"\bShmuel[\s-]*(?:1|[Aa])\b", [24]),
    (r"\bShmuel[\s-]*(?:[12]?\d)\b", [24]),  # bare "Shmuel 9" etc -> Shmuel A
    (r"\bYeshayahu\b", [21]),

    # "Parshas X" patterns (before single-word to catch these first)
    (r"\bParshas[\s-]*B'?[Ss]halach\b", [45]),
    (r"\bParshas[\s-]*B'?[Hh]ar\b", [90]),
    (r"\bParshas[\s-]*Va'?yislach\b", [30]),
    (r"\bParshas[\s-]*Vaychi\b", [76]),
    (r"\bParshas[\s-]*Truma[h]?\b", [47]),

    # Single-word parshiot (word boundary)
    (r"\bBe?re[i']?[sz]h?i[st]\b", [74]),
    (r"\bNoach\b", [61]),
    (r"\bVaye[ie]?ra\b", [59]),
    (r"\bVayera\b", [59]),
    (r"\bTold[oa][st]\b", [32]),
    (r"\bVaye[ie]?tzei\b", [75]),
    (r"\bVa'?yislach\b", [30]),
    (r"\bVayishlach\b", [30]),
    (r"\bVaye[i]?shev\b", [57]),
    (r"\bMike?[ie]?tz\b", [62]),
    (r"\bVayigash\b", [56]),
    (r"\bVaye?chi\b", [76]),
    (r"\bVayechy\b", [76]),
    (r"\bSh[ei]?mo[st]\b", [31]),
    (r"\bVa'?e?[ie]?ra\b", [55]),
    (r"\bVaera\b", [55]),
    (r"\bB'?[Ee]?shalach\b", [45]),
    (r"\bYi[st]ro\b", [77]),
    (r"\bMishpatim\b", [46]),
    (r"\bTe?ruma[h]?\b", [47]),
    (r"\bTRUMA\b", [47]),
    (r"\bTe[tz]+ave[h]?\b", [63]),
    (r"\bVayakhel\b", [78]),
    (r"\bP[ie]kudei\b", [64]),
    (r"\bPekudei\b", [80]),
    (r"\bVayikra\b", [81]),
    (r"\bTzav\b", [82]),
    (r"\bShm?ini\b", [83]),
    (r"\bShemini\b", [83]),
    (r"\bTazria\b", [84]),
    (r"\bMetzora\b", [85]),
    (r"\bAch[a]?rei\b", [86]),
    (r"\bKedoshim\b", [87]),
    (r"\b[Bb][Hh]?[Ee]?[Hh]?[Aa]?'?[Aa]?[Ll][Oo][Ss][Ee]?[Cc]?[Hh]?[Aa]\b", [88]),
    (r"\bBeha'?a?los[ec]?h?a\b", [88]),
    (r"\bBehaalosecha\b", [88]),
    (r"\bSh[e']?lach\b", [29]),
    (r"\bKorach\b", [44]),
    (r"\bChukat?s?\b", [27]),
    (r"\bChutzpah\b", [51]),
    (r"\bBalak\b", [25]),
    (r"\bBilam\b", [25]),
    (r"\bPinchas\b", [26]),
    (r"\bNass?o\b", [93]),
    (r"\bBamidbar\b", [92]),
    (r"\bB'?[Ee]har\b", [90]),
    (r"\bBechuko[st]ai\b", [91]),
    (r"\bEmor\b", [89]),
    (r"\bDev[ao]rim\b", [1]),
    (r"\bV[a']'?e[st]chanan\b", [36]),
    (r"\bVaetchanan\b", [36]),
    (r"\bEikev\b", [37]),
    (r"\bEkev\b", [37]),
    (r"\bRe'?eh\b", [34]),
    (r"\bShoftim\b", [38]),
    (r"\bNi?tzavim\b", [41]),
    (r"\bNetzavim\b", [41]),
    (r"\bVaye[ie]?l[ae]ch\b", [66]),
    (r"\bMatot\b", [28]),
    (r"\bMATOS\b", [28]),
    (r"\bMa[sa]+ei\b", [43]),
    (r"\bBo\b", [54]),

    # Mo'adim (holidays)
    (r"\bPesach\b", [50]),
    (r"\bPurim\b", [48]),
    (r"\bMegillah\b", [48]),
    (r"\bChanuk[ah]+\b", [101]),
    (r"\bLag[\s-]*B[a']'?omer\b", [52]),
    (r"\bMeron\b", [52]),
    (r"\bSukk[oa][st]?\b", [99]),
    (r"\bHoshana[\s-]*Rabba[h]?\b", [99]),
    (r"\bShavu[oi][st]\b", [113]),
    (r"\bBikurim\b", [113]),
    (r"\bRosh[\s-]*Ha[Ss]hana[h]?\b", [94]),
    (r"\bYom[\s-]*Kippur\b", [42]),
    (r"\bS[ei]?lichos\b", [97]),
    (r"\bElul\b", [97]),
    (r"\bTu[\s-]*B'?[Aa]v\b", [71]),
    (r"\bTu[\s-]*B'?[Ss]hvat\b", [110]),
    (r"\bRosh[\s-]*Chodesh[\s-]*Sh'?vat\b", [110]),
    (r"\bAseres[\s-]*Yemei\b", [95]),
    (r"\bTen[\s-]*days[\s-]*of[\s-]*teshuva\b", [95]),
    (r"\bErev[\s-]*Sukkos\b", [99]),
    (r"\bErev[\s-]*Rosh\b", [94]),
    (r"\bAdar\b", [48]),
    (r"\bSefira\b", [112]),
    (r"\bYAT[\s-]*KISLEV\b", [104]),

    # Fast days
    (r"\bTish[a']?h?[\s-]*B[e']*[Aa]v\b", [69]),
    (r"\b17[\s-]*of[\s-]*Tamuz\b", [102]),
    (r"\bShiv'?ah?[\s-]*Assar\b", [102]),

    # Chassidus
    (r"\bBaal[\s-]*Shem[\s-]*Tov\b", [67]),
    (r"\bBaal[\s-]*Hatanya\b", [104]),
    (r"\bBal[\s-]*Hatanya\b", [104]),
    (r"\bR[eb']*[\s-]*Nachman\b", [96]),
    (r"\bReb[\s-]*Nosson\b", [103]),
    (r"\bBreslov\b", [103]),
    (r"\bMaggid\b", [108]),
    (r"\bReb[\s-]*Shayala\b", [115]),
    (r"\bYud[\s-]*Shevat\b", [111]),
    (r"\bYud[\s-]*Shvat\b", [111]),
    (r"\bRopshitzer\b", [33]),
    (r"\bZhviller\b", [33]),
    (r"\bShinever\b", [33]),
    (r"\bBardichivers?\b", [33]),
    (r"\bChidushei[\s-]*HaRim\b", [33]),
    (r"\bS'?fas[\s-]*Emes\b", [33]),
    (r"\bChasidic[\s-]*Tale\b", [33]),

    # Israel
    (r"\bEretz[\s-]*Yisra?[oe]+l\b", [105]),
    (r"\bTZFAS\b", [105]),
    (r"\bCHEVRON\b", [105]),
    (r"\bNETANYA\b", [105]),
    (r"\bISRAEL\b", [105]),
    (r"\bKIRYAT\b", [105]),

    # Life's Ways
    (r"\bMashiach\b", [53]),
    (r"\bShabbos\b", [114]),
    (r"\bNachamu\b", [68]),

    # Hebrew title patterns
    (r"פרשת חיי שרה", [58]),
    (r"פרשת וירא", [59]),
    (r"פרשת לך", [60]),
    (r"לך לך", [60]),
    (r"פרשת נח", [61]),
    (r"פרשת", [51]),
]

# Fallback subtopic for truly unmatched videos
FALLBACK_SUBTOPIC_ID = 51  # "Smarts" under Life's Ways


class Command(BaseCommand):
    help = "Recover video-subtopic M2M links by matching video titles"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Preview matches without writing to DB",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        videos = Video.objects.all()
        total = videos.count()

        matched = 0
        unmatched_videos = []

        for video in videos:
            # Skip videos that already have subtopics linked
            if video.subtopics.exists():
                matched += 1
                continue

            subtopic_ids = self._match_title(video.title)

            if subtopic_ids:
                matched += 1
                if not dry_run:
                    video.subtopics.add(*subtopic_ids)
                self.stdout.write(
                    f"  MATCH: [{video.video_id}] {video.title[:60]} -> subtopic IDs {subtopic_ids}"
                )
            else:
                unmatched_videos.append(video)
                if not dry_run:
                    video.subtopics.add(FALLBACK_SUBTOPIC_ID)
                self.stdout.write(
                    f"  FALLBACK: [{video.video_id}] {video.title[:60]} -> Smarts ({FALLBACK_SUBTOPIC_ID})"
                )

        self.stdout.write(f"\n{'DRY RUN - ' if dry_run else ''}Results:")
        self.stdout.write(f"  Total videos: {total}")
        self.stdout.write(f"  Matched: {matched}")
        self.stdout.write(f"  Fallback (Smarts): {len(unmatched_videos)}")
        self.stdout.write(f"\nUnmatched titles:")
        for v in unmatched_videos:
            self.stdout.write(f"  [{v.video_id}] {v.title[:80]}")

    def _match_title(self, title):
        for pattern, subtopic_ids in PATTERN_MAP:
            if re.search(pattern, title, re.IGNORECASE):
                # Verify the subtopic IDs exist
                valid_ids = list(
                    Subtopic.objects.filter(id__in=subtopic_ids).values_list("id", flat=True)
                )
                if valid_ids:
                    return valid_ids
        return None

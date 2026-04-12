"""Tests for the recover_subtopics management command's pattern matching."""
from django.test import TestCase

from videos.management.commands.recover_subtopics import PATTERN_MAP

import re


def match_title(title):
    """Reproduce the matching logic from the command."""
    for pattern, subtopic_ids in PATTERN_MAP:
        if re.search(pattern, title, re.IGNORECASE):
            return subtopic_ids
    return None


class TestParshiotMatching(TestCase):
    """Test that parsha names in titles match the correct subtopic IDs."""

    def test_standard_parsha_names(self):
        cases = [
            ("Bereshit: The secret of creation", [74]),
            ("Noach: Building the ark", [61]),
            ("Lech Lecha: Go for yourself", [60]),
            ("Vayera: Angels visit", [59]),
            ("Chayei Sarah: Life of Sarah", [58]),
            ("Toldot: The twins", [32]),
            ("Vayetzei: Jacob's ladder", [75]),
            ("Vayishlach: Wrestling with angel", [30]),
            ("Vayeshev: Joseph's dreams", [57]),
            ("Miketz: Pharaoh's dreams", [62]),
            ("Vayigash: Judah approaches", [56]),
            ("Vayechi: Jacob blesses", [76]),
            ("Shemot: Names", [31]),
            ("Vaera: I appeared", [55]),
            ("[#1181] Bo: Social media ban", [54]),
            ("Beshalach: Crossing the sea", [45]),
            ("Yitro: The ten commandments", [77]),
            ("Mishpatim: Laws", [46]),
            ("Terumah: Offerings", [47]),
            ("Tetzaveh: Command", [63]),
            ("Vayakhel: Assembly", [78]),
            ("Pikudei: Accounts", [64]),
            ("Vayikra: He called", [81]),
            ("Tzav: Command", [82]),
            ("Shmini: Eighth day", [83]),
            ("Tazria: She conceives", [84]),
            ("Metzora: The leper", [85]),
            ("Kedoshim: Holy ones", [87]),
            ("Emor: Say", [89]),
            ("Behar: On the mountain", [90]),
            ("Bechukotai: My statutes", [91]),
            ("Bamidbar: In the wilderness", [92]),
            ("Nasso: Elevate", [93]),
            ("Korach: Rebellion", [44]),
            ("Chukat: The red heifer", [27]),
            ("Balak: The enemy king", [25]),
            ("Pinchas: Zealotry", [26]),
            ("Matot: Tribes", [28]),
            ("Masei: Journeys", [43]),
            ("Devarim: Words", [1]),
            ("Vaetchanan: I pleaded", [36]),
            ("Eikev: Because", [37]),
            ("Shoftim: Judges", [38]),
            ("Ki Teitzei: When you go out", [39]),
            ("Ki Tavo: When you come in", [40]),
            ("Nitzavim: Standing", [41]),
            ("Vayeilech: And he went", [66]),
            ("Ha'Azinu: Listen", [72]),
        ]
        for title, expected_ids in cases:
            with self.subTest(title=title):
                result = match_title(title)
                self.assertEqual(result, expected_ids, f"Failed for: {title}")

    def test_combined_parshiot(self):
        self.assertEqual(match_title("Matot Masei: journeys"), [28, 43])
        self.assertEqual(match_title("Matot-Masei: combined"), [28, 43])
        self.assertEqual(match_title("Tazria-Metzora: double"), [116])
        self.assertEqual(match_title("Achrei Mot: after death"), [86])

    def test_alternate_spellings(self):
        """Many parsha names have multiple transliterations."""
        cases = [
            # Bereishis / Bereshit
            ("BEREISHIS: THE SECRET", [74]),
            ("Bereishit: first thing", [74]),
            # Vayeishev / Vayeshev
            ("[#1177] Vayeishev: Get your trauma out", [57]),
            # Mikeitz / Miketz
            ("[#1157] Mikeitz: Do you check Instagram", [62]),
            # Pekudei / Pikudei
            ("[#1165] Pekudei: Areleh and Avrum", [64]),
            # Shemini / Shmini
            ("[#1042] Shemini: Pigs don't get affected", [83]),
            # Va'eira / Vaera
            ("[#1180] Va'eira: Do you still celebrate", [55]),
            # Va'eschanan / Vaetchanan
            ("[#1118] Va'eschanan: Be a #TodayJew", [36]),
            ("V'ETCHANAN: SEEING ERETZ YISRAEL", [36]),
            # Behaalosecha / Beha'alotcha
            ("Behaalosecha: Humble yet FIERCE", [88]),
            ("BEHALOSECHA: IN TZFAS", [88]),
            ("BHALOSCHA: LOVE ALL PEOPLE", [88]),
            ("[#1072] Behaalosecha: Radishitz", [88]),
            # Vayelech / Vayeilech / Vayeilach
            ("[#1150] Vayelech: Your Davening", [66]),
            ("VAYEILACH: TURN UP THE MUSIC", [66]),
            # Chukas / Chukat
            ("Chukas: Just Because Therapy", [27]),
            # Ki Sisa / Ki Tisa
            ("[#777] Ki Sisa: What sinners gave", [49]),
            # Ki Savo / Ki Tavo / Ki Savoi
            ("KI SAVOI: A MESSAGE FOR THE HOLIER", [40]),
            # Vezos Habrocha / V'Zot HaBerachah
            ("[#913] Vezos Habrocha: The begger", [73]),
            # Devorim / Devarim
            ("Devorim: Who gets to Shmuess", [1]),
            # Maasei / Masei
            ("[1198] Maasei: Connect The Dots", [43]),
            # Naso / Nasso
            ("Naso: How To Get The Blessing", [93]),
            # Parshas prefix
            ("Parshas B'shalach: THE BEAUTY AROUND US", [45]),
            ("Parshas B'Har: lesson", [90]),
            ("Parshas Truma: CHODESH ADAR", [47]),
            ("Parshas Vaychi: Yes You Can", [76]),
        ]
        for title, expected_ids in cases:
            with self.subTest(title=title):
                result = match_title(title)
                self.assertEqual(result, expected_ids, f"Failed for: {title}")

    def test_uppercase_titles(self):
        """Older videos use ALL CAPS titles."""
        cases = [
            ("MIKETZ: HOW DO YOU COME OUT SATISFIED", [62]),
            ("VAYERA: FALL SEVEN TIMES, STAND UP EIGHT", [59]),
            ("VAYECHY: WHEN THINGS ARE OUT OF CONTROL", [76]),
            ("SHMOS: THE PLACE YOU'RE 'TODAY', IS HOLY", [31]),
            ("MATOS: THE NEDARIM TECHNIQUE", [28]),
            ("TRUMA", [47]),
        ]
        for title, expected_ids in cases:
            with self.subTest(title=title):
                result = match_title(title)
                self.assertEqual(result, expected_ids, f"Failed for: {title}")


class TestNeviimMatching(TestCase):
    """Test Neviim (Prophets) title matching."""

    def test_yeshayahu(self):
        result = match_title("[1321] Yeshayahu 32 - When fancy titles")
        self.assertEqual(result, [21])

    def test_melachim_a(self):
        result = match_title("Melachim 1 - 22 You can know everything")
        self.assertEqual(result, [22])

    def test_melachim_b(self):
        result = match_title("[1289] Melachim 2 - 25 Hashem set up the seeds")
        self.assertEqual(result, [100])

    def test_melachim_typo(self):
        result = match_title("[1281] Melqchim 2 - 17 No jew left behind")
        self.assertEqual(result, [100])

    def test_shmuel_a(self):
        result = match_title("Shmuel 1 - The beginning")
        self.assertEqual(result, [24])

    def test_shmuel_b(self):
        result = match_title("[1224] Shmuel Beis 8-9-10: Cutting Half a Beard")
        self.assertEqual(result, [23])

    def test_shmuel_bare_chapter(self):
        """'Shmuel 9' without A/B should map to Shmuel A."""
        result = match_title("[1209] Shmuel 9 - 10 When you think your small")
        self.assertEqual(result, [24])

    def test_shmuel_bais(self):
        result = match_title("[1221] Shmuel Bais 2-3: When you cut off your nose")
        self.assertEqual(result, [23])


class TestMoadimMatching(TestCase):
    """Test holiday/Mo'adim matching."""

    def test_pesach(self):
        self.assertEqual(match_title("Pesach: Korban Pesach"), [50])

    def test_purim(self):
        self.assertEqual(match_title("[#1169] Purim Kollel KJ"), [48])

    def test_megillah(self):
        self.assertEqual(match_title("Experiencing the Megillah Today"), [48])

    def test_chanukah(self):
        self.assertEqual(match_title("Chanukah lights"), [101])

    def test_lag_baomer(self):
        self.assertEqual(match_title("Lag Ba'omer inspiration"), [52])

    def test_meron(self):
        self.assertEqual(match_title("[1193] Meron: You don't need to figure out"), [52])

    def test_sukkos(self):
        self.assertEqual(match_title("Sukkos: Building the sukkah"), [99])

    def test_hoshana_rabbah(self):
        self.assertEqual(match_title("HOSHANA RABBAH ~ THOSE BEATEN PLACES"), [99])

    def test_rosh_hashana(self):
        self.assertEqual(match_title("Rosh Hashana message"), [94])

    def test_yom_kippur(self):
        self.assertEqual(match_title("Yom Kippur: atonement"), [42])

    def test_slichos(self):
        self.assertEqual(match_title("Slichos: why should I go"), [97])
        self.assertEqual(match_title("SELICHOS: VALUING YOUR RELATIONSHIP"), [97])

    def test_ten_days_of_teshuva(self):
        self.assertEqual(match_title("[#910] Ten days of teshuva: I could've"), [95])

    def test_sefira(self):
        self.assertEqual(match_title("Sefira: We are as strong"), [112])

    def test_adar(self):
        self.assertEqual(match_title("Parshas Truma ~ CHODESH ADAR"), [47])  # Truma matches first


class TestChassidusMatching(TestCase):
    def test_baal_shem_tov(self):
        self.assertEqual(match_title("Baal Shem Tov teaching"), [67])

    def test_rebbe_nachman(self):
        self.assertEqual(match_title("R' Nachman story"), [96])

    def test_reb_nosson(self):
        self.assertEqual(match_title("REB NOSSON, TUNE IN TO THE DIVINE"), [103])

    def test_chasidic_rebbe_names(self):
        self.assertEqual(match_title("Holy Bardichivers Yahrtzeit"), [33])
        self.assertEqual(match_title("Yahrtzeit of Ropshitzer Ruv"), [33])
        self.assertEqual(match_title("Yahrtzeit of the Holy Chidushei HaRim"), [33])

    def test_yat_kislev(self):
        self.assertEqual(match_title('YAT KISLEV: "LAUGH AND THE WORLD"'), [104])


class TestIsraelMatching(TestCase):
    def test_eretz_yisrael(self):
        self.assertEqual(match_title("ERETZ YISROEL: PREPARING"), [105])

    def test_locations(self):
        self.assertEqual(match_title("BEAUTIFUL NETANYA"), [105])

    def test_parsha_overrides_location(self):
        """When a title has both a parsha name and a location, parsha wins."""
        self.assertEqual(match_title("BEHALOSECHA: IN TZFAS"), [88])


class TestFastDaysMatching(TestCase):
    def test_17_of_tamuz(self):
        self.assertEqual(match_title("17 of Tamuz: Dont breach your Boundaries"), [102])

    def test_tisha_bav(self):
        self.assertEqual(match_title("Tishah Be'av mourning"), [69])


class TestFalsePositives(TestCase):
    """Ensure short parsha names don't match inside other words."""

    def test_bo_no_false_positives(self):
        """'Bo' should NOT match inside 'about', 'book', 'boring'."""
        self.assertIsNone(match_title("All about Torah learning"))
        self.assertIsNone(match_title("The boring parts of Torah"))
        self.assertIsNone(match_title("A book of wisdom"))

    def test_bo_real_match(self):
        self.assertEqual(match_title("[#1181] Bo: Social media ban"), [54])
        self.assertEqual(match_title("BO: HIGHER THAN WHAT YOU THOUGHT"), [54])

    def test_tzav_no_false_positive_in_nitzavim(self):
        """'Tzav' should NOT match inside 'Nitzavim'."""
        result = match_title("[#1149] Nitzavim: The Great Chazzan")
        self.assertEqual(result, [41])  # Should match Nitzavim, not Tzav

    def test_emor_no_false_positive(self):
        """'Emor' should NOT match inside 'memory'."""
        self.assertIsNone(match_title("The memory of a lifetime"))

    def test_naso_no_false_positive(self):
        self.assertIsNone(match_title("Targum Yonason Ben Uziel"))


class TestHebrewTitles(TestCase):
    def test_hebrew_parsha_names(self):
        self.assertEqual(
            match_title("פאר פרשת חיי שרה מיט הרב שלמה יוט גערמאן"), [58]
        )
        self.assertEqual(
            match_title("פארברענגען פרשת וירא - הרב שמעון סעמפ"), [59]
        )
        self.assertEqual(
            match_title("פרשת נח תשפ\"א"), [61]
        )


class TestFallback(TestCase):
    """Truly generic titles should return None (will get fallback in command)."""

    def test_generic_titles_return_none(self):
        generic = [
            "NEVER FORGET TO BE HAPPY",
            "HOW TO PRAY TO HASHEM?",
            "WHAT'S THE SECRET OF THE JEWISH POWER?",
            "VID 20131020 WA002",
            "THINKING POSITIVE",
            "PRISON BREAK",
        ]
        for title in generic:
            with self.subTest(title=title):
                self.assertIsNone(match_title(title), f"Should be None: {title}")

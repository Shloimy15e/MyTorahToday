"""Run the backend suite against in-memory SQLite without loading .env."""
import os


def main():
    os.environ["DJANGO_SETTINGS_MODULE"] = "mttBackend.settings"
    os.environ["DJANGO_SECRET_KEY"] = "isolated-security-test-secret"

    from django.conf import settings

    settings.DATABASES = {
        "default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}
    }
    settings.PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

    import django

    django.setup()
    from django.core.management import call_command

    call_command("check")
    call_command(
        "test", "api.tests", "videos.tests", "users", "topics",
        verbosity=2, interactive=False,
    )


if __name__ == "__main__":
    main()

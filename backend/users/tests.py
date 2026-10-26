import os
import runpy
from pathlib import Path
from unittest.mock import patch

from django.test import SimpleTestCase, TestCase, override_settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ImproperlyConfigured
from django.http import HttpResponse
from rest_framework.test import APIClient


class DebugConfigurationTests(SimpleTestCase):
    def read_settings(self):
        return runpy.run_path(str(Path(__file__).resolve().parents[1] / "mttBackend" / "settings.py"))

    def test_debug_is_disabled_by_default(self):
        with patch.dict(os.environ, {"DJANGO_SECRET_KEY": "configuration-test-key"}):
            os.environ.pop("DJANGO_DEBUG", None)
            self.assertIs(self.read_settings()["DEBUG"], False)

    def test_debug_requires_an_explicit_true_value(self):
        for value, expected in (("false", False), ("0", False), ("", False), ("true", True), ("1", True), (" YES ", True)):
            with self.subTest(value=value), patch.dict(os.environ, {"DJANGO_DEBUG": value, "DJANGO_SECRET_KEY": "configuration-test-key"}):
                self.assertIs(self.read_settings()["DEBUG"], expected)

    def test_production_requires_a_secret_key(self):
        with patch.dict(os.environ, {"DJANGO_DEBUG": "false", "DJANGO_SECRET_KEY": ""}):
            with self.assertRaisesMessage(ImproperlyConfigured, "DJANGO_SECRET_KEY must be set"):
                self.read_settings()

    def test_local_debug_has_a_development_only_secret(self):
        with patch.dict(os.environ, {"DJANGO_DEBUG": "true", "DJANGO_SECRET_KEY": ""}):
            self.assertEqual(self.read_settings()["SECRET_KEY"], "local-development-only-secret-key")

    def test_hosts_default_to_the_verified_deployment_and_local_development(self):
        with patch.dict(os.environ, {"DJANGO_SECRET_KEY": "configuration-test-key"}):
            os.environ.pop("DJANGO_ALLOWED_HOSTS", None)
            os.environ.pop("RAILWAY_APP_URL", None)
            self.assertEqual(self.read_settings()["ALLOWED_HOSTS"], [
                "mttbackend-production.up.railway.app", "localhost", "127.0.0.1", "[::1]"
            ])

    def test_deployment_url_adds_its_hostname(self):
        with patch.dict(os.environ, {"DJANGO_SECRET_KEY": "configuration-test-key", "RAILWAY_APP_URL": "https://custom-backend.example:8443/"}):
            os.environ.pop("DJANGO_ALLOWED_HOSTS", None)
            self.assertIn("custom-backend.example", self.read_settings()["ALLOWED_HOSTS"])

    def test_hosts_can_be_configured_explicitly(self):
        with patch.dict(os.environ, {"DJANGO_SECRET_KEY": "configuration-test-key", "DJANGO_ALLOWED_HOSTS": "api.example, api2.example, "}):
            self.assertEqual(self.read_settings()["ALLOWED_HOSTS"], ["api.example", "api2.example"])

    @override_settings(DEBUG=False)
    def test_public_media_route_remains_available_without_debug(self):
        with patch("mttBackend.urls.serve", return_value=HttpResponse(b"%PDF", content_type="application/pdf")) as serve:
            response = self.client.get("/media/journals/example.pdf")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"%PDF")
        self.assertEqual(response["Access-Control-Allow-Origin"], "*")
        self.assertEqual(serve.call_args.args[1], "journals/example.pdf")


class AuthenticationCompatibilityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="existinguser", password="secure-test-password-923"
        )

    def test_registration_creates_a_user_with_a_hashed_password(self):
        response = self.client.post(
            "/api/auth/users/",
            {"username": "newuser", "password": "secure-test-password-456"},
        )
        self.assertEqual(response.status_code, 201)
        user = get_user_model().objects.get(username="newuser")
        self.assertTrue(user.check_password("secure-test-password-456"))
        self.assertNotIn("password", response.json())

    def test_token_login_current_user_and_logout(self):
        response = self.client.post(
            "/api/auth/token/login/",
            {"username": self.user.username, "password": "secure-test-password-923"},
        )
        self.assertEqual(response.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {response.json()['auth_token']}")
        response = self.client.get("/api/auth/users/me/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["username"], self.user.username)
        self.assertEqual(self.client.post("/api/auth/token/logout/").status_code, 204)
        self.assertEqual(self.client.get("/api/auth/users/me/").status_code, 401)

    def test_invalid_password_does_not_issue_a_token(self):
        response = self.client.post(
            "/api/auth/token/login/",
            {"username": self.user.username, "password": "incorrect-password"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertNotIn("auth_token", response.json())

    def test_admin_templates_render_with_supported_django(self):
        self.user.is_staff = True
        self.user.is_superuser = True
        self.user.save()
        self.client.force_login(self.user)
        for url in ("/admin/", "/admin/topics/topic/", "/admin/videos/video/"):
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, 200)

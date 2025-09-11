from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model()


class AuthAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="tester@example.com", password="pass1234", name="Tester"
        )

    def test_register(self):
        url = reverse("api_register")
        data = {"email": "new@example.com", "password": "newpass123", "name": "New User"}
        resp = self.client.post(url, data, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="new@example.com").exists())

    def test_login_and_me(self):
        url = reverse("token_obtain_pair")
        resp = self.client.post(url, {"email": "tester@example.com", "password": "pass1234"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        access = resp.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        me_url = reverse("api_me")
        r = self.client.get(me_url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data["email"], "tester@example.com")

    def test_token_refresh(self):
        url = reverse("token_obtain_pair")
        resp = self.client.post(url, {"email": "tester@example.com", "password": "pass1234"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        refresh = resp.data["refresh"]
        refresh_url = reverse("token_refresh")
        r = self.client.post(refresh_url, {"refresh": refresh}, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIn("access", r.data)

    def test_logout_blacklist_refresh_token(self):
        url = reverse("token_obtain_pair")
        resp = self.client.post(url, {"email": "tester@example.com", "password": "pass1234"}, format="json")
        refresh = resp.data["refresh"]

        logout_url = reverse("token_logout")
        r = self.client.post(logout_url, {"refresh": refresh}, format="json")
        self.assertIn(r.status_code, (status.HTTP_200_OK, status.HTTP_205_RESET_CONTENT))

        # trying to refresh again should fail because refresh is blacklisted
        refresh_url = reverse("token_refresh")
        r2 = self.client.post(refresh_url, {"refresh": refresh}, format="json")
        self.assertEqual(r2.status_code, status.HTTP_401_UNAUTHORIZED)

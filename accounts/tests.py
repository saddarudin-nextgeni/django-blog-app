from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()

class AccountsTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            name="Test User"
        )

    def test_signup_view_creates_user(self):
        response = self.client.post(reverse("signup"), {
            "email": "new@example.com",
            "password1": "newpass123",
            "password2": "newpass123",
            "name": "New User"
        })
        self.assertEqual(User.objects.count(), 2)  # 1 existing + 1 new
        self.assertRedirects(response, reverse("home"))

    def test_login_view_authenticates_user(self):
        response = self.client.post(reverse("login"), {
            "username": "test@example.com",
            "password": "testpass123",
        })
        self.assertRedirects(response, reverse("home"))

    def test_home_view_requires_login(self):
        response = self.client.get(reverse("home"))
        self.assertRedirects(response, f"{reverse('login')}?next={reverse('home')}")

    def test_logout_view_logs_user_out(self):
        self.client.login(email="test@example.com", password="testpass123")
        response = self.client.get(reverse("logout"))
        self.assertRedirects(response, reverse("login"))
        # Try accessing home after logout
        response = self.client.get(reverse("home"))
        self.assertRedirects(response, f"{reverse('login')}?next={reverse('home')}")

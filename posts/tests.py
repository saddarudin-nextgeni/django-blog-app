from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Post, Comment

User = get_user_model()

class PostAPITestCase(APITestCase):

    def setUp(self):
        # Create test user with email login
        self.user = User.objects.create_user(
            email="test@example.com", password="testpass123", name="Test User"
        )
        
        # Create another user
        self.other_user = User.objects.create_user(
            email="other@example.com", password="otherpass123", name="Other User"
        )

        # Create a sample post
        self.post = Post.objects.create(
            author=self.user, title="Test Post", content="This is a test post."
        )

        # Create a sample comment
        self.comment = Comment.objects.create(
            post=self.post, author=self.other_user, content="Nice post!"
        )

        # Auth URLs
        self.token_url = reverse("token_obtain_pair")
        self.post_list_url = reverse("post_list")
        self.post_detail_url = reverse("post_detail", kwargs={"pk": self.post.id})
        self.post_create_url = reverse("post_create")

        # Get JWT token using email
        response = self.client.post(self.token_url, {
            "email": "test@example.com",
            "password": "testpass123"
        })
        self.access_token = response.data["access"]
        self.auth_headers = {"HTTP_AUTHORIZATION": f"Bearer {self.access_token}"}

    def test_list_posts(self):
        """Test retrieving list of posts"""
        response = self.client.get(self.post_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Test Post")

    def test_retrieve_post_detail_with_comments(self):
        """Test retrieving a single post and its comments"""
        response = self.client.get(self.post_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Test Post")
        self.assertEqual(len(response.data["comments"]), 1)
        self.assertEqual(response.data["comments"][0]["content"], "Nice post!")

    def test_create_post_unauthenticated(self):
        """Unauthenticated users cannot create posts"""
        data = {"title": "Unauthorized Post", "content": "Should not work"}
        response = self.client.post(self.post_create_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_post_authenticated(self):
        """Authenticated users can create posts"""
        data = {"title": "New Post", "content": "This is a new post content"}
        response = self.client.post(self.post_create_url, data, **self.auth_headers)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "New Post")
        self.assertEqual(response.data["author_name"], "test@example.com")

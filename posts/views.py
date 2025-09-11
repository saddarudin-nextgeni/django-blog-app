from rest_framework import generics, permissions
from .models import Post
from .serializers import PostSerializer

class PostListAPIView(generics.ListAPIView):
    # GET /api/posts/
    queryset = Post.objects.all().select_related("author").prefetch_related("comments", "likes").order_by("-created_at")
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]  # public API for now

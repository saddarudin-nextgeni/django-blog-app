from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404
from django.db.models import Count, Prefetch
from .models import Post, Comment
from .serializers import PostSerializer, PostDetailSerializer, CommentSerializer

class PostListAPIView(generics.ListAPIView):
    # GET /api/posts/
    queryset = Post.objects.all().select_related("author").prefetch_related("comments", "likes").order_by("-created_at")
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]  # public API for now

class PostDetailAPIView(generics.RetrieveAPIView):
    # GET /api/posts/<int:pk>/
    queryset = Post.objects.all().select_related("author").prefetch_related(
        Prefetch("comments", queryset=Comment.objects.select_related("author").order_by("-created_at")),
        "likes"
    )
    serializer_class = PostDetailSerializer
    permission_classes = [permissions.AllowAny]  # public API for now

class CommentListCreateAPIView(generics.ListCreateAPIView):
    # GET /api/posts/<int:post_pk>/comments/
    # POST /api/posts/<int:post_pk>/comments/
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        post_pk = self.kwargs.get("pk")
        return Comment.objects.filter(post_id=post_pk).select_related("author").order_by("-created_at")

    def perform_create(self, serializer):
        post_pk = self.kwargs.get("pk")
        post = get_object_or_404(Post, pk=post_pk)
        serializer.save(author=self.request.user, post=post)
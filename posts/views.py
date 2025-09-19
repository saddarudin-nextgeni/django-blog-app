from rest_framework import generics, permissions, filters as drf_filters
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Count, Prefetch
from .models import Post, Comment
from .serializers import PostSerializer, PostDetailSerializer, CommentSerializer
from .filters import PostFilter

class PostListAPIView(generics.ListAPIView):
    # GET /api/posts/
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, drf_filters.SearchFilter, drf_filters.OrderingFilter]
    filterset_class = PostFilter
    search_fields = ["title", "content", "author_email"]
    ordering_fields = ["created_at", "updated_at", "comments_count"]
    ordering = ["-created_at"]
    
    def get_queryset(self):
        qs = super().get_queryset()
        # Annotate with comments count for filtering/sorting
        return qs.annotate(comments_count=Count("comments", distinct=True),
                           likes_count=Count("likes", distinct=True))

class PostDetailAPIView(generics.RetrieveAPIView):
    # GET /api/posts/<int:pk>/
    queryset = Post.objects.all().select_related("author").prefetch_related(
        Prefetch("comments", queryset=Comment.objects.select_related("author").order_by("-created_at")),
        "likes"
    )
    serializer_class = PostDetailSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] 

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

class PostCreateAPIView(generics.CreateAPIView):
    # POST /api/posts/create/
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class MyPostsListAPIView(generics.ListAPIView):
    # GET /api/posts/mine/
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Post.objects.filter(author=self.request.user).annotate(
            comments_count=Count("comments", distinct=True),
            likes_count=Count("likes", distinct=True)
        ).order_by("-created_at")
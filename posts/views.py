from rest_framework import generics, permissions, filters as drf_filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Count, Prefetch
from .models import Post, Comment, Like
from .serializers import CommentCreateSerializer, PostSerializer, PostDetailSerializer, CommentSerializer
from .filters import PostFilter
from .permissions import IsAuthorOrReadOnly
from .tasks import send_comment_notification


class PostListAPIView(generics.ListAPIView):
    queryset = Post.objects.all().annotate(
        comments_count=Count("comments", distinct=True),
        likes_count=Count("likes", distinct=True)
    ).order_by("-created_at")
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, drf_filters.SearchFilter, drf_filters.OrderingFilter]
    filterset_class = PostFilter
    search_fields = ["title", "content", "author_email"]
    ordering_fields = ["created_at", "updated_at", "comments_count", "likes_count"]
    ordering = ["-created_at"]
    

class PostDetailAPIView(generics.RetrieveAPIView):
    queryset = Post.objects.all().select_related("author").prefetch_related(
        Prefetch("comments", queryset=Comment.objects.select_related("author").order_by("-created_at")),
        "likes"
    )
    serializer_class = PostDetailSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] 

class PostCreateAPIView(generics.CreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class MyPostsListAPIView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Post.objects.filter(author=self.request.user).annotate(
            comments_count=Count("comments", distinct=True),
            likes_count=Count("likes", distinct=True)
        ).order_by("-created_at")
    
class PostUpdateDeleteAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all().select_related("author")
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]

class CommentListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CommentCreateSerializer
        return CommentSerializer

    def get_queryset(self):
        post_pk = self.kwargs.get("pk")
        return Comment.objects.filter(post_id=post_pk, parent__isnull=True).select_related("author").order_by("-created_at")


    def perform_create(self, serializer):
        post_pk = self.kwargs.get("pk")
        post = get_object_or_404(Post, pk=post_pk)
        parent_id = self.request.data.get("parent")
        parent = None
        if parent_id:
            parent = Comment.objects.filter(id=parent_id, post=post).first()
        comment = serializer.save(author=self.request.user, post=post, parent=parent)
        # Trigger async email notification
        # send_comment_notification.delay(post.id, comment.id)

class CommentReplyListAPIView(generics.ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        parent_pk = self.kwargs.get("pk")
        return Comment.objects.filter(parent_id=parent_pk).select_related("author").order_by("created_at")

class LikeToggleAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        user = request.user
        like, created = Like.objects.get_or_create(post=post, user=user)
        if not created:
            like.delete()
            return Response({"status": "unliked"}, status=status.HTTP_200_OK)
        return Response({"status": "liked"}, status=status.HTTP_201_CREATED)
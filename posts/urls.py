from django.urls import path
from .views import PostListAPIView, PostDetailAPIView, CommentListCreateAPIView

urlpatterns = [
    path("", PostListAPIView.as_view(), name="post_list"),
    path("<int:pk>/", PostDetailAPIView.as_view(), name="post_detail"),
    path("<int:pk>/comments/", CommentListCreateAPIView.as_view(), name="post_comments"),
]

from django.urls import path
from .views import (
    PostListAPIView, 
    PostDetailAPIView, 
    CommentListCreateAPIView, 
    PostCreateAPIView,
    MyPostsListAPIView,
    PostUpdateDeleteAPIView,
    LikeToggleAPIView,
    CommentReplyListAPIView,
    )

urlpatterns = [
    path("", PostListAPIView.as_view(), name="post_list"),
    path("<int:pk>/", PostDetailAPIView.as_view(), name="post_detail"),
    path("<int:pk>/comments/", CommentListCreateAPIView.as_view(), name="post_comments"),
    path("comments/<int:pk>/replies/", CommentReplyListAPIView.as_view(), name="comment_replies"),
    path("<int:pk>/like/", LikeToggleAPIView.as_view(), name="like_toggle"),
    path("create/", PostCreateAPIView.as_view(), name="post_create"),
    path("<int:pk>/edit/", PostUpdateDeleteAPIView.as_view(), name="post_update_delete"),
    path("mine/", MyPostsListAPIView.as_view(), name="my_posts"),
]

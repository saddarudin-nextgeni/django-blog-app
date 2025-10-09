from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Post, Comment

User = get_user_model()

class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.email", read_only=True)
    comments_count = serializers.IntegerField(source="comments.count", read_only=True)
    likes_count = serializers.IntegerField(source="likes.count", read_only=True)

    class Meta:
        model = Post
        fields = ["id", "title", "content", "created_at", "author_name", "comments_count", "likes_count"]


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.email", read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ["id", "post", "author_name", "content", "created_at", "replies"]
        read_only_fields = ["post", "author_name", "created_at"]
    
    def get_replies(self, obj):
    # Only fetch replies if the comment is already saved and has replies
        if not obj.id:
            return []
        if hasattr(obj, "replies") and obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True).data
        return []
    

class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ["id", "content", "parent"]



class PostDetailSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.email", read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    likes_count = serializers.IntegerField(source="likes.count", read_only=True)

    class Meta:
        model = Post
        fields = ["id", "title", "content", "created_at", "author_name", "comments", "likes_count"]
        read_only_fields = ["id", "created_at", "author_name", "likes_count", "comments"]

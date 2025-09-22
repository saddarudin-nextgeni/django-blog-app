from django.contrib import admin
from django.db.models import Count
from .models import Post, Comment, Like


# --- Custom Filters ---

class CommentsRangeFilter(admin.SimpleListFilter):
    title = "comments count"
    parameter_name = "comments_count"

    def lookups(self, request, model_admin):
        return [
            ("0", "No comments"),
            ("1-5", "1 to 5"),
            ("6-10", "6 to 10"),
            ("10+", "More than 10"),
        ]

    def queryset(self, request, queryset):
        queryset = queryset.annotate(comments_count=Count("comments", distinct=True))
        if self.value() == "0":
            return queryset.filter(comments_count=0)
        elif self.value() == "1-5":
            return queryset.filter(comments_count__gte=1, comments_count__lte=5)
        elif self.value() == "6-10":
            return queryset.filter(comments_count__gte=6, comments_count__lte=10)
        elif self.value() == "10+":
            return queryset.filter(comments_count__gt=10)
        return queryset


class LikesRangeFilter(admin.SimpleListFilter):
    title = "likes count"
    parameter_name = "likes_count"

    def lookups(self, request, model_admin):
        return [
            ("0", "No likes"),
            ("1-5", "1 to 5"),
            ("6-10", "6 to 10"),
            ("10+", "More than 10"),
        ]

    def queryset(self, request, queryset):
        queryset = queryset.annotate(likes_count=Count("likes", distinct=True))
        if self.value() == "0":
            return queryset.filter(likes_count=0)
        elif self.value() == "1-5":
            return queryset.filter(likes_count__gte=1, likes_count__lte=5)
        elif self.value() == "6-10":
            return queryset.filter(likes_count__gte=6, likes_count__lte=10)
        elif self.value() == "10+":
            return queryset.filter(likes_count__gt=10)
        return queryset


class HasCommentsFilter(admin.SimpleListFilter):
    title = "has comments"
    parameter_name = "has_comments"

    def lookups(self, request, model_admin):
        return [
            ("yes", "Yes"),
            ("no", "No"),
        ]

    def queryset(self, request, queryset):
        queryset = queryset.annotate(comments_count=Count("comments", distinct=True))
        if self.value() == "yes":
            return queryset.filter(comments_count__gt=0)
        elif self.value() == "no":
            return queryset.filter(comments_count=0)
        return queryset


# --- Post Admin ---

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "created_at", "comments_count", "likes_count")
    search_fields = ("title", "content", "author__email")
    list_filter = ("created_at", "author", CommentsRangeFilter, LikesRangeFilter, HasCommentsFilter)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(
            comments_count=Count("comments", distinct=True),
            likes_count=Count("likes", distinct=True),
        )

    def comments_count(self, obj):
        return obj.comments_count
    comments_count.admin_order_field = "comments_count"

    def likes_count(self, obj):
        return obj.likes_count
    likes_count.admin_order_field = "likes_count"


# --- Register other models ---

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "author", "post", "created_at")
    search_fields = ("content", "author__email")


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "post", "created_at")
    search_fields = ("user__email",)

import django_filters
from django.db.models import Count, Q
from .models import Post

class PostFilter(django_filters.FilterSet):
    # filter by author's email
    author_name = django_filters.CharFilter(field_name="author__email", lookup_expr="icontains")

    # content contains
    content = django_filters.CharFilter(field_name="content", lookup_expr="icontains")

    # created_at range
    created_from = django_filters.DateFilter(field_name="created_at", lookup_expr="gte")
    created_to   = django_filters.DateFilter(field_name="created_at", lookup_expr="lte")

    # comment content search
    comment = django_filters.CharFilter(method="filter_comment")

    # number of comments (min and max)
    min_comments = django_filters.NumberFilter(method="filter_min_comments")
    max_comments = django_filters.NumberFilter(method="filter_max_comments")

    # has comments boolean
    has_comments = django_filters.BooleanFilter(method="filter_has_comments")

    class Meta:
        model = Post
        fields = [
            "author_name",
            "content",
            "created_from",
            "created_to",
            "comment",
            "min_comments",
            "max_comments",
            "has_comments",
        ]

    def filter_author_name_or_display(self, queryset, name, value):
        # search email
        return queryset.filter(
            Q(author__email__icontains=value)
        )

    def filter_comment(self, queryset, name, value):
        # Return posts that have at least one comment whose content matches value
        return queryset.filter(comments__content__icontains=value).distinct()

    def filter_min_comments(self, queryset, name, value):
        # assumes queryset will be annotated with comments_count 
        return queryset.annotate(_comments_count=Count("comments")).filter(_comments_count__gte=value)

    def filter_max_comments(self, queryset, name, value):
        return queryset.annotate(_comments_count=Count("comments")).filter(_comments_count__lte=value)

    def filter_has_comments(self, queryset, name, value):
        if value:
            return queryset.filter(comments__isnull=False).distinct()
        else:
            # posts with no comments
            return queryset.filter(comments__isnull=True)

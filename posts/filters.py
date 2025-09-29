from django.db.models import Count, Q
import django_filters
from .models import Post

# Postgres search imports
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank

class PostFilter(django_filters.FilterSet):
    # combined search field
    q = django_filters.CharFilter(method="filter_full_text", label="search")

    # simple exact/contains filters
    title = django_filters.CharFilter(field_name="title", lookup_expr="icontains")
    author_email = django_filters.CharFilter(field_name="author__email", lookup_expr="icontains")
    content = django_filters.CharFilter(field_name="content", lookup_expr="icontains")

    # date range
    date_from = django_filters.DateFilter(field_name="created_at", lookup_expr="gte")
    date_to = django_filters.DateFilter(field_name="created_at", lookup_expr="lte")

    # comment range
    min_comments = django_filters.NumberFilter(method="filter_min_comments")
    max_comments = django_filters.NumberFilter(method="filter_max_comments")

    # likes range
    min_likes = django_filters.NumberFilter(method="filter_min_likes")
    max_likes = django_filters.NumberFilter(method="filter_max_likes")

    

    # liked_by and commented_by filters
    liked_by = django_filters.CharFilter(field_name="likes__user__email", lookup_expr="icontains")
    commented_by = django_filters.CharFilter(field_name="comments__author__email", lookup_expr="icontains")

    class Meta:
        model = Post
        fields = []  # we expose only the above custom filters

    def _annotate_counts(self, queryset):
        """
        Annotate counts once to reuse in multiple filters.
        """
        return queryset.annotate(
            comments_count=Count("comments", distinct=True),
            likes_count=Count("likes", distinct=True),
        )

    def filter_min_comments(self, queryset, name, value):
        qs = self._annotate_counts(queryset)
        return qs.filter(comments_count__gte=value)

    def filter_max_comments(self, queryset, name, value):
        qs = self._annotate_counts(queryset)
        return qs.filter(comments_count__lte=value)

    def filter_min_likes(self, queryset, name, value):
        qs = self._annotate_counts(queryset)
        return qs.filter(likes_count__gte=value)

    def filter_max_likes(self, queryset, name, value):
        qs = self._annotate_counts(queryset)
        return qs.filter(likes_count__lte=value)

    def filter_has_comments(self, queryset, name, value):
        qs = self._annotate_counts(queryset)
        if value:
            return qs.filter(comments_count__gt=0)
        else:
            return qs.filter(comments_count=0)

    def filter_full_text(self, queryset, name, value):
        """
        Uses Postgres full-text search for longer queries (SearchVector + SearchQuery).
        Falls back to icontains for short/substring queries (helps 'ad' match 'admin').
        """
        term = (value or "").strip()
        if not term:
            return queryset

        # If the user typed a very short query (<= 3 chars) => use icontains so substrings match.
        if len(term) <= 3:
            return queryset.filter(
                Q(title__icontains=term)
                | Q(content__icontains=term)
                | Q(author__email__icontains=term)
            )

        # Weight title higher than content and author.
        sv = (
            SearchVector("title", weight="A")
            + SearchVector("content", weight="B")
            + SearchVector("author__email", weight="C")
        )
        sq = SearchQuery(term)

        # annotate rank and filter by matching entries, order by rank desc
        qs = queryset.annotate(search=sv).annotate(rank=SearchRank(sv, sq)).filter(rank__gt=0.0).order_by("-rank")

        # If full-text gives no result (rare), fallback to icontains to catch substrings
        if qs.exists():
            return qs
        else:
            return queryset.filter(
                Q(title__icontains=term)
                | Q(content__icontains=term)
                | Q(author__email__icontains=term)
            )

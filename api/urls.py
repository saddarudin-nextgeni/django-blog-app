from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .views import RegisterView, CustomTokenView, LogoutView, MeView, MentionUserView

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="api_register"),
    path("auth/token/", CustomTokenView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("auth/logout/", LogoutView.as_view(), name="token_logout"),
    path("auth/me/", MeView.as_view(), name="api_me"),
    path("users/mention/", MentionUserView.as_view(), name="mention_users"),
]

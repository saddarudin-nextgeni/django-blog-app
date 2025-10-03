from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from .serializers import (
                            RegisterSerializer, 
                            UserSerializer, 
                            CustomTokenObtainPairSerializer,
                            MentionUserSerializer
                        )
                          

User = get_user_model()

# POST /api/auth/register/
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


# /api/auth/token/   (login)
class CustomTokenView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# POST /api/auth/logout/  (blacklist refresh token)
class LogoutView(APIView):
    permission_classes = (permissions.AllowAny,)
    def post(self, request):
        refresh = request.data.get("refresh")
        if not refresh:
            return Response({"detail": "Refresh token required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh)
            token.blacklist()
            return Response({"detail": "Logout Successful."},status=status.HTTP_205_RESET_CONTENT)
        except TokenError as e:
            return Response({"detail": "Token is invalid or expired."}, status=status.HTTP_400_BAD_REQUEST)


# GET /api/auth/me/
class MeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    def get(self, request):
        return Response(UserSerializer(request.user).data)
    

# GET /api/users/mention/?q=...
class MentionUserView(generics.ListAPIView):
    serializer_class = MentionUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        query = self.request.GET.get("q", "").strip()
        if query:
            return User.objects.filter(email__istartswith=query)[:10]
        return User.objects.none()
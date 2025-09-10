from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Customize token payload if needed."""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email  # custom claim
        return token
    

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(APIView):
    permission_classes = (AllowAny,)
    def post(self, request):
        refresh = request.data.get("refresh")
        if not refresh:
            return Response({"detail":"Refresh token required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh)
            token.blacklist()
            return Response({"detail":"Logout successful."}, status=status.HTTP_205_RESET_CONTENT)
        except TokenError:
            return Response({"detail":"Token invalid or already expired."}, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    permission_classes = (IsAuthenticated,)
    def get(self, request):
        user = request.user
        return Response({"id":user.id, "email":user.email, "name":getattr(user,'name','')})

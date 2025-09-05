from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # set username field to match custom user's USERNAME_FIELD
    username_field = "email"
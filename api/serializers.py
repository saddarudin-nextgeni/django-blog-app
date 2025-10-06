from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("id", "email", "name", "age", "bio", "password")

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "name", "age", "bio")



class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"
    # optionally: user info in response
    def validate(self, attrs):
        data = super().validate(attrs)
        data.update({"user": UserSerializer(self.user).data})
        return data
    

class MentionUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email"]
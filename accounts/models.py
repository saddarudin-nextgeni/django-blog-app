from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser, PermissionsMixin, BaseUserManager
)
from django.utils import timezone


class UserManager(BaseUserManager):
    """Manager for the custom User model using email as the unique identifier."""

    def create_user(self, email, password=None, name=None, age=None, **extra_fields):
        if not email:
            raise ValueError("The Email must be set")
        email = self.normalize_email(email)

        user = self.model(
            email=email,
            name=name or "",
            age=age,
            **extra_fields
        )

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, name=None, age=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, name=name, age=age, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, blank=True)
    age = models.PositiveSmallIntegerField(null=True, blank=True)

    # Admin/permissions helpers
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # Nice to have
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"          # Login with email
    REQUIRED_FIELDS = ["name"]        # prompted by createsuperuser (age stays optional)

    def __str__(self):
        return self.email

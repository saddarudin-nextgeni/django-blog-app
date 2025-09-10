from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.views import LoginView
from django.urls import reverse_lazy
from .forms import CustomUserCreationForm, CustomAuthenticationForm
from rest_framework_simplejwt.tokens import RefreshToken
import jwt
from django.conf import settings


def jwt_logout_view(request):
    try:
        refresh_token = request.session.get("refresh_token")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()  
    except Exception:
        pass

    logout(request)  # remove Django session
    return redirect("login")


def home_view(request):
    token = request.session.get("access_token")
    if not token:
        return redirect("login")

    try:
        jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return redirect("login")  # force re-login if expired
    except jwt.InvalidTokenError:
        return redirect("login")

    return render(request, "home.html")   

def signup_view(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect("home")  
    else:
        form = CustomUserCreationForm()
    return render(request, "signup.html", {"form": form})


class CustomLoginView(LoginView):
    template_name = "login.html"
    authentication_form = CustomAuthenticationForm
    redirect_authenticated_user = True

    def get_success_url(self):
        user = self.request.user
        refresh = RefreshToken.for_user(user)

        # save tokens in session (not secure for production but works for now)
        self.request.session["access_token"] = str(refresh.access_token)
        self.request.session["refresh_token"] = str(refresh)

        return reverse_lazy("home")

def logout_view(request):
    logout(request)
    return redirect("login")  

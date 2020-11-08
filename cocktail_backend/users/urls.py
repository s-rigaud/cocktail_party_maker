from django.urls import path

from . import views

urlpatterns = [
    path("login", views.user_login, name="user-login"),
    path("register", views.user_register, name="user-register"),
    path("leaderboard", views.user_leaderboard, name="user-leaderboard"),
    path("profile", views.user_profile, name="user-profile"),
]

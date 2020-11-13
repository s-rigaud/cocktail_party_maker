from django.urls import path

from . import views

urlpatterns = [
    path("login", views.user_login, name="user-login"),
    path("logged", views.get_logged_user, name="user-logged"),
    path("logout", views.user_logout, name="user-logout"),
    path("register", views.user_register, name="user-register"),
    path("profile", views.user_profile, name="user-profile"),
    path("leaderboard", views.user_leaderboard, name="user-leaderboard"),
]

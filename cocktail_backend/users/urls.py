from django.urls import path

from . import views

urlpatterns = [
    path("login", views.user_login, name="user-login"),
    path("logged", views.get_logged_user, name="user-logged"),
    path("logout", views.user_logout, name="user-logout"),
    path("register", views.user_register, name="user-register"),

    path("leaderboard", views.user_leaderboard, name="user-leaderboard"),
    path("profile/info", views.user_profile_info, name="user-profile-info"),
    path("profile/cocktails", views.user_profile_cocktails, name="user-profile-cocktails"),
]

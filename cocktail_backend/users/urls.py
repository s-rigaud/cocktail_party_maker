from django.urls import path

from . import views

urlpatterns = [
    # {*login: "", *password: ""}
    # -> 400 X
    # -> 200  {"user": {**user_data}, "notifications": [str, str, ...]}
    path("login", views.user_login, name="user-login"),

    # {}
    # -> 406 {"user": None}
    # -> 200  {"user": {**user_data}, "notifications": [str, str, ...]}
    path("logged", views.get_logged_user, name="user-logged"),

    # {}
    # -> 200  {"status": "success"}
    path("logout", views.user_logout, name="user-logout"),

    # {^login: "", ^mail: "", ^password: "", ^confirm_password: ""}
    # -> 400 X
    # -> 201  {"status": "success"}
    path("register", views.user_register, name="user-register"),

    # {}
    # -> 200  {"users": [{"creator_username": "", "cocktals": number_this_month}]}
    path("leaderboard", views.user_leaderboard, name="user-leaderboard"),

    # {} !logged
    # -> 200  {"user": {**user_data}, "notifications": [str, str, ...]}
    path("profile/info", views.user_profile_info, name="user-profile-info"),

    # {} !logged
    # -> 200  {"cocktails": [{**cocktail_data}, ... ], "pages": int_max_pages}
    path("profile/cocktails", views.user_profile_cocktails, name="user-profile-cocktails"),
]

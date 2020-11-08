import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Count
from django.http import request
from django.http.response import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from cocktail_party_maker.models import Cocktail
from django.contrib.auth.decorators import login_required

from .models import Profile


@csrf_exempt
def user_login(request):
    logout(request)
    data = json.loads(request.body.decode())
    username = data.get("login")
    password = data.get("password")
    if username and password:
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                return JsonResponse(data={"user": user.to_api_format()})
    return JsonResponse(data={"status": "failure"}, status=403)


@csrf_exempt
def user_register(request):
    data = json.loads(request.body.decode())
    username = data.get("login")
    password = data.get("password")

    if username and password:
        profile = Profile.objects.create_user(
            username=username,
            password=password,
        )
        profile.save()
        return JsonResponse(data={"status": "success"})
    return JsonResponse(data={"status": "failure"}, status=403)


def user_leaderboard(request):
    """"""
    user_stats = (
        Cocktail.objects.values("creator__username")
        .filter(state="AC")
        .order_by("creator__username")
        .annotate(count=Count("creator__username"))
    )
    return JsonResponse(data={"users": [us for us in user_stats if us["creator__username"]]})

@login_required
def user_profile(request):
    """"""
    user = Profile.objects.filter(id=request.user.id).values("points").first()
    user_cocktail = Cocktail.objects.filter(creator=request.user).values("creation_date", "name", "state")
    return JsonResponse(
        data={"user": user, "cocktails": [uc for uc in user_cocktail]}
    )

import json
import math
from datetime import datetime

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Count
from django.http.response import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from cocktail_party_maker.models import Cocktail

from .models import Profile, Notification
from .utils import validate_user_register


@csrf_exempt
def user_login(request):
    """Simple session log in route"""
    logout(request)
    data = json.loads(request.body.decode())
    username = data.get("login")
    password = data.get("password")
    if username and password:
        user = authenticate(username=username, password=password)
        if user is not None and user.is_active:
            login(request, user)

            notifs = Notification.objects.filter(user=request.user)
            return JsonResponse(data={
                "user": user.to_api_format(),
                "notifications": [n.message for n in notifs],
            })
    return JsonResponse(data={}, status=400)


@csrf_exempt
@login_required
def user_logout(request):
    """Log out route"""
    logout(request)
    return JsonResponse(data={"status": "success"}, status=200)


@csrf_exempt
def user_register(request):
    """Registration route for user accounts"""
    data = json.loads(request.body.decode())
    username = data.get("login")
    mail = data.get("mail")
    password = data.get("password")
    password_confirm = data.get("password_confirm")

    if validate_user_register(username, mail, password, password_confirm):
        try:
            profile = Profile.objects.create_user(
                username=username,
                password=password,
            )
            profile.save()
        except Exception:
            pass
        else:
            return JsonResponse(data={"status": "success"}, status=201)

    return JsonResponse(data={"status": "failure"}, status=400)


def get_logged_user(request):
    """Return data about the current logged user for a session"""
    # ugly hack to make difference between lazy loaded Profile objects
    # and AnonimousUser objects
    if hasattr(request.user, "to_api_format"):
        notifs = Notification.objects.filter(user=request.user)
        return JsonResponse(data={
            "user": request.user.to_api_format(),
            "notifications": [n.message for n in notifs],
        })
    return JsonResponse(data={"user": None}, status=406)


def user_leaderboard(request):
    """User leaderboard of monthly cocktail contributors"""
    user_stats = (
        Cocktail.objects.values("creator__username")
        .filter(state="AC", creation_date__month=datetime.now().month)
        .order_by("creator__username")
        .annotate(count=Count("creator__username"))
    )
    return JsonResponse(
        data={"users": [us for us in user_stats if us["creator__username"]]}
    )


@login_required
def user_profile_info(request):
    """Display user's profile informations
    As user requested the page where notifications
    are displayed we need to delete them
    """
    notifs = Notification.objects.filter(user=request.user)
    [n.delete() for n in notifs]
    return JsonResponse(data={"user": request.user.to_api_format()})


@login_required
def user_profile_cocktails(request):
    """Display user's profile cocktails using paging
    Currently 10 cocktails a page
    """
    page = request.GET.get("page")
    all_user_cocktails = (
        Cocktail.objects.filter(creator=request.user)
        .order_by("-creation_date")
        .only("creation_date", "name", "state")
    )

    paginator = Paginator(all_user_cocktails, 10)
    try:
        page_cocktails = paginator.page(page)
    except PageNotAnInteger:
        page_cocktails = paginator.page(1)
    except EmptyPage:
        page_cocktails = paginator.page(paginator.num_pages)

    return JsonResponse(
        data={
            "cocktails": [cocktail.to_api_format() for cocktail in page_cocktails],
            "pages": paginator.num_pages,
        }
    )

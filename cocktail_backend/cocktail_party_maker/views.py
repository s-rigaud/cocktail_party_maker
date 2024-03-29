import json
import random

from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import ipdb

from users.models import Notification

from .data_gatherer import collect_cocktails_cdb
from .models import Cocktail, Ingredient, Quantity, Tag
from .utils import add_full_cocktail
from .views import *


@csrf_exempt
@login_required
def add_cocktail(request):
    """Add cocktail into DB

    data should look like this:
    {
        "name": "cocktail name",
        "ingredients": [
            ("ingr1", "quantity1", "color1"),
            ("ingr2", "quantity2", "color2"),
        ],
        "picture": "??",
        "instructions", "Put xxxx..",
        "tags": ["Summer", "Chrismass", ...]
    }
    """
    cocktail_data = json.loads(request.body.decode())
    success, message = add_full_cocktail(
        name=cocktail_data.get("name", ""),
        picture=cocktail_data.get("picture", ""),
        instructions=cocktail_data.get("instructions", ""),
        ingredients=cocktail_data.get("ingredients", []),
        tags=cocktail_data.get("tags", []),
        creator=request.user,
    )
    if not success:
        return JsonResponse(
            data={"message": message},
            status=400,
        )
    else:
        return JsonResponse(
            {
                "name": cocktail_data.get("name", ""),
                "ingredients": [
                    (ingredient, *_)
                    for ingredient, *_ in cocktail_data.get("ingredients", [])
                    if ingredient
                ],
                "message": message,
            },
            status=201,
        )


def get_exact_cocktail(request):
    """retrieve the exact cocktail we can make
    matching the ingredient
    """
    params = request.GET

    # Dict to copy result and retrieve multiple values
    request_ingredients = dict(params).get("ingredients", [])
    ingredient_filter = set(request_ingredients)

    cocktails = Cocktail.objects.filter(
        state="AC",
        quantity__ingredient__name__in=ingredient_filter,
    )
    # and to add .filter(author = log_user and Pending) TODO see is own cocktail

    cocktail_response = {}
    for cocktail in cocktails:
        quantities = cocktail.quantity_set.all().select_related("ingredient")
        ingredients = [(q.ingredient.name, q.quantity, q.ingredient.color) for q in quantities]

        if ingredient_filter == set(name for name, *_ in ingredients):
            # Add one usage if the cocktail is made
            cocktail.usage += 1
            cocktail.save()

            cocktail_tags = cocktail.cocktailtag_set.all().select_related("tag")
            tags = [ct.tag.name for ct in cocktail_tags]

            cocktail_response = cocktail.to_api_format()
            cocktail_response.update(
                {
                    "tags": tags,
                    "ingredients": ingredients,
                }
            )

            break  # Only the first one is required

    return JsonResponse({"cocktail": cocktail_response})


def ingredients_filter(request):
    """List all DB ingredients for given parameters"""
    params = request.GET

    filters = {}
    if params.get("name"):
        filters["name__icontains"] = params["name"]

    ingredients = Ingredient.objects.filter(**filters).only("name", "color").order_by("name")

    return JsonResponse({"ingredients": [{"name": ingr.name, "color": ingr.color} for ingr in ingredients]})


def ingredient_suggestion(request):
    """For given ingredient list, we return the ingredients
    that come in the composition of a cocktail with them
    """
    params = request.GET

    # Dict to copy result and retrieve multiple values
    request_ingredients = dict(params).get("ingredients", [])
    ingredient_filter = set(request_ingredients)

    # Return all ingredient if no filters
    # TODO -> should return only ingredients in cocktail recipes instead
    if not ingredient_filter:
        ingredients = Ingredient.objects.all().only("name").order_by("name")
        return JsonResponse({"ingredients": [{"name": i.name, "color": i.color} for i in ingredients]})

    # Getting the intersection of all cocktail with one of the ingredient
    # in its composition so the result is cocktails with at least all
    # ingredient_filter
    cocktail_query = Cocktail.objects.filter(state="AC")
    if ingredient_filter:
        for ingr_name in ingredient_filter:
            new_query = Cocktail.objects.filter(quantity__ingredient__name=ingr_name)
            cocktail_query = cocktail_query.intersection(new_query)

    cocktail_ids = [c["id"] for c in cocktail_query.values("id")]

    # Manual set to filter duplicate but keep (name, color) mapping
    ingredients = []
    for quantity in Quantity.objects.filter(cocktail_id__in=cocktail_ids):
        if (
            quantity.ingredient.name not in ingredient_filter
            and quantity.ingredient.name not in [ingr["name"] for ingr in ingredients]
        ):
            ingredients.append(
                {
                    "name": quantity.ingredient.name,
                    "color": quantity.ingredient.color,
                }
            )
    ingredients = sorted(ingredients, key=lambda x: x["name"])

    # While frontend can't access dict list
    return JsonResponse({"ingredients": [{"name": i["name"], "color": i["color"]} for i in ingredients]})


@login_required
def get_cocktail_to_validate(request):
    if request.user.is_staff:
        cocktail_response = {}

        pendaing_cocktails = (
            Cocktail.objects.filter(state="PD")
            .only("id", "name", "instructions", "picture", "creation_date", "creator")
            .select_related("creator")
        )
        cocktail = pendaing_cocktails.first()
        if cocktail:
            creator_name = "system"
            if cocktail.creator:
                creator_name = cocktail.creator.username
            quantities = cocktail.quantity_set.all().select_related("ingredient")
            ingredients = [(q.ingredient.name, q.quantity, q.ingredient.color) for q in quantities]
            cocktail_tags = cocktail.cocktailtag_set.all().select_related("tag")
            tags = [ct.tag.name for ct in cocktail_tags]

            cocktail_response = cocktail.to_api_format()
            cocktail_response.update(
                {
                    "tags": tags,
                    "ingredients": ingredients,
                    "creator": creator_name,
                }
            )

        return JsonResponse(
            {"cocktail": cocktail_response, "count": pendaing_cocktails.count()}
        )
    else:
        return JsonResponse(
            {
                "status": "failure",
                "message": "You don't have the permission to do that",
            },
            status=403,
        )


@csrf_exempt
@login_required
def validate_cocktail(request):
    if request.user.is_staff:
        # GET for POST request ??
        cocktail_id = request.GET.get("id")
        cocktail = (
            Cocktail.objects.select_related("creator")
            .only("creator", "state")
            .get(id=cocktail_id)
        )
        cocktail.state = "AC"
        cocktail.save()

        creator = cocktail.creator
        if creator:
            creator.points += 1
            creator.save()

            notif = Notification(
                message="Congratulation your cocktail has been approved",
                user=creator,
            )
            notif.save()

        return JsonResponse({"status": "done"})
    else:
        return JsonResponse(
            {
                "status": "failure",
                "message": "You don't have the permission to do that",
            },
            status=403,
        )


@csrf_exempt
@login_required
def refuse_cocktail(request):
    if request.user.is_staff:
        # GET for POST request ??
        cocktail_id = request.GET.get("id")
        cocktail = Cocktail.objects.only("state").get(id=cocktail_id)
        cocktail.state = "RF"
        cocktail.save()
        return JsonResponse({"status": "done"})
    else:
        return JsonResponse(
            {
                "status": "failure",
                "message": "You don't have the permission to do that",
            },
            status=403,
        )


def get_random_cocktail(request):
    """Return a random validated cocktail"""
    cocktails = Cocktail.objects.filter(state="AC")
    cocktail_ids = cocktails.values_list("id").all()
    # Ugly 0 as return of values_list is list of tuple
    random_cocktail = cocktails.get(id=random.choices(cocktail_ids)[0][0])
    return JsonResponse({"cocktail": random_cocktail.to_api_format()})


@login_required
def load_cocktail_db_info(request):
    if request.user.is_staff:
        collect_cocktails_cdb()
        return JsonResponse({"status": "success"})
    else:
        return JsonResponse(
            {
                "status": "failure",
                "message": "You don't have the permission to do that",
            },
            status=403,
        )

def cocktail_tags(request):
    """Return all existing tags"""
    tags = Tag.objects.only("name").all()
    return JsonResponse(data={"tags": [t.name for t in tags]})

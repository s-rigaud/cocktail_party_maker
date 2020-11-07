import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import Cocktail, Ingredient, Quantity
from .utils import add_full_cocktail
from .data_gatherer import collect_cocktails_cdb
from .views import *


@csrf_exempt
def add_cocktail(request):
    """Add cocktail into DB

    data should look like this:
    {
        "name": "cocktail name",
        "ingredients": [
            ("ingr1", "quantity1"),
            ("ingr2", "quantity2"),
            ....
        ]
    }
    """
    cocktail_data = json.loads(request.body.decode())
    success, message = add_full_cocktail(
        name=cocktail_data.get("name", ""),
        picture=cocktail_data.get("picture", ""),
        instructions=cocktail_data.get("instructions", ""),
        ingredients=cocktail_data.get("ingredients", []),
        tags=cocktail_data.get("tags", []),
    )
    if not success:
        return JsonResponse(
            data={"message": message},
            status=418,
        )
    else:
        return JsonResponse(
            {
                "name": cocktail_data.get("name", ""),
                "ingredients": cocktail_data.get("ingredients", []),
                "message": message,
            }
        )


def get_exact_cocktail(request):
    """retrieve the exact cocktail we can make
    matching the ingredient
    """
    params = request.GET

    ingredient = params.get("ingredient")
    ingredient_filter = set(json.loads(params.get("ingredients", "[]")))
    if ingredient:
        ingredient_filter.add(ingredient)
    ingredient_filter.discard("")

    # cocktails = transform_cocktails(cocktail_list)
    cocktails = Cocktail.objects.filter(
        state="AC",
        quantity__ingredient__name__in = ingredient_filter,
    )# and to add .filter(author = log_user and Pending)

    cocktail_response = {}
    for cocktail in cocktails:
        quantities = cocktail.quantity_set.all().select_related("ingredient")
        ingredients = [(q.ingredient.name, q.quantity) for q in quantities]

        if ingredient_filter == set(name for name, _ in ingredients):
            cocktail_tags = cocktail.cocktailtag_set.all().select_related("tag")
            tags = [ct.tag.name for ct in cocktail_tags]

            cocktail_response = {
                "id": cocktail.id,
                "name": cocktail.name,
                "instructions": cocktail.instructions,
                "picture": cocktail.picture,
                "tags": tags,
                "ingredients": ingredients,
                "creation_date": cocktail.creation_date,
                "usage": cocktail.usage,
            }

            # Add one usage if the cocktail is made
            cocktail.usage += 1
            cocktail.save()

            break # Only the first one is required

    return JsonResponse({"cocktail": cocktail_response})


def ingredients_filter(request):
    """List all DB ingredients for given parameters"""
    params = request.GET

    filters = {}
    if params.get("name"):
        filters["name__like"] = params["name"]

    ingredients = Ingredient.objects.filter(**filters).only("id", "name")

    return JsonResponse(
        {"ingredients": [ingr for ingr in ingredients.values("id", "name")]}
    )


def ingredient_suggestion(request):
    """For given ingredient list, we return the ingredients
    that come in the composition of a cocktail with them
    """
    params = request.GET

    ingredient = params.get("ingredient")
    ingredient_filter = set(json.loads(params.get("ingredients", "[]")))
    if ingredient:
        ingredient_filter.add(ingredient)
    ingredient_filter.discard("")

    filters = {}
    if ingredient_filter:
        filters["ingredient__name__in"] = ingredient_filter

    ## TO refacto, complex ORM request  F() might be the solution
    # All ingredients that enter in the compostion of a cocktail
    # with a filtered ingredient
    quantities = Quantity.objects.filter(**filters)
    cocktail_with_ingredients = set(q.cocktail for q in quantities)
    ingredients = set(
        q.ingredient.name
        for q in Quantity.objects.filter(cocktail__in=cocktail_with_ingredients)
    )

    # Remove asked ingredients from suggested
    for ingr in ingredient_filter:
        ingredients.discard(ingr)

    return JsonResponse({"ingredients": list(ingredients)})

def load_cocktail_db_info(request):
    collect_cocktails_cdb()
    return JsonResponse({"status": "Done"})


from django.urls import path

from . import views

urlpatterns = [
    #{
    #    "name": "cocktail name",
    #    "ingredients": [
    #        ("ingr1", "quantity1", "color1"),
    #        ("ingr2", "quantity2", "color2"),
    #    ],
    #    "picture": "??",
    #    "instructions", "Put xxxx..",
    #    "tags": ["Summer", "Chrismass", ...]
    #}
    # -> 400 {"message": "error_message"}
    # -> 200  {"name": "", "ingredients": [("name", int_quantity, "measure"), ...], "message": "cocktail added"}
    path("cocktail/add", views.add_cocktail, name="cocktail-add"),

    # {"ingredients": [ingr, ...] or None}
    # -> 200  {"cocktail": {**cocktail_info or None}}
    path("cocktail/exact", views.get_exact_cocktail, name="cocktail-exact"),

    # {}
    # -> 200  {"cocktail": {**cocktail_info}}
    path("cocktail/random", views.get_random_cocktail, name="cocktaildb-random"),

    # {} !logged & !is_staff
    # -> 403 {"status": "failure", "message": "error_message"}
    # -> 200 {"status": "success"}
    path("cocktail/cocktaildb", views.load_cocktail_db_info, name="cocktaildb-load"),

    # {} !logged & !is_staff
    # -> 403 {"status": "failure", "message": "error_message"}
    # -> 200  {"cocktail": {**cocktail_info}}
    path(
        "cocktail/tovalidate", views.get_cocktail_to_validate, name="cocktail-validate"
    ),

    # {"id": cocktail_id} !logged & !is_staff
    # -> 403 {"status": "failure", "message": "error_message"}
    # -> 200 {"status": "success"}
    path("cocktail/validate", views.validate_cocktail, name="cocktail-validate"),

    # {"id": cocktail_id} !logged & !is_staff
    # -> 403 {"status": "failure", "message": "error_message"}
    # -> 200 {"status": "success"}
    path("cocktail/refuse", views.refuse_cocktail, name="cocktail-validate"),

    # {}
    # -> 200  {"tags": [{**tag_info, ...}, ...]}
    path("cocktail/tags", views.cocktail_tags, name="cocktail-tags"),

    # {"name": ""}
    # -> 200 {"ingredients": [{"name": "", "color": ""}, ...]}
    path("ingredients", views.ingredients_filter, name="ingredients-get"),

    # {"ingredients": [ingr, ...] or None}
    # -> 200 {"ingredients": [{"name": "", "color": ""}, ...]}
    path(
        "ingredients/suggestion",
        views.ingredient_suggestion,
        name="ingredients-suggestion",
    ),
]

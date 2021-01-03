from django.urls import path

from . import views

urlpatterns = [
    path("cocktail/add", views.add_cocktail, name="cocktail-add"),
    path("cocktail/exact", views.get_exact_cocktail, name="cocktail-exact"),
    path("cocktail/random", views.get_random_cocktail, name="cocktaildb-random"),
    path("cocktail/cocktaildb", views.load_cocktail_db_info, name="cocktaildb-load"),
    path(
        "cocktail/tovalidate", views.get_cocktail_to_validate, name="cocktail-validate"
    ),
    path("cocktail/validate", views.validate_cocktail, name="cocktail-validate"),
    path("cocktail/refuse", views.refuse_cocktail, name="cocktail-validate"),

    path("cocktail/tags", views.cocktail_tags, name="cocktail-tags"),

    path("ingredients", views.ingredients_filter, name="ingredients-get"),
    path(
        "ingredients/suggestion",
        views.ingredient_suggestion,
        name="ingredients-suggestion",
    ),
]

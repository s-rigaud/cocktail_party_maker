from django.urls import path

from . import views

urlpatterns = [
    path("cocktail/add", views.add_cocktail, name="cocktail-add"),
    path("cocktail/exact", views.get_exact_cocktail, name="cocktail-exact"),
    path("cocktail/cocktaildb", views.load_cocktail_db_info, name="cocktaildb-load"),

    path("ingredients", views.ingredients_filter, name="ingredients-get"),
    path(
        "ingredients/suggestion",
        views.ingredient_suggestion,
        name="ingredients-suggestion",
    ),
]

from django.contrib import admin

from .models import Cocktail, CocktailTag, Ingredient, Quantity, Tag

admin.site.register(Cocktail)
admin.site.register(Ingredient)
admin.site.register(Quantity)
admin.site.register(Tag)
admin.site.register(CocktailTag)

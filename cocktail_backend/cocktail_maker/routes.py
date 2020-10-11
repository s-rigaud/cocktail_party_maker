"""
Author: Sam
Goal: Make awesome cocktails !
"""

import json

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from cocktail_maker import app
from cocktail_maker.utils import retrieve_cocktails_for_ingredients
from cocktail_maker.models import Ingredient


@app.route("/ingredients")
def ingredients_filter():
    """List ingredients from DB even those 'without recipe' """
    filters = {k: v for k, v in request.args.items()}
    ingredients = Ingredient.query.all()

    name = filters.get("name")
    if name:
        ingredients = (
            ingredient
            for ingredient in ingredients
            if name in ingredient.ingredient_name
        )

    ingredients_list = [
        {"id": ingredient.id, "name": ingredient.ingredient_name}
        for ingredient in ingredients
    ]

    return jsonify({"ingredients": ingredients_list})


@app.route("/cocktails/exact")
def exact_cocktail():
    """List cocktail from DB"""
    filters = {k: v for k, v in request.args.items()}
    name = filters.get("name")

    ingredient = filters.get("ingredient")
    ingredients = set(json.loads(filters.get("ingredients", "[]")))
    if ingredient:
        ingredients.add(ingredient)
    ingredients.discard("")

    cocktails = retrieve_cocktails_for_ingredients(None, ingredients, True)

    return jsonify({"cocktails": cocktails})


@app.route("/ingredients/add")
def ingredient_complement():
    """When searching from valid new ingredients to add
       the function return the list which take part in the
       composition of a cocktail which can be made from
       provided ones
    """
    filters = {k: v for k, v in request.args.items()}

    ingredient = filters.get("ingredient")
    ingredients = set(json.loads(filters.get("ingredients", "[]")))
    if ingredient:
        ingredients.add(ingredient)
    ingredients.discard("")

    cocktails = retrieve_cocktails_for_ingredients(None, ingredients)
    complement_ingredients = set()
    for cocktail in cocktails:
        complement_ingredients.update(
            [ingr["name"] for ingr in cocktail["ingredients"]]
        )

    # Remove asked ingredients from suggested
    for ingr in ingredients:
        complement_ingredients.discard(ingr)

    return jsonify({"ingredients": list(complement_ingredients)})

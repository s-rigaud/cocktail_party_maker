"""
Author: Sam
Goal: Make awesome cocktails !
"""

import json

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from cocktail_maker import app, db
from cocktail_maker.utils import retrieve_cocktails_from_ingredients, validate_quantity
from cocktail_maker.models import (
    Cocktail,
    Ingredient,
    cocktail_ingredient_quantity,
    add_full_cocktail,
)


@app.route("/cocktails/add", methods=["POST"])
def add_cocktail():
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
    cocktail_data = request.get_json()
    success, message = add_full_cocktail(
        name=cocktail_data.get("name", ""),
        image=cocktail_data.get("image", ""),
        instructions=cocktail_data.get("instructions", ""),
        ingredients=cocktail_data.get("ingredients", []),
        tags=cocktail_data.get("tags", []),
    )
    if not success:
        return json.dumps(message), 418
    else:
        return (
            json.dumps(
                {
                    "name": cocktail_data.get("name", ""),
                    "ingredients": cocktail_data.get("ingredients", []),
                }
            ),
            200,
        )


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

    # Results is list of one or zero element as is_strict is set
    cocktails = retrieve_cocktails_from_ingredients(
        name="",
        ingredients=ingredients,
        is_strict=True,
    )

    return jsonify({"cocktails": cocktails})


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


@app.route("/ingredients/add")
def ingredient_complement():
    """When searching from valid new ingredients to add
    the function return the list which take part in the
    composition of a cocktail which can be made with
    provided ones
    """
    filters = {k: v for k, v in request.args.items()}

    ingredient = filters.get("ingredient")
    ingredients = set(json.loads(filters.get("ingredients", "[]")))
    if ingredient:
        ingredients.add(ingredient)
    ingredients.discard("")

    cocktails = retrieve_cocktails_from_ingredients(
        name="",
        ingredients=ingredients,
        is_strict=False,
    )
    complement_ingredients = set()
    for cocktail in cocktails:
        complement_ingredients.update(
            [ingr["name"] for ingr in cocktail["ingredients"]]
        )

    # Remove asked ingredients from suggested
    for ingr in ingredients:
        complement_ingredients.discard(ingr)

    return jsonify({"ingredients": list(complement_ingredients)})

"""
Author: Sam
Goal: Make awesome cocktails !
"""

import json

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from cocktail_maker import app, db
from cocktail_maker.utils import retrieve_cocktails_for_ingredients
from cocktail_maker.models import Cocktail, Ingredient, cocktail_ingredient_quantity


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
    if (
        cocktail_data
        and cocktail_data.get("name")
        and cocktail_data.get("ingredients")
        and len(cocktail_data["ingredients"]) >= 2
        # Has at least two different ingredients
        and len(set([ingr for ingr, _ in cocktail_data["ingredients"] if ingr])) >= 2
    ):
        cocktail_name = cocktail_data["name"].lower()

        cocktails = Cocktail.query.all()
        db_cocktail_names = [c.cocktail_name for c in cocktails]
        if cocktail_name not in db_cocktail_names:
            new_cocktail = Cocktail(
                cocktail_name=cocktail_name,
                cocktail_image="Not provided",
                cocktail_instructions="Mix!",
            )
            db.session.add(new_cocktail)
            db.session.commit()

            added_ingredients = []
            for ingredient_name, quantity in cocktail_data["ingredients"]:
                if ingredient_name and quantity:
                    ingredient_name = ingredient_name.lower()
                    ingredients = Ingredient.query.filter_by(
                        ingredient_name=ingredient_name
                    )
                    if ingredients.count():
                        ingredient = ingredients[0]
                    else:
                        ingredient = Ingredient(ingredient_name=ingredient_name)
                        db.session.add(ingredient)
                        db.session.commit() # Getting id
                        print(f"Added the new ingredient {ingredient_name}")

                    query = cocktail_ingredient_quantity.insert().values(
                        cocktail_id=new_cocktail.id,
                        ingredient_id=ingredient.id,
                        quantity=quantity,
                    )
                    db.session.execute(query)
                    added_ingredients.append([ingredient.ingredient_name, quantity])

            return json.dumps(
                {
                    "name": cocktail_name,
                    "ingredients": added_ingredients
                }
            ), 200

        else:
            return json.dumps("Cocktail name already used!"), 418

    return (
        json.dumps("You should provide a name and at least 2 different ingredients to create a cocktail!"),
        400,
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

    cocktails = retrieve_cocktails_for_ingredients(None, ingredients, True)

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

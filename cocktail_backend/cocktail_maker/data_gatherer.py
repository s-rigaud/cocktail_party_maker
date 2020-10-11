from httplib2 import Http

from cocktail_maker import db, app
from cocktail_maker.models import (
    Cocktail,
    Ingredient,
    Tag,
    cocktail_ingredient_quantity,
    cocktail_tags,
)
import json

USER_AGENTS = "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36"
http = Http()

### Sources :
# https://www.thecocktaildb.com/api.php
# https://github.com/alfg/opendrinks/blob/master/src/recipes/el-presidente.json


def add_ingredient(api_ingredient: dict):
    """Add ingredient to DB if it doesn't already exist"""
    ingredient_name = api_ingredient["strIngredient1"].lower()
    ingredients = Ingredient.query.filter_by(ingredient_name=ingredient_name)
    if not ingredients.count():
        ingredient = Ingredient(ingredient_name=ingredient_name,)
        db.session.add(ingredient)
        db.session.commit()


def add_cocktail(api_cocktail: dict):
    """Save cocktail into DB
       Add cocktail, tags, ingredients, quantities, cocktail tags mapping
    """
    cocktail_name = api_cocktail["strDrink"].lower()
    cocktails = Cocktail.query.filter_by(cocktail_name=cocktail_name)
    if cocktails.count():
        print(f"{cocktail_name} already exists")
        return

    cocktail = Cocktail(
        cocktail_name=cocktail_name,
        cocktail_image=api_cocktail["strDrinkThumb"],
        cocktail_instructions=api_cocktail["strInstructions"],
    )
    db.session.add(cocktail)
    db.session.commit()  # commit for id

    for index in range(1, 16):
        ingredient_attr = f"strIngredient{index}"
        ingredient_name = api_cocktail[ingredient_attr]

        if ingredient_name:
            ingredient_name = ingredient_name.lower()
            ingredients = Ingredient.query.filter_by(ingredient_name=ingredient_name)

            if ingredients.count():
                ingredient = ingredients[0]
            else:
                # All ingredients already exists normally
                print(f"Added the new ingredient {ingredient_name}")

                ingredient = Ingredient(ingredient_name=ingredient_name)
                db.session.add(ingredient)
            db.session.commit()  # commit for id

            quantity = api_cocktail[f"strMeasure{index}"]
            if quantity:
                quantity = quantity.strip()

            query = cocktail_ingredient_quantity.insert().values(
                cocktail_id=cocktail.id, ingredient_id=ingredient.id, quantity=quantity,
            )
            db.session.execute(query)

    tags = api_cocktail["strTags"]
    if tags:
        for tag_name in tags.split(","):
            tag_name = tag_name.lower()
            tag = Tag.query.filter_by(tag_name=tag_name)
            if tag.count():
                tag = tag[0]
            else:
                tag = Tag(tag_name=tag_name)
                db.session.add(tag)
                db.session.commit()  # commit for id

            query = cocktail_tags.insert().values(
                cocktail_id=cocktail.id, tag_id=tag.id,
            )
            db.session.execute(query)

    db.session.commit()  # Ensure sessio $n commited


def download_cocktail(id_: int = 102):
    """Download cocktail using cocktailDB API"""
    url = f"https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i={id_}"
    _, content = http.request(url, "GET", headers={"user-agent": USER_AGENTS})
    api_cocktails = json.loads(content)["drinks"]
    if api_cocktails:
        api_cocktails = api_cocktails[0]
    return api_cocktails


def download_ingredients(id_: int = 102):
    """Download ingredients using cocktailDB API"""
    url = f"https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list"
    _, content = http.request(url, "GET", headers={"user-agent": USER_AGENTS})
    api_ingredients = json.loads(content)["drinks"]
    return api_ingredients


def collect_cocktails():
    """Download cocktail and insert them into DB"""
    with app.app_context():
        # Current API range is from 11,000 to 19,000
        for i in range(11000, 19000):
            api_cocktail = download_cocktail(i)
            if api_cocktail:
                print(f"Cocktail found for id {i}")
                add_cocktail(api_cocktail)
            else:
                print(f"No cocktail found for id {i}")


def collect_ingredients():
    """Download cocktail and insert them into DB"""
    with app.app_context():
        # Current API range is from 11,000 to 19,000
        api_ingredients = download_ingredients()
        for ingredient in api_ingredients:
            add_ingredient(ingredient)
        print(api_ingredients)

import json

from httplib2 import Http

from .utils import add_full_cocktail, transform_quantity_cdb

USER_AGENTS = "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36"
http = Http()

### Sources :
# https://www.thecocktaildb.com/api.php
# https://github.com/alfg/opendrinks/blob/master/src/recipes/el-presidente.json
# Books


def download_cocktail_cdb(id_: int = 102):
    """Download cocktail using cocktailDB API"""
    url = f"https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i={id_}"
    _, content = http.request(url, "GET", headers={"user-agent": USER_AGENTS})
    api_cocktails = json.loads(content)["drinks"]
    if api_cocktails:
        api_cocktails = api_cocktails[0]
    return api_cocktails


def download_ingredients_cdb(id_: int = 102):
    """Download ingredients using cocktailDB API"""
    url = f"https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list"
    _, content = http.request(url, "GET", headers={"user-agent": USER_AGENTS})
    api_ingredients = json.loads(content)["drinks"]
    return api_ingredients


def collect_cocktails_cdb():
    """Download cocktail and insert them into DB"""
    # Current API range is from 11,000 to 19,000
    for i in range(11000, 19000):
        api_cocktail = download_cocktail_cdb(i)
        if api_cocktail:
            print(f"Cocktail found for id {i}")
            ingredients_and_quantities = []
            for index in range(1, 16):
                ingredient_attr = f"strIngredient{index}"
                ingredient_name = api_cocktail[ingredient_attr]
                if not ingredient_name:
                    break
                ingredient_quantity = transform_quantity_cdb(
                    api_cocktail[f"strMeasure{index}"]
                )
                if ingredient_name:
                    ingredients_and_quantities.append(
                        (ingredient_name, ingredient_quantity)
                    )

            tags = []
            if api_cocktail["strTags"] and "," in api_cocktail["strTags"]:
                tags += api_cocktail["strTags"].split(",")

            add_full_cocktail(
                name=api_cocktail["strDrink"],
                picture=api_cocktail["strDrinkThumb"],
                instructions=api_cocktail["strInstructions"],
                ingredients=ingredients_and_quantities,
                tags=tags,
            )
        else:
            print(f"No cocktail found for id {i}")

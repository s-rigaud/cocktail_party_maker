from typing import Iterable, List, Tuple

from django.contrib import auth

from .models import Cocktail, CocktailTag, Ingredient, Quantity, Tag


def add_full_cocktail(
    name: str,
    picture: str,
    instructions: str,
    ingredients: List[Tuple[str, str]],
    tags: list,
    creator=None,
) -> Tuple[bool, str]:
    """Save cocktail into DB
    Add cocktail, tags, ingredients, quantities, cocktail tags mapping
    """
    # Defensive programming for API calls
    if (
        not name
        or not isinstance(name, str)
        or not ingredients
        or not isinstance(ingredients, list)
        or not len(ingredients) >= 2
        or not len(set([ingr for ingr, _ in ingredients if ingr])) >= 2
        or not isinstance(tags, list)
    ):
        return (
            False,
            "Your cocktail should not already known and have at least 2 different ingredients",
        )

    # Filter empty fields sended via frontend
    for ingredient in list(ingredients):
        quantity = ingredient[1].strip()
        if " " in quantity and not quantity.split(" ")[0]:
            ingredients.remove(ingredient)

    cocktail_name = name.lower().strip()
    is_already_known = Cocktail.objects.filter(name=cocktail_name).exists()
    if is_already_known:
        return False, f"{cocktail_name} already exists"

    cocktail = Cocktail(
        name=cocktail_name,
        picture=picture or "https://image.freepik.com/free-vector/empty-glass-transparent-whiskey-glass-glassware_83194-879.jpg",
        instructions=instructions,
        creator=creator,
    )
    cocktail.save()  # To retrieve ID

    for ingredient_name, quantity in ingredients:
        if ingredient_name:
            ingredient_name = ingredient_name.lower().strip()
            ingredients = Ingredient.objects.filter(name=ingredient_name)

            if ingredients.exists():
                ingredient = ingredients.first()
            else:
                # All ingredients already exists normally
                print(f"Added the new ingredient {ingredient_name}")
                ingredient = Ingredient(name=ingredient_name)
                ingredient.save()  # Save for ID

            if quantity:
                quantity = quantity.lower().strip()

            Quantity(
                cocktail=cocktail,
                ingredient=ingredient,
                quantity=quantity,
            ).save()

    for tag_name in tags:
        tag_name = tag_name.lower().strip()
        tags = Tag.objects.filter(name=tag_name)
        if tags.exists():
            tag = tags.first()
        else:
            tag = Tag(name=tag_name)
            tag.save()  # Save for ID

        CocktailTag(
            cocktail=cocktail,
            tag=tag,
        ).save()

    return True, "Cocktail added"


###
# TO REFACTO or use ↓
####


def validate_api_quantities(quantity: str) -> bool:
    """Validate quantity specify

    Format should be in:
         "\d+ unit"
         "\d+\.\d* unit"
         ""
    """
    if quantity == "":
        return True
    if len(quantity.split(" ")) == 2:
        number, unit = quantity.split(" ")
        try:
            float(number)
        except ValueError:
            pass
        else:
            return unit in ["g", "mL"]
    return False


def validate_quantities(quantities: list) -> bool:
    return all([validate_quantity(q) for q in quantities])


def transform_unit(quantity: str, unit: str, mLsU: int) -> str:
    """Take a quantity, the base unit and the unit/mL coefficient
    and return the mL value
    """
    try:
        number, unit = (quantity.split(unit)[0] + unit).rsplit(" ", 1)
        if " " in number:
            total = 0
            for n in number.split(" "):
                if "-" in n:
                    n = n.split("-")[1]
                elif "/" in n:
                    n = int(n.split("/")[0]) / int(n.split("/")[1])
                total += float(n)
            return f"{int(float(total) * mLsU)} mL"

        if "-" in number:
            number = number.split("-")[1]
        if "/" in number:
            number = int(number.split("/")[0]) / int(number.split("/")[1])
        return f"{int(float(number) * mLsU)} mL"
    except Exception:
        return quantity


def transform_quantity_cdb(quantity: str) -> str:
    """Transform Cocktail DB format into standard one"""
    # None
    if quantity is None:
        return ""

    quantity = quantity.replace("Add", "").strip()

    if " oz" in quantity and " " in quantity:
        return transform_unit(quantity, "oz", 30)  # 1 oz = 30 mL
    if " tsp" in quantity and " " in quantity:
        return transform_unit(quantity, "tsp", 5)  # 1 tsp = 5 mL

    # 2.5 cL | 2 cL
    if "cL" in quantity and " " in quantity:
        number, unit = quantity.rsplit(" ", 1)
        if "." in number:
            number = float(number)
        else:
            number = int(number)
        return f"{int(number * 10)} mL"  # 1 cL = 10 mL

    # Juice of 1 xx
    if quantity.startswith("Juice of "):
        number = quantity.split("Juice of ")[1]
        if "/" in number:
            number = int(number.split("/")[0]) / int(number.split("/")[1])
        try:
            return f"{int(float(number) * 25)} mL"  # 1 full lime juice = 25 mL
        except ValueError:
            return quantity

    # 2-4 | 4
    if " " not in quantity:
        if "-" in quantity:
            quantity = quantity.split("-")[1]
        return f"{quantity} unit"

    print(f"{quantity} format not known")
    return quantity

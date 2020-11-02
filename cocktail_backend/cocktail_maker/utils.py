from cocktail_maker import db
from typing import Iterable


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
        return transform_unit(quantity, "oz", 30) # 1 oz = 30 mL
    if " tsp" in quantity and " " in quantity:
        return transform_unit(quantity, "tsp", 5) # 1 tsp = 5 mL

    # 2.5 cL | 2 cL
    if "cL" in quantity and " " in quantity:
        number, unit = quantity.rsplit(" ", 1)
        if "." in number:
            number = float(number)
        else:
            number = int(number)
        return f"{int(number * 10)} mL" # 1 cL = 10 mL

    # Juice of 1 xx
    if quantity.startswith("Juice of "):
        number = quantity.split("Juice of ")[1]
        if "/" in number:
            number = int(number.split("/")[0]) / int(number.split("/")[1])
        try:
            return f"{int(float(number) * 25)} mL" # 1 full lime juice = 25 mL
        except ValueError:
            return quantity

    # 2-4 | 4
    if " " not in quantity:
        if "-" in quantity:
            quantity = quantity.split("-")[1]
        return f"{quantity} unit"

    print(f"{quantity} format not known")
    return quantity



def transform_cocktails(cocktails: list) -> dict:
    """Transform a db formatted dict line into a standard
    dict formatted cocktail which correspond to API standard
    """
    merge_cocktail_infos = {}
    for cocktail_line in cocktails:
        merge_cocktail_infos.setdefault(
            cocktail_line["cocktail_id"],
            {
                "id": cocktail_line["cocktail_id"],
                "name": cocktail_line["cocktail_name"],
                "instructions": cocktail_line["cocktail_instructions"],
                "image": cocktail_line["cocktail_image"],
                "tags": [],
                "ingredients": [],
                "creation_date": cocktail_line["cocktail_creation_date"],
                "usage": cocktail_line["cocktail_usage"]
            },
        )

        new_ingredient = cocktail_line["ingredient_name"]
        known_cocktail_ingredients = merge_cocktail_infos[cocktail_line["cocktail_id"]][
            "ingredients"
        ]

        if new_ingredient not in [ingr["name"] for ingr in known_cocktail_ingredients]:
            known_cocktail_ingredients.append(
                {
                    "name": new_ingredient,
                    "quantity": cocktail_line["quantity"],
                }
            )
    return merge_cocktail_infos


def retrieve_cocktails_from_ingredients(
    name: str,
    ingredients: set,
    is_strict: bool,
) -> Iterable:
    """Format and filter cocktails following given name and ingredients

    If the is_strict flag is set, the ingredients of the cocktails should
    excatly matched the given ingredients
    """

    base_request = """
    select *
    from   cocktail as c,
           ingredient as i,
           cocktail_ingredient_quantity as ciq
    where  ciq.cocktail_id = c.id
    and    ciq.ingredient_id = i.id
    """.replace(
        "\n", ""
    ).strip()
    if name:
        base_request += f" AND c.cocktail_name = '%{name.lower()}%'"

    db_result = db.engine.execute(base_request)
    cocktail_list = [dict(cocktail_line) for cocktail_line in db_result]
    cocktails = transform_cocktails(cocktail_list)

    # Filter cocktails by ingredients
    for key in list(cocktails):
        cocktail = cocktails[key]
        cocktail_ingredients = set()
        for ingre_quantity in cocktail["ingredients"]:
            cocktail_ingredients.add(ingre_quantity["name"])

        # asked ingredients are not included in cocktail's ones
        if not ingredients.issubset(cocktail_ingredients) or (
            is_strict and ingredients != cocktail_ingredients
        ):
            del cocktails[key]

    # Add one usage if the cocktail is made
    if len(cocktails) == 1 and is_strict:
        first_element = cocktails[list(cocktails)[0]]
        updated_usage = first_element["usage"] + 1

        first_element["usage"] = updated_usage
        update_request = f"update cocktail set cocktail_usage={updated_usage} where id={first_element['id']};"
        print(update_request)
        db.engine.execute(update_request)

    return list(cocktails.values())

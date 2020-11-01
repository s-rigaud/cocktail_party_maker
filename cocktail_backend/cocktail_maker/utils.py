from cocktail_maker import db
from typing import Iterable


def validate_quantity(quantity: str) -> bool:
    """Validate quantity specify

    Format should be in:
         \d+ unit
         \d+\.\d* unit
    """
    if len(quantity.split(" ")) == 2:
        number, unit = quantity.split(" ")
        try:
            float(number)
        except ValueError:
            pass
        else:
            return unit in ["g", "oz", "mL"]
    return False


def validate_quantities(quantities: list) -> bool:
    return all([validate_quantity(q) for q in quantities])


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
        update_request = f"update cocktail set cocktail_usage={updated_usage} where id={list(cocktail)[0]};"
        db.engine.execute(update_request)

    return list(cocktails.values())

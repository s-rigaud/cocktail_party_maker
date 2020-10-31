from cocktail_maker import db
from typing import Iterable


def retrieve_cocktails_for_ingredients(
    name: str,
    ingredients: set,
    is_strict: bool = False,
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
        base_request += f" AND c.cocktail_name like '%{name.lower()}%'"

    db_result = db.engine.execute(base_request)
    cocktail_list = [dict(cocktail_line) for cocktail_line in db_result]

    merge_cocktail_infos = {}
    for cocktail_line in cocktail_list:
        merge_cocktail_infos.setdefault(
            cocktail_line["cocktail_id"],
            {
                "id": cocktail_line["cocktail_id"],
                "name": cocktail_line["cocktail_name"],
                "instructions": cocktail_line["cocktail_instructions"],
                "image": cocktail_line["cocktail_image"],
                "tags": [],
                "ingredients": [],
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

    # Filter cocktails by ingredients
    for key in list(merge_cocktail_infos):
        cocktail = merge_cocktail_infos[key]
        cocktail_ingredients = set()
        for ingre_quantity in cocktail["ingredients"]:
            cocktail_ingredients.add(ingre_quantity["name"])

        # asked ingredients are not included in cocktail's ones
        if not ingredients.issubset(cocktail_ingredients) or (
            is_strict and ingredients != cocktail_ingredients
        ):
            del merge_cocktail_infos[key]

    return list(merge_cocktail_infos.values())

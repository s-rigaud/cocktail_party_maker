from datetime import datetime
from cocktail_maker import db
from typing import List, Tuple
from cocktail_maker.utils import validate_quantities

class Cocktail(db.Model):
    """"""

    id = db.Column(db.Integer, primary_key=True)
    cocktail_name = db.Column(db.String(50))
    cocktail_instructions = db.Column(db.String(8200))
    cocktail_image = db.Column(db.String(8200))
    cocktail_creation_date = db.Column(db.DateTime, default=datetime.utcnow)
    cocktail_usage = db.Column(db.Integer, default=0)

    def __repr__(self):
        return f"Cocktail: {self.id} - {self.cocktail_name}"


class Tag(db.Model):
    """"""

    id = db.Column(db.Integer, primary_key=True)
    tag_name = db.Column(db.String(50))

    def __repr__(self):
        return f"Tag: {self.id} - {self.tag_name}"


class Ingredient(db.Model):
    """"""

    id = db.Column(db.Integer, primary_key=True)
    ingredient_name = db.Column(db.String(50))

    def __repr__(self):
        return f"Ingredient: {self.id} - {self.ingredient_name}"

    @classmethod
    def add(cls, name: str):
        """Add ingredient to DB if it doesn't already exist"""
        ingredient_name = name.lower()
        ingredients = cls.query.filter_by(ingredient_name=ingredient_name)
        if not ingredients.count():
            ingredient = cls(
                ingredient_name=ingredient_name,
            )
            db.session.add(ingredient)
            db.session.commit()


cocktail_ingredient_quantity = db.Table(
    "cocktail_ingredient_quantity",
    db.Model.metadata,
    db.Column("cocktail_id", db.Integer, db.ForeignKey("cocktail.id")),
    db.Column("ingredient_id", db.Integer, db.ForeignKey("ingredient.id")),
    db.Column("quantity", db.String(15)),
)

cocktail_tags = db.Table(
    "cocktail_tags",
    db.Model.metadata,
    db.Column("cocktail_id", db.Integer, db.ForeignKey("cocktail.id")),
    db.Column("tag_id", db.Integer, db.ForeignKey("tag.id")),
)


def add_full_cocktail(
    name: str,
    image: str,
    instructions: str,
    ingredients: List[Tuple[str, str]],
    tags: list,
) -> Tuple[bool, str]:
    """Save cocktail into DB
    Add cocktail, tags, ingredients, quantities, cocktail tags mapping
    """
    # Filter empty fields sended via frontend
    for ingredient in list(ingredients):
        quantity = ingredient[1].strip()
        if " " in quantity and not quantity.split(" ")[0]:
            ingredients.remove(ingredient)

    if (
        not name
        or not ingredients
        or not len(ingredients) >= 2
        or not len(set([ingr for ingr, _ in ingredients if ingr])) >= 2
    ):
        return False, "Your cocktail should not already known and have at least 2 different ingredients"

    cocktail_name = name.lower().strip()
    cocktails = Cocktail.query.filter_by(cocktail_name=cocktail_name)
    if cocktails.count():
        return False, f"{cocktail_name} already exists"

    cocktail = Cocktail(
        cocktail_name=cocktail_name,
        cocktail_image=image,
        cocktail_instructions=instructions,
    )
    db.session.add(cocktail)

    for ingredient_name, quantity in ingredients:
        if ingredient_name:
            ingredient_name = ingredient_name.lower().strip()
            ingredients = Ingredient.query.filter_by(ingredient_name=ingredient_name)

            if ingredients.count():
                ingredient = ingredients[0]
            else:
                # All ingredients already exists normally
                print(f"Added the new ingredient {ingredient_name}")

                ingredient = Ingredient(ingredient_name=ingredient_name)
                db.session.add(ingredient)

            if quantity:
                quantity = quantity.lower().strip()

            db.session.commit()  # commit for id
            query = cocktail_ingredient_quantity.insert().values(
                cocktail_id=cocktail.id,
                ingredient_id=ingredient.id,
                quantity=quantity,
            )
            db.session.execute(query)

    for tag_name in tags:
        tag_name = tag_name.lower().strip()
        tags = Tag.query.filter_by(tag_name=tag_name)
        if tags.count():
            tag = tags[0]
        else:
            tag = Tag(tag_name=tag_name)
            db.session.add(tag)
            db.session.commit()  # commit for id

        query = cocktail_tags.insert().values(
            cocktail_id=cocktail.id,
            tag_id=tag.id,
        )
        db.session.execute(query)

    db.session.commit()  # Ensure session full commited
    return True, ""

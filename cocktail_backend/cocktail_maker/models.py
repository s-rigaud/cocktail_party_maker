from cocktail_maker import db


class Cocktail(db.Model):
    """"""

    id = db.Column(db.Integer, primary_key=True)
    cocktail_name = db.Column(db.String(50))
    cocktail_instructions = db.Column(db.String(8200))
    cocktail_image = db.Column(db.String(8200))

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

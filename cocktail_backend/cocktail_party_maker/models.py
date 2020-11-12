from django.db import models
from django.db.models.deletion import SET_NULL
from django.utils import timezone

from users.models import Profile


class Cocktail(models.Model):
    """"""
    STATES = (("PD", "Pending"), ("AC", "Accepted"), ("RF", "Refused"))
    REVERSED_STATE = {
        short: litteral
        for short, litteral in STATES
    }

    name = models.CharField(max_length=50, unique=True)
    instructions = models.TextField()
    picture = models.TextField()
    creation_date = models.DateTimeField(default=timezone.now)
    usage = models.PositiveIntegerField(default=0)
    state = models.CharField(
        max_length=2,
        default="PD",
        choices=(STATES),
    )
    creator = models.ForeignKey(to=Profile, on_delete=models.SET_NULL, null=True)

    def __repr__(self):
        return f"Cocktail: {self.id} - {self.name}"

    def get_litteral_state(self):
        return self.REVERSED_STATE[self.state]

    def to_api_format(self):
        return {
            "id": self.id,
            "name": self.name,
            "instructions": self.instructions,
            "picture": self.picture,
            "creation_date": self.creation_date.strftime("%d/%m/%Y at %H:%m"),
            "usage": self.usage,
            "state": self.get_litteral_state(),
        }


class Ingredient(models.Model):
    """"""

    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=7, default="#777777")  #  hex color

    def __repr__(self):
        return f"Ingredient: {self.id} - {self.name}"


class Quantity(models.Model):
    """"""

    cocktail = models.ForeignKey(Cocktail, on_delete=models.CASCADE)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    quantity = models.CharField(max_length=50)


class Tag(models.Model):
    """"""

    name = models.CharField(max_length=50, unique=True)

    def __repr__(self):
        return f"Tag: {self.id} - {self.name}"


class CocktailTag(models.Model):
    """"""

    cocktail = models.ForeignKey(Cocktail, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)

from django.db import models
from django.utils import timezone


class Cocktail(models.Model):
    """"""

    name = models.CharField(max_length=50)
    instructions = models.TextField()
    picture = models.TextField()
    creation_date = models.DateTimeField(default=timezone.now)
    usage = models.PositiveIntegerField(default=0)
    state = models.CharField(
        max_length=2,
        default="AC", # TODO : set to PD
        choices=(("PD", "Pending"), ("AC", "Accepted"), ("DA", "Disaproved")),
    )

    def __repr__(self):
        return f"Cocktail: {self.id} - {self.name}"


class Ingredient(models.Model):
    """"""

    name = models.CharField(max_length=50)
    color = models.CharField(max_length=50, default="grey")

    def __repr__(self):
        return f"Ingredient: {self.id} - {self.name}"


class Quantity(models.Model):
    """"""

    cocktail = models.ForeignKey(Cocktail, on_delete=models.CASCADE)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    quantity = models.CharField(max_length=50)


class Tag(models.Model):
    """"""

    name = models.CharField(max_length=50)

    def __repr__(self):
        return f"Tag: {self.id} - {self.name}"


class CocktailTag(models.Model):
    """"""

    cocktail = models.ForeignKey(Cocktail, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)

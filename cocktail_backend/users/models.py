from django.contrib.auth.models import AbstractUser, User
from django.db import models
from django.utils import timezone


class Profile(AbstractUser):
    points = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.username} Profile"

    def to_api_format(self):
        return {
            "login": self.username,
            "is_staff": self.is_staff,
            "points": self.points,
        }

class Notification(models.Model):
    message = models.CharField(max_length=100)
    user = models.ForeignKey(to=Profile, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.message} for {self.user.username}"

    def to_api_format(self):
        return {
            "message": self.message,
        }

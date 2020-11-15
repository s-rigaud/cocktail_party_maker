from django.core.exceptions import ValidationError
from django.core.validators import validate_email


def validate_user_register(
    username: str,
    mail: str,
    password: str,
    password_confirm: str,
):
    try:
        validate_email(mail)
    except ValidationError:
        return False

    return (
        username
        and password
        and mail
        and password_confirm
        and (password == password_confirm)
    )

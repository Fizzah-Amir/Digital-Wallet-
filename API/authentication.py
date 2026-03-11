from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken
from django.db import connection

class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            person_id = validated_token['person_id']
        except KeyError:
            raise InvalidToken('Token contained no recognizable user identification')

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT person_id, name, email, person_type
                FROM person WHERE person_id = %s
            """, [person_id])
            row = cursor.fetchone()

        if not row:
            raise InvalidToken('User not found')

        class PersonObject:
            def __init__(self, person_id, name, email, person_type):
                self.person_id   = person_id
                self.pk          = person_id
                self.name        = name
                self.email       = email
                self.person_type = person_type
                self.is_authenticated = True

        return PersonObject(*row)
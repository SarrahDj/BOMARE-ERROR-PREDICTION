import jwt
import datetime
from django.conf import settings

# JWT settings - in production, move to settings.py and use environment variables
JWT_SECRET = 'your-jwt-secret-key-change-this-in-production'
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24


def generate_jwt_token(user):
    """Generate a JWT token for a user"""
    payload = {
        'user_id': user.id,
        'email': user.email,
        'username': user.username,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRATION_HOURS)
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def verify_jwt_token(token):
    """Verify a JWT token and return the payload"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        # Token has expired
        return None
    except jwt.InvalidTokenError:
        # Invalid token
        return None
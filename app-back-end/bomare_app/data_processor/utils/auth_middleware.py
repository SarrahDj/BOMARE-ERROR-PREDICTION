from django.http import JsonResponse
from ..utils.auth import verify_jwt_token
from ..models.user import User


class JWTAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip auth for login endpoint
        if request.path == '/auth/login/' or request.path == '/auth/register/':
            return self.get_response(request)

        # Check for Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization required'}, status=401)

        # Extract token
        token = auth_header.split(' ')[1]
        payload = verify_jwt_token(token)

        if not payload:
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)

        # Attach user to request
        try:
            user = User.objects.get(id=payload['user_id'])
            request.user = user
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=401)

        return self.get_response(request)
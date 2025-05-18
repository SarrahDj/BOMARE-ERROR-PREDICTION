from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
import hashlib

from sqlalchemy import false

from ..models.user import User
from ..serializers.user import LoginSerializer, UserSerializer
from ..utils.auth import generate_jwt_token


@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data

        # Generate JWT token
        token = generate_jwt_token(user)
        user.last_login = timezone.now()
        user.is_active = True
        user.save()

        return Response({
            'user': UserSerializer(user).data,
            'token': token
        })

    return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def logout(request):
    """
    Logout endpoint - can be expanded to handle token invalidation
    if using a token blacklist.
    """
    # Currently client-side logout is sufficient since we're using JWT
    # But we can log the logout event if needed
    user = request.user
    user.is_active = False
    user.save()

    return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)


@api_view(['POST'])
def register(request):
    # Get user data
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    # Basic validation
    if not username or not email or not password:
        return Response({'error': 'Username, email, and password are required'},
                        status=status.HTTP_400_BAD_REQUEST)

    # Check if user already exists
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already registered'},
                        status=status.HTTP_400_BAD_REQUEST)

    # Hash password
    password_hash = hashlib.sha256(password.encode()).hexdigest()

    # Create user
    user = User.objects.create(
        username=username,
        email=email,
        password_hash=password_hash
    )

    # Generate JWT token
    token = generate_jwt_token(user)

    return Response({
        'user': UserSerializer(user).data,
        'token': token
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_all_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


# Added missing endpoints below to match frontend service

@api_view(['GET'])
def get_user_by_id(request, user_id):
    """Get a single user by ID"""
    try:
        user = User.objects.get(id=user_id)
        serializer = UserSerializer(user)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def create_user(request):
    """Create a new user (admin function)"""
    # Get user data
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    # Basic validation
    if not username or not email or not password:
        return Response({'error': 'Username, email, and password are required'},
                        status=status.HTTP_400_BAD_REQUEST)

    # Check if user already exists
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already registered'},
                        status=status.HTTP_400_BAD_REQUEST)

    # Hash password
    password_hash = hashlib.sha256(password.encode()).hexdigest()

    # Create user
    user = User.objects.create(
        username=username,
        email=email,
        password_hash=password_hash
    )

    return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@api_view(['PUT'])
def update_user(request, user_id):
    """Update a user"""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    # Update fields if provided
    if 'username' in request.data:
        user.username = request.data['username']

    if 'email' in request.data:
        user.email = request.data['email']

    if 'is_active' in request.data:
        user.is_active = request.data['is_active']

    user.save()

    return Response(UserSerializer(user).data)


@api_view(['DELETE'])
def delete_user(request, user_id):
    """Delete a user"""
    try:
        user = User.objects.get(id=user_id)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def reset_password(request, user_id):
    """Reset user password"""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    new_password = request.data.get('new_password')
    force_change = request.data.get('force_change', False)

    if not new_password:
        return Response({'error': 'New password is required'},
                        status=status.HTTP_400_BAD_REQUEST)

    # Hash new password
    password_hash = hashlib.sha256(new_password.encode()).hexdigest()
    user.password_hash = password_hash

    # If force_change is True, you might want to set a flag to make the user
    # change their password on next login
    # This would require adding a field to your User model

    user.save()

    return Response(status=status.HTTP_200_OK)
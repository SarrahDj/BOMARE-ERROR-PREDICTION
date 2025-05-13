from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
import hashlib

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
        user.is_active = True

        return Response({
            'user': UserSerializer(user).data,
            'token': token
        })

    return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


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

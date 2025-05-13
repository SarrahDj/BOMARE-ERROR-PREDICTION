from rest_framework import serializers
from ..models.user import User
import hashlib


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        # Simple password hashing - in production, use a proper solution like bcrypt
        hashed_password = hashlib.sha256(data['password'].encode()).hexdigest()

        try:
            user = User.objects.get(username=data['username'], password_hash=hashed_password)
            return user
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid username or password")


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'created_at']
        read_only_fields = ['id', 'created_at']
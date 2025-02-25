from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.http import JsonResponse
from .serializers import CustomUserSerializer

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(email=email, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token
            response = JsonResponse({'message': 'Login successful'})
            response.set_cookie(
                key='access_token',
                value=str(access),
                httponly=True,
                secure=False,  # Use True in production with HTTPS
                samesite='Lax'
            )
            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                httponly=True,
                secure=False,
                samesite='Lax'
            )
            return response
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class TokenRefreshView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({'error': 'No refresh token provided'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            refresh = RefreshToken(refresh_token)
            new_access = refresh.access_token
            response = JsonResponse({'message': 'Token refreshed'})
            response.set_cookie(
                key='access_token',
                value=str(new_access),
                httponly=True,
                secure=False,
                samesite='Lax'
            )
            return response
        except Exception:
            return Response({'error': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        response = JsonResponse({'message': 'Logout successful'})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response

class AuthStatusView(APIView):
    # We do not enforce permissions so that, in case of an invalid token, request.user remains Anonymous
    def get(self, request):
        user = request.user
        if user and user.is_authenticated:
            serializer = CustomUserSerializer(user)
            return Response({'user': serializer.data}, status=status.HTTP_200_OK)
        return Response({'user': None}, status=status.HTTP_200_OK)
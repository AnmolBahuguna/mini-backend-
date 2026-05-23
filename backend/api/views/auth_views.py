from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.exceptions import ValidationError
import requests
from decouple import config
from api.services.supabase_client import get_or_create_user_profile

import logging
logger = logging.getLogger(__name__)

# Check if we should use demo mode (when Supabase is unreachable)
DEMO_MODE = config('DEMO_MODE', default='false').lower() == 'true'


class SignupView(APIView):
    """User signup endpoint - creates user in Supabase and profile"""
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            email = request.data.get('email', '').strip().lower()
            password = request.data.get('password', '')
            full_name = request.data.get('full_name', '').strip()
            phone = request.data.get('phone', '').strip()
            district = request.data.get('district', '').strip()
            state = request.data.get('state', '').strip()

            # Validation
            if not email:
                return Response({'error': 'Email is required'}, status=400)
            from django.core.validators import validate_email
            try:
                validate_email(email)
            except ValidationError:
                return Response({'error': 'Invalid email format'}, status=400)
                
            if not password:
                return Response({'error': 'Password is required'}, status=400)
            if len(password) < 6:
                return Response({'error': 'Password must be at least 6 characters'}, status=400)

            # Check if we should use demo mode (when Supabase is unreachable)
            supabase_url = config('SUPABASE_URL', default='')
            supabase_key = config('SUPABASE_ANON_KEY', default='') or config('SUPABASE_SERVICE_KEY', default='')

            logger.info(f"[Signup] DEMO_MODE: {DEMO_MODE}, URL: {bool(supabase_url)}, KEY: {bool(supabase_key)}")

            if DEMO_MODE:
                # Use demo mode only when explicitly enabled.
                logger.info("[Signup] Using demo mode")
                from api.services.demo_auth import demo_signup
                user_data = {
                    'full_name': full_name,
                    'phone': phone,
                    'district': district,
                    'state': state,
                    'role': 'user'
                }
                result = demo_signup(email, password, user_data)
                if 'error' in result:
                    return Response({'error': result['error']}, status=result.get('status', 400))
                return Response(result, status=201)
            if not supabase_url or not supabase_key:
                return Response({'error': 'Authentication service is not configured'}, status=503)

            # Real Supabase signup
            try:
                signup_url = f"{supabase_url.rstrip('/')}/auth/v1/signup"
                
                payload = {
                    'email': email,
                    'password': password,
                    'data': {
                        'full_name': full_name,
                        'phone': phone,
                        'district': district,
                        'state': state
                    }
                }

                response = requests.post(
                    signup_url,
                    json=payload,
                    headers={
                        'apikey': supabase_key,
                        'Content-Type': 'application/json'
                    },
                    timeout=10
                )

                if response.status_code in (200, 201):
                    data = response.json()
                    # Supabase can return either:
                    # 1) {"user": {...}, "session": {...}}
                    # 2) user object directly at root when email confirmation is pending.
                    if isinstance(data, dict) and isinstance(data.get('user'), dict):
                        user_data = data.get('user')
                    elif isinstance(data, dict) and data.get('id'):
                        user_data = data
                    else:
                        user_data = None
                    user_id = user_data.get('id') if isinstance(user_data, dict) else None
                    
                    if user_id:
                        # Create profile in our database
                        profile_data = {
                            'full_name': full_name,
                            'phone': phone,
                            'district': district,
                            'state': state,
                            'language': 'en',
                            'role': 'user'
                        }
                        
                        try:
                            profile = get_or_create_user_profile(user_id, email, profile_data)
                            
                            logger.info(f"[Signup] User created: {user_id}")
                            return Response({
                                'user': {
                                    'id': user_id,
                                    'email': email,
                                    'full_name': full_name,
                                    'district': district,
                                    'state': state,
                                    'phone': phone,
                                    'role': 'user'
                                },
                                'session': data,
                                'message': 'Account created successfully'
                            }, status=201)
                        except Exception as e:
                            logger.error(f"[Signup] Profile creation failed: {e}")
                            return Response({'error': f'Profile creation failed: {str(e)}'}, status=500)
                    else:
                        # Supabase may return logical errors in response body even when HTTP is 200.
                        body_error = data.get('msg') or data.get('error') or data.get('error_description')
                        body_code = data.get('code') or data.get('status_code')
                        if body_error:
                            return Response({'error': body_error, 'details': data}, status=400)
                        return Response({'error': 'Failed to create user account', 'details': data}, status=502)
                else:
                    error_data = response.json() if response.content else {}
                    return Response({
                        'error': error_data.get('msg', 'Signup failed'),
                        'details': error_data
                    }, status=response.status_code)
            except Exception as e:
                logger.error(f"Supabase signup failed: {e}")
                return Response({'error': 'Signup service unavailable'}, status=503)

        except Exception as e:
            return Response({'error': f'Server error: {str(e)}'}, status=500)


class LoginView(APIView):
    """User login endpoint - authenticates with Supabase"""
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            email = request.data.get('email', '').strip().lower()
            password = request.data.get('password', '')

            # Validation
            if not email:
                return Response({'error': 'Email is required'}, status=400)
            if not password:
                return Response({'error': 'Password is required'}, status=400)

            # Check if we should use demo mode (when Supabase is unreachable)
            supabase_url = config('SUPABASE_URL', default='')
            supabase_key = config('SUPABASE_ANON_KEY', default='') or config('SUPABASE_SERVICE_KEY', default='')

            logger.info(f"[Login] DEMO_MODE: {DEMO_MODE}, URL: {bool(supabase_url)}, KEY: {bool(supabase_key)}")

            if DEMO_MODE:
                # Use demo mode only when explicitly enabled.
                logger.info("[Login] Using demo mode")
                from api.services.demo_auth import demo_login
                result = demo_login(email, password)
                if 'error' in result:
                    return Response({'error': result['error']}, status=result.get('status', 401))
                return Response(result, status=200)
            if not supabase_url or not supabase_key:
                return Response({'error': 'Authentication service is not configured'}, status=503)

            # Real Supabase login
            try:
                login_url = f"{supabase_url.rstrip('/')}/auth/v1/token?grant_type=password"
                
                payload = {
                    'email': email,
                    'password': password
                }

                response = requests.post(
                    login_url,
                    json=payload,
                    headers={
                        'apikey': supabase_key,
                        'Content-Type': 'application/json'
                    },
                    timeout=10
                )

                if response.status_code == 200:
                    data = response.json()
                    user_data = data.get('user', {})
                    user_id = user_data.get('id')
                    
                    if user_id:
                        # Get or create user profile
                        try:
                            profile = get_or_create_user_profile(user_id, email)
                            
                            return Response({
                                'user': {
                                    'id': user_id,
                                    'email': email,
                                    'full_name': profile.get('full_name', user_data.get('user_metadata', {}).get('full_name')),
                                    'district': profile.get('district'),
                                    'state': profile.get('state'),
                                    'phone': profile.get('phone'),
                                    'role': profile.get('role', 'user')
                                },
                                'session': data,
                                'message': 'Login successful'
                            }, status=200)
                        except Exception as e:
                            return Response({'error': f'Profile retrieval failed: {str(e)}'}, status=500)
                    else:
                        return Response({'error': 'Invalid user data received'}, status=500)
                else:
                    error_data = response.json() if response.content else {}
                    return Response({
                        'error': error_data.get('error_description', 'Invalid credentials'),
                        'details': error_data
                    }, status=response.status_code)
            except Exception as e:
                logger.error(f"Supabase login failed: {e}")
                return Response({'error': 'Login service unavailable'}, status=503)

        except Exception as e:
            return Response({'error': f'Server error: {str(e)}'}, status=500)


class LogoutView(APIView):
    """User logout endpoint"""
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            # In a real implementation, you might want to invalidate the token
            # For now, we'll just return success
            return Response({
                'message': 'Logout successful'
            }, status=200)
        except Exception as e:
            return Response({'error': f'Server error: {str(e)}'}, status=500)


class PasswordResetView(APIView):
    """Password reset endpoint"""
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            email = request.data.get('email', '').strip().lower()

            if not email:
                return Response({'error': 'Email is required'}, status=400)

            supabase_url = config('SUPABASE_URL', default='')
            supabase_key = config('SUPABASE_ANON_KEY', default='') or config('SUPABASE_SERVICE_KEY', default='')

            if not supabase_url or not supabase_key:
                return Response({'error': 'Supabase is not configured'}, status=500)

            # Real Supabase password reset
            try:
                reset_url = f"{supabase_url.rstrip('/')}/auth/v1/recover"

                response = requests.post(
                    reset_url,
                    json={'email': email},
                    headers={
                        'apikey': supabase_key,
                        'Content-Type': 'application/json'
                    },
                    timeout=10
                )

                if response.status_code == 200:
                    return Response({
                        'message': 'Password reset email sent',
                        'email': email
                    }, status=200)
                else:
                    error_data = response.json() if response.content else {}
                    return Response({
                        'error': error_data.get('msg', 'Password reset failed'),
                        'details': error_data
                    }, status=response.status_code)
            except Exception:
                return Response({'error': 'Password reset failed'}, status=500)

        except Exception as e:
            return Response({'error': f'Server error: {str(e)}'}, status=500)

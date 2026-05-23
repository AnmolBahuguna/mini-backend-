from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional

import jwt
import requests
from decouple import config
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


@dataclass
class SupabaseUser:
    id: str
    email: str | None = None
    role: str | None = None
    raw: dict[str, Any] | None = None

    @property
    def is_authenticated(self) -> bool:  # Django compatibility
        return True
    
    @property
    def pk(self) -> str:  # Django compatibility for throttling
        return self.id
    
    @property
    def is_anonymous(self) -> bool:  # Django compatibility
        return False


class SupabaseJWTAuthentication(BaseAuthentication):
    """Verifies Supabase JWT by calling Supabase Auth API.

    This avoids managing JWT signing secrets in Django.
    """

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None

        if not auth_header.lower().startswith('bearer '):
            raise AuthenticationFailed('Malformed authorization header')

        token = auth_header.split('Bearer ')[-1].strip()
        if not token:
            raise AuthenticationFailed('Malformed authorization token')

        user = self._get_user_from_token(token)
        return (user, token)

    def authenticate_header(self, request):
        return 'Bearer'

    def _get_user_from_token(self, token: str) -> SupabaseUser:
        supabase_url = config('SUPABASE_URL', default='')
        demo_mode = config('DEMO_MODE', default='false').lower() == 'true'
        from django.conf import settings
        demo_secrets = [
            'demo-mode-secret-key-not-for-production',
            getattr(settings, 'SECRET_KEY', ''),
            'demo-fallback-key',
        ]

        if not supabase_url or demo_mode:
            # Demo mode: validate token against accepted demo secrets.
            for secret in demo_secrets:
                if not secret:
                    continue
                try:
                    payload = jwt.decode(token, secret, algorithms=['HS256'])
                    return SupabaseUser(
                        id=payload.get('sub', ''),
                        email=payload.get('email'),
                        role=payload.get('role', payload.get('user_metadata', {}).get('role', 'user')),
                        raw=payload
                    )
                except jwt.InvalidTokenError:
                    continue
            raise AuthenticationFailed('Invalid demo token')

        api_key = config('SUPABASE_ANON_KEY', default='') or config('SUPABASE_SERVICE_KEY', default='')
        if not api_key:
            raise AuthenticationFailed('Supabase is not configured (SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY missing)')

        url = supabase_url.rstrip('/') + '/auth/v1/user'
        try:
            resp = requests.get(
                url,
                headers={
                    'Authorization': f'Bearer {token}',
                    'apikey': api_key,
                },
                timeout=8,
            )
        except requests.RequestException as exc:
            raise AuthenticationFailed('Unable to verify token') from exc

        if resp.status_code != 200:
            raise AuthenticationFailed('Invalid or expired token')

        data: dict[str, Any] = resp.json()
        return SupabaseUser(
            id=str(data.get('id', '')),
            email=data.get('email'),
            role=(data.get('user_metadata') or {}).get('role', data.get('role', 'user')),
            raw=data,
        )


def get_supabase_user(request) -> Optional[SupabaseUser]:
    user = getattr(request, 'user', None)
    if isinstance(user, SupabaseUser):
        return user
    return None

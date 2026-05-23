from rest_framework.permissions import BasePermission
from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated

from api.auth import SupabaseUser


class IsSupabaseAuthenticated(BasePermission):
    message = 'Authentication credentials were not provided or are invalid.'

    def has_permission(self, request, view) -> bool:
        user = getattr(request, 'user', None)
        if isinstance(user, SupabaseUser):
            return True

        auth_header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')
        if auth_header:
            raise AuthenticationFailed('Invalid or expired token')
        raise NotAuthenticated('Authentication credentials were not provided')

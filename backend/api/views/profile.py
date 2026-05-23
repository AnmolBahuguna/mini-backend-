from __future__ import annotations

from rest_framework.response import Response
from rest_framework.views import APIView
from decouple import config

from api.auth import SupabaseUser
from api.permissions import IsSupabaseAuthenticated
from api.serializers import ProfilePatchSerializer
from api.services.supabase_client import get_or_create_user_profile, patch_user_profile


class ProfileView(APIView):
    permission_classes = [IsSupabaseAuthenticated]

    def get(self, request):
        user: SupabaseUser = request.user
        demo_mode = config('DEMO_MODE', default='false').lower() == 'true'
        
        if demo_mode:
            # In demo mode, get user data from the demo storage
            from api.services.demo_auth import demo_get_user
            profile = demo_get_user(user_id=user.id, email=user.email)
            if profile:
                return Response(profile)
            else:
                return Response({'error': 'User not found in demo mode'}, status=404)
        
        # Regular Supabase mode
        profile = get_or_create_user_profile(user.id, email=user.email)
        return Response(profile)

    def patch(self, request):
        user: SupabaseUser = request.user
        serializer = ProfilePatchSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        demo_mode = config('DEMO_MODE', default='false').lower() == 'true'
        
        if demo_mode:
            # In demo mode, just return the updated data (no persistence)
            return Response({'message': 'Demo mode: Profile updated (not persisted)', 'updated_fields': serializer.validated_data})
        
        # Regular Supabase mode
        updated = patch_user_profile(user.id, serializer.validated_data)
        return Response(updated)

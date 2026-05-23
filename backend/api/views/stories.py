from __future__ import annotations

from rest_framework.response import Response
from rest_framework.views import APIView

from api.serializers import StoryCreateSerializer
from api.services.supabase_client import create_story, list_stories


class StoriesListCreateView(APIView):
    def get(self, request):
        rows = list_stories()
        return Response({'results': rows})

    def post(self, request):
        serializer = StoryCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        row = create_story(serializer.validated_data)
        return Response(row, status=201)

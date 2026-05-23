from __future__ import annotations

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from api.services.crime_data_service import get_india_crime_stats


class HeatmapView(APIView):
    """
    GET /api/heatmap/
    
    Returns state-wise crime data for heatmap visualization.
    Fetches from crime statistics service and formats for map display.
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        # Fetch crime stats from service
        result = get_india_crime_stats()
        
        # If successful, return the states data directly
        if result.get('success'):
            states_data = result.get('data', [])
            
            # Format for frontend heatmap component
            return Response({
                'success': True,
                'data': states_data,
                'count': len(states_data),
                'total_india': result.get('total_india', 0)
            })
        
        # Return error if crime stats failed
        return Response({
            'success': False,
            'data': [],
            'count': 0,
            'message': result.get('message', 'Failed to fetch heatmap data')
        })

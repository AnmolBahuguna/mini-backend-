from __future__ import annotations

import hashlib
import logging
from pathlib import Path
from uuid import uuid4

from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from api.auth import SupabaseUser
from api.permissions import IsSupabaseAuthenticated
from api.services.supabase_client import delete_evidence_row, insert_evidence_rows, list_evidence_for_user

logger = logging.getLogger(__name__)
MAX_FILE_SIZE = 10 * 1024 * 1024
ALLOWED_TYPES = {
    'image/jpeg',
    'image/png',
    'application/pdf',
    'video/mp4',
    'text/plain',
}
EXTENSION_TO_MIME = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.txt': 'text/plain',
}


class EvidenceListCreateView(APIView):
    permission_classes = [IsSupabaseAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        user: SupabaseUser = request.user
        rows = list_evidence_for_user(user.id)
        return Response({'results': rows})

    def post(self, request):
        user: SupabaseUser = request.user
        files = request.FILES.getlist('files') or request.FILES.getlist('file')
        description = request.data.get('description')
        if not files:
            # Allow metadata-only insert
            return Response({'ok': True, 'uploaded': 0})

        rows = []
        from api.services.supabase_client import supabase
        for f in files:
            file_size = getattr(f, 'size', 0)
            if file_size > MAX_FILE_SIZE:
                return Response({'error': f"File {f.name} exceeds 10MB limit"}, status=400)

            extension = Path(f.name).suffix.lower()
            content_type = (getattr(f, 'content_type', None) or '').lower()
            if not content_type or content_type == 'application/octet-stream':
                content_type = EXTENSION_TO_MIME.get(extension, content_type)
            if content_type not in ALLOWED_TYPES:
                return Response({'error': f"Unsupported file type: {content_type or extension or 'unknown'}"}, status=400)

            sha256 = hashlib.sha256()
            for chunk in f.chunks():
                sha256.update(chunk)
            file_hash = sha256.hexdigest()
            f.seek(0)
            content = f.read()
            storage_path = f"uploads/{user.id}/{uuid4().hex}_{Path(f.name).name}"

            if supabase:
                try:
                    supabase.storage.from_("evidence").upload(
                        path=storage_path,
                        file=content,
                        file_options={"content-type": content_type}
                    )
                except Exception as e:
                    logger.error(f"Failed to upload to Supabase Storage: {e}")
                    return Response(
                        {'error': 'Evidence upload failed. Verify Supabase Storage bucket "evidence" exists and service key has storage permissions.'},
                        status=500,
                    )

            rows.append({
                'user_id': user.id,
                'file_name': f.name,
                'hash_sha256': file_hash,
                'storage_path': storage_path,
                'storage_bucket': 'evidence',
                'file_type': content_type,
                'file_size': int(file_size),
                'description': description,
                'is_encrypted': True,
            })

        inserted = insert_evidence_rows(rows)
        results = []
        for row in inserted:
            results.append({
                **row,
                'file_hash': row.get('hash_sha256'),
                'encrypted': bool(row.get('is_encrypted')),
                'file_url': f"s3://{row.get('storage_bucket', 'evidence')}/{row.get('storage_path', '')}",
            })
        return Response({'results': results}, status=201)


class EvidenceDeleteView(APIView):
    permission_classes = [IsSupabaseAuthenticated]

    def delete(self, request, id):
        user: SupabaseUser = request.user
        delete_evidence_row(user.id, str(id))
        return Response(status=204)

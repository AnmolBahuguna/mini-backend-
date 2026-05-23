from __future__ import annotations

from rest_framework import serializers
from api.services.entity_detection import detect_entity_type


class ThreatCheckRequestSerializer(serializers.Serializer):
    entity = serializers.CharField(max_length=1000, required=False)
    value = serializers.CharField(max_length=1000, required=False)
    entity_type = serializers.CharField(required=False)
    type = serializers.CharField(required=False)

    def validate(self, data):
        entity = data.get('entity') or data.get('value')
        if not entity:
            raise serializers.ValidationError("entity/value is required")
        entity_type = (data.get('entity_type') or data.get('type') or '').strip().lower()
        if not entity_type:
            entity_type = detect_entity_type(str(entity))
        valid_types = {'url', 'domain', 'email', 'phone', 'ip', 'upi', 'message'}
        if entity_type not in valid_types:
            raise serializers.ValidationError(f"entity_type/type must be one of: {', '.join(sorted(valid_types))}")
        data['entity'] = entity
        data['entity_type'] = entity_type
        return data


class PanicRequestSerializer(serializers.Serializer):
    lat = serializers.FloatField(required=False, allow_null=True)
    lng = serializers.FloatField(required=False, allow_null=True)
    contacts = serializers.ListField(child=serializers.CharField(), required=False)
    location = serializers.DictField(required=False)
    emergency_contacts = serializers.ListField(child=serializers.CharField(), required=False)
    name = serializers.CharField(required=False, allow_blank=True)
    message = serializers.CharField(required=False, allow_blank=True)


class SupportChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=2000)
    history = serializers.ListField(child=serializers.DictField(), required=False)


class ReportCreateSerializer(serializers.Serializer):
    entity = serializers.CharField(max_length=1000)
    entity_type = serializers.ChoiceField(choices=['url', 'domain', 'phone', 'email', 'upi', 'ip', 'message'])
    scam_type = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    district = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    severity = serializers.ChoiceField(choices=['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required=False)


class ProfilePatchSerializer(serializers.Serializer):
    full_name = serializers.CharField(required=False, allow_blank=True)
    display_name = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    district = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    notifications_enabled = serializers.BooleanField(required=False)
    consent_data_use = serializers.BooleanField(required=False)


class StoryCreateSerializer(serializers.Serializer):
    content = serializers.CharField(max_length=5000)
    scam_type = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    is_anonymous = serializers.BooleanField(required=False)

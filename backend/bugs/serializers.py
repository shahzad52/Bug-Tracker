from rest_framework import serializers
from .models import Bugs
from django.contrib.auth import get_user_model
from accounts.serializers import UserSerializer

User = get_user_model()

class BugSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    creator = UserSerializer(read_only=True)
    assignee_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='assignee',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Bugs
        fields = [
            "id", "project", "title", "detail", "deadline",
            "status", "type", "assignee", "creator", "assignee_id",
            "bug_attachment", "created_at", "updated_at"
        ]

    def validate(self, data):
        instance = self.instance
        bug_type = data.get("type", instance.type if instance else None)
        status = data.get("status", instance.status if instance else None)

        valid_status = {
            Bugs.TYPE_BUG: [Bugs.STATUS_NEW, Bugs.STATUS_STARTED, Bugs.STATUS_RESOLVED],
            Bugs.TYPE_FEATURE: [Bugs.STATUS_NEW, Bugs.STATUS_STARTED, Bugs.STATUS_COMPLETED],
        }

        if bug_type and status and status not in valid_status.get(bug_type, []):
            raise serializers.ValidationError(
                {"status": f"Invalid status '{status}' for type '{bug_type}'"}
            )
        return data

    def validate_bug_attachment(self, value):
        if value is not None and not isinstance(value, dict):
            raise serializers.ValidationError("Bug attachment must be a JSON object or null")
        return value

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

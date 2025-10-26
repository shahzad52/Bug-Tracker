from rest_framework import serializers
from .models import Projects, ProjectUsers
from django.contrib.auth import get_user_model

User = get_user_model()

class ProjectUsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectUsers
        fields = ("id", "project", "user")

class ProjectsSerializer(serializers.ModelSerializer):
    manager = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), allow_null=True)
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Projects
        fields = ['id', 'name', 'detail', 'manager', 'logo', 'logo_url', 'created_at', 'updated_at']

    def get_logo_url(self, obj):
        if obj.logo:
            if obj.logo.startswith('http'):
                return obj.logo
            return f'/media/{obj.logo}'
        return None

from rest_framework import permissions
from .models import Projects

class IsManager(permissions.BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        return bool(user and getattr(user, "role", None) == "manager")

class IsProjectManager(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method == "POST":
            project_id = request.data.get("project")
            if not project_id:
                return False
            try:
                project = Projects.objects.get(pk=project_id)
            except Projects.DoesNotExist:
                return False
            user = getattr(request, "user", None)
            return bool(user and project.manager_id == getattr(user, "id", None))
        return True

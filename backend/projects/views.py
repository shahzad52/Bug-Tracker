from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Projects, ProjectUsers
from .serializers import ProjectsSerializer, ProjectUsersSerializer
from .permissions import IsManager, IsProjectManager
from rest_framework.decorators import action
from django.core.mail import send_mail

class ProjectsViewSet(viewsets.ModelViewSet):
    
    serializer_class = ProjectsSerializer
    permission_classes = [permissions.AllowAny]
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Projects.objects.none()

        if user.role == "manager":
            return Projects.objects.filter(manager=user)
        elif user.role in ["qa", "developer"]:
            return Projects.objects.filter(project_users__user=user)
        return Projects.objects.none()

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsManager()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        from accounts.models import Notification
        user = self.request.user if self.request.user.is_authenticated else None
        project = serializer.save(manager=user)
        ProjectUsers.objects.get_or_create(project=project, user=user)
        

        Notification.objects.create(
            user=user,
            notification_type='project_addition',
            title='New Project Created',
            message=f'You have successfully created project "{project.name}"',
            related_link=f'/projects/{project.id}'
        )

class ProjectUsersViewSet(viewsets.ModelViewSet):
    queryset = ProjectUsers.objects.all()
    serializer_class = ProjectUsersSerializer

    def get_permissions(self):
        if self.action == "create":
            return [IsProjectManager()]
        return [permissions.AllowAny()]

    def create(self, request, *args, **kwargs):
        from accounts.models import Notification, User
        project_id = request.data.get("project")
        user_id = request.data.get("user")
        manager = request.user
        if not project_id or not user_id:
            return Response({"error": "project and user are required"}, status=status.HTTP_400_BAD_REQUEST)
        if ProjectUsers.objects.filter(project_id=project_id, user_id=user_id).exists():
            return Response({"error": "user already member"}, status=status.HTTP_400_BAD_REQUEST)
            
        response = super().create(request, *args, **kwargs)
        
        if response.status_code == 201:
            project = Projects.objects.get(id=project_id)
            added_user = User.objects.get(id=user_id)
            
            Notification.objects.create(
                user=added_user,
                notification_type='project_addition',
                title='Added to New Project',
                message=f'You have been added to project "{project.name}"',
                related_link=f'/projects/{project_id}'
            )
            send_mail(
                        'You are added to a New Project',
                        f'You have been added to project "{project.name}" by Manager "{manager.name}"',
                        None, 
                        [added_user.email], 
                        fail_silently=False,
                    )
        return response

    
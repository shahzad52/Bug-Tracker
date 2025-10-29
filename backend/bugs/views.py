from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Bugs
from .serializers import BugSerializer
from projects.models import ProjectUsers
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import parser_classes
from django.core.mail import send_mail



class BugsViewSet(viewsets.ModelViewSet):
    serializer_class = BugSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context
    def create(self, request, *args, **kwargs):
        from accounts.models import Notification, User
        user = request.user
        project_id = request.data.get("project")
        assignee_id = request.data.get("assignee")

        if not ProjectUsers.objects.filter(project=project_id, user=user).exists():
            return Response({"error": "You are not assigned to this project."}, status=403)
        if user.role != "qa":
            return Response({"error": "Only QA can create bugs."}, status=403)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        bug = serializer.save(creator=user)

        
        if assignee_id:
            try:
                assignee = User.objects.get(id=assignee_id)
                bug.assignee = assignee
                bug.save()
                
                Notification.objects.create(
                    user=assignee,
                    notification_type='bug_assignment',
                    title='New Bug Assigned',
                    message=f'You have been assigned a new bug: {bug.title}',
                    related_link=f'/projects/{project_id}'
                )
                send_mail(
                        'New Bug Assigned',
                        f'You have been assigned a new bug: {bug.title} by QA "{user.name}"',
                        None, 
                        [assignee.email], 
                        fail_silently=False,
                    )
            except User.DoesNotExist:
                pass

        
        serializer = self.get_serializer(bug)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        user = request.user
        instance = self.get_object()

        if user.role == "developer" and instance.assignee != user:
            return Response({"error": "You can only update bugs assigned to you."}, status=403)

        if user.role == "manager" and instance.project.manager != user:
            return Response({"error": "You are not the manager of this project."}, status=403)

        if 'bug_attachment' in request.FILES and user.role != 'developer':
            return Response({"error": "Only developers can add or update bug screenshots."}, status=403)

        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Bugs.objects.none()

        if user.role == "manager":
            return Bugs.objects.filter(project__manager=user)
        elif user.role == "qa":
            return Bugs.objects.filter(creator=user.id)
        elif user.role == "developer":
            return Bugs.objects.filter(assignee=user.id)
        return Bugs.objects.none()

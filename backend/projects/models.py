from django.db import models
from django.conf import settings


class Projects(models.Model):
    name = models.CharField(max_length=255)
    detail = models.TextField(blank=True)
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="managed_projects"
    )
    logo = models.CharField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class ProjectUsers(models.Model):
    project = models.ForeignKey(
        Projects,
        on_delete=models.CASCADE,
        related_name="project_users"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_projects"
    )

    class Meta:
        unique_together = ("project", "user")

    def __str__(self):
        return f"{self.user} @ {self.project}"

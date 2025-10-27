from django.db import models
from django.conf import settings
from projects.models import Projects

class Bugs(models.Model):
    TYPE_BUG = "bug"
    TYPE_FEATURE = "feature"
    TYPE_CHOICES = [
        (TYPE_BUG, "Bug"),
        (TYPE_FEATURE, "Feature"),
    ]

    STATUS_NEW = "new"
    STATUS_STARTED = "started"
    STATUS_RESOLVED = "resolved"
    STATUS_COMPLETED = "completed"
    STATUS_CHOICES = [
        (STATUS_NEW, "New"),
        (STATUS_STARTED, "Started"),
        (STATUS_RESOLVED, "Resolved"),
        (STATUS_COMPLETED, "Completed"),
    ]

    project = models.ForeignKey(Projects, on_delete=models.CASCADE, related_name="bugs")
    title = models.CharField(max_length=255)
    detail = models.TextField(blank=True)
    deadline = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_NEW)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default=TYPE_BUG)
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_bugs"
    )
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="created_bugs"
    )
    bug_attachment = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=["project", "title"], name="unique_bug_title_per_project")
        ]

    def __str__(self):
        return self.title

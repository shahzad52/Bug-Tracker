from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from accounts.views import (
    PublicUserViewSet, RegisterView, CurrentUserView, NotificationViewSet,
    ProfileUpdateView, NotificationListView
)
from projects.views import ProjectsViewSet, ProjectUsersViewSet
from bugs.views import BugsViewSet
from bugs.upload_views import upload_file
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from projects.llms_feedback import generate_ai_response

from django.conf import settings
from django.conf.urls.static import static

router = routers.DefaultRouter()
router.register(r"users", PublicUserViewSet, basename="users")
router.register(r"projects", ProjectsViewSet,basename="projects")

router.register(r"project-users", ProjectUsersViewSet,basename="project-users")
router.register(r"bugs", BugsViewSet,basename="bugs")
router.register(r"notifications", NotificationViewSet, basename="notifications")


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("api/auth/me/", CurrentUserView.as_view(), name="current_user"),
    path('api/auth/profile/update/', ProfileUpdateView.as_view(), name='profile-update'),
    path('api/notifications/', NotificationListView.as_view(), name='notification-list'),
    #path('api/notifications/<int:pk>/read/', NotificationMarkReadView.as_view(), name='notification-mark-read'),
    path('api/upload/', upload_file, name='file-upload'),
    path('generate-ai/',generate_ai_response,name='generate-ai')
]


urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import os

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_file(request):
    if 'file' not in request.FILES:
        return Response({'error': 'No file provided'}, status=400)
    
    file = request.FILES['file']
    upload_type = request.data.get('type', 'bug_attachment')
    
    if file.size > 5 * 1024 * 1024:
        return Response({'error': 'File size should be less than 5MB'}, status=400)
    
    if upload_type == 'bug_attachment':
        if not file.content_type in ['image/png', 'image/gif']:
            return Response({'error': 'Only PNG and GIF files are allowed for bug attachments'}, status=400)
        base_dir = settings.BUG_ATTACHMENTS_DIR


    elif upload_type == 'profile_picture':
        if not file.content_type.startswith('image/'):
            return Response({'error': 'Only image files are allowed for profile pictures'}, status=400)
        base_dir = settings.PROFILE_PICTURES_DIR

    elif upload_type == 'project_logo':
        if not file.content_type.startswith('image/'):
            return Response({'error': 'Only image files are allowed for project logos'}, status=400)
        base_dir = settings.PROJECT_LOGOS_DIR
        
    else:
        return Response({'error': 'Invalid upload type'}, status=400)
    
    filename = f"{base_dir}/{file.name}"
    full_path = os.path.join(settings.MEDIA_ROOT, filename)
    
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    
    with open(full_path, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)
    
    return Response({
        'path': filename,
        'filename': os.path.basename(file.name)
    })
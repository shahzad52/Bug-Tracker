from json import load
import os
from dotenv import load_dotenv
import google.generativeai as genai
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from .serializers import PromptSerializer
from rest_framework.response import Response

load_dotenv()
api_key = os.environ.get('GEMINI_API_KEY')
genai.configure(api_key=api_key)

@api_view(['POST','GET'])
@permission_classes([AllowAny])
def generate_ai_response(request):
    serializer = PromptSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    prompt = serializer.validated_data.get('prompt')
    try:
        model = genai.GenerativeModel(model_name="gemini-2.5-flash")
        response = model.generate_content(contents=prompt)
        
        return Response({'response': response.text}, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {'error': f'Failed to generate AI response: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
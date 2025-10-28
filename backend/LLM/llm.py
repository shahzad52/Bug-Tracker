from json import load
import os
from dotenv import load_dotenv
import google.generativeai as genai
load_dotenv()
api_key = os.environ.get('GEMINI_API_KEY')

genai.configure(api_key=api_key)

model = genai.GenerativeModel(model_name="gemini-2.5-flash") 
response = model.generate_content(
    contents="Explain how AI works in a few words"
)
print(response.text)
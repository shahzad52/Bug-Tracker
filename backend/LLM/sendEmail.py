from django.core.mail import send_mail

send_mail(
    'Test Subject',
    'This is a test message from Django.',
    None, 
    ['smart523r@gmail.com'], 
    fail_silently=False,
)


from django.conf import settings
print(f"Host User: {settings.EMAIL_HOST_USER}")
print(f"From Email: {settings.DEFAULT_FROM_EMAIL}")
print(f"Password Set: {bool(settings.EMAIL_HOST_PASSWORD)}")
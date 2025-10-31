from django.core.mail import send_mail

send_mail(
    'Test Subject',
    'This is a test message from Django.',
    None, 
    ['smart523r@gmail.com'], 
    fail_silently=False,
)



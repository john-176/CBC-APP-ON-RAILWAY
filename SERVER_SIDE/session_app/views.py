from django.shortcuts import render

# Create your views here.
from django.shortcuts import render

# Create your views here.
#views.py
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect, csrf_exempt
from django.views.decorators.http import require_POST, require_GET
from django.contrib.auth.decorators import login_required
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password, get_default_password_validators
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django_ratelimit.decorators import ratelimit
#import re
import json

from django.views.generic import View
from django.shortcuts import render



#ensure_csrf_cookie
@ensure_csrf_cookie
def get_csrf(request):
    return JsonResponse({"csrfToken": "set"})


@login_required
def check_auth_view(request):
    if request.user.is_authenticated:
        return JsonResponse({"user:": request.user.username})
    return JsonResponse({"error": "Not authenticated"}, status=403)


#Login
@ratelimit(key='ip', rate='5/m', block=True)
@require_POST
def login_view(request):
    data = json.loads(request.body)
    user = authenticate(username=data['username'], password=data['password'])
    if user:
        login(request, user)
        return JsonResponse({"message": "Logged in"})
    return JsonResponse({"error": "Invalid Email or Password"}, status=400)


@require_POST
def logout_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "You are not logged in."}, status=400)
    logout(request)
    return JsonResponse({"message": "Logged out successfully."})


@require_POST
def signup_view(request):
    data = json.loads(request.body)
    username = data.get("username", "")
    password = data.get("password", "")
    password2 = data.get("password2", "")

    try:
        validate_email(username)
    except ValidationError:
        return JsonResponse({"error": "Enter a valid email address."}, status=400)

    if password != password2:
        return JsonResponse({"error": "Passwords do not match."}, status=400)
    
    try:
        validate_password(password)
    except ValidationError as e:
        return JsonResponse({"error": e.messages[0]}, status=400)
    
    #The response does not explictly say whether the eamil exist or not.
    #Intended to avoid accounts ENUMERATION
    if User.objects.filter(username=username).exists():
        return JsonResponse({"message": "If your email is valid, you'll receive an activation link shortly. check your email."
                             })
        
    user = User.objects.create_user(username=username, password=password, is_active=False)
    
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    activation_link = f"http://localhost:8000/api/activate/{uid}/{token}/"

    send_mail(
        subject="Activate your account",
        message=f"Click the link to activate: {activation_link}",
        from_email=None,  # Uses DEFAULT_FROM_EMAIL in settings
        recipient_list=[username],
    )

    return JsonResponse({"message": "User created"})


@require_GET
def activate_account(request, uidb64, token):
    try:
       # print("Activation attempt")
        uid = urlsafe_base64_decode(uidb64).decode()
        #print("Decoded UID:", uid)

        user = User.objects.get(pk=uid)
        #print("User found:", user.username)

        if default_token_generator.check_token(user, token):
            #print("Token valid")
            user.is_active = True
            user.save()
            return JsonResponse({"message": "Account activated"})
        else:
            #print("Token invalid")
            return JsonResponse({"error": "Invalid activation link"}, status=400)

    except (User.DoesNotExist, ValueError, TypeError, UnicodeDecodeError) as e:
        #print("Activation failed:", e)
        return JsonResponse({"error": "Invalid activation data"}, status=400)


#Password Reset

@require_POST
def request_password_reset(request):
    data = json.loads(request.body)
    email = data.get("email")
    try:
        user = User.objects.get(username=email)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"http://localhost:5173/reset/{uid}/{token}/"  # Link to frontend route

        send_mail(
            subject="Reset your password",
            message=f"Click to reset your password: {reset_link}",
            from_email=None,
            recipient_list=[email],
        )
        return JsonResponse({"message": "Reset link sent"})
    except User.DoesNotExist:
        return JsonResponse({"error": "Email not found"}, status=400)
from django.contrib.auth.password_validation import validate_password, get_default_password_validators
from django.core.exceptions import ValidationError

@require_POST
def confirm_password_reset(request, uidb64, token):
    data = json.loads(request.body)
    new_password = data.get("password")
    
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)

        if not default_token_generator.check_token(user, token):
            return JsonResponse({"error": "Invalid or expired token"}, status=400)

        # ✅ Validate password against Django's validators
        try:
            validate_password(new_password, user=user)
        except ValidationError as ve:
            return JsonResponse({"error": ve.messages}, status=400)

        # If valid, set password
        user.set_password(new_password)
        user.save()
        return JsonResponse({"message": "Password reset successful..."})

    except (User.DoesNotExist, ValueError, TypeError):
        return JsonResponse({"error": "Invalid reset data"}, status=400)

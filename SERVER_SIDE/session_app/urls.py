# session_app/urls.py
from django.urls import path
from session_app.views import AuthCheckView
from . import views
from .views import activate_account, confirm_password_reset, request_password_reset

urlpatterns = [
    path('csrf/', views.get_csrf),
    path('auth-check/', AuthCheckView.as_view(), name='auth-check'),
    path('login/', views.login_view),
    path('logout/', views.logout_view),
    path('signup/', views.signup_view),
    path('activate/<uidb64>/<token>/', activate_account),
    path('password-reset/', request_password_reset),
    path('password-reset-confirm/<uidb64>/<token>/', confirm_password_reset),
]

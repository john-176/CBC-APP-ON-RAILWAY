"""
Cleaned Django settings for local development and production — tailored for Render backend, Cloudflare Pages frontend, and Neon.tech database
"""

import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url

# ───── BASE ────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "insecure-dev-secret")
DEBUG = os.getenv("DEBUG", "False") == "True"

if DEBUG:
    ALLOWED_HOSTS = ["localhost", "127.0.0.1"]
else:
    ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")


# ───── CORS & CSRF ─────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = (
    ["http://localhost:5173", "http://127.0.0.1:5173"]
    if DEBUG else os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
)
CSRF_TRUSTED_ORIGINS = (
    ["http://localhost:5173", "http://127.0.0.1:5173"]
    if DEBUG else os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",")
)
CORS_ALLOW_CREDENTIALS = True

# ───── COOKIE & SESSION SETTINGS ───────────────────────────────────────────
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SAMESITE = 'Lax'

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

if DEBUG:
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
else:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    X_FRAME_OPTIONS = 'DENY'
    SESSION_ENGINE = "django.contrib.sessions.backends.db"
    SESSION_EXPIRE_AT_BROWSER_CLOSE = True
    SESSION_COOKIE_AGE = int(os.getenv("SESSION_COOKIE_AGE", 1209600))


# ───── INSTALLED APPS ──────────────────────────────────────────────────────
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # 3rd-party
    'corsheaders',
    'rest_framework',
    'cloudinary_storage',
    'cloudinary',
    'whitenoise.runserver_nostatic',

    # Local apps
    'session_app',
    'timetable_app',
    'content_app',
    'frontend',
]

# ───── MIDDLEWARE ──────────────────────────────────────────────────────────

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
# ───── URLS & WSGI ─────────────────────────────────────────────────────────
ROOT_URLCONF = 'byfaith_project.urls'
WSGI_APPLICATION = 'byfaith_project.wsgi.application'

# ───── DATABASE (Neon.tech) ───────────────────────────────────────────────

DEBUG = os.getenv("DEBUG", "True") == "True"

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            ssl_require=not DEBUG
        )
    }
else:
    # Local SQLite fallback when DATABASE_URL is missing
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }



# ───── PASSWORD VALIDATORS ────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
    {'NAME': 'session_app.password_validators.ComplexPasswordValidator'},
]

# ───── LANGUAGE / TIME ─────────────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ───── TEMPLATES ───────────────────────────────────────────────────────────
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],  # This lets Django load React's index.html
        #'DIRS': [BASE_DIR / 'static/dist'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ───── STATIC & MEDIA ──────────────────────────────────────────────────────
'''
STATIC_URL = '/static/'
if DEBUG: 
    STATIC_ROOT = BASE_DIR / 'staticfiles'
else:
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
'''
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ───── REST FRAMEWORK ──────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework.authentication.SessionAuthentication'],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticatedOrReadOnly'],
}

# ───── FILE UPLOAD LIMITS ──────────────────────────────────────────────────
FILE_UPLOAD_MAX_MEMORY_SIZE = int(os.getenv("FILE_UPLOAD_MAX_MEMORY_SIZE", 52428800))
DATA_UPLOAD_MAX_MEMORY_SIZE = int(os.getenv("DATA_UPLOAD_MAX_MEMORY_SIZE", 52428800))

# ───── EMAIL (DEV) ─────────────────────────────────────────────────────────
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = 'noreply@example.com'

# ───── PK DEFAULT ──────────────────────────────────────────────────────────
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ───── RENDER SPECIFIC ─────────────────────────────────────────────────────
# Disable collectstatic if not needed
if os.getenv("RENDER") == "true":
    os.environ["DISABLE_COLLECTSTATIC"] = "1"


DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

'''
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.getenv('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': os.getenv('CLOUDINARY_API_KEY'),
    'API_SECRET': os.getenv('CLOUDINARY_API_SECRET'),
}
'''

STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]

'''
if not DEBUG:
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
'''

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'


    # settings.py
CORS_ALLOW_METHODS = [
        "DELETE",
        "GET",
        "OPTIONS",
        "POST",
        "PUT",
    ]

CORS_ALLOW_HEADERS = [
        "accept",
        "accept-encoding",
        "authorization",
        "content-type",
        "dnt",
        "origin",
        "user-agent",
        "x-csrftoken",
        "x-requested-with",
        "Access-Control-Allow-Origin",
        "x-auth-token",
    ]
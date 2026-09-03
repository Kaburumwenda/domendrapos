"""
Django settings for DomendraPOS multi-tenant SaaS POS system.
"""
import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

from celery.schedules import crontab

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("SECRET_KEY", "django-insecure-fleetcore-dev-secret-key-change-in-production-2024")

DEBUG = os.environ.get("DEBUG", "True").lower() in ("true", "1", "yes")

ALLOWED_HOSTS = os.environ.get(
    "ALLOWED_HOSTS", "localhost,127.0.0.1,10.0.2.2,domendraapi.tiktek-ex.com"
).split(",")

# ---------------------------------------------------------------------------
# Security settings (production hardening)
# ---------------------------------------------------------------------------
if not DEBUG:
    SECURE_SSL_REDIRECT = os.environ.get("SECURE_SSL_REDIRECT", "True").lower() in ("true", "1", "yes")
    SECURE_HSTS_SECONDS = int(os.environ.get("SECURE_HSTS_SECONDS", "31536000"))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = "same-origin"
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    CSRF_COOKIE_SECURE = True
    CSRF_COOKIE_HTTPONLY = True

# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Applications — order matters for django-tenants
# ---------------------------------------------------------------------------
SHARED_APPS = [
    "django_tenants",
    "django.contrib.contenttypes",
    "django.contrib.auth",
    "tenants",
    "users",
    "django_otp",
    "django_otp.plugins.otp_totp",
    "django_otp.plugins.otp_static",
    "django.contrib.admin",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "drf_spectacular",
    "corsheaders",
    "django_filters",
    "import_export",
    "django_celery_beat",
    "django_celery_results",
    "axes",
    "django_extensions",
    "storages",
    "audit",
    "billing",
    "usage_billing",
    "security",
]
# Conditionally add debug_toolbar only in development
if DEBUG:
    SHARED_APPS.append("debug_toolbar")

TENANT_APPS = [
    "branches",
    "products",
    "inventory",
    "sales",
    "pos",
    "payments",
    "customers",
    "suppliers",
    "purchasing",
    "accounting",
    "reports",
]

INSTALLED_APPS = list(SHARED_APPS) + list(TENANT_APPS)

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "config.middleware.tenancy.DomendraPOSTenantMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "audit.middleware.AuditMiddleware",
    "usage_billing.middleware.RequestUsageMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "axes.middleware.AxesMiddleware",
    "django_otp.middleware.OTPMiddleware",
]
# Conditionally add debug_toolbar middleware only in development
if DEBUG:
    MIDDLEWARE.insert(2, "debug_toolbar.middleware.DebugToolbarMiddleware")

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------
DATABASES = {
    "default": {
        "ENGINE": "django_tenants.postgresql_backend",
        "NAME": os.environ.get("DB_NAME", "domendrapos"),
        "USER": os.environ.get("DB_USER", "postgres"),
        "PASSWORD": os.environ.get("DB_PASSWORD", "postgres"),
        "HOST": os.environ.get("DB_HOST", "localhost"),
        "PORT": os.environ.get("DB_PORT", "5432"),
    }
}

TENANT_MODEL = "tenants.Client"
TENANT_DOMAIN_MODEL = "tenants.Domain"
PUBLIC_SCHEMA_NAME = "public"

DATABASE_ROUTERS = (
    "django_tenants.routers.TenantSyncRouter",
)

# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------
AUTH_USER_MODEL = "users.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

AUTHENTICATION_BACKENDS = [
    "axes.backends.AxesStandaloneBackend",
    "django.contrib.auth.backends.ModelBackend",
]

# ---------------------------------------------------------------------------
# REST Framework
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
        "security.two_factor.Is2FAVerified",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": "config.pagination.CustomPageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/day",
        "user": "5000/hour",
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=int(os.environ.get("JWT_ACCESS_TOKEN_LIFETIME_MINUTES", "60"))
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=int(os.environ.get("JWT_REFRESH_TOKEN_LIFETIME_DAYS", "7"))
    ),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": os.environ.get("JWT_SECRET_KEY", SECRET_KEY),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

SPECTACULAR_SETTINGS = {
    "TITLE": "DomendraPOS API",
    "DESCRIPTION": "Multi-tenant SaaS Point-of-Sale platform",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,https://domendra.tiktek-ex.com",
    ).split(",")
]
CORS_ALLOW_CREDENTIALS = True

# Allow headers commonly sent by the Nuxt frontend
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
    "x-tenant-domain",
]

# Expose headers the frontend may need to read
CORS_EXPOSE_HEADERS = ["Content-Type", "X-CSRFToken"]

CSRF_TRUSTED_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "CSRF_TRUSTED_ORIGINS",
        "http://localhost:3000,http://localhost:3001,https://domendra.tiktek-ex.com",
    ).split(",")
]

# ---------------------------------------------------------------------------
# Celery
# ---------------------------------------------------------------------------
CELERY_BROKER_URL = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.environ.get(
    "CELERY_RESULT_BACKEND", "redis://localhost:6379/1"
)
CELERY_TIMEZONE = "UTC"
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60
CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers:DatabaseScheduler"

# Parked-sale auto-cleanup: parked sales older than this many hours are
# automatically deleted by the Celery beat task ``pos.cleanup_expired_parked_sales``.
PARKED_SALE_TTL_HOURS = 48

# ---------------------------------------------------------------------------
# Celery Beat schedule (django_celery_beat DatabaseScheduler reads these
# via the model, but defining CELERY_BEAT_SCHEDULE here ensures the task
# is registered on every boot when ``django_celery_beat`` syncs the DB).
# ---------------------------------------------------------------------------
CELERY_BEAT_SCHEDULE = {
    # --- Existing ---
    "cleanup-expired-parked-sales": {
        "task": "pos.cleanup_expired_parked_sales",
        "schedule": 3600,  # every 1 hour (seconds)
        "kwargs": {"max_age_hours": 48},
    },
    # --- #5: Celery Beat Automation ---
    "mark-overdue-credits": {
        "task": "pos.mark_overdue_credits",
        "schedule": 3600,  # every 1 hour
    },
    "check-trial-expiry": {
        "task": "tenants.check_trial_expiry",
        "schedule": 3600,  # every 1 hour
    },
    "alert-low-stock": {
        "task": "inventory.alert_low_stock",
        "schedule": crontab(minute=0, hour="*/6"),  # every 6 hours
    },
    "alert-stock-expiry": {
        "task": "inventory.alert_stock_expiry",
        "schedule": crontab(minute=0, hour=8),  # daily at 08:00
        "kwargs": {"days_ahead": 30},
    },
    "generate-monthly-bills": {
        "task": "usage_billing.generate_monthly_bills",
        "schedule": crontab(minute=0, hour=2, day_of_month=1),  # 1st of month 02:00
    },
    "mark-overdue-bills": {
        "task": "usage_billing.mark_overdue_bills",
        "schedule": crontab(minute=0, hour=9),  # daily at 09:00
    },
}

# ---------------------------------------------------------------------------
# Internationalisation
# ---------------------------------------------------------------------------
# LANGUAGE_CODE = "en-us"
# TIME_ZONE = "UTC"
# USE_I18N = True
# USE_TZ = True

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Nairobi'
USE_I18N = True
USE_TZ = True

# ---------------------------------------------------------------------------
# Static / Media
# ---------------------------------------------------------------------------
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = os.environ.get("MEDIA_URL", "media/")
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---------------------------------------------------------------------------
# AWS S3 Storage (media files)
# ---------------------------------------------------------------------------
AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY", "")
AWS_STORAGE_BUCKET_NAME = os.environ.get("AWS_STORAGE_BUCKET_NAME", "")
AWS_S3_SIGNATURE_NAME = os.environ.get("AWS_S3_SIGNATURE_NAME", "s3v4")
AWS_S3_REGION_NAME = os.environ.get("AWS_S3_REGION_NAME", "eu-central-1")
AWS_S3_FILE_OVERWRITE = os.environ.get("AWS_S3_FILE_OVERWRITE", "False").lower() in ("true", "1", "yes")
AWS_DEFAULT_ACL = os.environ.get("AWS_DEFAULT_ACL", None)  # None == use bucket default
AWS_S3_VERIFY = os.environ.get("AWS_S3_VERIFY", "True").lower() in ("true", "1", "yes")
AWS_QUERYSTRING_AUTH = False

# Only use S3 when bucket name is configured, otherwise fall back to local
if AWS_STORAGE_BUCKET_NAME:
    DEFAULT_FILE_STORAGE = "storages.backends.s3.S3Storage"
    MEDIA_URL = f"https://{AWS_STORAGE_BUCKET_NAME}.s3.{AWS_S3_REGION_NAME}.amazonaws.com/"


# ---------------------------------------------------------------------------
# Axes
# ---------------------------------------------------------------------------
AXES_FAILURE_LIMIT = 20
AXES_COOLOFF_TIME = 1
AXES_RESET_ON_SUCCESS = True

# ---------------------------------------------------------------------------
# Email Backend (SMTP)
# ---------------------------------------------------------------------------
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.environ.get("EMAIL_HOST", "mail.tiktek-ex.com")
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "465"))
EMAIL_USE_SSL = os.environ.get("EMAIL_USE_SSL", "True").lower() in ("true", "1", "yes")
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "domendra@tiktek-ex.com")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "DomendraPOS <domendra@tiktek-ex.com>")
SERVER_EMAIL = EMAIL_HOST_USER
EMAIL_TIMEOUT = 30  # seconds
APP_NAME = os.environ.get("APP_NAME", "DomendraPOS")

# ---------------------------------------------------------------------------
# Caching (Redis with local-memory fallback for development)
# ---------------------------------------------------------------------------
_cache_url = os.environ.get("CACHE_URL", "redis://localhost:6379/2")
if _cache_url.startswith("redis://") and os.environ.get("USE_REDIS_CACHE", "0") == "1":
    # Production / explicit Redis — requires a running Redis server
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": _cache_url,
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
                "IGNORE_EXCEPTIONS": True,  # fail soft if Redis drops
            },
        }
    }
else:
    # Development fallback — no external dependency needed
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "domendra-pos-cache",
        }
    }

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{asctime}] {levelname} {name} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "django.request": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": False,
        },
        "django.db.backends": {
            "handlers": ["console"],
            "level": "WARNING" if not DEBUG else "INFO",
            "propagate": False,
        },
    },
}

# ---------------------------------------------------------------------------
# Sentry (error monitoring — only if SENTRY_DSN is set)
# ---------------------------------------------------------------------------
SENTRY_DSN = os.environ.get("SENTRY_DSN", "")
if SENTRY_DSN and not DEBUG:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        traces_sample_rate=float(os.environ.get("SENTRY_TRACES_SAMPLE_RATE", "0.1")),
        send_default_pii=False,
    )


# ---------------------------------------------------------------------------
# django-otp (Two-Factor Authentication)
# ---------------------------------------------------------------------------
OTP_TOTP_ISSUER = APP_NAME
OTP_TOTP_DIGITS = 6
OTP_TOTP_SYNC_VALIDITY_WINDOW = 30
# Static (backup) tokens: generate 10 single-use codes
OTP_STATIC_TOKENS = 10

# Frontend URL for password reset links
FRONTEND_URL = os.environ.get(
    "FRONTEND_URL",
    "https://domendra.tiktek-ex.com",
)
# ---------------------------------------------------------------------------
# Internal IPs
# ---------------------------------------------------------------------------
INTERNAL_IPS = ["127.0.0.1", "localhost", "10.0.2.2"]

# ---------------------------------------------------------------------------
# Login / Logout
# ---------------------------------------------------------------------------
LOGIN_REDIRECT_URL = "/"
LOGOUT_REDIRECT_URL = "/"

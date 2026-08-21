from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ActiveLogin(models.Model):
    """
    Tracks JWT-based active logins.
    Since JWT is stateless, we record each login explicitly and
    remove it on logout or expiry.
    """

    user_id = models.IntegerField(db_index=True)
    user_email = models.EmailField(db_index=True)
    user_role = models.CharField(max_length=30, default="")
    user_name = models.CharField(max_length=255, blank=True, default="")
    branch = models.CharField(max_length=100, blank=True, default="")

    # JWT token identifiers
    jti = models.CharField(max_length=255, unique=True, db_index=True, help_text="JWT ID claim")

    # Request metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True, default="")

    # Timing
    login_time = models.DateTimeField(auto_now_add=True, db_index=True)
    last_activity = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(db_index=True, help_text="JWT access token expiry")

    # Status
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ["-login_time"]
        indexes = [
            models.Index(fields=["is_active", "expires_at"]),
            models.Index(fields=["user_id", "is_active"]),
        ]

    def __str__(self):
        return f"{self.user_email} @ {self.ip_address or '?'} — {self.login_time:%Y-%m-%d %H:%M}"

    @property
    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.expires_at

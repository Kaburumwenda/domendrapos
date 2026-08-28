"""Custom DRF permission classes for DomendraPOS."""
from rest_framework.permissions import BasePermission, SAFE_METHODS


class Is2FAVerified(BasePermission):
    """
    Enforce 2FA verification for authenticated users.

    If a user has 2FA enabled, the JWT access token contains a
    ``2fa_verified`` claim set to ``False`` until they verify via
    the ``verify_2fa_login`` endpoint. This permission blocks access
    to all non-2FA endpoints until verification is complete.

    Endpoints that are exempt from 2FA enforcement (auth, 2FA setup,
    health, schema) should use ``permission_classes = [AllowAny]``
    or ``IsAuthenticated`` without this class.
    """

    # Paths that bypass 2FA enforcement entirely.
    EXEMPT_PREFIXES = (
        "/api/auth/",
        "/api/schema/",
        "/api/docs/",
        "/api/redoc/",
        "/health/",
        "/admin/",
    )

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Exempt auth-related endpoints
        path = request.path
        if any(path.startswith(prefix) for prefix in self.EXEMPT_PREFIXES):
            return True

        # Check the 2fa_verified claim from the JWT
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header.startswith("Bearer "):
            return True  # Let JWTAuthentication handle the rejection

        try:
            from jwt import decode as jwt_decode
            decoded = jwt_decode(
                auth_header[7:],
                options={"verify_signature": False},
            )
            if decoded.get("2fa_verified", True) is False:
                return False
        except Exception:
            pass

        return True

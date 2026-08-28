"""Health check endpoint for orchestrators / load balancers."""
from django.db import connection
from django.http import JsonResponse


def health_check(request):
    """Return 200 if the app and database are reachable."""
    try:
        connection.ensure_connection()
        db_ok = True
    except Exception:
        db_ok = False

    healthy = db_ok
    return JsonResponse(
        {
            "status": "ok" if healthy else "degraded",
            "database": "ok" if db_ok else "error",
        },
        status=200 if healthy else 503,
    )

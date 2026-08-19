from django.db import models


class AuditLog(models.Model):
    """
    Immutable audit trail of every significant action in the system.
    """

    ACTION_CHOICES = [
        ("create", "Create"),
        ("update", "Update"),
        ("delete", "Delete"),
        ("login", "Login"),
        ("logout", "Logout"),
        ("approve", "Approve"),
        ("reject", "Reject"),
        ("void", "Void"),
        ("refund", "Refund"),
        ("export", "Export"),
        ("config_change", "Configuration Change"),
    ]

    # store user reference as plain email/id string to avoid cross-schema FK issues
    user_email = models.EmailField(blank=True)
    user_id = models.IntegerField(null=True, blank=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    resource_type = models.CharField(max_length=50, help_text="Model name")
    resource_id = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    old_values = models.JSONField(null=True, blank=True)
    new_values = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["user_email"]),
            models.Index(fields=["resource_type", "resource_id"]),
            models.Index(fields=["action"]),
            models.Index(fields=["timestamp"]),
        ]

    def __str__(self):
        return f"{self.user_email} {self.action} {self.resource_type} at {self.timestamp}"


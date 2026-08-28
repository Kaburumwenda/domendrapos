from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """Custom manager for email-based authentication."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "super_admin")
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom user model with role-based access control.
    """

    class Role(models.TextChoices):
        SUPER_ADMIN = "super_admin", _("Super Admin")
        TENANT_ADMIN = "tenant_admin", _("Tenant Admin")
        MANAGER = "manager", _("Manager")
        CASHIER = "cashier", _("Cashier")
        INVENTORY_CLERK = "inventory_clerk", _("Inventory Clerk")
        ACCOUNTANT = "accountant", _("Accountant")
        SALES_ASSOCIATE = "sales_associate", _("Sales Associate")
        VIEWER = "viewer", _("Viewer")

    # Remove default username field — use email instead
    username = None
    email = models.EmailField(unique=True)

    objects = UserManager()

    role = models.CharField(
        max_length=30, choices=Role.choices, default=Role.VIEWER
    )
    phone = models.CharField(max_length=30, blank=True)
    avatar = models.ImageField(upload_to="user-avatars/", null=True, blank=True)
    is_active_employee = models.BooleanField(default=True)
    employee_id = models.CharField(max_length=50, blank=True)
    hire_date = models.DateField(null=True, blank=True)
    termination_date = models.DateField(null=True, blank=True)
    default_branch_id = models.IntegerField(null=True, blank=True)

    # Password reset: secure one-time token + timestamp
    password_reset_token = models.CharField(max_length=128, blank=True, default="")
    password_reset_created_at = models.DateTimeField(null=True, blank=True)

    # For public-schema superadmins to login to any tenant
    target_schema = models.CharField(max_length=63, blank=True, default="")

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.get_full_name() or self.email} ({self.role})"

    @property
    def is_tenant_admin(self):
        return self.role == self.Role.TENANT_ADMIN

    @property
    def is_manager_or_above(self):
        return self.role in (
            self.Role.SUPER_ADMIN,
            self.Role.TENANT_ADMIN,
            self.Role.MANAGER,
        )


class Permission(models.Model):
    """
    Fine-grained permission entries, grouped into modules.
    """

    MODULE_CHOICES = [
        ("products", "Products"),
        ("inventory", "Inventory"),
        ("sales", "Sales & Checkout"),
        ("payments", "Payments"),
        ("customers", "Customers"),
        ("suppliers", "Suppliers"),
        ("purchasing", "Purchasing"),
        ("accounting", "Accounting"),
        ("reports", "Reports"),
        ("analytics", "Analytics"),
        ("staff", "Staff Management"),
        ("branches", "Branches"),
        ("settings", "Settings"),
    ]

    ACTION_CHOICES = [
        ("view", "View"),
        ("create", "Create"),
        ("edit", "Edit"),
        ("delete", "Delete"),
        ("approve", "Approve"),
        ("export", "Export"),
    ]

    module = models.CharField(max_length=30, choices=MODULE_CHOICES)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    description = models.CharField(max_length=200)

    class Meta:
        unique_together = ("module", "action")

    def __str__(self):
        return f"{self.module}:{self.action}"


class RolePermission(models.Model):
    """
    Maps a role to the permissions it has.
    """

    role = models.CharField(max_length=30, choices=User.Role.choices)
    permission = models.ForeignKey(
        Permission, on_delete=models.CASCADE, related_name="role_grants"
    )

    class Meta:
        unique_together = ("role", "permission")

    def __str__(self):
        return f"{self.role} -> {self.permission}"


from django.db import models


class Customer(models.Model):
    """
    A customer / loyalty member in the CRM.
    """

    TYPE_CHOICES = [
        ("individual", "Individual"),
        ("business", "Business"),
    ]

    customer_code = models.CharField(max_length=50, unique=True)
    customer_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="individual")
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    company_name = models.CharField(max_length=200, blank=True)
    full_name = models.CharField(max_length=300, blank=True, editable=False)

    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    secondary_phone = models.CharField(max_length=30, blank=True)
    address_line1 = models.CharField(max_length=200, blank=True)
    address_line2 = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state_province = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, default="United States")

    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True)

    # Loyalty
    loyalty_points = models.PositiveIntegerField(default=0)
    loyalty_tier = models.CharField(max_length=30, default="bronze")
    loyalty_member_since = models.DateField(null=True, blank=True)

    # Credit
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    current_credit_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Preferences
    preferred_branch = models.ForeignKey(
        "branches.Branch", on_delete=models.SET_NULL, null=True, blank=True
    )
    tax_exempt = models.BooleanField(default=False)
    tax_id = models.CharField(max_length=50, blank=True)

    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["phone"]),
            models.Index(fields=["loyalty_tier"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["email"],
                condition=~models.Q(email=""),
                name="customer_email_unique_when_not_blank",
            ),
        ]

    def __str__(self):
        return self.full_name or self.company_name or self.email or self.customer_code

    def save(self, *args, **kwargs):
        if self.customer_type == "individual":
            self.full_name = f"{self.first_name} {self.last_name}".strip()
        else:
            self.full_name = self.company_name
        super().save(*args, **kwargs)


class CustomerGroup(models.Model):
    """
    Customer segments / groups (VIP, Wholesale, Employee, etc.).
    """

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    customers = models.ManyToManyField(Customer, related_name="groups", blank=True)

    def __str__(self):
        return self.name


class CustomerInteraction(models.Model):
    """
    CRM interaction log — calls, emails, visits, notes.
    """

    INTERACTION_TYPES = [
        ("call", "Call"),
        ("email", "Email"),
        ("visit", "Visit"),
        ("note", "Note"),
        ("complaint", "Complaint"),
        ("feedback", "Feedback"),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="interactions")
    interaction_type = models.CharField(max_length=20, choices=INTERACTION_TYPES, default="note")
    subject = models.CharField(max_length=200, blank=True)
    notes = models.TextField()
    handled_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


"""
Seed demo data into the demo tenant schema.
Usage: python manage.py seed_demo
"""
import os
import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django_tenants.utils import tenant_context
from tenants.models import Client
from branches.models import Branch
from products.models import Category, Product
from customers.models import Customer
from suppliers.models import Supplier
from users.models import User


class Command(BaseCommand):
    help = "Seed demo data into the demo tenant schema"

    def handle(self, *args, **options):
        tenant = Client.objects.get(schema_name="demo")

        with tenant_context(tenant):
            # Branch
            branch, _ = Branch.objects.get_or_create(
                code="HQ",
                defaults={
                    "name": "Main Store",
                    "is_headquarters": True,
                    "city": "New York",
                    "country": "United States",
                    "tax_rate": Decimal("8.875"),
                },
            )
            self.stdout.write(f"Branch: {branch}")

            # Categories
            cats = ["Electronics", "Clothing", "Food & Beverage", "Home & Garden"]
            for c in cats:
                Category.objects.get_or_create(name=c)

            # Products
            products_data = [
                ("Laptop 15in", "ELEC001", "Electronics", Decimal("999.00"), Decimal("750.00")),
                ("Wireless Mouse", "ELEC002", "Electronics", Decimal("29.99"), Decimal("15.00")),
                ("USB-C Cable 6ft", "ELEC003", "Electronics", Decimal("12.99"), Decimal("5.00")),
                ("Cotton T-Shirt", "CLOTH001", "Clothing", Decimal("19.99"), Decimal("8.00")),
                ("Denim Jeans", "CLOTH002", "Clothing", Decimal("49.99"), Decimal("25.00")),
                ("Coffee Beans 1lb", "FOOD001", "Food & Beverage", Decimal("14.99"), Decimal("9.00")),
                ("Tea Bags 100ct", "FOOD002", "Food & Beverage", Decimal("8.99"), Decimal("4.00")),
                ("Garden Hose 50ft", "HOME001", "Home & Garden", Decimal("34.99"), Decimal("18.00")),
                ("Plant Pot Ceramic", "HOME002", "Home & Garden", Decimal("24.99"), Decimal("12.00")),
                ("LED Bulb 4-pack", "HOME003", "Home & Garden", Decimal("15.99"), Decimal("7.00")),
                ("Smartphone Case", "ELEC004", "Electronics", Decimal("24.99"), Decimal("10.00")),
                ("Bluetooth Speaker", "ELEC005", "Electronics", Decimal("79.99"), Decimal("45.00")),
            ]

            for name, sku, cat, retail, cost in products_data:
                category = Category.objects.get(name=cat)
                Product.objects.get_or_create(
                    sku=sku,
                    defaults={
                        "name": name,
                        "category": category,
                        "retail_price": retail,
                        "cost_price": cost,
                        "barcode": f"000{sku}",
                    },
                )
            self.stdout.write(f"Products: {Product.objects.count()}")

            # Customers
            cust_data = [
                ("John", "Doe", "john@example.com", "555-0101"),
                ("Jane", "Smith", "jane@example.com", "555-0102"),
                ("Bob", "Johnson", "bob@example.com", "555-0103"),
                ("Alice", "Williams", "alice@example.com", "555-0104"),
                ("Charlie", "Brown", "charlie@example.com", "555-0105"),
            ]
            for i, (fn, ln, email, phone) in enumerate(cust_data):
                Customer.objects.get_or_create(
                    customer_code=f"CUST{i+1:04d}",
                    defaults={
                        "first_name": fn, "last_name": ln,
                        "email": email, "phone": phone,
                    },
                )
            self.stdout.write(f"Customers: {Customer.objects.count()}")

            # Supplier
            Supplier.objects.get_or_create(
                supplier_code="SUP001",
                defaults={
                    "name": "Global Traders Inc",
                    "contact_person": "Mike Wilson",
                    "email": "sales@globaltraders.com",
                    "phone": "555-9000",
                    "country": "United States",
                },
            )
            self.stdout.write(f"Suppliers: {Supplier.objects.count()}")

            # Cashier
            User.objects.get_or_create(
                email="cashier@demo.com",
                defaults={
                    "first_name": "Cash",
                    "last_name": "Register",
                    "role": "cashier",
                },
            )

            self.stdout.write(self.style.SUCCESS("Demo data seeded successfully!"))

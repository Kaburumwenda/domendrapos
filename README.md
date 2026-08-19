# DomendraPOS — Multi-Tenant SaaS Point-of-Sale Platform

A world-class, multi-tenant SaaS POS system built with **Django 6**, **Nuxt.js 4**, and **PostgreSQL** (with schema-per-tenant isolation via `django-tenants`).

---

## 🏗 Architecture Overview

```
DomendraPOS/
├── backend/                    # Django REST API + multi-tenant core
│   ├── config/                 # Django project settings, Celery, custom tenant middleware
│   │   ├── settings.py         # Multi-tenant config, JWT, CORS, Celery
│   │   ├── celery.py           # Celery async task runner
│   │   ├── urls.py             # Root URL routing
│   │   └── middleware/tenancy.py  # Custom tenant resolution middleware
│   ├── tenants/                # Multi-tenant core (Client, Domain)
│   ├── users/                  # Custom User model + RBAC (Role, Permission)
│   ├── branches/               # Multi-store (Branch, Register)
│   ├── products/               # Catalog (Category, Product, Variant, PriceList)
│   ├── inventory/              # Stock (StockItem, Movement, Transfer, Count)
│   ├── sales/                  # Sales (Sale, SaleLine, Refund, Discount, Tax)
│   ├── payments/               # Payments (Payment, PaymentRefund)
│   ├── customers/              # CRM (Customer, Group, Interaction)
│   ├── suppliers/              # Vendors (Supplier, SupplierProduct)
│   ├── purchasing/             # Purchasing (PurchaseOrder, GoodsReceipt)
│   ├── accounting/             # Ledger (ChartOfAccounts, JournalEntry, Expense, TaxPayment)
│   ├── reports/                # Analytics (Dashboard, Sales reports, Inventory valuation)
│   ├── audit/                  # Audit trail (AuditLog)
│   └── billing/                # SaaS billing (SubscriptionPlan, Invoice, UsageMetric)
│
└── frontend/                   # Nuxt 4 + Tailwind + Pinia
    ├── pages/                   # POS Dashboard, Checkout, Products, Sales, etc.
    ├── layouts/                 # Default (sidebar), Auth
    ├── components/              # ToastContainer, shared UI
    ├── stores/auth.ts           # Pinia auth store (JWT)
    ├── composables/             # useApi, useToast, useFormat
    └── middleware/auth.ts       # Route guard
```

---

## 🗄 Database Schema Design

### Shared (Public Schema) Tables

| Table | Fields | Relationships |
|-------|--------|---------------|
| `tenants_client` | id, name, schema_name, plan, status, logo, primary_color, contact_email, currency_code | → Domain |
| `tenants_domain` | id, domain, is_primary, tenant_id | → Client |
| `users_user` | id, email, password, first_name, last_name, role, phone, avatar, is_active_employee, employee_id, hire_date, default_branch_id | — |
| `users_permission` | id, module, action, description | — |
| `users_rolepermission` | id, role, permission_id | → Permission |
| `audit_auditlog` | id, user_email, user_id, action, resource_type, resource_id, old_values, new_values, ip_address, timestamp | — |
| `billing_subscriptionplan` | id, name, price, billing_cycle, features, max_branches, max_users | — |
| `billing_invoice` | id, invoice_number, tenant_id, plan_id, amount, status, due_date | → Client, Plan |
| `billing_paymentrecord` | id, invoice_id, amount, method, reference | → Invoice |
| `billing_usagemetric` | id, tenant_id, metric_type, count, period_start/end | → Client |

### Tenant-Schema Tables

| Module | Tables | Key Relationships |
|--------|--------|-------------------|
| **Branches** | branch, register | register → branch, register → users_user |
| **Products** | category, product, productvariant, pricelist, productpriceoverride | product → category, product → supplier, variant → product |
| **Inventory** | stockitem, stockmovement, stocktransfer, stocktransferline, stockcount, stockcountline | stockitem → product, stockitem → branch, movement → product/branch |
| **Sales** | sale, saleline, refund, refundline, discount, tax | sale → branch/cashier/customer/register, saleline → product/sale |
| **Payments** | payment, paymentrefund | payment → sale/branch, paymentrefund → payment/refund |
| **Customers** | customer, customergroup, customerinteraction | customer → branch (preferred) |
| **Suppliers** | supplier, supplierproduct | supplier → product |
| **Purchasing** | purchaseorder, purchaseorderline, goodsreceipt, goodsreceiptline | po → supplier/branch, line → product |
| **Accounting** | chartofaccounts, journalentry, journalline, expense, taxpayment | entry → sale/po/branch, line → account |
| **Reports** | reportsnapshot | → branch, user |

---

## 🔐 Role-Based Access Control (RBAC)

| Role | Scope | Capabilities |
|------|-------|-------------|
| `super_admin` | Platform | Manage all tenants, billing, plans |
| `tenant_admin` | Tenant | Full access within their tenant |
| `manager` | Branch | All operations + reports + staff |
| `cashier` | Branch | POS checkout, sales, returns |
| `inventory_clerk` | Branch | Inventory, stock movements, transfers |
| `accountant` | Tenant | Accounting, expenses, journal |
| `sales_associate` | Branch | Sales, customer management |
| `viewer` | Branch | Read-only access |

---

## 🔄 Core Workflows

### 1. Making a Sale (POS Checkout)
1. Cashier opens register (sets opening float)
2. Search/browse products → add to cart
3. Calculate subtotal + tax + discounts
4. Select payment method(s) — support split payments
5. POST `/api/sales/` → creates Sale + SaleLines
   - System auto-decrements inventory (StockMovement per line)
   - Calculates totals (subtotal, tax, grand total)
6. POST `/api/payments/` → records payment
7. Print receipt / digital copy to customer

### 2. Processing Refunds
1. Locate original sale by receipt number
2. POST `/api/sales/refunds/` → creates Refund with RefundLines
   - Specify which items + quantities to refund
   - System calculates partial vs full refund
3. Manager approves: POST `/api/sales/refunds/{id}/approve/`
   - System increments inventory (StockMovement: type=return)
   - Updates sale status to `refunded` or `partially_refunded`
4. Issue refund payment via original method
   - POST `/api/payments/` with `refund` reference

### 3. Adding Inventory (Manual Adjustment)
1. POST `/api/inventory/items/` → ensure StockItem exists for product+branch
2. POST `/api/inventory/movements/` with `movement_type=adjustment`
   - System updates `quantity_on_hand` on StockItem
   - Records `quantity_after` for audit trail

### 4. Receiving Stock (Purchase Order)
1. Create PO: POST `/api/purchasing/orders/` with lines (product, quantity, unit cost)
   - Auto-calculates PO subtotal, tax, grand total
2. Submit for approval: PO moves to `approved`
3. Send to supplier: status → `sent`
4. When goods arrive: POST `/api/purchasing/receipts/`
   - Specify received quantities per line
   - System increments StockItem for each received line
   - Creates StockMovement (type=purchase) per line
   - Updates PO status to `received` or `partially_received`

### 5. Managing Customers
1. Add customer: POST `/api/customers/` (individual or business)
2. Assign to CustomerGroup (VIP, Wholesale, etc.)
3. Earn loyalty points: POST `/api/customers/{id}/add_points/`
4. Log interactions: POST `/api/customers/interactions/`
5. Apply customer at checkout for loyalty rewards

### 6. Staff Permissions
1. Create user: POST `/api/users/staff/` with role assignment
2. Configure RolePermissions: map role → module + action
3. Activate/deactivate: POST `/api/users/staff/{id}/activate/` or `/deactivate/`
4. Users auto-inherit permissions-based menu visibility in frontend

### 7. Multi-Branch Sync
1. Stock transfer: POST `/api/inventory/transfers/` (from_branch → to_branch)
2. Ship: POST `/api/inventory/transfers/{id}/ship/`
   - Deducts from source branch (StockMovement: transfer_out)
3. Receive: POST `/api/inventory/transfers/{id}/receive/`
   - Adds to destination branch (StockMovement: transfer_in)
4. Stock counts: POST `/api/inventory/counts/`
5. Reconcile: POST `/api/inventory/counts/{id}/reconcile/`
   - Creates adjustment movements with variances

---

## 🚀 Getting Started

### Prerequisites
- PostgreSQL 14+
- Python 3.12+
- Node.js 18+
- Redis (optional, for Celery)

### 1. Database Setup
```bash
# Connect to PostgreSQL as superuser
psql -U postgres -c "CREATE DATABASE domendrapos;"
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations (shared schema first, then tenant schemas)
python manage.py migrate_schemas --shared

# Create demo tenant
python manage.py shell
>>> from tenants.models import Client, Domain
>>> t = Client.objects.create(schema_name='demo', name='Demo Store', contact_email='admin@demo.com', status='active', on_trial=False)
>>> Domain.objects.create(domain='localhost', tenant=t, is_primary=True)

# Seed demo data (products, customers, suppliers)
python manage.py seed_demo

# Create superusers
python manage.py createsuperuser  # or use the shell script

# Start server
python manage.py runserver 0.0.0.0:8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000

---

## 🔑 Demo Credentials

| Email | Password | Role | Access |
|-------|----------|------|--------|
| `admin@domendrapos.com` | `Admin123!` | Super Admin | Platform-level admin |
| `admin@demo.com` | `Demo123!` | Tenant Admin | Full demo tenant access |
| `cashier@demo.com` | (set password) | Cashier | POS checkout only |

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login/` — JWT login (returns access, refresh, user profile)
- `POST /api/auth/refresh/` — Refresh access token

### Tenant Management (public)
- `POST /api/tenants/onboard/` — New tenant onboarding
- `GET /api/tenants/manage/` — List all tenants (super-admin)
- `POST /api/tenants/manage/{id}/suspend/` — Suspend tenant
- `POST /api/tenants/manage/{id}/activate/` — Activate tenant

### Products
- `GET/POST /api/products/` — Product CRUD
- `GET/POST /api/products/categories/` — Category CRUD
- `GET/POST /api/products/variants/` — Product variants
- `GET/POST /api/products/price-lists/` — Pricing tiers

### Sales & POS
- `GET/POST /api/sales/` — Sales (POST creates sale + decrements inventory)
- `POST /api/sales/{id}/void/` — Void pending sale
- `POST /api/sales/{id}/hold/` — Put sale on hold
- `GET/POST /api/sales/refunds/` — Refund management
- `POST /api/sales/refunds/{id}/approve/` — Approve refund + return stock
- `GET/POST /api/sales/discounts/` — Discount CRUD
- `GET/POST /api/sales/taxes/` — Tax CRUD

### Payments
- `GET/POST /api/payments/` — Payment records
- `GET /api/payments/refunds/` — Payment refund records

### Inventory
- `GET/POST /api/inventory/items/` — Stock items
- `GET /api/inventory/items/low_stock/` — Low stock report
- `GET/POST /api/inventory/movements/` — Stock movement audit
- `GET/POST /api/inventory/transfers/` — Branch transfers
- `POST /api/inventory/transfers/{id}/ship/` — Ship transfer
- `POST /api/inventory/transfers/{id}/receive/` — Receive transfer
- `GET/POST /api/inventory/counts/` — Stock counts
- `POST /api/inventory/counts/{id}/reconcile/` — Reconcile count

### Purchasing
- `GET/POST /api/purchasing/orders/` — Purchase orders
- `POST /api/purchasing/orders/{id}/approve/` — Approve PO
- `POST /api/purchasing/orders/{id}/cancel/` — Cancel PO
- `GET/POST /api/purchasing/receipts/` — Goods receipts (auto-updates inventory)

### Customers
- `GET/POST /api/customers/` — Customer CRUD
- `POST /api/customers/{id}/add_points/` — Add loyalty points
- `GET/POST /api/customers/groups/` — Customer groups
- `GET/POST /api/customers/interactions/` — CRM interactions

### Suppliers
- `GET/POST /api/suppliers/` — Supplier CRUD
- `GET/POST /api/suppliers/products/` — Supplier-product mappings

### Accounting
- `GET/POST /api/accounting/accounts/` — Chart of accounts
- `GET/POST /api/accounting/journal/` — Journal entries
- `GET/POST /api/accounting/expenses/` — Expense tracking
- `GET/POST /api/accounting/tax-payments/` — Tax remittance records

### Reports
- `GET /api/reports/dashboard/` — KPI cards (sales today, low stock, customers)
- `GET /api/reports/sales-summary/` — Revenue, profit, discounts
- `GET /api/reports/sales-by-product/` — Product performance
- `GET /api/reports/sales-by-branch/` — Branch comparison
- `GET /api/reports/sales-by-cashier/` — Staff performance
- `GET /api/reports/inventory-valuation/` — Stock at cost value
- `GET /api/reports/low-stock/` — Items below reorder level
- `GET /api/reports/payment-methods/` — Payment breakdown
- `GET /api/reports/top-customers/` — VIP customer list

### Audit
- `GET /api/audit/` — Audit trail (manager+)

### Billing (SaaS)
- `GET/POST /api/billing/plans/` — Subscription plans
- `GET/POST /api/billing/invoices/` — Tenant invoices
- `GET /api/billing/usage/` — Usage metrics

### API Documentation
- `GET /api/schema/` — OpenAPI schema
- `GET /api/docs/` — Swagger UI
- `GET /api/redoc/` — ReDoc UI

---

## 🛡 Security Features
- JWT authentication (access + refresh tokens)
- Role-based access control (8 roles)
- Brute-force protection (django-axes)
- Multi-tenant schema isolation (PostgreSQL schemas)
- CORS whitelisting
- Audit trail on all key actions
- Throttling (100/day anon, 5000/hour authenticated)

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 6, DRF 3.16, django-tenants 3.10 |
| Frontend | Nuxt 4, Vue 3, Pinia, TailwindCSS |
| Database | PostgreSQL (schema-per-tenant isolation) |
| Auth | SimpleJWT (access + refresh rotation) |
| API Docs | drf-spectacular (OpenAPI 3) |
| Async | Celery + Redis |
| Charts | drf-spectacular, frontend chart components |

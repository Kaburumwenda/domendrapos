<template>
  <div>
    <!-- Hero -->
    <section id="overview" class="hero-section pa-8 pa-md-12 mb-8">
      <v-row align="center">
        <v-col cols="12" md="7">
          <v-chip size="small" variant="tonal" color="primary" class="mb-4">
            <v-icon start size="16">mdi-book-open-variant</v-icon>
            User Guidelines
          </v-chip>
          <h1 class="text-h3 text-md-h2 font-weight-bold hero-title mb-4">
            DomendraPOS Documentation
          </h1>
          <p class="text-h6 text-medium-emphasis hero-lede mb-6" style="max-width: 560px">
            Everything you need to run a modern multi-branch retail business —
            point-of-sale, inventory, accounting, customers, suppliers, analytics,
            role-based security, and more. This guide walks you through every module
            with annotated screenshots, actionable steps, and downloadable CSV samples.
          </p>
          <div class="d-flex flex-wrap ga-3">
            <v-btn
              color="primary"
              size="large"
              prepend-icon="mdi-login"
              @click="navigateTo('/login')"
            >
              Sign in to your workspace
            </v-btn>
            <v-btn
              variant="outlined"
              size="large"
              prepend-icon="mdi-view-dashboard-outline"
              @click="scrollTo('modules')"
            >
              Explore modules
            </v-btn>
          </div>
        </v-col>
        <v-col cols="12" md="5" class="d-none d-md-block">
          <div class="hero-frame">
            <DocsSnapshot
              :src="loginSnapshot"
              alt="DomendraPOS login screen"
              label="Login screen"
            />
          </div>
        </v-col>
      </v-row>

      <!-- quick stats -->
      <v-row class="mt-8" density="comfortable">
        <v-col v-for="stat in stats" :key="stat.label" cols="6" md="3">
          <v-card rounded="xl" flat border class="pa-4">
            <v-icon :color="stat.color" size="28" class="mb-2">{{ stat.icon }}</v-icon>
            <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
            <div class="text-caption text-medium-emphasis">{{ stat.label }}</div>
          </v-card>
        </v-col>
      </v-row>
    </section>

    <v-row>
      <!-- TOC sidebar -->
      <v-col cols="12" md="3" lg="2" class="d-none d-md-block">
        <DocsToc :sections="tocSections" />
      </v-col>

      <!-- Main content -->
      <v-col cols="12" md="9" lg="8" offset-lg="0" class="docs-main">

        <!-- ====================== GETTING STARTED ====================== -->
        <section id="getting-started" class="docs-section">
          <h2 class="text-h4 font-weight-bold mb-2 section-title">
            <v-icon color="primary" class="mr-2">mdi-rocket-launch-outline</v-icon>
            Getting Started
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-4">
            Set up your workspace, log in, and navigate the main layout.
          </p>

          <!-- Step 1: Sign up -->
          <h3 class="text-h6 font-weight-bold mb-1 mt-6">1. Create a workspace</h3>
          <p class="text-body-2 mb-3">
            On the login screen, click <strong>“New to DomendraPOS? Create a workspace”</strong>.
            Fill in the workspace name, your admin email, currency (e.g. KSh for Kenya Shilling),
            and timezone. After you submit, you receive a confirmation email and your
            tenant (workspace) is provisioned.
          </p>

          <!-- Step 2: Log in -->
          <h3 class="text-h6 font-weight-bold mb-1 mt-6">2. Log in</h3>
          <DocsSnapshot
            :src="loginSnapshot"
            alt="Login screen with email, password, remember me, sign in button, and Documentation link"
            label="Fig 1. The login screen"
            class="mb-3"
          />
          <DocsStepTimeline :steps="loginSteps" />
          <v-alert type="info" variant="tonal" class="mt-3" icon="mdi-shield-lock-outline">
            For security, your account is locked for 5 minutes after 5 failed attempts.
            If you forgot your password, contact your tenant admin or use
            “Forgot password?” link (if enabled by your workspace).
          </v-alert>

          <!-- Step 3: Layout -->
          <h3 class="text-h6 font-weight-bold mb-1 mt-6">3. Navigate the dashboard</h3>
          <DocsSnapshot
            :src="dashboardSnapshot"
            alt="Main dashboard with KPI cards, revenue chart, top products, and recent transactions"
            label="Fig 2. The dashboard"
            class="mb-3"
          />
          <p class="text-body-2 mb-3">The main layout has three regions:</p>
          <v-card rounded="xl" flat border class="pa-4 mb-3">
            <v-row density="comfortable">
              <v-col cols="12" md="4">
                <div class="d-flex align-start ga-2">
                  <v-icon color="primary" class="mt-1">mdi-menu</v-icon>
                  <div>
                    <div class="font-weight-bold">Left sidebar</div>
                    <div class="text-body-2 text-medium-emphasis">
                      Collapsible rail with grouped navigation — Main, Administration, Platform.
                    </div>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="d-flex align-start ga-2">
                  <v-icon color="primary" class="mt-1">mdi-toolbar</v-icon>
                  <div>
                    <div class="font-weight-bold">Top app bar</div>
                    <div class="text-body-2 text-medium-emphasis">
                      Rail toggle, live clock, today's revenue, branch selector, theme toggle, user menu.
                    </div>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="d-flex align-start ga-2">
                  <v-icon color="primary" class="mt-1">mdi-format-page-break</v-icon>
                  <div>
                    <div class="font-weight-bold">Content area</div>
                    <div class="text-body-2 text-medium-emphasis">
                      The active page (Dashboard, POS, Inventory, Reports, etc.).
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card>

          <!-- Branch selection -->
          <h3 class="text-h6 font-weight-bold mb-1 mt-6">4. Select a branch</h3>
          <p class="text-body-2 mb-3">
            Use the branch selector in the top app bar (top right). The default is
            <strong>“All Branches”</strong>. When you select a specific branch, all
            subsequent transactions, stock views, and reports are scoped to that branch.
          </p>
          <v-alert type="tip" variant="tonal" color="primary" class="mb-3" icon="mdi-lightbulb-on-outline">
            Cashiers must select a branch before starting a POS session — sales are
            recorded against the active branch.
          </v-alert>
        </section>

        <v-divider class="my-6" />

        <!-- ====================== POS ====================== -->
        <section id="module-pos" class="docs-section">
          <h2 class="text-h4 font-weight-bold mb-2 section-title">
            <v-icon color="primary" class="mr-2">mdi-cart-outline</v-icon>
            Point of Sale (POS)
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-4">
            Make sales fast — scan, tap, accept payments, and issue receipts.
          </p>

          <DocsSnapshot
            :src="posSnapshot"
            alt="POS screen with product grid on left and cart panel on right"
            label="Fig 3. The POS terminal"
            class="mb-4"
          />

          <DocsStepTimeline :steps="posSteps" />

          <h3 class="text-h6 font-weight-bold mt-4 mb-1">Payment methods</h3>
          <v-card rounded="xl" flat border class="pa-4 mb-3">
            <v-row density="comfortable">
              <v-col cols="12" md="4">
                <v-chip color="success" prepend-icon="mdi-cash" variant="flat">Cash</v-chip>
                <p class="text-body-2 mt-2">Record a cash payment. Enter the amount tendered to compute change.</p>
              </v-col>
              <v-col cols="12" md="4">
                <v-chip color="warning" prepend-icon="mdi-cellphone" variant="flat">M-Pesa</v-chip>
                <p class="text-body-2 mt-2">Mobile money. Enter customer phone number and STK push reference.</p>
              </v-col>
              <v-col cols="12" md="4">
                <v-chip color="primary" prepend-icon="mdi-credit-card" variant="flat">Card</v-chip>
                <p class="text-body-2 mt-2">Credit / debit card. Record the gateway reference for reconciliation.</p>
              </v-col>
            </v-row>
          </v-card>

          <h3 class="text-h6 font-weight-bold mt-4 mb-1">POS features</h3>
          <v-list lines="two" border>
            <v-list-item prepend-icon="mdi-pause-box" title="Park / hold a sale" subtitle="Park a cart to serve another customer, then resume it." />
            <v-list-item prepend-icon="mdi-account-cash" title="Customer credit" subtitle="Issue credit sales to registered customers with outstanding balances." />
            <v-list-item prepend-icon="mdi-clock-start" title="Shift management" subtitle="Open / close shifts and print shift summaries (cashier reconciliation)." />
            <v-list-item prepend-icon="mdi-receipt" title="Receipts" subtitle="Print or email receipts; thermal printer friendly." />
          </v-list>
        </section>

        <v-divider class="my-6" />

        <!-- ====================== INVENTORY ====================== -->
        <section id="module-inventory" class="docs-section">
          <h2 class="text-h4 font-weight-bold mb-2 section-title">
            <v-icon color="primary" class="mr-2">mdi-warehouse-outline</v-icon>
            Inventory
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-4">
            Track stock-on-hand across branches, adjust quantities, transfer stock, and get low-stock alerts.
          </p>

          <DocsSnapshot
            :src="inventorySnapshot"
            alt="Inventory page with KPI cards, filters, and SKUs table"
            label="Fig 4. The inventory stock-on-hand page"
            class="mb-4"
          />

          <h3 class="text-h6 font-weight-bold mb-2">Core concepts</h3>
          <v-row density="comfortable">
            <v-col v-for="concept in inventoryConcepts" :key="concept.title" cols="12" md="6">
              <v-card rounded="lg" flat border class="pa-3">
                <div class="d-flex align-start ga-2">
                  <v-icon :color="concept.color" class="mt-1">{{ concept.icon }}</v-icon>
                  <div>
                    <div class="font-weight-bold">{{ concept.title }}</div>
                    <div class="text-body-2 text-medium-emphasis">{{ concept.text }}</div>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <h3 class="text-h6 font-weight-bold mt-5 mb-2">Stock movements</h3>
          <DocsStepTimeline :steps="inventorySteps" />

          <h3 class="text-h6 font-weight-bold mt-5 mb-2">Sample stock data (exportable)</h3>
          <DocsCsvExportDemo
            title="Stock on hand export"
            description="A preview of the data returned by the inventory export endpoint. Click Download to save it as CSV."
            filename="stock-on-hand.csv"
            :rows="inventorySampleRows"
            :columns="['sku', 'product', 'category', 'on_hand', 'unit', 'reorder_point', 'value', 'status']"
          />
        </section>

        <v-divider class="my-6" />

        <!-- ====================== PRODUCTS ====================== -->
        <section id="module-products" class="docs-section">
          <h2 class="text-h4 font-weight-bold mb-2 section-title">
            <v-icon color="primary" class="mr-2">mdi-package-variant-closed</v-icon>
            Products
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-4">
            Define the catalog: products, brands, categories, units of measure, variants, and bulk import.
          </p>

          <DocsStepTimeline :steps="productSteps" />

          <v-alert type="info" variant="tonal" class="my-3" icon="mdi-file-excel-outline">
            <strong>Bulk Excel import.</strong> Download the template from the Products page,
            fill in rows, then upload. Supported columns: name, SKU, barcode, category, brand,
            unit, cost price, selling price, tax rate, opening stock.
          </v-alert>

          <p class="text-body-2 mb-2 mt-3">Sample product catalog data (exportable):</p>
          <DocsCsvExportDemo
            title="Product catalog export"
            description="Export your full product catalog with prices and stock for spreadsheet analysis."
            filename="product-catalog.csv"
            :rows="productSampleRows"
            :columns="['sku', 'name', 'category', 'brand', 'unit', 'cost_price', 'selling_price', 'tax_rate', 'is_active']"
          />
        </section>

        <v-divider class="my-6" />

        <!-- ====================== CUSTOMERS ====================== -->
        <section id="module-customers" class="docs-section">
          <h2 class="text-h4 font-weight-bold mb-2 section-title">
            <v-icon color="primary" class="mr-2">mdi-account-group-outline</v-icon>
            Customers
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-4">
            Build a customer CRM — loyalty points, store credit, purchase history, and outstanding balances.
          </p>

          <DocsStepTimeline :steps="customerSteps" />

          <h3 class="text-h6 font-weight-bold mt-4 mb-2">Customer balances export</h3>
          <DocsCsvExportDemo
            title="Customer balances"
            description="Who owes you how much. Filter the list on the Customers page and export outstanding balances."
            filename="customer-balances.csv"
            :rows="customerSampleRows"
            :columns="['name', 'phone', 'email', 'loyalty_points', 'credit_balance', 'total_spent']"
          />
        </section>

        <v-divider class="my-6" />

        <!-- ====================== SUPPLIERS ====================== -->
        <section id="module-suppliers" class="docs-section">
          <h2 class="text-h4 font-weight-bold mb-2 section-title">
            <v-icon color="primary" class="mr-2">mdi-truck-delivery-outline</v-icon>
            Suppliers and Purchasing
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-4">
            Manage suppliers, raise purchase orders (POs), receive goods into stock, and track payables.
          </p>

          <DocsStepTimeline :steps="supplierSteps" />

          <p class="text-body-2 mt-3 mb-2">Sample purchase order data (exportable):</p>
          <DocsCsvExportDemo
            title="Purchase orders export"
            description="POs by status with line totals and supplier info."
            filename="purchase-orders.csv"
            :rows="poSampleRows"
            :columns="['po_number', 'supplier', 'branch', 'status', 'order_date', 'total']"
          />
        </section>

        <v-divider class="my-6" />

        <!-- ====================== REPORTS ====================== -->
        <section id="module-reports" class="docs-section">
          <h2 class="text-h4 font-weight-bold mb-2 section-title">
            <v-icon color="primary" class="mr-2">mdi-chart-box-outline</v-icon>
            Reports
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-4">
            Generate sales summaries, profit and loss, VAT returns, and stock valuation for any period and branch.
          </p>

          <DocsSnapshot
            :src="reportsSnapshot"
            alt="Sales summary report with KPIs, line chart, and payment method breakdown"
            label="Fig 5. Sales summary report"
            class="mb-4"
          />

          <DocsStepTimeline :steps="reportSteps" />

          <v-alert type="info" variant="tonal" class="mb-3" icon="mdi-file-export-outline">
            Every report page has <strong>Export CSV</strong> and <strong>Export PDF</strong> buttons.
            CSV gives you raw data for spreadsheets; PDF gives you a printable layout for sharing.
          </v-alert>

          <h3 class="text-h6 font-weight-bold mb-2">Interactive sample — Sales by day</h3>
          <DocsChartExportDemo
            title="Daily sales (sample)"
            description="A sample chart produced by the Reports module. Export the underlying data as CSV."
            filename="daily-sales.csv"
            :categories="reportCategories"
            :series="reportSeries"
          />
        </section>

        <v-divider class="my-6" />

        <!-- ====================== ANALYTICS ====================== -->
        <section id="module-analytics" class="docs-section">
          <h2 class="text-h4 font-weight-bold mb-2 section-title">
            <v-icon color="primary" class="mr-2">mdi-chart-multiple</v-icon>
            Analytics
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-4">
            Interactive dashboards: ABC analysis, revenue trends, top products, staff performance, peak hours.
          </p>

          <DocsChartExportDemo
            title="Top products by revenue (sample)"
            description="Visualize which products generate the most revenue. Export for further analysis."
            filename="top-products.csv"
            :categories="analyticsCategories"
            :series="analyticsSeries"
          />

          <v-alert type="info" variant="tonal" class="mb-3 mt-4" icon="mdi-chart-bell-curve">
            <strong>ABC Analysis.</strong> Inventory is segmented into A (top 20% by value),
            B (next 30%), and C (remaining 50%) so you can prioritize reordering.
          </v-alert>
        </section>

        <v-divider class="my-6" />

        <!-- ====================== ACCOUNTING ====================== -->
        <section id="module-accounting" class="docs-section">
          <h2 class="text-h4 font-weight-bold mb-2 section-title">
            <v-icon color="primary" class="mr-2">mdi-calculator-variant-outline</v-icon>
            Accounts and Finance
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-4">
            Chart of accounts, journal entries, ledgers, VAT, and financial statements.
          </p>

          <DocsStepTimeline :steps="accountingSteps" />

          <p class="text-body-2 mt-3 mb-2">Sample journal entries (exportable):</p>
          <DocsCsvExportDemo
            title="Journal entries export"
            description="Export posted journal entries with debit and credit lines for accounting review."
            filename="journal-entries.csv"
            :rows="journalSampleRows"
            :columns="['entry_no', 'date', 'account', 'description', 'debit', 'credit']"
          />
        </section>

        <v-divider class="my-6" />

        <!-- ====================== MODULES SUMMARY CARD ====================== -->
        <section id="modules" class="docs-section">
          <h2 class="text-h4 font-weight-bold mb-2 section-title">
            <v-icon color="primary" class="mr-2">mdi-view-module-outline</v-icon>
            All Modules at a Glance
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-4">
            A quick reference table of every module and its main capabilities.
          </p>
          <v-data-table
            :headers="moduleHeaders"
            :items="moduleRows"
            density="comfortable"
            class="border rounded-xl"
            items-per-page="-1"
          >
            <template #item.icon="{ item }">
              <v-icon :color="item.color" size="22">{{ item.icon }}</v-icon>
            </template>
            <template #item.actions="{ item }">
              <v-btn
                size="small"
                variant="text"
                color="primary"
                @click="scrollTo(item.link)"
              >
                Read
              </v-btn>
            </template>
          </v-data-table>
        </section>

        <v-divider class="my-6" />

        <!-- ====================== ROLES ====================== -->
        <section id="roles" class="docs-section">
          <h2 class="text-h4 font-weight-bold mb-2 section-title">
            <v-icon color="primary" class="mr-2">mdi-shield-account-outline</v-icon>
            Roles, Permissions, and Audit
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-4">
            Fine-grained Role-Based Access Control (RBAC) with audit logging. Every action is recorded.
          </p>

          <DocsSnapshot
            :src="iamSnapshot"
            alt="IAM page showing users with roles, statuses, and KPIs"
            label="Fig 6. The IAM page"
            class="mb-4"
          />

          <h3 class="text-h6 font-weight-bold mb-2">Default roles</h3>
          <v-data-table
            :headers="roleHeaders"
            :items="roleRows"
            density="comfortable"
            class="border rounded-xl mb-4"
            items-per-page="-1"
          />

          <h3 class="text-h6 font-weight-bold mb-2">Audit logs</h3>
          <p class="text-body-2 mb-3">
            Every login, create, update, delete, permission change, and export is recorded with
            user, IP, module, action, and timestamp. Tenant admins and auditors can filter and
            export the audit trail.
          </p>

          <DocsSnapshot
            :src="auditSnapshot"
            alt="Audit logs page with filters and timeline of actions by user, module, status"
            label="Fig 7. The audit log"
            class="mb-4"
          />

          <DocsCsvExportDemo
            title="Audit log export"
            description="Filter the audit log by user, action, module, date, and export for compliance reporting."
            filename="audit-log.csv"
            :rows="auditSampleRows"
            :columns="['timestamp', 'user', 'action', 'module', 'ip_address', 'status']"
          />
        </section>

        <v-divider class="my-6" />

        <!-- ====================== API AND EXPORTS ====================== -->
        <section id="api-and-exports" class="docs-section">
          <h2 class="text-h4 font-weight-bold mb-2 section-title">
            <v-icon color="primary" class="mr-2">mdi-api</v-icon>
            API and Exports
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-4">
            All list pages expose a REST API at <code>/api</code> and support CSV export. Here is how.
          </p>

          <h3 class="text-h6 font-weight-bold mb-2">Authentication</h3>
          <p class="text-body-2 mb-3">
            The frontend uses JWT access and refresh tokens. The token is sent as
            <code>Authorization: Bearer &lt;access_token&gt;</code>. Access tokens expire
            every 15 minutes and are refreshed automatically on 401 responses.
          </p>

          <v-card rounded="lg" flat border class="pa-4 mb-3">
            <pre class="code-block">POST /api/auth/login/
Content-Type: application/json

{
  "email": "you@example.com",
  "password": "your-password"
}</pre>
          </v-card>

          <h3 class="text-h6 font-weight-bold mb-2">Refreshing the token</h3>
          <v-card rounded="lg" flat border class="pa-4 mb-3">
            <pre class="code-block">POST /api/auth/refresh/
Authorization: Bearer &lt;refresh_token&gt;</pre>
          </v-card>

          <h3 class="text-h6 font-weight-bold mb-2">Listing resources</h3>
          <v-card rounded="lg" flat border class="pa-4 mb-3">
            <pre class="code-block">GET /api/products/?search=bread&category=groceries&ordering=-created_at
Authorization: Bearer &lt;access_token&gt;

# Response shape:
{
  "count": 128,
  "next": "https://…/api/products/?page=2",
  "previous": null,
  "results": [ {…}, {…}, … ]
}</pre>
          </v-card>

          <h3 class="text-h6 font-weight-bold mb-2">Audit trail / Logs</h3>
          <v-card rounded="lg" flat border class="pa-3 mb-3">
            <v-row density="comfortable">
              <v-col cols="12" md="6">
                <v-row density="comfortable">
                  <v-col cols="auto">
                    <v-btn color="primary" variant="flat" size="small" prepend-icon="mdi-download" @click="downloadApiAuditCsv">Download Audit Log CSV</v-btn>
                  </v-col>
                  <v-col cols="auto">
                    <v-btn color="primary" variant="flat" size="small" prepend-icon="mdi-download" @click="downloadApiCartCsv">Download Sales Data CSV</v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>

          <v-alert type="info" variant="tonal" icon="mdi-information-outline">
            Most authenticated endpoints accept <code>Accept: text/csv</code> instead of JSON to return a CSV stream directly.
          </v-alert>
        </section>

        <v-divider class="my-6" />

        <!-- ====================== FAQ ====================== -->
        <section id="faq" class="docs-section">
          <h2 class="text-h4 font-weight-bold mb-2 section-title">
            <v-icon color="primary" class="mr-2">mdi-help-circle-outline</v-icon>
            Frequently Asked Questions
          </h2>

          <v-expansion-panels class="mt-4" variant="accordion">
            <v-expansion-panel v-for="(f, i) in faqs" :key="i">
              <v-expansion-panel-title class="text-subtitle-1 font-weight-bold">
                {{ f.q }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <p class="text-body-1">{{ f.a }}</p>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-card rounded="xl" flat border class="pa-4 mt-6 contact-card">
            <v-row align="center">
              <v-col cols="12" md="8">
                <div class="text-h6 font-weight-bold">Still need help?</div>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  Contact your workspace admin or visit our support center. If you are a
                  super-admin, open the Platform Dashboard for tenant management.
                </p>
              </v-col>
              <v-col cols="12" md="4" class="text-md-right">
                <v-btn color="primary" prepend-icon="mdi-login" @click="navigateTo('/login')">
                  Go to login
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </section>

      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
// Use the public docs layout (no auth required)
definePageMeta({ layout: 'docs' })

useHead({
  title: 'User Guidelines — DomendraPOS',
  meta: [
    { name: 'description', content: 'Comprehensive user guide for DomendraPOS — POS, inventory, accounting, reports, roles, and API.' },
  ],
})

// Static asset imports (served from /assets via Nuxt img handling)
// We use imports so the bundler copies them into the build output.
import loginSnap from '~/assets/docs/snapshot-login.svg'
import dashboardSnap from '~/assets/docs/snapshot-dashboard.svg'
import posSnap from '~/assets/docs/snapshot-pos.svg'
import inventorySnap from '~/assets/docs/snapshot-inventory.svg'
import reportsSnap from '~/assets/docs/snapshot-reports.svg'
import iamSnap from '~/assets/docs/snapshot-iam.svg'
import auditSnap from '~/assets/docs/snapshot-audit.svg'
import chartSnap from '~/assets/docs/snapshot-dashboard.svg'

const loginSnapshot = loginSnap
const dashboardSnapshot = dashboardSnap
const posSnapshot = posSnap
const inventorySnapshot = inventorySnap
const reportsSnapshot = reportsSnap
const iamSnapshot = iamSnap
const auditSnapshot = auditSnap

// -- Table of contents
const tocSections = [
  { id: 'overview', title: 'Overview', level: 1 },
  { id: 'getting-started', title: 'Getting Started', level: 1 },
  { id: 'module-pos', title: 'Point of Sale', level: 2 },
  { id: 'module-inventory', title: 'Inventory', level: 2 },
  { id: 'module-products', title: 'Products', level: 2 },
  { id: 'module-customers', title: 'Customers', level: 2 },
  { id: 'module-suppliers', title: 'Suppliers', level: 2 },
  { id: 'module-reports', title: 'Reports', level: 2 },
  { id: 'module-analytics', title: 'Analytics', level: 2 },
  { id: 'module-accounting', title: 'Accounts and Finance', level: 2 },
  { id: 'modules', title: 'All Modules', level: 1 },
  { id: 'roles', title: 'Roles and Audit', level: 1 },
  { id: 'api-and-exports', title: 'API and Exports', level: 1 },
  { id: 'faq', title: 'FAQ', level: 1 },
]

// -- Stats
const stats = [
  { label: 'Modules documented', value: '12+', icon: 'mdi-view-module-outline', color: 'primary' },
  { label: 'Role types', value: '6', icon: 'mdi-shield-account-outline', color: 'success' },
  { label: 'CSV samples', value: '8', icon: 'mdi-file-delimited-outline', color: 'warning' },
  { label: 'Screenshots', value: '7', icon: 'mdi-image-multiple', color: 'info' },
]

// -- Login steps
const loginSteps = [
  { title: 'Open the login page', description: 'Navigate to https://app.domendrapos.com/login (or your tenant URL).' },
  { title: 'Enter your email', description: 'Use the email registered by your workspace admin.' },
  { title: 'Enter your password', description: 'Click the eye icon to reveal what you typed.', tip: 'Use a strong password with at least 8 characters, mixing letters, numbers, and symbols.' },
  { title: 'Remember me (optional)', description: 'Tick this box to stay signed in for 30 days on this device.' },
  { title: 'Click Sign in', description: 'You are redirected to /dashboard (or /superadmin if you are a platform super-admin).' },
  { title: 'Need help?', description: 'Click the Documentation button on the login screen to open this guide.' },
]

// -- POS steps
const posSteps = [
  { title: 'Select a branch', description: 'In the top app bar, choose the branch for this session.', color: 'primary' },
  { title: 'Search or scan', description: 'Type product name/SKU or scan a barcode. The match list filters as you type.' },
  { title: 'Tap to add', description: 'Tap a product tile to add one unit. Tap again for more.' },
  { title: 'Set quantity / discount', description: 'In the cart panel, change quantities and apply line or cart-level discounts.' },
  { title: 'Choose a customer (optional)', description: 'Attach a walk-in or registered customer for loyalty and credit sales.' },
  { title: 'Take payment', description: 'Tap Cash, M-Pesa, or Card. For cash, enter the amount tendered. For M-Pesa, enter the phone number. A sale receipt prints automatically.' },
  { title: 'Open or close shift', description: 'At end of day, close your shift and print a reconciliation summary.' },
]

// -- Products steps
const productSteps = [
  { title: 'Open Products', description: 'Sidebar → Products. Use the toggle for table or grid view.' },
  { title: 'Add a product', description: 'Click “+ New Product”. Fill in information, pricing, inventory, and variants tabs.' },
  { title: 'Manage categories, brands, units', description: 'Use the sub-tabs inside the product modal or the settings page.' },
  { title: 'Bulk import (Excel)', description: 'Download the template, fill rows, upload. The system validates and reports row errors.' },
  { title: 'Bulk edit (spreadsheet mode)', description: 'Toggle bulk-edit on the table to edit prices inline for many products at once.' },
  { title: 'Activate / deactivate', description: 'Use the status toggle or select rows and bulk-activate / bulk-deactivate.' },
]

// -- Customer steps
const customerSteps = [
  { title: 'Open Customers', description: 'Sidebar → Customers to see the CRM list.' },
  { title: 'Add a customer', description: 'Click “+ New Customer”. Enter name, phone, email, and loyalty tier.' },
  { title: 'Sell on credit', description: 'In POS, attach the customer and choose “Credit” as the payment method. Their balance updates immediately.' },
  { title: 'View history', description: 'Click any customer to see purchase history, loyalty points, and outstanding balance.' },
  { title: 'Redeem loyalty', description: 'At checkout, apply loyalty points as a discount if the customer has enough points.' },
]

// -- Supplier steps
const supplierSteps = [
  { title: 'Add a supplier', description: 'Sidebar → Suppliers → “+ New Supplier”. Enter name, contact, and payment terms.' },
  { title: 'Raise a PO', description: 'Sidebar → Purchasing → “+ New PO”. Select supplier, branch, and line items. Submit for approval.' },
  { title: 'Approve a PO', description: 'A manager approves the PO. Stock is not affected yet.' },
  { title: 'Receive goods', description: 'Open the approved PO and click “Receive”. Enter quantities received. Stock-on-hand updates; a journal entry is posted to the inventory account.' },
  { title: 'Record supplier invoice', description: 'Match the PO to a supplier invoice; the payable is recorded in the general ledger.' },
  { title: 'Pay supplier', description: 'Issue a payment via cash or bank; the PO closes and the supplier balance reduces.' },
]

// -- Report steps
const reportSteps = [
  { title: 'Open Reports', description: 'Sidebar → Reports and choose Sales Summary, Profit and Loss, VAT, or Stock Valuation.' },
  { title: 'Pick a period', description: 'Use the date pickers or the quick period chip: Today / This Week / This Month / Quarter / Year.' },
  { title: 'Pick branches', description: 'Choose All Branches or specific branches.' },
  { title: 'Run the report', description: 'Click “Generate”. KPIs and charts populate instantly.' },
  { title: 'Export', description: 'Click Export CSV (for data) or Export PDF (for a printable report).' },
  { title: 'Schedule', description: 'Accountants can schedule recurring reports to be emailed monthly.' },
]

// -- Inventory steps
const inventorySteps = [
  { title: 'Adjustment', description: 'Increase or decrease stock for a SKU. Choose a reason: damage, theft, recount, sample, return.' },
  { title: 'Transfer', description: 'Move stock from one branch to another. Source loses; destination gains.' },
  { title: 'Receive', description: 'Receive goods from a supplier PO. Updates stock and accounting simultaneously.' },
  { title: 'Return', description: 'Return goods to a supplier. Creates a debit note and a payable reversal.' },
  { title: 'Recount', description: 'A full physical count. Import a CSV of counted quantities and post the adjustments.' },
]

// -- Accounting steps
const accountingSteps = [
  { title: 'Chart of accounts', description: 'Settings → Accounting → Chart of Accounts. Define asset, liability, equity, income, expense accounts.' },
  { title: 'Post a journal entry', description: 'Accounting → Journal → New. Enter date, debit and credit lines. The entry must balance before posting.' },
  { title: 'View ledgers', description: 'Ledgers show all entries for an account in a date range with running balance.' },
  { title: 'Generate statements', description: 'Reports → Profit and Loss or Balance Sheet. Exports to PDF for sharing.' },
  { title: 'VAT', description: 'Reports → VAT Return. Generates the output VAT and input VAT for the period and the net payable.' },
]

// -- Inventory concepts
const inventoryConcepts = [
  { title: 'Stock on hand', text: 'The quantity of each SKU currently in a branch.', icon: 'mdi-package-variant', color: 'primary' },
  { title: 'Reorder point', text: 'The minimum stock level that triggers a low-stock alert.', icon: 'mdi-bell-alert-outline', color: 'warning' },
  { title: 'Stock value', text: 'On-hand × cost price, shown per branch and in total.', icon: 'mdi-cash', color: 'success' },
  { title: 'ABC class', text: 'A = top 20% by value, B = next 30%, C = remaining 50%.', icon: 'mdi-chart-bar', color: 'info' },
  { title: 'Adjustments', text: 'Manual increases or decreases with a documented reason.', icon: 'mdi-counter', color: 'primary' },
  { title: 'Transfers', text: 'Inter-branch moves tracked with source and destination.', icon: 'mdi-truck-fast-outline', color: 'secondary' },
]

// -- Module summary table
const moduleHeaders = [
  { title: '', key: 'icon', sortable: false },
  { title: 'Module', key: 'name', sortable: true },
  { title: 'What it does', key: 'description', sortable: false },
  { title: 'Roles', key: 'roles' },
  { title: '', key: 'actions', sortable: false },
]

const moduleRows = [
  { name: 'Dashboard', description: 'KPI overview: revenue, transactions, low stock, top products', roles: 'All', icon: 'mdi-view-dashboard-outline', color: 'primary', link: 'getting-started' },
  { name: 'POS', description: 'Make sales, accept payments, print receipts', roles: 'Cashier, Manager', icon: 'mdi-cart-outline', color: 'primary', link: 'module-pos' },
  { name: 'Inventory', description: 'Track stock, adjustments, transfers, ABC analysis', roles: 'Manager, Stock Clerk', icon: 'mdi-warehouse-outline', color: 'warning', link: 'module-inventory' },
  { name: 'Products', description: 'Catalog management, bulk Excel import, variants', roles: 'Manager', icon: 'mdi-package-variant-closed', color: 'success', link: 'module-products' },
  { name: 'Customers', description: 'CRM, loyalty, store credit, balances', roles: 'Cashier, Manager', icon: 'mdi-account-group-outline', color: 'info', link: 'module-customers' },
  { name: 'Suppliers', description: 'Supplier directory and PO management', roles: 'Manager', icon: 'mdi-truck-delivery-outline', color: 'secondary', link: 'module-suppliers' },
  { name: 'Purchasing', description: 'Raise, approve, receive purchase orders', roles: 'Manager', icon: 'mdi-clipboard-list-outline', color: 'primary', link: 'module-suppliers' },
  { name: 'Reports', description: 'Sales, P&L, VAT, stock valuation; CSV / PDF export', roles: 'Manager, Accountant', icon: 'mdi-chart-box-outline', color: 'primary', link: 'module-reports' },
  { name: 'Analytics', description: 'Interactive dashboards and trends', roles: 'Manager, Owner', icon: 'mdi-chart-multiple', color: 'info', link: 'module-analytics' },
  { name: 'Accounts', description: 'Chart of accounts, ledger, journal, statements', roles: 'Accountant', icon: 'mdi-calculator-variant-outline', color: 'success', link: 'module-accounting' },
  { name: 'IAM and Security', description: 'Users, roles, permissions, sessions', roles: 'Admin', icon: 'mdi-shield-account-outline', color: 'error', link: 'roles' },
  { name: 'Audit Logs', description: 'Immutable trail of every user action', roles: 'Admin, Auditor', icon: 'mdi-history', color: 'warning', link: 'roles' },
  { name: 'Branches', description: 'Multi-branch management', roles: 'Admin', icon: 'mdi-source-branch', color: 'primary', link: 'modules' },
  { name: 'API Billing', description: 'Usage metering and subscription', roles: 'Admin', icon: 'mdi-credit-card-chip-outline', color: 'secondary', link: 'modules' },
]

// -- Roles table
const roleHeaders = [
  { title: 'Role', key: 'name' },
  { title: 'Description', key: 'description', sortable: false },
  { title: 'Can make sales', key: 'sell' },
  { title: 'Can manage stock', key: 'stock' },
  { title: 'Can manage users', key: 'users' },
  { title: 'Can view reports', key: 'reports' },
]

const roleRows = [
  { name: 'Super Admin', description: 'Platform owner — manages all tenants and billing', sell: 'No', stock: 'All tenants', users: 'All tenants', reports: 'All tenants' },
  { name: 'Tenant Admin', description: 'Owner of a workspace — full access', sell: 'Yes', stock: 'All branches', users: 'Yes', reports: 'Yes' },
  { name: 'Manager', description: 'Branch manager — operations, approvals, reports', sell: 'Yes', stock: 'Own branch', users: 'Own branch', reports: 'Own branch' },
  { name: 'Accountant', description: 'Books, VAT, financial statements', sell: 'No', stock: 'View only', users: 'No', reports: 'Yes' },
  { name: 'Cashier', description: 'Front-of-house sales and shifts', sell: 'Yes', stock: 'No', users: 'No', reports: 'Own sales' },
  { name: 'Auditor', description: 'Read-only access to audit logs and reports', sell: 'No', stock: 'View only', users: 'View only', reports: 'Yes' },
]

// -- Sample CSV data
const inventorySampleRows = [
  { sku: 'SKU-001', product: 'Coca-Cola 500ml', category: 'Beverages', on_hand: 240, unit: 'bottle', reorder_point: 50, value: 14400, status: 'In Stock' },
  { sku: 'SKU-002', product: 'Bread Loaf', category: 'Bakery', on_hand: 42, unit: 'loaf', reorder_point: 20, value: 2310, status: 'In Stock' },
  { sku: 'SKU-003', product: 'Milk 1L', category: 'Dairy', on_hand: 18, unit: 'carton', reorder_point: 25, value: 2160, status: 'Low Stock' },
  { sku: 'SKU-004', product: 'Sugar 1kg', category: 'Groceries', on_hand: 87, unit: 'bag', reorder_point: 30, value: 18270, status: 'In Stock' },
  { sku: 'SKU-005', product: 'Eggs (tray)', category: 'Dairy', on_hand: 0, unit: 'tray', reorder_point: 10, value: 0, status: 'Out of Stock' },
  { sku: 'SKU-006', product: 'Rice 2kg', category: 'Groceries', on_hand: 56, unit: 'bag', reorder_point: 20, value: 19040, status: 'In Stock' },
  { sku: 'SKU-007', product: 'Cooking Oil 1L', category: 'Groceries', on_hand: 73, unit: 'bottle', reorder_point: 25, value: 18980, status: 'In Stock' },
  { sku: 'SKU-008', product: 'Tea Bags 100pk', category: 'Beverages', on_hand: 8, unit: 'box', reorder_point: 15, value: 1440, status: 'Low Stock' },
]

const productSampleRows = [
  { sku: 'SKU-001', name: 'Coca-Cola 500ml', category: 'Beverages', brand: 'Coca-Cola', unit: 'bottle', cost_price: 45, selling_price: 60, tax_rate: 16, is_active: true },
  { sku: 'SKU-002', name: 'Bread Loaf', category: 'Bakery', brand: 'Prima', unit: 'loaf', cost_price: 40, selling_price: 55, tax_rate: 0, is_active: true },
  { sku: 'SKU-003', name: 'Milk 1L', category: 'Dairy', brand: 'Brookside', unit: 'carton', cost_price: 105, selling_price: 120, tax_rate: 0, is_active: true },
  { sku: 'SKU-004', name: 'Sugar 1kg', category: 'Groceries', brand: 'Mumias', unit: 'bag', cost_price: 190, selling_price: 210, tax_rate: 16, is_active: true },
  { sku: 'SKU-005', name: 'Eggs (tray)', category: 'Dairy', brand: 'Kenchic', unit: 'tray', cost_price: 420, selling_price: 450, tax_rate: 0, is_active: false },
  { sku: 'SKU-006', name: 'Rice 2kg', category: 'Groceries', brand: 'Pishori', unit: 'bag', cost_price: 300, selling_price: 340, tax_rate: 0, is_active: true },
]

const customerSampleRows = [
  { name: 'John Ade', phone: '+254712345678', email: 'john@example.com', loyalty_points: 340, credit_balance: 1200, total_spent: 38400 },
  { name: 'Sarah Kamau', phone: '+254722334455', email: 'sarah@example.com', loyalty_points: 1280, credit_balance: 0, total_spent: 124500 },
  { name: 'Moses Otieno', phone: '+254733445566', email: 'moses@example.com', loyalty_points: 75, credit_balance: 450, total_spent: 7300 },
  { name: 'Mary Wanjiru', phone: '+254700112233', email: 'mary@example.com', loyalty_points: 850, credit_balance: 0, total_spent: 56700 },
  { name: 'David Kiptoo', phone: '+254711998877', email: 'david@example.com', loyalty_points: 12, credit_balance: 2100, total_spent: 1800 },
]

const poSampleRows = [
  { po_number: 'PO-2026-001', supplier: 'Coca-Cola Ltd', branch: 'City', status: 'Approved', order_date: '2026-01-04', total: 48000 },
  { po_number: 'PO-2026-002', supplier: 'Prima Bakeries', branch: 'Town', status: 'Received', order_date: '2026-01-05', total: 12000 },
  { po_number: 'PO-2026-003', supplier: 'Brookside Dairy', branch: 'City', status: 'Pending', order_date: '2026-01-06', total: 38500 },
  { po_number: 'PO-2026-004', supplier: 'Mumias Sugar', branch: 'Town', status: 'Draft', order_date: '2026-01-06', total: 24000 },
  { po_number: 'PO-2026-005', supplier: 'Kenchic Ltd', branch: 'Highway', status: 'Received', order_date: '2026-01-03', total: 16800 },
]

const journalSampleRows = [
  { entry_no: 'JE-1001', date: '2026-01-06', account: 'Cash', description: 'Cash sale #1024', debit: 1250, credit: 0 },
  { entry_no: 'JE-1001', date: '2026-01-06', account: 'Sales Revenue', description: 'Cash sale #1024', debit: 0, credit: 1078 },
  { entry_no: 'JE-1001', date: '2026-01-06', account: 'VAT Output', description: 'VAT on sale #1024', debit: 0, credit: 172 },
  { entry_no: 'JE-1002', date: '2026-01-06', account: 'M-Pesa', description: 'M-Pesa sale #1025', debit: 821, credit: 0 },
  { entry_no: 'JE-1002', date: '2026-01-06', account: 'Sales Revenue', description: 'M-Pesa sale #1025', debit: 0, credit: 708 },
  { entry_no: 'JE-1002', date: '2026-01-06', account: 'VAT Output', description: 'VAT on sale #1025', debit: 0, credit: 113 },
]

const auditSampleRows = [
  { timestamp: '2026-01-06 14:32:18', user: 'John Ade', action: 'LOGIN', module: 'Auth', ip_address: '41.90.1.12', status: 'Success' },
  { timestamp: '2026-01-06 14:30:02', user: 'Sarah Kamau', action: 'CREATE', module: 'Products', ip_address: '41.90.1.15', status: 'Success' },
  { timestamp: '2026-01-06 14:25:44', user: 'Moses Otieno', action: 'SALE', module: 'POS', ip_address: '41.90.1.18', status: 'Success' },
  { timestamp: '2026-01-06 14:20:11', user: 'John Ade', action: 'DELETE', module: 'Inventory', ip_address: '41.90.1.12', status: 'Denied' },
  { timestamp: '2026-01-06 14:15:33', user: 'Mary Wanjiru', action: 'UPDATE', module: 'Accounting', ip_address: '41.90.1.20', status: 'Success' },
  { timestamp: '2026-01-06 14:10:09', user: 'David Kiptoo', action: 'LOGIN_FAILED', module: 'Auth', ip_address: '41.90.1.25', status: 'Failed' },
]

// -- Sample chart data
const reportCategories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const reportSeries = [
  { name: 'Revenue (KSh)', data: [62000, 71000, 58000, 84000, 76000, 98000, 81000] },
  { name: 'Transactions', data: [310, 342, 295, 348, 320, 380, 351] },
]

const analyticsCategories = ['Coca-Cola 500ml', 'Bread Loaf', 'Milk 1L', 'Sugar 1kg', 'Rice 2kg', 'Cooking Oil 1L']
const analyticsSeries = [
  { name: 'Revenue (KSh)', data: [12000, 9400, 8100, 7200, 6500, 5800] },
]

// -- FAQ
const faqs = [
  { q: 'How do I reset my password?', a: 'On the login screen, click “Forgot password?”. If your admin has enabled self-service, you will receive a reset email. Otherwise, contact your workspace admin.' },
  { q: 'Can I use DomendraPOS offline?', a: 'The POS terminal supports an offline mode for cash sales. Once reconnected, offline sales sync to the server automatically.' },
  { q: 'How are branches isolated?', a: 'Each branch has its own stock-on-hand and shift sessions. Reports and dashboards can be filtered by branch or show all branches combined.' },
  { q: 'What currencies are supported?', a: 'The default currency is Kenyan Shillings (KSh), but any ISO 4217 currency can be configured per workspace by the tenant admin.' },
  { q: 'How is VAT handled?', a: 'Each product has a tax rate (e.g. 16% for standard rated, 0% for zero-rated). Sales compute output VAT automatically and post it to a VAT Output account. VAT returns aggregate this for filing.' },
  { q: 'How do I export my data?', a: 'Every list page has an Export CSV button. Reports also export to PDF. See the API section for programmatic CSV access.' },
  { q: 'Is my data backed up?', a: 'Yes. Daily encrypted backups are retained for 30 days. Super-admins can trigger on-demand backups from the Platform Dashboard.' },
  { q: 'Can I bulk-import products?', a: 'Yes. On the Products page, download the Excel template, fill rows, and upload. The system validates and shows per-row errors before committing.' },
  { q: 'What happens to sales data if a cashier leaves?', a: 'Sales remain attached to the cashier user record. Deactivating the user blocks new logins but preserves all historical sales and audit entries.' },
]

// -- Helpers
function scrollTo(id: string) {
  if (import.meta.client) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// useCsvExport is auto-imported by Nuxt
const { exportCsv } = useCsvExport()

function downloadApiAuditCsv() {
  exportCsv('audit-log-sample.csv', auditSampleRows, {
    columns: ['timestamp', 'user', 'action', 'module', 'ip_address', 'status'],
  })
}
function downloadApiCartCsv() {
  exportCsv('daily-sales-sample.csv', reportCategories.map((cat, i) => ({
    day: cat,
    revenue: reportSeries[0].data[i],
    transactions: reportSeries[1].data[i],
  })), { columns: ['day', 'revenue', 'transactions'] })
}
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, rgba(52, 120, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
  border-radius: 28px;
  border: 1px solid rgba(203, 213, 225, 0.4);
}
.hero-title { color: #0f172a; }
.hero-lede { color: #475569; }
.hero-frame {
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
}

.docs-section { scroll-margin-top: 80px; }
.section-title { color: #0f172a; }

.code-block {
  background: #0f172a; color: #93c5fd;
  padding: 16px; border-radius: 12px;
  font-size: 13px; line-height: 1.6;
  font-family: 'Cascadia Code', 'Consolas', monospace;
  overflow-x: auto;
}

.contact-card {
  background: linear-gradient(135deg, rgba(52, 120, 246, 0.04), rgba(13, 148, 136, 0.04));
}

.docs-main { max-width: 100%; }
</style>

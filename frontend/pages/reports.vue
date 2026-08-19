<template>
  <v-container fluid class="pa-4 pa-md-6" style="max-width: 1600px;">
    <!-- Header -->
    <div class="d-flex align-center mb-4">
      <v-icon class="mr-2" color="primary">mdi-chart-box-outline</v-icon>
      <h1 class="text-h5 font-weight-bold">Reports & Analytics</h1>
      <v-spacer />
      <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="loadActive">Refresh</v-btn>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = null">{{ error }}</v-alert>

    <!-- Filters bar -->
    <v-card rounded="lg" class="pa-3 mb-4">
      <div class="d-flex flex-wrap align-center ga-3">
        <v-icon class="mr-1">mdi-filter-variant</v-icon>
        <span class="text-subtitle-2">Filters:</span>

        <!-- Date range presets -->
        <v-chip-group v-model="preset" selected-class="text-primary" @update:model-value="onPresetChange">
          <v-chip v-for="p in presets" :key="p.value" :value="p.value" size="small" variant="tonal">
            {{ p.label }}
          </v-chip>
        </v-chip-group>

        <!-- Custom date range -->
        <template v-if="preset === 'custom'">
          <v-text-field
            v-model="customFrom"
            label="From"
            type="date"
            density="compact"
            variant="outlined"
            hide-details
            style="max-width: 170px;"
            class="mr-2"
            @update:model-value="loadActive"
          />
          <v-text-field
            v-model="customTo"
            label="To"
            type="date"
            density="compact"
            variant="outlined"
            hide-details
            style="max-width: 170px;"
            class="mr-2"
            @update:model-value="loadActive"
          />
        </template>

        <v-spacer />

        <!-- Branch filter -->
        <v-select
          v-model="branchFilter"
          :items="branchOptions"
          item-title="name"
          item-value="id"
          label="Branch"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          style="max-width: 200px;"
          @update:model-value="loadActive"
        />

        <!-- Export -->
        <v-btn variant="tonal" color="primary" size="small" prepend-icon="mdi-download" :disabled="!reportData" @click="exportCSV">
          Export CSV
        </v-btn>
      </div>
    </v-card>

    <!-- Report type tabs -->
    <v-card rounded="lg" class="mb-4 overflow-hidden">
      <v-tabs v-model="activeReport" show-arrows @update:model-value="loadActive">
        <v-tab v-for="r in reports" :key="r.id" :value="r.id" :prepend-icon="r.icon" :slim="false">
          {{ r.short }}
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- Loading -->
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <!-- Summary KPI cards -->
    <div v-if="activeReport === 'sales-summary' && reportData" class="mb-4">
      <v-row dense>
        <v-col cols="12" sm="6" md="3">
          <v-card rounded="lg" class="pa-4 h-100" color="primary" variant="tonal">
            <div class="d-flex align-center justify-space-between">
              <div class="text-caption text-medium-emphasis">Total Revenue</div>
              <v-icon size="20" color="primary">mdi-cash-multiple</v-icon>
            </div>
            <div class="text-h5 font-weight-bold mt-1">{{ fmtCurrency(reportData.total_revenue) }}</div>
            <div class="text-caption text-medium-emphasis mt-1">{{ reportData.transaction_count }} transactions</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card rounded="lg" class="pa-4 h-100" color="success" variant="tonal">
            <div class="d-flex align-center justify-space-between">
              <div class="text-caption text-medium-emphasis">Gross Profit</div>
              <v-icon size="20" color="success">mdi-chart-line-variant</v-icon>
            </div>
            <div class="text-h5 font-weight-bold mt-1">{{ fmtCurrency(reportData.gross_profit) }}</div>
            <div class="text-caption text-medium-emphasis mt-1">{{ reportData.gross_margin }}% margin</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card rounded="lg" class="pa-4 h-100" color="info" variant="tonal">
            <div class="d-flex align-center justify-space-between">
              <div class="text-caption text-medium-emphasis">Avg Sale</div>
              <v-icon size="20" color="info">mdi-receipt-text-arrow-right</v-icon>
            </div>
            <div class="text-h5 font-weight-bold mt-1">{{ fmtCurrency(reportData.average_sale) }}</div>
            <div class="text-caption text-medium-emphasis mt-1">per transaction</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card rounded="lg" class="pa-4 h-100" color="warning" variant="tonal">
            <div class="d-flex align-center justify-space-between">
              <div class="text-caption text-medium-emphasis">Total Discounts</div>
              <v-icon size="20" color="warning">mdi-tag-arrow-down</v-icon>
            </div>
            <div class="text-h5 font-weight-bold mt-1">{{ fmtCurrency(reportData.total_discounts) }}</div>
            <div class="text-caption text-medium-emphasis mt-1">Tax: {{ fmtCurrency(reportData.total_tax) }}</div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Tax collected KPI -->
    <div v-if="activeReport === 'tax-collected' && reportData" class="mb-4">
      <v-row dense>
        <v-col cols="12" sm="6" md="4">
          <v-card rounded="lg" class="pa-4" color="info" variant="tonal">
            <div class="text-caption text-medium-emphasis">Total Tax Collected</div>
            <div class="text-h5 font-weight-bold mt-1">{{ fmtCurrency(reportData.total_tax_collected) }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-card rounded="lg" class="pa-4" color="primary" variant="tonal">
            <div class="text-caption text-medium-emphasis">Taxable Sales</div>
            <div class="text-h5 font-weight-bold mt-1">{{ fmtCurrency(reportData.taxable_sales) }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-card rounded="lg" class="pa-4" color="success" variant="tonal">
            <div class="text-caption text-medium-emphasis">Effective Tax Rate</div>
            <div class="text-h5 font-weight-bold mt-1">{{ reportData.effective_rate }}%</div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Bar chart for daily revenue -->
    <v-card v-if="activeReport === 'daily-revenue' && reportData && reportData.length" rounded="lg" class="mb-4 overflow-hidden">
      <div class="pa-4 pb-0">
        <div class="text-subtitle-2 font-weight-bold mb-1">Revenue Trend</div>
        <div class="text-caption text-medium-emphasis">Daily revenue and profit over the selected period</div>
      </div>
      <div class="chart-bars pa-4">
        <div v-for="(d, i) in reportData" :key="i" class="chart-bar-col">
          <div class="chart-bar-stack">
            <div
              class="chart-bar chart-bar--profit"
              :style="{ height: barHeight(d.profit, maxRevenue) }"
              :title="`Profit: ${fmtCurrency(d.profit)}`"
            />
            <div
              class="chart-bar chart-bar--cost"
              :style="{ height: barHeight(d.cost, maxRevenue) }"
              :title="`Cost: ${fmtCurrency(d.cost)}`"
            />
          </div>
          <div class="chart-bar-label">{{ fmtDateShort(d.date) }}</div>
          <div class="chart-bar-value">{{ fmtCurrency(d.revenue) }}</div>
        </div>
      </div>
    </v-card>

    <!-- Report data table -->
    <v-card v-if="reportData && (!Array.isArray(reportData) || reportData.length > 0)" rounded="lg">
      <v-data-table
        :items="tableItems"
        :headers="tableHeaders"
        density="comfortable"
        hover
        :items-per-page="15"
        class="elevation-1"
      >
        <template v-for="h in moneyColumns" #[`item.${h.key}`]="{ item }">
          {{ fmtCurrency(item[h.key]) }}
        </template>
        <template v-for="h in percentColumns" #[`item.${h.key}`]="{ item }">
          {{ item[h.key] }}%
        </template>
        <template v-for="h in numberColumns" #[`item.${h.key}`]="{ item }">
          {{ fmtNumber(item[h.key]) }}
        </template>
      </v-data-table>
    </v-card>

    <!-- Empty state -->
    <v-card v-else-if="reportData && Array.isArray(reportData) && reportData.length === 0 && !loading" rounded="lg" class="text-center py-12">
      <v-icon size="56" color="medium-emphasis" class="mb-3">mdi-file-document-outline</v-icon>
      <div class="text-h6 font-weight-bold mb-1">No data for this report</div>
      <div class="text-body-2 text-medium-emphasis">Try adjusting the date range or branch filter.</div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const api = useApi()
const { currency: fmtCurrency, number: fmtNumber, date: fmtDate } = useFormat()

// ── Filters ────────────────────────────────────────────────────
const presets = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 30 days', value: '30' },
  { label: 'This month', value: 'month' },
  { label: 'Last month', value: 'lastmonth' },
  { label: 'This year', value: 'year' },
  { label: 'Custom', value: 'custom' },
]

const preset = ref('month')
const customFrom = ref('')
const customTo = ref('')
const branchFilter = ref(null as number | null)
const branchOptions = ref<any[]>([])

// ── Report types ────────────────────────────────────────────────
const reports = [
  { id: 'sales-summary', short: 'Summary', icon: 'mdi-chart-line', label: 'Sales Summary' },
  { id: 'sales-by-product', short: 'Products', icon: 'mdi-package-variant-closed', label: 'Sales by Product' },
  { id: 'sales-by-branch', short: 'Branches', icon: 'mdi-store-outline', label: 'Sales by Branch' },
  { id: 'sales-by-cashier', short: 'Cashiers', icon: 'mdi-account-tie', label: 'Sales by Cashier' },
  { id: 'daily-revenue', short: 'Daily Revenue', icon: 'mdi-chart-bar', label: 'Daily Revenue' },
  { id: 'profit-margin', short: 'Profit Margin', icon: 'mdi-chart-bell-curve', label: 'Profit Margin' },
  { id: 'payment-methods', short: 'Payments', icon: 'mdi-credit-card-outline', label: 'Payment Methods' },
  { id: 'inventory-valuation', short: 'Inventory', icon: 'mdi-currency-usd', label: 'Inventory Valuation' },
  { id: 'low-stock', short: 'Low Stock', icon: 'mdi-alert-outline', label: 'Low Stock Report' },
  { id: 'top-customers', short: 'Top Customers', icon: 'mdi-account-star-outline', label: 'Top Customers' },
  { id: 'tax-collected', short: 'Tax', icon: 'mdi-calculator', label: 'Tax Collected' },
  { id: 'stock-movement', short: 'Stock Moves', icon: 'mdi-swap-vertical', label: 'Stock Movement' },
]

const activeReport = ref('sales-summary')

const loading = ref(false)
const error = ref<string | null>(null)
const reportData = ref<any>(null)

// ── Computed column definitions per report ──────────────────────
const moneyColumns = computed(() => {
  const map: Record<string, string[]> = {
    'sales-summary': [],
    'sales-by-product': ['revenue', 'cost', 'profit'],
    'sales-by-branch': ['total_sales', 'total_cost', 'gross_profit', 'average_sale'],
    'sales-by-cashier': ['total_sales', 'average_sale'],
    'daily-revenue': ['revenue', 'cost', 'profit'],
    'profit-margin': ['revenue', 'cost', 'profit'],
    'inventory-valuation': ['cost_value', 'retail_value', 'potential_profit'],
    'low-stock': [],
    'payment-methods': ['total'],
    'top-customers': ['total_spent', 'average_spend'],
    'tax-collected': [],
    'stock-movement': [],
  }
  return (map[activeReport.value] || []).map(k => ({ key: k }))
})

const percentColumns = computed(() => {
  const map: Record<string, string[]> = {
    'sales-by-product': ['margin'],
    'profit-margin': ['margin'],
    'payment-methods': ['percentage'],
  }
  return (map[activeReport.value] || []).map(k => ({ key: k }))
})

const numberColumns = computed(() => {
  const map: Record<string, string[]> = {
    'sales-by-product': ['qty_sold'],
    'sales-by-branch': ['transaction_count'],
    'sales-by-cashier': ['transaction_count'],
    'daily-revenue': ['transactions'],
    'inventory-valuation': ['qty_on_hand'],
    'low-stock': ['on_hand', 'reorder_level', 'shortage'],
    'payment-methods': ['count'],
    'top-customers': ['visits'],
    'stock-movement': ['quantity_change', 'movement_count'],
  }
  return (map[activeReport.value] || []).map(k => ({ key: k }))
})

const tableHeaders = computed(() => {
  if (!reportData.value) return []
  const sample = Array.isArray(reportData.value) ? reportData.value[0] : reportData.value
  if (!sample) return []

  const labels: Record<string, string> = {
    product: 'Product',
    sku: 'SKU',
    branch: 'Branch',
    code: 'Code',
    cashier: 'Cashier',
    customer: 'Customer',
    email: 'Email',
    tier: 'Tier',
    type: 'Type',
    method: 'Method',
    qty_sold: 'Qty Sold',
    revenue: 'Revenue',
    cost: 'Cost',
    profit: 'Profit',
    margin: 'Margin',
    total_sales: 'Total Sales',
    total_cost: 'Total Cost',
    gross_profit: 'Gross Profit',
    average_sale: 'Avg Sale',
    transaction_count: 'Txns',
    transactions: 'Txns',
    date: 'Date',
    qty_on_hand: 'Qty on Hand',
    cost_value: 'Cost Value',
    retail_value: 'Retail Value',
    potential_profit: 'Potential Profit',
    on_hand: 'On Hand',
    reorder_level: 'Reorder Level',
    shortage: 'Shortage',
    total: 'Total',
    count: 'Count',
    percentage: 'Share',
    total_spent: 'Total Spent',
    visits: 'Visits',
    average_spend: 'Avg Spend',
    total_tax_collected: 'Tax Collected',
    taxable_sales: 'Taxable Sales',
    effective_rate: 'Rate',
    quantity_change: 'Qty Change',
    movement_count: 'Moves',
  }

  const keys = Object.keys(sample)
  return keys.map(k => ({
    title: labels[k] || k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    key: k,
    sortable: true,
  }))
})

const tableItems = computed(() => {
  if (!reportData.value) return []
  return Array.isArray(reportData.value) ? reportData.value : [reportData.value]
})

// ── Chart helpers ───────────────────────────────────────────────
const maxRevenue = computed(() => {
  if (!Array.isArray(reportData.value)) return 1
  const max = reportData.value.reduce((m: number, d: any) => Math.max(m, parseFloat(d.revenue) || 0), 0)
  return max || 1
})

function barHeight(val: string | number, max: number) {
  const v = parseFloat(String(val)) || 0
  const pct = max > 0 ? Math.max(2, (v / max) * 100) : 0
  return `${pct}%`
}

function fmtDateShort(d: string) {
  if (!d) return ''
  const dt = new Date(d)
  return dt.toLocaleDateString('en', { day: '2-digit', month: 'short' })
}

// ── Date range computation ──────────────────────────────────────
function dateRange(): { date_from: string; date_to: string } {
  const today = new Date()
  const fmt = (d: Date) => d.toISOString().split('T')[0]

  switch (preset.value) {
    case 'today':
      return { date_from: fmt(today), date_to: fmt(today) }
    case 'yesterday': {
      const y = new Date(today)
      y.setDate(y.getDate() - 1)
      return { date_from: fmt(y), date_to: fmt(y) }
    }
    case '7': {
      const start = new Date(today)
      start.setDate(start.getDate() - 6)
      return { date_from: fmt(start), date_to: fmt(today) }
    }
    case '30': {
      const start = new Date(today)
      start.setDate(start.getDate() - 29)
      return { date_from: fmt(start), date_to: fmt(today) }
    }
    case 'month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      return { date_from: fmt(start), date_to: fmt(today) }
    }
    case 'lastmonth': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const end = new Date(today.getFullYear(), today.getMonth(), 0)
      return { date_from: fmt(start), date_to: fmt(end) }
    }
    case 'year': {
      const start = new Date(today.getFullYear(), 0, 1)
      return { date_from: fmt(start), date_to: fmt(today) }
    }
    case 'custom':
      return { date_from: customFrom.value, date_to: customTo.value }
    default:
      return { date_from: '', date_to: '' }
  }
}

function onPresetChange() {
  if (preset.value === 'custom') return
  loadActive()
}

// ── API calls ────────────────────────────────────────────────────
async function loadBranches() {
  try {
    const data = await api('/branches/')
    branchOptions.value = data.results || data || []
  } catch {
    branchOptions.value = []
  }
}

async function loadActive() {
  if (activeReport.value === 'inventory-valuation' || activeReport.value === 'low-stock' || activeReport.value === 'stock-movement') {
    // These don't use sales date range, but branch filter and date apply to stock movement
  }
  loading.value = true
  error.value = null
  reportData.value = null
  try {
    const { date_from, date_to } = dateRange()
    const params: Record<string, any> = {}
    if (date_from) params.date_from = date_from
    if (date_to) params.date_to = date_to
    if (branchFilter.value) params.branch = branchFilter.value

    const query = new URLSearchParams(params as any).toString()
    const url = `/reports/${activeReport.value}/${query ? `?${query}` : ''}`
    reportData.value = await api(url)
  } catch (e: any) {
    error.value = e?.data?.detail || e.message || 'Failed to load report.'
  } finally {
    loading.value = false
  }
}

// ── CSV export ───────────────────────────────────────────────────
function exportCSV() {
  if (!reportData.value) return
  const items = tableItems.value
  if (!items.length) return

  const headers = tableHeaders.value.map(h => h.key)
  const headerRow = tableHeaders.value.map(h => `"${h.title}"`).join(',')
  const dataRows = items.map((row: any) =>
    headers.map(k => `"${String(row[k] ?? '').replace(/"/g, '""')}"`).join(',')
  )
  const csv = [headerRow, ...dataRows].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const reportName = reports.find(r => r.id === activeReport.value)?.label || 'report'
  link.download = `${reportName.replace(/\s+/g, '_')}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ── Init ─────────────────────────────────────────────────────────
onMounted(async () => {
  await loadBranches()
  await loadActive()
})
</script>

<style scoped>
/* ── CSS bar chart for daily revenue ─────────────────────────── */
.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 220px;
  overflow-x: auto;
  overflow-y: hidden;
}
.chart-bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
  flex: 1;
  height: 100%;
}
.chart-bar-stack {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column-reverse;
  justify-content: flex-start;
  align-items: center;
  gap: 1px;
}
.chart-bar {
  width: 70%;
  max-width: 36px;
  border-radius: 3px 3px 0 0;
  min-height: 2px;
  transition: height 0.3s ease;
}
.chart-bar--cost {
  background: rgb(var(--v-theme-error));
  opacity: 0.7;
}
.chart-bar--profit {
  background: rgb(var(--v-theme-success));
  opacity: 0.8;
}
.chart-bar-label {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-top: 4px;
  white-space: nowrap;
}
.chart-bar-value {
  font-size: 10px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.8);
  white-space: nowrap;
}
</style>

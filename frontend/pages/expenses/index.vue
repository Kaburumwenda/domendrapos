<template>
  <div class="az-page">
    <!-- ===== Header ===== -->
    <div class="az-header">
      <div class="az-header__left">
        <div class="az-header__title">
          <h1 class="text-h5 font-weight-bold">Operating Expenses</h1>
          <p class="text-body-2 text-medium-emphasis">Track, categorize and analyze business spending</p>
        </div>
      </div>
      <div class="az-header__actions">
        <v-btn-group density="compact" variant="outlined" color="primary">
          <v-btn v-for="opt in periodOptions" :key="opt.value" :variant="period === opt.value ? 'flat' : 'text'" :color="period === opt.value ? 'primary' : undefined" size="small" @click="selectPeriod(opt.value)">{{ opt.short }}</v-btn>
          <v-btn :variant="period === 'custom' ? 'flat' : 'text'" :color="period === 'custom' ? 'primary' : undefined" size="small" prepend-icon="mdi-calendar-clock" @click="openCustomRange">Custom</v-btn>
        </v-btn-group>
        <v-btn variant="tonal" prepend-icon="mdi-refresh" size="small" @click="loadData" :loading="loading">Refresh</v-btn>
        <v-btn variant="outlined" prepend-icon="mdi-tag-multiple" size="small" to="/expenses/categories">Categories</v-btn>
        <v-btn variant="flat" color="primary" prepend-icon="mdi-plus" size="small" to="/expenses/new">New Expense</v-btn>
      </div>
    </div>

    <!-- ===== Loading ===== -->
    <div v-if="loading && expenses.length === 0" class="az-loading">
      <v-progress-circular indeterminate color="primary" size="32" width="3" />
      <p class="text-body-2 text-medium-emphasis mt-3">Loading expenses…</p>
    </div>

    <template v-else>
      <!-- ===== KPI Row ===== -->
      <div class="az-kpi-grid">
        <div class="az-kpi az-kpi--error">
          <div class="az-kpi__icon az-kpi__icon--error"><v-icon size="20">mdi-cash-minus</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Total Expenses</p>
            <p class="az-kpi__value text-error">{{ formatMoney(kpis.total) }}</p>
            <p class="az-kpi__sub">{{ kpis.count }} transactions</p>
          </div>
        </div>

        <div class="az-kpi az-kpi--warning">
          <div class="az-kpi__icon az-kpi__icon--warning"><v-icon size="20">mdi-calendar-month</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">This Month</p>
            <p class="az-kpi__value text-warning">{{ formatMoney(kpis.thisMonth) }}</p>
            <p class="az-kpi__sub">{{ formatMoney(kpis.dailyAvg) }}/day avg</p>
          </div>
        </div>

        <div class="az-kpi az-kpi--info">
          <div class="az-kpi__icon az-kpi__icon--info"><v-icon size="20">mdi-trending-up</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Top Category</p>
            <p class="az-kpi__value text-info">{{ kpis.topCategory || '—' }}</p>
            <p class="az-kpi__sub">{{ kpis.topCategoryPct.toFixed(1) }}% of spend</p>
          </div>
        </div>

        <div class="az-kpi az-kpi--success">
          <div class="az-kpi__icon az-kpi__icon--success"><v-icon size="20">mdi-chart-line-variant</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">vs Last Period</p>
            <p class="az-kpi__value" :class="kpis.change >= 0 ? 'text-error' : 'text-success'">{{ kpis.change >= 0 ? '+' : '' }}{{ kpis.change.toFixed(1) }}%</p>
            <p class="az-kpi__sub">{{ kpis.change >= 0 ? 'Increase' : 'Decrease' }}</p>
          </div>
        </div>

        <div class="az-kpi az-kpi--purple">
          <div class="az-kpi__icon az-kpi__icon--purple"><v-icon size="20">mdi-bank</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Largest Single</p>
            <p class="az-kpi__value" style="color: #7C4DFF">{{ formatMoney(kpis.largest) }}</p>
            <p class="az-kpi__sub">{{ kpis.largestCat || '' }}</p>
          </div>
        </div>

        <div class="az-kpi az-kpi--teal">
          <div class="az-kpi__icon az-kpi__icon--teal"><v-icon size="20">mdi-shape-outline</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Categories Used</p>
            <p class="az-kpi__value" style="color: #00B8D4">{{ kpis.categoryCount }}</p>
            <p class="az-kpi__sub">{{ kpis.vendorCount }} vendors</p>
          </div>
        </div>
      </div>

      <!-- ===== Charts Row 1: Trend area + Category donut ===== -->
      <div class="az-chart-row az-chart-row--first">
        <div class="az-card az-card--two-thirds">
          <div class="az-card__header">
            <div class="az-card__header-icon az-card__header-icon--blue"><v-icon size="20">mdi-chart-line</v-icon></div>
            <div>
              <h3 class="az-card__title">Spending Trend</h3>
              <p class="az-card__subtitle">Daily expenses over the selected period</p>
            </div>
          </div>
          <div class="az-card__body">
            <apexchart type="area" height="340" :options="trendOptions" :series="trendSeries" />
          </div>
        </div>

        <div class="az-card az-card--third">
          <div class="az-card__header">
            <div class="az-card__header-icon az-card__header-icon--rose"><v-icon size="20">mdi-chart-donut</v-icon></div>
            <div>
              <h3 class="az-card__title">By Category</h3>
              <p class="az-card__subtitle">Share of total spend</p>
            </div>
          </div>
          <div class="az-card__body">
            <apexchart type="donut" height="340" :options="catDonutOptions" :series="catDonutSeries" />
          </div>
        </div>
      </div>

      <!-- ===== Charts Row 2: Category bar + Payment method bar ===== -->
      <div class="az-chart-row">
        <div class="az-card az-card--half">
          <div class="az-card__header">
            <div class="az-card__header-icon az-card__header-icon--amber"><v-icon size="20">mdi-chart-bar</v-icon></div>
            <div>
              <h3 class="az-card__title">Category Breakdown</h3>
              <p class="az-card__subtitle">Spending by category (sorted)</p>
            </div>
          </div>
          <div class="az-card__body">
            <apexchart type="bar" height="300" :options="catBarOptions" :series="catBarSeries" />
          </div>
        </div>

        <div class="az-card az-card--half">
          <div class="az-card__header">
            <div class="az-card__header-icon az-card__header-icon--green"><v-icon size="20">mdi-credit-card-multiple</v-icon></div>
            <div>
              <h3 class="az-card__title">Payment Methods</h3>
              <p class="az-card__subtitle">Spend by payment method</p>
            </div>
          </div>
          <div class="az-card__body">
            <apexchart type="bar" height="300" :options="methodBarOptions" :series="methodBarSeries" />
          </div>
        </div>
      </div>

      <!-- ===== Filters Bar ===== -->
      <div class="az-filters">
        <v-text-field v-model="searchText" prepend-inner-icon="mdi-magnify" placeholder="Search description, vendor, reference..." density="compact" variant="outlined" hide-details class="az-filters__search" />
        <v-select v-model="categoryFilter" :items="categoryList" density="compact" variant="outlined" hide-details label="Category" clearable class="az-filters__select" />
        <v-select v-model="methodFilter" :items="methodList" density="compact" variant="outlined" hide-details label="Payment Method" clearable class="az-filters__select" />
        <v-btn v-if="searchText || categoryFilter || methodFilter" variant="text" size="small" prepend-icon="mdi-filter-remove" @click="searchText = ''; categoryFilter = null; methodFilter = null">Clear</v-btn>
      </div>

      <!-- ===== Tabs ===== -->
      <div class="az-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="az-tab"
          :class="{ 'az-tab--active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <v-icon size="18" class="mr-1">{{ tab.icon }}</v-icon>
          {{ tab.label }}
          <span class="az-tab__badge">{{ tab.count }}</span>
        </button>
      </div>

      <!-- ===== All Expenses Tab ===== -->
      <div v-if="activeTab === 'all'" class="az-table-wrap">
        <table class="az-table">
          <thead>
            <tr>
              <th>Expense #</th>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Vendor</th>
              <th>Method</th>
              <th>Status</th>
              <th class="text-right">Amount</th>
              <th class="text-right">Cost</th>
              <th class="text-right">Retail</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in pagedItems" :key="e.id" class="az-table__row">
              <td class="text-medium-emphasis font-weight-medium">{{ e.expense_number }}</td>
              <td class="text-medium-emphasis">{{ formatDate(e.date) }}</td>
              <td class="az-table__product">{{ e.description || '—' }}</td>
              <td>
                <span class="az-cat-chip" :class="`az-cat-chip--${categoryChipClasses[catIndex(e.category)]}`">{{ e.category || 'Uncategorized' }}</span>
              </td>
              <td class="text-medium-emphasis">{{ e.vendor || '—' }}</td>
              <td class="text-medium-emphasis">
                <v-icon size="14" class="mr-1">{{ methodIcon(e.payment_method) }}</v-icon>
                {{ e.payment_method || 'cash' }}
              </td>
              <td>
                <span class="az-status-chip" :class="`az-status-chip--${statusClass(e.status)}`">{{ e.status || 'Unpaid' }}</span>
              </td>
              <td class="text-right font-weight-bold text-error">{{ formatMoney(e.amount) }}</td>
              <td class="text-right text-medium-emphasis">{{ formatMoney(e.cost_price) }}</td>
              <td class="text-right text-medium-emphasis">{{ formatMoney(e.retail_price) }}</td>
              <td>
                <div class="az-row-actions">
                  <v-btn size="small" :variant="e.status === 'Paid' ? 'flat' : 'tonal'" :color="e.status === 'Paid' ? 'success' : 'grey'" :prepend-icon="e.status === 'Paid' ? 'mdi-check-circle' : 'mdi-circle-outline'" @click="togglePaid(e)" :loading="togglingId === e.id">
                    <span class="d-none d-sm-inline">{{ e.status === 'Paid' ? 'Paid' : 'Mark Paid' }}</span>
                  </v-btn>
                  <v-btn size="small" variant="text" icon="mdi-pencil-outline" color="primary" :to="`/expenses/new?id=${e.id}`" />
                  <v-btn size="small" variant="text" icon="mdi-delete-outline" color="error" @click="deleteExpense(e)" />
                </div>
              </td>
            </tr>
            <tr v-if="!pagedItems.length">
              <td colspan="11" class="az-table__empty">
                <v-icon size="36" color="grey-lighten-1">mdi-receipt-text-outline</v-icon>
                <p class="text-body-2 mt-2 text-medium-emphasis">No expenses found.</p>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="filtered.length > itemsPerPage" class="az-pagination">
          <v-btn size="small" variant="text" prepend-icon="mdi-chevron-left" :disabled="page === 1" @click="page--">Prev</v-btn>
          <span class="az-pagination__info">Page {{ page }} of {{ totalPages }}</span>
          <v-btn size="small" variant="text" append-icon="mdi-chevron-right" :disabled="page === totalPages" @click="page++">Next</v-btn>
        </div>
      </div>

      <!-- ===== By Category Tab ===== -->
      <div v-if="activeTab === 'category'" class="az-table-wrap">
        <table class="az-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Category</th>
              <th class="text-right">Count</th>
              <th class="text-right">Total</th>
              <th class="text-right">Avg / Entry</th>
              <th class="text-right">% Share</th>
              <th>Distribution</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(c, idx) in categoryStats" :key="c.name" class="az-table__row">
              <td class="font-weight-bold">#{{ idx + 1 }}</td>
              <td class="az-table__product">
                <div class="az-cat-icon" :class="`az-cat-icon--${idx % 5}`">{{ (c.name || '?').charAt(0).toUpperCase() }}</div>
                {{ c.name || 'Uncategorized' }}
              </td>
              <td class="text-right">{{ c.count }}</td>
              <td class="text-right font-weight-bold text-error">{{ formatMoney(c.total) }}</td>
              <td class="text-right text-medium-emphasis">{{ formatMoney(c.avg) }}</td>
              <td class="text-right text-medium-emphasis">{{ c.pct.toFixed(1) }}%</td>
              <td>
                <div class="az-bar-wrap">
                  <div class="az-bar-fill az-bar-fill--error" :style="{ width: c.pct + '%' }"></div>
                </div>
              </td>
            </tr>
            <tr v-if="!categoryStats.length">
              <td colspan="7" class="az-table__empty">
                <v-icon size="36" color="grey-lighten-1">mdi-tag-off</v-icon>
                <p class="text-body-2 mt-2 text-medium-emphasis">No categories found.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ===== By Vendor Tab ===== -->
      <div v-if="activeTab === 'vendor'" class="az-table-wrap">
        <table class="az-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Vendor</th>
              <th class="text-right">Count</th>
              <th class="text-right">Total Paid</th>
              <th class="text-right">Avg / Entry</th>
              <th>Categories</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(v, idx) in vendorStats" :key="v.name" class="az-table__row">
              <td class="font-weight-bold">#{{ idx + 1 }}</td>
              <td class="az-table__product">
                <div class="az-cat-icon az-cat-icon--4">{{ (v.name || '?').charAt(0).toUpperCase() }}</div>
                {{ v.name || 'Unknown' }}
              </td>
              <td class="text-right">{{ v.count }}</td>
              <td class="text-right font-weight-bold text-error">{{ formatMoney(v.total) }}</td>
              <td class="text-right text-medium-emphasis">{{ formatMoney(v.avg) }}</td>
              <td class="text-medium-emphasis">{{ v.categories }}</td>
            </tr>
            <tr v-if="!vendorStats.length">
              <td colspan="6" class="az-table__empty">
                <v-icon size="36" color="grey-lighten-1">mdi-account-off</v-icon>
                <p class="text-body-2 mt-2 text-medium-emphasis">No vendor data.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ===== Recent Tab ===== -->
      <div v-if="activeTab === 'recent'" class="az-table-wrap">
        <table class="az-table">
          <thead>
            <tr>
              <th>Expense #</th>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Vendor</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in recentItems" :key="e.id" class="az-table__row">
              <td class="text-medium-emphasis font-weight-medium">{{ e.expense_number }}</td>
              <td class="text-medium-emphasis">{{ formatDate(e.date) }}</td>
              <td class="az-table__product">{{ e.description || '—' }}</td>
              <td>
                <span class="az-cat-chip" :class="`az-cat-chip--${categoryChipClasses[catIndex(e.category)]}`">{{ e.category || 'Uncategorized' }}</span>
              </td>
              <td class="text-medium-emphasis">{{ e.vendor || '—' }}</td>
              <td class="text-right font-weight-bold text-error">{{ formatMoney(e.amount) }}</td>
            </tr>
            <tr v-if="!recentItems.length">
              <td colspan="6" class="az-table__empty">
                <v-icon size="36" color="grey-lighten-1">mdi-clock-outline</v-icon>
                <p class="text-body-2 mt-2 text-medium-emphasis">No recent expenses.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ===== Create / Edit Dialog ===== -->
    <v-dialog v-model="formDialog" max-width="560">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold px-4 pt-4">{{ editing ? 'Edit Expense' : 'New Expense' }}</v-card-title>
        <v-card-text class="px-4">
          <v-text-field v-model="form.description" label="Description" density="compact" variant="outlined" class="mb-3" hide-details />
          <v-row>
            <v-col cols="6">
              <v-text-field v-model.number="form.amount" label="Amount" type="number" prefix="KSh" density="compact" variant="outlined" class="mb-3" hide-details />
            </v-col>
            <v-col cols="6">
              <v-combobox v-model="form.category" :items="categoryList" label="Category" density="compact" variant="outlined" class="mb-3" hide-details />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-text-field v-model.number="form.cost_price" label="Cost Price" type="number" prefix="KSh" density="compact" variant="outlined" class="mb-3" hide-details />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model.number="form.retail_price" label="Retail Price" type="number" prefix="KSh" density="compact" variant="outlined" class="mb-3" hide-details />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-text-field v-model="form.vendor" label="Vendor" density="compact" variant="outlined" class="mb-3" hide-details />
            </v-col>
            <v-col cols="6">
              <v-select v-model="form.payment_method" :items="methodList" label="Payment Method" density="compact" variant="outlined" class="mb-3" hide-details />
            </v-col>
          </v-row>
          <v-text-field v-model="form.date" label="Date" type="date" density="compact" variant="outlined" class="mb-3" hide-details />
          <v-text-field v-model="form.reference" label="Reference (optional)" density="compact" variant="outlined" hide-details />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="formDialog = false">Cancel</v-btn>
          <v-btn variant="flat" color="primary" @click="saveExpense" :loading="saving" prepend-icon="mdi-check">{{ editing ? 'Update' : 'Record' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== Custom Date Range Dialog ===== -->
    <v-dialog v-model="customRangeDialog" max-width="480">
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center ga-2">
          <v-icon color="primary" size="24">mdi-calendar-clock</v-icon>
          Custom Date Range
        </v-card-title>
        <v-card-text>
          <p class="text-body-2 text-medium-emphasis mb-4">Select a start and end date to filter expenses within a custom range.</p>
          <div class="d-flex flex-column ga-4">
            <v-text-field
              v-model="customRange.from"
              type="date"
              label="From date"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="mdi-calendar-start"
            />
            <v-text-field
              v-model="customRange.to"
              type="date"
              label="To date"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="mdi-calendar-end"
              :min="customRange.from"
            />
          </div>
          <div v-if="customRange.from && customRange.to" class="d-flex align-center ga-2 mt-3">
            <v-icon size="16" color="info">mdi-information-outline</v-icon>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ customRangeDays }} day{{ customRangeDays === 1 ? '' : 's' }} selected
            </p>
          </div>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="customRangeDialog = false">Cancel</v-btn>
          <v-btn variant="flat" color="primary" prepend-icon="mdi-check" :disabled="!customRange.from || !customRange.to" @click="applyCustomRange">Apply</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
const { currency } = useFormat()
const { success, error: errorToast } = useToast()

function formatMoney(v) { return currency(Number(v) || 0) }
function formatDate(v) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ===== Category color mapping =====
const categoryColors = [
  '#3478f6', '#10b981', '#f59e0b', '#f43f5e', '#7C4DFF',
  '#00B8D4', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
]
const categoryChipClasses = ['blue', 'green', 'amber', 'rose', 'purple', 'teal', 'indigo', 'pink', 'mint', 'orange']
function catIndex(name) {
  if (!name) return 0
  let h = 0
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0
  return Math.abs(h) % categoryChipClasses.length
}

// ===== Payment method icons =====
function methodIcon(m) {
  const icons = { cash: 'mdi-cash', mpesa: 'mdi-cellphone', card: 'mdi-credit-card', bank_transfer: 'mdi-bank', cheque: 'mdi-file-document-outline' }
  return icons[m] || 'mdi-cash'
}

function statusClass(s) {
  const map = { 'Unpaid': 'unpaid', 'Pending Approval': 'pending', 'Approved': 'approved', 'Paid': 'paid', 'Cancelled': 'cancelled' }
  return map[s] || 'unpaid'
}

// ===== State =====
const periodOptions = [
  { label: 'Today', value: 'today', short: 'Today' },
  { label: 'Last 7 days', value: '7d', short: '7D' },
  { label: 'Last 30 days', value: '30d', short: '30D' },
  { label: 'This month', value: 'thisMonth', short: 'Month' },
  { label: 'Last 90 days', value: '90d', short: '90D' },
]
const period = ref('30d')
const customRange = ref({ from: '', to: '' })
const customRangeDialog = ref(false)
const loading = ref(false)
const saving = ref(false)
const togglingId = ref(null)
const expenses = ref([])
const activeTab = ref('all')
const searchText = ref('')
const categoryFilter = ref(null)
const methodFilter = ref(null)
const formDialog = ref(false)
const editing = ref(false)
const editingId = ref(null)
const page = ref(1)
const itemsPerPage = 15

const defaultCategories = ['Rent', 'Utilities', 'Salaries', 'Supplies', 'Marketing', 'Transport', 'Maintenance', 'Miscellaneous', 'Insurance', 'Legal', 'Equipment']
const methodList = ['cash', 'mpesa', 'card', 'bank_transfer', 'cheque']

// Custom categories (persisted in localStorage, managed on /expenses/categories)
const customCategories = ref([])

function loadCustomCategories() {
  try {
    const stored = localStorage.getItem('expense_custom_categories')
    if (stored) customCategories.value = JSON.parse(stored)
  } catch {}
}

const form = ref({ description: '', amount: 0, cost_price: 0, retail_price: 0, category: 'Miscellaneous', date: new Date().toISOString().slice(0, 10), payment_method: 'cash', vendor: '', reference: '' })

function resolveRange(key) {
  const now = new Date(); const end = new Date(now); end.setHours(23, 59, 59, 999)
  const start = new Date(now); start.setHours(0, 0, 0, 0)
  if (key === 'today') return [start, end]
  if (key === '7d') { start.setDate(start.getDate() - 7); return [start, end] }
  if (key === '30d') { start.setDate(start.getDate() - 30); return [start, end] }
  if (key === '90d') { start.setDate(start.getDate() - 90); return [start, end] }
  if (key === 'thisMonth') { start.setDate(1); return [start, end] }
  if (key === 'custom' && customRange.value.from && customRange.value.to) {
    const s = new Date(customRange.value.from + 'T00:00:00')
    const e = new Date(customRange.value.to + 'T23:59:59.999')
    return [s, e]
  }
  return [new Date(2020, 0, 1), end]
}

function selectPeriod(val) {
  if (val === 'custom') {
    openCustomRange()
  } else {
    period.value = val
  }
}

function openCustomRange() {
  if (!customRange.value.from) {
    const now = new Date()
    const from = new Date(now); from.setDate(from.getDate() - 30)
    customRange.value.from = from.toISOString().slice(0, 10)
    customRange.value.to = now.toISOString().slice(0, 10)
  }
  customRangeDialog.value = true
}

function applyCustomRange() {
  if (customRange.value.from && customRange.value.to) {
    period.value = 'custom'
    customRangeDialog.value = false
  }
}

const customRangeDays = computed(() => {
  if (!customRange.value.from || !customRange.value.to) return 0
  const ms = new Date(customRange.value.to) - new Date(customRange.value.from)
  return Math.max(0, Math.round(ms / 86400000) + 1)
})

// ===== Computed: in-range expenses =====
const inRange = computed(() => {
  const [start, end] = resolveRange(period.value)
  return expenses.value.filter(e => {
    // Use date-only string to avoid timezone shifts
    const d = new Date((e.date || '').slice(0, 10) + 'T00:00:00')
    return d >= start && d <= end
  })
})

// ===== Computed: filtered items =====
const filtered = computed(() => {
  let list = inRange.value
  if (searchText.value) {
    const s = searchText.value.toLowerCase()
    list = list.filter(e =>
      e.description?.toLowerCase().includes(s) ||
      e.vendor?.toLowerCase().includes(s) ||
      e.expense_number?.toLowerCase().includes(s)
    )
  }
  if (categoryFilter.value) list = list.filter(e => e.category === categoryFilter.value)
  if (methodFilter.value) list = list.filter(e => e.payment_method === methodFilter.value)
  // Sort by date descending (most recent first)
  return list.slice().sort((a, b) => new Date((b.date || '').slice(0,10)) - new Date((a.date || '').slice(0,10)))
})

// ===== Computed: category list (from data + defaults) =====
const categoryList = computed(() => {
  const fromData = [...new Set(expenses.value.map(e => e.category).filter(Boolean))]
  const all = [...new Set([...defaultCategories, ...customCategories.value, ...fromData])]
  return all.sort()
})

// ===== Pagination =====
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / itemsPerPage)))
const pagedItems = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return filtered.value.slice(start, start + itemsPerPage)
})
const recentItems = computed(() => inRange.value.slice().sort((a, b) => new Date((b.date || '').slice(0,10)) - new Date((a.date || '').slice(0,10))).slice(0, 10))

// ===== KPIs =====
const kpis = computed(() => {
  const items = inRange.value
  const total = items.reduce((s, e) => s + Number(e.amount), 0)
  const count = items.length

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonth = expenses.value.filter(e => new Date((e.date || '').slice(0,10) + 'T00:00:00') >= monthStart).reduce((s, e) => s + Number(e.amount), 0)

  const [ps, pe] = resolveRange(period.value)
  const days = Math.ceil((pe - ps) / 86400000) || 1
  const dailyAvg = total / days

  // category map
  const catMap = {}
  items.forEach(e => { const c = e.category || 'Uncategorized'; catMap[c] = (catMap[c] || 0) + Number(e.amount) })
  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1])
  const topCategory = catEntries[0]?.[0] || ''
  const topCategoryPct = total > 0 ? ((catEntries[0]?.[1] || 0) / total * 100) : 0
  const categoryCount = Object.keys(catMap).length

  // vendor count
  const vendorSet = new Set(items.map(e => e.vendor).filter(Boolean))
  const vendorCount = vendorSet.size

  // largest single expense
  const largestEntry = items.slice().sort((a, b) => Number(b.amount) - Number(a.amount))[0]
  const largest = largestEntry ? Number(largestEntry.amount) : 0
  const largestCat = largestEntry?.category || ''

  // change vs previous period
  const [start] = resolveRange(period.value)
  const prevEnd = new Date(start); prevEnd.setSeconds(prevEnd.getSeconds() - 1)
  const prevStart = new Date(prevEnd)
  const rangeDays = Math.ceil((pe - ps) / 86400000) || 1
  prevStart.setDate(prevStart.getDate() - rangeDays)
  const prevTotal = expenses.value.filter(e => { const d = new Date((e.date || '').slice(0,10) + 'T00:00:00'); return d >= prevStart && d <= prevEnd }).reduce((s, e) => s + Number(e.amount), 0)
  const change = prevTotal > 0 ? ((total - prevTotal) / prevTotal * 100) : (total > 0 ? 100 : 0)

  return { total, count, thisMonth, dailyAvg, topCategory, topCategoryPct, categoryCount, vendorCount, largest, largestCat, change }
})

// ===== Category stats (for tab) =====
const categoryStats = computed(() => {
  const items = inRange.value
  const map = {}
  items.forEach(e => {
    const c = e.category || 'Uncategorized'
    if (!map[c]) map[c] = { name: c, count: 0, total: 0 }
    map[c].count++
    map[c].total += Number(e.amount)
  })
  const total = items.reduce((s, e) => s + Number(e.amount), 0)
  return Object.values(map).map(c => ({ ...c, avg: c.total / c.count, pct: total > 0 ? (c.total / total * 100) : 0 })).sort((a, b) => b.total - a.total)
})

// ===== Vendor stats (for tab) =====
const vendorStats = computed(() => {
  const items = inRange.value
  const map = {}
  items.forEach(e => {
    const v = e.vendor || 'Unknown'
    if (!map[v]) map[v] = { name: v, count: 0, total: 0, cats: new Set() }
    map[v].count++
    map[v].total += Number(e.amount)
    if (e.category) map[v].cats.add(e.category)
  })
  return Object.values(map).map(v => ({ name: v.name, count: v.count, total: v.total, avg: v.total / v.count, categories: Array.from(v.cats).join(', ') })).sort((a, b) => b.total - a.total)
})

// ===== Tabs =====
const tabs = computed(() => [
  { id: 'all', label: 'All Expenses', icon: 'mdi-receipt-text-outline', count: filtered.value.length },
  { id: 'category', label: 'By Category', icon: 'mdi-tag-multiple', count: categoryStats.value.length },
  { id: 'vendor', label: 'By Vendor', icon: 'mdi-account-group', count: vendorStats.value.length },
  { id: 'recent', label: 'Recent', icon: 'mdi-clock-outline', count: recentItems.value.length },
])

// ===== Charts: Trend (area chart) =====
function localDateKey(d) {
  const dt = d instanceof Date ? d : new Date(d)
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const trendData = computed(() => {
  const [start, end] = resolveRange(period.value)
  const days = Math.min(Math.ceil((end - start) / 86400000), 90)
  const buckets = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(start); d.setDate(d.getDate() + i)
    const key = localDateKey(d)
    buckets[key] = 0
  }
  inRange.value.forEach(e => {
    const key = (e.date || '').slice(0, 10)
    if (key in buckets) buckets[key] += Number(e.amount)
  })
  const keys = Object.keys(buckets).sort()
  return { keys, data: keys.map(k => Math.round(buckets[k])) }
})

const trendSeries = computed(() => [{ name: 'Expenses', data: trendData.value.data }])
const trendOptions = computed(() => ({
  chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit' },
  colors: ['#f43f5e'],
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 100] } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: trendData.value.keys.map(k => new Date(k).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })),
    labels: { style: { fontSize: '11px' }, rotate: 0, hideOverlappingLabels: true },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: { decimalsInFloat: 0, labels: { formatter: (v) => Math.round(Number(v)).toLocaleString('en-GB'), style: { fontSize: '11px' } } },
  grid: { borderColor: 'rgba(127,127,127,0.1)', strokeDashArray: 4, padding: { left: 0, right: 0 } },
  tooltip: { y: { formatter: (v) => 'KSh' + v.toLocaleString('en-GB') } },
  legend: { show: false },
}))

// ===== Charts: Category Donut =====
const catDonutSeries = computed(() => categoryStats.value.map(c => Math.round(c.total)))
const catDonutOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'inherit' },
  labels: categoryStats.value.map(c => c.name),
  colors: categoryStats.value.slice(0, 10).map((c) => categoryColors[catIndex(c.name) % categoryColors.length]),
  legend: { position: 'bottom', fontSize: '12px', markers: { size: 6 } },
  dataLabels: { enabled: true, formatter: (val) => Math.round(val) + '%' },
  stroke: { width: 0 },
  plotOptions: {
    pie: {
      donut: {
        size: '68%',
        labels: {
          show: true,
          name: { fontSize: '14px', fontWeight: 600 },
          total: { show: true, label: 'Total', fontSize: '14px', fontWeight: 700, formatter: () => 'KSh' + Math.round(catDonutSeries.value.reduce((s, v) => s + v, 0)).toLocaleString('en-GB') },
        },
      },
    },
  },
  tooltip: { y: { formatter: (v) => 'KSh' + v.toLocaleString('en-GB') } },
  responsive: [{ breakpoint: 480, options: { legend: { position: 'bottom' } } }],
}))

// ===== Charts: Category Bar =====
const catBarSeries = computed(() => [{ name: 'Amount', data: categoryStats.value.map(c => Math.round(c.total)) }])
const catBarOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
  colors: ['#F59E0B'],
  plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
  dataLabels: { enabled: false },
  xaxis: { categories: categoryStats.value.map(c => c.name), labels: { style: { fontSize: '11px' }, rotate: -15 } },
  yaxis: { decimalsInFloat: 0, labels: { formatter: (v) => Math.round(Number(v)).toLocaleString('en-GB'), style: { fontSize: '11px' } } },
  grid: { borderColor: 'rgba(127,127,127,0.1)', strokeDashArray: 4 },
  tooltip: { y: { formatter: (v) => 'KSh' + v.toLocaleString('en-GB') } },
}))

// ===== Charts: Payment Method Bar =====
const methodBarData = computed(() => {
  const map = {}
  inRange.value.forEach(e => { const m = e.payment_method || 'cash'; map[m] = (map[m] || 0) + Number(e.amount) })
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1])
  return entries
})
const methodBarSeries = computed(() => [{ name: 'Amount', data: methodBarData.value.map(([, v]) => Math.round(v)) }])
const methodBarOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
  colors: ['#10b981'],
  plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
  dataLabels: { enabled: false },
  xaxis: { categories: methodBarData.value.map(([k]) => k), labels: { style: { fontSize: '11px' } } },
  yaxis: { decimalsInFloat: 0, labels: { formatter: (v) => Math.round(Number(v)).toLocaleString('en-GB'), style: { fontSize: '11px' } } },
  grid: { borderColor: 'rgba(127,127,127,0.1)', strokeDashArray: 4 },
  tooltip: { y: { formatter: (v) => 'KSh' + v.toLocaleString('en-GB') } },
}))

// ===== Data =====
async function loadData() {
  loading.value = true
  try {
    const data = await useApi()('/accounting/expenses/?page_size=500')
    expenses.value = data.results || data
  } catch { /* ignore */ } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = false
  editingId.value = null
  form.value = { description: '', amount: 0, cost_price: 0, retail_price: 0, category: 'Miscellaneous', date: new Date().toISOString().slice(0, 10), payment_method: 'cash', vendor: '', reference: '' }
  formDialog.value = true
}

function openEdit(e) {
  editing.value = true
  editingId.value = e.id
  form.value = { description: e.description || '', amount: Number(e.amount) || 0, cost_price: Number(e.cost_price) || 0, retail_price: Number(e.retail_price) || 0, category: e.category || 'Miscellaneous', date: (e.date || new Date().toISOString()).slice(0, 10), payment_method: e.payment_method || 'cash', vendor: e.vendor || '', reference: e.reference || '' }
  formDialog.value = true
}

async function saveExpense() {
  saving.value = true
  try {
    if (editing.value) {
      await useApi()(`/accounting/expenses/${editingId.value}/`, { method: 'PATCH', body: form.value })
      success('Expense updated successfully')
    } else {
      await useApi()('/accounting/expenses/', { method: 'POST', body: form.value })
      success('Expense recorded successfully')
    }
    formDialog.value = false
    await loadData()
  } catch {
    errorToast(editing.value ? 'Failed to update expense' : 'Failed to record expense')
  } finally {
    saving.value = false
  }
}

async function deleteExpense(exp) {
  if (!confirm(`Delete expense "${exp.description || exp.expense_number}"?`)) return
  try {
    await useApi()(`/accounting/expenses/${exp.id}/`, { method: 'DELETE' })
    success('Expense deleted')
    await loadData()
  } catch {
    errorToast('Failed to delete expense')
  }
}

async function togglePaid(exp) {
  const newStatus = exp.status === 'Paid' ? 'Unpaid' : 'Paid'
  togglingId.value = exp.id
  try {
    const action = newStatus === 'Paid' ? 'mark_paid' : 'mark_unpaid'
    const data = await useApi()(`/accounting/expenses/${exp.id}/${action}/`, { method: 'POST' })
    const idx = expenses.value.findIndex(e => e.id === exp.id)
    if (idx !== -1) expenses.value[idx] = { ...expenses.value[idx], ...data }
    success(`Expense marked as ${newStatus}`)
  } catch {
    errorToast(`Failed to mark expense as ${newStatus}`)
  } finally {
    togglingId.value = null
  }
}

// Reset page when filters change
watch([searchText, categoryFilter, methodFilter, activeTab], () => { page.value = 1 })

onMounted(() => {
  loadCustomCategories()
  loadData()
})
</script>

<style scoped>
/* ===== Page wrapper ===== */
.az-page {
  padding: 20px 24px;
  max-width: 1600px;
  margin: 0 auto;
  font-family: "Segoe UI Variable", Inter, system-ui, sans-serif;
}

/* ===== Header ===== */
.az-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.az-header__left { display: flex; flex-direction: column; gap: 4px; }
.az-header__title h1 { letter-spacing: -0.02em; line-height: 1.2; }
.az-header__actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

/* ===== Loading ===== */
.az-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

/* ===== KPI Grid ===== */
.az-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
.az-kpi {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: box-shadow 0.2s, transform 0.2s;
  overflow: hidden;
  position: relative;
}
.az-kpi::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  border-radius: 0 3px 3px 0;
}
.az-kpi:hover { box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06); transform: translateY(-1px); }
.az-kpi__icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.az-kpi__icon--success { background: rgba(76, 175, 80, 0.12); color: rgb(76, 175, 80); }
.az-kpi__icon--error   { background: rgba(239, 68, 68, 0.12); color: rgb(239, 68, 68); }
.az-kpi__icon--warning { background: rgba(255, 152, 0, 0.12); color: rgb(255, 152, 0); }
.az-kpi__icon--info    { background: rgba(33, 150, 243, 0.12); color: rgb(33, 150, 243); }
.az-kpi__icon--primary { background: rgba(52, 120, 246, 0.12); color: #3478f6; }
.az-kpi__icon--teal    { background: rgba(0, 184, 212, 0.12); color: #00B8D4; }
.az-kpi__icon--purple  { background: rgba(124, 77, 255, 0.12); color: #7C4DFF; }
.az-kpi__body { min-width: 0; overflow: hidden; flex: 1 1 0; }
.az-kpi__label { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.5); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.az-kpi__value { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.02em; margin-top: 2px; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.az-kpi__sub { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.4); margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ===== KPI accent bars ===== */
.az-kpi--primary::before { background: #3478f6; }
.az-kpi--success::before { background: rgb(76, 175, 80); }
.az-kpi--warning::before { background: rgb(255, 152, 0); }
.az-kpi--error::before   { background: rgb(239, 68, 68); }
.az-kpi--info::before    { background: rgb(33, 150, 243); }
.az-kpi--purple::before  { background: #7C4DFF; }
.az-kpi--teal::before    { background: #00B8D4; }

/* ===== Chart rows ===== */
.az-chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}
.az-chart-row--first { grid-template-columns: 2fr 1fr; }
@media (max-width: 1100px) {
  .az-chart-row, .az-chart-row--first { grid-template-columns: 1fr; }
}

/* ===== Card ===== */
.az-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 14px;
  overflow: hidden;
}
.az-card--half { min-height: 400px; }
.az-card--two-thirds { min-height: 400px; }
.az-card--third { min-height: 400px; }
.az-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.az-card__header-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.az-card__header-icon--blue   { background: rgba(52, 120, 246, 0.12); color: #3478f6; }
.az-card__header-icon--green   { background: rgba(76, 175, 80, 0.12); color: rgb(76, 175, 80); }
.az-card__header-icon--indigo  { background: rgba(99, 102, 241, 0.12); color: rgb(99, 102, 241); }
.az-card__header-icon--amber   { background: rgba(245, 158, 11, 0.12); color: rgba(245, 158, 11); }
.az-card__header-icon--teal    { background: rgba(0, 184, 212, 0.12); color: #00B8D4; }
.az-card__header-icon--rose    { background: rgba(244, 63, 94, 0.12); color: #f43f5e; }
.az-card__title { font-size: 0.9375rem; font-weight: 700; letter-spacing: -0.01em; }
.az-card__subtitle { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.4); margin-top: 1px; }
.az-card__body { padding: 14px 20px 20px; }

/* ===== Filters ===== */
.az-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}
.az-filters__search { flex: 1 1 280px; min-width: 200px; }
.az-filters__select { max-width: 200px; }

/* ===== Tabs ===== */
.az-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.az-tab {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgb(var(--v-theme-surface));
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.55);
  cursor: pointer;
  transition: all 0.15s;
}
.az-tab:hover { background: rgba(var(--v-theme-on-surface), 0.04); }
.az-tab--active {
  background: rgba(52, 120, 246, 0.08);
  border-color: rgba(52, 120, 246, 0.25);
  color: #3478f6;
}
.az-tab__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px; height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: rgba(var(--v-theme-on-surface), 0.08);
  font-size: 0.6875rem;
  font-weight: 700;
}
.az-tab--active .az-tab__badge {
  background: rgba(52, 120, 246, 0.15);
  color: #3478f6;
}

/* ===== Tables ===== */
.az-table-wrap {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 14px;
  overflow-x: auto;
}
.az-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}
.az-table thead tr { background: rgba(var(--v-theme-on-surface), 0.02); }
.az-table th {
  text-align: left;
  padding: 11px 16px;
  font-weight: 700;
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(var(--v-theme-on-surface), 0.5);
  white-space: nowrap;
}
.az-table th.text-right, .az-table td.text-right { text-align: right; }
.az-table tbody tr { border-top: 1px solid rgba(var(--v-theme-on-surface), 0.04); }
.az-table__row { transition: background 0.12s; }
.az-table__row:hover { background: rgba(52, 120, 246, 0.02); }
.az-table td { padding: 11px 16px; white-space: nowrap; }
.az-table__product { font-weight: 600; display: flex; align-items: center; gap: 10px; }
.az-table__empty { text-align: center; padding: 40px 16px; color: rgba(var(--v-theme-on-surface), 0.4); }

/* ===== Category icon ===== */
.az-cat-icon {
  width: 28px; height: 28px;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800;
  font-size: 0.75rem;
  color: #fff;
  flex-shrink: 0;
}
.az-cat-icon--0 { background: linear-gradient(135deg, #3478f6, #1e40af); }
.az-cat-icon--1 { background: linear-gradient(135deg, #10b981, #047857); }
.az-cat-icon--2 { background: linear-gradient(135deg, #f59e0b, #d97706); }
.az-cat-icon--3 { background: linear-gradient(135deg, #f43f5e, #be123c); }
.az-cat-icon--4 { background: linear-gradient(135deg, #7C4DFF, #6200EA); }

/* ===== Category chip ===== */
.az-cat-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}
.az-cat-chip--blue { background: rgba(52, 120, 246, 0.12); color: #3478f6; }
.az-cat-chip--green { background: rgba(16, 185, 129, 0.12); color: rgb(16, 185, 129); }
.az-cat-chip--amber { background: rgba(245, 158, 11, 0.12); color: rgb(245, 158, 11); }
.az-cat-chip--rose { background: rgba(244, 63, 94, 0.12); color: #f43f5e; }
.az-cat-chip--purple { background: rgba(124, 77, 255, 0.12); color: #7C4DFF; }
.az-cat-chip--teal { background: rgba(0, 184, 212, 0.12); color: #00B8D4; }
.az-cat-chip--indigo { background: rgba(99, 102, 241, 0.12); color: rgb(99, 102, 241); }
.az-cat-chip--pink { background: rgba(236, 72, 153, 0.12); color: rgb(236, 72, 153); }
.az-cat-chip--mint { background: rgba(20, 184, 166, 0.12); color: rgb(20, 184, 166); }
.az-cat-chip--orange { background: rgba(249, 115, 22, 0.12); color: rgb(249, 115, 22); }

/* ===== Status chips ===== */
.az-status-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}
.az-status-chip--unpaid    { background: rgba(107, 114, 128, 0.12); color: rgb(75, 85, 99); }
.az-status-chip--pending  { background: rgba(245, 158, 11, 0.12); color: rgb(217, 119, 6); }
.az-status-chip--approved { background: rgba(59, 130, 246, 0.12); color: #3478f6; }
.az-status-chip--paid     { background: rgba(34, 197, 94, 0.12); color: rgb(22, 163, 74); }
.az-status-chip--cancelled { background: rgba(239, 68, 68, 0.12); color: rgb(239, 68, 68); }

/* ===== Bar (share%) ===== */
.az-bar-wrap {
  width: 100px;
  height: 6px;
  border-radius: 3px;
  background: rgba(var(--v-theme-on-surface), 0.06);
  overflow: hidden;
}
.az-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}
.az-bar-fill--error { background: linear-gradient(90deg, #f87171, #ef4444); }

/* ===== Row Actions ===== */
.az-row-actions {
  display: flex;
  gap: 2px;
}

/* ===== Pagination ===== */
.az-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.az-pagination__info {
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  font-weight: 500;
}

/* ===== Mobile ===== */
@media (max-width: 768px) {
  .az-page { padding: 12px; }
  .az-kpi-grid { grid-template-columns: 1fr 1fr; }
  .az-filters { flex-direction: column; }
  .az-filters__search, .az-filters__select { max-width: 100%; }
}

/* ===== Category Management ===== */
.az-cat-manage {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 14px;
  padding: 20px;
}
.az-cat-manage__add {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 4px;
}
.az-cat-manage__input { flex: 1; min-width: 200px; }
.az-cat-manage__hint { margin-top: 8px; }
.az-cat-manage__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
}
.az-cat-manage__card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 10px;
  transition: border-color 0.15s;
}
.az-cat-manage__card:hover { border-color: rgba(52, 120, 246, 0.25); }
.az-cat-manage__card-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
.az-cat-manage__card-info { min-width: 0; }
.az-cat-manage__card-name { font-weight: 600; font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.az-cat-manage__card-meta { display: flex; gap: 4px; margin-top: 4px; flex-wrap: wrap; }
.az-cat-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 600;
}
.az-cat-badge--default { background: rgba(100, 116, 139, 0.12); color: rgb(100, 116, 139); }
.az-cat-badge--custom { background: rgba(52, 120, 246, 0.12); color: #3478f6; }
.az-cat-badge--count { background: rgba(var(--v-theme-on-surface), 0.06); color: rgba(var(--v-theme-on-surface), 0.5); }
</style>

<template>
  <div class="az-page">
    <!-- ===== Header ===== -->
    <div class="az-header">
      <div class="az-header__left">
        <div class="az-header__title-icon az-header__title-icon--primary">
          <v-icon size="22">mdi-credit-card-clock-outline</v-icon>
        </div>
        <div>
          <h1 class="text-h5 font-weight-bold">Customer Credit Accounts</h1>
          <p class="text-body-2 text-medium-emphasis">Track, collect and manage customer credit balances</p>
        </div>
      </div>
      <div class="az-header__actions">
        <v-btn variant="tonal" prepend-icon="mdi-refresh" size="small" @click="loadData" :loading="loading">Refresh</v-btn>
        <v-btn variant="outlined" prepend-icon="mdi-download" size="small" @click="exportCSV">Export</v-btn>
        <v-btn variant="flat" color="primary" prepend-icon="mdi-cash-plus" size="small" @click="openPayment(null)">Record Payment</v-btn>
      </div>
    </div>

    <!-- ===== Loading ===== -->
    <div v-if="loading && credits.length === 0" class="az-loading">
      <v-progress-circular indeterminate color="primary" size="32" width="3" />
      <p class="text-body-2 text-medium-emphasis mt-3">Loading credit accounts…</p>
    </div>

    <template v-else>
      <!-- ===== KPI Row ===== -->
      <div class="az-kpi-grid">
        <div class="az-kpi az-kpi--error">
          <div class="az-kpi__icon az-kpi__icon--error"><v-icon size="20">mdi-cash-remove</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Total Outstanding</p>
            <p class="az-kpi__value text-error">{{ formatMoney(kpis.outstanding) }}</p>
            <p class="az-kpi__sub">{{ kpis.openCount }} open accounts</p>
          </div>
        </div>
        <div class="az-kpi az-kpi--success">
          <div class="az-kpi__icon az-kpi__icon--success"><v-icon size="20">mdi-cash-check</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Total Collected</p>
            <p class="az-kpi__value text-success">{{ formatMoney(kpis.collected) }}</p>
            <p class="az-kpi__sub">{{ kpis.settledCount }} settled accounts</p>
          </div>
        </div>
        <div class="az-kpi az-kpi--info">
          <div class="az-kpi__icon az-kpi__icon--info"><v-icon size="20">mdi-credit-card-multiple</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Total Credit Extended</p>
            <p class="az-kpi__value text-info">{{ formatMoney(kpis.totalCredit) }}</p>
            <p class="az-kpi__sub">{{ kpis.totalCount }} transactions</p>
          </div>
        </div>
        <div class="az-kpi az-kpi--warning">
          <div class="az-kpi__icon az-kpi__icon--warning"><v-icon size="20">mdi-alert-circle-outline</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Overdue</p>
            <p class="az-kpi__value text-warning">{{ formatMoney(kpis.overdueAmount) }}</p>
            <p class="az-kpi__sub">{{ kpis.overdueCount }} accounts overdue</p>
          </div>
        </div>
        <div class="az-kpi az-kpi--purple">
          <div class="az-kpi__icon az-kpi__icon--purple"><v-icon size="20">mdi-chart-pie</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Collection Rate</p>
            <p class="az-kpi__value" style="color: #7C4DFF">{{ kpis.collectionRate }}%</p>
            <p class="az-kpi__sub">{{ kpis.partialCount }} partial payments</p>
          </div>
        </div>
        <div class="az-kpi az-kpi--teal">
          <div class="az-kpi__icon az-kpi__icon--teal"><v-icon size="20">mdi-calendar-alert</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Avg Days to Collect</p>
            <p class="az-kpi__value" style="color: #00B8D4">{{ kpis.avgDays }}</p>
            <p class="az-kpi__sub">across settled accounts</p>
          </div>
        </div>
      </div>

      <!-- ===== Filters Bar ===== -->
      <div v-if="activeTab !== 'viz'" class="az-filters">
        <v-text-field v-model="searchText" prepend-inner-icon="mdi-magnify" placeholder="Search customer, phone, transaction #..." density="compact" variant="outlined" hide-details class="az-filters__search" />
        <v-select v-model="statusFilter" :items="['open','partial','settled','overdue']" density="compact" variant="outlined" hide-details label="Status" clearable class="az-filters__select" />
        <v-btn v-if="searchText || statusFilter" variant="text" size="small" prepend-icon="mdi-filter-remove" @click="searchText = ''; statusFilter = null">Clear</v-btn>
      </div>

      <!-- ===== Tabs ===== -->
      <div class="az-tabs">
        <button v-for="tab in tabs" :key="tab.id" class="az-tab" :class="{ 'az-tab--active': activeTab === tab.id }" @click="activeTab = tab.id">
          <v-icon size="18" class="mr-1">{{ tab.icon }}</v-icon>
          {{ tab.label }}
          <span v-if="tab.count !== null && tab.count !== undefined" class="az-tab__badge">{{ tab.count }}</span>
        </button>
      </div>

      <!-- ===== Data Visualization Tab ===== -->
      <template v-if="activeTab === 'viz'">
        <!-- Charts Row: Outstanding trend + Status donut -->
        <div class="az-chart-row az-chart-row--first">
          <div class="az-card az-card--two-thirds">
            <div class="az-card__header">
              <div class="az-card__header-icon az-card__header-icon--blue"><v-icon size="20">mdi-chart-line</v-icon></div>
              <div>
                <h3 class="az-card__title">Credit Outstanding Trend</h3>
                <p class="az-card__subtitle">Outstanding balance over time</p>
              </div>
            </div>
            <div class="az-card__body">
              <apexchart type="area" height="300" :options="trendOptions" :series="trendSeries" />
            </div>
          </div>
          <div class="az-card az-card--third">
            <div class="az-card__header">
              <div class="az-card__header-icon az-card__header-icon--rose"><v-icon size="20">mdi-chart-donut</v-icon></div>
              <div>
                <h3 class="az-card__title">By Status</h3>
                <p class="az-card__subtitle">Distribution of credit accounts</p>
              </div>
            </div>
            <div class="az-card__body">
              <apexchart type="donut" height="300" :options="statusDonutOptions" :series="statusDonutSeries" />
            </div>
          </div>
        </div>

        <!-- Aging Analysis -->
        <div class="az-aging-wrap">
          <div class="az-aging-title">
            <v-icon size="18" color="primary">mdi-timer-sand</v-icon>
            <span>Receivables Aging Analysis</span>
          </div>
          <div class="az-aging-grid">
            <div class="az-aging-bucket" v-for="b in agingBuckets" :key="b.label">
              <div class="az-aging-bucket__bar" :style="{ background: b.color }"></div>
              <div class="az-aging-bucket__body">
                <p class="az-aging-bucket__label">{{ b.label }}</p>
                <p class="az-aging-bucket__value" :style="{ color: b.color }">{{ formatMoney(b.amount) }}</p>
                <p class="az-aging-bucket__count">{{ b.count }} accounts</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Debtors -->
        <div v-if="topDebtors.length > 0" class="az-debtors-section">
          <div class="az-debtors-title">
            <v-icon size="18" color="error">mdi-account-alert-outline</v-icon>
            <span>Top Debtors</span>
          </div>
          <div class="az-debtors-grid">
            <div v-for="(d, i) in topDebtors" :key="d.id" class="az-debtor-card">
              <div class="az-debtor-rank">#{{ i + 1 }}</div>
              <div class="az-avatar az-avatar--error">{{ initials(d.customer_name) }}</div>
              <div class="az-debtor-info">
                <p class="az-debtor-name">{{ d.customer_name }}</p>
                <p class="az-debtor-sub">{{ d.customer_phone || 'No phone' }}</p>
              </div>
              <div class="az-debtor-amount">
                <p class="font-weight-bold text-error">{{ formatMoney(d.balance) }}</p>
                <p class="text-caption text-medium-emphasis">{{ d.status_display || d.status }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ===== Credits Table ===== -->
      <template v-else>
      <div class="az-table-wrap">
        <table class="az-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Transaction #</th>
              <th>Date</th>
              <th class="text-right">Total</th>
              <th class="text-right">Paid</th>
              <th class="text-right">Balance</th>
              <th>Progress</th>
              <th>Due Date</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in pagedItems" :key="c.id" class="az-table__row">
              <td>
                <div class="az-customer-cell">
                  <div class="az-avatar" :class="`az-avatar--${avatarColor(c.customer_name)}`">{{ initials(c.customer_name) }}</div>
                  <div>
                    <div class="font-weight-medium">{{ c.customer_name }}</div>
                    <div class="text-caption text-medium-emphasis" v-if="c.customer_phone"><v-icon size="12">mdi-phone</v-icon> {{ c.customer_phone }}</div>
                  </div>
                </div>
              </td>
              <td class="text-medium-emphasis font-weight-medium">{{ c.transaction_number || '—' }}</td>
              <td class="text-medium-emphasis">{{ formatDate(c.created_at) }}</td>
              <td class="text-right font-weight-medium">{{ formatMoney(c.total_amount) }}</td>
              <td class="text-right text-success">{{ formatMoney(c.amount_paid) }}</td>
              <td class="text-right font-weight-bold" :class="Number(c.balance) > 0 ? 'text-error' : 'text-success'">{{ formatMoney(c.balance) }}</td>
              <td>
                <div class="az-progress-wrap">
                  <div class="az-progress-bar">
                    <div class="az-progress-fill" :style="{ width: progressPct(c) + '%' }" :class="progressClass(c)"></div>
                  </div>
                  <span class="az-progress-label">{{ progressPct(c) }}%</span>
                </div>
              </td>
              <td>
                <span :class="isOverdue(c) ? 'text-error font-weight-bold' : 'text-medium-emphasis'">
                  {{ c.due_date ? formatDate(c.due_date) : '—' }}
                  <v-chip v-if="isOverdue(c)" size="x-small" variant="tonal" color="error" class="ml-1">{{ daysOverdue(c) }}d late</v-chip>
                </span>
              </td>
              <td>
                <span class="az-status-chip" :class="`az-status-chip--${statusClass(c.status)}`">{{ c.status_display || c.status }}</span>
              </td>
              <td>
                <div class="az-row-actions">
                  <v-btn size="small" variant="tonal" color="success" prepend-icon="mdi-cash-plus" @click="openPayment(c)" :disabled="Number(c.balance) <= 0">
                    <span class="d-none d-sm-inline">Pay</span>
                  </v-btn>
                  <v-btn size="small" variant="text" icon="mdi-history" @click="viewHistory(c)" />
                </div>
              </td>
            </tr>
            <tr v-if="!pagedItems.length">
              <td colspan="10" class="az-table__empty">
                <v-icon size="36" color="grey-lighten-1">mdi-credit-card-off-outline</v-icon>
                <p class="text-body-2 mt-2 text-medium-emphasis">No credit accounts found.</p>
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
      </template>
    </template>

    <!-- ===== Payment Dialog ===== -->
    <v-dialog v-model="paymentDialog" max-width="520">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold px-4 pt-4">
          <v-icon class="mr-2" color="success">mdi-cash-plus</v-icon>
          Record Credit Payment
        </v-card-title>
        <v-card-text v-if="selectedCredit">
          <div class="az-pay-summary">
            <div class="az-pay-summary__row">
              <span>Customer</span>
              <span class="font-weight-bold">{{ selectedCredit.customer_name }}</span>
            </div>
            <div class="az-pay-summary__row">
              <span>Transaction</span>
              <span class="font-weight-medium">{{ selectedCredit.transaction_number || '—' }}</span>
            </div>
            <div class="az-pay-summary__row">
              <span>Total Amount</span>
              <span>{{ formatMoney(selectedCredit.total_amount) }}</span>
            </div>
            <div class="az-pay-summary__row">
              <span>Already Paid</span>
              <span class="text-success font-weight-medium">{{ formatMoney(selectedCredit.amount_paid) }}</span>
            </div>
            <div class="az-pay-summary__row az-pay-summary__row--bold">
              <span>Outstanding Balance</span>
              <span class="text-error font-weight-bold">{{ formatMoney(selectedCredit.balance) }}</span>
            </div>
          </div>
          <div class="az-quick-amt">
            <button class="az-quick-amt__btn" @click="paymentAmount = Number(selectedCredit.balance)">Full</button>
            <button class="az-quick-amt__btn" @click="paymentAmount = Math.round(Number(selectedCredit.balance) / 2)">Half</button>
            <button class="az-quick-amt__btn" @click="paymentAmount = Math.round(Number(selectedCredit.balance) * 0.25)">25%</button>
            <button class="az-quick-amt__btn" @click="paymentAmount = 0">Clear</button>
          </div>
          <v-text-field v-model.number="paymentAmount" label="Payment Amount" type="number" prefix="KSh" density="compact" variant="outlined" hide-details="auto" class="mt-1" />
          <v-select v-model="paymentMethod" :items="paymentMethods" label="Payment Method" density="compact" variant="outlined" hide-details="auto" class="mt-3" />
          <v-text-field v-model="paymentRef" label="Reference (optional)" density="compact" variant="outlined" hide-details="auto" class="mt-3" />
          <v-textarea v-model="paymentNotes" label="Notes (optional)" density="compact" variant="outlined" hide-details="auto" rows="2" class="mt-3" />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="paymentDialog = false">Cancel</v-btn>
          <v-btn variant="flat" color="success" prepend-icon="mdi-check" @click="recordPayment" :loading="saving">Record Payment</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== History Dialog ===== -->
    <v-dialog v-model="historyDialog" max-width="600">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold px-4 pt-4">
          <v-icon class="mr-2" color="info">mdi-history</v-icon>
          Payment History — {{ selectedCredit?.customer_name }}
        </v-card-title>
        <v-card-text>
          <div class="az-history-summary" v-if="selectedCredit">
            <div class="az-history-summary__item">
              <p class="text-caption text-medium-emphasis">Total Credit</p>
              <p class="text-h6 font-weight-bold">{{ formatMoney(selectedCredit.total_amount) }}</p>
            </div>
            <div class="az-history-summary__item">
              <p class="text-caption text-medium-emphasis">Total Paid</p>
              <p class="text-h6 font-weight-bold text-success">{{ formatMoney(selectedCredit.amount_paid) }}</p>
            </div>
            <div class="az-history-summary__item">
              <p class="text-caption text-medium-emphasis">Balance</p>
              <p class="text-h6 font-weight-bold text-error">{{ formatMoney(selectedCredit.balance) }}</p>
            </div>
          </div>
          <v-data-table v-if="paymentHistory.length > 0" :items="paymentHistory" :headers="historyHeaders" density="compact" items-per-page-text="Rows per page">
            <template #item.amount="{ item }"><span class="font-weight-bold text-success">{{ formatMoney(item.amount) }}</span></template>
            <template #item.payment_method="{ item }">
              <v-chip size="small" variant="tonal" :color="methodColor(item.payment_method)">{{ item.payment_method }}</v-chip>
            </template>
            <template #item.created_at="{ item }">{{ formatDate(item.created_at) }}</template>
          </v-data-table>
          <div v-else class="text-center text-medium-emphasis py-8">
            <v-icon size="40" color="grey-lighten-1">mdi-clock-outline</v-icon>
            <p class="mt-2">No payments recorded yet.</p>
          </div>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="historyDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
const { currency } = useFormat()
const { success, error: errorToast } = useToast()
function formatMoney(v) { return currency(v || 0) }

// ===== State =====
const loading = ref(false)
const saving = ref(false)
const credits = ref([])
const searchText = ref('')
const statusFilter = ref(null)
const activeTab = ref('all')
const page = ref(1)
const itemsPerPage = 15
const paymentDialog = ref(false)
const historyDialog = ref(false)
const selectedCredit = ref(null)
const paymentAmount = ref(0)
const paymentMethod = ref('cash')
const paymentRef = ref('')
const paymentNotes = ref('')
const paymentHistory = ref([])

const paymentMethods = ['cash', 'mpesa', 'card', 'bank_transfer', 'cheque']
const historyHeaders = [
  { title: 'Date', key: 'created_at' },
  { title: 'Method', key: 'payment_method' },
  { title: 'Reference', key: 'reference' },
  { title: 'Recorded By', key: 'recorded_by_name' },
  { title: 'Amount', key: 'amount', align: 'end' },
]

// ===== Helpers =====
function formatDate(d) {
  if (!d) return '—'
  const dt = new Date(d)
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function statusClass(s) {
  const map = { open: 'open', partial: 'partial', settled: 'settled', overdue: 'overdue' }
  return map[s] || 'open'
}

function methodColor(m) {
  const map = { cash: 'green', mpesa: 'success', card: 'blue', bank_transfer: 'indigo', cheque: 'orange' }
  return map[m] || 'grey'
}

function isOverdue(c) {
  if (!c.due_date) return false
  return new Date(c.due_date) < new Date() && Number(c.balance) > 0
}

function daysOverdue(c) {
  if (!c.due_date) return 0
  return Math.floor((new Date() - new Date(c.due_date)) / 86400000)
}

function progressPct(c) {
  const total = Number(c.total_amount)
  if (total <= 0) return 0
  return Math.min(100, Math.round((Number(c.amount_paid) / total) * 100))
}

function progressClass(c) {
  const pct = progressPct(c)
  if (pct >= 100) return 'az-progress-fill--success'
  if (pct >= 50) return 'az-progress-fill--warning'
  return 'az-progress-fill--error'
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function avatarColor(name) {
  if (!name) return 0
  const colors = ['blue', 'green', 'purple', 'orange', 'teal', 'pink', 'indigo', 'cyan']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

// ===== Computed: filtered list =====
const filtered = computed(() => {
  let list = credits.value
  if (activeTab.value === 'active') list = list.filter(c => c.status === 'open' || c.status === 'partial')
  else if (activeTab.value === 'overdue') list = list.filter(c => c.status === 'overdue' || isOverdue(c))
  else if (activeTab.value === 'settled') list = list.filter(c => c.status === 'settled')
  if (searchText.value) {
    const s = searchText.value.toLowerCase()
    list = list.filter(c =>
      c.customer_name?.toLowerCase().includes(s) ||
      c.customer_phone?.includes(s) ||
      c.transaction_number?.toLowerCase().includes(s)
    )
  }
  if (statusFilter.value) list = list.filter(c => c.status === statusFilter.value)
  return list
})

const totalPages = computed(() => Math.ceil(filtered.value.length / itemsPerPage))
const pagedItems = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return filtered.value.slice(start, start + itemsPerPage)
})

// ===== KPIs =====
const kpis = computed(() => {
  const all = credits.value
  const outstanding = all.reduce((s, c) => s + Number(c.balance), 0)
  const collected = all.reduce((s, c) => s + Number(c.amount_paid), 0)
  const totalCredit = all.reduce((s, c) => s + Number(c.total_amount), 0)
  const openCount = all.filter(c => c.status === 'open' || c.status === 'partial').length
  const settledCount = all.filter(c => c.status === 'settled').length
  const partialCount = all.filter(c => c.status === 'partial').length
  const overdueList = all.filter(c => c.status === 'overdue' || isOverdue(c))
  const overdueAmount = overdueList.reduce((s, c) => s + Number(c.balance), 0)
  const overdueCount = overdueList.length
  const collectionRate = totalCredit > 0 ? ((collected / totalCredit) * 100).toFixed(1) : '0.0'
  const settled = all.filter(c => c.status === 'settled')
  const avgDays = settled.length > 0
    ? Math.round(settled.reduce((s, c) => {
        const created = new Date(c.created_at)
        const lastPayment = c.payments?.length > 0 ? new Date(c.payments[0].created_at) : new Date()
        return s + Math.max(0, Math.floor((lastPayment - created) / 86400000))
      }, 0) / settled.length)
    : 0
  return { outstanding, collected, totalCredit, openCount, settledCount, partialCount, overdueAmount, overdueCount, collectionRate, avgDays, totalCount: all.length }
})

// ===== Tabs =====
const tabs = computed(() => [
  { id: 'all', label: 'All Credits', icon: 'mdi-credit-card-multiple', count: credits.value.length },
  { id: 'active', label: 'Active', icon: 'mdi-clock-outline', count: credits.value.filter(c => c.status === 'open' || c.status === 'partial').length },
  { id: 'overdue', label: 'Overdue', icon: 'mdi-alert-circle-outline', count: credits.value.filter(c => c.status === 'overdue' || isOverdue(c)).length },
  { id: 'settled', label: 'Settled', icon: 'mdi-check-circle-outline', count: credits.value.filter(c => c.status === 'settled').length },
  { id: 'viz', label: 'Data Visualization', icon: 'mdi-chart-box-outline', count: null },
])

// ===== Aging buckets =====
const agingBuckets = computed(() => {
  const active = credits.value.filter(c => Number(c.balance) > 0)
  const now = new Date()
  const b0 = { label: 'Current', amount: 0, count: 0, color: '#3478f6' }
  const b30 = { label: '1-30 Days', amount: 0, count: 0, color: '#f59e0b' }
  const b60 = { label: '31-60 Days', amount: 0, count: 0, color: '#f97316' }
  const b90 = { label: '60+ Days', amount: 0, count: 0, color: '#ef4444' }
  active.forEach(c => {
    if (!c.due_date) { b0.amount += Number(c.balance); b0.count++; return }
    const days = Math.floor((now - new Date(c.due_date)) / 86400000)
    if (days <= 0) { b0.amount += Number(c.balance); b0.count++ }
    else if (days <= 30) { b30.amount += Number(c.balance); b30.count++ }
    else if (days <= 60) { b60.amount += Number(c.balance); b60.count++ }
    else { b90.amount += Number(c.balance); b90.count++ }
  })
  return [b0, b30, b60, b90]
})

// ===== Top debtors =====
const topDebtors = computed(() => {
  return [...credits.value]
    .filter(c => Number(c.balance) > 0)
    .sort((a, b) => Number(b.balance) - Number(a.balance))
    .slice(0, 5)
})

// ===== Charts: Outstanding Trend =====
function localDateKey(d) {
  const dt = d instanceof Date ? d : new Date(d)
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const trendSeries = computed(() => {
  const days = 30
  const now = new Date()
  const buckets = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    const key = localDateKey(d)
    buckets[key] = 0
  }
  credits.value.forEach(c => {
    const createdKey = localDateKey(c.created_at)
    for (const key in buckets) {
      if (key >= createdKey) buckets[key] += Number(c.balance)
    }
  })
  const keys = Object.keys(buckets).sort()
  return [{ name: 'Outstanding', data: keys.map(k => Math.round(buckets[k])) }]
})

const trendOptions = {
  chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit' },
  colors: ['#ef4444'],
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 100] } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: Array.from({ length: 30 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (29 - i))
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    }),
    labels: { style: { fontSize: '11px' } },
    tickAmount: 6,
  },
  yaxis: { labels: { formatter: (v) => `${(v / 1000).toFixed(0)}k` } },
  grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
  tooltip: { y: { formatter: (v) => formatMoney(v) } },
}

// ===== Charts: Status Donut =====
const statusDonutSeries = computed(() => {
  const counts = { open: 0, partial: 0, settled: 0, overdue: 0 }
  credits.value.forEach(c => {
    if (isOverdue(c) && c.status !== 'settled') counts.overdue++
    else if (counts[c.status] !== undefined) counts[c.status]++
  })
  return [counts.open, counts.partial, counts.settled, counts.overdue]
})

const statusDonutOptions = {
  chart: { type: 'donut', toolbar: { show: false }, fontFamily: 'inherit' },
  labels: ['Open', 'Partial', 'Settled', 'Overdue'],
  colors: ['#3478f6', '#f59e0b', '#22c55e', '#ef4444'],
  stroke: { width: 2 },
  dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(0)}%` },
  legend: { position: 'bottom', fontSize: '12px', markers: { size: 6 } },
  plotOptions: {
    pie: { donut: { size: '68%', labels: {
      show: true,
      total: { show: true, label: 'Total', formatter: () => String(credits.value.length) }
    } } }
  },
  tooltip: { y: { formatter: (val) => `${val} accounts` } },
}

// ===== API =====
async function loadData() {
  loading.value = true
  try {
    const data = await useApi()('/pos/credits/?page_size=500')
    credits.value = data.results || data
  } catch { /* ignore */ } finally {
    loading.value = false
  }
}

function openPayment(c) {
  selectedCredit.value = c || credits.value.find(x => Number(x.balance) > 0)
  if (!selectedCredit.value) {
    errorToast('No outstanding credit accounts to pay')
    return
  }
  paymentAmount.value = Number(selectedCredit.value.balance)
  paymentMethod.value = 'cash'
  paymentRef.value = ''
  paymentNotes.value = ''
  paymentDialog.value = true
}

async function recordPayment() {
  if (!paymentAmount.value || paymentAmount.value <= 0) {
    errorToast('Enter a valid payment amount')
    return
  }
  saving.value = true
  try {
    const data = await useApi()(`/pos/credits/${selectedCredit.value.id}/record_payment/`, {
      method: 'POST', body: {
        amount: paymentAmount.value,
        payment_method: paymentMethod.value,
        reference: paymentRef.value,
        notes: paymentNotes.value,
      }
    })
    const idx = credits.value.findIndex(c => c.id === selectedCredit.value.id)
    if (idx !== -1) credits.value[idx] = { ...credits.value[idx], ...data }
    success('Payment recorded successfully')
    paymentDialog.value = false
  } catch (e) {
    const msg = e?.data?.detail || 'Failed to record payment'
    errorToast(msg)
  } finally {
    saving.value = false
  }
}

async function viewHistory(c) {
  selectedCredit.value = c
  historyDialog.value = true
  try {
    const data = await useApi()(`/pos/credits/${c.id}/payments/`)
    paymentHistory.value = data.results || data
  } catch {
    paymentHistory.value = []
  }
}

function exportCSV() {
  const rows = [['Customer', 'Phone', 'Transaction', 'Date', 'Total', 'Paid', 'Balance', 'Status', 'Due Date']]
  filtered.value.forEach(c => {
    rows.push([
      c.customer_name || '',
      c.customer_phone || '',
      c.transaction_number || '',
      formatDate(c.created_at),
      Number(c.total_amount || 0),
      Number(c.amount_paid || 0),
      Number(c.balance || 0),
      c.status_display || c.status,
      c.due_date ? formatDate(c.due_date) : '',
    ])
  })
  const csv = rows.map(r => r.map(f => `"${f}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `credit-accounts-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  success('Credit accounts exported')
}

watch([searchText, statusFilter, activeTab], () => { page.value = 1 })

onMounted(loadData)
</script>

<style scoped>
.az-page {
  padding: 20px 24px;
  max-width: 1600px;
  margin: 0 auto;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.az-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
}
.az-header__left { display: flex; align-items: center; gap: 14px; }
.az-header__title-icon {
  width: 48px; height: 48px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.az-header__title-icon--primary { background: rgba(52, 120, 246, 0.12); color: #3478f6; }
.az-header__actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.az-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; }

/* KPI */
.az-kpi-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin-bottom: 20px; }
.az-kpi {
  background: rgb(var(--v-theme-surface)); border: 1px solid rgba(0,0,0,0.06);
  border-radius: 14px; padding: 14px; display: flex; gap: 12px; align-items: flex-start;
  transition: box-shadow 0.15s;
}
.az-kpi:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.05); }
.az-kpi__icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.az-kpi__icon--error { background: rgba(239,68,68,0.1); color: #ef4444; }
.az-kpi__icon--success { background: rgba(34,197,94,0.1); color: #22c55e; }
.az-kpi__icon--info { background: rgba(52,120,246,0.1); color: #3478f6; }
.az-kpi__icon--warning { background: rgba(245,158,11,0.1); color: #f59e0b; }
.az-kpi__icon--purple { background: rgba(124,77,255,0.1); color: #7C4DFF; }
.az-kpi__icon--teal { background: rgba(0,184,212,0.1); color: #00B8D4; }
.az-kpi__body { min-width: 0; }
.az-kpi__label { font-size: 0.6875rem; color: rgba(30,41,59,0.5); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px; }
.az-kpi__value { font-size: 1.125rem; font-weight: 700; line-height: 1.2; }
.az-kpi__sub { font-size: 0.6875rem; color: rgba(30,41,59,0.45); margin-top: 2px; }

/* Charts */
.az-chart-row { display: flex; gap: 16px; margin-bottom: 20px; }
.az-card { background: rgb(var(--v-theme-surface)); border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; overflow: hidden; }
.az-card--two-thirds { flex: 2 2 0; min-width: 0; }
.az-card--third { flex: 1 1 0; min-width: 0; }
.az-card__header { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 1px solid rgba(0,0,0,0.04); }
.az-card__header-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.az-card__header-icon--blue { background: rgba(52,120,246,0.1); color: #3478f6; }
.az-card__header-icon--rose { background: rgba(244,63,94,0.1); color: #f43f5e; }
.az-card__title { font-size: 0.875rem; font-weight: 700; color: rgba(30,41,59,0.87); }
.az-card__subtitle { font-size: 0.75rem; color: rgba(30,41,59,0.45); }
.az-card__body { padding: 12px 16px; }

/* Aging */
.az-aging-wrap { margin-bottom: 20px; background: rgb(var(--v-theme-surface)); border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; padding: 16px 18px; }
.az-aging-title { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; font-weight: 700; color: rgba(30,41,59,0.87); margin-bottom: 14px; }
.az-aging-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.az-aging-bucket { display: flex; gap: 10px; border-radius: 10px; overflow: hidden; background: rgba(0,0,0,0.02); }
.az-aging-bucket__bar { width: 4px; flex-shrink: 0; border-radius: 2px; }
.az-aging-bucket__body { padding: 10px 12px; }
.az-aging-bucket__label { font-size: 0.75rem; font-weight: 600; color: rgba(30,41,59,0.6); }
.az-aging-bucket__value { font-size: 1rem; font-weight: 700; }
.az-aging-bucket__count { font-size: 0.6875rem; color: rgba(30,41,59,0.45); }

/* Filters */
.az-filters { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
.az-filters__search { flex: 1 1 300px; }
.az-filters__select { max-width: 160px; }

/* Tabs */
.az-tabs { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
.az-tab {
  display: inline-flex; align-items: center; gap: 4px; padding: 8px 16px;
  border-radius: 8px; border: 1px solid rgba(0,0,0,0.08); background: rgb(var(--v-theme-surface));
  font-size: 0.8125rem; font-weight: 600; color: rgba(30,41,59,0.55); cursor: pointer; transition: all 0.15s;
}
.az-tab:hover { background: rgba(0,0,0,0.04); }
.az-tab--active { background: rgba(52,120,246,0.08); border-color: rgba(52,120,246,0.25); color: #3478f6; }
.az-tab__badge { display: inline-flex; align-items: center; justify-content: center; min-width: 22px; height: 20px; padding: 0 6px; border-radius: 10px; background: rgba(0,0,0,0.08); font-size: 0.6875rem; font-weight: 700; }
.az-tab--active .az-tab__badge { background: rgba(52,120,246,0.15); color: #3478f6; }

/* Table */
.az-table-wrap { background: rgb(var(--v-theme-surface)); border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; overflow-x: auto; }
.az-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
.az-table thead tr { background: rgba(0,0,0,0.02); }
.az-table th { text-align: left; padding: 11px 16px; font-weight: 700; font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(30,41,59,0.5); white-space: nowrap; }
.az-table th.text-right, .az-table td.text-right { text-align: right; }
.az-table tbody tr { border-top: 1px solid rgba(0,0,0,0.04); }
.az-table__row { transition: background 0.12s; }
.az-table__row:hover { background: rgba(52,120,246,0.02); }
.az-table td { padding: 11px 16px; white-space: nowrap; }
.az-table__empty { text-align: center; padding: 40px 16px; color: rgba(30,41,59,0.4); }

/* Customer cell */
.az-customer-cell { display: flex; align-items: center; gap: 10px; }
.az-avatar { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; color: #fff; flex-shrink: 0; }
.az-avatar--blue { background: linear-gradient(135deg, #3478f6, #1e40af); }
.az-avatar--green { background: linear-gradient(135deg, #10b981, #047857); }
.az-avatar--purple { background: linear-gradient(135deg, #7c4dff, #4527a0); }
.az-avatar--orange { background: linear-gradient(135deg, #f59e0b, #d97706); }
.az-avatar--teal { background: linear-gradient(135deg, #14b8a6, #0f766e); }
.az-avatar--pink { background: linear-gradient(135deg, #ec4899, #be185d); }
.az-avatar--indigo { background: linear-gradient(135deg, #6366f1, #3730a3); }
.az-avatar--cyan { background: linear-gradient(135deg, #06b6d4, #0e7490); }
.az-avatar--error { background: linear-gradient(135deg, #ef4444, #b91c1c); }

/* Progress */
.az-progress-wrap { display: flex; align-items: center; gap: 8px; }
.az-progress-bar { flex: 1; height: 6px; background: rgba(0,0,0,0.06); border-radius: 3px; overflow: hidden; min-width: 80px; }
.az-progress-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
.az-progress-fill--success { background: #22c55e; }
.az-progress-fill--warning { background: #f59e0b; }
.az-progress-fill--error { background: #ef4444; }
.az-progress-label { font-size: 0.6875rem; font-weight: 600; color: rgba(30,41,59,0.5); min-width: 32px; text-align: right; }

/* Status chips */
.az-status-chip { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 0.6875rem; font-weight: 600; white-space: nowrap; }
.az-status-chip--open { background: rgba(52,120,246,0.12); color: #3478f6; }
.az-status-chip--partial { background: rgba(245,158,11,0.12); color: rgb(217,119,6); }
.az-status-chip--settled { background: rgba(34,197,94,0.12); color: rgb(22,163,74); }
.az-status-chip--overdue { background: rgba(239,68,68,0.12); color: rgb(239,68,68); }

/* Row actions */
.az-row-actions { display: flex; gap: 4px; align-items: center; }

/* Pagination */
.az-pagination { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 12px 16px; border-top: 1px solid rgba(0,0,0,0.04); }
.az-pagination__info { font-size: 0.8125rem; color: rgba(30,41,59,0.5); }

/* Top Debtors */
.az-debtors-section { margin-top: 24px; background: rgb(var(--v-theme-surface)); border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; padding: 16px 18px; }
.az-debtors-title { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; font-weight: 700; color: rgba(30,41,59,0.87); margin-bottom: 14px; }
.az-debtors-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
.az-debtor-card { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 10px; background: rgba(239,68,68,0.03); border: 1px solid rgba(239,68,68,0.08); }
.az-debtor-rank { font-size: 0.75rem; font-weight: 800; color: rgba(239,68,68,0.5); flex-shrink: 0; }
.az-debtor-info { flex: 1; min-width: 0; }
.az-debtor-name { font-size: 0.8125rem; font-weight: 600; color: rgba(30,41,59,0.87); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.az-debtor-sub { font-size: 0.6875rem; color: rgba(30,41,59,0.45); }
.az-debtor-amount { text-align: right; flex-shrink: 0; }
.az-debtor-amount p:first-child { font-size: 0.8125rem; }

/* Payment Dialog */
.az-pay-summary { background: rgba(0,0,0,0.02); border-radius: 10px; padding: 12px 14px; margin-bottom: 16px; }
.az-pay-summary__row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 0.8125rem; color: rgba(30,41,59,0.65); }
.az-pay-summary__row--bold { border-top: 1px solid rgba(0,0,0,0.08); margin-top: 4px; padding-top: 8px; font-size: 0.875rem; color: rgba(30,41,59,0.87); }
.az-quick-amt { display: flex; gap: 6px; margin-bottom: 12px; }
.az-quick-amt__btn { flex: 1; padding: 6px 10px; border-radius: 8px; border: 1px solid rgba(52,120,246,0.2); background: rgba(52,120,246,0.06); color: #3478f6; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.az-quick-amt__btn:hover { background: rgba(52,120,246,0.12); }

/* History Dialog */
.az-history-summary { display: flex; gap: 12px; margin-bottom: 16px; }
.az-history-summary__item { flex: 1; text-align: center; padding: 10px; border-radius: 10px; background: rgba(0,0,0,0.02); }

/* Responsive */
@media (max-width: 1280px) {
  .az-kpi-grid { grid-template-columns: repeat(3, 1fr); }
  .az-debtors-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 960px) {
  .az-chart-row { flex-direction: column; }
  .az-aging-grid { grid-template-columns: repeat(2, 1fr); }
  .az-kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .az-debtors-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .az-page { padding: 12px; }
  .az-kpi-grid { grid-template-columns: 1fr 1fr; }
  .az-aging-grid { grid-template-columns: 1fr; }
  .az-debtors-grid { grid-template-columns: 1fr; }
}
</style>

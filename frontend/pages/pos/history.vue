<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center mb-6 flex-wrap ga-3">
      <v-btn to="/pos" variant="text" prepend-icon="mdi-arrow-left" class="text-medium-emphasis">Back to POS</v-btn>
      <v-spacer />
      <v-btn variant="outlined" size="small" prepend-icon="mdi-refresh" @click="loadData" :loading="loading">Refresh</v-btn>
      <v-btn variant="outlined" size="small" prepend-icon="mdi-download" @click="exportCsv">Export CSV</v-btn>
      <v-btn to="/pos" variant="flat" color="primary" size="small" prepend-icon="mdi-plus">New Sale</v-btn>
    </div>

    <!-- KPI cards -->
    <v-row dense class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
          <div class="d-flex align-start justify-space-between mb-2">
            <span class="text-caption text-medium-emphasis font-weight-medium">Transactions</span>
            <div class="kpi-icon kpi-icon-blue">
              <v-icon size="18" icon="mdi-swap-horizontal" />
            </div>
          </div>
          <p class="text-h4 font-weight-bold mb-1">{{ kpis.count }}</p>
          <div class="d-flex align-center ga-2">
            <span class="text-caption text-success font-weight-medium">{{ kpis.completed }} completed</span>
            <span class="text-caption text-medium-emphasis">·</span>
            <span class="text-caption text-error font-weight-medium">{{ kpis.voided }} voided</span>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
          <div class="d-flex align-start justify-space-between mb-2">
            <span class="text-caption text-medium-emphasis font-weight-medium">Net Revenue</span>
            <div class="kpi-icon kpi-icon-green">
              <v-icon size="18" icon="mdi-currency-usd" />
            </div>
          </div>
          <p class="text-h4 font-weight-bold mb-1 text-success">{{ formatMoney(kpis.revenue) }}</p>
          <span class="text-caption text-medium-emphasis">Gross: {{ formatMoney(kpis.gross) }}</span>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
          <div class="d-flex align-start justify-space-between mb-2">
            <span class="text-caption text-medium-emphasis font-weight-medium">Items Sold</span>
            <div class="kpi-icon kpi-icon-orange">
              <v-icon size="18" icon="mdi-package-variant-closed" />
            </div>
          </div>
          <p class="text-h4 font-weight-bold mb-1">{{ kpis.items }}</p>
          <span class="text-caption text-medium-emphasis">{{ kpis.uniqueProducts }} unique products</span>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
          <div class="d-flex align-start justify-space-between mb-2">
            <span class="text-caption text-medium-emphasis font-weight-medium">Avg. Order Value</span>
            <div class="kpi-icon kpi-icon-purple">
              <v-icon size="18" icon="mdi-chart-line" />
            </div>
          </div>
          <p class="text-h4 font-weight-bold mb-1">{{ formatMoney(kpis.aov) }}</p>
          <span class="text-caption text-medium-emphasis">Discount: {{ formatMoney(kpis.discountTotal) }}</span>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters bar -->
    <v-card rounded="xl" variant="outlined" class="mb-4 pa-4">
      <div class="d-flex ga-3 flex-wrap align-center">
        <v-select v-model="rangeKey" :items="rangeOptions" item-title="label" item-value="value" density="compact" variant="outlined" hide-details style="max-width: 180px;" label="Date range" prepend-inner-icon="mdi-calendar-range" />
        <v-text-field v-model="searchText" prepend-inner-icon="mdi-magnify" placeholder="Search receipt #, customer, phone..." density="compact" variant="outlined" hide-details class="flex-grow-1" style="min-width: 220px;" clearable />
        <v-select v-model="paymentFilter" :items="paymentFilterOptions" density="compact" variant="outlined" hide-details style="max-width: 150px;" label="Payment" clearable />
        <v-select v-model="statusFilter" :items="['completed','voided','cancelled','refunded']" density="compact" variant="outlined" hide-details style="max-width: 150px;" label="Status" clearable />
        <v-btn v-if="hasActiveFilters" variant="text" size="small" prepend-icon="mdi-close-circle-outline" @click="clearFilters" class="text-medium-emphasis">Clear</v-btn>
      </div>
      <!-- Custom date pickers -->
      <div v-if="rangeKey === 'custom'" class="d-flex ga-3 flex-wrap align-center mt-3">
        <v-text-field
          v-model="customStart"
          type="date"
          label="From date"
          density="compact"
          variant="outlined"
          hide-details
          prepend-inner-icon="mdi-calendar-start"
          style="max-width: 200px;"
        />
        <v-text-field
          v-model="customEnd"
          type="date"
          label="To date"
          density="compact"
          variant="outlined"
          hide-details
          prepend-inner-icon="mdi-calendar-end"
          style="max-width: 200px;"
        />
        <v-chip size="small" variant="tonal" color="primary" prepend-icon="mdi-calendar-clock">
          {{ customDateLabel }}
        </v-chip>
      </div>
    </v-card>

    <!-- Table -->
    <v-card rounded="xl" variant="outlined" class="history-table-card">
      <v-data-table
        :items="filteredTx"
        :headers="headers"
        :loading="loading"
        :items-per-page="15"
        hover
        density="comfortable"
        items-per-page-text="Rows per page"
        no-data-text="No transactions found"
      >
        <template #item.created_at="{ item }">
          <div class="py-1">
            <div class="text-body-2 font-weight-medium">{{ formatDate(item.created_at) }}</div>
            <div class="text-caption text-medium-emphasis">{{ formatTime(item.created_at) }}</div>
          </div>
        </template>
        <template #item.transaction_number="{ item }">
          <span class="font-weight-medium text-body-2">{{ item.transaction_number }}</span>
        </template>
        <template #item.customer="{ item }">
          <div class="d-flex align-center ga-2">
            <v-avatar size="32" color="surface-variant" rounded="circle">
              <span class="text-caption font-weight-bold">{{ (item.customer_name || 'W').charAt(0).toUpperCase() }}</span>
            </v-avatar>
            <div>
              <div class="text-body-2 font-weight-medium">{{ item.customer_name || 'Walk-in' }}</div>
              <div class="text-caption text-medium-emphasis" v-if="item.customer_phone">{{ item.customer_phone }}</div>
            </div>
          </div>
        </template>
        <template #item.payment_method="{ item }">
          <v-chip size="small" :color="paymentColor(item.payment_method)" variant="tonal" label class="font-weight-medium">{{ item.payment_method?.toUpperCase() }}</v-chip>
        </template>
        <template #item.items_count="{ item }">
          <span class="text-body-2">{{ item.items_count }}</span>
        </template>
        <template #item.total="{ item }">
          <span class="text-body-1 font-weight-bold">{{ formatMoney(item.total) }}</span>
        </template>
        <template #item.status="{ item }">
          <v-chip size="small" :color="statusColor(item.status)" variant="tonal" class="font-weight-medium text-capitalize">
            <v-icon size="12" start :icon="statusIcon(item.status)" />
            {{ item.status }}
          </v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-eye-outline" size="small" variant="text" @click="viewReceipt(item)" class="text-medium-emphasis" />
        </template>
      </v-data-table>
    </v-card>

    <!-- Receipt dialog -->
    <v-dialog v-model="receiptDialog" max-width="480">
      <v-card v-if="selectedTx" rounded="xl" class="receipt-card">
        <!-- Receipt header -->
        <div class="receipt-header pa-5 text-center">
          <div class="d-flex justify-center mb-3">
            <v-avatar color="primary" size="48" rounded="lg">
              <v-icon color="white" size="26">mdi-monitor</v-icon>
            </v-avatar>
          </div>
          <h3 class="text-h6 font-weight-bold">Domendra<span class="text-primary">POS</span></h3>
          <p class="text-caption text-medium-emphasis mt-1">{{ formatDateTime(selectedTx.created_at) }}</p>
          <v-chip size="small" :color="statusColor(selectedTx.status)" variant="tonal" class="mt-2 text-capitalize font-weight-medium">
            <v-icon size="12" start :icon="statusIcon(selectedTx.status)" />
            {{ selectedTx.status }}
          </v-chip>
        </div>

        <v-divider />

        <!-- Meta info -->
        <div class="pa-5">
          <div class="d-flex justify-space-between py-1">
            <span class="text-caption text-medium-emphasis">Receipt #</span>
            <span class="text-caption font-weight-medium">{{ selectedTx.transaction_number }}</span>
          </div>
          <div class="d-flex justify-space-between py-1">
            <span class="text-caption text-medium-emphasis">Cashier</span>
            <span class="text-caption font-weight-medium">{{ selectedTx.cashier_name }}</span>
          </div>
          <div class="d-flex justify-space-between py-1 align-center">
            <span class="text-caption text-medium-emphasis">Payment</span>
            <v-chip size="x-small" :color="paymentColor(selectedTx.payment_method)" variant="tonal" class="font-weight-medium">{{ selectedTx.payment_method?.toUpperCase() }}</v-chip>
          </div>
          <div class="d-flex justify-space-between py-1">
            <span class="text-caption text-medium-emphasis">Customer</span>
            <span class="text-caption font-weight-medium">{{ selectedTx.customer_name || 'Walk-in' }}</span>
          </div>
        </div>

        <v-divider />

        <!-- Line items -->
        <div class="pa-5">
          <div class="d-flex justify-space-between mb-3">
            <span class="text-caption font-weight-bold text-medium-emphasis text-uppercase" style="letter-spacing: 0.1em">Item</span>
            <span class="text-caption font-weight-bold text-medium-emphasis text-uppercase" style="letter-spacing: 0.1em">Amount</span>
          </div>
          <div v-for="line in selectedTx.items" :key="line.id" class="d-flex justify-space-between py-2">
            <div>
              <div class="text-body-2 font-weight-medium">{{ line.product_name }}</div>
              <div class="text-caption text-medium-emphasis">{{ line.quantity }} × {{ formatMoney(line.unit_price || (line.line_total / line.quantity)) }}</div>
            </div>
            <span class="text-body-2 font-weight-medium align-self-center">{{ formatMoney(line.line_total) }}</span>
          </div>
        </div>

        <v-divider />

        <!-- Totals -->
        <div class="pa-5">
          <div class="d-flex justify-space-between py-1">
            <span class="text-body-2 text-medium-emphasis">Subtotal</span>
            <span class="text-body-2 font-weight-medium">{{ formatMoney(selectedTx.subtotal) }}</span>
          </div>
          <div class="d-flex justify-space-between py-1">
            <span class="text-body-2 text-medium-emphasis">Tax (VAT)</span>
            <span class="text-body-2 font-weight-medium">{{ formatMoney(selectedTx.tax) }}</span>
          </div>
          <div class="d-flex justify-space-between py-1" v-if="Number(selectedTx.discount) > 0">
            <span class="text-body-2 text-medium-emphasis">Discount</span>
            <span class="text-body-2 font-weight-medium text-error">-{{ formatMoney(selectedTx.discount) }}</span>
          </div>
          <div class="d-flex justify-space-between pt-3 mt-2">
            <span class="text-h6 font-weight-bold">Total</span>
            <span class="text-h6 font-weight-bold text-primary">{{ formatMoney(selectedTx.total) }}</span>
          </div>
        </div>

        <v-divider />

        <!-- Footer -->
        <div class="pa-5 text-center">
          <p class="text-caption text-medium-emphasis mb-4">Thank you for your purchase!</p>
          <v-btn variant="outlined" block @click="receiptDialog = false">Close</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
const { currency, date: formatDate } = useFormat()

function formatMoney(v) { return currency(v) }
function formatTime(v) { return new Date(v).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }
function formatDateTime(v) { return new Date(v).toLocaleString('en-GB') }

const rangeOptions = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'This month', value: 'thisMonth' },
  { label: 'Last month', value: 'lastMonth' },
  { label: 'This year', value: 'thisYear' },
  { label: 'Custom range', value: 'custom' },
]
const headers = [
  { title: 'Date/Time', key: 'created_at' },
  { title: 'Receipt #', key: 'transaction_number' },
  { title: 'Customer', key: 'customer' },
  { title: 'Payment', key: 'payment_method' },
  { title: 'Items', key: 'items_count', align: 'end' },
  { title: 'Total', key: 'total', align: 'end' },
  { title: 'Status', key: 'status' },
  { title: '', key: 'actions', align: 'end' },
]

const loading = ref(false)
const txAll = ref([])
const rangeKey = ref('30d')
const customStart = ref('')
const customEnd = ref('')
const searchText = ref('')
const paymentFilter = ref(null)
const statusFilter = ref(null)
const receiptDialog = ref(false)
const selectedTx = ref(null)

const paymentFilterOptions = ['cash', 'mpesa', 'card', 'insurance', 'credit', 'bank_transfer']

const customDateLabel = computed(() => {
  if (!customStart.value || !customEnd.value) return 'Select dates'
  const s = new Date(customStart.value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const e = new Date(customEnd.value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  return `${s} — ${e}`
})

const hasActiveFilters = computed(() => {
  return rangeKey.value !== '30d'
    || !!searchText.value
    || !!paymentFilter.value
    || !!statusFilter.value
    || !!customStart.value
    || !!customEnd.value
})

function clearFilters() {
  rangeKey.value = '30d'
  searchText.value = ''
  paymentFilter.value = null
  statusFilter.value = null
  customStart.value = ''
  customEnd.value = ''
}

function resolveRange(key) {
  const now = new Date()
  const end = new Date(now); end.setHours(23,59,59,999)
  const start = new Date(now); start.setHours(0,0,0,0)
  if (key === 'today') { return [start, end] }
  if (key === 'yesterday') { start.setDate(start.getDate()-1); end.setDate(end.getDate()-1); return [start, end] }
  if (key === '7d') { start.setDate(start.getDate()-7); return [start, end] }
  if (key === '30d') { start.setDate(start.getDate()-30); return [start, end] }
  if (key === '90d') { start.setDate(start.getDate()-90); return [start, end] }
  if (key === 'thisMonth') { start.setDate(1); return [start, end] }
  if (key === 'lastMonth') { start.setMonth(start.getMonth()-1); start.setDate(1); end.setDate(0); return [start, end] }
  if (key === 'thisYear') { start.setMonth(0); start.setDate(1); return [start, end] }
  if (key === 'custom') {
    if (!customStart.value || !customEnd.value) return [new Date(2020,0,1), end]
    const s = new Date(customStart.value); s.setHours(0,0,0,0)
    const e = new Date(customEnd.value); e.setHours(23,59,59,999)
    return [s, e]
  }
  return [new Date(2020,0,1), end]
}

const inRange = computed(() => {
  const [start, end] = resolveRange(rangeKey.value)
  return txAll.value.filter(t => {
    const d = new Date(t.created_at)
    return d >= start && d <= end
  })
})

const filteredTx = computed(() => {
  let list = inRange.value
  if (searchText.value) {
    const s = searchText.value.toLowerCase()
    list = list.filter(t => t.transaction_number?.toLowerCase().includes(s) || t.customer_name?.toLowerCase().includes(s) || t.customer_phone?.includes(s))
  }
  if (paymentFilter.value) list = list.filter(t => t.payment_method === paymentFilter.value)
  if (statusFilter.value) list = list.filter(t => t.status === statusFilter.value)
  return list
})

const kpis = computed(() => {
  const list = filteredTx.value
  const completed = list.filter(t => t.status === 'completed')
  const voided = list.filter(t => t.status === 'voided')
  const revenue = completed.reduce((s, t) => s + Number(t.total), 0)
  const gross = list.reduce((s, t) => s + Number(t.total), 0)
  const items = completed.reduce((s, t) => s + (t.items_count || 0), 0)
  const discountTotal = completed.reduce((s, t) => s + Number(t.discount), 0)
  const uniqueProducts = new Set(completed.flatMap(t => t.items?.map(i => i.product) || [])).size
  return { count: list.length, completed: completed.length, voided: voided.length, revenue, gross, items, uniqueProducts, aov: completed.length ? revenue / completed.length : 0, discountTotal }
})

function paymentColor(m) {
  const map = { cash: 'success', mpesa: 'green', card: 'blue', insurance: 'purple', credit: 'orange', bank_transfer: 'teal' }
  return map[m] || 'grey'
}

function statusColor(s) {
  const map = { completed: 'success', voided: 'error', cancelled: 'grey', refunded: 'warning', pending: 'info' }
  return map[s] || 'grey'
}

function statusIcon(s) {
  const map = { completed: 'mdi-check-circle-outline', voided: 'mdi-close-circle-outline', cancelled: 'mdi-cancel', refunded: 'mdi-undo', pending: 'mdi-clock-outline' }
  return map[s] || 'mdi-help-circle-outline'
}

function viewReceipt(tx) {
  selectedTx.value = tx
  receiptDialog.value = true
}

async function fetchAllPages(url, pageSize = 500) {
  const all = []
  let nextUrl = `${url}${url.includes('?') ? '&' : '?'}page_size=${pageSize}`
  while (nextUrl) {
    const data = await useApi()(nextUrl)
    all.push(...(data.results || []))
    nextUrl = data.next
      ? data.next.replace(/^https?:\/\/[^/]+\/api/, '')
      : null
  }
  return all
}

async function loadData() {
  loading.value = true
  try {
    txAll.value = await fetchAllPages('/pos/transactions/?ordering=-created_at')
  } catch { /* ignore */ } finally {
    loading.value = false
  }
}

function exportCsv() {
  const list = filteredTx.value
  const csv = [['Receipt#', 'Date', 'Customer', 'Payment', 'Total', 'Status'].join(',')]
  for (const t of list) {
    csv.push([t.transaction_number, t.created_at, t.customer_name, t.payment_method, t.total, t.status].join(','))
  }
  const blob = new Blob([csv.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'sales-history.csv'; a.click()
  URL.revokeObjectURL(url)
}

onMounted(loadData)
</script>

<style scoped>
.kpi-card {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.kpi-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.kpi-icon-blue { background: rgba(33, 150, 243, 0.12); color: #2196f3; }
.kpi-icon-green { background: rgba(76, 175, 80, 0.12); color: #4caf50; }
.kpi-icon-orange { background: rgba(255, 152, 0, 0.12); color: #ff9800; }
.kpi-icon-purple { background: rgba(156, 39, 176, 0.12); color: #9c27b0; }

.history-table-card {
  overflow: hidden;
}

.receipt-card {
  overflow: hidden;
}
.receipt-header {
  background: rgba(var(--v-theme-primary), 0.03);
}
</style>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { currency, datetime, number } = useFormat()
const toast = useToast()
const branchStore = useBranchStore()
const chartOptions = useChartOptions()
const { areaOptions, barOptions, donutOptions, heatmapOptions } = chartOptions

// ===== Helpers =====
function formatMoney(v: number | string | null | undefined): string {
  return currency(Number(v) || 0)
}

function formatTxDate(v: string): string {
  return datetime(v)
}

// ===== Greeting =====
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
})

// ===== Period =====
const period = ref('thisMonth')
const customRange = ref({ from: '', to: '' })
const isCustom = computed(() => period.value === 'custom')

const periodLabel = computed(() => {
  if (isCustom.value) {
    const r = resolveRange('custom')
    return `${r[0].toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – ${r[1].toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`
  }
  const labels: Record<string, string> = {
    today: 'Today',
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    thisMonth: 'This month',
    ytd: 'Year to date',
    all: 'All time',
  }
  return labels[period.value] || 'This month'
})

function resolveRange(key: string): [Date, Date] {
  const now = new Date()
  const end = new Date(now); end.setHours(23, 59, 59, 999)
  const start = new Date(now); start.setHours(0, 0, 0, 0)
  if (key === 'today') return [start, end]
  if (key === '7d') { start.setDate(start.getDate() - 7); return [start, end] }
  if (key === '30d') { start.setDate(start.getDate() - 30); return [start, end] }
  if (key === 'thisMonth') { start.setDate(1); return [start, end] }
  if (key === 'ytd') { start.setMonth(0, 1); return [start, end] }
  if (key === 'all') { start.setFullYear(2000, 0, 1); return [start, end] }
  if (key === 'custom') {
    const s = new Date(customRange.value.from + 'T00:00:00')
    const e = new Date(customRange.value.to + 'T23:59:59')
    if (s && e && !isNaN(s.getTime()) && !isNaN(e.getTime())) return [s, e]
    return [start, end]
  }
  return [start, end]
}

function applyCustomRange(range: { from: string; to: string }) {
  customRange.value = range
  period.value = 'custom'
}

const rangeDays = computed(() => {
  const [start, end] = resolveRange(period.value)
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000))
})

const isMonthlyGroup = computed(() => rangeDays.value > 90)

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// ===== State =====
const loading = ref(false)
const error = ref(false)
const transactions = ref<any[]>([])
const products = ref<any[]>([])
const lowStockItems = ref<any[]>([])
const lastUpdated = ref<string | null>(null)

// ===== Branch query helpers =====
function branchParam(prefix = '&'): string {
  return branchStore.branchId ? `${prefix}branch=${branchStore.branchId}` : ''
}

// ===== Computed: in-range transactions =====
const inRange = computed(() => {
  const [start, end] = resolveRange(period.value)
  return transactions.value.filter((t: any) => {
    const d = new Date(t.created_at)
    return d >= start && d <= end && t.status === 'completed'
  })
})

// ===== KPIs =====
const kpis = computed(() => {
  const list = inRange.value
  const revenue = list.reduce((s, t) => s + Number(t.total), 0)
  const txCount = list.length
  const items = list.reduce((s, t) => s + (t.items_count || 0), 0)
  const aov = txCount ? revenue / txCount : 0

  // Growth vs previous equal-length period
  const [pStart, pEnd] = resolveRange(period.value)
  const days = (pEnd.getTime() - pStart.getTime()) / 86400000
  const prevEnd = new Date(pStart); prevEnd.setHours(0, 0, 0, 0)
  const prevStart = new Date(prevEnd); prevStart.setDate(prevStart.getDate() - days)
  const prevRev = transactions.value
    .filter((t: any) => {
      const d = new Date(t.created_at)
      return d >= prevStart && d < prevEnd && t.status === 'completed'
    })
    .reduce((s, t) => s + Number(t.total), 0)
  const revGrowth = prevRev ? ((revenue - prevRev) / prevRev) * 100 : 0

  // Stock
  const stockItems = products.value.length
  const stockValue = products.value.reduce((s, p) => s + (Number(p.quantity_on_hand || 0) * Number(p.cost_price || 0)), 0)

  return { revenue, txCount, items, aov, stockItems, stockValue, revGrowth }
})

const grossProfit = computed(() => {
  let cost = 0
  inRange.value.forEach((t: any) => {
    ;(t.items || []).forEach((i: any) => {
      const prod = products.value.find((p: any) => p.name === i.product_name)
      cost += Number(i.quantity || 0) * Number(prod?.cost_price || 0)
    })
  })
  return kpis.value.revenue - cost
})

const grossMarginPct = computed(() => kpis.value.revenue ? (grossProfit.value / kpis.value.revenue) * 100 : 0)

const inventoryTurnover = computed(() => {
  const cogs = inRange.value.reduce((s: number, t: any) => {
    let txCost = 0
    ;(t.items || []).forEach((i: any) => {
      const prod = products.value.find((p: any) => p.name === i.product_name)
      txCost += Number(i.quantity || 0) * Number(prod?.cost_price || 0)
    })
    return s + txCost
  }, 0)
  const avgInventory = kpis.value.stockValue
  return avgInventory > 0 ? cogs / avgInventory : 0
})

const inventoryTurnoverDays = computed(() => {
  const turnover = inventoryTurnover.value
  if (turnover <= 0) return 0
  return rangeDays.value / turnover
})

// ===== Sparkline =====
const sparklineSeries = computed(() => {
  const monthly = isMonthlyGroup.value
  const map = new Map<string, number>()
  for (const t of inRange.value) {
    const d = new Date(t.created_at)
    const key = monthly ? monthKey(d) : d.toISOString().slice(0, 10)
    map.set(key, (map.get(key) || 0) + Number(t.total))
  }
  const keys = [...map.keys()].sort((a, b) => a.localeCompare(b))
  return [{ name: 'Revenue', data: keys.map(k => map.get(k) || 0) }]
})

// ===== Charts =====
const revenueSeries = computed(() => {
  const monthly = isMonthlyGroup.value
  const revMap = new Map<string, number>()
  const costMap = new Map<string, number>()
  for (const t of inRange.value) {
    const d = new Date(t.created_at)
    const key = monthly ? monthKey(d) : d.toISOString().slice(0, 10)
    revMap.set(key, (revMap.get(key) || 0) + Number(t.total))
    let txCost = 0
    for (const item of (t.items || [])) {
      const prod = products.value.find((p: any) => p.name === item.product_name)
      txCost += Number(item.quantity || 0) * Number(prod?.cost_price || 0)
    }
    costMap.set(key, (costMap.get(key) || 0) + txCost)
  }
  const keys = [...new Set([...revMap.keys(), ...costMap.keys()])].sort((a, b) => a.localeCompare(b))
  return [
    { name: 'Revenue', data: keys.map(k => ({ x: k, y: revMap.get(k) || 0 })) },
    { name: 'Cost', data: keys.map(k => ({ x: k, y: costMap.get(k) || 0 })) },
    { name: 'Profit', data: keys.map(k => ({ x: k, y: (revMap.get(k) || 0) - (costMap.get(k) || 0) })) },
  ]
})

const revenueOptions = computed(() =>
  areaOptions({
    colors: ['rgb(var(--v-theme-primary))', 'rgb(var(--v-theme-error))', 'rgb(var(--v-theme-success))'],
    monthly: isMonthlyGroup.value,
  })
)

const paymentMap = computed(() => {
  const map: Record<string, number> = {}
  inRange.value.forEach((t: any) => { map[t.payment_method] = (map[t.payment_method] || 0) + Number(t.total) })
  return map
})
const paymentSeries = computed(() => Object.values(paymentMap.value))
const paymentOptions = computed(() => donutOptions({ labels: Object.keys(paymentMap.value) }))

const topProductsData = computed(() => {
  const map: Record<string, number> = {}
  inRange.value.forEach((t: any) => (t.items || []).forEach((i: any) => {
    map[i.product_name] = (map[i.product_name] || 0) + Number(i.line_total)
  }))
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10)
})
const topProductsSeries = computed(() => [{ name: 'Revenue', data: topProductsData.value.map(e => e[1]) }])
const topProductsOptions = computed(() =>
  barOptions({
    color: 'rgb(var(--v-theme-primary))',
    horizontal: true,
    categories: topProductsData.value.map(e => e[0]),
  })
)

const categoryMap = computed(() => {
  const map: Record<string, number> = {}
  inRange.value.forEach((t: any) => (t.items || []).forEach((i: any) => {
    const cat = i.category_name || 'Uncategorized'
    map[cat] = (map[cat] || 0) + Number(i.line_total)
  }))
  return map
})
const categorySeries = computed(() => Object.values(categoryMap.value))
const categoryOptions = computed(() => donutOptions({ labels: Object.keys(categoryMap.value) }))

// ===== Heatmap =====
const heatmapSeries = computed(() => {
  const now = new Date()
  const months: { label: string; year: number; month: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ label: d.toLocaleDateString('en-GB', { month: 'short' }), year: d.getFullYear(), month: d.getMonth() })
  }
  return months.map(m => {
    const days: { x: string; y: number }[] = []
    const daysInMonth = new Date(m.year, m.month + 1, 0).getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      const dStr = `${m.year}-${String(m.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const total = transactions.value
        .filter((t: any) => {
          const td = new Date(t.created_at)
          return td.toISOString().slice(0, 10) === dStr && t.status === 'completed'
        })
        .reduce((s, t) => s + Number(t.total), 0)
      days.push({ x: String(day), y: Math.round(total) })
    }
    return { name: m.label, data: days }
  })
})

const heatmapChartOptions = computed(() => heatmapOptions())

// ===== Recent transactions =====
const recentTransactions = computed(() => {
  return [...inRange.value]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)
})

// ===== Data Loading =====
async function loadData() {
  if (loading.value) return
  loading.value = true
  error.value = false
  try {
    const [txData, prodData, lowStockData] = await Promise.all([
      useApi()(`/pos/transactions/?page_size=2000${branchParam()}`),
      useApi()(`/products/?page_size=500${branchParam()}`).catch(() => ({ results: [] })),
      useApi()(`/reports/low-stock/${branchParam('?')}`).catch(() => []),
    ])
    transactions.value = txData.results || txData
    products.value = prodData.results || prodData
    lowStockItems.value = lowStockData || []
    lastUpdated.value = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  } catch (e) {
    error.value = true
    toast.error('Failed to load dashboard data')
  } finally {
    loading.value = false
  }
}

watch([() => branchStore.branchId, () => period.value], () => {
  loadData()
})

// ===== Export CSV =====
function exportCSV() {
  const rows = inRange.value
  if (!rows.length) { toast.warning('No transactions to export'); return }
  const header = ['Transaction #', 'Date', 'Cashier', 'Customer', 'Branch', 'Payment Method', 'Subtotal', 'Discount', 'Tax', 'Total', 'Items', 'Status']
  const csvRows = rows.map((t: any) => [
    t.transaction_number || '',
    new Date(t.created_at).toISOString(),
    t.cashier_name || '',
    t.customer_name || 'Walk-in',
    t.branch_name || '',
    t.payment_method_display || t.payment_method || '',
    t.subtotal || 0,
    t.discount || 0,
    t.tax || 0,
    t.total || 0,
    t.items_count || 0,
    t.status_display || t.status || '',
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  const csv = [header.join(','), ...csvRows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `dashboard-export-${period.value}-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
  toast.success(`Exported ${rows.length} transactions`)
}

onMounted(() => {
  branchStore.init().then(() => loadData())
})
</script>

<template>
  <div class="dash-page">
    <!-- ===== Header ===== -->
    <div class="dash-header">
      <div class="dash-header__left">
        <div class="dash-header__title-icon">
          <v-icon size="24">mdi-view-dashboard-outline</v-icon>
        </div>
        <div>
          <h1 class="text-h5 font-weight-bold">Dashboard</h1>
          <p class="text-body-2 text-medium-emphasis">{{ greeting }} — here's your store at a glance</p>
        </div>
      </div>
      <div class="dash-header__actions">
        <div class="dash-header__branch d-none d-md-flex align-center">
          <v-icon size="16" color="medium-emphasis" class="mr-1">mdi-store-outline</v-icon>
          <span class="text-caption text-medium-emphasis">{{ branchStore.branchName }}</span>
        </div>
        <DashboardPeriodSelector v-model="period" @custom="applyCustomRange" />
        <v-btn variant="tonal" prepend-icon="mdi-refresh" size="small" :loading="loading" @click="loadData">Refresh</v-btn>
        <v-btn variant="outlined" prepend-icon="mdi-download" size="small" @click="exportCSV">Export</v-btn>
      </div>
    </div>

    <div v-if="lastUpdated && !loading" class="dash-last-updated text-caption text-medium-emphasis">
      Last updated: {{ lastUpdated }}
    </div>

    <DashboardErrorState v-if="error && !loading" :on-retry="loadData" class="mb-6" />

    <!-- ===== Loading (skeleton) ===== -->
    <DashboardSkeleton v-if="loading && transactions.length === 0" />

    <template v-else-if="!error">
      <!-- ===== KPI Row ===== -->
      <div class="dash-kpi-grid">
        <DashboardKpiCard
          class="dash-animate dash-animate--1"
          icon="mdi-cash-multiple"
          label="Revenue"
          :value="kpis.revenue"
          format="currency"
          color="success"
          :trend="kpis.revGrowth"
          :sparkline-series="sparklineSeries"
          to="/sales"
        />
        <DashboardKpiCard
          class="dash-animate dash-animate--2"
          icon="mdi-receipt-text-outline"
          label="Transactions"
          :value="kpis.txCount"
          format="number"
          color="primary"
          :subtext="`${number(kpis.items)} items sold`"
          to="/sales"
        />
        <DashboardKpiCard
          class="dash-animate dash-animate--3"
          icon="mdi-chart-line"
          label="Avg. Order Value"
          :value="kpis.aov"
          format="currency"
          color="info"
          subtext="per transaction"
          to="/sales"
        />
        <DashboardKpiCard
          class="dash-animate dash-animate--4"
          icon="mdi-package-variant"
          label="Stock Value"
          :value="kpis.stockValue"
          format="currency"
          color="teal"
          :subtext="`${number(kpis.stockItems)} SKUs`"
          to="/inventory/stock"
        />
        <DashboardKpiCard
          class="dash-animate dash-animate--5"
          icon="mdi-percent-circle"
          label="Gross Margin"
          :value="grossMarginPct"
          format="percent"
          :decimals="1"
          color="secondary"
          :subtext="`${formatMoney(grossProfit)} profit`"
          to="/reports"
        />
        <DashboardKpiCard
          class="dash-animate dash-animate--6"
          icon="mdi-swap-horizontal"
          label="Inventory Turnover"
          :value="inventoryTurnover"
          :decimals="2"
          color="warning"
          :subtext="`${inventoryTurnoverDays.toFixed(0)} days to sell`"
          to="/inventory/stock-analysis"
        />
      </div>

      <!-- ===== Charts Row 1: Revenue trend + Payment methods ===== -->
      <div class="dash-chart-row dash-chart-row--wide dash-animate dash-animate--2">
        <DashboardChartCard icon="mdi-chart-areaspline" title="Revenue Trend" :subtitle="`Daily revenue — ${periodLabel}`" color="primary" to="/analytics">
          <apexchart v-if="revenueSeries[0].data.length" type="area" height="300" :options="revenueOptions" :series="revenueSeries" />
          <DashboardEmptyState v-else icon="mdi-chart-areaspline" title="No revenue data for this period" />
        </DashboardChartCard>

        <DashboardChartCard icon="mdi-chart-donut" title="Payment Methods" subtitle="Revenue by payment type" color="success" to="/reports">
          <apexchart v-if="paymentSeries.length" type="donut" height="300" :options="paymentOptions" :series="paymentSeries" />
          <DashboardEmptyState v-else icon="mdi-chart-donut" title="No payment data yet" />
        </DashboardChartCard>
      </div>

      <!-- ===== Charts Row 2: Top products + Category breakdown ===== -->
      <div class="dash-chart-row dash-animate dash-animate--3">
        <DashboardChartCard icon="mdi-trophy-award" title="Top 10 Products" subtitle="Best sellers by revenue" color="indigo" to="/analytics/products">
          <apexchart v-if="topProductsSeries[0].data.length" type="bar" height="300" :options="topProductsOptions" :series="topProductsSeries" />
          <DashboardEmptyState v-else icon="mdi-trophy-outline" title="No product sales yet" />
        </DashboardChartCard>

        <DashboardChartCard icon="mdi-chart-pie" title="Sales by Category" subtitle="Revenue distribution" color="amber" to="/analytics/categories">
          <apexchart v-if="categorySeries.length" type="donut" height="300" :options="categoryOptions" :series="categorySeries" />
          <DashboardEmptyState v-else icon="mdi-chart-arc" title="No category data yet" />
        </DashboardChartCard>
      </div>

      <!-- ===== Sales Activity Heatmap ===== -->
      <div class="dash-chart-row dash-chart-row--full dash-animate dash-animate--4">
        <DashboardChartCard icon="mdi-calendar-blank-multiple" title="Sales Activity" subtitle="Daily revenue intensity (last 6 months)" color="secondary" to="/analytics">
          <apexchart v-if="heatmapSeries.length" type="heatmap" height="280" :options="heatmapChartOptions" :series="heatmapSeries" />
          <DashboardEmptyState v-else icon="mdi-calendar-blank" title="No activity data yet" />
        </DashboardChartCard>
      </div>

      <!-- ===== Bottom Row: Low Stock Alerts + Recent Transactions ===== -->
      <div class="dash-bottom-row dash-animate dash-animate--5">
        <DashboardLowStockList :items="lowStockItems" :loading="loading" class="dash-bottom-row__list" />
        <DashboardRecentTransactions :transactions="recentTransactions" :loading="loading" class="dash-bottom-row__list" />
      </div>
    </template>
  </div>
</template>

<style scoped>
@import "~/assets/css/dashboard-animations.css";

/* ===== Page wrapper ===== */
.dash-page {
  padding: 20px 24px;
  max-width: 1600px;
  margin: 0 auto;
  font-family: "Segoe UI Variable", Inter, system-ui, sans-serif;
}

/* ===== Header ===== */
.dash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}
.dash-header__left { display: flex; align-items: center; gap: 14px; }
.dash-header__title-icon {
  width: 48px; height: 48px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
  flex-shrink: 0;
}
.dash-header__actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.dash-header__branch {
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(var(--v-theme-on-surface), 0.04);
}
.dash-last-updated {
  margin-bottom: 16px;
  padding-left: 62px;
}

/* ===== KPI Grid ===== */
.dash-kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

/* ===== Chart rows ===== */
.dash-chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}
.dash-chart-row--wide { grid-template-columns: 2fr 1fr; }
.dash-chart-row--full { grid-template-columns: 1fr; }

/* ===== Bottom row ===== */
.dash-bottom-row {
  display: grid;
  grid-template-columns: minmax(0, 360px) 1fr;
  gap: 16px;
  margin-bottom: 20px;
}
.dash-bottom-row__list { min-width: 0; }

/* ===== Responsive ===== */
@media (max-width: 1400px) {
  .dash-kpi-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1200px) {
  .dash-chart-row,
  .dash-chart-row--wide { grid-template-columns: 1fr; }
}
@media (max-width: 1024px) {
  .dash-kpi-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .dash-last-updated { padding-left: 0; }
}
@media (max-width: 768px) {
  .dash-page { padding: 12px; }
  .dash-kpi-grid { grid-template-columns: 1fr 1fr; }
  .dash-bottom-row { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .dash-kpi-grid { grid-template-columns: 1fr; }
}
</style>

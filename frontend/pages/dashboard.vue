<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { currency, datetime, number } = useFormat()
const toast = useToast()
const branchStore = useBranchStore()
const chartOptions = useChartOptions()
const { areaOptions, donutOptions, heatmapOptions } = chartOptions
const { colors: chartColors } = useChartTheme()

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
const lowStockItems = ref<any[]>([])
const lastUpdated = ref<string | null>(null)

// Server-side aggregated data (no more client-side reduction of 500 records)
const kpiData = ref<any>({})
const dailyRevenue = ref<any[]>([])       // selected period — for trend chart + sparklines
const dailyRevenue6m = ref<any[]>([])     // last 6 months — for heatmap
const hourlyData = ref<any[]>([])         // 24 rows {hour, revenue, transactions}
const paymentData = ref<any[]>([])        // [{method, total, count, percentage}]
const topProducts = ref<any[]>([])        // [{product, sku, qty_sold, revenue, cost, profit, margin}]
const categoryData = ref<any[]>([])       // [{category, qty_sold, revenue, cost, profit, margin}]
const recentTx = ref<any[]>([])           // latest 8 transactions for the table

// Derived flag: any data loaded yet? (used by skeleton guard)
const hasData = computed(() =>
  Object.keys(kpiData.value).length > 0 || dailyRevenue.value.length > 0 || recentTx.value.length > 0,
)

// ===== Branch query helpers =====
function branchParam(prefix = '&'): string {
  return branchStore.branchId ? `${prefix}branch=${branchStore.branchId}` : ''
}

function dateRangeParams(): string {
  const [start, end] = resolveRange(period.value)
  return `&date_from=${start.toISOString().slice(0, 10)}&date_to=${end.toISOString().slice(0, 10)}`
}

// ===== KPIs (from server-side dashboard-kpis endpoint) =====
const kpis = computed(() => {
  const d = kpiData.value
  return {
    revenue: Number(d.revenue ?? 0),
    txCount: Number(d.transaction_count ?? 0),
    items: Number(d.items_sold ?? 0),
    aov: Number(d.average_sale ?? 0),
    stockItems: Number(d.stock_items ?? 0),
    stockValue: Number(d.stock_value ?? 0),
    revGrowth: Number(d.growth_pct ?? 0),
  }
})

const grossProfit = computed(() => Number(kpiData.value.gross_profit ?? 0))
const grossMarginPct = computed(() => Number(kpiData.value.gross_margin ?? 0))

const inventoryTurnover = computed(() => {
  const cogs = Number(kpiData.value.total_cost ?? 0)
  const avgInventory = kpis.value.stockValue
  return avgInventory > 0 ? cogs / avgInventory : 0
})

const inventoryTurnoverDays = computed(() => {
  const turnover = inventoryTurnover.value
  if (turnover <= 0) return 0
  return rangeDays.value / turnover
})

// ===== Sparklines (derived from server-side daily-revenue) =====

function dailyKey(dateStr: string): string {
  const d = new Date(dateStr)
  return isMonthlyGroup.value ? monthKey(d) : dateStr.slice(0, 10)
}

// Sparkline: Revenue per day
const sparklineSeries = computed(() => {
  if (!dailyRevenue.value.length) return [{ name: 'Revenue', data: [] }]
  const monthly = isMonthlyGroup.value
  const map = new Map<string, number>()
  for (const r of dailyRevenue.value) {
    const d = new Date(r.date)
    const key = monthly ? monthKey(d) : d.toISOString().slice(0, 10)
    map.set(key, (map.get(key) || 0) + Number(r.revenue))
  }
  const keys = [...map.keys()].sort((a, b) => a.localeCompare(b))
  return [{ name: 'Revenue', data: keys.map(k => map.get(k) || 0) }]
})

// Sparkline: Transactions per period
const sparkTxSeries = computed(() => {
  if (!dailyRevenue.value.length) return [{ name: 'Transactions', data: [] }]
  const monthly = isMonthlyGroup.value
  const map = new Map<string, number>()
  for (const r of dailyRevenue.value) {
    const d = new Date(r.date)
    const key = monthly ? monthKey(d) : d.toISOString().slice(0, 10)
    map.set(key, (map.get(key) || 0) + Number(r.transactions || 0))
  }
  const keys = [...map.keys()].sort((a, b) => a.localeCompare(b))
  return [{ name: 'Transactions', data: keys.map(k => map.get(k) || 0) }]
})

// Sparkline: AOV per period
const sparkAovSeries = computed(() => {
  if (!dailyRevenue.value.length) return [{ name: 'AOV', data: [] }]
  const monthly = isMonthlyGroup.value
  const revMap = new Map<string, number>()
  const cntMap = new Map<string, number>()
  for (const r of dailyRevenue.value) {
    const d = new Date(r.date)
    const key = monthly ? monthKey(d) : d.toISOString().slice(0, 10)
    revMap.set(key, (revMap.get(key) || 0) + Number(r.revenue))
    cntMap.set(key, (cntMap.get(key) || 0) + Number(r.transactions || 0))
  }
  const keys = [...revMap.keys()].sort((a, b) => a.localeCompare(b))
  return [{ name: 'AOV', data: keys.map(k => (revMap.get(k) || 0) / (cntMap.get(k) || 1)) }]
})

// Sparkline: COGS (daily cost, from server aggregation)
const sparkStockSeries = computed(() => {
  if (!dailyRevenue.value.length) return [{ name: 'COGS', data: [] }]
  const monthly = isMonthlyGroup.value
  const map = new Map<string, number>()
  for (const r of dailyRevenue.value) {
    const d = new Date(r.date)
    const key = monthly ? monthKey(d) : d.toISOString().slice(0, 10)
    map.set(key, (map.get(key) || 0) + Number(r.cost || 0))
  }
  const keys = [...map.keys()].sort((a, b) => a.localeCompare(b))
  return [{ name: 'COGS', data: keys.map(k => map.get(k) || 0) }]
})

// Sparkline: Gross Margin % per period
const sparkMarginSeries = computed(() => {
  if (!dailyRevenue.value.length) return [{ name: 'Margin %', data: [] }]
  const monthly = isMonthlyGroup.value
  const revMap = new Map<string, number>()
  const costMap = new Map<string, number>()
  for (const r of dailyRevenue.value) {
    const d = new Date(r.date)
    const key = monthly ? monthKey(d) : d.toISOString().slice(0, 10)
    revMap.set(key, (revMap.get(key) || 0) + Number(r.revenue))
    costMap.set(key, (costMap.get(key) || 0) + Number(r.cost || 0))
  }
  const keys = [...revMap.keys()].sort((a, b) => a.localeCompare(b))
  return [{ name: 'Margin %', data: keys.map(k => {
    const rev = revMap.get(k) || 0
    const cost = costMap.get(k) || 0
    return rev > 0 ? ((rev - cost) / rev) * 100 : 0
  }) }]
})

// Sparkline: Inventory Turnover (COGS)
const sparkTurnoverSeries = computed(() => sparkStockSeries.value)

// ===== Charts =====
const revenueSeries = computed(() => {
  if (!dailyRevenue.value.length) {
    return [
      { name: 'Revenue', data: [] },
      { name: 'Cost', data: [] },
      { name: 'Profit', data: [] },
    ]
  }
  const monthly = isMonthlyGroup.value
  const revMap = new Map<string, number>()
  const costMap = new Map<string, number>()
  for (const r of dailyRevenue.value) {
    const d = new Date(r.date)
    const key = monthly ? monthKey(d) : d.toISOString().slice(0, 10)
    revMap.set(key, (revMap.get(key) || 0) + Number(r.revenue))
    costMap.set(key, (costMap.get(key) || 0) + Number(r.cost || 0))
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
    colors: [`rgb(${chartColors.value.primary})`, `rgb(${chartColors.value.error})`, `rgb(${chartColors.value.success})`],
    monthly: isMonthlyGroup.value,
  })
)

// Payment mix from server-side aggregation
const paymentSeries = computed(() => paymentData.value.map((p: any) => Number(p.total) || 0))
const paymentOptions = computed(() => donutOptions({ labels: paymentData.value.map((p: any) => p.method) }))

// Top 10 products from server-side aggregation
const topProductsData = computed(() =>
  topProducts.value.slice(0, 10).map((p: any) => [p.product, Number(p.revenue) || 0]),
)
const topProductMax = computed(() => {
  const max = Math.max(...topProductsData.value.map(e => e[1]), 0)
  return max || 1
})
function topProductBarWidth(val: number): string {
  return `${Math.max((val / topProductMax.value) * 100, 2).toFixed(1)}%`
}

// Category breakdown from server-side aggregation
const categorySeries = computed(() => categoryData.value.map((c: any) => Number(c.revenue) || 0))
const categoryOptions = computed(() => donutOptions({ labels: categoryData.value.map((c: any) => c.category) }))

// ===== Heatmap (6 months of daily revenue, server-side) =====
const heatmapSeries = computed(() => {
  const now = new Date()
  const months: { label: string; year: number; month: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ label: d.toLocaleDateString('en-GB', { month: 'short' }), year: d.getFullYear(), month: d.getMonth() })
  }
  // Build a date→revenue lookup from the 6-month daily revenue data
  const revByDate = new Map<string, number>()
  for (const r of dailyRevenue6m.value) {
    const dStr = new Date(r.date).toISOString().slice(0, 10)
    revByDate.set(dStr, Number(r.revenue) || 0)
  }
  return months.map(m => {
    const days: { x: string; y: number }[] = []
    const daysInMonth = new Date(m.year, m.month + 1, 0).getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      const dStr = `${m.year}-${String(m.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      days.push({ x: String(day), y: Math.round(revByDate.get(dStr) || 0) })
    }
    return { name: m.label, data: days }
  })
})

const heatmapChartOptions = computed(() => heatmapOptions())

// ===== Time-of-Day Breakdown (from server-side hourly-sales) =====
const TOD_RANGES = [
  { label: 'Morning',   icon: 'mdi-weather-sunny',        color: 'linear-gradient(135deg, #fbbf24, #f59e0b)', hours: [6, 7, 8, 9, 10, 11],  sub: '6am–12pm' },
  { label: 'Afternoon', icon: 'mdi-weather-partly-cloudy', color: 'linear-gradient(135deg, #60a5fa, #3b82f6)', hours: [12, 13, 14, 15],       sub: '12pm–4pm' },
  { label: 'Evening',   icon: 'mdi-weather-sunset',        color: 'linear-gradient(135deg, #fb923c, #ea580c)', hours: [16, 17, 18, 19],       sub: '4pm–8pm' },
  { label: 'Night',     icon: 'mdi-weather-night',         color: 'linear-gradient(135deg, #818cf8, #6366f1)', hours: [20, 21, 22, 23],      sub: '8pm–12am' },
  { label: 'Late Night',icon: 'mdi-moon-crescent',         color: 'linear-gradient(135deg, #a78bfa, #7c3aed)', hours: [0, 1, 2, 3, 4, 5],    sub: '12am–6am' },
]

const _hourlyMap = computed(() => {
  const map: Record<number, { revenue: number; count: number }> = {}
  for (let h = 0; h < 24; h++) map[h] = { revenue: 0, count: 0 }
  for (const r of hourlyData.value) {
    const h = Number(r.hour)
    if (h >= 0 && h < 24) map[h] = { revenue: Number(r.revenue) || 0, count: Number(r.transactions) || 0 }
  }
  return map
})

const todChartSeries = computed(() => {
  const m = _hourlyMap.value
  return [
    { name: 'Revenue', type: 'bar' as const, data: TOD_RANGES.map(r => r.hours.reduce((s, h) => s + m[h].revenue, 0)) },
    { name: 'Transactions', type: 'bar' as const, data: TOD_RANGES.map(r => r.hours.reduce((s, h) => s + m[h].count, 0)) },
  ]
})

const todChartOptions = computed(() => {
  const c = chartColors.value
  const darkMode = c.surface.split(',').reduce((s: number, v: string) => s + Number(v), 0) / 3 < 128
  return {
  chart: { type: 'bar' as const, toolbar: { show: false }, background: 'transparent', foreColor: c.foreColor, fontFamily: '"Segoe UI Variable", Inter, sans-serif' },
  colors: [`rgb(${c.primary})`, `rgb(${c.warning})`],
  fill: { type: 'gradient' as const, gradient: { shade: 'light', type: 'vertical' as const, opacityFrom: 0.85, opacityTo: 0.45, stops: [0, 100] }, opacity: [0.9, 0.9] },
  stroke: { width: 0, colors: ['transparent'] },
  plotOptions: { bar: { borderRadius: 8, columnWidth: '45%' } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: TOD_RANGES.map(r => r.label),
    labels: { style: { colors: c.foreColor, fontSize: '13px', fontWeight: 600 } },
    axisBorder: { show: true, color: c.grid },
    axisTicks: { show: true, color: c.grid },
  },
  yaxis: [
    { title: { text: 'Revenue', style: { color: c.foreColor, fontSize: '12px', fontWeight: 500 } }, labels: { style: { colors: c.foreColor, fontSize: '12px' }, formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0) } },
    { opposite: true, title: { text: 'Transactions', style: { color: c.foreColor, fontSize: '12px', fontWeight: 500 } }, labels: { style: { colors: c.foreColor, fontSize: '12px' }, formatter: (v: number) => v.toFixed(0) } },
  ],
  grid: { borderColor: c.grid, strokeDashArray: 4 },
  legend: { show: true, position: 'top' as const, fontSize: '13px', fontWeight: 500, labels: { colors: c.foreColor }, markers: { size: 5 } },
  tooltip: { theme: darkMode ? 'dark' : 'light', y: { formatter: (v: number, opts: { seriesIndex: number }) => opts.seriesIndex === 0 ? currency(v) : `${v} txns` } },
  }
})

const todRangeStats = computed(() => {
  const m = _hourlyMap.value
  const totalRevenue = Object.values(m).reduce((s, v) => s + v.revenue, 0) || 1
  const totalCount = Object.values(m).reduce((s, v) => s + v.count, 0) || 1
  return TOD_RANGES.map(r => {
    const revenue = r.hours.reduce((s: number, h: number) => s + m[h].revenue, 0)
    const count = r.hours.reduce((s: number, h: number) => s + m[h].count, 0)
    return { ...r, revenue, count, revenuePct: (revenue / totalRevenue) * 100, sharePct: (count / totalCount) * 100 }
  })
})

const todBusiestRange = computed(() => {
  const stats = todRangeStats.value
  if (!stats.length) return null
  return stats.reduce((best, r) => r.revenue > best.revenue ? r : best, stats[0])
})

// ===== Recent transactions (only fetch 8, not 500) =====
const recentTransactions = computed(() => recentTx.value)

// ===== Data Loading (server-side aggregation) =====
async function loadData() {
  if (loading.value) return
  loading.value = true
  error.value = false
  try {
    const dp = dateRangeParams()
    // 6-month range for the heatmap
    const now = new Date()
    const hmStart = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const hmFrom = hmStart.toISOString().slice(0, 10)
    const hmTo = now.toISOString().slice(0, 10)

    const [
      kpisRes, dailyRes, daily6mRes, hourlyRes,
      paymentRes, productsRes, categoryRes, lowStockRes, recentRes,
    ] = await Promise.all([
      useApi()(`/reports/dashboard-kpis/?${branchParam('').replace(/^\&/, '')}${dp}`).catch(() => ({})),
      useApi()(`/reports/daily-revenue/?${branchParam('').replace(/^\&/, '')}${dp}`).catch(() => []),
      useApi()(`/reports/daily-revenue/?${branchParam('').replace(/^\&/, '')}&date_from=${hmFrom}&date_to=${hmTo}`).catch(() => []),
      useApi()(`/reports/hourly-sales/?${branchParam('').replace(/^\&/, '')}${dp}`).catch(() => []),
      useApi()(`/reports/payment-methods/?${branchParam('').replace(/^\&/, '')}${dp}`).catch(() => []),
      useApi()(`/reports/sales-by-product/?${branchParam('').replace(/^\&/, '')}${dp}`).catch(() => []),
      useApi()(`/reports/sales-by-category/?${branchParam('').replace(/^\&/, '')}${dp}`).catch(() => []),
      useApi()(`/reports/low-stock/${branchParam('?')}`).catch(() => []),
      useApi()(`/pos/transactions/?page_size=8&status=completed${branchParam()}`).catch(() => ({ results: [] })),
    ])

    kpiData.value = kpisRes || {}
    dailyRevenue.value = Array.isArray(dailyRes) ? dailyRes : []
    dailyRevenue6m.value = Array.isArray(daily6mRes) ? daily6mRes : []
    hourlyData.value = Array.isArray(hourlyRes) ? hourlyRes : []
    paymentData.value = Array.isArray(paymentRes) ? paymentRes : []
    topProducts.value = Array.isArray(productsRes) ? productsRes : []
    categoryData.value = Array.isArray(categoryRes) ? categoryRes : []
    lowStockItems.value = Array.isArray(lowStockRes) ? lowStockRes : []
    recentTx.value = recentRes?.results || recentRes || []
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

// ===== Export CSV (fetches full transaction set only on demand) =====
const exporting = ref(false)
async function exportCSV() {
  if (exporting.value) return
  exporting.value = true
  try {
    const dp = dateRangeParams()
    // Fetch all completed transactions for the selected period
    const txData = await useApi()(`/pos/transactions/?page_size=500${branchParam()}${dp}`)
    const rows = txData.results || txData
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
  } catch {
    toast.error('Failed to export transactions')
  } finally {
    exporting.value = false
  }
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
          <h1 class="text-h5 font-weight-bold dash-title-gradient">Dashboard</h1>
          <p class="text-body-2 text-medium-emphasis">
            <span class="dash-live-dot" />
            {{ greeting }} — here's your store at a glance
          </p>
        </div>
      </div>
      <div class="dash-header__actions">
        <div class="dash-header__branch d-none d-md-flex align-center">
          <v-icon size="16" color="medium-emphasis" class="mr-1">mdi-store-outline</v-icon>
          <span class="text-caption text-medium-emphasis">{{ branchStore.branchName }}</span>
        </div>
        <DashboardPeriodSelector v-model="period" @custom="applyCustomRange" />
        <v-btn variant="tonal" prepend-icon="mdi-refresh" size="small" :loading="loading" @click="loadData">Refresh</v-btn>
        <v-btn variant="outlined" prepend-icon="mdi-download" size="small" :loading="exporting" @click="exportCSV">Export</v-btn>
      </div>
    </div>

    <div v-if="lastUpdated && !loading" class="dash-last-updated text-caption text-medium-emphasis">
      Last updated: {{ lastUpdated }}
    </div>

    <DashboardErrorState v-if="error && !loading" :on-retry="loadData" class="mb-6" />

    <!-- ===== Loading (skeleton) ===== -->
    <DashboardSkeleton v-if="loading && !hasData" />

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
          :sparkline-series="sparkTxSeries"
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
          :sparkline-series="sparkAovSeries"
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
          :sparkline-series="sparkStockSeries"
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
          :sparkline-series="sparkMarginSeries"
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
          :sparkline-series="sparkTurnoverSeries"
          to="/inventory/stock-analysis"
        />
      </div>

      <!-- ===== Charts Row 1: Revenue trend + Payment methods ===== -->
      <div class="dash-chart-row dash-chart-row--wide dash-animate dash-animate--2">
        <DashboardChartCard icon="mdi-chart-areaspline" title="Revenue Trend" :subtitle="`Daily revenue — ${periodLabel}`" color="primary" to="/analytics">
          <apexchart v-if="revenueSeries[0].data.length" type="area" height="300" :options="revenueOptions" :series="revenueSeries" />
          <DashboardEmptyState v-else icon="mdi-chart-areaspline" title="No revenue data for this period" />
        </DashboardChartCard>

        <DashboardChartCard icon="mdi-chart-donut" title="Payment Mix by Methods" subtitle="Revenue by payment type" color="success" to="/reports">
          <apexchart v-if="paymentSeries.length" type="donut" height="300" :options="paymentOptions" :series="paymentSeries" />
          <DashboardEmptyState v-else icon="mdi-chart-donut" title="No payment data yet" />
        </DashboardChartCard>
      </div>

      <!-- ===== Charts Row 2: Top products + Category breakdown ===== -->
      <div class="dash-chart-row dash-animate dash-animate--3">
        <DashboardChartCard icon="mdi-trophy-award" title="Top 10 Products" subtitle="Best sellers by revenue" color="indigo" to="/analytics/products">
          <div v-if="topProductsData.length" class="dash-top-products">
            <div
              v-for="(prod, i) in topProductsData"
              :key="prod[0]"
              class="dash-top-product-row dash-billing-row"
              :style="{ animationDelay: `${0.05 + i * 0.05}s` }"
            >
              <div class="d-flex align-center justify-space-between mb-1">
                <div class="d-flex align-center ga-2" style="min-width:0">
                  <span class="dash-top-product-rank" :class="`dash-top-product-rank--${i < 3 ? 'top' : 'rest'}`">{{ i + 1 }}</span>
                  <span class="text-body-2 font-weight-medium dash-top-product-name">{{ prod[0] }}</span>
                </div>
                <span class="text-body-2 font-weight-bold dash-top-product-value">{{ currency(prod[1]) }}</span>
              </div>
              <div class="dash-billing-meter">
                <div
                  class="dash-billing-meter-fill dash-shimmer-bar"
                  :style="{ width: topProductBarWidth(prod[1]), animationDelay: `${0.2 + i * 0.05}s` }"
                />
              </div>
            </div>
          </div>
          <DashboardEmptyState v-else icon="mdi-trophy-outline" title="No product sales yet" />
        </DashboardChartCard>

        <DashboardChartCard icon="mdi-chart-pie" title="Sales by Category" subtitle="Revenue distribution" color="amber" to="/analytics/categories">
          <apexchart v-if="categorySeries.length" type="donut" height="300" :options="categoryOptions" :series="categorySeries" />
          <DashboardEmptyState v-else icon="mdi-chart-arc" title="No category data yet" />
        </DashboardChartCard>
      </div>

      <!-- ===== Time of Day Breakdown ===== -->
      <div class="dash-chart-row dash-chart-row--full dash-animate dash-animate--4">
        <v-card flat border rounded="xl" class="overflow-hidden">
          <div class="d-flex align-center ga-2 pa-4 pb-2 flex-wrap">
            <v-avatar color="blue-grey-lighten-5" rounded="lg" size="36">
              <v-icon color="blue-grey" size="20">mdi-chart-bar</v-icon>
            </v-avatar>
            <div class="me-auto">
              <div class="text-subtitle-1 font-weight-bold">Time of Day Breakdown</div>
              <div class="text-caption text-medium-emphasis">Revenue and transactions grouped by time-of-day ranges</div>
            </div>
            <v-chip v-if="todBusiestRange" size="small" color="amber" variant="tonal" label>
              <v-icon start size="14">mdi-trophy</v-icon>
              Busiest: {{ todBusiestRange.label }} ({{ todBusiestRange.sub }})
            </v-chip>
          </div>
          <v-divider />
          <div class="peak-hours-layout">
            <div class="peak-hours-layout__chart">
              <apexchart v-if="todChartSeries[0].data.some((v: number) => v > 0)" type="bar" height="380" :options="todChartOptions" :series="todChartSeries" />
              <DashboardEmptyState v-else icon="mdi-chart-bar-offline" title="No time-of-day data yet" />
            </div>
            <div class="peak-hours-layout__ranges">
              <div
                v-for="r in todRangeStats"
                :key="r.label"
                class="time-range-card"
                :class="{ 'time-range-card--peak': r.label === todBusiestRange?.label }"
              >
                <div class="time-range-card__bar" :style="{ background: r.color }" />
                <div class="time-range-card__body">
                  <div class="d-flex align-center ga-1">
                    <v-icon size="16" :color="r.label === todBusiestRange?.label ? 'amber' : undefined">{{ r.icon }}</v-icon>
                    <span class="text-subtitle-2 font-weight-bold">{{ r.label }}</span>
                    <v-icon v-if="r.label === todBusiestRange?.label" size="14" color="amber">mdi-trophy</v-icon>
                    <v-spacer />
                    <span class="text-caption text-medium-emphasis" style="font-size: 11px;">{{ r.sub }}</span>
                  </div>
                  <div class="d-flex align-center ga-2 mt-2">
                    <div class="text-subtitle-1 font-weight-bold">{{ currency(r.revenue) }}</div>
                    <v-spacer />
                    <span class="text-caption" style="font-size: 10px;">{{ r.revenuePct.toFixed(0) }}% rev</span>
                  </div>
                  <div class="time-range-card__progress mt-1">
                    <div class="time-range-card__progress-fill" :style="{ width: r.revenuePct + '%', background: r.color }" />
                  </div>
                  <div class="text-caption text-medium-emphasis mt-1" style="font-size: 10px;">
                    {{ r.count }} txn{{ r.count === 1 ? '' : 's' }} · {{ r.sharePct.toFixed(0) }}% of day
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-card>
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

      <!-- ===== Quick Actions ===== -->
      <div class="dash-quick-actions dash-animate dash-animate--6">
        <div class="dash-quick-actions__title">
          <v-icon size="18" icon="mdi-lightning-bolt" />
          Quick Actions
        </div>
        <div class="dash-quick-actions__grid">
          <NuxtLink to="/pos" class="qa-card qa-card--pos dash-stagger-row" :style="{ animationDelay: '0.05s' }">
            <div class="qa-card__icon dash-qa-icon"><v-icon size="22" icon="mdi-cash-register" /></div>
            <div class="qa-card__label">New Sale</div>
            <div class="qa-card__desc">Open POS register</div>
          </NuxtLink>
          <NuxtLink to="/products" class="qa-card qa-card--products dash-stagger-row" :style="{ animationDelay: '0.10s' }">
            <div class="qa-card__icon dash-qa-icon"><v-icon size="22" icon="mdi-package-variant-closed" /></div>
            <div class="qa-card__label">Add Product</div>
            <div class="qa-card__desc">Manage stock items</div>
          </NuxtLink>
          <NuxtLink to="/pos/history" class="qa-card qa-card--history dash-stagger-row" :style="{ animationDelay: '0.15s' }">
            <div class="qa-card__icon dash-qa-icon"><v-icon size="22" icon="mdi-receipt-text-outline" /></div>
            <div class="qa-card__label">Sales History</div>
            <div class="qa-card__desc">View past sales</div>
          </NuxtLink>
          <NuxtLink to="/customers" class="qa-card qa-card--customers dash-stagger-row" :style="{ animationDelay: '0.20s' }">
            <div class="qa-card__icon dash-qa-icon"><v-icon size="22" icon="mdi-account-plus-outline" /></div>
            <div class="qa-card__label">New Customer</div>
            <div class="qa-card__desc">Add or manage</div>
          </NuxtLink>
          <NuxtLink to="/products?tab=products" class="qa-card qa-card--inventory dash-stagger-row" :style="{ animationDelay: '0.25s' }">
            <div class="qa-card__icon dash-qa-icon"><v-icon size="22" icon="mdi-clipboard-list-outline" /></div>
            <div class="qa-card__label">Inventory</div>
            <div class="qa-card__desc">Stock levels</div>
          </NuxtLink>
          <NuxtLink to="/analytics" class="qa-card qa-card--reports dash-stagger-row" :style="{ animationDelay: '0.30s' }">
            <div class="qa-card__icon dash-qa-icon"><v-icon size="22" icon="mdi-chart-box-outline" /></div>
            <div class="qa-card__label">Analytics</div>
            <div class="qa-card__desc">Insights and trends</div>
          </NuxtLink>
          <NuxtLink to="/pos/parked" class="qa-card qa-card--parked dash-stagger-row" :style="{ animationDelay: '0.35s' }">
            <div class="qa-card__icon dash-qa-icon"><v-icon size="22" icon="mdi-pause-circle-outline" /></div>
            <div class="qa-card__label">Parked Sales</div>
            <div class="qa-card__desc">Resume held sales</div>
          </NuxtLink>
          <NuxtLink to="/pos/shifts" class="qa-card qa-card--shifts dash-stagger-row" :style="{ animationDelay: '0.40s' }">
            <div class="qa-card__icon dash-qa-icon"><v-icon size="22" icon="mdi-clock-outline" /></div>
            <div class="qa-card__label">Shifts</div>
            <div class="qa-card__desc">Open or close shift</div>
          </NuxtLink>
        </div>
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

/* Live dot indicator */
.dash-live-dot {
  position: relative;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(var(--v-theme-success));
  margin-right: 4px;
  vertical-align: middle;
}
.dash-live-dot::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgb(var(--v-theme-success));
  animation: dash-ripple 1.8s ease-out infinite;
}

/* Gradient title */
.dash-title-gradient {
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)), rgb(var(--v-theme-primary)));
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: dash-title-pan 6s ease-in-out infinite;
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

/* ===== Quick Actions ===== */
.dash-quick-actions {
  margin-bottom: 20px;
}
.dash-quick-actions__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}
.dash-quick-actions__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.qa-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 18px 12px;
  border-radius: 16px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgb(var(--v-theme-surface));
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  animation: dash-stagger-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  opacity: 0;
}
.qa-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(var(--v-theme-on-surface), 0.14);
  border-color: rgba(var(--v-theme-primary), 0.3);
}
.qa-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}
.qa-card:hover .dash-qa-icon {
  animation: dash-icon-bounce 0.6s ease-in-out;
}
.qa-card__label {
  font-size: 0.875rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.85);
  line-height: 1.2;
}
.qa-card__desc {
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.45);
  margin-top: 2px;
  line-height: 1.2;
}
/* Per-card accent colors */
.qa-card--pos .qa-card__icon { background: rgba(var(--v-theme-primary), 0.1); color: rgb(var(--v-theme-primary)); }
.qa-card--pos:hover .qa-card__icon { background: rgb(var(--v-theme-primary)); color: #fff; }
.qa-card--products .qa-card__icon { background: rgba(var(--v-theme-success), 0.1); color: rgb(var(--v-theme-success)); }
.qa-card--products:hover .qa-card__icon { background: rgb(var(--v-theme-success)); color: #fff; }
.qa-card--history .qa-card__icon { background: rgba(var(--v-theme-info), 0.1); color: rgb(var(--v-theme-info)); }
.qa-card--history:hover .qa-card__icon { background: rgb(var(--v-theme-info)); color: #fff; }
.qa-card--customers .qa-card__icon { background: rgba(var(--v-theme-warning), 0.1); color: rgb(var(--v-theme-warning)); }
.qa-card--customers:hover .qa-card__icon { background: rgb(var(--v-theme-warning)); color: #fff; }
.qa-card--inventory .qa-card__icon { background: rgba(var(--v-theme-indigo), 0.1); color: rgb(var(--v-theme-indigo)); }
.qa-card--inventory:hover .qa-card__icon { background: rgb(var(--v-theme-indigo)); color: #fff; }
.qa-card--reports .qa-card__icon { background: rgba(var(--v-theme-purple), 0.1); color: rgb(var(--v-theme-purple)); }
.qa-card--reports:hover .qa-card__icon { background: rgb(var(--v-theme-purple)); color: #fff; }
.qa-card--parked .qa-card__icon { background: rgba(var(--v-theme-orange), 0.1); color: rgb(var(--v-theme-orange)); }
.qa-card--parked:hover .qa-card__icon { background: rgb(var(--v-theme-orange)); color: #fff; }
.qa-card--shifts .qa-card__icon { background: rgba(var(--v-theme-teal), 0.1); color: rgb(var(--v-theme-teal)); }
.qa-card--shifts:hover .qa-card__icon { background: rgb(var(--v-theme-teal)); color: #fff; }

/* ===== Top 10 Products meter bars ===== */
.dash-top-products {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
}
.dash-top-product-row {
  animation: dash-row-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  opacity: 0;
}
.dash-top-product-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}
.dash-top-product-value {
  white-space: nowrap;
  flex-shrink: 0;
}
.dash-top-product-rank {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
}
.dash-top-product-rank--top {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  box-shadow: 0 3px 8px rgba(245, 158, 11, 0.30);
}
.dash-top-product-rank--rest {
  background: rgba(var(--v-theme-on-surface), 0.08);
  color: rgba(var(--v-theme-on-surface), 0.5);
}
.dash-billing-meter {
  height: 8px;
  border-radius: 9999px;
  background: rgba(var(--v-theme-on-surface), 0.08);
  overflow: hidden;
}
.dash-billing-meter-fill {
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(90deg, #3478f6, #6366f1, #8b5cf6);
  animation: dash-meter-fill 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  width: 0%;
  position: relative;
  overflow: hidden;
}
/* Shimmer sweep on meter bars */
.dash-shimmer-bar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 0%, rgba(255, 255, 255, 0.35) 50%, transparent 100%);
  transform: translateX(-150%);
  animation: dash-shimmer-sweep 2.5s ease-in-out infinite;
  animation-delay: 0.8s;
}
:global(.v-theme--dark) .dash-shimmer-bar::after {
  background: linear-gradient(110deg, transparent 0%, rgba(255, 255, 255, 0.12) 50%, transparent 100%);
}

@keyframes dash-row-in {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes dash-meter-fill {
  from { width: 0%; }
}

/* ===== Responsive ===== */
@media (max-width: 1400px) {
  .dash-kpi-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1200px) {
  .dash-chart-row,
  .dash-chart-row--wide { grid-template-columns: 1fr; }
  .dash-quick-actions__grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1024px) {
  .dash-kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .dash-quick-actions__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .dash-last-updated { padding-left: 0; }
}
@media (max-width: 768px) {
  .dash-page { padding: 12px; }
  .dash-kpi-grid { grid-template-columns: 1fr 1fr; }
  .dash-bottom-row { grid-template-columns: 1fr; }
  .dash-quick-actions__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .dash-kpi-grid { grid-template-columns: 1fr; }
  .dash-quick-actions__grid { grid-template-columns: 1fr; }
}

/* ===== Dark theme overrides for quick actions ===== */
:deep(.v-theme--dark) .qa-card {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.08);
}
:deep(.v-theme--dark) .qa-card__label { color: rgba(255, 255, 255, 0.85); }
:deep(.v-theme--dark) .qa-card__desc { color: rgba(255, 255, 255, 0.4); }
:deep(.v-theme--dark) .dash-quick-actions__title { color: rgba(255, 255, 255, 0.5); }

/* ===== Peak Hours (Time of Day Breakdown) ===== */
.peak-hours-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 0;
  align-items: stretch;
}
.peak-hours-layout__chart {
  padding: 16px;
  min-width: 0;
}
.peak-hours-layout__ranges {
  padding: 16px 16px 16px 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  border-left: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  align-content: center;
}
@media (max-width: 959px) {
  .peak-hours-layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .peak-hours-layout__ranges {
    padding: 0 16px 16px;
    border-left: none;
    border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  }
  .peak-hours-layout__chart { padding-bottom: 4px; }
}
.time-range-card {
  display: flex;
  flex-direction: row;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgb(var(--v-theme-surface));
  transition: box-shadow 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}
.time-range-card:hover {
  transform: translateY(-2px);
  border-color: rgba(var(--v-theme-on-surface), 0.16);
}
.time-range-card--peak {
  border-color: rgba(245, 158, 11, 0.45);
  box-shadow: 0 2px 12px rgba(245, 158, 11, 0.18);
}
.time-range-card--peak:hover {
  box-shadow: 0 4px 18px rgba(245, 158, 11, 0.28);
  transform: translateY(-3px);
}
.time-range-card__bar {
  width: 5px;
  flex-shrink: 0;
}
.time-range-card__body {
  padding: 12px 14px 12px 12px;
  flex: 1;
  min-width: 0;
}
.time-range-card__progress {
  width: 100%;
  height: 5px;
  border-radius: 3px;
  background: rgba(var(--v-theme-on-surface), 0.08);
  overflow: hidden;
}
.time-range-card__progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

/* ===== Dark theme overrides for top product meter ===== */
:deep(.v-theme--dark) .dash-billing-meter {
  background: rgba(255, 255, 255, 0.08);
}
:deep(.v-theme--dark) .dash-top-product-rank--rest {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
}

/* ===== Reduce motion ===== */
@media (prefers-reduced-motion: reduce) {
  .dash-top-product-row,
  .dash-billing-meter-fill {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>

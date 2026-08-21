<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { currency, datetime, number } = useFormat()
const toast = useToast()
const branchStore = useBranchStore()
const chartOptions = useChartOptions()
const { areaOptions, barOptions, donutOptions, heatmapOptions } = chartOptions
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
    colors: [`rgb(${chartColors.value.primary})`, `rgb(${chartColors.value.error})`, `rgb(${chartColors.value.success})`],
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
    color: `rgb(${chartColors.value.primary})`,
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

// ===== Time-of-Day Breakdown =====
const TOD_RANGES = [
  { label: 'Morning',   icon: 'mdi-weather-sunny',        color: 'linear-gradient(135deg, #fbbf24, #f59e0b)', hours: [6, 7, 8, 9, 10, 11],  sub: '6am–12pm' },
  { label: 'Afternoon', icon: 'mdi-weather-partly-cloudy', color: 'linear-gradient(135deg, #60a5fa, #3b82f6)', hours: [12, 13, 14, 15],       sub: '12pm–4pm' },
  { label: 'Evening',   icon: 'mdi-weather-sunset',        color: 'linear-gradient(135deg, #fb923c, #ea580c)', hours: [16, 17, 18, 19],       sub: '4pm–8pm' },
  { label: 'Night',     icon: 'mdi-weather-night',         color: 'linear-gradient(135deg, #818cf8, #6366f1)', hours: [20, 21, 22, 23],      sub: '8pm–12am' },
  { label: 'Late Night',icon: 'mdi-moon-crescent',         color: 'linear-gradient(135deg, #a78bfa, #7c3aed)', hours: [0, 1, 2, 3, 4, 5],    sub: '12am–6am' },
]

const todChartSeries = computed(() => {
  const revenueByHour: Record<number, number> = {}
  const countByHour: Record<number, number> = {}
  for (let h = 0; h < 24; h++) { revenueByHour[h] = 0; countByHour[h] = 0 }
  for (const t of inRange.value) {
    if (t.status !== 'completed') continue
    const h = new Date(t.created_at).getHours()
    revenueByHour[h] += Number(t.total) || 0
    countByHour[h]++
  }
  return [
    { name: 'Revenue', type: 'bar' as const, data: TOD_RANGES.map(r => r.hours.reduce((s, h) => s + revenueByHour[h], 0)) },
    { name: 'Transactions', type: 'bar' as const, data: TOD_RANGES.map(r => r.hours.reduce((s, h) => s + countByHour[h], 0)) },
  ]
})

const todChartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
  colors: ['#1976d2', '#ffa726'],
  fill: { type: 'gradient', gradient: { shade: 'light', type: 'vertical', opacityFrom: 0.85, opacityTo: 0.45, stops: [0, 100] }, opacity: [0.9, 0.9] },
  stroke: { width: 0, colors: ['transparent'] },
  plotOptions: { bar: { borderRadius: 8, columnWidth: '45%' } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: TOD_RANGES.map(r => r.label),
    labels: { style: { fontSize: '13px', fontWeight: 600 } },
    axisBorder: { show: true },
    axisTicks: { show: true },
  },
  yaxis: [
    { title: { text: 'Revenue', style: { fontSize: '11px' } }, labels: { formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0) } },
    { opposite: true, title: { text: 'Transactions', style: { fontSize: '11px' } }, labels: { formatter: (v: number) => v.toFixed(0) } },
  ],
  grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
  legend: { show: true, position: 'top', fontSize: '12px', markers: { size: 4 } },
  tooltip: { y: { formatter: (v: number, { seriesIndex }: { seriesIndex: number }) => seriesIndex === 0 ? currency(v) : `${v} txns` } },
}))

const todRangeStats = computed(() => {
  const revenueByHour: Record<number, number> = {}
  const countByHour: Record<number, number> = {}
  for (let h = 0; h < 24; h++) { revenueByHour[h] = 0; countByHour[h] = 0 }
  for (const t of inRange.value) {
    if (t.status !== 'completed') continue
    const h = new Date(t.created_at).getHours()
    revenueByHour[h] += Number(t.total) || 0
    countByHour[h]++
  }
  const totalRevenue = Object.values(revenueByHour).reduce((s, v) => s + v, 0) || 1
  const totalCount = Object.values(countByHour).reduce((s, v) => s + v, 0) || 1
  return TOD_RANGES.map(r => {
    const revenue = r.hours.reduce((s: number, h: number) => s + revenueByHour[h], 0)
    const count = r.hours.reduce((s: number, h: number) => s + countByHour[h], 0)
    return { ...r, revenue, count, revenuePct: (revenue / totalRevenue) * 100, sharePct: (count / totalCount) * 100 }
  })
})

const todBusiestRange = computed(() => {
  const stats = todRangeStats.value
  if (!stats.length) return null
  return stats.reduce((best, r) => r.revenue > best.revenue ? r : best, stats[0])
})

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
          <NuxtLink to="/pos" class="qa-card qa-card--pos">
            <div class="qa-card__icon"><v-icon size="22" icon="mdi-cash-register" /></div>
            <div class="qa-card__label">New Sale</div>
            <div class="qa-card__desc">Open POS register</div>
          </NuxtLink>
          <NuxtLink to="/products" class="qa-card qa-card--products">
            <div class="qa-card__icon"><v-icon size="22" icon="mdi-package-variant-closed" /></div>
            <div class="qa-card__label">Add Product</div>
            <div class="qa-card__desc">Manage stock items</div>
          </NuxtLink>
          <NuxtLink to="/pos/history" class="qa-card qa-card--history">
            <div class="qa-card__icon"><v-icon size="22" icon="mdi-receipt-text-outline" /></div>
            <div class="qa-card__label">Sales History</div>
            <div class="qa-card__desc">View past sales</div>
          </NuxtLink>
          <NuxtLink to="/customers" class="qa-card qa-card--customers">
            <div class="qa-card__icon"><v-icon size="22" icon="mdi-account-plus-outline" /></div>
            <div class="qa-card__label">New Customer</div>
            <div class="qa-card__desc">Add or manage</div>
          </NuxtLink>
          <NuxtLink to="/products?tab=products" class="qa-card qa-card--inventory">
            <div class="qa-card__icon"><v-icon size="22" icon="mdi-clipboard-list-outline" /></div>
            <div class="qa-card__label">Inventory</div>
            <div class="qa-card__desc">Stock levels</div>
          </NuxtLink>
          <NuxtLink to="/analytics" class="qa-card qa-card--reports">
            <div class="qa-card__icon"><v-icon size="22" icon="mdi-chart-box-outline" /></div>
            <div class="qa-card__label">Analytics</div>
            <div class="qa-card__desc">Insights and trends</div>
          </NuxtLink>
          <NuxtLink to="/pos/parked" class="qa-card qa-card--parked">
            <div class="qa-card__icon"><v-icon size="22" icon="mdi-pause-circle-outline" /></div>
            <div class="qa-card__label">Parked Sales</div>
            <div class="qa-card__desc">Resume held sales</div>
          </NuxtLink>
          <NuxtLink to="/pos/shifts" class="qa-card qa-card--shifts">
            <div class="qa-card__icon"><v-icon size="22" icon="mdi-clock-outline" /></div>
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
}
.qa-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-on-surface), 0.12);
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
</style>

<template>
  <div class="az-page">
    <!-- ===== Header ===== -->
    <div class="az-header">
      <div class="az-header__left">
        <div class="az-header__title">
          <h1 class="text-h5 font-weight-bold">Analytics Overview</h1>
          <p class="text-body-2 text-medium-emphasis">Business performance, revenue trends and operational insights</p>
        </div>
      </div>
      <div class="az-header__actions">
        <v-btn-group density="compact" variant="outlined" color="primary">
          <v-btn v-for="opt in periodOptions" :key="opt.value" :variant="period === opt.value ? 'flat' : 'text'" :color="period === opt.value ? 'primary' : undefined" size="small" @click="period = opt.value">{{ opt.short }}</v-btn>
        </v-btn-group>
        <v-btn variant="tonal" prepend-icon="mdi-refresh" size="small" @click="loadData" :loading="loading">Refresh</v-btn>
        <v-btn variant="text" prepend-icon="mdi-printer-outline" size="small" @click="printReport">Export</v-btn>
      </div>
    </div>

    <!-- ===== Loading ===== -->
    <div v-if="loading && transactions.length === 0" class="az-loading">
      <v-progress-circular indeterminate color="primary" size="32" width="3" />
      <p class="text-body-2 text-medium-emphasis mt-3">Loading analytics…</p>
    </div>

    <template v-else>
      <!-- ===== KPI Row ===== -->
      <div class="az-kpi-grid">
        <div class="az-kpi">
          <div class="az-kpi__icon az-kpi__icon--success"><v-icon size="22">mdi-cash-multiple</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Revenue</p>
            <p class="az-kpi__value text-success">{{ formatMoney(kpis.revenue) }}</p>
            <div class="az-kpi__trend" :class="kpis.revGrowth >= 0 ? 'az-kpi__trend--up' : 'az-kpi__trend--down'">
              <v-icon size="14">{{ kpis.revGrowth >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}</v-icon>
              <span>{{ Math.abs(kpis.revGrowth).toFixed(1) }}% vs prev</span>
            </div>
          </div>
        </div>

        <div class="az-kpi">
          <div class="az-kpi__icon az-kpi__icon--primary"><v-icon size="22">mdi-receipt-text-multiple</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Transactions</p>
            <p class="az-kpi__value">{{ kpis.txCount }}</p>
            <p class="az-kpi__sub">{{ kpis.items }} items sold</p>
          </div>
        </div>

        <div class="az-kpi">
          <div class="az-kpi__icon az-kpi__icon--info"><v-icon size="22">mdi-chart-line-streets-measurement</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Avg. Order Value</p>
            <p class="az-kpi__value text-info">{{ formatMoney(kpis.aov) }}</p>
            <p class="az-kpi__sub">{{ kpis.discount }} discounts given</p>
          </div>
        </div>

        <div class="az-kpi">
          <div class="az-kpi__icon az-kpi__icon--warning"><v-icon size="22">mdi-tag-minus</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Total Discounts</p>
            <p class="az-kpi__value text-warning">{{ formatMoney(totalDiscountAmount) }}</p>
            <p class="az-kpi__sub">{{ kpis.discount }} transactions</p>
          </div>
        </div>

        <div class="az-kpi">
          <div class="az-kpi__icon az-kpi__icon--teal"><v-icon size="22">mdi-package-variant</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Stock Value</p>
            <p class="az-kpi__value" style="color: #00B8D4">{{ formatMoney(kpis.stockValue) }}</p>
            <p class="az-kpi__sub">{{ kpis.stockItems }} SKUs</p>
          </div>
        </div>

        <div class="az-kpi">
          <div class="az-kpi__icon az-kpi__icon--purple"><v-icon size="22">mdi-percent-circle</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Gross Margin</p>
            <p class="az-kpi__value" style="color: #7C4DFF">{{ grossMarginPct.toFixed(1) }}%</p>
            <p class="az-kpi__sub">{{ formatMoney(grossProfit) }} profit</p>
          </div>
        </div>
      </div>

      <!-- ===== Charts Row 1: Revenue trend + Payment methods ===== -->
      <div class="az-chart-row">
        <div class="az-card az-card--two-thirds">
          <div class="az-card__header">
            <div class="az-card__header-icon az-card__header-icon--blue"><v-icon size="20">mdi-chart-areaspline</v-icon></div>
            <div>
              <h3 class="az-card__title">Revenue Trend</h3>
              <p class="az-card__subtitle">Daily revenue over selected period</p>
            </div>
          </div>
          <div class="az-card__body az-card__body--scroll">
            <apexchart type="area" height="320" :options="revenueOptions" :series="revenueSeries" />
          </div>
        </div>

        <div class="az-card az-card--third">
          <div class="az-card__header">
            <div class="az-card__header-icon az-card__header-icon--green"><v-icon size="20">mdi-chart-donut</v-icon></div>
            <div>
              <h3 class="az-card__title">Payment Methods</h3>
              <p class="az-card__subtitle">Revenue by payment type</p>
            </div>
          </div>
          <div class="az-card__body">
            <apexchart type="donut" height="320" :options="paymentOptions" :series="paymentSeries" />
          </div>
        </div>
      </div>

      <!-- ===== Charts Row 2: Top products + Category breakdown ===== -->
      <div class="az-chart-row">
        <div class="az-card az-card--half">
          <div class="az-card__header">
            <div class="az-card__header-icon az-card__header-icon--indigo"><v-icon size="20">mdi-trophy-award</v-icon></div>
            <div>
              <h3 class="az-card__title">Top 10 Products by Revenue</h3>
              <p class="az-card__subtitle">Best-selling products this period</p>
            </div>
          </div>
          <div class="az-card__body">
            <apexchart type="bar" height="320" :options="topProductsOptions" :series="topProductsSeries" />
          </div>
        </div>

        <div class="az-card az-card--half">
          <div class="az-card__header">
            <div class="az-card__header-icon az-card__header-icon--amber"><v-icon size="20">mdi-chart-pie</v-icon></div>
            <div>
              <h3 class="az-card__title">Sales by Category</h3>
              <p class="az-card__subtitle">Revenue distribution</p>
            </div>
          </div>
          <div class="az-card__body">
            <apexchart type="donut" height="320" :options="categoryOptions" :series="categorySeries" />
          </div>
        </div>
      </div>

      <!-- ===== Charts Row 3: Hourly + Weekday ===== -->
      <div class="az-chart-row">
        <div class="az-card az-card--half">
          <div class="az-card__header">
            <div class="az-card__header-icon az-card__header-icon--teal"><v-icon size="20">mdi-clock-time-eight-outline</v-icon></div>
            <div>
              <h3 class="az-card__title">Hourly Sales Pattern</h3>
              <p class="az-card__subtitle">Revenue by hour of day</p>
            </div>
          </div>
          <div class="az-card__body">
            <apexchart type="bar" height="280" :options="hourlyOptions" :series="hourlySeries" />
          </div>
        </div>

        <div class="az-card az-card--half">
          <div class="az-card__header">
            <div class="az-card__header-icon az-card__header-icon--rose"><v-icon size="20">mdi-calendar-week-begin</v-icon></div>
            <div>
              <h3 class="az-card__title">Sales by Weekday</h3>
              <p class="az-card__subtitle">Average revenue by day of week</p>
            </div>
          </div>
          <div class="az-card__body">
            <apexchart type="radar" height="280" :options="weekdayOptions" :series="weekdaySeries" />
          </div>
        </div>
      </div>

      <!-- ===== Tabs: Cashier / Peak Hours / Recent ===== -->
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

      <!-- ===== Cashier Performance Tab ===== -->
      <div v-if="activeTab === 'cashiers'" class="az-table-wrap">
        <table class="az-table">
          <thead>
            <tr>
              <th>Cashier</th>
              <th class="text-right">Transactions</th>
              <th class="text-right">Revenue</th>
              <th class="text-right">Avg. Order</th>
              <th class="text-right">Items Sold</th>
              <th class="text-right">% of Revenue</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(c, idx) in cashierPerf" :key="idx" class="az-table__row">
              <td>
                <div class="az-cashier">
                  <div class="az-cashier__avatar" :class="`az-cashier__avatar--${idx % 4}`">{{ (c.cashier_name || '?').charAt(0).toUpperCase() }}</div>
                  <span class="az-table__product">{{ c.cashier_name || 'Unknown' }}</span>
                </div>
              </td>
              <td class="text-right">{{ c.count }}</td>
              <td class="text-right font-weight-bold text-success">{{ formatMoney(c.revenue) }}</td>
              <td class="text-right">{{ formatMoney(c.aov) }}</td>
              <td class="text-right">{{ c.items }}</td>
              <td class="text-right text-medium-emphasis">{{ c.sharePct.toFixed(1) }}%</td>
              <td>
                <div class="az-bar-wrap">
                  <div class="az-bar-fill az-bar-fill--success" :style="{ width: c.sharePct + '%' }"></div>
                </div>
              </td>
            </tr>
            <tr v-if="!cashierPerf.length">
              <td colspan="7" class="az-table__empty">
                <v-icon size="36" color="grey-lighten-1">mdi-account-tie</v-icon>
                <p class="text-body-2 mt-2 text-medium-emphasis">No cashier data for this period.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ===== Peak Hours Heatmap Tab ===== -->
      <div v-if="activeTab === 'hours'" class="az-heatmap">
        <div class="az-heatmap__info">
          <div class="az-heatmap__legend-item"><span class="az-heatmap__dot az-heatmap__dot--low"></span> Low</div>
          <div class="az-heatmap__legend-item"><span class="az-heatmap__dot az-heatmap__dot--mid"></span> Medium</div>
          <div class="az-heatmap__legend-item"><span class="az-heatmap__dot az-heatmap__dot--high"></span> High</div>
          <div class="az-heatmap__legend-item"><span class="az-heatmap__dot az-heatmap__dot--peak"></span> Peak</div>
        </div>
        <div class="az-heatmap__grid">
          <div class="az-heatmap__hour-label"></div>
          <div v-for="d in 7" :key="d" class="az-heatmap__day-label">{{ weekdayNames[d - 1] }}</div>
          <template v-for="h in 24" :key="h">
            <div class="az-heatmap__hour-label">{{ h - 1 }}:00</div>
            <div
              v-for="d in 7"
              :key="`${h}-${d}`"
              class="az-heatmap__cell"
              :class="heatmapClass(heatmapData[h - 1][d - 1])"
              :title="`${weekdayNames[d - 1]} ${h - 1}:00 — ${formatMoney(heatmapData[h - 1][d - 1])}`"
            >
              <span v-if="heatmapData[h - 1][d - 1] > 0" class="az-heatmap__val">{{ formatShortMoney(heatmapData[h - 1][d - 1]) }}</span>
            </div>
          </template>
        </div>
      </div>

      <!-- ===== Recent Transactions Tab ===== -->
      <div v-if="activeTab === 'recent'" class="az-table-wrap">
        <table class="az-table">
          <thead>
            <tr>
              <th>Transaction #</th>
              <th>Cashier</th>
              <th>Customer</th>
              <th>Payment</th>
              <th class="text-right">Items</th>
              <th class="text-right">Subtotal</th>
              <th class="text-right">Discount</th>
              <th class="text-right">Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in recentTransactions" :key="t.id" class="az-table__row">
              <td class="font-weight-medium">{{ t.transaction_number }}</td>
              <td class="text-medium-emphasis">{{ t.cashier_name || '—' }}</td>
              <td class="text-medium-emphasis">{{ t.customer_name || 'Walk-in' }}</td>
              <td>
                <span class="az-pay-badge" :class="`az-pay-badge--${t.payment_method}`">{{ t.payment_method_display || t.payment_method }}</span>
              </td>
              <td class="text-right">{{ t.items_count || 0 }}</td>
              <td class="text-right text-medium-emphasis">{{ formatMoney(t.subtotal) }}</td>
              <td class="text-right" :class="Number(t.discount) > 0 ? 'text-warning' : ''">{{ Number(t.discount) > 0 ? formatMoney(t.discount) : '—' }}</td>
              <td class="text-right font-weight-bold">{{ formatMoney(t.total) }}</td>
              <td>
                <span class="az-status-badge" :class="`az-status-badge--${t.status}`">
                  <span class="az-status-badge__dot"></span>
                  {{ t.status_display || t.status }}
                </span>
              </td>
              <td class="text-medium-emphasis">{{ formatDate(t.created_at) }}</td>
            </tr>
            <tr v-if="!recentTransactions.length">
              <td colspan="10" class="az-table__empty">
                <v-icon size="36" color="grey-lighten-1">mdi-receipt-text</v-icon>
                <p class="text-body-2 mt-2 text-medium-emphasis">No transactions in this period.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
const { currency } = useFormat()
const toast = useToast()

function formatMoney(v) { return currency(v || 0) }
function formatShortMoney(v) {
  const n = Number(v) || 0
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toFixed(0)
}
function formatDate(v) {
  return new Date(v).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
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
const loading = ref(false)
const transactions = ref([])
const products = ref([])
const activeTab = ref('cashiers')

const weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const tabs = computed(() => [
  { id: 'cashiers', label: 'Cashier Performance', icon: 'mdi-account-tie-outline', count: cashierPerf.value.length },
  { id: 'hours', label: 'Peak Hours Heatmap', icon: 'mdi-clock-time-eight-outline', count: '' },
  { id: 'recent', label: 'Recent Transactions', icon: 'mdi-receipt-text-outline', count: inRange.value.length },
])

function resolveRange(key) {
  const now = new Date(); const end = new Date(now); end.setHours(23, 59, 59, 999)
  const start = new Date(now); start.setHours(0, 0, 0, 0)
  if (key === 'today') return [start, end]
  if (key === '7d') { start.setDate(start.getDate() - 7); return [start, end] }
  if (key === '30d') { start.setDate(start.getDate() - 30); return [start, end] }
  if (key === '90d') { start.setDate(start.getDate() - 90); return [start, end] }
  if (key === 'thisMonth') { start.setDate(1); return [start, end] }
  return [new Date(2020, 0, 1), end]
}

const inRange = computed(() => {
  const [start, end] = resolveRange(period.value)
  return transactions.value.filter(t => {
    const d = new Date(t.created_at); return d >= start && d <= end && t.status === 'completed'
  })
})

const kpis = computed(() => {
  const list = inRange.value
  const revenue = list.reduce((s, t) => s + Number(t.total), 0)
  const txCount = list.length
  const items = list.reduce((s, t) => s + (t.items_count || 0), 0)
  const aov = txCount ? revenue / txCount : 0
  const discount = list.filter(t => Number(t.discount) > 0).length
  const stockItems = products.value.length
  const stockValue = products.value.reduce((s, p) => s + (Number(p.quantity_on_hand || 0) * Number(p.cost_price || 0)), 0)
  // Growth
  const [pStart, pEnd] = resolveRange(period.value)
  const rangeDays = (pEnd - pStart) / 86400000
  const prevEnd = new Date(pStart); prevEnd.setHours(0, 0, 0, 0)
  const prevStart = new Date(prevEnd); prevStart.setDate(prevStart.getDate() - rangeDays)
  const prevRev = transactions.value.filter(t => { const d = new Date(t.created_at); return d >= prevStart && d < prevEnd && t.status === 'completed' }).reduce((s, t) => s + Number(t.total), 0)
  const revGrowth = prevRev ? ((revenue - prevRev) / prevRev) * 100 : 0
  return { revenue, txCount, items, aov, discount, stockItems, stockValue, revGrowth }
})

const totalDiscountAmount = computed(() => inRange.value.reduce((s, t) => s + Number(t.discount || 0), 0))
const grossProfit = computed(() => {
  let cost = 0
  inRange.value.forEach(t => {
    (t.items || []).forEach(i => {
      const prod = products.value.find(p => p.name === i.product_name)
      cost += Number(i.quantity || 0) * Number(prod?.cost_price || 0)
    })
  })
  return kpis.value.revenue - cost
})
const grossMarginPct = computed(() => kpis.value.revenue ? (grossProfit.value / kpis.value.revenue) * 100 : 0)

// ===== Charts =====
const palette = ['#3478f6', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8', '#f43f5e', '#10b981']

const revenueSeries = computed(() => {
  const days = period.value === 'today' ? 1 : period.value === '7d' ? 7 : period.value === '90d' ? 90 : 30
  const now = new Date()
  const data = Array(days).fill(0)
  inRange.value.forEach(t => {
    const d = new Date(t.created_at)
    const diff = Math.floor((now - d) / 86400000)
    if (diff < days && diff >= 0) data[days - 1 - diff] += Number(t.total)
  })
  return [{ name: 'Revenue', data }]
})
const revenueOptions = computed(() => {
  const days = period.value === 'today' ? 1 : period.value === '7d' ? 7 : period.value === '90d' ? 90 : 30
  const labels = Array.from({ length: days }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (days - 1 - i)); return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) })
  // For periods > 30 days, render a wider chart that scrolls horizontally
  const chartWidth = days > 30 ? days * 18 : undefined
  return {
    chart: { type: 'area', toolbar: { show: false }, background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif', width: chartWidth },
    colors: ['#3478f6'],
    xaxis: { categories: labels, tickAmount: days <= 30 ? undefined : 15, labels: { rotate: -45, trim: false, style: { fontSize: '11px' } }, axisBorder: { show: days <= 30 }, axisTicks: { show: days <= 30 } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 100] } },
    grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
    yaxis: { decimalsInFloat: 0, labels: { formatter: (v) => Math.round(Number(v)).toLocaleString('en-GB') } },
    tooltip: { y: { formatter: (v) => formatMoney(Number(v)) } },
  }
})

const paymentSeries = computed(() => {
  const map = {}
  inRange.value.forEach(t => { map[t.payment_method] = (map[t.payment_method] || 0) + Number(t.total) })
  return Object.values(map)
})
const paymentOptions = computed(() => ({
  chart: { type: 'donut', background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
  labels: Object.keys(inRange.value.reduce((acc, t) => { acc[t.payment_method] = true; return acc }, {})),
  colors: palette,
  legend: { position: 'bottom', fontSize: '13px' },
  dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(0)}%` },
  tooltip: { y: { formatter: (v) => formatMoney(v) } },
  stroke: { width: 2, colors: ['rgb(var(--v-theme-surface))'] },
  plotOptions: { pie: { donut: { size: '65%' } } },
}))

const topProductsSeries = computed(() => {
  const map = {}
  inRange.value.forEach(t => (t.items || []).forEach(i => { map[i.product_name] = (map[i.product_name] || 0) + Number(i.line_total) }))
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10)
  return [{ name: 'Revenue', data: sorted.map(e => e[1]) }]
})
const topProductsOptions = computed(() => {
  const map = {}
  inRange.value.forEach(t => (t.items || []).forEach(i => { map[i.product_name] = (map[i.product_name] || 0) + Number(i.line_total) }))
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10)
  return {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
    colors: ['#6366f1'],
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: '70%' } },
    grid: { borderColor: 'rgba(0,0,0,0.06)', xaxis: { lines: { show: true } } },
    xaxis: { categories: sorted.map(e => e[0]), labels: { formatter: (v) => formatMoney(v) } },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (v) => formatMoney(v) } },
  }
})

const categorySeries = computed(() => {
  const map = {}
  inRange.value.forEach(t => (t.items || []).forEach(i => { const cat = i.category_name || 'Uncategorized'; map[cat] = (map[cat] || 0) + Number(i.line_total) }))
  return Object.values(map)
})
const categoryOptions = computed(() => ({
  chart: { type: 'donut', background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
  labels: Object.keys(inRange.value.reduce((acc, t) => { (t.items || []).forEach(i => { acc[i.category_name || 'Uncategorized'] = true }); return acc }, {})),
  colors: palette,
  legend: { position: 'bottom', fontSize: '13px' },
  dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(0)}%` },
  tooltip: { y: { formatter: (v) => formatMoney(v) } },
  stroke: { width: 2, colors: ['rgb(var(--v-theme-surface))'] },
  plotOptions: { pie: { donut: { size: '65%' } } },
}))

const hourlySeries = computed(() => {
  const hours = Array(24).fill(0)
  inRange.value.forEach(t => { const h = new Date(t.created_at).getHours(); hours[h] += Number(t.total) })
  return [{ name: 'Revenue', data: hours }]
})
const hourlyOptions = {
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
  colors: ['#00B8D4'],
  plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
  grid: { borderColor: 'rgba(0,0,0,0.06)', yaxis: { lines: { show: true } } },
  xaxis: { categories: Array.from({ length: 24 }, (_, i) => `${i}:00`), labels: { style: { fontSize: '10px' } } },
  dataLabels: { enabled: false },
  yaxis: { decimalsInFloat: 0, labels: { formatter: (v) => Math.round(Number(v)).toLocaleString('en-GB') } },
  tooltip: { y: { formatter: (v) => formatMoney(v) } },
}

const weekdaySeries = computed(() => {
  const days = [0, 0, 0, 0, 0, 0, 0] // Mon-Sun
  const counts = [0, 0, 0, 0, 0, 0, 0]
  inRange.value.forEach(t => {
    const jsDay = new Date(t.created_at).getDay() // 0=Sun
    const idx = jsDay === 0 ? 6 : jsDay - 1 // convert to Mon=0
    days[idx] += Number(t.total)
    counts[idx]++
  })
  // Average per weekday
  const avg = days.map((v, i) => counts[i] ? v / counts[i] : 0)
  return [{ name: 'Avg Revenue', data: avg }]
})
const weekdayOptions = {
  chart: { type: 'radar', toolbar: { show: false }, background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
  colors: ['#f43f5e'],
  xaxis: { categories: weekdayNames, labels: { style: { fontSize: '12px' } } },
  dataLabels: { enabled: false },
  yaxis: { decimalsInFloat: 0, labels: { formatter: (v) => Math.round(Number(v)).toLocaleString('en-GB') } },
  tooltip: { y: { formatter: (v) => formatMoney(v) } },
  fill: { opacity: 0.15 },
  stroke: { width: 2 },
  markers: { size: 4, colors: ['#f43f5e'] },
}

// ===== Cashier Performance =====
const cashierPerf = computed(() => {
  const map = {}
  inRange.value.forEach(t => {
    const name = t.cashier_name || 'Unknown'
    if (!map[name]) map[name] = { cashier_name: name, count: 0, revenue: 0, items: 0 }
    map[name].count++
    map[name].revenue += Number(t.total)
    map[name].items += t.items_count || 0
  })
  const totalRev = kpis.value.revenue || 1
  return Object.values(map).map(c => ({ ...c, aov: c.count ? c.revenue / c.count : 0, sharePct: (c.revenue / totalRev) * 100 })).sort((a, b) => b.revenue - a.revenue)
})

// ===== Heatmap data =====
const heatmapData = computed(() => {
  const grid = Array.from({ length: 24 }, () => Array(7).fill(0))
  inRange.value.forEach(t => {
    const d = new Date(t.created_at)
    const h = d.getHours()
    const jsDay = d.getDay()
    const dayIdx = jsDay === 0 ? 6 : jsDay - 1
    grid[h][dayIdx] += Number(t.total)
  })
  return grid
})

function heatmapIntensity(value) {
  if (value <= 0) return 0
  const max = Math.max(...heatmapData.value.flat())
  if (!max) return 0
  return value / max
}

function heatmapClass(value) {
  const intensity = heatmapIntensity(value)
  if (intensity === 0) return 'az-heatmap__cell--empty'
  if (intensity <= 0.25) return 'az-heatmap__cell--low'
  if (intensity <= 0.5) return 'az-heatmap__cell--mid'
  if (intensity <= 0.75) return 'az-heatmap__cell--high'
  return 'az-heatmap__cell--peak'
}

// ===== Recent transactions =====
const recentTransactions = computed(() => {
  return [...inRange.value].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 15)
})

// ===== Data =====
async function loadData() {
  loading.value = true
  try {
    const [txData, prodData] = await Promise.all([
      useApi()('/pos/transactions/?page_size=2000'),
      useApi()('/products/?page_size=500').catch(() => ({ results: [] })),
    ])
    transactions.value = txData.results || txData
    products.value = prodData.results || prodData
  } catch (e) {
    toast.error('Failed to load analytics data')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

function printReport() { window.print() }
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
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
.az-kpi {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: box-shadow 0.2s;
}
.az-kpi:hover { box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06); }
.az-kpi__icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.az-kpi__icon--success { background: rgba(76, 175, 80, 0.12); color: rgb(76, 175, 80); }
.az-kpi__icon--primary { background: rgba(52, 120, 246, 0.12); color: #3478f6; }
.az-kpi__icon--info    { background: rgba(33, 150, 243, 0.12); color: rgb(33, 150, 243); }
.az-kpi__icon--warning { background: rgba(255, 152, 0, 0.12); color: rgb(255, 152, 0); }
.az-kpi__icon--teal    { background: rgba(0, 184, 212, 0.12); color: #00B8D4; }
.az-kpi__icon--purple  { background: rgba(124, 77, 255, 0.12); color: #7C4DFF; }
.az-kpi__label { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.5); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
.az-kpi__value { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; margin-top: 2px; line-height: 1.1; }
.az-kpi__sub { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.4); margin-top: 4px; }
.az-kpi__trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 4px;
}
.az-kpi__trend--up { color: rgb(76, 175, 80); }
.az-kpi__trend--down { color: rgb(239, 83, 80); }

/* ===== Chart row ===== */
.az-chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}
.az-chart-row:first-of-type { grid-template-columns: 2fr 1fr; }
@media (max-width: 1100px) {
  .az-chart-row, .az-chart-row:first-of-type { grid-template-columns: 1fr; }
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
.az-card__body--scroll { overflow-x: auto; overflow-y: hidden; padding-bottom: 10px; }

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
.az-table__product { font-weight: 600; }
.az-table__empty { text-align: center; padding: 40px 16px; color: rgba(var(--v-theme-on-surface), 0.4); }

/* ===== Cashier avatar ===== */
.az-cashier { display: flex; align-items: center; gap: 10px; }
.az-cashier__avatar {
  width: 32px; height: 32px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  color: #fff;
  flex-shrink: 0;
}
.az-cashier__avatar--0 { background: linear-gradient(135deg, #3478f6, #1e40af); }
.az-cashier__avatar--1 { background: linear-gradient(135deg, #10b981, #047857); }
.az-cashier__avatar--2 { background: linear-gradient(135deg, #f59e0b, #d97706); }
.az-cashier__avatar--3 { background: linear-gradient(135deg, #7C4DFF, #6200EA); }

/* ===== Bar (cashier perf) ===== */
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
.az-bar-fill--success { background: linear-gradient(90deg, #34d399, #10b981); }

/* ===== Payment badges ===== */
.az-pay-badge {
  display: inline-flex;
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}
.az-pay-badge--cash { background: rgba(76, 175, 80, 0.12); color: rgb(76, 175, 80); }
.az-pay-badge--mpesa { background: rgba(52, 120, 246, 0.12); color: #3478f6; }
.az-pay-badge--card { background: rgba(99, 102, 241, 0.12); color: rgb(99, 102, 241); }
.az-pay-badge--insurance { background: rgba(244, 63, 94, 0.12); color: #f43f5e; }
.az-pay-badge--credit { background: rgba(245, 158, 11, 0.12); color: rgba(245, 158, 11); }
.az-pay-badge--bank_transfer { background: rgba(0, 184, 212, 0.12); color: #00B8D4; }

/* ===== Status badges ===== */
.az-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.az-status-badge__dot { width: 6px; height: 6px; border-radius: 50%; }
.az-status-badge--completed { background: rgba(76, 175, 80, 0.1); color: rgb(76, 175, 80); }
.az-status-badge--completed .az-status-badge__dot { background: rgb(76, 175, 80); }
.az-status-badge--pending { background: rgba(255, 152, 0, 0.1); color: rgb(255, 152, 0); }
.az-status-badge--pending .az-status-badge__dot { background: rgb(255, 152, 0); }
.az-status-badge--voided { background: rgba(239, 83, 80, 0.1); color: rgb(239, 83, 80); }
.az-status-badge--voided .az-status-badge__dot { background: rgb(239, 83, 80); }
.az-status-badge--cancelled { background: rgba(108, 117, 125, 0.1); color: rgb(108, 117, 125); }
.az-status-badge--cancelled .az-status-badge__dot { background: rgb(108, 117, 125); }
.az-status-badge--refunded { background: rgba(244, 63, 94, 0.1); color: #f43f5e; }
.az-status-badge--refunded .az-status-badge__dot { background: #f43f5e; }

/* ===== Heatmap ===== */
.az-heatmap { margin-bottom: 20px; }
.az-heatmap__info {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.az-heatmap__legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}
.az-heatmap__dot { width: 12px; height: 12px; border-radius: 3px; }
.az-heatmap__dot--low { background: rgba(52, 120, 246, 0.15); }
.az-heatmap__dot--mid { background: rgba(52, 120, 246, 0.35); }
.az-heatmap__dot--high { background: rgba(52, 120, 246, 0.65); }
.az-heatmap__dot--peak { background: rgba(52, 120, 246, 0.9); }
.az-heatmap__grid {
  display: grid;
  grid-template-columns: 50px repeat(7, 1fr);
  gap: 3px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 12px;
  padding: 12px;
}
.az-heatmap__day-label, .az-heatmap__hour-label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.4);
  text-align: center;
  padding: 2px;
}
.az-heatmap__hour-label { text-align: right; padding-right: 8px; }
.az-heatmap__cell {
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  font-size: 0.625rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.5);
  cursor: default;
  transition: transform 0.1s;
}
.az-heatmap__cell:hover { transform: scale(1.15); z-index: 1; }
.az-heatmap__cell--empty { background: rgba(var(--v-theme-on-surface), 0.02); }
.az-heatmap__cell--low { background: rgba(52, 120, 246, 0.15); color: rgba(0, 0, 0, 0.4); }
.az-heatmap__cell--mid { background: rgba(52, 120, 246, 0.35); color: rgba(0, 0, 0, 0.5); }
.az-heatmap__cell--high { background: rgba(52, 120, 246, 0.65); color: #fff; }
.az-heatmap__cell--peak { background: rgba(52, 120, 246, 0.9); color: #fff; }
.az-heatmap__val { pointer-events: none; }

/* ===== Mobile ===== */
@media (max-width: 768px) {
  .az-page { padding: 12px; }
  .az-kpi-grid { grid-template-columns: 1fr 1fr; }
  .az-heatmap__grid { grid-template-columns: 40px repeat(7, minmax(30px, 1fr)); }
  .az-heatmap__val { display: none; }
}

@media print {
  .az-header__actions, .az-tabs { display: none; }
  .az-card { border: 1px solid #ddd !important; break-inside: avoid; }
}
</style>

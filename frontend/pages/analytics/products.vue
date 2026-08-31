<template>
  <div class="az-page">
    <!-- ===== Header ===== -->
    <div class="az-header">
      <div class="az-header__left">
        <div class="az-header__title">
          <h1 class="text-h5 font-weight-bold">Product Analysis</h1>
          <p class="text-body-2 text-medium-emphasis">Product performance, ABC classification, revenue ranking and stock health</p>
        </div>
      </div>
      <div class="az-header__actions">
        <v-btn-group density="compact" variant="outlined" color="primary">
          <v-btn v-for="opt in periodOptions" :key="opt.value" :variant="period === opt.value ? 'flat' : 'text'" :color="period === opt.value ? 'primary' : undefined" size="small" @click="period = opt.value">{{ opt.short }}</v-btn>
        </v-btn-group>
        <v-btn variant="tonal" prepend-icon="mdi-refresh" size="small" @click="loadData" :loading="loading">Refresh</v-btn>
        <v-btn variant="text" prepend-icon="mdi-arrow-left" size="small" to="/analytics">Overview</v-btn>
      </div>
    </div>

    <!-- ===== Loading ===== -->
    <div v-if="loading" class="az-loading">
      <v-progress-circular indeterminate color="primary" size="32" width="3" />
      <p class="text-body-2 text-medium-emphasis mt-3">Loading product analytics…</p>
    </div>

    <template v-else>
      <!-- ===== KPI Row ===== -->
      <div class="az-kpi-grid">
        <div class="az-kpi">
          <div class="az-kpi__icon az-kpi__icon--primary"><v-icon size="22">mdi-package-variant-closed</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Total Products</p>
            <p class="az-kpi__value">{{ totalProducts }}</p>
            <p class="az-kpi__sub">{{ activeProducts }} active SKUs</p>
          </div>
        </div>

        <div class="az-kpi">
          <div class="az-kpi__icon az-kpi__icon--success"><v-icon size="22">mdi-cash-check</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Products Sold</p>
            <p class="az-kpi__value text-success">{{ soldCount }}</p>
            <p class="az-kpi__sub">{{ soldPct.toFixed(1) }}% of catalogue</p>
          </div>
        </div>

        <div class="az-kpi">
          <div class="az-kpi__icon az-kpi__icon--warning"><v-icon size="22">mdi-package-variant-remove</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Never Sold</p>
            <p class="az-kpi__value text-warning">{{ neverSoldCount }}</p>
            <p class="az-kpi__sub">{{ neverSoldPct.toFixed(1) }}% of catalogue</p>
          </div>
        </div>

        <div class="az-kpi">
          <div class="az-kpi__icon az-kpi__icon--info"><v-icon size="22">mdi-chart-line</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Avg Revenue / Product</p>
            <p class="az-kpi__value text-info">{{ formatMoney(avgRevPerProduct) }}</p>
            <p class="az-kpi__sub">across {{ soldCount }} sold items</p>
          </div>
        </div>

        <div class="az-kpi">
          <div class="az-kpi__icon az-kpi__icon--teal"><v-icon size="22">mdi-currency-usd-off</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Dead Stock Value</p>
            <p class="az-kpi__value" style="color: #00B8D4">{{ formatMoney(deadStockValue) }}</p>
            <p class="az-kpi__sub">{{ deadStock.length }} products</p>
          </div>
        </div>

        <div class="az-kpi">
          <div class="az-kpi__icon az-kpi__icon--purple"><v-icon size="22">mdi-trophy-variant</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Top Product Revenue</p>
            <p class="az-kpi__value" style="color: #7C4DFF">{{ formatMoney(topProductRevenue) }}</p>
            <p class="az-kpi__sub">{{ topPct.toFixed(1) }}% of total revenue</p>
          </div>
        </div>
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

      <!-- ===== ABC Classification Tab ===== -->
      <div v-if="activeTab === 'abc'" class="az-table-wrap">
        <table class="az-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Product</th>
              <th>Category</th>
              <th class="text-right">Qty Sold</th>
              <th class="text-right">Revenue</th>
              <th class="text-right">% Share</th>
              <th class="text-right">Cumulative</th>
              <th>Class</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in productRanking" :key="p.name" class="az-table__row">
              <td class="font-weight-bold">#{{ p.rank }}</td>
              <td class="az-table__product">{{ p.name }}</td>
              <td class="text-medium-emphasis">{{ p.category }}</td>
              <td class="text-right">{{ p.qtySold }}</td>
              <td class="text-right font-weight-bold text-success">{{ formatMoney(p.revenue) }}</td>
              <td class="text-right text-medium-emphasis">{{ p.sharePct.toFixed(1) }}%</td>
              <td class="text-right text-medium-emphasis">{{ p.cumulative.toFixed(1) }}%</td>
              <td>
                <span class="az-class-badge" :class="`az-class-badge--${p.class.toLowerCase()}`">{{ p.class }}</span>
              </td>
            </tr>
            <tr v-if="!productRanking.length">
              <td colspan="8" class="az-table__empty">
                <v-icon size="36" color="grey-lighten-1">mdi-package-variant</v-icon>
                <p class="text-body-2 mt-2 text-medium-emphasis">No sales data for this period.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ===== Top Products Tab ===== -->
      <div v-if="activeTab === 'top'" class="az-table-wrap">
        <table class="az-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Product</th>
              <th>Category</th>
              <th class="text-right">Qty Sold</th>
              <th class="text-right">Revenue</th>
              <th class="text-right">Avg Price</th>
              <th>% of Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in topProducts" :key="p.name" class="az-table__row">
              <td class="font-weight-bold">#{{ p.rank }}</td>
              <td class="az-table__product">{{ p.name }}</td>
              <td class="text-medium-emphasis">{{ p.category }}</td>
              <td class="text-right">{{ p.qtySold }}</td>
              <td class="text-right font-weight-bold text-success">{{ formatMoney(p.revenue) }}</td>
              <td class="text-right text-medium-emphasis">{{ formatMoney(p.avgPrice) }}</td>
              <td>
                <div class="az-bar-wrap">
                  <div class="az-bar-fill az-bar-fill--success" :style="{ width: p.sharePct + '%' }"></div>
                </div>
              </td>
            </tr>
            <tr v-if="!topProducts.length">
              <td colspan="7" class="az-table__empty">
                <v-icon size="36" color="grey-lighten-1">mdi-trophy-outline</v-icon>
                <p class="text-body-2 mt-2 text-medium-emphasis">No product sales in this period.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ===== Slow Moving Tab ===== -->
      <div v-if="activeTab === 'slow'" class="az-table-wrap">
        <table class="az-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th class="text-right">Qty on Hand</th>
              <th class="text-right">Stock Value</th>
              <th>Last Sold</th>
              <th>Days Idle</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in slowMoving" :key="p.id" class="az-table__row">
              <td class="az-table__product">{{ p.name }}</td>
              <td class="text-medium-emphasis">{{ p.category_name || 'Uncategorized' }}</td>
              <td class="text-right">{{ p.quantity_on_hand || 0 }}</td>
              <td class="text-right font-weight-bold text-warning">{{ formatMoney(p.stockValue) }}</td>
              <td class="text-medium-emphasis">{{ p.last_sold ? formatDate(p.last_sold) : 'Never' }}</td>
              <td>
                <span class="az-idle-badge" :class="p.daysIdle > 60 ? 'az-idle-badge--critical' : 'az-idle-badge--warn'">{{ p.daysIdle }}d</span>
              </td>
            </tr>
            <tr v-if="!slowMoving.length">
              <td colspan="6" class="az-table__empty">
                <v-icon size="36" color="grey-lighten-1">mdi-turtle</v-icon>
                <p class="text-body-2 mt-2 text-medium-emphasis">No slow-moving products detected.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ===== Never Sold Tab ===== -->
      <div v-if="activeTab === 'never'" class="az-table-wrap">
        <table class="az-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th class="text-right">Qty on Hand</th>
              <th class="text-right">Stock Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in neverSoldProducts" :key="p.id" class="az-table__row">
              <td class="az-table__product">{{ p.name }}</td>
              <td class="text-medium-emphasis">{{ p.category_name || 'Uncategorized' }}</td>
              <td class="text-right">{{ p.quantity_on_hand || 0 }}</td>
              <td class="text-right font-weight-bold">{{ formatMoney(p.stockValue) }}</td>
              <td>
                <span v-if="Number(p.quantity_on_hand) > 0" class="az-status-badge az-status-badge--voided">
                  <span class="az-status-badge__dot"></span>Dead Stock
                </span>
                <span v-else class="az-status-badge az-status-badge--cancelled">
                  <span class="az-status-badge__dot"></span>No Stock
                </span>
              </td>
            </tr>
            <tr v-if="!neverSoldProducts.length">
              <td colspan="5" class="az-table__empty">
                <v-icon size="36" color="grey-lighten-1">mdi-check-circle-outline</v-icon>
                <p class="text-body-2 mt-2 text-medium-emphasis">Every product has sold at least once.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ===== Dead Stock Tab ===== -->
      <div v-if="activeTab === 'dead'" class="az-table-wrap">
        <table class="az-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th class="text-right">Qty on Hand</th>
              <th class="text-right">Unit Cost</th>
              <th class="text-right">Stock Value</th>
              <th class="text-right">% of Dead Stock</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in deadStock" :key="p.id" class="az-table__row">
              <td class="az-table__product">{{ p.name }}</td>
              <td class="text-medium-emphasis">{{ p.category_name || 'Uncategorized' }}</td>
              <td class="text-right">{{ p.quantity_on_hand || 0 }}</td>
              <td class="text-right text-medium-emphasis">{{ formatMoney(p.cost_price) }}</td>
              <td class="text-right font-weight-bold text-error">{{ formatMoney(p.stockValue) }}</td>
              <td class="text-right text-medium-emphasis">{{ p.deadPct.toFixed(1) }}%</td>
            </tr>
            <tr v-if="!deadStock.length">
              <td colspan="6" class="az-table__empty">
                <v-icon size="36" color="grey-lighten-1">mdi-package-variant-closed-check</v-icon>
                <p class="text-body-2 mt-2 text-medium-emphasis">No dead stock detected.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ===== Data Visualization Tab ===== -->
      <div v-if="activeTab === 'charts'" class="az-data-viz">
        <!-- Charts Row 1: Top 20 + Category Distribution -->
        <div class="az-chart-row az-chart-row--first">
          <div class="az-card az-card--two-thirds">
            <div class="az-card__header">
              <div class="az-card__header-icon az-card__header-icon--blue"><v-icon size="20">mdi-trophy-award</v-icon></div>
              <div>
                <h3 class="az-card__title">Top 20 Products by Revenue</h3>
                <p class="az-card__subtitle">Best-performing products in selected period</p>
              </div>
            </div>
            <div class="az-card__body">
              <apexchart type="bar" height="420" :options="top20Options" :series="top20Series" />
            </div>
          </div>

          <div class="az-card az-card--third">
            <div class="az-card__header">
              <div class="az-card__header-icon az-card__header-icon--green"><v-icon size="20">mdi-chart-pie</v-icon></div>
              <div>
                <h3 class="az-card__title">Revenue by Category</h3>
                <p class="az-card__subtitle">Distribution across categories</p>
              </div>
            </div>
            <div class="az-card__body">
              <apexchart type="donut" height="420" :options="categoryOptions" :series="categorySeries" />
            </div>
          </div>
        </div>

        <!-- Charts Row 2: ABC donut + Scatter -->
        <div class="az-chart-row">
          <div class="az-card az-card--half">
            <div class="az-card__header">
              <div class="az-card__header-icon az-card__header-icon--amber"><v-icon size="20">mdi-chart-donut</v-icon></div>
              <div>
                <h3 class="az-card__title">ABC Classification</h3>
                <p class="az-card__subtitle">Pareto distribution by revenue</p>
              </div>
            </div>
            <div class="az-card__body">
              <apexchart type="donut" height="320" :options="abcChartOptions" :series="abcChartSeries" />
            </div>
          </div>

          <div class="az-card az-card--half">
            <div class="az-card__header">
              <div class="az-card__header-icon az-card__header-icon--rose"><v-icon size="20">mdi-chart-bubble</v-icon></div>
              <div>
                <h3 class="az-card__title">Qty Sold vs Avg Price</h3>
                <p class="az-card__subtitle">Each dot is a product — hover for details</p>
              </div>
            </div>
            <div class="az-card__body">
              <apexchart type="scatter" height="320" :options="scatterOptions" :series="scatterSeries" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
const { currency } = useFormat()
const toast = useToast()

function formatMoney(v) { return currency(v || 0) }
function formatDate(v) {
  return new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ===== Period helpers =====
const periodOptions = [
  { label: 'Today', value: 'today', short: 'Today' },
  { label: 'Last 7 days', value: '7d', short: '7D' },
  { label: 'Last 30 days', value: '30d', short: '30D' },
  { label: 'This month', value: 'thisMonth', short: 'Month' },
  { label: 'Last 90 days', value: '90d', short: '90D' },
]
const period = ref('30d')
const loading = ref(false)
const activeTab = ref('abc')

function resolveDateRange(key) {
  const now = new Date()
  const end = new Date(now); end.setHours(23, 59, 59, 999)
  const start = new Date(now); start.setHours(0, 0, 0, 0)
  if (key === 'today') { /* start is today 00:00 */ }
  else if (key === '7d') { start.setDate(start.getDate() - 6) }
  else if (key === '30d') { start.setDate(start.getDate() - 29) }
  else if (key === '90d') { start.setDate(start.getDate() - 89) }
  else if (key === 'thisMonth') { start.setDate(1) }
  return [
    start.toISOString().split('T')[0],
    end.toISOString().split('T')[0],
  ]
}

function periodQuery() {
  const [from, to] = resolveDateRange(period.value)
  return new URLSearchParams({ date_from: from, date_to: to }).toString()
}

// ===== Server-side data =====
const analyticsData = ref({})

// ===== Product ranking (from abc_analysis) =====
const productRanking = computed(() => {
  const rows = analyticsData.value?.abc_analysis || []
  const totalRev = rows.reduce((s, r) => s + Number(r.revenue || 0), 0) || 1
  let cumulative = 0
  return rows.map((p, i) => {
    cumulative += Number(p.revenue || 0)
    return {
      ...p,
      name: p.product,
      qtySold: Number(p.qty_sold || 0),
      rank: i + 1,
      sharePct: Number(p.revenue_share || 0),
      cumulative: (cumulative / totalRev) * 100,
      avgPrice: Number(p.qty_sold) > 0 ? Number(p.revenue) / Number(p.qty_sold) : 0,
      class: p.abc_class || 'C',
    }
  })
})

// ===== KPIs =====
const kpis = computed(() => analyticsData.value?.kpis || {})
const totalProducts = computed(() => Number(kpis.value.total_products || 0))
const activeProducts = computed(() => totalProducts.value)
const soldCount = computed(() => Number(kpis.value.products_sold || 0))
const neverSoldCount = computed(() => Number(kpis.value.products_never_sold || 0))
const soldPct = computed(() => totalProducts.value ? (soldCount.value / totalProducts.value) * 100 : 0)
const neverSoldPct = computed(() => totalProducts.value ? (neverSoldCount.value / totalProducts.value) * 100 : 0)
const avgRevPerProduct = computed(() => {
  const total = Number(kpis.value.total_revenue || 0)
  return totalProducts.value ? total / totalProducts.value : 0
})
const topProductRevenue = computed(() => Number(kpis.value.top_product_revenue || 0))
const topPct = computed(() => Number(kpis.value.top_product_share || 0))

// ===== Top Products (for table) =====
const topProducts = computed(() => {
  return (analyticsData.value?.top_products || []).map((p) => ({
    ...p,
    name: p.product,
    sharePct: Number(p.revenue_share || 0),
    avgPrice: Number(p.qty_sold) > 0 ? Number(p.revenue) / Number(p.qty_sold) : 0,
  }))
})

// ===== Never Sold / Dead Stock =====
const neverSoldProducts = computed(() => (analyticsData.value?.dead_stock || []).map((p) => ({
  ...p,
  stockValue: Number(p.stock_value || 0),
})))
const deadStock = computed(() => neverSoldProducts.value.map((p) => ({
  ...p,
  deadPct: 0,
})).sort((a, b) => Number(b.stockValue) - Number(a.stockValue)))
const deadStockValue = computed(() => deadStock.value.reduce((s, p) => s + Number(p.stockValue || 0), 0))

// ===== Slow Moving =====
// Not available server-side in the current endpoint; keep as empty for now
const slowMoving = computed(() => [])

// ===== Tabs =====
const tabs = computed(() => [
  { id: 'abc', label: 'ABC Classification', icon: 'mdi-chart-donut-variant', count: productRanking.value.length },
  { id: 'top', label: 'Top 20 Products', icon: 'mdi-trophy-award', count: topProducts.value.length },
  { id: 'slow', label: 'Slow Moving', icon: 'mdi-turtle', count: slowMoving.value.length },
  { id: 'never', label: 'Never Sold', icon: 'mdi-help-circle-outline', count: neverSoldProducts.value.length },
  { id: 'dead', label: 'Dead Stock', icon: 'mdi-package-variant-remove', count: deadStock.value.length },
  { id: 'charts', label: 'Data Visualization', icon: 'mdi-chart-multiple', count: 4 },
])

// ===== Charts =====
const palette = ['#3478f6', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8', '#f43f5e', '#10b981']

// Top 20 bar chart
const top20Series = computed(() => [{ name: 'Revenue', data: topProducts.value.map(p => Math.round(p.revenue)) }])
const top20Options = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
  colors: ['#3478f6'],
  plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: '70%' } },
  grid: { borderColor: 'rgba(0,0,0,0.06)', xaxis: { lines: { show: true } } },
  xaxis: { categories: topProducts.value.map(p => p.name), labels: { formatter: (v) => formatMoney(v), style: { fontSize: '11px' } } },
  dataLabels: { enabled: false },
  yaxis: { labels: { style: { fontSize: '11px' } } },
  tooltip: { y: { formatter: (v) => formatMoney(v) } },
}))

// Category donut — use sales_by_category endpoint
const categorySeries = computed(() => {
  const map = {}
  productRanking.value.forEach(p => {
    const cat = p.category || 'Uncategorized'
    map[cat] = (map[cat] || 0) + Number(p.revenue || 0)
  })
  return Object.values(map)
})
const categoryOptions = computed(() => {
  const map = {}
  productRanking.value.forEach(p => {
    const cat = p.category || 'Uncategorized'
    map[cat] = true
  })
  return {
    chart: { type: 'donut', background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
    labels: Object.keys(map),
    colors: palette,
    legend: { position: 'bottom', fontSize: '12px' },
    dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(0)}%` },
    tooltip: { y: { formatter: (v) => formatMoney(v) } },
    stroke: { width: 2, colors: ['rgb(var(--v-theme-surface))'] },
    plotOptions: { pie: { donut: { size: '65%' } } },
  }
})

// ABC donut
const abcChartSeries = computed(() => [
  productRanking.value.filter(p => p.class === 'A').reduce((s, p) => s + Number(p.revenue), 0),
  productRanking.value.filter(p => p.class === 'B').reduce((s, p) => s + Number(p.revenue), 0),
  productRanking.value.filter(p => p.class === 'C').reduce((s, p) => s + Number(p.revenue), 0),
])
const abcChartOptions = computed(() => ({
  chart: { type: 'donut', background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
  labels: ['A-Class (80%)', 'B-Class (15%)', 'C-Class (5%)'],
  colors: ['#10b981', '#f59e0b', '#ef4444'],
  legend: { position: 'bottom', fontSize: '12px' },
  dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(0)}%` },
  tooltip: { y: { formatter: (v) => formatMoney(v) } },
  stroke: { width: 2, colors: ['rgb(var(--v-theme-surface))'] },
  plotOptions: { pie: { donut: { size: '65%' } } },
}))

// Scatter: Qty vs Avg Price
const scatterSeries = computed(() => {
  return [{
    name: 'Products',
    data: productRanking.value.slice(0, 50).map(p => ({
      x: Number(p.qty_sold),
      y: Math.round(p.avgPrice),
      name: p.product,
    })),
  }]
})
const scatterOptions = computed(() => ({
  chart: { type: 'scatter', toolbar: { show: false }, background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
  colors: ['#7C4DFF'],
  grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
  xaxis: { title: { text: 'Quantity Sold', style: { fontSize: '12px' } }, labels: { formatter: (v) => Math.round(Number(v)).toLocaleString('en-GB') } },
  yaxis: { decimalsInFloat: 0, title: { text: 'Avg Unit Price', style: { fontSize: '12px' } }, labels: { formatter: (v) => Math.round(Number(v)).toLocaleString('en-GB') } },
  dataLabels: { enabled: false },
  tooltip: {
    custom: ({ seriesIndex, dataPointIndex, w }) => {
      const point = w.config.series[seriesIndex].data[dataPointIndex]
      return `<div style="padding:8px 12px;font-size:13px;"><b>${point.name}</b><br/>Qty: ${point.x}<br/>Avg Price: ${formatMoney(point.y)}<br/>Revenue: ${formatMoney(point.x * point.y)}</div>`
    },
  },
  markers: { size: 6, colors: ['#7C4DFF'], opacity: 0.7 },
}))

// ===== Load Data (server-side) =====
async function loadData() {
  loading.value = true
  const q = periodQuery()
  try {
    analyticsData.value = await useApi()(`/reports/product-analytics/?${q}`)
  } catch (e) {
    toast.error('Failed to load product analytics')
  } finally {
    loading.value = false
  }
}

watch(period, loadData)
onMounted(loadData)
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
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}
.az-kpi {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
  position: relative;
}
.az-kpi:hover { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); transform: translateY(-2px); }
.az-kpi__icon {
  width: 42px; height: 42px;
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
.az-kpi__label { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.5); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; line-height: 1; }
.az-kpi__value { font-size: clamp(1.1rem, 2.5vw, 1.5rem); font-weight: 800; letter-spacing: -0.02em; margin-top: 6px; line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.az-kpi__sub { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.4); margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.az-kpi__body { min-width: 0; flex: 1; }

/* ===== Chart rows ===== */
.az-chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}
.az-chart-row--first { grid-template-columns: 2fr 1fr; }
.az-data-viz .az-chart-row { margin-bottom: 16px; }
.az-data-viz .az-chart-row:last-child { margin-bottom: 0; }
@media (max-width: 1100px) {
  .az-chart-row, .az-chart-row--first { grid-template-columns: 1fr; }
  .az-kpi-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 480px) {
  .az-kpi-grid { grid-template-columns: 1fr; }
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

/* ===== Class badges ===== */
.az-class-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px; height: 26px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 800;
}
.az-class-badge--a { background: rgba(16, 185, 129, 0.12); color: rgb(16, 185, 129); }
.az-class-badge--b { background: rgba(245, 158, 11, 0.12); color: rgb(245, 158, 11); }
.az-class-badge--c { background: rgba(239, 68, 68, 0.12); color: rgb(239, 68, 68); }

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
.az-bar-fill--success { background: linear-gradient(90deg, #34d399, #10b981); }

/* ===== Idle badge ===== */
.az-idle-badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
}
.az-idle-badge--warn { background: rgba(255, 152, 0, 0.12); color: rgb(255, 152, 0); }
.az-idle-badge--critical { background: rgba(239, 68, 68, 0.12); color: rgb(239, 68, 68); }

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
.az-status-badge--voided { background: rgba(239, 83, 80, 0.1); color: rgb(239, 83, 80); }
.az-status-badge--voided .az-status-badge__dot { background: rgb(239, 83, 80); }
.az-status-badge--cancelled { background: rgba(108, 117, 125, 0.1); color: rgb(108, 117, 125); }
.az-status-badge--cancelled .az-status-badge__dot { background: rgb(108, 117, 125); }

/* ===== Mobile ===== */
@media (max-width: 768px) {
  .az-page { padding: 12px; }
}
</style>

<template>
  <div class="az-page">
    <!-- ===== Header ===== -->
    <div class="az-header">
      <div class="az-header__left">
        <div class="az-header__title">
          <h1 class="text-h5 font-weight-bold">Category Analysis</h1>
          <p class="text-body-2 text-medium-emphasis">Category performance, revenue distribution, ABC classification and stock health</p>
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
      <p class="text-body-2 text-medium-emphasis mt-3">Loading category analytics…</p>
    </div>

    <template v-else>
      <!-- ===== KPI Row ===== -->
      <div class="az-kpi-grid">
        <div class="az-kpi">
          <div class="az-kpi__icon az-kpi__icon--primary"><v-icon size="22">mdi-tag-multiple</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Total Categories</p>
            <p class="az-kpi__value">{{ categoryStats.length }}</p>
            <p class="az-kpi__sub">{{ categoryStats.length }} categories total</p>
          </div>
        </div>

        <div class="az-kpi">
          <div class="az-kpi__icon az-kpi__icon--success"><v-icon size="22">mdi-cash-multiple</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Total Revenue</p>
            <p class="az-kpi__value text-success">{{ formatMoney(totalRevenue) }}</p>
            <p class="az-kpi__sub">across {{ totalCategories }} categories</p>
          </div>
        </div>

        <div class="az-kpi">
          <div class="az-kpi__icon az-kpi__icon--info"><v-icon size="22">mdi-chart-line</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Top Category</p>
            <p class="az-kpi__value text-info">{{ topCategory ? topCategory.name : '—' }}</p>
            <p class="az-kpi__sub">{{ topCategory ? topPct.toFixed(1) + '% of revenue' : '' }}</p>
          </div>
        </div>

        <div class="az-kpi">
          <div class="az-kpi__icon az-kpi__icon--warning"><v-icon size="22">mdi-package-variant</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Stock Value</p>
            <p class="az-kpi__value text-warning">{{ formatMoney(totalStockValue) }}</p>
            <p class="az-kpi__sub">{{ totalStockQty }} units in stock</p>
          </div>
        </div>

        <div class="az-kpi">
          <div class="az-kpi__icon az-kpi__icon--teal"><v-icon size="22">mdi-currency-usd-off</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Dead Stock Value</p>
            <p class="az-kpi__value" style="color: #00B8D4">{{ formatMoney(deadStockValue) }}</p>
            <p class="az-kpi__sub">{{ deadStockCount }} unsold products</p>
          </div>
        </div>

        <div class="az-kpi">
          <div class="az-kpi__icon az-kpi__icon--purple"><v-icon size="22">mdi-scale-balance</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Avg Revenue / Category</p>
            <p class="az-kpi__value" style="color: #7C4DFF">{{ formatMoney(avgRevPerCategory) }}</p>
            <p class="az-kpi__sub">across {{ categoryStats.length }} categories</p>
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

      <!-- ===== Category Performance Tab ===== -->
      <div v-if="activeTab === 'overview'" class="az-table-wrap">
        <table class="az-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Category</th>
              <th class="text-right">Products</th>
              <th class="text-right">Units Sold</th>
              <th class="text-right">Revenue</th>
              <th class="text-right">% Share</th>
              <th class="text-right">Stock Value</th>
              <th>% of Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(c, idx) in categoryStats" :key="c.name" class="az-table__row">
              <td class="font-weight-bold">#{{ idx + 1 }}</td>
              <td class="az-table__product">
                <div class="az-cat-icon" :class="`az-cat-icon--${idx % 5}`">{{ (c.name || '?').charAt(0).toUpperCase() }}</div>
                {{ c.name }}
              </td>
              <td class="text-right">{{ c.productCount }}</td>
              <td class="text-right">{{ c.qtySold }}</td>
              <td class="text-right font-weight-bold text-success">{{ formatMoney(c.revenue) }}</td>
              <td class="text-right text-medium-emphasis">{{ c.sharePct.toFixed(1) }}%</td>
              <td class="text-right">{{ formatMoney(c.stockValue) }}</td>
              <td>
                <div class="az-bar-wrap">
                  <div class="az-bar-fill az-bar-fill--success" :style="{ width: c.sharePct + '%' }"></div>
                </div>
              </td>
            </tr>
            <tr v-if="!categoryStats.length">
              <td colspan="8" class="az-table__empty">
                <v-icon size="36" color="grey-lighten-1">mdi-tag-off</v-icon>
                <p class="text-body-2 mt-2 text-medium-emphasis">No categories found.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ===== ABC Analysis Tab ===== -->
      <div v-if="activeTab === 'abc'" class="az-table-wrap">
        <table class="az-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Product</th>
              <th>Category</th>
              <th class="text-right">Revenue</th>
              <th class="text-right">% Share</th>
              <th class="text-right">Cumulative</th>
              <th>Class</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in abcAll" :key="p.name" class="az-table__row">
              <td class="font-weight-bold">#{{ p.rank }}</td>
              <td class="az-table__product">{{ p.name }}</td>
              <td class="text-medium-emphasis">{{ p.category }}</td>
              <td class="text-right font-weight-bold text-success">{{ formatMoney(p.revenue) }}</td>
              <td class="text-right text-medium-emphasis">{{ p.sharePct.toFixed(1) }}%</td>
              <td class="text-right text-medium-emphasis">{{ p.cumulative.toFixed(1) }}%</td>
              <td>
                <span class="az-class-badge" :class="`az-class-badge--${p.class.toLowerCase()}`">{{ p.class }}</span>
              </td>
            </tr>
            <tr v-if="!abcAll.length">
              <td colspan="7" class="az-table__empty">
                <v-icon size="36" color="grey-lighten-1">mdi-chart-bell-curve</v-icon>
                <p class="text-body-2 mt-2 text-medium-emphasis">No ABC data for this period.</p>
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
            <tr v-for="p in slowStock" :key="p.id" class="az-table__row">
              <td class="az-table__product">{{ p.name }}</td>
              <td class="text-medium-emphasis">{{ p.category_name || 'Uncategorized' }}</td>
              <td class="text-right">{{ p.quantity_on_hand || 0 }}</td>
              <td class="text-right font-weight-bold text-warning">{{ formatMoney(p.stockValue) }}</td>
              <td class="text-medium-emphasis">{{ p.last_sold ? formatDate(p.last_sold) : 'Never' }}</td>
              <td>
                <span class="az-idle-badge" :class="p.daysIdle > 60 ? 'az-idle-badge--critical' : 'az-idle-badge--warn'">{{ p.daysIdle }}d</span>
              </td>
            </tr>
            <tr v-if="!slowStock.length">
              <td colspan="6" class="az-table__empty">
                <v-icon size="36" color="grey-lighten-1">mdi-turtle</v-icon>
                <p class="text-body-2 mt-2 text-medium-emphasis">No slow-moving products detected.</p>
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
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in neverSold" :key="p.id" class="az-table__row">
              <td class="az-table__product">{{ p.name }}</td>
              <td class="text-medium-emphasis">{{ p.category_name || 'Uncategorized' }}</td>
              <td class="text-right">{{ p.quantity_on_hand || 0 }}</td>
              <td class="text-right text-medium-emphasis">{{ formatMoney(p.cost_price) }}</td>
              <td class="text-right font-weight-bold text-error">{{ formatMoney(p.stockValue) }}</td>
            </tr>
            <tr v-if="!neverSold.length">
              <td colspan="5" class="az-table__empty">
                <v-icon size="36" color="grey-lighten-1">mdi-package-variant-closed-check</v-icon>
                <p class="text-body-2 mt-2 text-medium-emphasis">No dead stock detected.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ===== Data Visualization Tab ===== -->
      <div v-if="activeTab === 'charts'" class="az-data-viz">
        <!-- Charts Row 1: Revenue donut + Category bar -->
        <div class="az-chart-row az-chart-row--first">
          <div class="az-card az-card--third">
            <div class="az-card__header">
              <div class="az-card__header-icon az-card__header-icon--blue"><v-icon size="20">mdi-chart-donut</v-icon></div>
              <div>
                <h3 class="az-card__title">Revenue Distribution</h3>
                <p class="az-card__subtitle">Share of revenue by category</p>
              </div>
            </div>
            <div class="az-card__body">
              <apexchart type="donut" height="380" :options="catDonutOptions" :series="catDonutSeries" />
            </div>
          </div>

          <div class="az-card az-card--two-thirds">
            <div class="az-card__header">
              <div class="az-card__header-icon az-card__header-icon--green"><v-icon size="20">mdi-chart-bar</v-icon></div>
              <div>
                <h3 class="az-card__title">Revenue by Category</h3>
                <p class="az-card__subtitle">Sorted by revenue contribution</p>
              </div>
            </div>
            <div class="az-card__body">
              <apexchart type="bar" height="380" :options="catBarOptions" :series="catBarSeries" />
            </div>
          </div>
        </div>

        <!-- Charts Row 2: Qty sold + Stock value -->
        <div class="az-chart-row">
          <div class="az-card az-card--half">
            <div class="az-card__header">
              <div class="az-card__header-icon az-card__header-icon--amber"><v-icon size="20">mdi-package-variant-closed-check</v-icon></div>
              <div>
                <h3 class="az-card__title">Units Sold by Category</h3>
                <p class="az-card__subtitle">Total quantity sold this period</p>
              </div>
            </div>
            <div class="az-card__body">
              <apexchart type="bar" height="300" :options="qtyBarOptions" :series="qtyBarSeries" />
            </div>
          </div>

          <div class="az-card az-card--half">
            <div class="az-card__header">
              <div class="az-card__header-icon az-card__header-icon--rose"><v-icon size="20">mdi-package-variant</v-icon></div>
              <div>
                <h3 class="az-card__title">Stock Value by Category</h3>
                <p class="az-card__subtitle">Capital tied up per category</p>
              </div>
            </div>
            <div class="az-card__body">
              <apexchart type="bar" height="300" :options="stockBarOptions" :series="stockBarSeries" />
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
const activeTab = ref('overview')

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

// ===== Category Stats =====
const categoryStats = computed(() => {
  const rows = analyticsData.value?.categories || []
  return rows.map((c) => ({
    name: c.category || 'Uncategorized',
    revenue: Number(c.revenue || 0),
    qtySold: Number(c.qty_sold || 0),
    stockValue: Number(c.stock_value || 0),
    productCount: Number(c.sku_count || 0),
    sharePct: Number(c.revenue_share || 0),
    margin: Number(c.margin || 0),
  }))
})

// ===== KPIs =====
const totalRevenue = computed(() => Number(analyticsData.value?.kpis?.total_revenue || 0))
const topCategory = computed(() => categoryStats.value[0] || null)
const topPct = computed(() => Number(analyticsData.value?.kpis?.top_category_share || 0))
const totalStockValue = computed(() => categoryStats.value.reduce((s, c) => s + c.stockValue, 0))
const totalStockQty = computed(() => categoryStats.value.reduce((s, c) => s + Number(c.qtySold || 0), 0))
const totalCategories = computed(() => categoryStats.value.length)
const avgRevPerCategory = computed(() => categoryStats.value.length ? totalRevenue.value / categoryStats.value.length : 0)

// ===== ABC Analysis (from product-analytics endpoint — shared) =====
const productAnalyticsData = ref({})
const abcAll = computed(() => {
  const rows = productAnalyticsData.value?.abc_analysis || []
  const totalRev = rows.reduce((s, r) => s + Number(r.revenue || 0), 0) || 1
  let cumulative = 0
  return rows.map((p, i) => {
    cumulative += Number(p.revenue || 0)
    return {
      name: p.product,
      category: p.category || 'Uncategorized',
      revenue: Number(p.revenue || 0),
      rank: i + 1,
      sharePct: Number(p.revenue_share || 0),
      cumulative: (cumulative / totalRev) * 100,
      class: p.abc_class || 'C',
    }
  })
})

// ===== Slow / Dead Stock (from product-analytics endpoint) =====
const neverSold = computed(() => (productAnalyticsData.value?.dead_stock || []).map((p) => ({
  ...p,
  stockValue: Number(p.stock_value || 0),
})).sort((a, b) => Number(b.stockValue) - Number(a.stockValue)))
const deadStockValue = computed(() => neverSold.value.reduce((s, p) => s + Number(p.stockValue || 0), 0))
const deadStockCount = computed(() => neverSold.value.filter((p) => Number(p.quantity_on_hand) > 0).length)
const slowStock = computed(() => []) // Not available server-side in current endpoint

// ===== Tabs =====
const tabs = computed(() => [
  { id: 'overview', label: 'Category Performance', icon: 'mdi-chart-donut-variant', count: categoryStats.value.length },
  { id: 'abc', label: 'ABC Analysis', icon: 'mdi-chart-bell-curve', count: abcAll.value.length },
  { id: 'slow', label: 'Slow Moving', icon: 'mdi-turtle', count: slowStock.value.length },
  { id: 'dead', label: 'Dead Stock', icon: 'mdi-package-variant-remove', count: neverSold.value.length },
  { id: 'charts', label: 'Data Visualization', icon: 'mdi-chart-multiple', count: 4 },
])

// ===== Charts =====
const palette = ['#3478f6', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8', '#f43f5e', '#10b981']

// Revenue donut
const catDonutSeries = computed(() => categoryStats.value.map(c => Math.round(c.revenue)))
const catDonutOptions = computed(() => ({
  chart: { type: 'donut', background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
  labels: categoryStats.value.map(c => c.name),
  colors: palette,
  legend: { position: 'bottom', fontSize: '12px' },
  dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(0)}%` },
  tooltip: { y: { formatter: (v) => formatMoney(v) } },
  stroke: { width: 2, colors: ['rgb(var(--v-theme-surface))'] },
  plotOptions: { pie: { donut: { size: '65%' } } },
}))

// Revenue bar
const catBarSeries = computed(() => [{ name: 'Revenue', data: categoryStats.value.map(c => Math.round(c.revenue)) }])
const catBarOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
  colors: ['#3478f6'],
  plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
  grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
  xaxis: { categories: categoryStats.value.map(c => c.name), labels: { rotate: -25, style: { fontSize: '11px' } } },
  yaxis: { decimalsInFloat: 0, labels: { formatter: (v) => Math.round(Number(v)).toLocaleString('en-GB') } },
  dataLabels: { enabled: false },
  tooltip: { y: { formatter: (v) => formatMoney(v) } },
}))

// Qty sold bar
const qtyBarSeries = computed(() => [{ name: 'Units Sold', data: categoryStats.value.map(c => c.qtySold) }])
const qtyBarOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
  colors: ['#FEB019'],
  plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
  grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
  xaxis: { categories: categoryStats.value.map(c => c.name), labels: { rotate: -25, style: { fontSize: '11px' } } },
  yaxis: { decimalsInFloat: 0, labels: { formatter: (v) => Math.round(Number(v)).toLocaleString('en-GB') } },
  dataLabels: { enabled: false },
  tooltip: { y: { formatter: (v) => `${Math.round(Number(v))} units` } },
}))

// Stock value bar
const stockBarSeries = computed(() => [{ name: 'Stock Value', data: categoryStats.value.map(c => Math.round(c.stockValue)) }])
const stockBarOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
  colors: ['#f43f5e'],
  plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
  grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
  xaxis: { categories: categoryStats.value.map(c => c.name), labels: { rotate: -25, style: { fontSize: '11px' } } },
  yaxis: { decimalsInFloat: 0, labels: { formatter: (v) => Math.round(Number(v)).toLocaleString('en-GB') } },
  dataLabels: { enabled: false },
  tooltip: { y: { formatter: (v) => formatMoney(v) } },
}))

// ===== Load Data (server-side) =====
async function loadData() {
  loading.value = true
  const q = periodQuery()
  try {
    const api = useApi()
    const [catData, prodData] = await Promise.all([
      api(`/reports/category-analytics/?${q}`),
      api(`/reports/product-analytics/?${q}`),
    ])
    analyticsData.value = catData
    productAnalyticsData.value = prodData
  } catch (e) {
    toast.error('Failed to load category analytics')
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
.az-chart-row--first { grid-template-columns: 1fr 2fr; }
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
.az-table__product { font-weight: 600; display: flex; align-items: center; gap: 10px; }
.az-table__product .az-cat-icon + span, .az-table__product { font-weight: 600; }
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

/* ===== Mobile ===== */
@media (max-width: 768px) {
  .az-page { padding: 12px; }
}
</style>

<template>
  <div class="an-page">
    <!-- ===== Header ===== -->
    <div class="an-header">
      <div class="an-header__left">
        <div class="an-header__title">
          <h1 class="text-h5 font-weight-bold">Stock Analysis</h1>
          <p class="text-body-2 text-medium-emphasis">Inventory health, valuation, movement trends and ABC classification</p>
        </div>
      </div>
      <div class="an-header__actions">
        <v-btn variant="tonal" prepend-icon="mdi-refresh" size="small" @click="loadData" :loading="loading">Refresh</v-btn>
        <v-btn variant="text" prepend-icon="mdi-printer-outline" size="small" @click="printReport">Export</v-btn>
      </div>
    </div>

    <!-- ===== Loading skeleton ===== -->
    <div v-if="loading && !data" class="an-loading">
      <v-progress-circular indeterminate color="primary" size="32" width="3" />
      <p class="text-body-2 text-medium-emphasis mt-3">Loading analytics…</p>
    </div>

    <!-- ===== Content ===== -->
    <template v-if="data">
      <!-- ===== KPI Row ===== -->
      <div class="an-kpi-grid">
        <div class="an-kpi">
          <div class="an-kpi__icon an-kpi__icon--primary"><v-icon size="22">mdi-package-variant-closed</v-icon></div>
          <div class="an-kpi__body">
            <p class="an-kpi__label">Total SKUs</p>
            <p class="an-kpi__value">{{ data.kpis.total_skus }}</p>
            <p class="an-kpi__sub">{{ formatUnits(data.kpis.total_units) }} units on hand</p>
          </div>
        </div>

        <div class="an-kpi">
          <div class="an-kpi__icon an-kpi__icon--success"><v-icon size="22">mdi-cash-multiple</v-icon></div>
          <div class="an-kpi__body">
            <p class="an-kpi__label">Stock Value (Cost)</p>
            <p class="an-kpi__value text-success">{{ formatMoney(data.kpis.total_cost_value) }}</p>
            <p class="an-kpi__sub">Retail: {{ formatMoney(data.kpis.total_retail_value) }}</p>
          </div>
        </div>

        <div class="an-kpi">
          <div class="an-kpi__icon an-kpi__icon--info"><v-icon size="22">mdi-chart-line-variant</v-icon></div>
          <div class="an-kpi__body">
            <p class="an-kpi__label">Potential Profit</p>
            <p class="an-kpi__value text-info">{{ formatMoney(data.kpis.potential_profit) }}</p>
            <p class="an-kpi__sub">Margin on current stock</p>
          </div>
        </div>

        <div class="an-kpi">
          <div class="an-kpi__icon an-kpi__icon--warning"><v-icon size="22">mdi-package-variant-closed</v-icon></div>
          <div class="an-kpi__body">
            <p class="an-kpi__label">Low Stock</p>
            <p class="an-kpi__value text-warning">{{ data.kpis.low_stock }}</p>
            <p class="an-kpi__sub">{{ data.kpis.reorder_items }} need reorder</p>
          </div>
        </div>

        <div class="an-kpi">
          <div class="an-kpi__icon an-kpi__icon--error"><v-icon size="22">mdi-package-variant-remove</v-icon></div>
          <div class="an-kpi__body">
            <p class="an-kpi__label">Out of Stock</p>
            <p class="an-kpi__value text-error">{{ data.kpis.out_of_stock }}</p>
            <p class="an-kpi__sub">{{ data.kpis.in_stock }} in stock</p>
          </div>
        </div>
      </div>

      <!-- ===== Health bar ===== -->
      <div class="an-health">
        <div class="an-health__title">
          <v-icon size="18" color="primary">mdi-heart-pulse</v-icon>
          <span>Stock Health Overview</span>
        </div>
        <div class="an-health__bar">
          <div class="an-health__segment an-health__segment--in" :style="{ width: inStockPct + '%' }" :title="`In Stock: ${data.kpis.in_stock}`" />
          <div class="an-health__segment an-health__segment--low" :style="{ width: lowStockPct + '%' }" :title="`Low Stock: ${data.kpis.low_stock}`" />
          <div class="an-health__segment an-health__segment--out" :style="{ width: outStockPct + '%' }" :title="`Out of Stock: ${data.kpis.out_of_stock}`" />
        </div>
        <div class="an-health__legend">
          <div class="an-health__legend-item"><span class="an-health__dot an-health__dot--in"></span> In Stock <strong>{{ data.kpis.in_stock }}</strong></div>
          <div class="an-health__legend-item"><span class="an-health__dot an-health__dot--low"></span> Low Stock <strong>{{ data.kpis.low_stock }}</strong></div>
          <div class="an-health__legend-item"><span class="an-health__dot an-health__dot--out"></span> Out of Stock <strong>{{ data.kpis.out_of_stock }}</strong></div>
        </div>
      </div>

      <!-- ===== Tab views: Data Visualization / Low Stock / Out of Stock / ABC Table ===== -->
      <div class="an-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="an-tab"
          :class="{ 'an-tab--active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <v-icon size="18" class="mr-1">{{ tab.icon }}</v-icon>
          {{ tab.label }}
          <span class="an-tab__badge">{{ tab.count }}</span>
        </button>
      </div>

      <!-- ===== ABC Classification Table ===== -->
      <div v-if="activeTab === 'abc'" class="an-table-wrap">
        <table class="an-table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Unit Cost</th>
              <th class="text-right">Stock Value</th>
              <th class="text-right">% Share</th>
              <th class="text-right">% Cumulative</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data.abc_analysis" :key="item.id" class="an-table__row">
              <td>
                <span class="an-abc-badge" :class="'an-abc-badge--' + item.class.toLowerCase()">{{ item.class }}</span>
              </td>
              <td>
                <div class="an-table__product">{{ item.product_name }}</div>
              </td>
              <td class="text-medium-emphasis">{{ item.product_sku }}</td>
              <td>{{ item.category || '—' }}</td>
              <td class="text-right">{{ item.quantity_on_hand }}</td>
              <td class="text-right">{{ formatMoney(item.cost_price) }}</td>
              <td class="text-right">
                <div class="an-value-cell">
                  <div class="an-value-cell__bar-bg">
                    <div class="an-value-cell__bar" :class="'an-value-cell__bar--' + item.class.toLowerCase()" :style="{ width: abcSharePct(item) + '%' }"></div>
                  </div>
                  <span class="font-weight-bold">{{ formatMoney(item.stock_value) }}</span>
                </div>
              </td>
              <td class="text-right">{{ abcSharePct(item).toFixed(1) }}%</td>
              <td class="text-right text-medium-emphasis">{{ item.cumulative_pct }}%</td>
            </tr>
            <tr v-if="!data.abc_analysis.length">
              <td colspan="9" class="an-table__empty">
                <v-icon size="36" color="grey-lighten-1">mdi-chart-bell-curve</v-icon>
                <p class="text-body-2 mt-2 text-medium-emphasis">No ABC data available.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ===== Low Stock Tab ===== -->
      <div v-if="activeTab === 'low'" class="an-table-wrap">
        <table class="an-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th class="text-right">On Hand</th>
              <th class="text-right">Reorder Level</th>
              <th class="text-right">Reorder Qty</th>
              <th class="text-right">Unit Cost</th>
              <th class="text-right">Reorder Value</th>
              <th>Branch</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in lowStockItems" :key="item.id" class="an-table__row">
              <td>
                <div class="an-table__product">{{ item.product_name }}</div>
              </td>
              <td class="text-medium-emphasis">{{ item.product_sku }}</td>
              <td>{{ item.category || '—' }}</td>
              <td class="text-right">
                <span class="an-qty-badge" :class="Number(item.quantity_on_hand) <= 0 ? 'an-qty-badge--out' : 'an-qty-badge--low'">
                  {{ item.quantity_on_hand }}
                </span>
              </td>
              <td class="text-right text-medium-emphasis">{{ item.reorder_level }}</td>
              <td class="text-right font-weight-medium">{{ item.reorder_qty }}</td>
              <td class="text-right">{{ formatMoney(item.cost_price) }}</td>
              <td class="text-right font-weight-bold">{{ formatMoney(Number(item.reorder_qty) * Number(item.cost_price)) }}</td>
              <td class="text-medium-emphasis">{{ item.branch_name }}</td>
              <td>
                <span class="an-status-badge" :class="Number(item.quantity_on_hand) <= 0 ? 'an-status-badge--out' : 'an-status-badge--low'">
                  <span class="an-status-badge__dot"></span>
                  {{ Number(item.quantity_on_hand) <= 0 ? 'Out' : 'Low' }}
                </span>
              </td>
            </tr>
            <tr v-if="!lowStockItems.length">
              <td colspan="10" class="an-table__empty">
                <v-icon size="36" color="success">mdi-check-circle-outline</v-icon>
                <p class="text-body-2 mt-2">All stock levels are healthy — no low-stock alerts.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ===== Movement Log Tab ===== -->
      <div v-if="activeTab === 'movements'" class="an-movement-grid">
        <div v-for="mv in data.movement_summary" :key="mv.movement_type" class="an-movement-card">
          <div class="an-movement-card__icon" :class="movementClass(mv.movement_type)">
            <v-icon size="20">{{ movementIcon(mv.movement_type) }}</v-icon>
          </div>
          <div class="an-movement-card__body">
            <p class="an-movement-card__label">{{ mv.label }}</p>
            <div class="an-movement-card__stats">
              <div>
                <p class="an-movement-card__big">{{ mv.count }}</p>
                <p class="an-movement-card__sub">movements</p>
              </div>
              <div>
                <p class="an-movement-card__big">{{ formatUnits(mv.quantity) }}</p>
                <p class="an-movement-card__sub">units moved</p>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!data.movement_summary.length" class="an-card__empty" style="grid-column: 1 / -1;">
          <v-icon size="40" color="grey-lighten-1">mdi-swap-horizontal</v-icon>
          <p class="text-body-2 text-medium-emphasis mt-2">No stock movements recorded in the last 30 days.</p>
        </div>
      </div>

      <!-- ===== Data Visualization Tab ===== -->
      <div v-if="activeTab === 'charts'" class="an-data-viz">
        <!-- Charts Row 1: Category Donut + Top 10 bar -->
        <div class="an-chart-row">
          <div class="an-card an-card--half">
            <div class="an-card__header">
              <div class="an-card__header-icon an-card__header-icon--indigo"><v-icon size="20">mdi-chart-donut</v-icon></div>
              <div>
                <h3 class="an-card__title">Stock Value by Category</h3>
                <p class="an-card__subtitle">Investment distribution across categories</p>
              </div>
            </div>
            <div class="an-card__body">
              <apexchart type="donut" height="320" :options="categoryDonutOptions" :series="categoryDonutSeries" />
            </div>
          </div>

          <div class="an-card an-card--half">
            <div class="an-card__header">
              <div class="an-card__header-icon an-card__header-icon--blue"><v-icon size="20">mdi-chart-bar</v-icon></div>
              <div>
                <h3 class="an-card__title">Top 10 Products by Stock Value</h3>
                <p class="an-card__subtitle">Highest inventory investment</p>
              </div>
            </div>
            <div class="an-card__body">
              <apexchart type="bar" height="320" :options="topValueOptions" :series="topValueSeries" />
            </div>
          </div>
        </div>

        <!-- Charts Row 2: Movement trend + ABC Pie -->
        <div class="an-chart-row">
          <div class="an-card an-card--half">
            <div class="an-card__header">
              <div class="an-card__header-icon an-card__header-icon--teal"><v-icon size="20">mdi-swap-horizontal-bold</v-icon></div>
              <div>
                <h3 class="an-card__title">Stock Movements (30 days)</h3>
                <p class="an-card__subtitle">Activity breakdown by movement type</p>
              </div>
            </div>
            <div class="an-card__body">
              <apexchart v-if="movementSeries.length" type="bar" height="280" :options="movementOptions" :series="movementSeries" />
              <div v-else class="an-card__empty">
                <v-icon size="40" color="grey-lighten-1">mdi-chart-bar-disabled</v-icon>
                <p class="text-body-2 text-medium-emphasis mt-2">No movements in the last 30 days</p>
              </div>
            </div>
          </div>

          <div class="an-card an-card--half">
            <div class="an-card__header">
              <div class="an-card__header-icon an-card__header-icon--amber"><v-icon size="20">mdi-chart-bell-curve</v-icon></div>
              <div>
                <h3 class="an-card__title">ABC Classification</h3>
                <p class="an-card__subtitle">Pareto analysis of stock value</p>
              </div>
            </div>
            <div class="an-card__body">
              <div class="an-abc-summary">
                <div class="an-abc-item">
                  <div class="an-abc-item__badge an-abc-item__badge--a">A</div>
                  <div class="an-abc-item__body">
                    <p class="an-abc-item__count">{{ data.abc_counts.A }}</p>
                    <p class="an-abc-item__label">Class A · 80% value</p>
                  </div>
                </div>
                <div class="an-abc-item">
                  <div class="an-abc-item__badge an-abc-item__badge--b">B</div>
                  <div class="an-abc-item__body">
                    <p class="an-abc-item__count">{{ data.abc_counts.B }}</p>
                    <p class="an-abc-item__label">Class B · next 15%</p>
                  </div>
                </div>
                <div class="an-abc-item">
                  <div class="an-abc-item__badge an-abc-item__badge--c">C</div>
                  <div class="an-abc-item__body">
                    <p class="an-abc-item__count">{{ data.abc_counts.C }}</p>
                    <p class="an-abc-item__label">Class C · remaining 5%</p>
                  </div>
                </div>
              </div>
              <apexchart type="donut" height="200" :options="abcDonutOptions" :series="abcDonutSeries" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { StockAnalysisData, ABCItem } from '~/types/inventory'

definePageMeta({ middleware: 'auth' })
const { currency } = useFormat()
const toast = useToast()

function formatMoney(v: number | string | null | undefined): string {
  const num = typeof v === 'string' ? parseFloat(v) : (v || 0)
  return currency(num)
}

function formatUnits(v: number | string | null | undefined): string {
  const num = typeof v === 'string' ? parseFloat(v) : (v || 0)
  if (!num) return '0'
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toLocaleString('en-GB')
}

// ===== State =====
const loading = ref(false)
const data = ref<StockAnalysisData | null>(null)
const activeTab = ref('charts')

const tabs = computed(() => [
  { id: 'charts', label: 'Data Visualization', icon: 'mdi-chart-multiple', count: 4 },
  { id: 'abc', label: 'ABC Classification', icon: 'mdi-chart-bell-curve', count: data.value?.abc_analysis?.length || 0 },
  { id: 'low', label: 'Low Stock Alerts', icon: 'mdi-alert-outline', count: data.value?.low_stock_items?.length || 0 },
  { id: 'movements', label: 'Movement Log', icon: 'mdi-swap-horizontal-bold', count: data.value?.movement_summary?.length || 0 },
])

const lowStockItems = computed(() => {
  if (!data.value) return []
  return [...data.value.low_stock_items].sort((a, b) =>
    Number(a.quantity_on_hand) - Number(b.quantity_on_hand)
  )
})

const totalItems = computed(() => {
  if (!data.value) return 0
  return data.value.kpis.in_stock + data.value.kpis.low_stock + data.value.kpis.out_of_stock
})

const inStockPct = computed(() => totalItems.value ? (data.value!.kpis.in_stock / totalItems.value) * 100 : 0)
const lowStockPct = computed(() => totalItems.value ? (data.value!.kpis.low_stock / totalItems.value) * 100 : 0)
const outStockPct = computed(() => totalItems.value ? (data.value!.kpis.out_of_stock / totalItems.value) * 100 : 0)

// ===== Chart configs =====
const palette = ['#3478f6', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8', '#f43f5e', '#10b981']

const categoryDonutSeries = computed(() => data.value?.by_category?.map(c => Number(c.value)) || [])

const categoryDonutOptions = computed(() => ({
  chart: { type: 'donut', background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
  labels: data.value?.by_category?.map(c => c.category) || [],
  colors: palette,
  legend: { position: 'bottom', fontSize: '13px' },
  dataLabels: { enabled: true, formatter: (val: number) => `${val.toFixed(1)}%` },
  tooltip: { y: { formatter: (v: number) => formatMoney(v) } },
  stroke: { width: 2, colors: ['rgb(var(--v-theme-surface))'] },
  plotOptions: { pie: { donut: { size: '65%' } } },
}))

const topValueSeries = computed(() => {
  if (!data.value) return []
  return [{ name: 'Stock Value', data: data.value.top_by_value.map(i => Number(i.stock_value)) }]
})

const topValueOptions = computed(() => {
  if (!data.value) return {}
  const items = data.value.top_by_value
  return {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
    colors: ['#3478f6'],
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: '70%' } },
    grid: { borderColor: 'rgba(0,0,0,0.06)', xaxis: { lines: { show: true } } },
    xaxis: { categories: items.map(i => i.product_name), labels: { formatter: (v: number) => formatMoney(v) } },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (v: number) => formatMoney(v) } },
  }
})

const movementSeries = computed(() => {
  if (!data.value?.movement_summary?.length) return []
  return [{ name: 'Movements', data: data.value.movement_summary.map(m => m.count) }]
})

const movementOptions = computed(() => {
  if (!data.value) return {}
  const items = data.value.movement_summary
  return {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
    colors: ['#00B8D4'],
    plotOptions: { bar: { borderRadius: 6, columnWidth: '50%', distributed: true } },
    grid: { borderColor: 'rgba(0,0,0,0.06)', yaxis: { lines: { show: true } } },
    xaxis: { categories: items.map(m => m.label), labels: { style: { fontSize: '11px' } } },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (v: number) => `${v} movements` } },
  }
})

const abcDonutSeries = computed(() => {
  if (!data.value) return []
  return [data.value.abc_counts.A, data.value.abc_counts.B, data.value.abc_counts.C]
})

const abcDonutOptions = computed(() => ({
  chart: { type: 'donut', background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
  labels: ['Class A', 'Class B', 'Class C'],
  colors: ['#34d399', '#60a5fa', '#f59e0b'],
  legend: { position: 'bottom', fontSize: '12px' },
  dataLabels: { enabled: true, formatter: (val: number) => `${val.toFixed(0)}%` },
  stroke: { width: 2, colors: ['rgb(var(--v-theme-surface))'] },
  plotOptions: { pie: { donut: { size: '68%' } } },
}))

// ===== Movement helpers =====
function movementIcon(type: string): string {
  const map: Record<string, string> = {
    purchase: 'mdi-truck-check-outline',
    sale: 'mdi-cart-arrow-down',
    return: 'mdi-cart-arrow-up',
    adjustment: 'mdi-clipboard-edit-outline',
    transfer_out: 'mdi-arrow-top-right-bold-box-outline',
    transfer_in: 'mdi-arrow-bottom-left-bold-box-outline',
    damage: 'mdi-alert-octagon-outline',
    initial: 'mdi-package-variant',
  }
  return map[type] || 'mdi-swap-horizontal'
}

function movementClass(type: string): string {
  const positive = ['purchase', 'transfer_in', 'return', 'initial']
  const negative = ['sale', 'transfer_out', 'adjustment', 'damage']
  if (positive.includes(type)) return 'an-movement-card__icon--success'
  if (negative.includes(type)) return 'an-movement-card__icon--warning'
  return 'an-movement-card__icon--info'
}

// ===== Data =====
async function loadData() {
  loading.value = true
  try {
    const res = await useApi()('/inventory/items/analytics/')
    data.value = res as StockAnalysisData
  } catch (e: any) {
    toast.error('Failed to load stock analytics')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

function abcSharePct(item: ABCItem): number {
  if (!data.value) return 0
  const total = data.value.abc_analysis.reduce((s, i) => s + Number(i.stock_value), 0)
  if (!total) return 0
  return (Number(item.stock_value) / total) * 100
}

function printReport() {
  window.print()
}
</script>

<style scoped>
/* ===== Page wrapper ===== */
.an-page {
  padding: 20px 24px;
  max-width: 1600px;
  margin: 0 auto;
  font-family: "Segoe UI Variable", Inter, system-ui, sans-serif;
}

/* ===== Header ===== */
.an-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.an-header__left { display: flex; flex-direction: column; gap: 4px; }
.an-header__title h1 { letter-spacing: -0.02em; line-height: 1.2; }
.an-header__actions { display: flex; gap: 8px; }

/* ===== Loading ===== */
.an-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

/* ===== KPI Grid ===== */
.an-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
.an-kpi {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: box-shadow 0.2s, transform 0.15s;
}
.an-kpi:hover { box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06); }
.an-kpi__icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.an-kpi__icon--primary { background: rgba(52, 120, 246, 0.12); color: #3478f6; }
.an-kpi__icon--success { background: rgba(76, 175, 80, 0.12); color: rgb(76, 175, 80); }
.an-kpi__icon--info    { background: rgba(33, 150, 243, 0.12); color: rgb(33, 150, 243); }
.an-kpi__icon--warning { background: rgba(255, 152, 0, 0.12); color: rgb(255, 152, 0); }
.an-kpi__icon--error   { background: rgba(239, 83, 80, 0.12); color: rgb(239, 83, 80); }
.an-kpi__label { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.5); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
.an-kpi__value { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; margin-top: 2px; line-height: 1.1; }
.an-kpi__sub { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.4); margin-top: 4px; }

/* ===== Health bar ===== */
.an-health {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 14px;
  padding: 16px 20px;
  margin-bottom: 20px;
}
.an-health__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 0.875rem;
  margin-bottom: 12px;
}
.an-health__bar {
  display: flex;
  height: 14px;
  border-radius: 7px;
  overflow: hidden;
  background: rgba(var(--v-theme-on-surface), 0.06);
}
.an-health__segment { transition: width 0.4s ease; }
.an-health__segment--in { background: linear-gradient(135deg, #34d399, #10b981); }
.an-health__segment--low { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
.an-health__segment--out { background: linear-gradient(135deg, #f87171, #ef4444); }
.an-health__legend {
  display: flex;
  gap: 24px;
  margin-top: 10px;
  flex-wrap: wrap;
}
.an-health__legend-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
.an-health__legend-item strong { margin-left: 2px; }
.an-health__dot {
  width: 10px; height: 10px; border-radius: 50%;
}
.an-health__dot--in { background: #10b981; }
.an-health__dot--low { background: #f59e0b; }
.an-health__dot--out { background: #ef4444; }

/* ===== Chart row ===== */
.an-chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}.an-data-viz .an-chart-row { margin-bottom: 16px; }
.an-data-viz .an-chart-row:last-child { margin-bottom: 0; }@media (max-width: 1100px) {
  .an-chart-row { grid-template-columns: 1fr; }
}

/* ===== Card ===== */
.an-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 14px;
  overflow: hidden;
}
.an-card--half { min-height: 400px; }
.an-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.an-card__header-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.an-card__header-icon--indigo { background: rgba(99, 102, 241, 0.12); color: rgb(99, 102, 241); }
.an-card__header-icon--blue   { background: rgba(52, 120, 246, 0.12); color: #3478f6; }
.an-card__header-icon--teal   { background: rgba(0, 184, 212, 0.12); color: #00B8D4; }
.an-card__header-icon--amber  { background: rgba(245, 158, 11, 0.12); color: rgba(245, 158, 11); }
.an-card__title { font-size: 0.9375rem; font-weight: 700; letter-spacing: -0.01em; }
.an-card__subtitle { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.4); margin-top: 1px; }
.an-card__body { padding: 14px 20px 20px; }
.an-card__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

/* ===== ABC Summary ===== */
.an-abc-summary {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}
.an-abc-item {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(var(--v-theme-on-surface), 0.03);
}
.an-abc-item__badge {
  width: 36px; height: 36px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  color: #fff;
  flex-shrink: 0;
}
.an-abc-item__badge--a { background: linear-gradient(135deg, #34d399, #10b981); }
.an-abc-item__badge--b { background: linear-gradient(135deg, #60a5fa, #3478f6); }
.an-abc-item__badge--c { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
.an-abc-item__count { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.02em; }
.an-abc-item__label { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.4); text-transform: uppercase; letter-spacing: 0.04em; }

/* ===== Tabs ===== */
.an-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.an-tab {
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
.an-tab:hover { background: rgba(var(--v-theme-on-surface), 0.04); }
.an-tab--active {
  background: rgba(52, 120, 246, 0.08);
  border-color: rgba(52, 120, 246, 0.25);
  color: #3478f6;
}
.an-tab__badge {
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
.an-tab--active .an-tab__badge {
  background: rgba(52, 120, 246, 0.15);
  color: #3478f6;
}

/* ===== Tables ===== */
.an-table-wrap {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 14px;
  overflow-x: auto;
}
.an-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}
.an-table thead tr {
  background: rgba(var(--v-theme-on-surface), 0.02);
}
.an-table th {
  text-align: left;
  padding: 11px 16px;
  font-weight: 700;
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(var(--v-theme-on-surface), 0.5);
  white-space: nowrap;
}
.an-table th.text-right,
.an-table td.text-right { text-align: right; }
.an-table tbody tr { border-top: 1px solid rgba(var(--v-theme-on-surface), 0.04); }
.an-table__row { cursor: default; transition: background 0.12s; }
.an-table__row:hover { background: rgba(52, 120, 246, 0.02); }
.an-table td { padding: 11px 16px; white-space: nowrap; }
.an-table__product { font-weight: 600; }
.an-table__empty {
  text-align: center;
  padding: 40px 16px;
  color: rgba(var(--v-theme-on-surface), 0.4);
}

/* ===== Quantity badge ===== */
.an-qty-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  padding: 2px 10px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.75rem;
}
.an-qty-badge--low { background: rgba(255, 152, 0, 0.12); color: rgb(255, 152, 0); }
.an-qty-badge--out { background: rgba(239, 83, 80, 0.12); color: rgb(239, 83, 80); }

/* ===== Status badge ===== */
.an-status-badge {
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
.an-status-badge__dot {
  width: 6px; height: 6px;
  border-radius: 50%;
}
.an-status-badge--low { background: rgba(255, 152, 0, 0.1); color: rgb(255, 152, 0); }
.an-status-badge--low .an-status-badge__dot { background: rgb(255, 152, 0); }
.an-status-badge--out { background: rgba(239, 83, 80, 0.1); color: rgb(239, 83, 80); }
.an-status-badge--out .an-status-badge__dot { background: rgb(239, 83, 80); }

/* ===== ABC Badge ===== */
.an-abc-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px; height: 30px;
  border-radius: 7px;
  font-weight: 800;
  font-size: 0.875rem;
  color: #fff;
}
.an-abc-badge--a { background: linear-gradient(135deg, #34d399, #10b981); }
.an-abc-badge--b { background: linear-gradient(135deg, #60a5fa, #3478f6); }
.an-abc-badge--c { background: linear-gradient(135deg, #fbbf24, #f59e0b); }

/* ===== ABC Value Bar ===== */
.an-value-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
}
.an-value-cell__bar-bg {
  width: 80px;
  height: 6px;
  border-radius: 3px;
  background: rgba(var(--v-theme-on-surface), 0.06);
  overflow: hidden;
  flex-shrink: 0;
}
.an-value-cell__bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}
.an-value-cell__bar--a { background: linear-gradient(90deg, #34d399, #10b981); }
.an-value-cell__bar--b { background: linear-gradient(90deg, #60a5fa, #3478f6); }
.an-value-cell__bar--c { background: linear-gradient(90deg, #fbbf24, #f59e0b); }

/* ===== Movement cards ===== */
.an-movement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}
.an-movement-card {
  display: flex;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: box-shadow 0.15s;
}
.an-movement-card:hover { box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05); }
.an-movement-card__icon {
  width: 42px; height: 42px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.an-movement-card__icon--success { background: rgba(76, 175, 80, 0.12); color: rgb(76, 175, 80); }
.an-movement-card__icon--warning { background: rgba(255, 152, 0, 0.12); color: rgb(255, 152, 0); }
.an-movement-card__icon--info    { background: rgba(33, 150, 243, 0.12); color: rgb(33, 150, 243); }
.an-movement-card__body { flex: 1; }
.an-movement-card__label { font-size: 0.8125rem; font-weight: 700; margin-bottom: 8px; }
.an-movement-card__stats { display: flex; gap: 20px; }
.an-movement-card__big { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.02em; line-height: 1; }
.an-movement-card__sub { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.4); text-transform: uppercase; letter-spacing: 0.04em; margin-top: 4px; }

/* ===== Mobile tweaks ===== */
@media (max-width: 768px) {
  .an-page { padding: 12px; }
  .an-kpi-grid { grid-template-columns: 1fr 1fr; }
  .an-abc-summary { flex-direction: column; }
}

@media print {
  .an-header__actions, .an-tabs { display: none; }
  .an-card { border: 1px solid #ddd !important; }
}
</style>

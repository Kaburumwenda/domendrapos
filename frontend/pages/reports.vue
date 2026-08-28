<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const api = useApi()
const { currency: fmtCurrency, number: fmtNumber, date: fmtDate, percent: fmtPct } = useFormat()
const auth = useAuthStore()
const { exporting, exportingGeneral, exportReport, exportGeneralReport } = useReportExport()

import type { ReportColumn, ReportKpi, ReportChartData, GeneralReportSection } from '~/composables/useReportExport'

// ── Color palette for charts ──────────────────────────────────
const COLORS = ['#1976D2', '#2E7D32', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#795548', '#607D8B', '#8BC34A', '#CDDC39', '#FF5722', '#3F51B5']
function colorAt(i: number): string { return COLORS[i % COLORS.length] }

// ── Filters ────────────────────────────────────────────────────
const presets = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 30 days', value: '30' },
  { label: 'This month', value: 'month' },
  { label: 'Last month', value: 'lastmonth' },
  { label: 'This year', value: 'year' },
  { label: 'Custom', value: 'custom' },
]

const preset = ref('month')
const customFrom = ref('')
const customTo = ref('')
const branchFilter = ref(null as number | null)
const branchOptions = ref<any[]>([])

// ── Report types ────────────────────────────────────────────────
interface ReportTab {
  id: string
  short: string
  icon: string
  label: string
  group: string
}

const reports: ReportTab[] = [
  // Sales group
  { id: 'sales-summary', short: 'Summary', icon: 'mdi-chart-line', label: 'Sales Summary', group: 'Sales' },
  { id: 'daily-revenue', short: 'Daily Revenue', icon: 'mdi-chart-bar', label: 'Daily Revenue', group: 'Sales' },
  { id: 'sales-by-product', short: 'Products', icon: 'mdi-package-variant-closed', label: 'Sales by Product', group: 'Sales' },
  { id: 'sales-by-category', short: 'Categories', icon: 'mdi-chart-pie', label: 'Sales by Category', group: 'Sales' },
  { id: 'sales-by-branch', short: 'Branches', icon: 'mdi-store-outline', label: 'Sales by Branch', group: 'Sales' },
  { id: 'sales-by-cashier', short: 'Cashiers', icon: 'mdi-account-tie', label: 'Sales by Cashier', group: 'Sales' },
  { id: 'payment-methods', short: 'Payments', icon: 'mdi-credit-card-outline', label: 'Payment Methods', group: 'Sales' },
  { id: 'profit-margin', short: 'Profit Margin', icon: 'mdi-chart-bell-curve', label: 'Profit Margin', group: 'Sales' },
  { id: 'tax-collected', short: 'Tax', icon: 'mdi-calculator', label: 'Tax Collected', group: 'Sales' },
  // Customer group
  { id: 'top-customers', short: 'Top Customers', icon: 'mdi-account-star-outline', label: 'Top Customers', group: 'Customers' },
  // Inventory group
  { id: 'inventory-valuation', short: 'Inventory', icon: 'mdi-currency-usd', label: 'Inventory Valuation', group: 'Inventory' },
  { id: 'low-stock', short: 'Low Stock', icon: 'mdi-alert-outline', label: 'Low Stock Report', group: 'Inventory' },
  { id: 'stock-movement', short: 'Stock Moves', icon: 'mdi-swap-vertical', label: 'Stock Movement', group: 'Inventory' },
  // Analytics group
  { id: 'hourly-sales', short: 'Hourly', icon: 'mdi-clock-outline', label: 'Hourly Sales', group: 'Analytics' },
  { id: 'time-of-day', short: 'Time of Day', icon: 'mdi-theme-light-dark', label: 'Time of Day Breakdown', group: 'Analytics' },
  { id: 'weekday-sales', short: 'Weekday', icon: 'mdi-calendar-blank-outline', label: 'Weekday Sales', group: 'Analytics' },
  { id: 'peak-hours-heatmap', short: 'Heatmap', icon: 'mdi-grid', label: 'Peak Hours Heatmap', group: 'Analytics' },
  { id: 'sales-growth', short: 'Growth', icon: 'mdi-chart-trending-up', label: 'Sales Growth', group: 'Analytics' },
  { id: 'revenue-trend', short: 'Revenue Trend', icon: 'mdi-chart-areaspline', label: 'Revenue Trend', group: 'Analytics' },
  { id: 'product-analytics', short: 'Product Analytics', icon: 'mdi-chart-scatter-plot', label: 'Product Analytics', group: 'Analytics' },
  { id: 'category-analytics', short: 'Category Analytics', icon: 'mdi-chart-donut', label: 'Category Analytics', group: 'Analytics' },
]

const activeReport = ref('sales-summary')

const loading = ref(false)
const error = ref<string | null>(null)
const reportData = ref<any>(null)

// ── Tab groups for display ─────────────────────────────────────
const groupedTabs = computed(() => {
  const groups = new Map<string, ReportTab[]>()
  for (const r of reports) {
    if (!groups.has(r.group)) groups.set(r.group, [])
    groups.get(r.group)!.push(r)
  }
  return Array.from(groups.entries()).map(([group, tabs]) => ({ group, tabs }))
})

// ── Column definitions per report ──────────────────────────────
const COLUMN_MAP: Record<string, ReportColumn[]> = {
  'sales-summary': [
    { key: 'total_revenue', label: 'Total Revenue', format: 'currency' },
    { key: 'total_cost', label: 'Total Cost', format: 'currency' },
    { key: 'gross_profit', label: 'Gross Profit', format: 'currency' },
    { key: 'gross_margin', label: 'Gross Margin', format: 'percent' },
    { key: 'transaction_count', label: 'Txns', format: 'number' },
    { key: 'items_sold', label: 'Items Sold', format: 'number' },
    { key: 'average_sale', label: 'Avg Sale', format: 'currency' },
    { key: 'total_tax', label: 'Tax', format: 'currency' },
    { key: 'total_discounts', label: 'Discounts', format: 'currency' },
  ],
  'sales-by-product': [
    { key: 'product', label: 'Product' },
    { key: 'sku', label: 'SKU' },
    { key: 'qty_sold', label: 'Qty Sold', format: 'number' },
    { key: 'revenue', label: 'Revenue', format: 'currency' },
    { key: 'cost', label: 'Cost', format: 'currency' },
    { key: 'profit', label: 'Profit', format: 'currency' },
    { key: 'margin', label: 'Margin', format: 'percent' },
  ],
  'sales-by-branch': [
    { key: 'branch', label: 'Branch' },
    { key: 'code', label: 'Code' },
    { key: 'total_sales', label: 'Total Sales', format: 'currency' },
    { key: 'total_cost', label: 'Total Cost', format: 'currency' },
    { key: 'gross_profit', label: 'Gross Profit', format: 'currency' },
    { key: 'transaction_count', label: 'Txns', format: 'number' },
    { key: 'average_sale', label: 'Avg Sale', format: 'currency' },
  ],
  'sales-by-cashier': [
    { key: 'cashier', label: 'Cashier' },
    { key: 'total_sales', label: 'Total Sales', format: 'currency' },
    { key: 'transaction_count', label: 'Txns', format: 'number' },
    { key: 'average_sale', label: 'Avg Sale', format: 'currency' },
    { key: 'share_pct', label: 'Share', format: 'percent' },
  ],
  'daily-revenue': [
    { key: 'date', label: 'Date', format: 'date' },
    { key: 'revenue', label: 'Revenue', format: 'currency' },
    { key: 'cost', label: 'Cost', format: 'currency' },
    { key: 'profit', label: 'Profit', format: 'currency' },
    { key: 'transactions', label: 'Txns', format: 'number' },
  ],
  'profit-margin': [
    { key: 'product', label: 'Product' },
    { key: 'sku', label: 'SKU' },
    { key: 'qty_sold', label: 'Qty Sold', format: 'number' },
    { key: 'revenue', label: 'Revenue', format: 'currency' },
    { key: 'cost', label: 'Cost', format: 'currency' },
    { key: 'profit', label: 'Profit', format: 'currency' },
    { key: 'margin', label: 'Margin', format: 'percent' },
  ],
  'payment-methods': [
    { key: 'method', label: 'Method' },
    { key: 'total', label: 'Total', format: 'currency' },
    { key: 'count', label: 'Count', format: 'number' },
    { key: 'percentage', label: 'Share', format: 'percent' },
  ],
  'inventory-valuation': [
    { key: 'product', label: 'Product' },
    { key: 'sku', label: 'SKU' },
    { key: 'branch', label: 'Branch' },
    { key: 'qty_on_hand', label: 'Qty on Hand', format: 'number' },
    { key: 'cost_value', label: 'Cost Value', format: 'currency' },
    { key: 'retail_value', label: 'Retail Value', format: 'currency' },
    { key: 'potential_profit', label: 'Potential Profit', format: 'currency' },
  ],
  'low-stock': [
    { key: 'product', label: 'Product' },
    { key: 'sku', label: 'SKU' },
    { key: 'branch', label: 'Branch' },
    { key: 'on_hand', label: 'On Hand', format: 'number' },
    { key: 'reorder_level', label: 'Reorder Level', format: 'number' },
    { key: 'shortage', label: 'Shortage', format: 'number' },
  ],
  'top-customers': [
    { key: 'customer', label: 'Customer' },
    { key: 'total_spent', label: 'Total Spent', format: 'currency' },
    { key: 'visits', label: 'Visits', format: 'number' },
    { key: 'average_spend', label: 'Avg Spend', format: 'currency' },
  ],
  'tax-collected': [
    { key: 'total_tax_collected', label: 'Tax Collected', format: 'currency' },
    { key: 'taxable_sales', label: 'Taxable Sales', format: 'currency' },
    { key: 'effective_rate', label: 'Rate', format: 'percent' },
    { key: 'transaction_count', label: 'Txns', format: 'number' },
  ],
  'stock-movement': [
    { key: 'type', label: 'Type' },
    { key: 'product', label: 'Product' },
    { key: 'branch', label: 'Branch' },
    { key: 'quantity_change', label: 'Qty Change', format: 'number' },
    { key: 'movement_count', label: 'Moves', format: 'number' },
  ],
  'sales-by-category': [
    { key: 'category', label: 'Category' },
    { key: 'qty_sold', label: 'Qty Sold', format: 'number' },
    { key: 'revenue', label: 'Revenue', format: 'currency' },
    { key: 'cost', label: 'Cost', format: 'currency' },
    { key: 'profit', label: 'Profit', format: 'currency' },
    { key: 'margin', label: 'Margin', format: 'percent' },
  ],
  'hourly-sales': [
    { key: 'hour', label: 'Hour', format: 'number' },
    { key: 'revenue', label: 'Revenue', format: 'currency' },
    { key: 'transactions', label: 'Txns', format: 'number' },
  ],
  'time-of-day': [
    { key: 'label', label: 'Time Range' },
    { key: 'sub', label: 'Hours' },
    { key: 'revenue', label: 'Revenue', format: 'currency' },
    { key: 'transactions', label: 'Txns', format: 'number' },
    { key: 'revenue_pct', label: 'Rev %', format: 'percent' },
    { key: 'share_pct', label: 'Share %', format: 'percent' },
  ],
  'revenue-trend': [
    { key: 'date', label: 'Date', format: 'date' },
    { key: 'revenue', label: 'Revenue', format: 'currency' },
    { key: 'cost', label: 'Cost', format: 'currency' },
    { key: 'profit', label: 'Profit', format: 'currency' },
  ],
  'weekday-sales': [
    { key: 'name', label: 'Weekday' },
    { key: 'revenue', label: 'Revenue', format: 'currency' },
    { key: 'transactions', label: 'Txns', format: 'number' },
    { key: 'avg_revenue', label: 'Avg Revenue', format: 'currency' },
  ],
  'product-analytics': [
    { key: 'product', label: 'Product' },
    { key: 'sku', label: 'SKU' },
    { key: 'category', label: 'Category' },
    { key: 'qty_sold', label: 'Qty Sold', format: 'number' },
    { key: 'revenue', label: 'Revenue', format: 'currency' },
    { key: 'profit', label: 'Profit', format: 'currency' },
    { key: 'margin', label: 'Margin', format: 'percent' },
    { key: 'abc_class', label: 'ABC Class' },
    { key: 'revenue_share', label: 'Rev Share', format: 'percent' },
  ],
  'category-analytics': [
    { key: 'category', label: 'Category' },
    { key: 'qty_sold', label: 'Qty Sold', format: 'number' },
    { key: 'revenue', label: 'Revenue', format: 'currency' },
    { key: 'profit', label: 'Profit', format: 'currency' },
    { key: 'margin', label: 'Margin', format: 'percent' },
    { key: 'revenue_share', label: 'Rev Share', format: 'percent' },
    { key: 'stock_value', label: 'Stock Value', format: 'currency' },
    { key: 'sku_count', label: 'SKUs', format: 'number' },
  ],
}

function getColumns(reportId: string): ReportColumn[] {
  return COLUMN_MAP[reportId] || []
}

const reportColumns = computed<ReportColumn[]>(() => getColumns(activeReport.value))

// ── KPI cards per report ────────────────────────────────────────
const reportKpis = computed<ReportKpi[]>(() => {
  if (!reportData.value) return []
  return getKpis(activeReport.value, reportData.value)
})

// ── KPI extraction helper (reusable for general report) ──────
function getKpis(reportId: string, d: any): ReportKpi[] {
  if (!d) return []
  switch (reportId) {
    case 'sales-summary':
      return [
        { label: 'Total Revenue', value: fmtCurrency(d.total_revenue), color: '#1976D2' },
        { label: 'Gross Profit', value: fmtCurrency(d.gross_profit), color: '#2E7D32' },
        { label: 'Avg Sale', value: fmtCurrency(d.average_sale), color: '#0288D1' },
        { label: 'Txns', value: fmtNumber(d.transaction_count), color: '#7B1FA2' },
        { label: 'Items Sold', value: fmtNumber(d.items_sold), color: '#E65100' },
        { label: 'Discounts', value: fmtCurrency(d.total_discounts), color: '#F57F17' },
      ]
    case 'sales-by-branch': {
      const items = Array.isArray(d) ? d : []
      const totalSales = items.reduce((s: number, r: any) => s + Number(r.total_sales || 0), 0)
      const totalTxns = items.reduce((s: number, r: any) => s + Number(r.transaction_count || 0), 0)
      const totalProfit = items.reduce((s: number, r: any) => s + Number(r.gross_profit || 0), 0)
      return [
        { label: 'Total Sales', value: fmtCurrency(totalSales), color: '#1976D2' },
        { label: 'Gross Profit', value: fmtCurrency(totalProfit), color: '#2E7D32' },
        { label: 'Txns', value: fmtNumber(totalTxns), color: '#7B1FA2' },
        { label: 'Branches', value: fmtNumber(items.length), color: '#E65100' },
      ]
    }
    case 'sales-by-cashier': {
      const items = Array.isArray(d) ? d : []
      const totalSales = items.reduce((s: number, r: any) => s + Number(r.total_sales || 0), 0)
      const totalTxns = items.reduce((s: number, r: any) => s + Number(r.transaction_count || 0), 0)
      return [
        { label: 'Total Sales', value: fmtCurrency(totalSales), color: '#1976D2' },
        { label: 'Txns', value: fmtNumber(totalTxns), color: '#7B1FA2' },
        { label: 'Cashiers', value: fmtNumber(items.length), color: '#E65100' },
      ]
    }
    case 'sales-by-product': {
      const items = Array.isArray(d) ? d : []
      const totalRev = items.reduce((s: number, r: any) => s + Number(r.revenue || 0), 0)
      const totalProfit = items.reduce((s: number, r: any) => s + Number(r.profit || 0), 0)
      const totalQty = items.reduce((s: number, r: any) => s + Number(r.qty_sold || 0), 0)
      return [
        { label: 'Total Revenue', value: fmtCurrency(totalRev), color: '#1976D2' },
        { label: 'Gross Profit', value: fmtCurrency(totalProfit), color: '#2E7D32' },
        { label: 'Items Sold', value: fmtNumber(totalQty), color: '#E65100' },
        { label: 'Products', value: fmtNumber(items.length), color: '#7B1FA2' },
      ]
    }
    case 'sales-by-category': {
      const items = Array.isArray(d) ? d : []
      const totalRev = items.reduce((s: number, r: any) => s + Number(r.revenue || 0), 0)
      const totalProfit = items.reduce((s: number, r: any) => s + Number(r.profit || 0), 0)
      const totalQty = items.reduce((s: number, r: any) => s + Number(r.qty_sold || 0), 0)
      return [
        { label: 'Total Revenue', value: fmtCurrency(totalRev), color: '#1976D2' },
        { label: 'Gross Profit', value: fmtCurrency(totalProfit), color: '#2E7D32' },
        { label: 'Items Sold', value: fmtNumber(totalQty), color: '#E65100' },
        { label: 'Categories', value: fmtNumber(items.length), color: '#7B1FA2' },
      ]
    }
    case 'inventory-valuation': {
      const items = Array.isArray(d) ? d : []
      const totalCost = items.reduce((s: number, r: any) => s + Number(r.cost_value || 0), 0)
      const totalRetail = items.reduce((s: number, r: any) => s + Number(r.retail_value || 0), 0)
      const totalQty = items.reduce((s: number, r: any) => s + Number(r.qty_on_hand || 0), 0)
      return [
        { label: 'Total Cost Value', value: fmtCurrency(totalCost), color: '#1976D2' },
        { label: 'Total Retail Value', value: fmtCurrency(totalRetail), color: '#2E7D32' },
        { label: 'Items', value: fmtNumber(items.length), color: '#7B1FA2' },
        { label: 'Total Qty', value: fmtNumber(totalQty), color: '#E65100' },
      ]
    }
    case 'tax-collected':
      return [
        { label: 'Tax Collected', value: fmtCurrency(d.total_tax_collected), color: '#1976D2' },
        { label: 'Taxable Sales', value: fmtCurrency(d.taxable_sales), color: '#2E7D32' },
        { label: 'Effective Rate', value: `${Number(d.effective_rate).toFixed(1)}%`, color: '#7B1FA2' },
        { label: 'Txns', value: fmtNumber(d.transaction_count), color: '#E65100' },
      ]
    case 'payment-methods': {
      const items = Array.isArray(d) ? d : []
      const grand = items.reduce((s: number, r: any) => s + Number(r.total || 0), 0)
      return [
        { label: 'Total Revenue', value: fmtCurrency(grand), color: '#1976D2' },
        { label: 'Transactions', value: fmtNumber(items.reduce((s: number, r: any) => s + Number(r.count || 0), 0)), color: '#2E7D32' },
        { label: 'Methods', value: fmtNumber(items.length), color: '#7B1FA2' },
      ]
    }
    case 'top-customers': {
      const items = Array.isArray(d) ? d : []
      const totalSpent = items.reduce((s: number, r: any) => s + Number(r.total_spent || 0), 0)
      const totalVisits = items.reduce((s: number, r: any) => s + Number(r.visits || 0), 0)
      return [
        { label: 'Total Revenue', value: fmtCurrency(totalSpent), color: '#1976D2' },
        { label: 'Total Visits', value: fmtNumber(totalVisits), color: '#2E7D32' },
        { label: 'Customers', value: fmtNumber(items.length), color: '#7B1FA2' },
        { label: 'Avg Spend', value: fmtCurrency(totalVisits ? totalSpent / totalVisits : 0), color: '#E65100' },
      ]
    }
    case 'hourly-sales': {
      const items = Array.isArray(d) ? d : []
      const peak = items.reduce((max: any, r: any) => Number(r.revenue) > Number(max.revenue) ? r : max, items[0] || { hour: 0, revenue: 0 })
      return [
        { label: 'Total Revenue', value: fmtCurrency(items.reduce((s: number, r: any) => s + Number(r.revenue || 0), 0)), color: '#1976D2' },
        { label: 'Peak Hour', value: peak.hour !== undefined ? `${peak.hour}:00` : '-', color: '#2E7D32' },
        { label: 'Peak Revenue', value: fmtCurrency(peak.revenue || 0), color: '#E65100' },
        { label: 'Total Txns', value: fmtNumber(items.reduce((s: number, r: any) => s + Number(r.transactions || 0), 0)), color: '#7B1FA2' },
      ]
    }
    case 'time-of-day': {
      const ranges = d.ranges || []
      const busiest = ranges.reduce((max: any, r: any) => Number(r.revenue) > Number(max.revenue) ? r : max, ranges[0] || { label: '-', revenue: 0 })
      return [
        { label: 'Total Revenue', value: fmtCurrency(d.kpis?.total_revenue || 0), color: '#1976D2' },
        { label: 'Total Txns', value: fmtNumber(d.kpis?.total_transactions || 0), color: '#2E7D32' },
        { label: 'Busiest Period', value: busiest.label || '-', color: '#FF9800' },
        { label: 'Busiest Revenue', value: fmtCurrency(busiest.revenue || 0), color: '#7B1FA2' },
      ]
    }
    case 'revenue-trend': {
      const trend = d.trend || []
      const bestDay = trend.reduce((max: any, r: any) => Number(r.revenue) > Number(max.revenue) ? r : max, trend[0] || { date: '-', revenue: 0 })
      return [
        { label: 'Total Revenue', value: fmtCurrency(d.kpis?.total_revenue || 0), color: '#1976D2' },
        { label: 'Total Cost', value: fmtCurrency(d.kpis?.total_cost || 0), color: '#F44336' },
        { label: 'Total Profit', value: fmtCurrency(d.kpis?.total_profit || 0), color: '#2E7D32' },
        { label: 'Best Day', value: bestDay.date || '-', color: '#FF9800' },
      ]
    }
    case 'weekday-sales': {
      const items = Array.isArray(d) ? d : []
      const best = items.reduce((max: any, r: any) => Number(r.revenue) > Number(max.revenue) ? r : max, items[0] || { name: '-', revenue: 0 })
      return [
        { label: 'Total Revenue', value: fmtCurrency(items.reduce((s: number, r: any) => s + Number(r.revenue || 0), 0)), color: '#1976D2' },
        { label: 'Best Day', value: best.name || '-', color: '#2E7D32' },
        { label: 'Best Day Rev', value: fmtCurrency(best.revenue || 0), color: '#E65100' },
        { label: 'Total Txns', value: fmtNumber(items.reduce((s: number, r: any) => s + Number(r.transactions || 0), 0)), color: '#7B1FA2' },
      ]
    }
    case 'sales-growth':
      return [
        { label: 'Current Revenue', value: fmtCurrency(d.current_revenue), color: '#1976D2' },
        { label: 'Previous Revenue', value: fmtCurrency(d.previous_revenue), color: '#607D8B' },
        { label: 'Growth', value: `${Number(d.growth_pct >= 0 ? d.growth_pct : -d.growth_pct).toFixed(1)}%`, color: Number(d.growth_pct) >= 0 ? '#2E7D32' : '#F44336' },
      ]
    case 'product-analytics':
      return [
        { label: 'Total Products', value: fmtNumber(d.kpis?.total_products || 0), color: '#1976D2' },
        { label: 'Products Sold', value: fmtNumber(d.kpis?.products_sold || 0), color: '#2E7D32' },
        { label: 'Never Sold', value: fmtNumber(d.kpis?.products_never_sold || 0), color: '#F44336' },
        { label: 'Total Revenue', value: fmtCurrency(d.kpis?.total_revenue || 0), color: '#FF9800' },
        { label: 'Stock Value', value: fmtCurrency(d.kpis?.stock_value || 0), color: '#7B1FA2' },
      ]
    case 'category-analytics':
      return [
        { label: 'Total Revenue', value: fmtCurrency(d.kpis?.total_revenue || 0), color: '#1976D2' },
        { label: 'Categories', value: fmtNumber(d.kpis?.total_categories || 0), color: '#2E7D32' },
        { label: 'Top Category', value: d.kpis?.top_category || '-', color: '#FF9800' },
        { label: 'Top Revenue', value: fmtCurrency(d.kpis?.top_category_revenue || 0), color: '#7B1FA2' },
      ]
    case 'peak-hours-heatmap': {
      const grid = d.grid || []
      let peakHour = 0, peakDay = 0, peakVal = 0, totalRev = 0
      for (let h = 0; h < grid.length; h++) {
        for (let wd = 0; wd < (grid[h]?.length || 0); wd++) {
          const v = Number(grid[h][wd]) || 0
          totalRev += v
          if (v > peakVal) { peakVal = v; peakHour = h; peakDay = wd }
        }
      }
      const dayNames = d.weekdays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      return [
        { label: 'Total Revenue', value: fmtCurrency(totalRev), color: '#1976D2' },
        { label: 'Peak Hour', value: `${peakHour}:00`, color: '#2E7D32' },
        { label: 'Peak Day', value: dayNames[peakDay] || '-', color: '#FF9800' },
        { label: 'Peak Revenue', value: fmtCurrency(peakVal), color: '#7B1FA2' },
      ]
    }
    case 'stock-movement': {
      const items = Array.isArray(d) ? d : []
      return [
        { label: 'Total Movements', value: fmtNumber(items.reduce((s: number, r: any) => s + Number(r.movement_count || 0), 0)), color: '#1976D2' },
        { label: 'Items Moved', value: fmtNumber(items.length), color: '#2E7D32' },
      ]
    }
    case 'low-stock': {
      const items = Array.isArray(d) ? d : []
      const totalShortage = items.reduce((s: number, r: any) => s + Number(r.shortage || 0), 0)
      return [
        { label: 'Low Stock Items', value: fmtNumber(items.length), color: '#F44336' },
        { label: 'Total Shortage', value: fmtNumber(totalShortage), color: '#FF9800' },
      ]
    }
    case 'profit-margin': {
      const items = Array.isArray(d) ? d : []
      const totalRev = items.reduce((s: number, r: any) => s + Number(r.revenue || 0), 0)
      const totalProfit = items.reduce((s: number, r: any) => s + Number(r.profit || 0), 0)
      const avgMargin = items.length ? items.reduce((s: number, r: any) => s + Number(r.margin || 0), 0) / items.length : 0
      return [
        { label: 'Total Revenue', value: fmtCurrency(totalRev), color: '#1976D2' },
        { label: 'Total Profit', value: fmtCurrency(totalProfit), color: '#2E7D32' },
        { label: 'Avg Margin', value: `${avgMargin.toFixed(1)}%`, color: '#FF9800' },
        { label: 'Products', value: fmtNumber(items.length), color: '#7B1FA2' },
      ]
    }
    default:
      return []
  }
}

// ── Chart data extraction helper (reusable for general report) ──
function getChartData(reportId: string, d: any): ReportChartData | undefined {
  if (!d) return undefined

  switch (reportId) {
    case 'daily-revenue': {
      const rows = Array.isArray(d) ? d : []
      if (!rows.length) return undefined
      return {
        type: 'bar',
        title: 'Revenue Trend',
        labels: rows.map((r: any) => fmtDate(r.date)),
        datasets: [
          { label: 'Revenue', data: rows.map((r: any) => Number(r.revenue) || 0), color: [25, 118, 210] },
          { label: 'Cost', data: rows.map((r: any) => Number(r.cost) || 0), color: [198, 40, 40] },
          { label: 'Profit', data: rows.map((r: any) => Number(r.profit) || 0), color: [46, 125, 50] },
        ],
      }
    }
    case 'payment-methods': {
      const rows = Array.isArray(d) ? d : []
      if (!rows.length) return undefined
      return {
        type: 'donut',
        title: 'Payment Method Distribution',
        segments: rows.map((r: any, i: number) => ({
          label: r.method || 'Unknown',
          value: Number(r.total) || 0,
          color: colorAt(i),
        })),
      }
    }
    case 'sales-by-product': {
      const rows = (Array.isArray(d) ? d : []).slice(0, 10)
      if (!rows.length) return undefined
      return {
        type: 'hbar',
        title: 'Top 10 Products by Revenue',
        hbarItems: rows.map((r: any, i: number) => ({
          label: r.product || '',
          value: Number(r.revenue) || 0,
          color: colorAt(i),
        })),
      }
    }
    case 'sales-by-category': {
      const rows = Array.isArray(d) ? d : []
      if (!rows.length) return undefined
      return {
        type: 'donut',
        title: 'Revenue by Category',
        segments: rows.map((r: any, i: number) => ({
          label: r.category || 'Uncategorized',
          value: Number(r.revenue) || 0,
          color: colorAt(i),
        })),
      }
    }
    case 'sales-by-branch': {
      const rows = (Array.isArray(d) ? d : []).slice(0, 10)
      if (!rows.length) return undefined
      return {
        type: 'hbar',
        title: 'Sales by Branch',
        hbarItems: rows.map((r: any, i: number) => ({
          label: r.branch || '',
          value: Number(r.total_sales) || 0,
          color: colorAt(i),
        })),
      }
    }
    case 'sales-by-cashier': {
      const rows = (Array.isArray(d) ? d : []).slice(0, 10)
      if (!rows.length) return undefined
      return {
        type: 'hbar',
        title: 'Sales by Cashier',
        hbarItems: rows.map((r: any, i: number) => ({
          label: r.cashier || '',
          value: Number(r.total_sales) || 0,
          color: colorAt(i),
        })),
      }
    }
    case 'top-customers': {
      const rows = (Array.isArray(d) ? d : []).slice(0, 10)
      if (!rows.length) return undefined
      return {
        type: 'hbar',
        title: 'Top 10 Customers',
        hbarItems: rows.map((r: any, i: number) => ({
          label: r.customer || 'Walk-in',
          value: Number(r.total_spent) || 0,
          color: colorAt(i),
        })),
      }
    }
    case 'hourly-sales': {
      const rows = Array.isArray(d) ? d : []
      if (!rows.length) return undefined
      return {
        type: 'bar',
        title: 'Hourly Sales Distribution',
        labels: rows.map((r: any) => `${r.hour}:00`),
        datasets: [
          { label: 'Revenue', data: rows.map((r: any) => Number(r.revenue) || 0), color: [25, 118, 210] },
        ],
      }
    }
    case 'time-of-day': {
      const rows = d.ranges || []
      if (!rows.length) return undefined
      return {
        type: 'bar',
        title: 'Revenue and Transactions by Time of Day',
        labels: rows.map((r: any) => r.label || ''),
        datasets: [
          { label: 'Revenue', data: rows.map((r: any) => Number(r.revenue) || 0), color: [25, 118, 210] },
          { label: 'Transactions', data: rows.map((r: any) => Number(r.transactions) || 0), color: [255, 167, 38] },
        ],
      }
    }
    case 'revenue-trend': {
      const rows = d.trend || []
      if (!rows.length) return undefined
      return {
        type: 'bar',
        title: 'Daily Revenue vs Cost',
        labels: rows.map((r: any) => r.date || ''),
        datasets: [
          { label: 'Revenue', data: rows.map((r: any) => Number(r.revenue) || 0), color: [25, 118, 210] },
          { label: 'Cost', data: rows.map((r: any) => Number(r.cost) || 0), color: [244, 67, 54] },
        ],
      }
    }
    case 'weekday-sales': {
      const rows = Array.isArray(d) ? d : []
      if (!rows.length) return undefined
      return {
        type: 'bar',
        title: 'Revenue by Weekday',
        labels: rows.map((r: any) => r.name || ''),
        datasets: [
          { label: 'Revenue', data: rows.map((r: any) => Number(r.revenue) || 0), color: [25, 118, 210] },
          { label: 'Avg Revenue', data: rows.map((r: any) => Number(r.avg_revenue) || 0), color: [255, 152, 0] },
        ],
      }
    }
    case 'profit-margin': {
      const rows = (Array.isArray(d) ? d : []).slice(0, 10)
      if (!rows.length) return undefined
      return {
        type: 'hbar',
        title: 'Top 10 Products by Margin',
        hbarItems: rows.map((r: any, i: number) => ({
          label: r.product || '',
          value: Number(r.margin) || 0,
          color: colorAt(i),
        })).sort((a, b) => b.value - a.value),
      }
    }
    case 'category-analytics': {
      const rows = (d.categories || []).slice(0, 10)
      if (!rows.length) return undefined
      return {
        type: 'hbar',
        title: 'Top Categories by Revenue',
        hbarItems: rows.map((r: any, i: number) => ({
          label: r.category || '',
          value: Number(r.revenue) || 0,
          color: colorAt(i),
        })),
      }
    }
    case 'product-analytics': {
      const rows = (d.abc_analysis || d.top_products || []).slice(0, 10)
      if (!rows.length) return undefined
      return {
        type: 'hbar',
        title: 'Top 10 Products by Revenue',
        hbarItems: rows.map((r: any, i: number) => ({
          label: r.product || '',
          value: Number(r.revenue) || 0,
          color: colorAt(i),
        })),
      }
    }
    default:
      return undefined
  }
}

const reportChartData = computed<ReportChartData | undefined>(() => {
  if (!reportData.value) return undefined
  return getChartData(activeReport.value, reportData.value)
})

// ── Secondary charts (for multi-chart reports) ──────────────────
function getSecondaryCharts(reportId: string, d: any): ReportChartData[] {
  if (!d) return []
  const charts: ReportChartData[] = []

  switch (reportId) {
    case 'product-analytics': {
      const abcRows = d.abc_analysis || []
      const abcCounts: Record<string, number> = { A: 0, B: 0, C: 0 }
      for (const r of abcRows) {
        if (r.abc_class) abcCounts[r.abc_class] = (abcCounts[r.abc_class] || 0) + 1
      }
      if (abcCounts.A || abcCounts.B || abcCounts.C) {
        charts.push({
          type: 'donut',
          title: 'ABC Classification',
          segments: [
            { label: `Class A (${abcCounts.A})`, value: abcCounts.A, color: '#2E7D32' },
            { label: `Class B (${abcCounts.B})`, value: abcCounts.B, color: '#FF9800' },
            { label: `Class C (${abcCounts.C})`, value: abcCounts.C, color: '#F44336' },
          ],
        })
      }
      break
    }
    case 'category-analytics': {
      const cats = (d.categories || []).slice(0, 8)
      if (cats.length) {
        charts.push({
          type: 'donut',
          title: 'Revenue Share by Category',
          segments: cats.map((r: any, i: number) => ({
            label: r.category || '',
            value: Number(r.revenue) || 0,
            color: colorAt(i),
          })),
        })
      }
      break
    }
  }
  return charts
}

const reportCharts = computed<ReportChartData[]>(() => {
  if (!reportData.value) return []
  return getSecondaryCharts(activeReport.value, reportData.value)
})

// ── Table items (normalize each report's data shape) ──────────
function normalizeItems(reportId: string, d: any): Record<string, any>[] {
  if (!d) return []
  switch (reportId) {
    case 'product-analytics':
      return d.abc_analysis || d.top_products || []
    case 'category-analytics':
      return d.categories || []
    case 'time-of-day':
      return d.ranges || []
    case 'revenue-trend':
      return d.trend || []
    case 'peak-hours-heatmap':
      return []
    case 'sales-growth':
      return []
    default:
      return Array.isArray(d) ? d : [d]
  }
}

const tableItems = computed(() => normalizeItems(activeReport.value, reportData.value))

// ── UI state flags ─────────────────────────────────────────────
const showTable = computed(() => {
  if (activeReport.value === 'peak-hours-heatmap' || activeReport.value === 'sales-growth') return false
  return reportData.value && (!Array.isArray(tableItems.value) || tableItems.value.length > 0)
})

const showHeatmap = computed(() => activeReport.value === 'peak-hours-heatmap' && reportData.value?.grid)
const showGrowthCard = computed(() => activeReport.value === 'sales-growth' && reportData.value)

// ── Date range computation ──────────────────────────────────────
function dateRange(): { date_from: string; date_to: string } {
  const today = new Date()
  const fmt = (d: Date) => d.toISOString().split('T')[0]

  switch (preset.value) {
    case 'today':
      return { date_from: fmt(today), date_to: fmt(today) }
    case 'yesterday': {
      const y = new Date(today); y.setDate(y.getDate() - 1)
      return { date_from: fmt(y), date_to: fmt(y) }
    }
    case '7': {
      const start = new Date(today); start.setDate(start.getDate() - 6)
      return { date_from: fmt(start), date_to: fmt(today) }
    }
    case '30': {
      const start = new Date(today); start.setDate(start.getDate() - 29)
      return { date_from: fmt(start), date_to: fmt(today) }
    }
    case 'month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      return { date_from: fmt(start), date_to: fmt(today) }
    }
    case 'lastmonth': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const end = new Date(today.getFullYear(), today.getMonth(), 0)
      return { date_from: fmt(start), date_to: fmt(end) }
    }
    case 'year': {
      const start = new Date(today.getFullYear(), 0, 1)
      return { date_from: fmt(start), date_to: fmt(today) }
    }
    case 'custom':
      return { date_from: customFrom.value, date_to: customTo.value }
    default:
      return { date_from: '', date_to: '' }
  }
}

function onPresetChange() {
  if (preset.value === 'custom') return
  loadActive()
}

// ── CSS chart helpers (for daily-revenue inline bars) ──────────
const maxRevenue = computed(() => {
  if (!Array.isArray(reportData.value)) return 0
  const max = reportData.value.reduce((m: number, d: any) => Math.max(m, Math.max(
    Number(d.revenue) || 0, Number(d.cost) || 0, Number(d.profit) || 0,
  )), 0)
  return max || 1
})

function barHeight(val: string | number, max: number) {
  const v = Number(String(val)) || 0
  const pct = max > 0 ? Math.max(2, (v / max) * 100) : 0
  return `${pct}%`
}

function fmtDateShort(d: string) {
  if (!d) return ''
  const dt = new Date(d)
  return dt.toLocaleDateString('en', { day: '2-digit', month: 'short' })
}

// ── Export menu ────────────────────────────────────────────────
const exportMenu = ref(false)

async function doExport(format: 'csv' | 'excel' | 'pdf') {
  exportMenu.value = false
  const { date_from, date_to } = dateRange()
  const reportLabel = reports.find(r => r.id === activeReport.value)?.label || 'Report'
  await exportReport(format, {
    reportId: activeReport.value,
    reportLabel,
    items: tableItems.value,
    columns: reportColumns.value,
    kpis: reportKpis.value.length ? reportKpis.value : undefined,
    chartData: reportChartData.value,
    charts: reportCharts.value.length ? reportCharts.value : undefined,
    dateFrom: date_from,
    dateTo: date_to,
  })
}

// ── General Report dialog ───────────────────────────────────────
const generalDialog = ref(false)
const generalReportIds = ref<string[]>(reports.map(r => r.id)) // all checked by default
const generalLoading = ref(false)
const generalError = ref<string | null>(null)

// Reports that have visual charts (excluded from the chart toggle list)
const reportsWithCharts = computed(() => {
  return reports.filter(r => r.id !== 'sales-summary' && r.id !== 'peak-hours-heatmap' && r.id !== 'sales-growth' && r.id !== 'time-of-day' && r.id !== 'revenue-trend')
})

// Reports that have data tables with displayable rows
const reportsWithTables = computed(() => {
  return reports.filter(r => r.id !== 'peak-hours-heatmap' && r.id !== 'sales-growth' && r.id !== 'sales-summary' && r.id !== 'tax-collected' && r.id !== 'time-of-day' && r.id !== 'revenue-trend')
})

// Toggle helpers
function selectAllReports() {
  generalReportIds.value = reports.map(r => r.id)
}
function deselectAllReports() {
  generalReportIds.value = []
}
function toggleReport(id: string) {
  const idx = generalReportIds.value.indexOf(id)
  if (idx >= 0) generalReportIds.value.splice(idx, 1)
  else generalReportIds.value.push(id)
}
function isReportSelected(id: string): boolean {
  return generalReportIds.value.includes(id)
}

async function generateGeneralReport() {
  if (!generalReportIds.value.length) {
    generalError.value = 'Select at least one report section.'
    return
  }
  generalError.value = null
  generalLoading.value = true

  const { date_from, date_to } = dateRange()
  const params: Record<string, any> = {}
  if (date_from) params.date_from = date_from
  if (date_to) params.date_to = date_to
  if (branchFilter.value) params.branch = branchFilter.value
  const query = new URLSearchParams(params).toString()

  const sections: GeneralReportSection[] = []

  for (const rptId of generalReportIds.value) {
    try {
      const url = `/reports/${rptId}/${query ? `?${query}` : ''}`
      const data = await api(url)
      const label = reports.find(r => r.id === rptId)?.label || rptId

      const items = normalizeItems(rptId, data)
      const columns = getColumns(rptId)
      const kpis = getKpis(rptId, data)
      const chartData = getChartData(rptId, data)
      const charts = getSecondaryCharts(rptId, data)

      sections.push({
        reportId: rptId,
        reportLabel: label,
        items,
        columns,
        kpis: kpis.length ? kpis : undefined,
        chartData,
        charts: charts.length ? charts : undefined,
      })
    } catch (e: any) {
      console.warn(`Failed to load ${rptId} for general report:`, e)
    }
  }

  generalLoading.value = false

  if (!sections.length) {
    generalError.value = 'No data could be loaded for the selected reports.'
    return
  }

  generalDialog.value = false
  await exportGeneralReport(sections, { dateFrom: date_from, dateTo: date_to })
}

// ── API calls ────────────────────────────────────────────────────
async function loadBranches() {
  try {
    const data = await api('/branches/')
    branchOptions.value = data.results || data || []
  } catch {
    branchOptions.value = []
  }
}

async function loadActive() {
  loading.value = true
  error.value = null
  reportData.value = null
  try {
    const { date_from, date_to } = dateRange()
    const params: Record<string, any> = {}
    if (date_from) params.date_from = date_from
    if (date_to) params.date_to = date_to
    if (branchFilter.value) params.branch = branchFilter.value

    const query = new URLSearchParams(params).toString()
    const url = `/reports/${activeReport.value}/${query ? `?${query}` : ''}`
    reportData.value = await api(url)
  } catch (e: any) {
    error.value = e?.data?.detail || e.message || 'Failed to load report.'
  } finally {
    loading.value = false
  }
}

// ── Init ─────────────────────────────────────────────────────────
onMounted(async () => {
  if (!auth.tenant?.contact_email) {
    auth.fetchTenantSettings().catch(() => {})
  }
  await loadBranches()
  await loadActive()
})
</script>

<template>
  <v-container fluid class="pa-4 pa-md-6" style="max-width: 1600px;">
    <!-- Header -->
    <div class="d-flex align-center mb-4 flex-wrap ga-2">
      <v-icon class="mr-1" color="primary">mdi-chart-box-outline</v-icon>
      <h1 class="text-h5 font-weight-bold">Reports</h1>
      <v-chip size="small" variant="tonal" color="primary" class="ml-1">{{ reports.find(r => r.id === activeReport)?.label }}</v-chip>
      <v-spacer />

      <!-- General Report button -->
      <v-btn
        variant="tonal"
        color="primary"
        prepend-icon="mdi-file-document-multiple-outline"
        @click="generalDialog = true"
      >
        General Report
      </v-btn>

      <!-- Export dropdown -->
      <v-menu v-model="exportMenu" :close-on-content-click="false" location="bottom end">
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            variant="flat"
            color="primary"
            prepend-icon="mdi-download"
            :disabled="!reportData || exporting"
            :loading="exporting"
          >
            Export
            <v-icon end>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-card min-width="240" rounded="lg">
          <v-list density="comfortable">
            <v-list-item prepend-icon="mdi-file-pdf-box" title="PDF Report" subtitle="Designed with header and charts" @click="doExport('pdf')" />
            <v-list-item prepend-icon="mdi-file-excel" title="Excel Spreadsheet" subtitle="Styled .xlsx workbook" @click="doExport('excel')" />
            <v-list-item prepend-icon="mdi-file-delimited" title="CSV File" subtitle="Plain text data" @click="doExport('csv')" />
          </v-list>
        </v-card>
      </v-menu>

      <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="loadActive">Refresh</v-btn>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = null">{{ error }}</v-alert>

    <!-- Filters bar -->
    <v-card rounded="lg" class="pa-3 mb-4">
      <div class="d-flex flex-wrap align-center ga-3">
        <v-icon class="mr-1">mdi-filter-variant</v-icon>
        <span class="text-subtitle-2">Filters:</span>

        <!-- Date range presets -->
        <v-chip-group v-model="preset" selected-class="text-primary" @update:model-value="onPresetChange">
          <v-chip v-for="p in presets" :key="p.value" :value="p.value" size="small" variant="tonal">
            {{ p.label }}
          </v-chip>
        </v-chip-group>

        <!-- Custom date range -->
        <template v-if="preset === 'custom'">
          <v-text-field
            v-model="customFrom"
            label="From"
            type="date"
            density="compact"
            variant="outlined"
            hide-details
            style="max-width: 170px;"
            class="mr-2"
            @update:model-value="loadActive"
          />
          <v-text-field
            v-model="customTo"
            label="To"
            type="date"
            density="compact"
            variant="outlined"
            hide-details
            style="max-width: 170px;"
            class="mr-2"
            @update:model-value="loadActive"
          />
        </template>

        <v-spacer />

        <!-- Branch filter -->
        <v-select
          v-model="branchFilter"
          :items="branchOptions"
          item-title="name"
          item-value="id"
          label="Branch"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          style="max-width: 200px;"
          @update:model-value="loadActive"
        />
      </div>
    </v-card>

    <!-- Report type tabs — grouped -->
    <v-card rounded="lg" class="mb-4 overflow-hidden">
      <v-tabs v-model="activeReport" show-arrows @update:model-value="loadActive">
        <template v-for="grp in groupedTabs" :key="grp.group">
          <v-tab v-for="r in grp.tabs" :key="r.id" :value="r.id" :prepend-icon="r.icon" :slim="false">
            {{ r.short }}
          </v-tab>
        </template>
      </v-tabs>
    </v-card>

    <!-- Loading -->
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <!-- KPI summary cards -->
    <div v-if="reportKpis.length && reportData" class="mb-4">
      <v-row density="comfortable">
        <v-col v-for="(kpi, i) in reportKpis" :key="i" cols="12" sm="6" md="3" lg="2">
          <v-card rounded="lg" class="pa-4 h-100 kpi-card">
            <div class="d-flex align-center justify-space-between mb-1">
              <div class="text-caption text-medium-emphasis">{{ kpi.label }}</div>
              <div class="kpi-card__dot" :style="{ background: kpi.color || '#1976D2' }" />
            </div>
            <div class="text-h5 font-weight-bold" :style="{ color: kpi.color }">{{ kpi.value }}</div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- ── Growth card (sales-growth) ── -->
    <v-card v-if="showGrowthCard" rounded="lg" class="mb-4 pa-6">
      <div class="d-flex align-center justify-space-between flex-wrap ga-4">
        <div>
          <div class="text-caption text-medium-emphasis mb-1">Sales Growth</div>
          <div class="d-flex align-baseline ga-3">
            <span class="text-h3 font-weight-black" :style="{ color: Number(reportData.growth_pct) >= 0 ? '#2E7D32' : '#F44336' }">
              {{ Number(reportData.growth_pct) >= 0 ? '+' : '' }}{{ Number(reportData.growth_pct).toFixed(1) }}%
            </span>
            <v-icon :color="Number(reportData.growth_pct) >= 0 ? 'success' : 'error'" size="32">
              {{ Number(reportData.growth_pct) >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
            </v-icon>
          </div>
          <div class="text-body-2 text-medium-emphasis mt-2">
            Current: <strong>{{ fmtCurrency(reportData.current_revenue) }}</strong>
            &nbsp;•&nbsp; Previous: <strong>{{ fmtCurrency(reportData.previous_revenue) }}</strong>
          </div>
        </div>
        <div class="d-flex ga-4">
          <div class="text-center">
            <v-icon size="40" color="primary">mdi-chart-line</v-icon>
            <div class="text-h5 font-weight-bold mt-1">{{ fmtCurrency(reportData.current_revenue) }}</div>
            <div class="text-caption text-medium-emphasis">Current Period</div>
          </div>
          <div class="text-center">
            <v-icon size="40" color="grey-lighten-1">mdi-chart-line-variant</v-icon>
            <div class="text-h5 font-weight-bold mt-1" style="color: #607D8B;">{{ fmtCurrency(reportData.previous_revenue) }}</div>
            <div class="text-caption text-medium-emphasis">Previous Period</div>
          </div>
        </div>
      </div>
    </v-card>

    <!-- ── Heatmap (peak-hours-heatmap) ── -->
    <v-card v-if="showHeatmap" rounded="lg" class="mb-4 overflow-hidden">
      <div class="pa-4 pb-0">
        <div class="text-subtitle-2 font-weight-bold">Peak Hours Heatmap</div>
        <div class="text-caption text-medium-emphasis">Revenue distribution by hour and day of week (blue = low, indigo = high)</div>
      </div>
      <div class="pa-4">
        <ReportsChart
          type="heatmap"
          :grid="reportData.grid"
          :weekdays="reportData.weekdays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
          :format-value="(v: number) => fmtCurrency(v)"
        />
      </div>
    </v-card>

    <!-- ── Primary chart: daily-revenue CSS bar chart ── -->
    <v-card
      v-if="reportChartData && activeReport === 'daily-revenue' && reportData && Array.isArray(reportData) && reportData.length"
      rounded="lg" class="mb-4 overflow-hidden"
    >
      <div class="pa-4 pb-0">
        <div class="d-flex align-center justify-space-between flex-wrap ga-2">
          <div>
            <div class="text-subtitle-2 font-weight-bold">{{ reportChartData.title || 'Revenue Trend' }}</div>
            <div class="text-caption text-medium-emphasis">Daily revenue, cost and profit over the selected period</div>
          </div>
          <div class="d-flex align-center ga-3">
            <div class="d-flex align-center ga-1"><div class="chart-legend-dot" style="background:#1976D2;" />Revenue</div>
            <div class="d-flex align-center ga-1"><div class="chart-legend-dot" style="background:#C62828;" />Cost</div>
            <div class="d-flex align-center ga-1"><div class="chart-legend-dot" style="background:#2E7D32;" />Profit</div>
          </div>
        </div>
      </div>
      <div class="chart-bars pa-4">
        <div v-for="(d, i) in reportData" :key="i" class="chart-bar-col">
          <div class="chart-bar-stack">
            <div class="chart-bar chart-bar--revenue" :style="{ height: barHeight(d.revenue, maxRevenue) }" :title="`Revenue: ${fmtCurrency(d.revenue)}`" />
            <div class="chart-bar chart-bar--cost" :style="{ height: barHeight(d.cost, maxRevenue) }" :title="`Cost: ${fmtCurrency(d.cost)}`" />
            <div class="chart-bar chart-bar--profit" :style="{ height: barHeight(d.profit, maxRevenue) }" :title="`Profit: ${fmtCurrency(d.profit)}`" />
          </div>
          <div class="chart-bar-label">{{ fmtDateShort(d.date) }}</div>
          <div class="chart-bar-value">{{ fmtCurrency(d.revenue) }}</div>
        </div>
      </div>
    </v-card>

    <!-- ── Generic chart card (non-daily-revenue reports) ── -->
    <v-card
      v-if="reportChartData && activeReport !== 'daily-revenue' && activeReport !== 'peak-hours-heatmap'"
      rounded="lg" class="mb-4 overflow-hidden"
    >
      <div class="pa-4 pb-0">
        <div class="text-subtitle-2 font-weight-bold">{{ reportChartData.title }}</div>
        <div v-if="reportChartData.subtitle" class="text-caption text-medium-emphasis">{{ reportChartData.subtitle }}</div>
      </div>
      <div class="pa-4">
        <!-- Donut chart -->
        <ReportsChart
          v-if="reportChartData.type === 'donut' && reportChartData.segments"
          type="donut"
          :segments="reportChartData.segments"
          :format-value="(v: number) => fmtCurrency(v)"
        />
        <!-- Horizontal bar chart -->
        <ReportsChart
          v-else-if="reportChartData.type === 'hbar' && reportChartData.hbarItems"
          type="hbar"
          :items="reportChartData.hbarItems"
          :format-value="(v: number) => fmtCurrency(v)"
        />
        <!-- Bar chart -->
        <ReportsChart
          v-else-if="reportChartData.type === 'bar' && reportChartData.labels"
          type="bar"
          :labels="reportChartData.labels"
          :datasets="reportChartData.datasets || []"
          :format-value="(v: number) => fmtCurrency(v)"
          :height="240"
        />
      </div>
    </v-card>

    <!-- ── Secondary charts ── -->
    <v-card
      v-for="(ch, idx) in reportCharts"
      :key="'sec-' + idx"
      rounded="lg" class="mb-4 overflow-hidden"
    >
      <div class="pa-4 pb-0">
        <div class="text-subtitle-2 font-weight-bold">{{ ch.title }}</div>
        <div v-if="ch.subtitle" class="text-caption text-medium-emphasis">{{ ch.subtitle }}</div>
      </div>
      <div class="pa-4">
        <ReportsChart
          v-if="ch.type === 'donut' && ch.segments"
          type="donut"
          :segments="ch.segments"
          :format-value="(v: number) => fmtCurrency(v)"
        />
        <ReportsChart
          v-else-if="ch.type === 'hbar' && ch.hbarItems"
          type="hbar"
          :items="ch.hbarItems"
          :format-value="(v: number) => fmtCurrency(v)"
        />
      </div>
    </v-card>

    <!-- ── Report data table ── -->
    <v-card v-if="showTable" rounded="lg">
      <v-data-table
        :items="tableItems"
        :headers="reportColumns.map(c => ({ title: c.label, key: c.key, sortable: true }))"
        density="comfortable"
        hover
        :items-per-page="15"
        class="elevation-1"
      >
        <template v-for="c in reportColumns.filter(c => c.format === 'currency')" #[`item.${c.key}`]="{ item }">
          {{ fmtCurrency(item[c.key]) }}
        </template>
        <template v-for="c in reportColumns.filter(c => c.format === 'percent')" #[`item.${c.key}`]="{ item }">
          {{ fmtPct(item[c.key]) }}
        </template>
        <template v-for="c in reportColumns.filter(c => c.format === 'number')" #[`item.${c.key}`]="{ item }">
          {{ fmtNumber(item[c.key]) }}
        </template>
        <template v-for="c in reportColumns.filter(c => c.format === 'date')" #[`item.${c.key}`]="{ item }">
          {{ fmtDate(item[c.key]) }}
        </template>
      </v-data-table>
    </v-card>

    <!-- Empty state -->
    <v-card
      v-if="reportData && Array.isArray(tableItems) && tableItems.length === 0 && !loading && !showHeatmap && !showGrowthCard"
      rounded="lg" class="text-center py-12"
    >
      <v-icon size="56" color="medium-emphasis" class="mb-3">mdi-file-document-outline</v-icon>
      <div class="text-h6 font-weight-bold mb-1">No data for this report</div>
      <div class="text-body-2 text-medium-emphasis">Try adjusting the date range or branch filter.</div>
    </v-card>

    <!-- ── General Report Dialog ── -->
    <v-dialog v-model="generalDialog" max-width="680" scrollable>
      <v-card rounded="lg">
        <v-toolbar flat color="primary" density="comfortable">
          <v-icon start>mdi-file-document-multiple-outline</v-icon>
          <v-toolbar-title>Generate General Report</v-toolbar-title>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="generalDialog = false" />
        </v-toolbar>

        <v-card-text class="pt-4">
          <v-alert v-if="generalError" type="error" variant="tonal" class="mb-4" closable @click:close="generalError = null">
            {{ generalError }}
          </v-alert>

          <div class="text-body-2 text-medium-emphasis mb-3">
            Select which report sections to include in your general PDF. The report will use the current date range and branch filter.
          </div>

          <!-- Select All / Deselect All -->
          <div class="d-flex align-center mb-3 ga-2">
            <v-chip size="small" variant="tonal" color="primary" prepend-icon="mdi-check-all" @click="selectAllReports">
              Select All
            </v-chip>
            <v-chip size="small" variant="tonal" prepend-icon="mdi-close" @click="deselectAllReports">
              Clear
            </v-chip>
            <v-spacer />
            <span class="text-caption text-medium-emphasis">
              {{ generalReportIds.length }} of {{ reports.length }} selected
            </span>
          </div>

          <!-- Report checkboxes grouped -->
          <div
            v-for="grp in groupedTabs"
            :key="grp.group"
            class="mb-3"
          >
            <div class="text-subtitle-2 font-weight-bold mb-1">{{ grp.group }}</div>
            <v-row density="compact">
              <v-col
                v-for="rpt in grp.tabs"
                :key="rpt.id"
                cols="12"
                sm="6"
                md="4"
              >
                <v-checkbox
                  :model-value="isReportSelected(rpt.id)"
                  :label="rpt.label"
                  density="compact"
                  hide-details
                  color="primary"
                  @update:model-value="toggleReport(rpt.id)"
                />
              </v-col>
            </v-row>
          </div>
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="generalDialog = false">Cancel</v-btn>
          <v-btn
            variant="flat"
            color="primary"
            prepend-icon="mdi-file-pdf-box"
            :loading="generalLoading || exportingGeneral"
            :disabled="!generalReportIds.length"
            @click="generateGeneralReport"
          >
            Generate PDF
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
/* ── KPI cards ─────────────────────────────────────────────── */
.kpi-card {
  transition: transform 0.2s;
}
.kpi-card:hover { transform: translateY(-2px); }
.kpi-card__dot {
  width: 8px; height: 8px; border-radius: 50%;
}

/* ── CSS bar chart (daily-revenue) ──────────────────────── */
.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 240px;
  overflow-x: auto;
  overflow-y: hidden;
}
.chart-bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 48px;
  flex: 1;
  height: 100%;
}
.chart-bar-stack {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column-reverse;
  justify-content: flex-start;
  align-items: center;
  gap: 1px;
}
.chart-bar {
  width: 70%;
  max-width: 30px;
  border-radius: 3px 3px 0 0;
  min-height: 2px;
  transition: height 0.3s ease;
}
.chart-bar--revenue { background: rgb(var(--v-theme-primary)); opacity: 0.8; }
.chart-bar--cost { background: rgb(var(--v-theme-error)); opacity: 0.7; }
.chart-bar--profit { background: rgb(var(--v-theme-success)); opacity: 0.8; }
.chart-bar-label {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-top: 4px;
  white-space: nowrap;
}
.chart-bar-value {
  font-size: 10px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.8);
  white-space: nowrap;
}

/* ── Chart legend ─────────────────────────────────────────── */
.chart-legend-dot {
  width: 10px; height: 10px; border-radius: 50%;
}
</style>

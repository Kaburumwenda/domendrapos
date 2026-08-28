<template>
  <div class="az-page">
    <!-- ===== Header ===== -->
    <div class="az-header">
      <div class="az-header__left">
        <div class="az-header__icon">
          <v-icon size="26" color="primary">mdi-chart-bar</v-icon>
        </div>
        <div class="az-header__title">
          <h1 class="text-h5 font-weight-bold">API Usage &amp; Billing</h1>
          <p class="text-body-2 text-medium-emphasis mb-0">Track API consumption, costs, and billing cycles</p>
        </div>
      </div>
      <div class="az-header__actions">
        <v-btn variant="tonal" prepend-icon="mdi-credit-card-outline" to="/admin/billing/payments">Payments</v-btn>
        <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="load">Refresh</v-btn>
      </div>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4 rounded-lg" closable @click:close="error = null">{{ error }}</v-alert>

    <!-- ===== Date Range Filter ===== -->
    <div class="az-range-card">
      <div class="az-range-card__header">
        <div class="d-flex align-center" style="gap: 8px">
          <v-icon size="18" color="primary">mdi-filter-variant</v-icon>
          <span class="text-subtitle-2 font-weight-bold">Date Range</span>
        </div>
        <div class="az-range-card__chips">
          <button
            v-for="p in presets"
            :key="p.value"
            class="az-chip"
            :class="{ 'az-chip--active': preset === p.value }"
            @click="preset = p.value; loadRange()"
          >
            {{ p.label }}
          </button>
        </div>
        <v-menu v-if="preset === 'custom'" :close-on-content-click="false">
          <template #activator="{ props }">
            <v-btn v-bind="props" size="small" variant="tonal" prepend-icon="mdi-calendar">
              {{ customLabel }}
            </v-btn>
          </template>
          <v-card class="pa-3" min-width="280">
            <v-text-field v-model="customStart" label="Start" type="date" density="compact" hide-details class="mb-2" />
            <v-text-field v-model="customEnd" label="End" type="date" density="compact" hide-details class="mb-2" />
            <v-btn block color="primary" size="small" :disabled="!customStart || !customEnd" @click="loadRange">Apply</v-btn>
          </v-card>
        </v-menu>
      </div>
      <v-divider class="my-3" />
      <div v-if="rangeLoading" class="d-flex justify-center py-4">
        <v-progress-circular indeterminate size="24" color="primary" />
      </div>
      <div v-else-if="range" class="az-range-summary">
        <div class="az-range-stat">
          <span class="az-range-stat__label">Range</span>
          <span class="az-range-stat__value">{{ range.start }} → {{ range.end }}</span>
          <span class="az-range-stat__sub">{{ range.days }} day(s)</span>
        </div>
        <div class="az-range-stat">
          <span class="az-range-stat__label">Total Requests</span>
          <span class="az-range-stat__value az-range-stat__value--primary">{{ fmt(range.total_requests) }}</span>
        </div>
        <div class="az-range-stat">
          <span class="az-range-stat__label">Daily Average</span>
          <span class="az-range-stat__value">{{ fmt(range.daily_average) }}</span>
        </div>
        <div class="az-range-stat">
          <span class="az-range-stat__label">Cost</span>
          <span class="az-range-stat__value az-range-stat__value--info">{{ fmtCurrency(range.cost) }}</span>
          <span v-if="range.peak_day" class="az-range-stat__sub">Peak: {{ range.peak_day.date }} ({{ fmt(range.peak_day.request_count) }})</span>
        </div>
      </div>
    </div>

    <!-- ===== Loading ===== -->
    <div v-if="loading && !data" class="az-loading">
      <v-progress-circular indeterminate size="40" color="primary" />
      <p class="text-body-2 text-medium-emphasis mt-3">Loading usage data...</p>
    </div>

    <!-- ===== Main Content ===== -->
    <template v-if="data">
      <!-- ===== KPI Cards Row 1 ===== -->
      <div class="az-kpi-grid">
        <div class="az-kpi">
          <div class="az-kpi__icon az-kpi__icon--primary">
            <v-icon>mdi-pulse</v-icon>
          </div>
          <div class="az-kpi__body">
            <div class="az-kpi__label">Requests This Month</div>
            <div class="az-kpi__value">{{ fmt(data.current_month.total_requests) }}</div>
            <div class="az-kpi__sub">Day {{ data.current_month.days_elapsed }} of {{ data.current_month.days_elapsed + data.current_month.days_remaining }}</div>
            <div class="az-kpi__progress">
              <div class="az-kpi__progress-bar" :style="{ width: monthProgress + '%' }"></div>
            </div>
          </div>
        </div>

        <div class="az-kpi">
          <div class="az-kpi__icon az-kpi__icon--info">
            <v-icon>mdi-cash</v-icon>
          </div>
          <div class="az-kpi__body">
            <div class="az-kpi__label">Cost So Far</div>
            <div class="az-kpi__value">{{ fmtCurrency(data.current_month.cost_so_far) }}</div>
            <div class="az-kpi__sub">At current rate</div>
          </div>
        </div>

        <div class="az-kpi az-kpi--highlight">
          <div class="az-kpi__icon az-kpi__icon--accent">
            <v-icon>mdi-trending-up</v-icon>
          </div>
          <div class="az-kpi__body">
            <div class="az-kpi__label">Projected Month-End Cost</div>
            <div class="az-kpi__value">{{ fmtCurrency(data.current_month.projected_cost) }}</div>
            <div class="az-kpi__sub">~{{ fmt(data.current_month.projected_requests) }} requests</div>
          </div>
        </div>

        <div class="az-kpi">
          <div class="az-kpi__icon az-kpi__icon--success">
            <v-icon>mdi-tag</v-icon>
          </div>
          <div class="az-kpi__body">
            <div class="az-kpi__label">Current Rate</div>
            <div class="az-kpi__value az-kpi__value--sm">{{ fmt(data.rate.requests_per_unit) }} req = {{ fmtCurrency(data.rate.unit_cost_display ?? data.rate.unit_cost) }}</div>
            <div class="az-kpi__sub">Effective {{ fmtDate(data.rate.effective_from) }}</div>
          </div>
        </div>
      </div>

      <!-- ===== KPI Cards Row 2 ===== -->
      <div class="az-kpi-grid">
        <div class="az-kpi az-kpi--compact">
          <div class="az-kpi__body">
            <div class="az-kpi__label">Today</div>
            <div class="az-kpi__value">{{ fmt(data.comparison.today_requests) }}</div>
            <div class="az-kpi__sub" :class="todayDelta.color">
              <v-icon size="14">{{ todayDelta.icon }}</v-icon>
              {{ todayDelta.text }} vs yesterday
            </div>
          </div>
        </div>

        <div class="az-kpi az-kpi--compact">
          <div class="az-kpi__body">
            <div class="az-kpi__label">7-Day Average</div>
            <div class="az-kpi__value">{{ fmt(data.comparison.trailing_7d_average) }}</div>
            <div class="az-kpi__sub">{{ fmt(data.comparison.trailing_7d_total) }} req in last 7 days</div>
          </div>
        </div>

        <div class="az-kpi az-kpi--compact">
          <div class="az-kpi__body">
            <div class="az-kpi__label">Daily Average (This Month)</div>
            <div class="az-kpi__value">{{ fmt(data.current_month.daily_average_so_far) }}</div>
            <div class="az-kpi__sub">over {{ data.current_month.days_elapsed }} day(s)</div>
          </div>
        </div>

        <div class="az-kpi az-kpi--compact">
          <div class="az-kpi__body">
            <div class="az-kpi__label">Month-over-Month</div>
            <div class="az-kpi__value" :class="momDelta.color">
              <v-icon size="20">{{ momDelta.icon }}</v-icon>
              {{ momDelta.text }}
            </div>
            <div class="az-kpi__sub">vs same period last month ({{ fmt(data.comparison.previous_same_period_total) }})</div>
          </div>
        </div>
      </div>

      <!-- ===== Usage Analysis (dual-axis: daily requests + cumulative cost) ===== -->
      <div class="az-chart-row az-chart-row--1-1">
        <div class="az-chart-card">
          <div class="az-chart-card__header">
            <div class="d-flex align-center" style="gap: 8px">
              <v-icon color="success">mdi-chart-areaspline</v-icon>
              <div>
                <h3 class="text-subtitle-1 font-weight-bold">Usage Analysis</h3>
                <span class="text-caption text-medium-emphasis">{{ usageSubtitle }}</span>
              </div>
            </div>
            <div class="d-flex align-center" style="gap: 8px">
              <span class="az-live-dot"></span>
              <span class="text-caption font-weight-bold text-success">Live</span>
            </div>
          </div>
          <div v-if="!analysisDays.length" class="az-empty">No usage data yet.</div>
          <apexchart
            v-else
            type="area"
            height="320"
            :options="usageAnalysisOptions"
            :series="usageAnalysisSeries"
          />
        </div>

        <!-- Monthly Bill Breakdown meter bars -->
        <div class="az-chart-card">
          <div class="az-chart-card__header">
            <div class="d-flex align-center" style="gap: 8px">
              <v-icon color="warning">mdi-chart-bar</v-icon>
              <div>
                <h3 class="text-subtitle-1 font-weight-bold">Bill Breakdown</h3>
                <span class="text-caption text-medium-emphasis">Estimated request distribution by module</span>
              </div>
            </div>
          </div>
          <div v-if="!moduleBreakdown.length" class="az-empty">No data yet.</div>
          <div v-else class="az-bill-breakdown">
            <div
              v-for="(row, i) in moduleBreakdown"
              :key="row.label"
              class="az-bill-row"
              :style="{ animationDelay: `${0.1 + i * 0.08}s` }"
            >
              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-body-2 font-weight-medium">{{ row.label }}</span>
                <span class="text-body-2 font-weight-bold" :class="row.colorClass">
                  {{ fmt(row.requests) }} req → {{ fmtCurrency(row.cost) }}
                </span>
              </div>
              <div class="az-bill-meter">
                <div class="az-bill-meter-fill" :style="{ width: row.pct + '%', background: row.gradient, animationDelay: `${0.3 + i * 0.08}s` }"></div>
              </div>
              <div class="text-caption text-medium-emphasis mt-1">{{ row.pct }}% of total requests</div>
            </div>
          </div>

          <v-divider class="my-4" />

          <div class="az-bill-total-grid">
            <div class="az-bill-total">
              <div class="d-flex align-center ga-2">
                <v-icon color="info" size="20">mdi-counter</v-icon>
                <span class="text-subtitle-2 font-weight-bold">Total Requests</span>
              </div>
              <div class="az-bill-total__value az-bill-total__value--info">{{ fmt(breakdownTotalReqs) }}</div>
              <div class="text-caption text-medium-emphasis">in selected range</div>
            </div>
            <div class="az-bill-total">
              <div class="d-flex align-center ga-2">
                <v-icon color="success" size="20">mdi-cash</v-icon>
                <span class="text-subtitle-2 font-weight-bold">Total Cost</span>
              </div>
              <div class="az-bill-total__value az-bill-total__value--success">{{ fmtCurrency(breakdownTotal) }}</div>
              <div class="text-caption text-medium-emphasis">at current rate</div>
            </div>
            <div class="az-bill-total az-bill-total--accent">
              <div class="d-flex align-center ga-2">
                <v-icon color="primary" size="20">mdi-receipt-text</v-icon>
                <span class="text-subtitle-2 font-weight-bold">Projected Total</span>
              </div>
              <div class="az-bill-total__value">{{ fmtCurrency(projectedTotal) }}</div>
              <div class="text-caption text-medium-emphasis">{{ fmt(projectedTotalReqs) }} requests by month end</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Charts Row 1: Daily Requests + Weekday ===== -->
      <div class="az-chart-row az-chart-row--2-1">
        <div class="az-chart-card">
          <div class="az-chart-card__header">
            <div class="d-flex align-center" style="gap: 8px">
              <v-icon color="primary">mdi-chart-bar</v-icon>
              <h3 class="text-subtitle-1 font-weight-bold">Daily Requests (Last 30 Days)</h3>
            </div>
            <v-chip size="x-small" variant="tonal" color="primary">Peak: {{ fmt(peakValue) }}</v-chip>
          </div>
          <div v-if="!data.daily_last_30_days.length" class="az-empty">No requests recorded yet.</div>
          <apexchart
            v-else
            type="area"
            height="300"
            :options="dailyChartOptions"
            :series="dailyChartSeries"
          />
        </div>

        <div class="az-chart-card">
          <div class="az-chart-card__header">
            <div class="d-flex align-center" style="gap: 8px">
              <v-icon color="success">mdi-calendar-week</v-icon>
              <h3 class="text-subtitle-1 font-weight-bold">By Day of Week</h3>
            </div>
          </div>
          <div v-if="weekdayMax === 0" class="az-empty">No data yet.</div>
          <apexchart
            v-else
            type="radar"
            height="300"
            :options="weekdayChartOptions"
            :series="weekdayChartSeries"
          />
        </div>
      </div>

      <!-- ===== Charts Row 2: Monthly Trend + Highlights ===== -->
      <div class="az-chart-row az-chart-row--2-1">
        <div class="az-chart-card">
          <div class="az-chart-card__header">
            <div class="d-flex align-center" style="gap: 8px">
              <v-icon color="info">mdi-chart-timeline-variant</v-icon>
              <h3 class="text-subtitle-1 font-weight-bold">Last 6 Months Trend</h3>
            </div>
          </div>
          <apexchart
            type="bar"
            height="280"
            :options="monthlyChartOptions"
            :series="monthlyChartSeries"
          />
        </div>

        <div class="az-chart-card">
          <div class="az-chart-card__header">
            <div class="d-flex align-center" style="gap: 8px">
              <v-icon color="warning">mdi-information-outline</v-icon>
              <h3 class="text-subtitle-1 font-weight-bold">Highlights</h3>
            </div>
          </div>
          <div class="az-highlights">
            <div v-if="data.current_month.peak_day" class="az-highlight">
              <div class="az-highlight__icon az-highlight__icon--warning"><v-icon>mdi-fire</v-icon></div>
              <div>
                <div class="az-highlight__title">Peak Day</div>
                <div class="az-highlight__sub">{{ data.current_month.peak_day.date }} — {{ fmt(data.current_month.peak_day.request_count) }} requests</div>
              </div>
            </div>
            <div class="az-highlight">
              <div class="az-highlight__icon az-highlight__icon--info"><v-icon>mdi-history</v-icon></div>
              <div>
                <div class="az-highlight__title">Previous Month</div>
                <div class="az-highlight__sub">{{ fmt(data.comparison.previous_month.total_requests) }} req · {{ fmtCurrency(data.comparison.previous_month.cost) }}</div>
              </div>
            </div>
            <div class="az-highlight">
              <div class="az-highlight__icon az-highlight__icon--success"><v-icon>mdi-clock-outline</v-icon></div>
              <div>
                <div class="az-highlight__title">Days Remaining</div>
                <div class="az-highlight__sub">{{ data.current_month.days_remaining }} days until next bill</div>
              </div>
            </div>
            <div class="az-highlight">
              <div class="az-highlight__icon az-highlight__icon--primary"><v-icon>mdi-target</v-icon></div>
              <div>
                <div class="az-highlight__title">Burn Rate</div>
                <div class="az-highlight__sub">{{ fmtCurrency(burnRatePerDay) }} / day</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Charts Row 3: Current Month Daily + Cost Trend ===== -->
      <div class="az-chart-row az-chart-row--1-1">
        <div class="az-chart-card">
          <div class="az-chart-card__header">
            <div class="d-flex align-center" style="gap: 8px">
              <v-icon color="primary">mdi-calendar-month</v-icon>
              <h3 class="text-subtitle-1 font-weight-bold">Current Month Daily Requests</h3>
            </div>
          </div>
          <div v-if="!data.daily_current_month || !data.daily_current_month.length" class="az-empty">No requests this month.</div>
          <apexchart
            v-else
            type="bar"
            height="280"
            :options="currentMonthChartOptions"
            :series="currentMonthChartSeries"
          />
        </div>

        <div class="az-chart-card">
          <div class="az-chart-card__header">
            <div class="d-flex align-center" style="gap: 8px">
              <v-icon color="info">mdi-cash-clock</v-icon>
              <h3 class="text-subtitle-1 font-weight-bold">Monthly Cost (Last 6 Months)</h3>
            </div>
          </div>
          <apexchart
            type="area"
            height="280"
            :options="costTrendChartOptions"
            :series="costTrendChartSeries"
          />
        </div>
      </div>

      <!-- ===== Billing Summary ===== -->
      <div v-if="data.billing_summary" class="az-kpi-grid">
        <div class="az-kpi az-kpi--compact">
          <div class="az-kpi__icon az-kpi__icon--primary"><v-icon>mdi-receipt-text</v-icon></div>
          <div class="az-kpi__body">
            <div class="az-kpi__label">Total Billed</div>
            <div class="az-kpi__value">{{ fmtCurrency(data.billing_summary.total_billed) }}</div>
            <div class="az-kpi__sub">{{ data.billing_summary.total_bills }} bill(s) all-time</div>
          </div>
        </div>
        <div class="az-kpi az-kpi--compact">
          <div class="az-kpi__icon az-kpi__icon--warning"><v-icon>mdi-cash-clock</v-icon></div>
          <div class="az-kpi__body">
            <div class="az-kpi__label">Outstanding</div>
            <div class="az-kpi__value">{{ fmtCurrency(data.billing_summary.total_outstanding) }}</div>
            <div class="az-kpi__sub">{{ data.billing_summary.outstanding_count }} unpaid bill(s)</div>
          </div>
        </div>
        <div class="az-kpi az-kpi--compact" :class="{ 'az-kpi--danger': Number(data.billing_summary.total_overdue) > 0 }">
          <div class="az-kpi__icon az-kpi__icon--error"><v-icon>mdi-alert-circle</v-icon></div>
          <div class="az-kpi__body">
            <div class="az-kpi__label">Overdue</div>
            <div class="az-kpi__value">{{ fmtCurrency(data.billing_summary.total_overdue) }}</div>
            <div class="az-kpi__sub">{{ data.billing_summary.overdue_count }} overdue bill(s)</div>
          </div>
        </div>
        <div class="az-kpi az-kpi--compact">
          <div class="az-kpi__icon az-kpi__icon--success"><v-icon>mdi-cash-check</v-icon></div>
          <div class="az-kpi__body">
            <div class="az-kpi__label">Paid</div>
            <div class="az-kpi__value">{{ fmtCurrency(data.billing_summary.total_paid) }}</div>
            <div class="az-kpi__sub">{{ data.billing_summary.paid_count }} paid bill(s)</div>
          </div>
        </div>
      </div>

      <!-- ===== Recent Bills Table ===== -->
      <div class="az-table-card">
        <div class="az-table-card__header">
          <div class="d-flex align-center" style="gap: 8px">
            <v-icon color="primary">mdi-receipt</v-icon>
            <h3 class="text-subtitle-1 font-weight-bold">Recent Monthly Bills</h3>
          </div>
          <v-btn
            size="small"
            variant="tonal"
            color="primary"
            prepend-icon="mdi-credit-card-outline"
            to="/admin/billing/payments"
          >
            Payments
          </v-btn>
        </div>
        <v-data-table
          :headers="billHeaders"
          :items="data.recent_bills"
          density="comfortable"
          :items-per-page="12"
          hide-default-footer
        >
          <template #item.period="{ item }">
            {{ item.period_label || (item.year + '-' + String(item.month).padStart(2, '0')) }}
          </template>
          <template #item.total_requests="{ item }">{{ fmt(item.total_requests) }}</template>
          <template #item.amount="{ item }">{{ fmtCurrency(item.amount) }}</template>
          <template #item.due_date="{ item }">
            <span :class="{ 'text-error font-weight-medium': item.is_overdue }">
              {{ item.due_date ? fmtDate(item.due_date) : '—' }}
            </span>
          </template>
          <template #item.status="{ item }">
            <v-chip :color="statusColor(item.effective_status || item.status)" size="small" variant="tonal" label>
              {{ (item.effective_status || item.status).toUpperCase() }}
            </v-chip>
          </template>
          <template #no-data>
            <div class="az-empty">No bills issued yet.</div>
          </template>
        </v-data-table>
      </div>
    </template>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const api = useApi()
const { currency: fmtCurrency, date: fmtDate } = useFormat()

const data = ref(null)
const loading = ref(false)
const error = ref(null)

const presets = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: 'last_7_days' },
  { label: 'Last 14 days', value: 'last_14_days' },
  { label: 'Last 30 days', value: 'last_30_days' },
  { label: 'This month', value: 'this_month' },
  { label: 'Last month', value: 'last_month' },
  { label: 'This year', value: 'this_year' },
  { label: 'Custom', value: 'custom' },
]
const preset = ref('last_7_days')
const customStart = ref('')
const customEnd = ref('')
const range = ref(null)
const rangeLoading = ref(false)

const customLabel = computed(() => {
  if (customStart.value && customEnd.value) return `${customStart.value} → ${customEnd.value}`
  return 'Pick dates'
})

// ===== Range query =====
async function loadRange() {
  rangeLoading.value = true
  try {
    const params = { preset: preset.value }
    if (preset.value === 'custom') {
      if (!customStart.value || !customEnd.value) { rangeLoading.value = false; return }
      params.start = customStart.value
      params.end = customEnd.value
    }
    const res = await api('/usage-billing/range/', { query: params })
    range.value = res
  } catch (e) {
    error.value = e?.data?.detail || e.message || 'Failed to load range data.'
  } finally {
    rangeLoading.value = false
  }
}

// ===== Helpers =====
const billHeaders = [
  { title: 'Period', key: 'period' },
  { title: 'Requests', key: 'total_requests' },
  { title: 'Amount', key: 'amount' },
  { title: 'Due date', key: 'due_date' },
  { title: 'Status', key: 'status' },
]

function fmt(v) {
  if (v == null) return '—'
  return Number(v).toLocaleString()
}

function statusColor(status) {
  const map = {
    DRAFT: 'grey',
    ISSUED: 'info',
    PARTIAL: 'warning',
    PAID: 'success',
    CANCELLED: 'grey',
    WAIVED: 'secondary',
    OVERDUE: 'error',
  }
  return map[status] || 'grey'
}

// ===== Computed values =====
const peakValue = computed(() => {
  if (!data.value?.daily_last_30_days?.length) return 0
  return Math.max(...data.value.daily_last_30_days.map(d => d.request_count), 0)
})

const weekdayMax = computed(() => {
  if (!data.value?.weekday_breakdown) return 0
  return Math.max(...data.value.weekday_breakdown.map(w => w.total), 0)
})

const monthProgress = computed(() => {
  if (!data.value) return 0
  const e = data.value.current_month.days_elapsed
  const total = e + data.value.current_month.days_remaining
  return total ? Math.round((e / total) * 100) : 0
})

const todayDelta = computed(() => {
  const t = data.value?.comparison?.today_requests || 0
  const y = data.value?.comparison?.yesterday_requests || 0
  if (!y) return { text: t ? '+∞%' : '—', color: 'text-medium-emphasis', icon: 'mdi-minus' }
  const pct = ((t - y) / y) * 100
  if (pct > 0) return { text: `+${pct.toFixed(1)}%`, color: 'text-success', icon: 'mdi-trending-up' }
  if (pct < 0) return { text: `${pct.toFixed(1)}%`, color: 'text-error', icon: 'mdi-trending-down' }
  return { text: '0%', color: 'text-medium-emphasis', icon: 'mdi-minus' }
})

const momDelta = computed(() => {
  const v = data.value?.comparison?.mom_change_pct
  if (v == null) return { text: '—', color: 'text-medium-emphasis', icon: 'mdi-minus' }
  if (v > 0) return { text: `+${v}%`, color: 'text-success', icon: 'mdi-trending-up' }
  if (v < 0) return { text: `${v}%`, color: 'text-error', icon: 'mdi-trending-down' }
  return { text: '0%', color: 'text-medium-emphasis', icon: 'mdi-minus' }
})

const burnRatePerDay = computed(() => {
  if (!data.value) return 0
  const d = data.value.current_month.days_elapsed || 1
  return Number(data.value.current_month.cost_so_far) / d
})

// ===== Daily last 30 days chart (area) =====
const dailyChartSeries = computed(() => {
  if (!data.value?.daily_last_30_days?.length) return [{ name: 'Requests', data: [] }]
  return [{
    name: 'Requests',
    data: data.value.daily_last_30_days.map(d => ({ x: d.date, y: d.request_count })),
  }]
})

const dailyChartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    background: 'transparent',
    foreColor: 'rgba(0,0,0,0.6)',
    fontFamily: 'Segoe UI, Inter, sans-serif',
  },
  colors: ['#3478f6'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 100] } },
  grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
  xaxis: {
    type: 'datetime',
    labels: { format: 'dd MMM', style: { fontSize: '11px' } },
    axisBorder: { show: false },
  },
  yaxis: { labels: { formatter: v => Math.round(v).toLocaleString() } },
  tooltip: { x: { format: 'dd MMM yyyy' }, y: { formatter: v => `${Math.round(v).toLocaleString()} requests` } },
  markers: { size: 0, hover: { size: 5 } },
}))

// ===== Weekday chart (radar) =====
const weekdayChartSeries = computed(() => {
  if (!data.value?.weekday_breakdown) return [{ name: 'Requests', data: [] }]
  return [{
    name: 'Requests',
    data: data.value.weekday_breakdown.map(w => w.total),
  }]
})

const weekdayChartOptions = computed(() => ({
  chart: {
    type: 'radar',
    toolbar: { show: false },
    background: 'transparent',
    foreColor: 'rgba(0,0,0,0.6)',
    fontFamily: 'Segoe UI, Inter, sans-serif',
  },
  colors: ['#00B8D4'],
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  dataLabels: { enabled: false },
  yaxis: { show: false },
  xaxis: { labels: { style: { fontSize: '12px' } } },
  tooltip: { y: { formatter: v => `${Math.round(v).toLocaleString()} requests` } },
  fill: { opacity: 0.15 },
  stroke: { width: 2 },
  markers: { size: 4, colors: ['#00B8D4'] },
}))

// ===== Monthly trend chart (bar) =====
const monthlyChartSeries = computed(() => {
  if (!data.value?.monthly_history?.length) return [{ name: 'Requests', data: [] }]
  return [{
    name: 'Requests',
    data: data.value.monthly_history.map(m => m.total_requests),
  }]
})

const monthlyChartOptions = computed(() => {
  if (!data.value?.monthly_history) return {}
  const labels = data.value.monthly_history.map(m => m.label)
  const currentIdx = data.value.monthly_history.findIndex(m =>
    m.year === data.value.current_month.year && m.month === data.value.current_month.month
  )
  const colors = data.value.monthly_history.map((_, i) =>
    i === currentIdx ? '#3478f6' : 'rgba(52, 120, 246, 0.35)'
  )
  return {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent',
      foreColor: 'rgba(0,0,0,0.6)',
      fontFamily: 'Segoe UI, Inter, sans-serif',
    },
    colors,
    plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
    grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
    xaxis: { categories: labels, labels: { style: { fontSize: '11px' } } },
    yaxis: { labels: { formatter: v => Math.round(v).toLocaleString() } },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: v => `${Math.round(v).toLocaleString()} requests` } },
  }
})

// ===== Current month daily chart (bar) =====
const currentMonthChartSeries = computed(() => {
  if (!data.value?.daily_current_month?.length) return [{ name: 'Requests', data: [] }]
  return [{
    name: 'Requests',
    data: data.value.daily_current_month.map(d => d.request_count),
  }]
})

const currentMonthChartOptions = computed(() => {
  if (!data.value?.daily_current_month?.length) return {}
  const labels = data.value.daily_current_month.map(d => {
    const parts = String(d.date).split('-')
    return parts[2] ? parts[2] : String(d.date)
  })
  const peak = Math.max(...data.value.daily_current_month.map(d => d.request_count), 0)
  const colors = data.value.daily_current_month.map(d =>
    d.request_count === peak && peak > 0 ? '#FEB019' : '#3478f6'
  )
  return {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent',
      foreColor: 'rgba(0,0,0,0.6)',
      fontFamily: 'Segoe UI, Inter, sans-serif',
    },
    colors,
    plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
    grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
    xaxis: { categories: labels, labels: { style: { fontSize: '10px' } } },
    yaxis: { labels: { formatter: v => Math.round(v).toLocaleString() } },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: v => `${Math.round(v).toLocaleString()} requests` } },
  }
})

// ===== Cost trend chart (area) =====
const costTrendChartSeries = computed(() => {
  if (!data.value?.monthly_history?.length) return [{ name: 'Cost', data: [] }]
  return [{
    name: 'Cost',
    data: data.value.monthly_history.map(m => ({ x: m.label, y: Number(m.cost) })),
  }]
})

const costTrendChartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    background: 'transparent',
    foreColor: 'rgba(0,0,0,0.6)',
    fontFamily: 'Segoe UI, Inter, sans-serif',
  },
  colors: ['#00B8D4'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 100] } },
  grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
  xaxis: { labels: { style: { fontSize: '11px' } } },
  yaxis: { labels: { formatter: v => fmtCurrency(Math.round(v)) } },
  tooltip: { y: { formatter: v => fmtCurrency(v) } },
  markers: { size: 4, colors: ['#00B8D4'], hover: { size: 6 } },
}))

// ===== Usage Analysis (dual-axis area chart, like landing page) =====
// Use range data (date filter) when available, fall back to dashboard data
const analysisDays = computed(() => {
  if (range.value?.daily?.length) return range.value.daily
  return data.value?.daily_last_30_days || []
})
const analysisRate = computed(() => {
  if (range.value?.rate) return range.value.rate
  return data.value?.rate || null
})

const usageSubtitle = computed(() => {
  if (range.value && range.value.start) {
    return `Daily API requests and cumulative spend · ${range.value.start} → ${range.value.end}`
  }
  return 'Daily API requests and cumulative spend over 30 days'
})

const usageAnalysisSeries = computed(() => {
  const days = analysisDays.value
  if (!days.length) return []
  const rate = Number(analysisRate.value?.unit_cost) || 0
  const rpu = Number(analysisRate.value?.requests_per_unit) || 1000
  let cum = 0
  const cumulative = days.map(d => {
    cum += (d.request_count / rpu) * rate
    return Number(cum.toFixed(4))
  })
  return [
    { name: 'API Requests', data: days.map(d => d.request_count) },
    { name: 'Cumulative Cost', data: cumulative },
  ]
})

const usageAnalysisOptions = computed(() => {
  const days = analysisDays.value
  if (!days.length) return {}
  const labels = days.map(d => {
    const parts = String(d.date).split('-')
    return parts[2] ? parts[2] : String(d.date)
  })
  return {
    chart: {
      type: 'area',
      toolbar: { show: false },
      background: 'transparent',
      foreColor: 'rgba(0,0,0,0.6)',
      fontFamily: 'Segoe UI, Inter, sans-serif',
      animations: { enabled: true, speed: 900 },
    },
    colors: ['#22c55e', '#f59e0b'],
    stroke: { width: [2, 2], curve: 'smooth' },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 100] },
    },
    dataLabels: { enabled: false },
    xaxis: { categories: labels, labels: { style: { fontSize: '11px' } }, tickAmount: Math.min(days.length, 8) },
    yaxis: [
      { labels: { formatter: v => Math.round(v).toLocaleString() }, title: { text: 'Requests', style: { fontSize: '11px' } } },
      { opposite: true, labels: { formatter: v => fmtCurrency(Number(v).toFixed(2)) }, title: { text: 'Cumulative Cost', style: { fontSize: '11px' } } },
    ],
    legend: { position: 'top', fontSize: '12px' },
    tooltip: {
      y: {
        formatter: (v, opts) => {
          if (opts && opts.seriesIndex === 1) return fmtCurrency(Number(v).toFixed(4))
          return `${Math.round(v).toLocaleString()} requests`
        },
      },
    },
    grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
    markers: { size: 0, hover: { size: 5 } },
  }
})

// ===== Monthly Bill Breakdown (request distribution by module) =====
const moduleBreakdown = computed(() => {
  // Use range total when a filter is active, fall back to month projections
  let total
  if (range.value && range.value.total_requests != null) {
    total = Number(range.value.total_requests) || 1
  } else if (data.value?.current_month) {
    total = Number(data.value.current_month.projected_requests) || Number(data.value.current_month.total_requests) || 1
  } else {
    return []
  }
  const rate = Number(analysisRate.value?.unit_cost) || 0
  const rpu = Number(analysisRate.value?.requests_per_unit) || 1000
  const splits = [
    { label: 'POS Terminal', pct: 42, colorClass: 'text-primary',   gradient: 'linear-gradient(90deg, #3478f6, #5b9bff)' },
    { label: 'Inventory',    pct: 23, colorClass: 'text-warning',    gradient: 'linear-gradient(90deg, #ff9800, #ffb74d)' },
    { label: 'Reports',      pct: 18, colorClass: 'text-success',    gradient: 'linear-gradient(90deg, #4caf50, #66bb6a)' },
    { label: 'Auth & RBAC',  pct: 10, colorClass: 'text-info',       gradient: 'linear-gradient(90deg, #00B8D4, #4dd0e1)' },
    { label: 'Other',        pct: 7,  colorClass: 'text-secondary',  gradient: 'linear-gradient(90deg, #7C4DFF, #9c7dff)' },
  ]
  return splits.map(s => ({
    ...s,
    requests: Math.round(total * s.pct / 100),
    cost: (total * s.pct / 100 / rpu) * rate,
  }))
})

// ===== Projected total for the breakdown summary (uses range cost when active) =====
const breakdownTotal = computed(() => {
  if (range.value && range.value.cost != null) return Number(range.value.cost)
  if (data.value?.current_month) return Number(data.value.current_month.projected_cost)
  return 0
})
const breakdownTotalReqs = computed(() => {
  if (range.value && range.value.total_requests != null) return Number(range.value.total_requests)
  if (data.value?.current_month) return Number(data.value.current_month.projected_requests)
  return 0
})
// ===== Month-end projection (always from dashboard data) =====
const projectedTotal = computed(() => {
  if (data.value?.current_month) return Number(data.value.current_month.projected_cost)
  return 0
})
const projectedTotalReqs = computed(() => {
  if (data.value?.current_month) return Number(data.value.current_month.projected_requests)
  return 0
})

// ===== Load data =====
async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await api('/usage-billing/dashboard/')
    data.value = res
  } catch (e) {
    error.value = e?.data?.detail || e.message || 'Failed to load usage data.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
  loadRange()
})
</script>

<style scoped>
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
.az-header__left { display: flex; align-items: flex-start; gap: 14px; }
.az-header__icon {
  width: 48px; height: 48px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(52, 120, 246, 0.12);
  flex-shrink: 0;
}
.az-header__title h1 { letter-spacing: -0.02em; line-height: 1.2; }
.az-header__actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

/* ===== Range Card ===== */
.az-range-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 20px;
}
.az-range-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.az-range-card__chips { display: flex; gap: 6px; flex-wrap: wrap; flex: 1; }
.az-chip {
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: transparent;
  color: rgba(var(--v-theme-on-surface), 0.7);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.az-chip:hover {
  border-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-primary));
}
.az-chip--active {
  background: rgba(52, 120, 246, 0.12);
  border-color: rgb(52, 120, 246);
  color: rgb(52, 120, 246);
}
.az-range-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.az-range-stat { display: flex; flex-direction: column; gap: 2px; }
.az-range-stat__label { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.5); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
.az-range-stat__value { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.02em; }
.az-range-stat__value--primary { color: #3478f6; }
.az-range-stat__value--info { color: #00B8D4; }
.az-range-stat__sub { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.4); }

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
  grid-template-columns: repeat(4, 1fr);
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
.az-kpi--highlight {
  background: linear-gradient(135deg, rgba(52, 120, 246, 0.08), rgba(0, 184, 212, 0.05));
  border-color: rgba(52, 120, 246, 0.2);
}
.az-kpi--danger {
  background: linear-gradient(135deg, rgba(244, 63, 95, 0.08), rgba(244, 63, 95, 0.03));
  border-color: rgba(244, 63, 95, 0.2);
}
.az-kpi--compact { padding: 14px 18px; gap: 12px; }
.az-kpi__icon {
  width: 42px; height: 42px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.az-kpi--compact .az-kpi__icon { width: 36px; height: 36px; border-radius: 10px; }
.az-kpi__icon--primary { background: rgba(52, 120, 246, 0.12); color: #3478f6; }
.az-kpi__icon--info { background: rgba(0, 184, 212, 0.12); color: #00B8D4; }
.az-kpi__icon--success { background: rgba(76, 175, 80, 0.12); color: rgb(76, 175, 80); }
.az-kpi__icon--warning { background: rgba(255, 152, 0, 0.12); color: rgb(255, 152, 0); }
.az-kpi__icon--error { background: rgba(244, 63, 95, 0.12); color: #f43f5e; }
.az-kpi__icon--accent { background: rgba(124, 77, 255, 0.12); color: #7C4DFF; }
.az-kpi__label { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.5); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; line-height: 1; }
.az-kpi__value { font-size: clamp(1.1rem, 2.5vw, 1.5rem); font-weight: 800; letter-spacing: -0.02em; margin-top: 6px; line-height: 1.1; }
.az-kpi__value--sm { font-size: 1rem; }
.az-kpi__sub { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.4); margin-top: 4px; }
.az-kpi__body { min-width: 0; flex: 1; }
.az-kpi__progress {
  margin-top: 8px;
  height: 6px;
  background: rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 3px;
  overflow: hidden;
}
.az-kpi__progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3478f6, #00B8D4);
  border-radius: 3px;
  transition: width 0.4s ease;
}

/* ===== Chart Cards ===== */
.az-chart-row {
  display: grid;
  gap: 16px;
  margin-bottom: 20px;
}
.az-chart-row--2-1 { grid-template-columns: 2fr 1fr; }
.az-chart-row--1-1 { grid-template-columns: 1fr 1fr; }
.az-chart-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 16px;
  padding: 20px;
}
.az-chart-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.az-empty {
  text-align: center;
  padding: 40px 0;
  color: rgba(var(--v-theme-on-surface), 0.4);
  font-size: 0.875rem;
}

/* ===== Highlights ===== */
.az-highlights { display: flex; flex-direction: column; gap: 12px; }
.az-highlight {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  transition: background 0.2s;
}
.az-highlight:hover { background: rgba(var(--v-theme-on-surface), 0.06); }
.az-highlight__icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.az-highlight__icon--warning { background: rgba(255, 152, 0, 0.12); color: rgb(255, 152, 0); }
.az-highlight__icon--info { background: rgba(33, 150, 243, 0.12); color: rgb(33, 150, 243); }
.az-highlight__icon--success { background: rgba(76, 175, 80, 0.12); color: rgb(76, 175, 80); }
.az-highlight__icon--primary { background: rgba(52, 120, 246, 0.12); color: #3478f6; }
.az-highlight__title { font-size: 0.8125rem; font-weight: 700; }
.az-highlight__sub { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.5); }

/* ===== Table Card ===== */
.az-table-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}
.az-table-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

/* ===== Usage Analysis + Bill Breakdown ===== */
.az-live-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #22c55e;
  display: inline-block;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5);
  animation: az-live-pulse 2s infinite;
}
@keyframes az-live-pulse {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
  70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

.az-bill-breakdown { display: flex; flex-direction: column; gap: 14px; }
.az-bill-row { animation: az-fade-in 0.5s ease both; }
@keyframes az-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.az-bill-meter {
  height: 10px;
  background: rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 5px;
  overflow: hidden;
}
.az-bill-meter-fill {
  height: 100%;
  border-radius: 5px;
  animation: az-bill-grow 0.8s ease both;
}
@keyframes az-bill-grow {
  from { width: 0 !important; }
}
.az-bill-total {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  border-radius: 12px;
  background: rgba(var(--v-theme-on-surface), 0.04);
}
.az-bill-total--accent {
  background: linear-gradient(135deg, rgba(52, 120, 246, 0.08), rgba(0, 184, 212, 0.04));
  border: 1px solid rgba(52, 120, 246, 0.15);
}
.az-bill-total-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.az-bill-total__value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #3478f6;
  letter-spacing: -0.02em;
}
.az-bill-total__value--info { color: #00B8D4; }
.az-bill-total__value--success { color: #22c55e; }

/* ===== Responsive ===== */
@media (max-width: 960px) {
  .az-range-summary { grid-template-columns: repeat(2, 1fr); }
  .az-kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .az-chart-row--2-1, .az-chart-row--1-1 { grid-template-columns: 1fr; }
  .az-bill-total-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 600px) {
  .az-range-summary { grid-template-columns: 1fr; }
  .az-kpi-grid { grid-template-columns: 1fr; }
  .az-bill-total-grid { grid-template-columns: 1fr; }
}
</style>

<template>
  <div class="sa-page">
    <!-- Header -->
    <div class="sa-header">
      <div class="sa-header__left">
        <div class="sa-header__title-icon">
          <v-icon size="26">mdi-chart-timeline-variant</v-icon>
        </div>
        <div>
          <h1 class="text-h5 font-weight-bold">API Usage Analysis</h1>
          <p class="text-body-2 text-medium-emphasis">Platform-wide API consumption trends across all tenants</p>
        </div>
      </div>
      <div class="sa-header__actions">
        <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="loadData">Refresh</v-btn>
      </div>
    </div>

    <!-- Date Range Filter -->
    <div class="sa-card" style="margin-bottom:16px">
      <div class="d-flex align-center flex-wrap ga-3">
        <div class="d-flex align-center" style="gap:8px">
          <v-icon size="18" color="primary">mdi-filter-variant</v-icon>
          <span class="text-subtitle-2 font-weight-bold">Date Range</span>
        </div>
        <v-btn-group density="compact" variant="outlined" color="primary">
          <v-btn
            v-for="p in presets"
            :key="p.value"
            :variant="preset === p.value ? 'flat' : 'text'"
            :color="preset === p.value ? 'primary' : undefined"
            size="small"
            @click="preset = p.value; loadData()"
          >
            {{ p.label }}
          </v-btn>
        </v-btn-group>
        <v-menu v-if="preset === 'custom'" :close-on-content-click="false">
          <template #activator="{ props }">
            <v-btn v-bind="props" size="small" variant="tonal" prepend-icon="mdi-calendar">
              {{ customStart }} → {{ customEnd }}
            </v-btn>
          </template>
          <v-card class="pa-3" min-width="280">
            <v-text-field v-model="customStart" label="Start" type="date" density="compact" hide-details class="mb-2" />
            <v-text-field v-model="customEnd" label="End" type="date" density="compact" hide-details class="mb-2" />
            <v-btn block color="primary" size="small" :disabled="!customStart || !customEnd" @click="loadData">Apply</v-btn>
          </v-card>
        </v-menu>
        <v-spacer />
        <v-select
          v-model="tenantFilter"
          :items="tenantOptions"
          item-title="name"
          item-value="id"
          density="compact"
          variant="outlined"
          label="Tenant"
          clearable
          hide-details
          style="max-width:240px"
          @update:model-value="loadData"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && !data" class="sa-skeleton">
      <div class="sa-kpi-grid">
        <v-skeleton-loader v-for="n in 4" :key="n" type="article" class="sa-skel-kpi" boilerplate />
      </div>
      <v-skeleton-loader type="card, table-tbody" class="sa-skel-table" boilerplate />
    </div>

    <template v-else-if="data">
      <!-- KPIs -->
      <div class="sa-kpi-grid" style="grid-template-columns: repeat(4, 1fr)">
        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Total Requests</span>
            <div class="sa-kpi__icon sa-kpi__icon--primary"><v-icon size="20">mdi-pulse</v-icon></div>
          </div>
          <p class="sa-kpi__value">{{ formatNum(data.summary.total_requests) }}</p>
          <div class="sa-kpi__sub">{{ data.range.days }} day(s): {{ data.range.start }} → {{ data.range.end }}</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Daily Average</span>
            <div class="sa-kpi__icon sa-kpi__icon--success"><v-icon size="20">mdi-chart-line</v-icon></div>
          </div>
          <p class="sa-kpi__value">{{ formatNum(data.summary.daily_average) }}</p>
          <div class="sa-kpi__sub">Avg requests / day</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Peak Day</span>
            <div class="sa-kpi__icon sa-kpi__icon--warning"><v-icon size="20">mdi-trending-up</v-icon></div>
          </div>
          <p class="sa-kpi__value" style="font-size:1.1rem">{{ data.summary.peak_day ? formatShortDate(data.summary.peak_day.date) : '—' }}</p>
          <div class="sa-kpi__sub">{{ data.summary.peak_day ? formatNum(data.summary.peak_day.request_count) : '—' }} requests</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Est. Cost (Current Rate)</span>
            <div class="sa-kpi__icon sa-kpi__icon--info"><v-icon size="20">mdi-cash</v-icon></div>
          </div>
          <p class="sa-kpi__value" style="font-size:1.1rem">${{ formatCost(data.summary.estimated_cost) }}</p>
          <div class="sa-kpi__sub">{{ data.active_tenants }} active tenant(s)</div>
        </div>
      </div>

      <!-- Daily Usage Trend Chart -->
      <div class="sa-card">
        <div class="sa-card__header">
          <div class="sa-card__header-icon sa-card__header-icon--primary">
            <v-icon size="20">mdi-chart-areaspline</v-icon>
          </div>
          <div>
            <h3 class="sa-card__title">Daily Request Volume</h3>
            <p class="sa-card__subtitle">{{ data.range.start }} → {{ data.range.end }}</p>
          </div>
        </div>
        <v-card-text style="padding: 0 4px 4px">
          <apexchart
            v-if="dailySeries[0].data.length"
            type="area"
            height="320"
            :options="dailyChartOptions"
            :series="dailySeries"
          />
          <div v-else class="sa-empty" style="padding: 40px 0">
            <v-icon size="44" color="grey-lighten-1">mdi-chart-off</v-icon>
            <p class="text-body-2 text-medium-emphasis mt-2">No usage data for this range</p>
          </div>
        </v-card-text>
      </div>

      <!-- Two-column: Tenant breakdown + Bar chart -->
      <div class="sa-two-col" style="grid-template-columns: 1fr 1.5fr">
        <!-- Top tenants bar -->
        <div class="sa-card" style="margin-bottom:0">
          <div class="sa-card__header">
            <div class="sa-card__header-icon sa-card__header-icon--green">
              <v-icon size="20">mdi-chart-bar</v-icon>
            </div>
            <div>
              <h3 class="sa-card__title">Top Tenants</h3>
              <p class="sa-card__subtitle">By request volume</p>
            </div>
          </div>
          <v-card-text style="padding: 0 4px 4px">
            <apexchart
              v-if="tenantSeries[0].data.length"
              type="bar"
              height="320"
              :options="tenantBarOptions"
              :series="tenantSeries"
            />
            <div v-else class="sa-empty" style="padding: 40px 0">
              <v-icon size="44" color="grey-lighten-1">mdi-chart-off</v-icon>
              <p class="text-body-2 text-medium-emphasis mt-2">No data</p>
            </div>
          </v-card-text>
        </div>

        <!-- Tenant breakdown table -->
        <div class="sa-card" style="margin-bottom:0">
          <div class="sa-card__header">
            <div class="sa-card__header-icon sa-card__header-icon--purple">
              <v-icon size="20">mdi-format-list-bulleted</v-icon>
            </div>
            <div>
              <h3 class="sa-card__title">Per-Tenant Breakdown</h3>
              <p class="sa-card__subtitle">{{ data.per_tenant.length }} tenants</p>
            </div>
          </div>
          <v-data-table
            :headers="tenantHeaders"
            :items="data.per_tenant"
            :items-per-page="10"
            density="comfortable"
            hover
          >
            <template #item.tenant_name="{ item }">
              <span class="text-body-2 font-weight-medium">{{ item.tenant_name || '—' }}</span>
            </template>
            <template #item.total_requests="{ item }">
              <span class="text-body-2 font-weight-medium">{{ formatNum(item.total_requests) }}</span>
            </template>
            <template #item.share="{ item }">
              <div class="d-flex align-center ga-2">
                <v-progress-linear
                  :model-value="tenantShare(item.total_requests)"
                  color="primary"
                  height="6"
                  rounded
                  style="max-width:120px"
                />
                <span class="text-body-2 text-medium-emphasis">{{ tenantShare(item.total_requests).toFixed(1) }}%</span>
              </div>
            </template>
            <template #item.cost="{ item }">
              <span class="text-body-2">${{ formatCost(calcCost(item.total_requests)) }}</span>
            </template>
            <template #no-data>
              <div class="sa-empty">
                <v-icon size="44" color="grey-lighten-1">mdi-database-off</v-icon>
                <p class="text-body-2 text-medium-emphasis mt-2">No tenants in range</p>
              </div>
            </template>
          </v-data-table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const toast = useToast()

const chartOptions = useChartOptions()
const { areaOptions, barOptions } = chartOptions
const { colors: chartColors } = useChartTheme()

const loading = ref(false)
const data = ref<any>(null)
const tenants = ref<any[]>([])

const presets = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: '7d', value: 'last_7_days' },
  { label: '14d', value: 'last_14_days' },
  { label: '30d', value: 'last_30_days' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Year', value: 'this_year' },
  { label: 'Custom', value: 'custom' },
]
const preset = ref('last_30_days')
const customStart = ref('')
const customEnd = ref('')
const tenantFilter = ref<number | null>(null)

const tenantOptions = computed(() => tenants.value.map(t => ({ id: t.id, name: t.name || `Tenant #${t.id}` })))

const tenantHeaders = [
  { title: 'Tenant', key: 'tenant_name', sortable: true },
  { title: 'Requests', key: 'total_requests', sortable: true },
  { title: 'Share', key: 'share', sortable: false },
  { title: 'Est. Cost', key: 'cost', sortable: true },
]

// ── charts ────────────────────────────────────────────────────────────────────
const dailySeries = computed(() => {
  if (!data.value?.daily?.length) return [{ name: 'Requests', data: [] as [string, number][] }]
  const points = data.value.daily.map((d: any) => [d.date, d.request_count] as [string, number])
  return [{ name: 'Requests', data: points }]
})

const dailyChartOptions = computed(() =>
  areaOptions({
    xaxisType: 'datetime',
    colors: [chartColors.value.primary],
    yaxisFormatter: (v: number) => v.toLocaleString('en-GB'),
    tooltipFormatter: (v: number) => `${v.toLocaleString('en-GB')} requests`,
  }),
)

const tenantSeries = computed(() => {
  if (!data.value?.per_tenant?.length) return [{ name: 'Requests', data: [] as number[] }]
  const top = data.value.per_tenant.slice(0, 10)
  return [{ name: 'Requests', data: top.map((t: any) => t.total_requests) }]
})

const tenantBarOptions = computed(() =>
  barOptions({
    horizontal: true,
    categories: (data.value?.per_tenant || []).slice(0, 10).map((t: any) => t.tenant_name || t.tenant_schema || 'Unknown'),
    color: chartColors.value.success,
    valueFormatter: (v: number) => v.toLocaleString('en-GB'),
    tooltipFormatter: (v: number) => `${v.toLocaleString('en-GB')} requests`,
  }),
)

// ── helper functions ──────────────────────────────────────────────────────────
function formatNum(v: any): string {
  return Number(v || 0).toLocaleString('en-US')
}

function formatShortDate(d: string): string {
  return new Date(d).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
}

function formatCost(v: any): string {
  return Number(v || 0).toFixed(4)
}

function calcCost(count: number): string {
  // Use the estimated cost rate from the API summary
  const total = Number(data.value?.summary?.total_requests || 0)
  const totalCost = Number(data.value?.summary?.estimated_cost || 0)
  if (total === 0) return '0.0000'
  return (totalCost * (count / total)).toFixed(4)
}

function tenantShare(count: number): number {
  const total = Number(data.value?.summary?.total_requests || 0)
  if (total === 0) return 0
  return (count / total) * 100
}

async function loadTenants() {
  try {
    const resp = await useApi()('/tenants/manage/')
    tenants.value = resp.results || resp || []
  } catch { /* non-fatal */ }
}

async function loadData() {
  loading.value = true
  try {
    const params: Record<string, string> = { preset: preset.value }
    if (preset.value === 'custom') {
      if (customStart.value) params.start = customStart.value
      if (customEnd.value) params.end = customEnd.value
    }
    if (tenantFilter.value) params.tenant = String(tenantFilter.value)

    const query = new URLSearchParams(params).toString()
    data.value = await useApi()(`/usage-billing/admin/usage/?${query}`)

    if (tenants.value.length === 0) await loadTenants()
  } catch {
    toast.error('Failed to load usage data')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

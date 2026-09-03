<template>
  <div class="sa-page">
    <!-- Header -->
    <div class="sa-header">
      <div class="sa-header__left">
        <div class="sa-header__title-icon">
          <v-icon size="26">mdi-counter</v-icon>
        </div>
        <div>
          <h1 class="text-h5 font-weight-bold">API Billing</h1>
          <p class="text-body-2 text-medium-emphasis">Manage metered API request pricing</p>
        </div>
      </div>
      <div class="sa-header__actions">
        <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="loadAll">Refresh</v-btn>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && !current" class="sa-skeleton">
      <v-skeleton-loader type="article" class="sa-skel-kpi" boilerplate />
      <v-skeleton-loader type="table-tbody" class="sa-skel-table" boilerplate />
    </div>

    <template v-else>
      <!-- Current Rate KPI -->
      <div class="sa-kpi-grid" style="grid-template-columns: repeat(4, 1fr)">
        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Current Rate</span>
            <div class="sa-kpi__icon sa-kpi__icon--primary"><v-icon size="20">mdi-counter</v-icon></div>
          </div>
          <p class="sa-kpi__value">{{ current?.requests_per_unit ?? '—' }}</p>
          <div class="sa-kpi__sub">requests per unit</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Unit Cost</span>
            <div class="sa-kpi__icon sa-kpi__icon--success"><v-icon size="20">mdi-cash</v-icon></div>
          </div>
          <p class="sa-kpi__value">{{ formatCost(current) }}</p>
          <div class="sa-kpi__sub">per {{ current?.requests_per_unit ?? 0 }} requests</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Currency</span>
            <div class="sa-kpi__icon sa-kpi__icon--info"><v-icon size="20">mdi-currency-usd</v-icon></div>
          </div>
          <p class="sa-kpi__value">{{ current?.currency || '—' }}</p>
          <div class="sa-kpi__sub">Base billing currency</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Effective Since</span>
            <div class="sa-kpi__icon sa-kpi__icon--teal"><v-icon size="20">mdi-calendar-clock</v-icon></div>
          </div>
          <p class="sa-kpi__value" style="font-size:1.1rem">{{ current?.effective_from ? formatTime(current.effective_from) : '—' }}</p>
          <div class="sa-kpi__sub">{{ current?.is_active ? 'Active' : 'Inactive' }}</div>
        </div>
      </div>

      <!-- New Rate + Cost Preview -->
      <div class="sa-two-col" style="grid-template-columns: 1.5fr 1fr">
        <!-- New Rate Form -->
        <div class="sa-card">
          <div class="sa-card__header">
            <div class="sa-card__header-icon sa-card__header-icon--primary">
              <v-icon size="20">mdi-plus-circle-outline</v-icon>
            </div>
            <div>
              <h3 class="sa-card__title">Set New Rate</h3>
              <p class="sa-card__subtitle">Creates a new rate and deactivates the previous one</p>
            </div>
          </div>
          <div class="sa-card__body">
            <div class="d-flex ga-3 mb-3">
              <v-text-field
                v-model.number="form.requests_per_unit"
                type="number"
                label="Requests per unit"
                hint="How many API calls make up one billable unit"
                persistent-hint
                variant="outlined"
                density="compact"
              />
              <v-text-field
                v-model.number="form.unit_cost"
                type="number"
                step="0.0001"
                label="Unit cost"
                hint="Cost per unit (in base currency)"
                persistent-hint
                variant="outlined"
                density="compact"
              />
            </div>
            <div class="d-flex ga-3 mb-3">
              <v-text-field
                v-model="form.currency"
                label="Currency"
                hint="Base billing currency code (e.g. USD)"
                persistent-hint
                variant="outlined"
                density="compact"
                style="max-width: 200px"
              />
              <v-text-field
                v-model="form.effective_from"
                type="datetime-local"
                label="Effective from"
                hint="When the new rate takes effect"
                persistent-hint
                variant="outlined"
                density="compact"
              />
            </div>
            <v-textarea
              v-model="form.notes"
              label="Notes (optional)"
              variant="outlined"
              density="compact"
              rows="2"
              class="mb-3"
            />
            <v-switch v-model="form.is_active" label="Activate immediately" color="success" density="compact" inset class="mb-3" />

            <div class="d-flex ga-2">
              <v-btn color="primary" prepend-icon="mdi-content-save-plus" :loading="saving" @click="saveRate">
                Create Rate
              </v-btn>
              <v-btn variant="text" @click="resetForm">Reset</v-btn>
            </div>
          </div>
        </div>

        <!-- Cost Preview -->
        <div class="sa-card" style="margin-bottom:0">
          <div class="sa-card__header">
            <div class="sa-card__header-icon sa-card__header-icon--teal">
              <v-icon size="20">mdi-calculator-variant</v-icon>
            </div>
            <div>
              <h3 class="sa-card__title">Cost Calculator</h3>
              <p class="sa-card__subtitle">Preview cost for a request count</p>
            </div>
          </div>
          <div class="sa-card__body">
            <v-text-field
              v-model.number="calcRequests"
              type="number"
              label="Number of API requests"
              variant="outlined"
              density="compact"
              class="mb-3"
            />
            <div class="sa-detail-grid">
              <div class="sa-detail-field">
                <span class="sa-detail-field__label">With current rate</span>
                <span class="sa-detail-field__value text-success font-weight-medium">{{ calcCost(current, calcRequests) }}</span>
              </div>
              <div class="sa-detail-field">
                <span class="sa-detail-field__label">With new rate</span>
                <span class="sa-detail-field__value text-primary font-weight-medium">{{ calcCost(newRatePreview, calcRequests) }}</span>
              </div>
              <div class="sa-detail-field">
                <span class="sa-detail-field__label">Per-request cost (current)</span>
                <span class="sa-detail-field__value">{{ perRequest(current) }}</span>
              </div>
              <div class="sa-detail-field">
                <span class="sa-detail-field__label">Per-request cost (new)</span>
                <span class="sa-detail-field__value">{{ perRequest(newRatePreview) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Rate History Table -->
      <div class="sa-card">
        <div class="sa-card__header">
          <div class="sa-card__header-icon sa-card__header-icon--purple">
            <v-icon size="20">mdi-history</v-icon>
          </div>
          <div>
            <h3 class="sa-card__title">Rate History</h3>
            <p class="sa-card__subtitle">{{ rates.length }} rates</p>
          </div>
        </div>

        <v-data-table :headers="rateHeaders" :items="rates" :items-per-page="15" density="comfortable" hover>
          <template #item.requests_per_unit="{ item }">
            <span class="text-body-2 font-weight-medium">{{ item.requests_per_unit }}</span>
          </template>
          <template #item.unit_cost="{ item }">
            <span class="text-body-2 font-weight-medium">{{ formatCost(item) }}</span>
          </template>
          <template #item.is_active="{ item }">
            <v-chip :color="item.is_active ? 'success' : 'grey'" size="small" variant="tonal" label>
              {{ item.is_active ? 'Active' : 'Inactive' }}
            </v-chip>
          </template>
          <template #item.effective_from="{ item }">
            <span class="text-body-2 text-medium-emphasis">{{ formatTime(item.effective_from) }}</span>
          </template>
          <template #item.created_at="{ item }">
            <span class="text-body-2 text-medium-emphasis">{{ formatTime(item.created_at) }}</span>
          </template>
          <template #item.created_by_email="{ item }">
            <span class="text-body-2">{{ item.created_by_email || '—' }}</span>
          </template>
          <template #item.notes="{ item }">
            <span class="text-body-2 text-medium-emphasis">{{ item.notes || '—' }}</span>
          </template>
          <template #item.actions="{ item }">
            <div class="d-flex ga-1">
              <v-btn
                v-if="!item.is_active"
                size="small"
                variant="tonal"
                color="success"
                prepend-icon="mdi-check"
                :loading="togglingId === item.id"
                @click="activateRate(item)"
              >
                Activate
              </v-btn>
              <v-btn
                size="small"
                variant="text"
                color="error"
                icon="mdi-delete-outline"
                :loading="togglingId === item.id"
                @click="deleteRate(item)"
              />
            </div>
          </template>
          <template #no-data>
            <div class="sa-empty">
              <v-icon size="44" color="grey-lighten-1">mdi-counter-off</v-icon>
              <p class="text-body-2 text-medium-emphasis mt-2">No rates defined yet</p>
            </div>
          </template>
        </v-data-table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const toast = useToast()

const loading = ref(false)
const saving = ref(false)
const togglingId = ref<number | null>(null)

const current = ref<any>(null)
const rates = ref<any[]>([])

const calcRequests = ref(10000)

const nowLocal = new Date()
nowLocal.setMinutes(nowLocal.getMinutes() - nowLocal.getTimezoneOffset())
const nowISO = nowLocal.toISOString().slice(0, 16)

const form = reactive({
  requests_per_unit: 1000,
  unit_cost: 0.077,
  currency: 'USD',
  effective_from: nowISO,
  is_active: true,
  notes: '',
})

const newRatePreview = computed(() => ({
  requests_per_unit: form.requests_per_unit || 0,
  unit_cost: form.unit_cost || 0,
  currency: form.currency,
}))

const rateHeaders = [
  { title: 'Requests/Unit', key: 'requests_per_unit', sortable: true },
  { title: 'Unit Cost', key: 'unit_cost', sortable: true },
  { title: 'Currency', key: 'currency', sortable: false },
  { title: 'Status', key: 'is_active', sortable: true },
  { title: 'Effective From', key: 'effective_from', sortable: true },
  { title: 'Created', key: 'created_at', sortable: true },
  { title: 'Created By', key: 'created_by_email', sortable: false },
  { title: 'Notes', key: 'notes', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false },
]

function formatCost(rate: any): string {
  if (!rate) return '—'
  const cost = Number(rate.unit_cost || 0)
  return `${cost.toFixed(4)} ${rate.currency || ''}`
}

function perRequest(rate: any): string {
  if (!rate || !rate.requests_per_unit) return '—'
  const per = Number(rate.unit_cost || 0) / Number(rate.requests_per_unit)
  return `${per.toFixed(8)} ${rate.currency || ''}`
}

function calcCost(rate: any, count: number): string {
  if (!rate || !rate.requests_per_unit) return '—'
  const units = count / Number(rate.requests_per_unit)
  const cost = units * Number(rate.unit_cost || 0)
  return `${cost.toFixed(4)} ${rate.currency || ''}`
}

function formatTime(v: string): string {
  if (!v) return '—'
  return new Date(v).toLocaleString('en-GB', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function resetForm() {
  Object.assign(form, {
    requests_per_unit: current.value?.requests_per_unit ?? 1000,
    unit_cost: current.value?.unit_cost ?? 0.077,
    currency: current.value?.currency ?? 'USD',
    effective_from: nowISO,
    is_active: true,
    notes: '',
  })
}

async function loadAll() {
  loading.value = true
  try {
    const data = await useApi()('/usage-billing/admin/rates/')
    current.value = data.current
    rates.value = data.rates || []
    resetForm()
  } catch {
    toast.error('Failed to load billing rates')
  } finally {
    loading.value = false
  }
}

async function saveRate() {
  if (!form.requests_per_unit || form.requests_per_unit < 1) {
    toast.error('Requests per unit must be at least 1')
    return
  }
  if (form.unit_cost === null || form.unit_cost === undefined || form.unit_cost < 0) {
    toast.error('Unit cost must be a valid non-negative number')
    return
  }
  saving.value = true
  try {
    await useApi()('/usage-billing/admin/rates/', { method: 'POST', body: { ...form } })
    toast.success('New billing rate created')
    await loadAll()
  } catch (e: any) {
    toast.error(e?.data?.detail || 'Failed to create rate')
  } finally {
    saving.value = false
  }
}

async function activateRate(item: any) {
  togglingId.value = item.id
  try {
    await useApi()(`/usage-billing/admin/rates/${item.id}/`, { method: 'PATCH', body: { is_active: true } })
    toast.success('Rate activated')
    await loadAll()
  } catch (e: any) {
    toast.error(e?.data?.detail || 'Failed to activate rate')
  } finally {
    togglingId.value = null
  }
}

async function deleteRate(item: any) {
  togglingId.value = item.id
  try {
    await useApi()(`/usage-billing/admin/rates/${item.id}/`, { method: 'DELETE' })
    toast.success('Rate deleted')
    await loadAll()
  } catch (e: any) {
    toast.error(e?.data?.detail || 'Failed to delete rate')
  } finally {
    togglingId.value = null
  }
}

onMounted(loadAll)
</script>

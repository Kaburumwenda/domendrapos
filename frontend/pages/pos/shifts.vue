<template>
  <div class="shifts-page">
    <!-- ===== Header ===== -->
    <div class="shifts-header">
      <div class="shifts-header__left">
        <div class="shifts-header__back">
          <v-btn to="/pos" variant="text" size="small" prepend-icon="mdi-arrow-left" density="comfortable">POS</v-btn>
        </div>
        <div class="shifts-header__title">
          <h1 class="text-h5 font-weight-bold">Cashier Shifts</h1>
          <p class="text-body-2 text-medium-emphasis">Manage drawer float, track cash variance, and close shifts with Z-reports</p>
        </div>
      </div>
      <div class="shifts-header__actions">
        <v-btn variant="tonal" prepend-icon="mdi-refresh" size="small" @click="loadData" :loading="loading">Refresh</v-btn>
        <v-btn v-if="currentShift" variant="flat" color="warning" prepend-icon="mdi-stop-circle" @click="openCloseDialog">Close Shift</v-btn>
        <v-btn v-else variant="flat" color="primary" prepend-icon="mdi-play-circle" @click="openShiftDialog = true">Open Shift</v-btn>
      </div>
    </div>

    <!-- ===== KPI Cards ===== -->
    <div class="shifts-kpi-grid">
      <div class="shifts-kpi">
        <div class="shifts-kpi__icon shifts-kpi__icon--primary"><v-icon size="22">mdi-clock-outline</v-icon></div>
        <div class="shifts-kpi__body">
          <p class="shifts-kpi__label">Total Shifts</p>
          <p class="shifts-kpi__value">{{ shiftStats.total }}</p>
        </div>
      </div>
      <div class="shifts-kpi">
        <div class="shifts-kpi__icon shifts-kpi__icon--success"><v-icon size="22">mdi-store-open</v-icon></div>
        <div class="shifts-kpi__body">
          <p class="shifts-kpi__label">Open Now</p>
          <p class="shifts-kpi__value text-success">{{ shiftStats.open }}</p>
        </div>
      </div>
      <div class="shifts-kpi">
        <div class="shifts-kpi__icon shifts-kpi__icon--info"><v-icon size="22">mdi-cash-multiple</v-icon></div>
        <div class="shifts-kpi__body">
          <p class="shifts-kpi__label">Gross Revenue</p>
          <p class="shifts-kpi__value">{{ formatMoney(shiftStats.revenue) }}</p>
        </div>
      </div>
      <div class="shifts-kpi">
        <div class="shifts-kpi__icon shifts-kpi__icon--warn"><v-icon size="22">mdi-scale-balance</v-icon></div>
        <div class="shifts-kpi__body">
          <p class="shifts-kpi__label">Net Variance</p>
          <p class="shifts-kpi__value" :class="shiftStats.variance >= 0 ? 'text-success' : 'text-error'">
            {{ shiftStats.variance >= 0 ? '+' : '' }}{{ formatMoney(shiftStats.variance) }}
          </p>
        </div>
      </div>
    </div>

    <!-- ===== Active Shift Banner ===== -->
    <div v-if="currentShift" class="shifts-active">
      <div class="shifts-active__indicator">
        <span class="shifts-active__pulse"></span>
        <span class="shifts-active__dot"></span>
      </div>
      <div class="shifts-active__body">
        <div class="shifts-active__header">
          <span class="shifts-active__ref">{{ currentShift.reference }}</span>
          <span class="shifts-active__badge">LIVE</span>
        </div>
        <p class="shifts-active__meta">
          {{ currentShift.branch_name }} · {{ currentShift.cashier_name }} · Opened {{ formatDateTime(currentShift.opened_at) }}
        </p>
      </div>
      <div class="shifts-active__stats">
        <div class="shifts-active__stat"><span class="shifts-active__stat-label">Float</span><span class="shifts-active__stat-value">{{ formatMoney(currentShift.opening_float) }}</span></div>
        <div class="shifts-active__stat"><span class="shifts-active__stat-label">Duration</span><span class="shifts-active__stat-value">{{ currentShiftDuration }}</span></div>
      </div>
      <v-btn variant="flat" color="warning" size="small" prepend-icon="mdi-stop-circle" @click="openCloseDialog">Close</v-btn>
    </div>

    <!-- ===== Filters Bar ===== -->
    <div class="shifts-toolbar">
      <div class="shifts-toolbar__search">
        <v-icon size="18" class="shifts-toolbar__icon">mdi-magnify</v-icon>
        <input
          v-model="search"
          class="shifts-toolbar__input"
          placeholder="Search by reference or cashier..."
        />
      </div>
      <div class="shifts-toolbar__filters">
        <button
          v-for="f in filterOptions"
          :key="f.value"
          class="shifts-toolbar__pill"
          :class="{ 'shifts-toolbar__pill--active': activeFilter === f.value }"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
          <span class="shifts-toolbar__pill-count">{{ f.count }}</span>
        </button>
      </div>
    </div>

    <!-- ===== Shifts Table ===== -->
    <div class="shifts-table-wrap">
      <div v-if="loading" class="shifts-loading">
        <v-progress-circular indeterminate size="32" color="primary" />
        <p class="text-body-2 text-medium-emphasis mt-2">Loading shifts...</p>
      </div>
      <div v-else-if="filteredShifts.length === 0" class="shifts-empty">
        <v-icon size="48" class="text-medium-emphasis">mdi-clock-off-outline</v-icon>
        <p class="text-h6 mt-2">No shifts found</p>
        <p class="text-body-2 text-medium-emphasis">{{ search ? 'Try a different search.' : 'Open a shift to get started.' }}</p>
      </div>
      <table v-else class="shifts-table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Cashier</th>
            <th>Branch</th>
            <th>Duration</th>
            <th class="text-right">Float</th>
            <th class="text-right">Gross</th>
            <th class="text-right">Expected</th>
            <th class="text-right">Actual</th>
            <th class="text-right">Variance</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in paginatedShifts" :key="s.id" class="shifts-table__row" @click="openDetail(s)">
            <td>
              <div class="shifts-table__ref">{{ s.reference }}</div>
              <div class="shifts-table__date">{{ formatDate(s.opened_at) }}</div>
            </td>
            <td class="shifts-table__cashier">
              <div class="shifts-table__cashier-badge">{{ initialsOf(s.cashier_name) }}</div>
              <span>{{ s.cashier_name }}</span>
            </td>
            <td class="text-medium-emphasis">{{ s.branch_name }}</td>
            <td class="text-medium-emphasis">{{ s.duration }}</td>
            <td class="text-right font-weight-medium">{{ formatMoney(s.opening_float) }}</td>
            <td class="text-right">{{ formatMoney(s.gross_revenue) }}</td>
            <td class="text-right text-medium-emphasis">{{ s.actual_cash !== null ? formatMoney(s.expected_cash) : '—' }}</td>
            <td class="text-right">{{ s.actual_cash !== null ? formatMoney(s.actual_cash) : '—' }}</td>
            <td class="text-right">
              <span v-if="s.actual_cash !== null" class="shifts-table__variance" :class="varianceClass(s.cash_variance)">
                {{ Number(s.cash_variance) >= 0 ? '+' : '' }}{{ formatMoney(s.cash_variance) }}
              </span>
              <span v-else class="text-medium-emphasis">—</span>
            </td>
            <td>
              <span class="shifts-table__status" :class="`shifts-table__status--${s.status}`">
                <span class="shifts-table__status-dot"></span>
                {{ s.status_display }}
              </span>
            </td>
            <td>
              <v-btn icon="mdi-chevron-right" size="small" variant="text" density="compact" @click.stop="openDetail(s)" />
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="filteredShifts.length > itemsPerPage" class="shifts-pagination">
        <span class="shifts-pagination__info">
          Showing {{ (page - 1) * itemsPerPage + 1 }}–{{ Math.min(page * itemsPerPage, filteredShifts.length) }} of {{ filteredShifts.length }}
        </span>
        <div class="shifts-pagination__nav">
          <v-btn size="small" variant="text" :disabled="page === 1" @click="page--" prepend-icon="mdi-chevron-left">Prev</v-btn>
          <span class="shifts-pagination__page">{{ page }} / {{ totalPages }}</span>
          <v-btn size="small" variant="text" :disabled="page === totalPages" @click="page++" append-icon="mdi-chevron-right">Next</v-btn>
        </div>
      </div>
    </div>

    <!-- ===== Open Shift Dialog ===== -->
    <v-dialog v-model="openShiftDialog" max-width="480" persistent>
      <v-card rounded="xl" class="shifts-dialog">
        <div class="shifts-dialog__header">
          <div class="shifts-dialog__header-icon shifts-dialog__header-icon--primary">
            <v-icon size="24">mdi-play-circle</v-icon>
          </div>
          <div>
            <h3 class="text-h6 font-weight-bold">Open New Shift</h3>
            <p class="text-body-2 text-medium-emphasis">Start a new cashier drawer session</p>
          </div>
        </div>
        <v-divider />
        <div class="shifts-dialog__body">
          <label class="shifts-dialog__label" v-if="branches.length > 1">Branch</label>
          <select
            v-if="branches.length > 1"
            v-model="selectedBranch"
            class="shifts-dialog__select mb-3"
          >
            <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
          <label class="shifts-dialog__label">Opening Cash Float</label>
          <div class="shifts-dialog__money-input">
            <span class="shifts-dialog__money-prefix">{{ currencySymbol }}</span>
            <input
              v-model.number="newFloat"
              type="number"
              class="shifts-dialog__money-field"
              placeholder="0.00"
              min="0"
              step="0.01"
              @keyup.enter="confirmOpenShift"
            />
          </div>
          <div class="shifts-dialog__quick-buttons">
            <button v-for="q in quickFloat" :key="q" class="shifts-dialog__quick-btn" @click="newFloat = q">{{ currencySymbol }}{{ q.toLocaleString() }}</button>
          </div>
          <p class="shifts-dialog__hint">
            <v-icon size="14" class="mr-1">mdi-information-outline</v-icon>
            The opening float is the cash amount counted into the drawer at the start of the shift.
          </p>
        </div>
        <v-divider />
        <div class="shifts-dialog__actions">
          <v-btn variant="text" @click="openShiftDialog = false">Cancel</v-btn>
          <v-btn variant="flat" color="primary" prepend-icon="mdi-check" :loading="actionLoading" @click="confirmOpenShift">Open Shift</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- ===== Close Shift Dialog (Z-Report) ===== -->
    <v-dialog v-model="closeShiftDialog" max-width="560" persistent>
      <v-card rounded="xl" class="shifts-dialog">
        <div class="shifts-dialog__header">
          <div class="shifts-dialog__header-icon shifts-dialog__header-icon--warning">
            <v-icon size="24">mdi-stop-circle</v-icon>
          </div>
          <div>
            <h3 class="text-h6 font-weight-bold">Close Shift — Z-Report</h3>
            <p class="text-body-2 text-medium-emphasis">{{ currentShift?.reference }} · {{ currentShift?.branch_name }}</p>
          </div>
        </div>
        <v-divider />
        <div class="shifts-dialog__body">
          <!-- Z-Report summary preview -->
          <div class="shifts-zreport">
            <div class="shifts-zreport__row">
              <span>Opening Float</span>
              <span class="font-weight-medium">{{ formatMoney(currentShift?.opening_float) }}</span>
            </div>
            <div class="shifts-zreport__row">
              <span>Cash Sales (expected)</span>
              <span class="font-weight-medium">{{ formatMoney(expectedCashSales) }}</span>
            </div>
            <div class="shifts-zreport__row shifts-zreport__row--bold">
              <span>Expected Cash in Drawer</span>
              <span class="font-weight-bold">{{ formatMoney(expectedTotal) }}</span>
            </div>
            <v-divider class="my-2" />
            <label class="shifts-dialog__label mt-2">Actual Cash Counted</label>
            <div class="shifts-dialog__money-input">
              <span class="shifts-dialog__money-prefix">{{ currencySymbol }}</span>
              <input
                v-model.number="actualCash"
                type="number"
                class="shifts-dialog__money-field"
                placeholder="0.00"
                min="0"
                step="0.01"
                @keyup.enter="confirmCloseShift"
              />
            </div>
            <div class="shifts-dialog__quick-buttons">
              <button
                v-for="q in quickActualOptions"
                :key="q"
                class="shifts-dialog__quick-btn"
                @click="actualCash = q"
              >{{ formatMoney(q) }}</button>
            </div>
            <!-- Variance preview -->
            <div class="shifts-zreport__variance" :class="variancePreview >= 0 ? 'shifts-zreport__variance--ok' : 'shifts-zreport__variance--bad'">
              <v-icon size="18">{{ variancePreview >= 0 ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
              <div>
                <p class="font-weight-medium">
                  {{ variancePreview >= 0 ? 'Surplus' : 'Shortfall' }}: {{ formatMoney(Math.abs(variancePreview)) }}
                </p>
                <p class="text-caption text-medium-emphasis">
                  {{ variancePreview >= 0 ? 'Drawer has more cash than expected' : 'Drawer is short of expected cash' }}
                </p>
              </div>
            </div>
            <label class="shifts-dialog__label mt-3">Closing Notes</label>
            <textarea
              v-model="closeNotes"
              class="shifts-dialog__textarea"
              placeholder="Optional notes about this shift..."
              rows="2"
            />
          </div>
        </div>
        <v-divider />
        <div class="shifts-dialog__actions">
          <v-btn variant="text" @click="closeShiftDialog = false">Cancel</v-btn>
          <v-btn variant="flat" color="warning" prepend-icon="mdi-check" :loading="actionLoading" @click="confirmCloseShift">Close Shift</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- ===== Shift Detail Dialog (Z-Report view) ===== -->
    <v-dialog v-model="detailDialog" max-width="600">
      <v-card v-if="detailShift" rounded="xl" class="shifts-dialog">
        <!-- Z-Report header -->
        <div class="shifts-detail__header" :class="`shifts-detail__header--${detailShift.status}`">
          <div class="shifts-detail__header-top">
            <div>
              <span class="shifts-detail__z-report">Z-REPORT</span>
              <h3 class="text-h6 font-weight-bold mt-1">{{ detailShift.reference }}</h3>
            </div>
            <span class="shifts-detail__status-badge" :class="`shifts-detail__status-badge--${detailShift.status}`">
              {{ detailShift.status_display }}
            </span>
          </div>
          <div class="shifts-detail__header-meta">
            <span><v-icon size="14" class="mr-1">mdi-store</v-icon>{{ detailShift.branch_name }}</span>
            <span><v-icon size="14" class="mr-1">mdi-account</v-icon>{{ detailShift.cashier_name }}</span>
          </div>
          <div class="shifts-detail__header-times">
            <span>Opened: {{ formatDateTime(detailShift.opened_at) }}</span>
            <span v-if="detailShift.closed_at">Closed: {{ formatDateTime(detailShift.closed_at) }}</span>
            <span>Duration: {{ detailShift.duration }}</span>
          </div>
        </div>

        <!-- Z-Report body -->
        <div class="shifts-detail__body">
          <div class="shifts-detail__section">
            <h4 class="shifts-detail__section-title">Sales Summary</h4>
            <div class="shifts-detail__row"><span>Transactions</span><span class="font-weight-medium">{{ detailShift.transaction_count }}</span></div>
            <div class="shifts-detail__row"><span>Gross Revenue</span><span class="font-weight-medium">{{ formatMoney(detailShift.gross_revenue) }}</span></div>
            <div class="shifts-detail__row"><span>Total Discounts</span><span class="text-error">{{ formatMoney(detailShift.total_discounts) }}</span></div>
            <div class="shifts-detail__row"><span>Total Tax</span><span>{{ formatMoney(detailShift.total_tax) }}</span></div>
          </div>

          <div class="shifts-detail__section">
            <h4 class="shifts-detail__section-title">Cash Reconciliation</h4>
            <div class="shifts-detail__row"><span>Opening Float</span><span>{{ formatMoney(detailShift.opening_float) }}</span></div>
            <div class="shifts-detail__row" v-if="detailShift.actual_cash !== null"><span>Expected Cash</span><span>{{ formatMoney(detailShift.expected_cash) }}</span></div>
            <div class="shifts-detail__row" v-if="detailShift.actual_cash !== null"><span>Actual Cash</span><span class="font-weight-bold">{{ formatMoney(detailShift.actual_cash) }}</span></div>
            <div class="shifts-detail__row shifts-detail__row--bold" v-if="detailShift.actual_cash !== null">
              <span>Cash Variance</span>
              <span :class="Number(detailShift.cash_variance) >= 0 ? 'text-success' : 'text-error'">
                {{ Number(detailShift.cash_variance) >= 0 ? '+' : '' }}{{ formatMoney(detailShift.cash_variance) }}
              </span>
            </div>
          </div>

          <div v-if="detailShift.notes" class="shifts-detail__section">
            <h4 class="shifts-detail__section-title">Notes</h4>
            <p class="shifts-detail__notes">{{ detailShift.notes }}</p>
          </div>
        </div>

        <v-divider />
        <div class="shifts-dialog__actions">
          <v-btn variant="text" prepend-icon="mdi-printer" @click="printZReport">Print</v-btn>
          <v-btn variant="flat" color="primary" @click="detailDialog = false">Close</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { PosShift, ShiftStatus } from '~/types/pos'

definePageMeta({ middleware: 'auth' })
const toast = useToast()
const { currency } = useFormat()
const auth = useAuthStore()

const currencySymbol = computed(() => auth.currencySymbol)

function formatMoney(v: number | string | null | undefined): string {
  return currency(v || 0)
}

function formatDate(v: string) {
  return new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateTime(v: string) {
  return new Date(v).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function initialsOf(name: string): string {
  if (!name) return '?'
  return name.split(' ').map((p) => p[0]).join('').substring(0, 2).toUpperCase()
}

function varianceClass(v: string | number) {
  return Number(v) >= 0 ? 'shifts-table__variance--ok' : 'shifts-table__variance--bad'
}

// ===== State =====
const loading = ref(false)
const actionLoading = ref(false)
const shifts = ref<PosShift[]>([])
const currentShift = ref<PosShift | null>(null)
const branches = ref<any[]>([])
const selectedBranch = ref<number | null>(null)

const openShiftDialog = ref(false)
const closeShiftDialog = ref(false)
const newFloat = ref(0)
const actualCash = ref(0)
const closeNotes = ref('')

const detailDialog = ref(false)
const detailShift = ref<PosShift | null>(null)

const search = ref('')
const activeFilter = ref<'all' | ShiftStatus>('all')
const page = ref(1)
const itemsPerPage = 10

const quickFloat = [500, 1000, 2000, 5000]

const filterOptions = computed(() => [
  { value: 'all' as const, label: 'All', count: shifts.value.length },
  { value: 'open' as const, label: 'Open', count: shifts.value.filter(s => s.status === 'open').length },
  { value: 'closed' as const, label: 'Closed', count: shifts.value.filter(s => s.status === 'closed').length },
])

const filteredShifts = computed(() => {
  let result = shifts.value
  if (activeFilter.value !== 'all') {
    result = result.filter(s => s.status === activeFilter.value)
  }
  const q = search.value.trim().toLowerCase()
  if (q) {
    result = result.filter(s =>
      s.reference.toLowerCase().includes(q) ||
      (s.cashier_name || '').toLowerCase().includes(q) ||
      (s.branch_name || '').toLowerCase().includes(q)
    )
  }
  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredShifts.value.length / itemsPerPage)))

const paginatedShifts = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return filteredShifts.value.slice(start, start + itemsPerPage)
})

watch([search, activeFilter], () => { page.value = 1 })

const shiftStats = computed(() => {
  const total = shifts.value.length
  const open = shifts.value.filter(s => s.status === 'open').length
  const closed = shifts.value.filter(s => s.status === 'closed')
  const revenue = closed.reduce((s, sh) => s + Number(sh.gross_revenue), 0)
  const variance = closed.reduce((s, sh) => s + Number(sh.cash_variance), 0)
  return { total, open, revenue, variance }
})

// Live duration of current shift
const currentShiftDuration = computed(() => {
  if (!currentShift.value) return '—'
  const start = new Date(currentShift.value.opened_at).getTime()
  const elapsed = Date.now() - start
  const h = Math.floor(elapsed / 3_600_000)
  const m = Math.floor((elapsed % 3_600_000) / 60_000)
  return `${h}h ${m}m`
})

// Close dialog computed values
const expectedCashSales = computed(() => {
  if (!currentShift.value) return 0
  return Math.max(0, Number(currentShift.value.expected_cash) - Number(currentShift.value.opening_float))
})

const expectedTotal = computed(() => {
  if (!currentShift.value) return 0
  return Number(currentShift.value.opening_float) + expectedCashSales.value
})

const variancePreview = computed(() => {
  return Number(actualCash.value || 0) - expectedTotal.value
})

const quickActualOptions = computed(() => {
  const expected = expectedTotal.value
  return [expected, Math.ceil(expected / 100) * 100, Math.ceil(expected / 500) * 500, Math.ceil(expected / 1000) * 1000]
})

// ===== Actions =====
async function loadData() {
  loading.value = true
  try {
    const [allData, current] = await Promise.all([
      useApi()('/pos/shifts/?page_size=100'),
      useApi()('/pos/shifts/current/').catch(() => null),
    ])
    shifts.value = allData.results || allData
    currentShift.value = current && current.reference ? current as PosShift : null

    // Load branches for the open shift dialog
    if (branches.value.length === 0) {
      try {
        const branchData = await useApi()('/branches/')
        branches.value = branchData.results || branchData
        if (!selectedBranch.value && branches.value.length > 0) {
          const hq = branches.value.find((b: any) => b.is_headquarters) || branches.value[0]
          selectedBranch.value = hq.id
        }
      } catch { /* ignore */ }
    }
  } catch {
    toast.error('Failed to load shifts')
  } finally {
    loading.value = false
  }
}

async function confirmOpenShift() {
  if (newFloat.value < 0) {
    toast.warning('Float cannot be negative')
    return
  }
  actionLoading.value = true
  try {
    const body: any = {
      opening_float: Math.round(newFloat.value * 100) / 100,
    }
    if (selectedBranch.value) body.branch = selectedBranch.value
    await useApi()('/pos/shifts/', {
      method: 'POST',
      body,
    })
    openShiftDialog.value = false
    newFloat.value = 0
    toast.success('Shift opened successfully')
    await loadData()
  } catch (e: any) {
    const data = e?.data || e?.response?._data || {}
    const msg = data.detail || Object.values(data).flat().join(', ') || 'Failed to open shift'
    toast.error(typeof msg === 'string' ? msg : 'Failed to open shift')
  } finally {
    actionLoading.value = false
  }
}

function openCloseDialog() {
  actualCash.value = 0
  closeNotes.value = ''
  closeShiftDialog.value = true
}

async function confirmCloseShift() {
  if (!currentShift.value) return
  if (actualCash.value < 0) {
    toast.warning('Actual cash cannot be negative')
    return
  }
  actionLoading.value = true
  try {
    await useApi()(`/pos/shifts/${currentShift.value.id}/close/`, {
      method: 'POST',
      body: {
        actual_cash: Math.round(actualCash.value * 100) / 100,
        notes: closeNotes.value,
      },
    })
    closeShiftDialog.value = false
    toast.success('Shift closed — Z-Report generated')
    await loadData()
  } catch (e: any) {
    const data = e?.data || e?.response?._data || {}
    const msg = data.detail || Object.values(data).flat().join(', ') || 'Failed to close shift'
    toast.error(typeof msg === 'string' ? msg : 'Failed to close shift')
  } finally {
    actionLoading.value = false
  }
}

function openDetail(s: PosShift) {
  detailShift.value = s
  detailDialog.value = true
}

function printZReport() {
  const el = document.querySelector('.shifts-dialog')
  if (!el) return
  const win = window.open('', '_blank', 'width=400,height=600')
  if (!win) return
  win.document.write(`<html><head><title>Z-Report ${detailShift.value?.reference}</title><style>
    body { font-family: 'Segoe UI', monospace; margin: 0; padding: 20px; color: #1a1a1a; }
    h3 { margin: 0 0 4px; } .row { display: flex; justify-content: space-between; padding: 4px 0; }
    .bold { font-weight: bold; } hr { border: none; border-top: 1px dashed #ccc; }
  </style></head><body>${el.innerHTML}</body></html>`)
  win.document.close()
  setTimeout(() => win.print(), 250)
}

onMounted(loadData)
</script>

<style scoped>
/* ===== Page Shell ===== */
.shifts-page {
  padding: 0 0 24px 0;
  max-width: 1400px;
}

/* ===== Header ===== */
.shifts-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.shifts-header__left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.shifts-header__back {
  margin-top: -4px;
}
.shifts-header__title h1 {
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.shifts-header__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* ===== KPI Cards ===== */
.shifts-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
.shifts-kpi {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgb(var(--v-theme-surface));
  transition: box-shadow 0.2s;
}
.shifts-kpi:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.shifts-kpi__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  flex-shrink: 0;
}
.shifts-kpi__icon--primary { background: rgba(99, 102, 241, 0.12); color: rgb(99, 102, 241); }
.shifts-kpi__icon--success { background: rgba(76, 175, 80, 0.12); color: rgb(76, 175, 80); }
.shifts-kpi__icon--info    { background: rgba(33, 150, 243, 0.12); color: rgb(33, 150, 243); }
.shifts-kpi__icon--warn    { background: rgba(255, 152, 0, 0.12); color: rgb(255, 152, 0); }
.shifts-kpi__label { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.5); text-transform: uppercase; letter-spacing: 0.06em; }
.shifts-kpi__value { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; margin-top: 2px; }

/* ===== Active Shift Banner ===== */
.shifts-active {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.08), rgba(99, 102, 241, 0.06));
  border: 1px solid rgba(76, 175, 80, 0.2);
  margin-bottom: 20px;
}
.shifts-active__indicator {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.shifts-active__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgb(76, 175, 80);
}
.shifts-active__pulse {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgb(76, 175, 80);
  animation: pulse-ring 2s ease-out infinite;
}
@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(3); opacity: 0; }
}
.shifts-active__body { flex: 1; min-width: 0; }
.shifts-active__header { display: flex; align-items: center; gap: 8px; }
.shifts-active__ref { font-weight: 700; font-size: 1.05rem; }
.shifts-active__badge {
  font-size: 0.625rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgb(76, 175, 80);
  color: white;
  letter-spacing: 0.05em;
}
.shifts-active__meta { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.5); margin-top: 2px; }
.shifts-active__stats { display: flex; gap: 24px; }
.shifts-active__stat { display: flex; flex-direction: column; align-items: flex-end; }
.shifts-active__stat-label { font-size: 0.625rem; color: rgba(var(--v-theme-on-surface), 0.5); text-transform: uppercase; letter-spacing: 0.06em; }
.shifts-active__stat-value { font-weight: 700; font-size: 0.9rem; }

/* ===== Toolbar ===== */
.shifts-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.shifts-toolbar__search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface));
  min-width: 280px;
  transition: border-color 0.2s;
}
.shifts-toolbar__search:focus-within { border-color: rgb(var(--v-theme-primary)); }
.shifts-toolbar__icon { color: rgba(var(--v-theme-on-surface), 0.4); }
.shifts-toolbar__input {
  flex: 1;
  border: none;
  outline: none;
  padding: 10px 0;
  font-size: 0.875rem;
  background: transparent;
  color: inherit;
}
.shifts-toolbar__filters { display: flex; gap: 6px; }
.shifts-toolbar__pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.6);
  cursor: pointer;
  transition: all 0.2s;
}
.shifts-toolbar__pill:hover { border-color: rgba(var(--v-theme-primary), 0.3); color: rgb(var(--v-theme-primary)); }
.shifts-toolbar__pill--active {
  background: rgb(var(--v-theme-primary));
  color: white;
  border-color: rgb(var(--v-theme-primary));
}
.shifts-toolbar__pill-count {
  font-size: 0.6875rem;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(var(--v-theme-on-surface), 0.08);
}
.shifts-toolbar__pill--active .shifts-toolbar__pill-count {
  background: rgba(255, 255, 255, 0.2);
}

/* ===== Table ===== */
.shifts-table-wrap {
  border-radius: 14px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgb(var(--v-theme-surface));
  overflow: hidden;
}
.shifts-loading, .shifts-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}
.shifts-table {
  width: 100%;
  border-collapse: collapse;
}
.shifts-table thead th {
  text-align: left;
  padding: 12px 16px;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(var(--v-theme-on-surface), 0.5);
  background: rgba(var(--v-theme-on-surface), 0.02);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  white-space: nowrap;
}
.shifts-table th.text-right { text-align: right; }
.shifts-table tbody td {
  padding: 12px 16px;
  font-size: 0.8125rem;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.04);
}
.shifts-table__row { cursor: pointer; transition: background 0.15s; }
.shifts-table__row:hover { background: rgba(var(--v-theme-primary), 0.03); }
.shifts-table__row:last-child td { border-bottom: 0; }
.shifts-table__ref { font-weight: 600; font-size: 0.8125rem; }
.shifts-table__date { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.45); margin-top: 2px; }
.shifts-table__cashier { display: flex; align-items: center; gap: 8px; }
.shifts-table__cashier-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 700;
  flex-shrink: 0;
}
.shifts-table__variance { font-weight: 700; }
.shifts-table__variance--ok { color: rgb(76, 175, 80); }
.shifts-table__variance--bad { color: rgb(239, 83, 80); }
.shifts-table__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
}
.shifts-table__status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.shifts-table__status--open {
  background: rgba(76, 175, 80, 0.12);
  color: rgb(76, 175, 80);
}
.shifts-table__status--open .shifts-table__status-dot {
  background: rgb(76, 175, 80);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}
.shifts-table__status--closed {
  background: rgba(var(--v-theme-on-surface), 0.06);
  color: rgba(var(--v-theme-on-surface), 0.5);
}
.shifts-table__status--closed .shifts-table__status-dot {
  background: rgba(var(--v-theme-on-surface), 0.4);
}

/* ===== Pagination ===== */
.shifts-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
.shifts-pagination__info { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.5); }
.shifts-pagination__nav { display: flex; align-items: center; gap: 8px; }
.shifts-pagination__page { font-size: 0.8125rem; font-weight: 600; min-width: 60px; text-align: center; }

/* ===== Dialogs ===== */
.shifts-dialog {
  padding: 0;
  overflow: hidden;
}
.shifts-dialog__header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px;
}
.shifts-dialog__header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  color: white;
  flex-shrink: 0;
}
.shifts-dialog__header-icon--primary { background: linear-gradient(135deg, #6366f1, #4f46e5); }
.shifts-dialog__header-icon--warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
.shifts-dialog__body { padding: 20px 24px; }
.shifts-dialog__label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 6px;
}
.shifts-dialog__money-input {
  display: flex;
  align-items: center;
  border: 1.5px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.shifts-dialog__money-input:focus-within { border-color: rgb(var(--v-theme-primary)); }
.shifts-dialog__money-prefix {
  padding: 0 14px;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.5);
  font-size: 1rem;
}
.shifts-dialog__money-field {
  flex: 1;
  border: none;
  outline: none;
  padding: 12px 12px 12px 0;
  font-size: 1.1rem;
  font-weight: 700;
  background: transparent;
  color: inherit;
  width: 100%;
  min-height: 24px;
}
.shifts-dialog__money-field::-webkit-outer-spin-button,
.shifts-dialog__money-field::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.shifts-dialog__quick-buttons {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}
.shifts-dialog__quick-btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: transparent;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.shifts-dialog__quick-btn:hover {
  border-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.04);
}
.shifts-dialog__hint {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.45);
  margin-top: 14px;
}
.shifts-dialog__select {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 10px;
  font-size: 0.875rem;
  outline: none;
  background: transparent;
  color: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.shifts-dialog__select:focus { border-color: rgb(var(--v-theme-primary)); }
.shifts-dialog__textarea {
  width: 100%;
  border: 1.5px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 0.8125rem;
  outline: none;
  resize: vertical;
  background: transparent;
  color: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.shifts-dialog__textarea:focus { border-color: rgb(var(--v-theme-primary)); }
.shifts-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
}

/* ===== Z-Report preview in close dialog ===== */
.shifts-zreport__row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.shifts-zreport__row--bold {
  font-size: 0.9rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.9);
  padding-top: 10px;
}
.shifts-zreport__variance {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  margin-top: 14px;
}
.shifts-zreport__variance--ok {
  background: rgba(76, 175, 80, 0.08);
  color: rgb(46, 125, 50);
  border: 1px solid rgba(76, 175, 80, 0.15);
}
.shifts-zreport__variance--bad {
  background: rgba(239, 83, 80, 0.08);
  color: rgb(198, 40, 40);
  border: 1px solid rgba(239, 83, 80, 0.15);
}

/* ===== Detail / Z-Report Dialog ===== */
.shifts-detail__header {
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(var(--v-theme-surface), 0.02));
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.shifts-detail__header--closed {
  background: linear-gradient(135deg, rgba(var(--v-theme-on-surface), 0.04), rgba(var(--v-theme-surface), 0.02));
}
.shifts-detail__header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.shifts-detail__z-report {
  font-size: 0.625rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: rgba(var(--v-theme-on-surface), 0.4);
  text-transform: uppercase;
}
.shifts-detail__status-badge {
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.shifts-detail__status-badge--open {
  background: rgba(76, 175, 80, 0.14);
  color: rgb(46, 125, 50);
}
.shifts-detail__status-badge--closed {
  background: rgba(var(--v-theme-on-surface), 0.08);
  color: rgba(var(--v-theme-on-surface), 0.5);
}
.shifts-detail__header-meta {
  display: flex;
  gap: 16px;
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-top: 10px;
}
.shifts-detail__header-times {
  display: flex;
  gap: 16px;
  font-size: 0.6875rem;
  color: rgba(var(--v-theme-on-surface), 0.4);
  margin-top: 6px;
  flex-wrap: wrap;
}
.shifts-detail__body { padding: 20px 24px; }
.shifts-detail__section { margin-bottom: 18px; }
.shifts-detail__section:last-child { margin-bottom: 0; }
.shifts-detail__section-title {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(var(--v-theme-on-surface), 0.4);
  margin-bottom: 8px;
}
.shifts-detail__row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.shifts-detail__row--bold {
  font-weight: 700;
  font-size: 0.9rem;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  padding-top: 10px;
  margin-top: 4px;
}
.shifts-detail__notes {
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  white-space: pre-wrap;
}

/* ===== Responsive ===== */
@media (max-width: 960px) {
  .shifts-table { font-size: 0.75rem; }
  .shifts-table thead th, .shifts-table tbody td { padding: 8px 10px; }
  .shifts-table__cashier-badge { display: none; }
  .shifts-active { flex-wrap: wrap; }
  .shifts-active__stats { width: 100%; justify-content: space-around; margin-top: 8px; }
}
</style>

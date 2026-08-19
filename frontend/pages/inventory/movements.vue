<template>
  <v-container class="pa-0" fluid>
    <!-- Page header -->
    <v-row class="d-flex align-center justify-space-between mb-4">
      <v-col cols="12" sm="6">
        <div class="text-h5 font-weight-bold">Stock Movements</div>
        <div class="text-body-2 text-medium-emphasis">
          {{ stats.total }} movements · {{ stats.netIn }} units net in · {{ stats.netOut }} units net out
        </div>
      </v-col>
      <v-col cols="12" sm="6" class="d-flex justify-end ga-2 flex-wrap">
        <v-btn variant="outlined" prepend-icon="mdi-download" @click="exportCsv">Export</v-btn>
        <v-btn variant="outlined" prepend-icon="mdi-refresh" @click="loadMovements">Refresh</v-btn>
      </v-col>
    </v-row>

    <!-- Stat cards -->
    <v-row class="mb-4">
      <v-col cols="6" lg="3">
        <v-card class="pa-5 bg-surface" flat border
          style="border-top: 4px solid rgb(var(--v-theme-blue)) !important; border-radius: 10px !important;">
          <div class="d-flex align-start justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis text-uppercase">Total Movements</div>
              <div class="text-h5 font-weight-bold mt-2">{{ stats.total }}</div>
            </div>
            <v-avatar color="blue-lighten-5" rounded="lg" size="40">
              <v-icon color="blue">mdi-swap-horizontal</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" lg="3">
        <v-card class="pa-5 bg-surface" flat border
          style="border-top: 4px solid rgb(var(--v-theme-green)) !important; border-radius: 10px !important;">
          <div class="d-flex align-start justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis text-uppercase">Units In</div>
              <div class="text-h5 font-weight-bold text-success mt-2">+{{ formatNumber(stats.totalIn) }}</div>
            </div>
            <v-avatar color="green-lighten-5" rounded="lg" size="40">
              <v-icon color="green">mdi-trending-up</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" lg="3">
        <v-card class="pa-5 bg-surface" flat border
          style="border-top: 4px solid rgb(var(--v-theme-red)) !important; border-radius: 10px !important;">
          <div class="d-flex align-start justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis text-uppercase">Units Out</div>
              <div class="text-h5 font-weight-bold text-error mt-2">-{{ formatNumber(stats.totalOut) }}</div>
            </div>
            <v-avatar color="red-lighten-5" rounded="lg" size="40">
              <v-icon color="red">mdi-trending-down</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" lg="3">
        <v-card class="pa-5 bg-surface" flat border
          style="border-top: 4px solid rgb(var(--v-theme-deep-purple)) !important; border-radius: 10px !important;">
          <div class="d-flex align-start justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis text-uppercase">Net Change</div>
              <div class="text-h5 font-weight-bold mt-2" :class="stats.netChangeColor">{{ formatNumber(stats.netChange) }}</div>
            </div>
            <v-avatar color="deep-purple-lighten-5" rounded="lg" size="40">
              <v-icon color="deep-purple">mdi-scale-balance</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Toolbar -->
    <v-card rounded="xl" class="pa-4 mb-4" flat border>
      <v-row density="comfortable">
        <v-col cols="12" lg="5">
          <v-text-field
            v-model="searchQuery"
            placeholder="Search by product, SKU, reference..."
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="6" lg="2">
          <v-select
            v-model="filterType"
            :items="typeFilterItems"
            item-title="title"
            item-value="value"
            label="All Types"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="6" lg="2">
          <v-select
            v-model="filterBranch"
            :items="branchItems"
            item-title="name"
            item-value="code"
            label="All Branches"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="6" lg="2">
          <v-select
            v-model="datePreset"
            :items="datePresetItems"
            item-title="title"
            item-value="value"
            label="All Dates"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />
        </v-col>
        <template v-if="datePreset === 'custom'">
          <v-col cols="6" lg="2">
            <v-text-field
              v-model="dateFrom"
              type="date"
              label="From"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="6" lg="2">
            <v-text-field
              v-model="dateTo"
              type="date"
              label="To"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
        </template>
        <v-col cols="6" lg="2">
          <v-select
            v-model="sortBy"
            :items="sortItems"
            item-title="title"
            item-value="value"
            label="Sort"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Active filters -->
    <div v-if="hasActiveFilters" class="d-flex align-center flex-wrap ga-2 mb-4">
      <span class="text-body-2 text-medium-emphasis">Filters:</span>
      <v-chip v-if="searchQuery" size="small" color="primary" closable @click:close="searchQuery = ''">
        Search: "{{ searchQuery }}"
      </v-chip>
      <v-chip v-if="filterType" size="small" color="indigo" closable @click:close="filterType = ''">
        Type: {{ typeLabel(filterType) }}
      </v-chip>
      <v-chip v-if="filterBranch" size="small" color="teal" closable @click:close="filterBranch = ''">
        Branch: {{ filterBranch }}
      </v-chip>
      <v-chip v-if="datePreset && datePreset !== 'custom'" size="small" color="cyan" closable @click:close="datePreset = ''">
        {{ datePresetLabel }}
      </v-chip>
      <template v-if="datePreset === 'custom'">
        <v-chip v-if="dateFrom" size="small" color="cyan" closable @click:close="dateFrom = ''">
          From: {{ dateFrom }}
        </v-chip>
        <v-chip v-if="dateTo" size="small" color="cyan" closable @click:close="dateTo = ''">
          To: {{ dateTo }}
        </v-chip>
      </template>
      <v-btn variant="text" size="small" color="error" @click="clearAllFilters">Clear all</v-btn>
    </div>

    <!-- Loading -->
    <v-card v-if="loading" flat border rounded="xl" class="py-16 d-flex flex-column align-center justify-center ga-4">
      <v-progress-circular indeterminate color="primary" size="48" width="4" />
      <div class="text-body-2 text-medium-emphasis">Loading movements...</div>
    </v-card>

    <!-- Empty -->
    <v-card v-else-if="filteredMovements.length === 0" flat border rounded="xl" class="py-16 text-center">
      <v-avatar color="blue-lighten-5" size="80" class="mb-4">
        <v-icon color="blue" size="40">mdi-swap-horizontal</v-icon>
      </v-avatar>
      <div class="text-h6 font-weight-bold mb-1">No movements found</div>
      <div class="text-body-2 text-medium-emphasis">
        {{ hasActiveFilters ? 'Try adjusting your filters.' : 'Stock movements will appear here once recorded.' }}
      </div>
    </v-card>

    <!-- Table -->
    <v-card v-else flat border rounded="xl" class="overflow-hidden">
      <v-table density="compact" hover>
        <thead class="bg-grey-lighten-4">
          <tr>
            <th class="text-center" style="width: 52px;">#</th>
            <th class="text-left" style="min-width: 180px;">Product</th>
            <th class="text-left">Branch</th>
            <th class="text-left">Type</th>
            <th class="text-right">Qty Change</th>
            <th class="text-right">After</th>
            <th class="text-left">Reference</th>
            <th class="text-left">By</th>
            <th class="text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(m, idx) in pagedMovements" :key="m.id">
            <td class="text-center text-caption text-disabled font-weight-bold">
              {{ rowNumber(idx) }}
            </td>
            <td>
              <div class="d-flex align-center ga-2">
                <v-avatar size="32" rounded="lg" :color="typeColor(m.movement_type)" variant="tonal">
                  <v-icon size="18" :icon="typeIcon(m.movement_type)" />
                </v-avatar>
                <div>
                  <div class="text-body-2 font-weight-bold">{{ m.product_name }}</div>
                  <div class="text-caption text-disabled">{{ m.product_sku }}</div>
                </div>
              </div>
            </td>
            <td class="text-body-2">{{ m.branch_code }}</td>
            <td>
              <v-chip size="small" :color="typeColor(m.movement_type)" variant="tonal" class="text-capitalize">
                {{ m.movement_type_display || m.movement_type }}
              </v-chip>
            </td>
            <td class="text-right">
              <span class="font-weight-bold" :class="qtyClass(m.quantity_change)">
                {{ parseFloat(m.quantity_change) > 0 ? '+' : '' }}{{ formatNumber(m.quantity_change) }}
              </span>
            </td>
            <td class="text-right text-body-2">{{ formatNumber(m.quantity_after) }}</td>
            <td>
              <span v-if="m.reference" class="text-body-2 font-mono">{{ m.reference }}</span>
              <span v-else class="text-disabled">—</span>
            </td>
            <td class="text-body-2 text-medium-emphasis">{{ m.performed_by_name || '—' }}</td>
            <td class="text-body-2 text-medium-emphasis">{{ datetime(m.created_at) }}</td>
          </tr>
        </tbody>
      </v-table>

      <!-- Pagination -->
      <PaginationBar
        :count="filteredMovements.length"
        :next="currentPage < totalPages ? 'yes' : null"
        :previous="currentPage > 1 ? 'yes' : null"
        :page="currentPage"
        :pageSize="pageSize"
        :totalPages="totalPages"
        @page-change="currentPage = $event"
      />
    </v-card>
  </v-container>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const { datetime, number: formatNumber } = useFormat()
const toast = useToast()

const loading = ref(false)
const movements = ref([])
const searchQuery = ref('')
const filterType = ref('')
const filterBranch = ref('')
const datePreset = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const sortBy = ref('-created_at')
const currentPage = ref(1)
const pageSize = 20

// Derived branch list from loaded movements
const branchItems = computed(() => {
  const seen = new Map()
  for (const m of movements.value) {
    if (m.branch_code && !seen.has(m.branch_code)) {
      seen.set(m.branch_code, { code: m.branch_code, name: m.branch_code })
    }
  }
  return Array.from(seen.values())
})

const typeFilterItems = [
  { title: 'Purchase / Receive', value: 'purchase' },
  { title: 'Sale', value: 'sale' },
  { title: 'Return', value: 'return' },
  { title: 'Adjustment', value: 'adjustment' },
  { title: 'Transfer Out', value: 'transfer_out' },
  { title: 'Transfer In', value: 'transfer_in' },
  { title: 'Damage / Write-off', value: 'damage' },
  { title: 'Initial Stock', value: 'initial' },
]

const sortItems = [
  { title: 'Sort: Newest First', value: '-created_at' },
  { title: 'Sort: Oldest First', value: 'created_at' },
]

const datePresetItems = [
  { title: 'Today', value: 'today' },
  { title: 'Yesterday', value: 'yesterday' },
  { title: 'Last 7 Days', value: 'last_7d' },
  { title: 'Last 30 Days', value: 'last_30d' },
  { title: 'This Month', value: 'this_month' },
  { title: 'Last Month', value: 'last_month' },
  { title: 'This Year', value: 'this_year' },
  { title: 'Custom Range', value: 'custom' },
]

const datePresetLabel = computed(() =>
  datePresetItems.find(p => p.value === datePreset.value)?.title || '',
)

const dateRange = computed(() => {
  if (!datePreset.value) {
    // If preset is empty but custom dates exist, use them
    if (dateFrom.value || dateTo.value) {
      return {
        from: dateFrom.value ? new Date(dateFrom.value) : null,
        to: dateTo.value ? new Date(dateTo.value) : null,
      }
    }
    return { from: null, to: null }
  }
  if (datePreset.value === 'custom') {
    return {
      from: dateFrom.value ? new Date(dateFrom.value) : null,
      to: dateTo.value ? new Date(dateTo.value) : null,
    }
  }
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let from = null
  let to = new Date(now)
  to.setHours(23, 59, 59, 999)
  switch (datePreset.value) {
    case 'today':
      from = new Date(today)
      from.setHours(0, 0, 0, 0)
      break
    case 'yesterday': {
      from = new Date(today)
      from.setDate(from.getDate() - 1)
      from.setHours(0, 0, 0, 0)
      to = new Date(today)
      to.setDate(to.getDate() - 1)
      to.setHours(23, 59, 59, 999)
      break
    }
    case 'last_7d':
      from = new Date(today)
      from.setDate(from.getDate() - 6)
      from.setHours(0, 0, 0, 0)
      break
    case 'last_30d':
      from = new Date(today)
      from.setDate(from.getDate() - 29)
      from.setHours(0, 0, 0, 0)
      break
    case 'this_month':
      from = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0)
      break
    case 'last_month':
      from = new Date(today.getFullYear(), today.getMonth() - 1, 1, 0, 0, 0, 0)
      to = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999)
      break
    case 'this_year':
      from = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0)
      break
  }
  return { from, to }
})

const hasActiveFilters = computed(() => !!(searchQuery.value || filterType.value || filterBranch.value || datePreset.value))

// Client-side filtering + sorting on top of server data
const filteredMovements = computed(() => {
  let list = [...movements.value]
  const q = searchQuery.value?.toLowerCase().trim()
  if (q) {
    list = list.filter(m =>
      (m.product_name || '').toLowerCase().includes(q) ||
      (m.product_sku || '').toLowerCase().includes(q) ||
      (m.reference || '').toLowerCase().includes(q),
    )
  }
  if (filterType.value) list = list.filter(m => m.movement_type === filterType.value)
  if (filterBranch.value) list = list.filter(m => m.branch_code === filterBranch.value)
  const { from, to } = dateRange.value
  if (from) list = list.filter(m => new Date(m.created_at) >= from)
  if (to) list = list.filter(m => new Date(m.created_at) <= to)
  if (sortBy.value === 'created_at') list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  else list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return list
})

const totalPages = computed(() => Math.ceil(filteredMovements.value.length / pageSize) || 1)
const pagedMovements = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredMovements.value.slice(start, start + pageSize)
})

const stats = computed(() => {
  const total = movements.value.length
  let totalIn = 0
  let totalOut = 0
  for (const m of movements.value) {
    const qty = parseFloat(m.quantity_change) || 0
    if (qty > 0) totalIn += qty
    else totalOut += Math.abs(qty)
  }
  const netChange = totalIn - totalOut
  return {
    total,
    totalIn,
    totalOut,
    netIn: totalIn,
    netOut: totalOut,
    netChange,
    netChangeColor: netChange > 0 ? 'text-success' : netChange < 0 ? 'text-error' : '',
  }
})

// --- API ---
async function loadMovements() {
  loading.value = true
  try {
    const data = await useApi()('/inventory/movements/?page_size=500')
    movements.value = data.results || data
  } catch {
    toast.error('Failed to load stock movements')
  } finally {
    loading.value = false
  }
}

// --- Helpers ---
const TYPE_COLORS = {
  purchase: 'green',
  sale: 'blue',
  return: 'amber',
  adjustment: 'deep-purple',
  transfer_out: 'orange',
  transfer_in: 'teal',
  damage: 'red',
  initial: 'indigo',
}
function typeColor(type) {
  return TYPE_COLORS[type] || 'grey'
}

const TYPE_ICONS = {
  purchase: 'mdi-package-plus',
  sale: 'mdi-point-of-sale',
  return: 'mdi-keyboard-backspace',
  adjustment: 'mdi-clipboard-edit-outline',
  transfer_out: 'mdi-arrow-top-right',
  transfer_in: 'mdi-arrow-bottom-left',
  damage: 'mdi-alert-circle-outline',
  initial: 'mdi-clock-alert-outline',
}
function typeIcon(type) {
  return TYPE_ICONS[type] || 'mdi-swap-horizontal'
}

function qtyClass(qty) {
  const v = parseFloat(qty) || 0
  if (v > 0) return 'text-success'
  if (v < 0) return 'text-error'
  return ''
}

function typeLabel(value) {
  return typeFilterItems.find(t => t.value === value)?.title || value
}

function clearAllFilters() {
  searchQuery.value = ''
  filterType.value = ''
  filterBranch.value = ''
  datePreset.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  sortBy.value = '-created_at'
  currentPage.value = 1
}

function rowNumber(idx) {
  return (currentPage.value - 1) * pageSize + idx + 1
}

function exportCsv() {
  const rows = filteredMovements.value
  if (rows.length === 0) {
    toast.info('Nothing to export')
    return
  }
  const header = ['Date', 'Product', 'SKU', 'Branch', 'Type', 'Qty Change', 'After', 'Reference', 'Performed By', 'Notes']
  const lines = [header.join(',')]
  for (const r of rows) {
    const cells = [
      r.created_at || '',
      `"${(r.product_name || '').replace(/"/g, '""')}"`,
      r.product_sku || '',
      r.branch_code || '',
      r.movement_type_display || r.movement_type || '',
      r.quantity_change ?? '',
      r.quantity_after ?? '',
      `"${(r.reference || '').replace(/"/g, '""')}"`,
      `"${(r.performed_by_name || '').replace(/"/g, '""')}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]
    lines.push(cells.join(','))
  }
  const csv = lines.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `stock-movements-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('Exported to CSV')
}

// Reset to page 1 when filters change
watch([searchQuery, filterType, filterBranch, datePreset, dateFrom, dateTo, sortBy], () => {
  currentPage.value = 1
})

onMounted(loadMovements)
</script>

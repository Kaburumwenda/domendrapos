<template>
  <v-container class="pa-0" fluid>
    <!-- Page header -->
    <v-row class="d-flex align-center justify-space-between mb-4">
      <v-col cols="12" sm="6">
        <div class="text-h5 font-weight-bold">Stock on Hand</div>
        <div class="text-body-2 text-medium-emphasis">
          {{ stats.totalSkus }} SKUs · {{ formatNumber(stats.totalUnits) }} units · {{ currency(stats.stockValue) }} value
        </div>
      </v-col>
      <v-col cols="12" sm="6" class="d-flex justify-end ga-2 flex-wrap">
        <v-btn variant="outlined" prepend-icon="mdi-download" @click="exportCsv">Export</v-btn>
        <v-btn variant="outlined" prepend-icon="mdi-refresh" @click="loadStock">Refresh</v-btn>
      </v-col>
    </v-row>

    <!-- Stat cards -->
    <v-row class="mb-4">
      <v-col cols="6" lg="3">
        <v-card class="pa-5 bg-surface" flat border
          style="border-top: 4px solid rgb(var(--v-theme-blue)) !important; border-radius: 10px !important;">
          <div class="d-flex align-start justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis text-uppercase">Total SKUs</div>
              <div class="text-h5 font-weight-bold mt-2">{{ stats.totalSkus }}</div>
            </div>
            <v-avatar color="blue-lighten-5" rounded="lg" size="40">
              <v-icon color="blue">mdi-package-variant-closed</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" lg="3">
        <v-card class="pa-5 bg-surface" flat border
          style="border-top: 4px solid rgb(var(--v-theme-teal)) !important; border-radius: 10px !important;">
          <div class="d-flex align-start justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis text-uppercase">Total Units</div>
              <div class="text-h5 font-weight-bold mt-2">{{ formatNumber(stats.totalUnits) }}</div>
            </div>
            <v-avatar color="teal-lighten-5" rounded="lg" size="40">
              <v-icon color="teal">mdi-counter</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" lg="3">
        <v-card class="pa-5 bg-surface" flat border
          style="border-top: 4px solid rgb(var(--v-theme-green)) !important; border-radius: 10px !important;">
          <div class="d-flex align-start justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis text-uppercase">Stock Value</div>
              <div class="text-h5 font-weight-bold mt-2">{{ currency(stats.stockValue) }}</div>
            </div>
            <v-avatar color="green-lighten-5" rounded="lg" size="40">
              <v-icon color="green">mdi-cash</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" lg="3">
        <v-card class="pa-5 bg-surface" flat border
          style="border-top: 4px solid rgb(var(--v-theme-red)) !important; border-radius: 10px !important;">
          <div class="d-flex align-start justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis text-uppercase">Low / Out of Stock</div>
              <div class="text-h5 font-weight-bold text-error mt-2">{{ stats.lowStockCount }}</div>
            </div>
            <v-avatar color="red-lighten-5" rounded="lg" size="40">
              <v-icon color="red">mdi-alert</v-icon>
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
            placeholder="Search by product, SKU, bin location..."
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="6" lg="3">
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
            v-model="filterStatus"
            :items="statusItems"
            item-title="title"
            item-value="value"
            label="All Status"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />
        </v-col>
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
      <v-chip v-if="filterBranch" size="small" color="teal" closable @click:close="filterBranch = ''">
        Branch: {{ filterBranch }}
      </v-chip>
      <v-chip v-if="filterStatus" size="small" color="indigo" closable @click:close="filterStatus = ''">
        Status: {{ statusLabel(filterStatus) }}
      </v-chip>
      <v-btn variant="text" size="small" color="error" @click="clearAllFilters">Clear all</v-btn>
    </div>

    <!-- Loading -->
    <v-card v-if="loading" flat border rounded="xl" class="py-16 d-flex flex-column align-center justify-center ga-4">
      <v-progress-circular indeterminate color="primary" size="48" width="4" />
      <div class="text-body-2 text-medium-emphasis">Loading stock items...</div>
    </v-card>

    <!-- Empty -->
    <v-card v-else-if="filteredItems.length === 0" flat border rounded="xl" class="py-16 text-center">
      <v-avatar color="blue-lighten-5" size="80" class="mb-4">
        <v-icon color="blue" size="40">mdi-package-variant-removed</v-icon>
      </v-avatar>
      <div class="text-h6 font-weight-bold mb-1">No stock items found</div>
      <div class="text-body-2 text-medium-emphasis">
        {{ hasActiveFilters ? 'Try adjusting your filters.' : 'Stock items will appear here once products are stocked.' }}
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
            <th class="text-left">Bin</th>
            <th class="text-right">On Hand</th>
            <th class="text-right">Reserved</th>
            <th class="text-right">Available</th>
            <th class="text-right">Reorder Lvl</th>
            <th class="text-left">Category</th>
            <th class="text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in pagedItems" :key="item.id">
            <td class="text-center text-caption text-disabled font-weight-bold">
              {{ rowNumber(idx) }}
            </td>
            <td>
              <div class="d-flex align-center ga-2">
                <v-avatar size="32" rounded="lg" :color="statusColor(item)" variant="tonal">
                  <v-icon size="18" :icon="statusIcon(item)" />
                </v-avatar>
                <div>
                  <div class="text-body-2 font-weight-bold">{{ item.product_name }}</div>
                  <div class="text-caption text-disabled">{{ item.product_sku }}</div>
                </div>
              </div>
            </td>
            <td class="text-body-2">{{ item.branch_code }}</td>
            <td>
              <span v-if="item.bin_location" class="text-body-2 font-mono">{{ item.bin_location }}</span>
              <span v-else class="text-disabled">—</span>
            </td>
            <td class="text-right font-weight-bold text-body-2">{{ formatNumber(item.quantity_on_hand) }}</td>
            <td class="text-right text-body-2 text-medium-emphasis">{{ formatNumber(item.quantity_reserved) }}</td>
            <td class="text-right">
              <span class="font-weight-bold" :class="availableClass(item)">
                {{ formatNumber(item.quantity_available) }}
              </span>
            </td>
            <td class="text-right text-body-2 text-medium-emphasis">{{ formatNumber(item.reorder_level) }}</td>
            <td>
              <v-chip v-if="item.product_category" size="small" variant="tonal" color="grey">
                {{ item.product_category }}
              </v-chip>
              <span v-else class="text-disabled">—</span>
            </td>
            <td>
              <v-chip size="small" :color="statusColor(item)" variant="tonal" label>
                <v-icon size="14" start :icon="statusIcon(item)" />
                {{ statusLabel2(item) }}
              </v-chip>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Pagination -->
      <PaginationBar
        :count="filteredItems.length"
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

const { currency, number: formatNumber } = useFormat()
const toast = useToast()

const loading = ref(false)
const stockItems = ref([])
const searchQuery = ref('')
const filterBranch = ref('')
const filterStatus = ref('')
const sortBy = ref('product_name')
const currentPage = ref(1)
const pageSize = 20

// Derived branch list from loaded items
const branchItems = computed(() => {
  const seen = new Map()
  for (const item of stockItems.value) {
    if (item.branch_code && !seen.has(item.branch_code)) {
      seen.set(item.branch_code, { code: item.branch_code, name: item.branch_name || item.branch_code })
    }
  }
  return Array.from(seen.values())
})

const statusItems = [
  { title: 'In Stock', value: 'in_stock' },
  { title: 'Low Stock', value: 'low_stock' },
  { title: 'Out of Stock', value: 'out_of_stock' },
]

const sortItems = [
  { title: 'Sort: Product Name (A-Z)', value: 'product_name' },
  { title: 'Sort: Product Name (Z-A)', value: '-product_name' },
  { title: 'Sort: Most Stock', value: '-quantity_on_hand' },
  { title: 'Sort: Least Stock', value: 'quantity_on_hand' },
  { title: 'Sort: Highest Value', value: '-stock_value' },
]

const hasActiveFilters = computed(() => !!(searchQuery.value || filterBranch.value || filterStatus.value))

function itemStatus(item) {
  const qty = parseFloat(item.quantity_on_hand) || 0
  if (qty <= 0) return 'out_of_stock'
  if (item.needs_reorder) return 'low_stock'
  return 'in_stock'
}

// Client-side filtering + sorting
const filteredItems = computed(() => {
  let list = stockItems.value.map(item => ({
    ...item,
    stock_value: (parseFloat(item.quantity_on_hand) || 0) * (parseFloat(item.cost_price) || 0),
  }))

  const q = searchQuery.value?.toLowerCase().trim()
  if (q) {
    list = list.filter(item =>
      (item.product_name || '').toLowerCase().includes(q) ||
      (item.product_sku || '').toLowerCase().includes(q) ||
      (item.bin_location || '').toLowerCase().includes(q),
    )
  }
  if (filterBranch.value) list = list.filter(item => item.branch_code === filterBranch.value)
  if (filterStatus.value) list = list.filter(item => itemStatus(item) === filterStatus.value)

  switch (sortBy.value) {
    case 'product_name':
      list.sort((a, b) => (a.product_name || '').localeCompare(b.product_name || ''))
      break
    case '-product_name':
      list.sort((a, b) => (b.product_name || '').localeCompare(a.product_name || ''))
      break
    case '-quantity_on_hand':
      list.sort((a, b) => (parseFloat(b.quantity_on_hand) || 0) - (parseFloat(a.quantity_on_hand) || 0))
      break
    case 'quantity_on_hand':
      list.sort((a, b) => (parseFloat(a.quantity_on_hand) || 0) - (parseFloat(b.quantity_on_hand) || 0))
      break
    case '-stock_value':
      list.sort((a, b) => (b.stock_value || 0) - (a.stock_value || 0))
      break
  }
  return list
})

const totalPages = computed(() => Math.ceil(filteredItems.value.length / pageSize) || 1)
const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredItems.value.slice(start, start + pageSize)
})

const stats = computed(() => {
  const totalSkus = stockItems.value.length
  let totalUnits = 0
  let stockValue = 0
  let lowStockCount = 0
  for (const item of stockItems.value) {
    const qty = parseFloat(item.quantity_on_hand) || 0
    const cost = parseFloat(item.cost_price) || 0
    totalUnits += qty
    stockValue += qty * cost
    if (item.needs_reorder) lowStockCount++
  }
  return { totalSkus, totalUnits, stockValue, lowStockCount }
})

// --- API ---
async function loadStock() {
  loading.value = true
  try {
    const data = await useApi()('/inventory/items/?page_size=500')
    stockItems.value = data.results || data
  } catch {
    toast.error('Failed to load stock items')
  } finally {
    loading.value = false
  }
}

// --- Helpers ---
function statusColor(item) {
  const s = itemStatus(item)
  if (s === 'out_of_stock') return 'red'
  if (s === 'low_stock') return 'amber'
  return 'green'
}

function statusIcon(item) {
  const s = itemStatus(item)
  if (s === 'out_of_stock') return 'mdi-close-circle'
  if (s === 'low_stock') return 'mdi-alert'
  return 'mdi-check-circle'
}

function statusLabel(value) {
  return statusItems.find(s => s.value === value)?.title || value
}

function statusLabel2(item) {
  return statusLabel(itemStatus(item))
}

function availableClass(item) {
  const avail = parseFloat(item.quantity_available) || 0
  if (avail <= 0) return 'text-error'
  if (item.needs_reorder) return 'text-warning'
  return 'text-success'
}

function rowNumber(idx) {
  return (currentPage.value - 1) * pageSize + idx + 1
}

function clearAllFilters() {
  searchQuery.value = ''
  filterBranch.value = ''
  filterStatus.value = ''
  sortBy.value = 'product_name'
  currentPage.value = 1
}

function exportCsv() {
  const rows = filteredItems.value
  if (rows.length === 0) {
    toast.info('Nothing to export')
    return
  }
  const header = ['Product', 'SKU', 'Branch', 'Category', 'On Hand', 'Reserved', 'Available', 'Reorder Level', 'Bin Location', 'Cost Price', 'Stock Value', 'Status']
  const lines = [header.join(',')]
  for (const r of rows) {
    const cells = [
      `"${(r.product_name || '').replace(/"/g, '""')}"`,
      r.product_sku || '',
      r.branch_code || '',
      `"${(r.product_category || '').replace(/"/g, '""')}"`,
      r.quantity_on_hand ?? '',
      r.quantity_reserved ?? '',
      r.quantity_available ?? '',
      r.reorder_level ?? '',
      `"${(r.bin_location || '').replace(/"/g, '""')}"`,
      r.cost_price ?? '',
      (r.stock_value ?? 0).toFixed(2),
      statusLabel(itemStatus(r)),
    ]
    lines.push(cells.join(','))
  }
  const csv = lines.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `stock-on-hand-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('Exported to CSV')
}

watch([searchQuery, filterBranch, filterStatus, sortBy], () => {
  currentPage.value = 1
})

onMounted(loadStock)
</script>

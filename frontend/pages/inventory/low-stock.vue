<template>
  <v-container class="pa-0" fluid>
    <!-- Page header -->
    <v-row class="d-flex align-center justify-space-between mb-4">
      <v-col cols="12" sm="6">
        <div class="text-h5 font-weight-bold">Low Stock Alerts</div>
        <div class="text-body-2 text-medium-emphasis">
          {{ stats.totalAlerts }} items need attention · {{ stats.outOfStock }} out of stock · {{ stats.lowStock }} low stock
        </div>
      </v-col>
      <v-col cols="12" sm="6" class="d-flex justify-end ga-2 flex-wrap">
        <v-btn variant="outlined" prepend-icon="mdi-download" @click="exportCsv">Export</v-btn>
        <v-btn variant="outlined" prepend-icon="mdi-refresh" @click="loadLowStock">Refresh</v-btn>
      </v-col>
    </v-row>

    <!-- Stat cards -->
    <v-row class="mb-4">
      <v-col cols="6" lg="3">
        <v-card class="pa-5 bg-surface" flat border
          style="border-top: 4px solid rgb(var(--v-theme-red)) !important; border-radius: 10px !important;">
          <div class="d-flex align-start justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis text-uppercase">Total Alerts</div>
              <div class="text-h5 font-weight-bold text-error mt-2">{{ stats.totalAlerts }}</div>
            </div>
            <v-avatar color="red-lighten-5" rounded="lg" size="40">
              <v-icon color="red">mdi-bell-alert</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" lg="3">
        <v-card class="pa-5 bg-surface" flat border
          style="border-top: 4px solid rgb(var(--v-theme-deep-orange)) !important; border-radius: 10px !important;">
          <div class="d-flex align-start justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis text-uppercase">Out of Stock</div>
              <div class="text-h5 font-weight-bold text-error mt-2">{{ stats.outOfStock }}</div>
            </div>
            <v-avatar color="deep-orange-lighten-5" rounded="lg" size="40">
              <v-icon color="deep-orange">mdi-package-variant-closed</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" lg="3">
        <v-card class="pa-5 bg-surface" flat border
          style="border-top: 4px solid rgb(var(--v-theme-amber)) !important; border-radius: 10px !important;">
          <div class="d-flex align-start justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis text-uppercase">Low Stock</div>
              <div class="text-h5 font-weight-bold text-warning mt-2">{{ stats.lowStock }}</div>
            </div>
            <v-avatar color="amber-lighten-5" rounded="lg" size="40">
              <v-icon color="amber">mdi-alert</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" lg="3">
        <v-card class="pa-5 bg-surface" flat border
          style="border-top: 4px solid rgb(var(--v-theme-orange)) !important; border-radius: 10px !important;">
          <div class="d-flex align-start justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis text-uppercase">Reorder Qty Needed</div>
              <div class="text-h5 font-weight-bold mt-2">{{ formatNumber(stats.reorderQty) }}</div>
            </div>
            <v-avatar color="orange-lighten-5" rounded="lg" size="40">
              <v-icon color="orange">mdi-cart-plus</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-card v-if="loading" flat border rounded="xl" class="py-16 d-flex flex-column align-center justify-center ga-4">
      <v-progress-circular indeterminate color="primary" size="48" width="4" />
      <div class="text-body-2 text-medium-emphasis">Loading alerts...</div>
    </v-card>

    <!-- Empty -->
    <v-card v-else-if="filteredItems.length === 0" flat border rounded="xl" class="py-16 text-center">
      <v-avatar color="green-lighten-5" size="80" class="mb-4">
        <v-icon color="green" size="40">mdi-check-circle</v-icon>
      </v-avatar>
      <div class="text-h6 font-weight-bold mb-1">All good!</div>
      <div class="text-body-2 text-medium-emphasis">
        {{ hasActiveFilters ? 'No items match your filters.' : 'No products are below their reorder level.' }}
      </div>
    </v-card>

    <template v-else>
      <!-- Toolbar -->
      <v-card rounded="xl" class="pa-4 mb-4" flat border>
        <v-row density="comfortable">
          <v-col cols="12" lg="6">
            <v-text-field
              v-model="searchQuery"
              placeholder="Search by product, SKU..."
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
          <v-col cols="6" lg="3">
            <v-select
              v-model="filterSeverity"
              :items="severityItems"
              item-title="title"
              item-value="value"
              label="All Severity"
              variant="outlined"
              density="compact"
              hide-details
              clearable
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
        <v-chip v-if="filterSeverity" size="small" color="red" closable @click:close="filterSeverity = ''">
          Severity: {{ severityLabel(filterSeverity) }}
        </v-chip>
        <v-btn variant="text" size="small" color="error" @click="clearAllFilters">Clear all</v-btn>
      </div>

      <!-- Table -->
      <v-card flat border rounded="xl" class="overflow-hidden">
        <v-table density="compact" hover>
          <thead class="bg-grey-lighten-4">
            <tr>
              <th class="text-center" style="width: 52px;">#</th>
              <th class="text-left" style="min-width: 180px;">Product</th>
              <th class="text-left">Branch</th>
              <th class="text-right">On Hand</th>
              <th class="text-right">Reorder Lvl</th>
              <th class="text-right">Reorder Qty</th>
              <th class="text-right">Shortfall</th>
              <th class="text-left">Category</th>
              <th class="text-left">Severity</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in pagedItems" :key="item.id">
              <td class="text-center text-caption text-disabled font-weight-bold">
                {{ rowNumber(idx) }}
              </td>
              <td>
                <div class="d-flex align-center ga-2">
                  <v-avatar size="32" rounded="lg" :color="severityColor(item)" variant="tonal">
                    <v-icon size="18" :icon="severityIcon(item)" />
                  </v-avatar>
                  <div>
                    <div class="text-body-2 font-weight-bold">{{ item.product_name }}</div>
                    <div class="text-caption text-disabled">{{ item.product_sku }}</div>
                  </div>
                </div>
              </td>
              <td class="text-body-2">{{ item.branch_code }}</td>
              <td class="text-right">
                <span class="font-weight-bold" :class="onHandClass(item)">
                  {{ formatNumber(item.quantity_on_hand) }}
                </span>
              </td>
              <td class="text-right text-body-2 text-medium-emphasis">{{ formatNumber(item.reorder_level) }}</td>
              <td class="text-right text-body-2">{{ formatNumber(item.reorder_quantity) }}</td>
              <td class="text-right">
                <span class="font-weight-bold text-error">{{ formatNumber(shortfall(item)) }}</span>
              </td>
              <td>
                <v-chip v-if="item.product_category" size="small" variant="tonal" color="grey">
                  {{ item.product_category }}
                </v-chip>
                <span v-else class="text-disabled">—</span>
              </td>
              <td>
                <v-chip size="small" :color="severityColor(item)" variant="tonal" label>
                  <v-icon size="14" start :icon="severityIcon(item)" />
                  {{ severityLabel2(item) }}
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
    </template>
  </v-container>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const { number: formatNumber } = useFormat()
const toast = useToast()

const loading = ref(false)
const lowStockItems = ref([])
const searchQuery = ref('')
const filterBranch = ref('')
const filterSeverity = ref('')
const currentPage = ref(1)
const pageSize = 20

// Derived branch list
const branchItems = computed(() => {
  const seen = new Map()
  for (const item of lowStockItems.value) {
    if (item.branch_code && !seen.has(item.branch_code)) {
      seen.set(item.branch_code, { code: item.branch_code, name: item.branch_name || item.branch_code })
    }
  }
  return Array.from(seen.values())
})

const severityItems = [
  { title: 'Out of Stock', value: 'out_of_stock' },
  { title: 'Critical', value: 'critical' },
  { title: 'Low', value: 'low' },
]

const hasActiveFilters = computed(() => !!(searchQuery.value || filterBranch.value || filterSeverity.value))

function itemSeverity(item) {
  const qty = parseFloat(item.quantity_on_hand) || 0
  const reorder = parseFloat(item.reorder_level) || 0
  if (qty <= 0) return 'out_of_stock'
  // Critical = at or below 50% of reorder level
  if (qty <= reorder * 0.5) return 'critical'
  return 'low'
}

function shortfall(item) {
  const qty = parseFloat(item.quantity_on_hand) || 0
  const reorder = parseFloat(item.reorder_level) || 0
  return Math.max(0, reorder - qty)
}

// Client-side filtering
const filteredItems = computed(() => {
  let list = [...lowStockItems.value]
  const q = searchQuery.value?.toLowerCase().trim()
  if (q) {
    list = list.filter(item =>
      (item.product_name || '').toLowerCase().includes(q) ||
      (item.product_sku || '').toLowerCase().includes(q),
    )
  }
  if (filterBranch.value) list = list.filter(item => item.branch_code === filterBranch.value)
  if (filterSeverity.value) list = list.filter(item => itemSeverity(item) === filterSeverity.value)
  // Sort by severity then shortfall (worst first)
  const sevOrder = { out_of_stock: 0, critical: 1, low: 2 }
  list.sort((a, b) => {
    const sa = sevOrder[itemSeverity(a)]
    const sb = sevOrder[itemSeverity(b)]
    if (sa !== sb) return sa - sb
    return shortfall(b) - shortfall(a)
  })
  return list
})

const totalPages = computed(() => Math.ceil(filteredItems.value.length / pageSize) || 1)
const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredItems.value.slice(start, start + pageSize)
})

const stats = computed(() => {
  const totalAlerts = lowStockItems.value.length
  let outOfStock = 0
  let lowStock = 0
  let reorderQty = 0
  for (const item of lowStockItems.value) {
    const sev = itemSeverity(item)
    if (sev === 'out_of_stock') outOfStock++
    else lowStock++
    reorderQty += parseFloat(item.reorder_quantity) || 0
  }
  return { totalAlerts, outOfStock, lowStock, reorderQty }
})

// --- API ---
async function loadLowStock() {
  loading.value = true
  try {
    const data = await useApi()('/inventory/items/low_stock/')
    lowStockItems.value = data.results || data
  } catch {
    toast.error('Failed to load low stock alerts')
  } finally {
    loading.value = false
  }
}

// --- Helpers ---
function severityColor(item) {
  const s = itemSeverity(item)
  if (s === 'out_of_stock') return 'red'
  if (s === 'critical') return 'deep-orange'
  return 'amber'
}

function severityIcon(item) {
  const s = itemSeverity(item)
  if (s === 'out_of_stock') return 'mdi-close-circle'
  if (s === 'critical') return 'mdi-alert-circle'
  return 'mdi-alert'
}

function severityLabel(value) {
  return severityItems.find(s => s.value === value)?.title || value
}

function severityLabel2(item) {
  return severityLabel(itemSeverity(item))
}

function onHandClass(item) {
  const qty = parseFloat(item.quantity_on_hand) || 0
  if (qty <= 0) return 'text-error'
  if (itemSeverity(item) === 'critical') return 'text-deep-orange'
  return 'text-warning'
}

function rowNumber(idx) {
  return (currentPage.value - 1) * pageSize + idx + 1
}

function clearAllFilters() {
  searchQuery.value = ''
  filterBranch.value = ''
  filterSeverity.value = ''
  currentPage.value = 1
}

function exportCsv() {
  const rows = filteredItems.value
  if (rows.length === 0) {
    toast.info('Nothing to export')
    return
  }
  const header = ['Product', 'SKU', 'Branch', 'Category', 'On Hand', 'Reorder Level', 'Reorder Qty', 'Shortfall', 'Severity']
  const lines = [header.join(',')]
  for (const r of rows) {
    const cells = [
      `"${(r.product_name || '').replace(/"/g, '""')}"`,
      r.product_sku || '',
      r.branch_code || '',
      `"${(r.product_category || '').replace(/"/g, '""')}"`,
      r.quantity_on_hand ?? '',
      r.reorder_level ?? '',
      r.reorder_quantity ?? '',
      shortfall(r),
      severityLabel(itemSeverity(r)),
    ]
    lines.push(cells.join(','))
  }
  const csv = lines.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `low-stock-alerts-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('Exported to CSV')
}

watch([searchQuery, filterBranch, filterSeverity], () => {
  currentPage.value = 1
})

onMounted(loadLowStock)
</script>

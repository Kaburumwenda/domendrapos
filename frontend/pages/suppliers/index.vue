<template>
  <v-container class="pa-0" fluid>
    <!-- Page header -->
    <v-row class="d-flex align-center justify-space-between mb-4">
      <v-col cols="12" sm="6">
        <div class="text-h5 font-weight-bold">Suppliers</div>
        <div class="text-body-2 text-medium-emphasis">
          {{ stats.total }} suppliers · {{ stats.active }} active · {{ stats.countries }} countries
        </div>
      </v-col>
      <v-col cols="12" sm="6" class="d-flex justify-end ga-2 flex-wrap">
        <v-btn variant="outlined" prepend-icon="mdi-microsoft-excel" color="success" @click="goToExcelBulk">
          Import / Export
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddSupplier">Add Supplier</v-btn>
      </v-col>
    </v-row>

    <!-- Stats cards -->
    <v-row class="mb-4">
      <v-col cols="6" lg="3">
        <v-card rounded="xl" class="pa-5" flat border>
          <div class="d-flex align-start justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis text-uppercase">Total Suppliers</div>
              <div class="text-h5 font-weight-bold mt-2">{{ stats.total }}</div>
            </div>
            <v-avatar color="orange-lighten-5" rounded="lg" size="40">
              <v-icon color="orange">mdi-truck-fast</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" lg="3">
        <v-card rounded="xl" class="pa-5" flat border>
          <div class="d-flex align-start justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis text-uppercase">Active</div>
              <div class="text-h5 font-weight-bold text-success mt-2">{{ stats.active }}</div>
            </div>
            <v-avatar color="green-lighten-5" rounded="lg" size="40">
              <v-icon color="green">mdi-check-circle</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" lg="3">
        <v-card rounded="xl" class="pa-5" flat border>
          <div class="d-flex align-start justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis text-uppercase">Avg Rating</div>
              <div class="text-h5 font-weight-bold mt-2">
                <v-icon size="18" color="amber" class="mb-1">mdi-star</v-icon>
                {{ stats.avgRating }}
              </div>
            </div>
            <v-avatar color="amber-lighten-5" rounded="lg" size="40">
              <v-icon color="amber">mdi-star-circle</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" lg="3">
        <v-card rounded="xl" class="pa-5" flat border>
          <div class="d-flex align-start justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis text-uppercase">Avg Lead Time</div>
              <div class="text-h5 font-weight-bold text-primary mt-2">{{ stats.avgLeadTime }} days</div>
            </div>
            <v-avatar color="blue-lighten-5" rounded="lg" size="40">
              <v-icon color="blue">mdi-clock-fast</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Toolbar -->
    <v-card rounded="xl" class="pa-4 mb-4" flat border>
      <v-row dense>
        <v-col cols="12" lg="5">
          <v-text-field
            v-model="searchQuery"
            @update:model-value="onSearchInput"
            placeholder="Search by code, name, contact, email, phone..."
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-magnify"
            clearable
            @click:clear="clearSearch"
            hide-details
          />
        </v-col>
        <v-col cols="6" lg="2">
          <v-autocomplete
            v-model="filterCountry"
            @update:model-value="loadSuppliers"
            :items="countryItems"
            label="All Countries"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="6" lg="2">
          <v-select
            v-model="filterStatus"
            @update:model-value="loadSuppliers"
            :items="statusFilterItems"
            item-title="title"
            item-value="value"
            label="All Status"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-col>
        <v-col cols="6" lg="3">
          <v-select
            v-model="sortBy"
            @update:model-value="loadSuppliers"
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

    <!-- Active filters summary -->
    <div v-if="hasActiveFilters" class="d-flex align-center flex-wrap ga-2 mb-4">
      <span class="text-body-2 text-medium-emphasis">Filters:</span>
      <v-chip v-if="searchQuery" size="small" color="primary" closable @click:close="clearSearch">
        Search: "{{ searchQuery }}"
      </v-chip>
      <v-chip v-if="filterCountry" size="small" color="indigo" closable @click:close="filterCountry = ''; loadSuppliers()">
        Country: {{ filterCountry }}
      </v-chip>
      <v-chip v-if="filterStatus" size="small" color="success" closable @click:close="filterStatus = ''; loadSuppliers()">
        Status: {{ filterStatus === 'true' ? 'Active' : 'Inactive' }}
      </v-chip>
      <v-btn variant="text" size="small" color="error" @click="clearAllFilters">Clear all</v-btn>
    </div>

    <!-- Loading state -->
    <v-card v-if="loading" flat border rounded="xl" class="py-16 d-flex flex-column align-center justify-center ga-4">
      <v-progress-circular indeterminate color="primary" size="48" width="4" />
      <div class="text-body-2 text-medium-emphasis">Loading suppliers...</div>
    </v-card>

    <!-- Empty state -->
    <v-card v-else-if="suppliers.length === 0" flat border rounded="xl" class="py-16 text-center">
      <v-avatar color="orange-lighten-5" size="80" class="mb-4">
        <v-icon color="orange" size="40">mdi-truck-fast</v-icon>
      </v-avatar>
      <div class="text-h6 font-weight-bold mb-1">No suppliers found</div>
      <div class="text-body-2 text-medium-emphasis mb-4">
        {{ hasActiveFilters ? 'Try adjusting your filters or search query.' : 'Get started by adding your first supplier.' }}
      </div>
      <v-btn v-if="!hasActiveFilters" color="primary" prepend-icon="mdi-plus" @click="openAddSupplier">
        Add Supplier
      </v-btn>
      <v-btn v-else variant="outlined" @click="clearAllFilters">Clear Filters</v-btn>
    </v-card>

    <!-- Table -->
    <v-card v-else flat border rounded="xl" class="overflow-hidden">
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left">
              <v-checkbox hide-details density="compact" @update:model-value="toggleSelectAll" :model-value="allSelected" />
            </th>
            <th class="text-left">Supplier</th>
            <th class="text-left">Contact</th>
            <th class="text-left">Country</th>
            <th class="text-center">Terms</th>
            <th class="text-center">Lead Time</th>
            <th class="text-center">Rating</th>
            <th class="text-center">Status</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="supplier in suppliers"
            :key="supplier.id"
            :class="selectedIds.includes(supplier.id) ? 'bg-primary-lighten-5' : ''"
            class="hover:bg-grey-lighten-2"
          >
            <td>
              <v-checkbox v-model="selectedIds" :value="supplier.id" hide-details density="compact" />
            </td>
            <td>
              <div class="d-flex align-center ga-3">
                <v-avatar size="40" rounded="lg" color="orange-lighten-4">
                  <span class="text-body-2 font-weight-bold text-orange-darken-2">
                    {{ supplier.name.charAt(0).toUpperCase() }}
                  </span>
                </v-avatar>
                <div>
                  <div class="text-body-2 font-weight-bold">{{ supplier.name }}</div>
                  <div class="text-caption text-disabled font-weight-medium">{{ supplier.supplier_code }}</div>
                </div>
              </div>
            </td>
            <td>
              <div v-if="supplier.contact_person" class="text-body-2">{{ supplier.contact_person }}</div>
              <div v-else class="text-disabled text-body-2">—</div>
              <div v-if="supplier.email" class="text-caption text-medium-emphasis text-truncate" style="max-width: 160px">
                {{ supplier.email }}
              </div>
            </td>
            <td class="text-body-2">{{ supplier.country || '—' }}</td>
            <td class="text-center">
              <v-chip v-if="supplier.payment_terms" size="small" variant="flat" color="blue-grey-lighten-4">
                {{ supplier.payment_terms }}
              </v-chip>
              <span v-else class="text-disabled">—</span>
            </td>
            <td class="text-center text-body-2 font-medium">{{ supplier.lead_time_days || 0 }}d</td>
            <td class="text-center">
              <v-rating
                :model-value="parseFloat(supplier.rating) || 0"
                color="amber"
                size="small"
                density="compact"
                readonly
                half-increments
              />
            </td>
            <td class="text-center">
              <v-btn
                size="x-small"
                variant="flat"
                :color="supplier.is_active ? 'success' : 'grey'"
                @click="toggleActive(supplier)"
              >
                {{ supplier.is_active ? 'Active' : 'Inactive' }}
              </v-btn>
            </td>
            <td class="text-right">
              <div class="d-flex justify-end ga-1">
                <v-btn icon="mdi-pencil" size="small" variant="text" @click="editSupplier(supplier)" />
                <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="confirmDelete(supplier)" />
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>

      <PaginationBar
        :count="pagination.count"
        :next="pagination.next"
        :previous="pagination.previous"
        :page="currentPage"
        :pageSize="pageSize"
        :totalPages="totalPages"
        @page-change="changePage"
      />
    </v-card>

    <!-- Bulk action bar -->
    <v-card
      v-if="selectedIds.length > 0"
      color="grey-darken-3"
      rounded="xl"
      class="pa-4 d-flex align-center justify-center ga-4 position-fixed"
      style="bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 30;"
    >
      <span class="text-body-2 font-weight-bold text-white">{{ selectedIds.length }} selected</span>
      <v-divider vertical />
      <v-btn variant="text" size="small" color="green-lighten-3" @click="bulkActivate">Activate</v-btn>
      <v-btn variant="text" size="small" color="amber-lighten-3" @click="bulkDeactivate">Deactivate</v-btn>
      <v-divider vertical />
      <v-btn variant="text" size="small" color="red-lighten-3" @click="bulkDelete">Delete</v-btn>
      <v-btn variant="text" size="small" color="grey-lighten-1" @click="selectedIds = []">Cancel</v-btn>
    </v-card>

    <!-- Delete confirmation modal -->
    <v-dialog v-model="showDeleteModal" max-width="440">
      <v-card rounded="xl" class="pa-6">
        <div class="d-flex align-start ga-4">
          <v-avatar color="error-lighten-5" size="48" rounded="circle">
            <v-icon color="error">mdi-alert-circle</v-icon>
          </v-avatar>
          <div class="flex-1">
            <div class="text-h6 font-weight-bold">Confirm Deletion</div>
            <div class="text-body-2 text-medium-emphasis mt-1">
              Are you sure you want to delete
              <strong>{{ deleteTarget ? deleteTarget.name : deleteTargetsCount + ' suppliers' }}</strong>?
              This action cannot be undone.
            </div>
          </div>
        </div>
        <div class="d-flex justify-end ga-3 mt-6">
          <v-btn variant="text" @click="showDeleteModal = false">Cancel</v-btn>
          <v-btn color="error" :loading="deleting" @click="executeDelete">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Supplier modal -->
    <SuppliersSupplierModal
      :show="showSupplierModal"
      :supplier="editingSupplier"
      @close="showSupplierModal = false"
      @saved="onSupplierSaved"
    />
  </v-container>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const toast = useToast()

const loading = ref(false)
const suppliers = ref([])
const searchQuery = ref('')
const filterCountry = ref('')
const filterStatus = ref('')
const sortBy = ref('name')
const currentPage = ref(1)
const pageSize = 20
const pagination = ref({ count: 0, next: null, previous: null })
const selectedIds = ref([])

const showSupplierModal = ref(false)
const editingSupplier = ref(null)
const showDeleteModal = ref(false)
const deleteTarget = ref(null)
const deleteTargetsCount = ref(0)
const deleting = ref(false)

const statusFilterItems = [
  { title: 'All Status', value: '' },
  { title: 'Active', value: 'true' },
  { title: 'Inactive', value: 'false' },
]
const sortItems = [
  { title: 'Sort: Name A-Z', value: 'name' },
  { title: 'Sort: Name Z-A', value: '-name' },
  { title: 'Sort: Highest Rating', value: '-rating' },
  { title: 'Sort: Newest First', value: '-created_at' },
]

const allSelected = computed(
  () => suppliers.value.length > 0 && selectedIds.value.length === suppliers.value.length,
)
const hasActiveFilters = computed(() => !!(searchQuery.value || filterCountry.value || filterStatus.value))
const totalPages = computed(() => Math.ceil(pagination.value.count / pageSize) || 1)

const countryItems = computed(() => {
  const set = new Set(suppliers.value.map(s => s.country).filter(Boolean))
  return Array.from(set).sort()
})

const stats = computed(() => {
  const total = pagination.value.count
  const active = suppliers.value.filter(s => s.is_active).length
  const countries = new Set(suppliers.value.map(s => s.country).filter(Boolean)).size
  const rated = suppliers.value.filter(s => s.rating != null)
  const avgRating = rated.length ? (rated.reduce((s, x) => s + (parseFloat(x.rating) || 0), 0) / rated.length).toFixed(1) : '0.0'
  const leadTimes = suppliers.value.filter(s => s.lead_time_days != null)
  const avgLeadTime = leadTimes.length ? Math.round(leadTimes.reduce((s, x) => s + (x.lead_time_days || 0), 0) / leadTimes.length) : 0
  return { total, active, countries, avgRating, avgLeadTime }
})

let searchTimer = null
function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    loadSuppliers()
  }, 300)
}
function clearSearch() {
  searchQuery.value = ''
  currentPage.value = 1
  loadSuppliers()
}
function clearAllFilters() {
  searchQuery.value = ''
  filterCountry.value = ''
  filterStatus.value = ''
  sortBy.value = 'name'
  currentPage.value = 1
  loadSuppliers()
}

async function loadSuppliers() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.set('page', currentPage.value)
    if (searchQuery.value) params.set('search', searchQuery.value)
    if (filterCountry.value) params.set('country', filterCountry.value)
    if (filterStatus.value) params.set('is_active', filterStatus.value)
    if (sortBy.value) params.set('ordering', sortBy.value)
    const data = await useApi()(`/suppliers/?${params.toString()}`)
    suppliers.value = data.results || data
    pagination.value = { count: data.count || suppliers.value.length, next: data.next, previous: data.previous }
  } catch {
    toast.error('Failed to load suppliers')
  } finally {
    loading.value = false
  }
}

function openAddSupplier() {
  editingSupplier.value = null
  showSupplierModal.value = true
}
function editSupplier(supplier) {
  editingSupplier.value = { ...supplier }
  showSupplierModal.value = true
}
function onSupplierSaved() {
  showSupplierModal.value = false
  loadSuppliers()
}

async function toggleActive(supplier) {
  try {
    await useApi()(`/suppliers/${supplier.id}/`, { method: 'PATCH', body: { is_active: !supplier.is_active } })
    supplier.is_active = !supplier.is_active
    toast.success(`${supplier.name} ${supplier.is_active ? 'activated' : 'deactivated'}`)
  } catch {
    toast.error('Failed to update status')
  }
}

function confirmDelete(supplier) {
  deleteTarget.value = supplier
  deleteTargetsCount.value = 0
  showDeleteModal.value = true
}
function bulkDelete() {
  deleteTarget.value = null
  deleteTargetsCount.value = selectedIds.value.length
  showDeleteModal.value = true
}
async function executeDelete() {
  deleting.value = true
  try {
    if (deleteTargetsCount.value > 0) {
      for (const id of selectedIds.value) {
        await useApi()(`/suppliers/${id}/`, { method: 'DELETE' })
      }
      toast.success(`${deleteTargetsCount.value} suppliers deleted`)
      selectedIds.value = []
    } else if (deleteTarget.value) {
      await useApi()(`/suppliers/${deleteTarget.value.id}/`, { method: 'DELETE' })
      toast.success('Supplier deleted')
    }
    showDeleteModal.value = false
    deleteTarget.value = null
    deleteTargetsCount.value = 0
    loadSuppliers()
  } catch {
    toast.error('Failed to delete supplier(s)')
  } finally {
    deleting.value = false
  }
}

function toggleSelectAll() {
  if (allSelected.value) selectedIds.value = []
  else selectedIds.value = suppliers.value.map(s => s.id)
}
async function bulkActivate() {
  for (const id of selectedIds.value) {
    await useApi()(`/suppliers/${id}/`, { method: 'PATCH', body: { is_active: true } })
  }
  toast.success(`${selectedIds.value.length} suppliers activated`)
  selectedIds.value = []
  loadSuppliers()
}
async function bulkDeactivate() {
  for (const id of selectedIds.value) {
    await useApi()(`/suppliers/${id}/`, { method: 'PATCH', body: { is_active: false } })
  }
  toast.success(`${selectedIds.value.length} suppliers deactivated`)
  selectedIds.value = []
  loadSuppliers()
}

function changePage(page) {
  currentPage.value = page
  loadSuppliers()
}

function goToExcelBulk() {
  const params = new URLSearchParams()
  if (searchQuery.value) params.set('search', searchQuery.value)
  if (filterCountry.value) params.set('country', filterCountry.value)
  if (filterStatus.value) params.set('is_active', filterStatus.value)
  if (sortBy.value) params.set('ordering', sortBy.value)
  const qs = params.toString()
  navigateTo(qs ? `/suppliers/excel-bulk?${qs}` : '/suppliers/excel-bulk')
}

onMounted(() => {
  if (route.query.imported === '1') {
    toast.success('Suppliers imported successfully')
  }
  loadSuppliers()
})
</script>

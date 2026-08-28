<template>
  <v-container class="pa-0" fluid>
    <!-- Top-level tab bar -->
    <v-card rounded="t-lg" class="mb-4">
      <v-tabs v-model="activeMainTab" color="primary" density="comfortable">
        <v-tab value="customers" @click="activeMainTab = 'customers'">
          <v-icon size="16" start>mdi-account-group-outline</v-icon>
          Customers
          <v-chip size="x-small" class="ml-2" :color="activeMainTab === 'customers' ? 'primary' : 'default'">
            {{ pagination.count }}
          </v-chip>
        </v-tab>
        <v-tab value="groups" @click="activeMainTab = 'groups'">
          <v-icon size="16" start>mdi-account-multiple-plus-outline</v-icon>
          Groups
          <v-chip size="x-small" class="ml-2" :color="activeMainTab === 'groups' ? 'primary' : 'default'">
            {{ groups.length }}
          </v-chip>
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- ==================== CUSTOMERS TAB ==================== -->
    <template v-if="activeMainTab === 'customers'">
      <!-- Page header -->
      <v-row class="d-flex align-center justify-space-between mb-4">
        <v-col cols="12" sm="6">
          <div class="text-h5 font-weight-bold">Customers</div>
          <div class="text-body-2 text-medium-emphasis">
            {{ stats.total }} customers · {{ stats.active }} active · {{ stats.business }} business
          </div>
        </v-col>
        <v-col cols="12" sm="6" class="d-flex justify-end ga-2 flex-wrap">
          <v-btn variant="outlined" prepend-icon="mdi-account-multiple-plus-outline" @click="activeMainTab = 'groups'">
            Manage Groups
          </v-btn>
          <v-btn variant="outlined" prepend-icon="mdi-microsoft-excel" color="success" @click="goToExcelBulk">
            Import / Export
          </v-btn>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddCustomer">Add Customer</v-btn>
        </v-col>
      </v-row>

      <!-- Stats cards -->
      <v-row class="mb-4">
        <v-col cols="6" lg="3">
          <v-card rounded="xl" class="pa-5" flat border>
            <div class="d-flex align-start justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis text-uppercase">Total Customers</div>
                <div class="text-h5 font-weight-bold mt-2">{{ stats.total }}</div>
              </div>
              <v-avatar color="deep-purple-lighten-5" rounded="lg" size="40">
                <v-icon color="deep-purple">mdi-account-group</v-icon>
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
                <div class="text-caption text-medium-emphasis text-uppercase">Loyalty Points</div>
                <div class="text-h5 font-weight-bold mt-2">{{ formatNumber(stats.totalLoyaltyPoints) }}</div>
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
                <div class="text-caption text-medium-emphasis text-uppercase">Credit Outstanding</div>
                <div class="text-h5 font-weight-bold mt-2">{{ currency(stats.totalCreditBalance) }}</div>
              </div>
              <v-avatar color="red-lighten-5" rounded="lg" size="40">
                <v-icon color="red">mdi-credit-card-clock-outline</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Toolbar -->
      <v-card rounded="xl" class="pa-4 mb-4" flat border>
        <v-row density="comfortable">
          <v-col cols="12" lg="4">
            <v-text-field
              v-model="searchQuery"
              @update:model-value="onSearchInput"
              placeholder="Search by code, name, email, phone..."
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              clearable
              @click:clear="clearSearch"
              hide-details
            />
          </v-col>
          <v-col cols="6" lg="2">
            <v-select
              v-model="filterType"
              @update:model-value="loadCustomers"
              :items="typeFilterItems"
              item-title="title"
              item-value="value"
              label="All Types"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="6" lg="2">
            <v-select
              v-model="filterTier"
              @update:model-value="loadCustomers"
              :items="tierFilterItems"
              item-title="title"
              item-value="value"
              label="All Tiers"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="6" lg="2">
            <v-select
              v-model="filterStatus"
              @update:model-value="loadCustomers"
              :items="statusFilterItems"
              item-title="title"
              item-value="value"
              label="All Status"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="6" lg="2">
            <v-select
              v-model="sortBy"
              @update:model-value="loadCustomers"
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
        <v-chip v-if="filterType" size="small" color="indigo" closable @click:close="filterType = ''; loadCustomers()">
          Type: {{ filterType }}
        </v-chip>
        <v-chip v-if="filterTier" size="small" color="amber" closable @click:close="filterTier = ''; loadCustomers()">
          Tier: {{ filterTier }}
        </v-chip>
        <v-chip v-if="filterStatus" size="small" color="success" closable @click:close="filterStatus = ''; loadCustomers()">
          Status: {{ filterStatus === 'true' ? 'Active' : 'Inactive' }}
        </v-chip>
        <v-btn variant="text" size="small" color="error" @click="clearAllFilters">Clear all</v-btn>
      </div>

      <!-- Loading state -->
      <v-card v-if="loading" flat border rounded="xl" class="py-16 d-flex flex-column align-center justify-center ga-4">
        <v-progress-circular indeterminate color="primary" size="48" width="4" />
        <div class="text-body-2 text-medium-emphasis">Loading customers...</div>
      </v-card>

      <!-- Empty state -->
      <v-card v-else-if="customers.length === 0" flat border rounded="xl" class="py-16 text-center">
        <v-avatar color="deep-purple-lighten-5" size="80" class="mb-4">
          <v-icon color="deep-purple" size="40">mdi-account-group</v-icon>
        </v-avatar>
        <div class="text-h6 font-weight-bold mb-1">No customers found</div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          {{ hasActiveFilters ? 'Try adjusting your filters or search query.' : 'Get started by adding your first customer.' }}
        </div>
        <v-btn v-if="!hasActiveFilters" color="primary" prepend-icon="mdi-plus" @click="openAddCustomer">
          Add Customer
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
              <th class="text-left">Customer</th>
              <th class="text-left">Type</th>
              <th class="text-left">Contact</th>
              <th class="text-center">Tier</th>
              <th class="text-center">Points</th>
              <th class="text-right">Credit Balance</th>
              <th class="text-center">Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="customer in customers"
              :key="customer.id"
              :class="selectedIds.includes(customer.id) ? 'bg-primary-lighten-5' : ''"
              class="hover:bg-grey-lighten-2"
            >
              <td>
                <v-checkbox v-model="selectedIds" :value="customer.id" hide-details density="compact" />
              </td>
              <td>
                <div class="d-flex align-center ga-3">
                  <v-avatar size="40" rounded="lg" :color="avatarColor(customer)">
                    <span class="text-body-2 font-weight-bold text-white">{{ avatarInitials(customer) }}</span>
                  </v-avatar>
                  <div>
                    <div class="text-body-2 font-weight-bold">{{ customerDisplayName(customer) }}</div>
                    <div class="text-caption text-disabled font-weight-medium">{{ customer.customer_code }}</div>
                  </div>
                </div>
              </td>
              <td>
                <v-chip size="small" :color="customer.customer_type === 'business' ? 'indigo' : 'blue'">
                  {{ customer.customer_type === 'business' ? 'Business' : 'Individual' }}
                </v-chip>
              </td>
              <td>
                <div v-if="customer.email" class="text-body-2 text-truncate" style="max-width: 180px">
                  {{ customer.email }}
                </div>
                <div v-else class="text-disabled text-body-2">—</div>
                <div v-if="customer.phone" class="text-caption text-medium-emphasis">{{ customer.phone }}</div>
              </td>
              <td class="text-center">
                <v-chip size="small" :color="tierColor(customer.loyalty_tier)" label class="text-capitalize">
                  {{ customer.loyalty_tier }}
                </v-chip>
              </td>
              <td class="text-center text-body-2 font-weight-medium">{{ formatNumber(customer.loyalty_points) }}</td>
              <td class="text-right">
                <span class="font-weight-bold" :class="creditClass(customer)">{{ currency(customer.current_credit_balance) }}</span>
                <div class="text-caption text-disabled">Limit: {{ currency(customer.credit_limit) }}</div>
              </td>
              <td class="text-center">
                <v-btn size="x-small" variant="flat" :color="customer.is_active ? 'success' : 'grey'" @click="toggleActive(customer)">
                  {{ customer.is_active ? 'Active' : 'Inactive' }}
                </v-btn>
              </td>
              <td class="text-right">
                <div class="d-flex justify-end ga-1">
                  <v-btn icon="mdi-star-plus" size="small" variant="text" color="amber" @click="openPointsModal(customer)" />
                  <v-btn icon="mdi-pencil" size="small" variant="text" @click="editCustomer(customer)" />
                  <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="confirmDelete(customer)" />
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
                <strong>{{ deleteTarget ? customerDisplayName(deleteTarget) : deleteTargetsCount + ' customers' }}</strong>?
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

      <!-- Add-points dialog -->
      <v-dialog v-model="showPointsModal" max-width="420">
        <v-card rounded="xl" class="pa-6">
          <v-card-title class="text-h6 font-weight-bold pa-0 mb-2">
            <v-icon start color="amber">mdi-star-plus</v-icon>
            Adjust Loyalty Points
          </v-card-title>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Customer: <strong>{{ pointsTarget ? customerDisplayName(pointsTarget) : '' }}</strong>
            <br />Current points: <strong>{{ pointsTarget ? formatNumber(pointsTarget.loyalty_points) : 0 }}</strong>
          </div>
          <v-text-field
            v-model.number="pointsDelta"
            type="number"
            label="Points (use negative to subtract)"
            variant="outlined"
            density="comfortable"
            hide-details
            class="mb-2"
          />
          <div class="d-flex justify-end ga-3 mt-4">
            <v-btn variant="text" @click="showPointsModal = false">Cancel</v-btn>
            <v-btn color="amber" :loading="savingPoints" @click="executeAddPoints">Apply</v-btn>
          </div>
        </v-card>
      </v-dialog>
    </template><!-- end customers tab -->

    <!-- ==================== GROUPS TAB ==================== -->
    <template v-if="activeMainTab === 'groups'">
      <v-row class="d-flex align-center justify-space-between mb-4">
        <v-col cols="12" sm="6">
          <div class="text-h6 font-weight-bold">Customer Groups</div>
          <div class="text-body-2 text-medium-emphasis">
            Segment customers for targeted discounts and reporting
          </div>
        </v-col>
        <v-col cols="12" sm="6" class="d-flex justify-end">
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openGroupModal">Add Group</v-btn>
        </v-col>
      </v-row>

      <div v-if="groupLoading" class="d-flex justify-center align-center py-16">
        <v-progress-circular indeterminate color="primary" size="32" width="3" />
      </div>

      <v-card v-else-if="groups.length === 0" flat border rounded="lg" class="py-12 text-center">
        <v-icon size="48" class="mb-4" color="grey-lighten-1">mdi-account-multiple-plus-outline</v-icon>
        <div class="text-h6 font-weight-bold mb-1">No groups yet</div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          Create groups like VIP, Wholesale, or Employee to segment your customers.
        </div>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openGroupModal">Add Group</v-btn>
      </v-card>

      <v-row v-else>
        <v-col v-for="group in groups" :key="group.id" cols="12" sm="6" md="4" xl="3">
          <v-card flat border rounded="lg" class="h-100">
            <div class="pa-4">
              <div class="d-flex align-start justify-space-between mb-2">
                <div class="d-flex align-center ga-3">
                  <v-avatar color="deep-purple-lighten-4" size="40" rounded="lg">
                    <v-icon color="deep-purple">mdi-account-multiple</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-body-2 font-weight-bold">{{ group.name }}</div>
                    <div class="text-caption text-disabled">{{ formatNumber(group.customers?.length || 0) }} customers</div>
                  </div>
                </div>
                <v-chip v-if="parseFloat(group.discount_percent) > 0" size="small" color="success" label>
                  {{ group.discount_percent }}% off
                </v-chip>
              </div>
              <div
                v-if="group.description"
                class="text-caption text-disabled mb-3"
                style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;"
              >
                {{ group.description }}
              </div>
              <v-divider class="mb-2" />
              <div class="d-flex ga-1">
                <v-btn variant="text" size="small" color="primary" class="flex-1" @click="editGroup(group)">Edit</v-btn>
                <v-btn variant="text" size="small" color="error" class="flex-1" @click="confirmGroupDelete(group)">Delete</v-btn>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="4" xl="3">
          <v-card
            flat
            border
            rounded="lg"
            class="d-flex flex-column align-center justify-center text-center cursor-pointer py-8"
            color="grey-lighten-3"
            variant="outlined"
            @click="openGroupModal"
          >
            <v-icon size="32" color="grey">mdi-plus</v-icon>
            <div class="text-body-2 font-weight-medium text-medium-emphasis mt-2">Add Group</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Group modal -->
      <v-dialog v-model="showGroupModal" max-width="500">
        <v-card rounded="xl">
          <v-card-title class="text-h6 font-weight-bold pa-6 pb-2">
            <v-icon start color="deep-purple">mdi-account-multiple-plus-outline</v-icon>
            {{ editingGroup ? 'Edit Group' : 'Add Group' }}
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="groupForm.name"
              label="Group Name"
              variant="outlined"
              density="comfortable"
              placeholder="e.g., VIP, Wholesale, Employee"
              class="mb-3"
              :error-messages="groupError"
            />
            <v-text-field
              v-model.number="groupForm.discount_percent"
              label="Discount Percent"
              variant="outlined"
              density="comfortable"
              type="number"
              step="0.01"
              min="0"
              max="100"
              class="mb-3"
              placeholder="0.00"
            />
            <v-textarea
              v-model="groupForm.description"
              label="Description"
              variant="outlined"
              density="comfortable"
              rows="2"
              placeholder="Optional group description..."
              class="mb-2"
            />
          </v-card-text>
          <v-card-actions class="justify-end pa-4">
            <v-btn variant="text" @click="showGroupModal = false">Cancel</v-btn>
            <v-btn color="primary" :loading="savingGroup" @click="saveGroup">
              {{ editingGroup ? 'Update' : 'Create' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="showGroupDeleteModal" max-width="440">
        <v-card rounded="xl" class="pa-6">
          <div class="d-flex align-start ga-4">
            <v-avatar color="error-lighten-5" size="48" rounded="circle">
              <v-icon color="error">mdi-alert-circle</v-icon>
            </v-avatar>
            <div class="flex-1">
              <div class="text-h6 font-weight-bold">Delete Group</div>
              <div class="text-body-2 text-medium-emphasis mt-1">
                Are you sure you want to delete <strong>{{ groupDeleteTarget?.name }}</strong>?
                <div class="mt-2">This action cannot be undone.</div>
              </div>
            </div>
          </div>
          <div class="d-flex justify-end ga-3 mt-6">
            <v-btn variant="text" @click="showGroupDeleteModal = false">Cancel</v-btn>
            <v-btn color="error" :loading="groupDeleting" @click="executeGroupDelete">
              {{ groupDeleting ? 'Deleting...' : 'Delete' }}
            </v-btn>
          </div>
        </v-card>
      </v-dialog>
    </template><!-- end groups tab -->

    <CustomersCustomerModal
      :show="showCustomerModal"
      :customer="editingCustomer"
      :branches="branches"
      @close="showCustomerModal = false"
      @saved="onCustomerSaved"
    />
  </v-container>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const { currency, number: formatNumber } = useFormat()
const toast = useToast()

const activeMainTab = ref('customers')

const loading = ref(false)
const customers = ref([])
const searchQuery = ref('')
const filterType = ref('')
const filterStatus = ref('')
const filterTier = ref('')
const sortBy = ref('-created_at')
const currentPage = ref(1)
const pageSize = 20
const pagination = ref({ count: 0, next: null, previous: null })
const selectedIds = ref([])

const branches = ref([])

const showCustomerModal = ref(false)
const editingCustomer = ref(null)
const showDeleteModal = ref(false)
const deleteTarget = ref(null)
const deleteTargetsCount = ref(0)
const deleting = ref(false)

const showPointsModal = ref(false)
const pointsTarget = ref(null)
const pointsDelta = ref(0)
const savingPoints = ref(false)

const groups = ref([])
const groupLoading = ref(false)
const showGroupModal = ref(false)
const editingGroup = ref(null)
const groupForm = reactive({ name: '', description: '', discount_percent: 0 })
const groupError = ref('')
const savingGroup = ref(false)
const showGroupDeleteModal = ref(false)
const groupDeleteTarget = ref(null)
const groupDeleting = ref(false)

const statusFilterItems = [
  { title: 'All Status', value: '' },
  { title: 'Active', value: 'true' },
  { title: 'Inactive', value: 'false' },
]
const typeFilterItems = [
  { title: 'All Types', value: '' },
  { title: 'Individual', value: 'individual' },
  { title: 'Business', value: 'business' },
]
const tierFilterItems = [
  { title: 'All Tiers', value: '' },
  { title: 'Bronze', value: 'bronze' },
  { title: 'Silver', value: 'silver' },
  { title: 'Gold', value: 'gold' },
  { title: 'Platinum', value: 'platinum' },
  { title: 'Diamond', value: 'diamond' },
]
const sortItems = [
  { title: 'Sort: Newest First', value: '-created_at' },
  { title: 'Sort: Oldest First', value: 'created_at' },
  { title: 'Sort: Most Points', value: '-loyalty_points' },
  { title: 'Sort: Name A-Z', value: 'last_name' },
]

const allSelected = computed(
  () => customers.value.length > 0 && selectedIds.value.length === customers.value.length,
)
const hasActiveFilters = computed(
  () => !!(searchQuery.value || filterType.value || filterStatus.value || filterTier.value),
)
const totalPages = computed(() => Math.ceil(pagination.value.count / pageSize) || 1)

const stats = computed(() => {
  return {
    total: pagination.value.count,
    active: customers.value.filter(c => c.is_active).length,
    business: customers.value.filter(c => c.customer_type === 'business').length,
    totalLoyaltyPoints: customers.value.reduce((s, c) => s + (c.loyalty_points || 0), 0),
    totalCreditBalance: customers.value.reduce((s, c) => s + (parseFloat(c.current_credit_balance) || 0), 0),
  }
})

let searchTimer = null
function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    loadCustomers()
  }, 300)
}
function clearSearch() {
  searchQuery.value = ''
  currentPage.value = 1
  loadCustomers()
}
function clearAllFilters() {
  searchQuery.value = ''
  filterType.value = ''
  filterStatus.value = ''
  filterTier.value = ''
  sortBy.value = '-created_at'
  currentPage.value = 1
  loadCustomers()
}

async function loadCustomers() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.set('page', currentPage.value)
    if (searchQuery.value) params.set('search', searchQuery.value)
    if (filterType.value) params.set('customer_type', filterType.value)
    if (filterStatus.value) params.set('is_active', filterStatus.value)
    if (filterTier.value) params.set('loyalty_tier', filterTier.value)
    if (sortBy.value) params.set('ordering', sortBy.value)
    const data = await useApi()(`/customers/?${params.toString()}`)
    customers.value = data.results || data
    pagination.value = { count: data.count || customers.value.length, next: data.next, previous: data.previous }
  } catch {
    toast.error('Failed to load customers')
  } finally {
    loading.value = false
  }
}

async function loadBranches() {
  try {
    const data = await useApi()('/branches/?page_size=100')
    branches.value = data.results || data
  } catch { /* silent */ }
}

function openAddCustomer() {
  editingCustomer.value = null
  showCustomerModal.value = true
}
function editCustomer(customer) {
  editingCustomer.value = { ...customer }
  showCustomerModal.value = true
}
function onCustomerSaved() {
  showCustomerModal.value = false
  loadCustomers()
}

async function toggleActive(customer) {
  try {
    await useApi()(`/customers/${customer.id}/`, { method: 'PATCH', body: { is_active: !customer.is_active } })
    customer.is_active = !customer.is_active
    toast.success(`${customerDisplayName(customer)} ${customer.is_active ? 'activated' : 'deactivated'}`)
  } catch {
    toast.error('Failed to update status')
  }
}

function openPointsModal(customer) {
  pointsTarget.value = customer
  pointsDelta.value = 0
  showPointsModal.value = true
}
async function executeAddPoints() {
  if (!pointsTarget.value) return
  savingPoints.value = true
  try {
    const res = await useApi()(`/customers/${pointsTarget.value.id}/add_points/`, {
      method: 'POST',
      body: { points: pointsDelta.value },
    })
    pointsTarget.value.loyalty_points = res.loyalty_points
    toast.success('Points updated')
    showPointsModal.value = false
  } catch {
    toast.error('Failed to adjust points')
  } finally {
    savingPoints.value = false
  }
}

function confirmDelete(customer) {
  deleteTarget.value = customer
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
        await useApi()(`/customers/${id}/`, { method: 'DELETE' })
      }
      toast.success(`${deleteTargetsCount.value} customers deleted`)
      selectedIds.value = []
    } else if (deleteTarget.value) {
      await useApi()(`/customers/${deleteTarget.value.id}/`, { method: 'DELETE' })
      toast.success('Customer deleted')
    }
    showDeleteModal.value = false
    deleteTarget.value = null
    deleteTargetsCount.value = 0
    loadCustomers()
  } catch {
    toast.error('Failed to delete customer(s)')
  } finally {
    deleting.value = false
  }
}

function toggleSelectAll() {
  if (allSelected.value) selectedIds.value = []
  else selectedIds.value = customers.value.map(c => c.id)
}
async function bulkActivate() {
  for (const id of selectedIds.value) {
    await useApi()(`/customers/${id}/`, { method: 'PATCH', body: { is_active: true } })
  }
  toast.success(`${selectedIds.value.length} customers activated`)
  selectedIds.value = []
  loadCustomers()
}
async function bulkDeactivate() {
  for (const id of selectedIds.value) {
    await useApi()(`/customers/${id}/`, { method: 'PATCH', body: { is_active: false } })
  }
  toast.success(`${selectedIds.value.length} customers deactivated`)
  selectedIds.value = []
  loadCustomers()
}

async function loadGroups() {
  groupLoading.value = true
  try {
    const data = await useApi()('/customers/groups/?page_size=100')
    groups.value = data.results || data
  } catch { /* silent */ }
  finally {
    groupLoading.value = false
  }
}
function openGroupModal() {
  editingGroup.value = null
  Object.assign(groupForm, { name: '', description: '', discount_percent: 0 })
  groupError.value = ''
  showGroupModal.value = true
}
function editGroup(group) {
  editingGroup.value = { ...group }
  Object.assign(groupForm, {
    name: group.name || '',
    description: group.description || '',
    discount_percent: parseFloat(group.discount_percent) || 0,
  })
  groupError.value = ''
  showGroupModal.value = true
}
async function saveGroup() {
  if (!groupForm.name.trim()) {
    groupError.value = 'Group name is required'
    return
  }
  savingGroup.value = true
  try {
    const payload = { name: groupForm.name, description: groupForm.description, discount_percent: groupForm.discount_percent }
    if (editingGroup.value) {
      await useApi()(`/customers/groups/${editingGroup.value.id}/`, { method: 'PATCH', body: payload })
      toast.success('Group updated')
    } else {
      await useApi()('/customers/groups/', { method: 'POST', body: payload })
      toast.success('Group created')
    }
    showGroupModal.value = false
    loadGroups()
  } catch (e) {
    if (e?.data?.name) {
      groupError.value = Array.isArray(e.data.name) ? e.data.name.join(', ') : e.data.name
    } else {
      toast.error('Failed to save group')
    }
  } finally {
    savingGroup.value = false
  }
}
function confirmGroupDelete(group) {
  groupDeleteTarget.value = group
  showGroupDeleteModal.value = true
}
async function executeGroupDelete() {
  if (!groupDeleteTarget.value) return
  groupDeleting.value = true
  try {
    await useApi()(`/customers/groups/${groupDeleteTarget.value.id}/`, { method: 'DELETE' })
    toast.success('Group deleted')
    showGroupDeleteModal.value = false
    groupDeleteTarget.value = null
    loadGroups()
  } catch {
    toast.error('Failed to delete group')
  } finally {
    groupDeleting.value = false
  }
}

function changePage(page) {
  currentPage.value = page
  loadCustomers()
}

function customerDisplayName(c) {
  return c.full_name || c.company_name || c.email || c.customer_code
}
function avatarInitials(c) {
  if (c.customer_type === 'business' && c.company_name) return c.company_name.charAt(0).toUpperCase()
  const name = c.full_name || `${c.first_name} ${c.last_name}`.trim() || c.customer_code
  const parts = name.split(' ').filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return parts[0]?.charAt(0).toUpperCase() || '?'
}
function avatarColor(c) {
  if (c.customer_type === 'business') return 'indigo'
  const palette = ['deep-purple', 'blue', 'teal', 'green', 'amber', 'pink', 'cyan', 'orange']
  const seed = (c.customer_code || c.email || '').split('').reduce((a, ch) => a + ch.charCodeAt(0), 0)
  return palette[seed % palette.length]
}
function tierColor(tier) {
  const colors = { bronze: 'brown', silver: 'grey', gold: 'amber', platinum: 'blue-grey', diamond: 'cyan' }
  return colors[tier] || 'deep-purple'
}
function creditClass(c) {
  const bal = parseFloat(c.current_credit_balance) || 0
  if (bal > 0) return 'text-error'
  if (bal < 0) return 'text-success'
  return ''
}

function goToExcelBulk() {
  const params = new URLSearchParams()
  if (searchQuery.value) params.set('search', searchQuery.value)
  if (filterType.value) params.set('customer_type', filterType.value)
  if (filterStatus.value) params.set('is_active', filterStatus.value)
  if (filterTier.value) params.set('loyalty_tier', filterTier.value)
  if (sortBy.value) params.set('ordering', sortBy.value)
  const qs = params.toString()
  navigateTo(qs ? `/customers/excel-bulk?${qs}` : '/customers/excel-bulk')
}

onMounted(() => {
  loadBranches()
  loadCustomers()
  loadGroups()
  if (route.query.imported === '1') {
    toast.success('Customers imported successfully')
  }
})
</script>


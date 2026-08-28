<template>
  <div class="sa-page">
    <!-- ===== Header ===== -->
    <div class="sa-header">
      <div class="sa-header__left">
        <div class="sa-header__title-icon">
          <v-icon size="26">mdi-domain</v-icon>
        </div>
        <div>
          <h1 class="text-h5 font-weight-bold">Tenant Management</h1>
          <p class="text-body-2 text-medium-emphasis">Manage all workspaces — plans, limits, lifecycle & domains</p>
        </div>
      </div>
      <div class="sa-header__actions">
        <v-btn variant="outlined" prepend-icon="mdi-open-in-new" to="/superadmin">Dashboard</v-btn>
        <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="loadTenants">Refresh</v-btn>
      </div>
    </div>

    <!-- ===== Loading ===== -->
    <div v-if="loading && tenants.length === 0" class="sa-skeleton">
      <v-skeleton-loader type="table-tbody" class="sa-skel-table" boilerplate />
    </div>

    <template v-else>
      <!-- ===== Tenants Table ===== -->
      <div class="sa-card">
        <div class="sa-card__header">
          <div class="sa-card__header-icon sa-card__header-icon--indigo">
            <v-icon size="20">mdi-domain</v-icon>
          </div>
          <div>
            <h3 class="sa-card__title">All Tenants</h3>
            <p class="sa-card__subtitle">{{ filteredTenants.length }} of {{ tenants.length }} tenants</p>
          </div>
          <v-spacer />
          <v-text-field
            v-model="search"
            density="compact"
            variant="outlined"
            placeholder="Search tenants..."
            prepend-inner-icon="mdi-magnify"
            hide-details
            class="sa-search"
            style="max-width: 260px"
          />
          <v-select
            v-model="statusFilter"
            density="compact"
            variant="outlined"
            :items="statusOptions"
            hide-details
            class="sa-filter"
            style="max-width: 150px"
          />
          <v-select
            v-model="planFilter"
            density="compact"
            variant="outlined"
            :items="planOptions"
            hide-details
            class="sa-filter"
            style="max-width: 150px"
          />
        </div>

        <v-data-table
          :headers="headers"
          :items="filteredTenants"
          :items-per-page="15"
          density="comfortable"
          hover
          @click:row="openDetail"
        >
          <template #item.name="{ item }">
            <div class="d-flex align-center ga-2">
              <div class="sa-tenant-row__avatar" :style="avatarStyle(item.name)">
                {{ item.name?.charAt(0)?.toUpperCase() }}
              </div>
              <div>
                <p class="text-body-2 font-weight-medium">{{ item.name }}</p>
                <p class="text-caption text-medium-emphasis">{{ item.contact_email }}</p>
              </div>
            </div>
          </template>

          <template #item.plan="{ item }">
            <v-chip :color="planColor(item.plan)" size="small" variant="tonal" label>
              {{ item.plan }}
            </v-chip>
          </template>

          <template #item.status="{ item }">
            <v-chip :color="statusColor(item.status)" size="small" variant="tonal" label>
              {{ item.status }}
            </v-chip>
          </template>

          <template #item.limits="{ item }">
            <span class="text-body-2 text-medium-emphasis">
              {{ item.max_branches }}b · {{ item.max_users }}u · {{ item.max_products }}p
            </span>
          </template>

          <template #item.trial="{ item }">
            <span v-if="item.on_trial && item.trial_ends_at" class="text-body-2">
              <v-icon size="14" :color="item.days_to_trial_end <= 3 ? 'warning' : 'info'">mdi-clock-outline</v-icon>
              {{ item.days_to_trial_end }}d left
            </span>
            <span v-else class="text-body-2 text-medium-emphasis">—</span>
          </template>

          <template #item.created_on="{ item }">
            <span class="text-body-2 text-medium-emphasis">{{ formatDate(item.created_on) }}</span>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex ga-1" @click.stop>
              <v-btn
                v-if="item.status !== 'suspended'"
                size="small" variant="text" color="warning"
                :loading="actionLoading === item.id"
                @click="suspendTenant(item)"
              >Suspend</v-btn>
              <v-btn
                v-else
                size="small" variant="text" color="success"
                :loading="actionLoading === item.id"
                @click="activateTenant(item)"
              >Activate</v-btn>
              <v-btn size="small" variant="text" @click="openDetail(item)">Manage</v-btn>
            </div>
          </template>

          <template #no-data>
            <div class="sa-empty">
              <v-icon size="48" color="grey-lighten-1">mdi-domain-off</v-icon>
              <p class="text-body-1 text-medium-emphasis mt-2">No tenants found</p>
            </div>
          </template>
        </v-data-table>
      </div>
    </template>

    <!-- ===== Detail Drawer ===== -->
    <v-navigation-drawer
      v-model="drawerOpen"
      location="right"
      width="520"
      temporary
      class="sa-drawer"
    >
      <template v-if="selected">
        <div class="sa-drawer__header">
          <div class="d-flex align-center ga-3">
            <div class="sa-tenant-row__avatar" :style="avatarStyle(selected.name)" style="width:48px;height:48px;font-size:1.2rem">
              {{ selected.name?.charAt(0)?.toUpperCase() }}
            </div>
            <div class="flex-grow-1" style="min-width:0">
              <h3 class="text-h6 font-weight-bold" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ selected.name }}</h3>
              <p class="text-caption text-medium-emphasis">{{ selected.contact_email || '—' }}</p>
            </div>
            <v-btn icon="mdi-close" variant="text" size="small" @click="drawerOpen = false" />
          </div>
          <div class="d-flex ga-2 mt-3 flex-wrap">
            <v-chip :color="planColor(selected.plan)" size="small" variant="tonal" label>{{ selected.plan }}</v-chip>
            <v-chip :color="statusColor(selected.status)" size="small" variant="tonal" label>{{ selected.status }}</v-chip>
            <v-chip v-if="selected.on_trial" size="small" variant="tonal" color="info" label>
              {{ selected.days_to_trial_end }}d trial left
            </v-chip>
          </div>
        </div>

        <v-tabs v-model="detailTab" density="compact" color="primary" grow>
          <v-tab value="overview" prepend-icon="mdi-information-outline">Overview</v-tab>
          <v-tab value="manage" prepend-icon="mdi-pencil-outline">Manage</v-tab>
          <v-tab value="activity" prepend-icon="mdi-history">Activity</v-tab>
          <v-tab value="billing" prepend-icon="mdi-cash-multiple">Billing</v-tab>
        </v-tabs>

        <div class="sa-drawer__body">
          <v-window v-model="detailTab">
            <!-- Overview -->
            <v-window-item value="overview">
              <div class="sa-detail-grid mt-3">
                <div class="sa-detail-field"><span class="sa-detail-field__label">Schema</span><span class="sa-detail-field__value">{{ selected.schema_name }}</span></div>
                <div class="sa-detail-field"><span class="sa-detail-field__label">Currency</span><span class="sa-detail-field__value">{{ selected.currency_code }} ({{ selected.currency_symbol }})</span></div>
                <div class="sa-detail-field"><span class="sa-detail-field__label">Timezone</span><span class="sa-detail-field__value">{{ selected.timezone }}</span></div>
                <div class="sa-detail-field"><span class="sa-detail-field__label">Country</span><span class="sa-detail-field__value">{{ selected.country || '—' }}</span></div>
                <div class="sa-detail-field"><span class="sa-detail-field__label">Phone</span><span class="sa-detail-field__value">{{ selected.contact_phone || '—' }}</span></div>
                <div class="sa-detail-field"><span class="sa-detail-field__label">Created</span><span class="sa-detail-field__value">{{ formatDate(selected.created_on) }}</span></div>
                <div class="sa-detail-field"><span class="sa-detail-field__label">Max Branches</span><span class="sa-detail-field__value">{{ selected.max_branches }}</span></div>
                <div class="sa-detail-field"><span class="sa-detail-field__label">Max Users</span><span class="sa-detail-field__value">{{ selected.max_users }}</span></div>
                <div class="sa-detail-field"><span class="sa-detail-field__label">Max Products</span><span class="sa-detail-field__value">{{ selected.max_products }}</span></div>
                <div class="sa-detail-field"><span class="sa-detail-field__label">Est. MRR</span><span class="sa-detail-field__value">KSh {{ formatNum(selected.mrr_estimate) }}</span></div>
              </div>

              <div class="sa-divider" />
              <p class="text-caption text-medium-emphasis mb-2">DOMAINS</p>
              <div class="d-flex flex-wrap ga-2">
                <v-chip
                  v-for="d in selected.domains" :key="d.id"
                  size="small" variant="outlined" label
                  :color="d.is_primary ? 'primary' : undefined"
                >
                  <v-icon size="14" start>{{ d.is_primary ? 'mdi-star' : 'mdi-web' }}</v-icon>
                  {{ d.domain }}
                </v-chip>
                <span v-if="!selected.domains?.length" class="text-body-2 text-medium-emphasis">No domains</span>
              </div>

              <div class="sa-divider" />
              <p class="text-caption text-medium-emphasis mb-2">NOTES</p>
              <p class="text-body-2">{{ selected.notes || 'No internal notes' }}</p>
            </v-window-item>

            <!-- Manage -->
            <v-window-item value="manage">
              <div class="mt-3">
                <p class="text-caption text-medium-emphasis mb-2">PLAN & STATUS</p>
                <div class="d-flex ga-2 flex-wrap mb-3">
                  <v-select v-model="manageForm.plan" :items="planValues" density="compact" variant="outlined" label="Plan" hide-details style="max-width:180px" />
                  <v-btn color="primary" variant="tonal" prepend-icon="mdi-swap-horizontal" :loading="actionLoading === selected.id" @click="changePlan">Change Plan</v-btn>
                </div>
                <div class="d-flex ga-2 flex-wrap mb-3">
                  <v-btn v-if="selected.status !== 'suspended'" size="small" variant="outlined" color="warning" prepend-icon="mdi-pause" :loading="actionLoading === selected.id" @click="suspendTenant(selected)">Suspend</v-btn>
                  <v-btn v-if="selected.status !== 'active'" size="small" variant="outlined" color="success" prepend-icon="mdi-play" :loading="actionLoading === selected.id" @click="activateTenant(selected)">Activate</v-btn>
                  <v-btn v-if="selected.status !== 'cancelled'" size="small" variant="outlined" color="error" prepend-icon="mdi-cancel" :loading="actionLoading === selected.id" @click="cancelTenant(selected)">Cancel</v-btn>
                </div>

                <p class="text-caption text-medium-emphasis mb-2 mt-4">RESOURCE LIMITS</p>
                <div class="sa-detail-grid">
                  <v-text-field v-model.number="manageForm.max_branches" type="number" density="compact" variant="outlined" label="Max Branches" hide-details />
                  <v-text-field v-model.number="manageForm.max_users" type="number" density="compact" variant="outlined" label="Max Users" hide-details />
                  <v-text-field v-model.number="manageForm.max_products" type="number" density="compact" variant="outlined" label="Max Products" hide-details />
                </div>
                <v-btn class="mt-3" color="primary" variant="tonal" prepend-icon="mdi-content-save" :loading="actionLoading === selected.id" @click="setLimits">Save Limits</v-btn>

                <p class="text-caption text-medium-emphasis mb-2 mt-5">TRIAL</p>
                <div class="d-flex ga-2 align-center flex-wrap">
                  <v-text-field v-model="manageForm.trial_days" type="number" density="compact" variant="outlined" label="Extend by (days)" hide-details style="max-width:140px" />
                  <v-btn color="info" variant="tonal" prepend-icon="mdi-calendar-clock" :loading="actionLoading === selected.id" @click="extendTrial">Extend Trial</v-btn>
                </div>
              </div>
            </v-window-item>

            <!-- Activity -->
            <v-window-item value="activity">
              <div class="mt-3">
                <v-btn color="primary" variant="tonal" size="small" prepend-icon="mdi-refresh" :loading="loadingDrill" @click="loadActivity" class="mb-3">Load Activity</v-btn>
                <v-alert v-if="!activity.length && !loadingDrill" type="info" variant="tonal" density="compact">Click "Load Activity" to fetch this tenant's audit log.</v-alert>
                <v-timeline v-if="activity.length" density="compact" side="end">
                  <v-timeline-item v-for="(a, i) in activity" :key="i" size="x-small" :dot-color="activityColor(a.action)">
                    <div class="d-flex justify-space-between">
                      <span class="text-body-2 font-weight-medium">{{ a.action }}</span>
                      <span class="text-caption text-medium-emphasis">{{ formatTime(a.timestamp) }}</span>
                    </div>
                    <p class="text-caption text-medium-emphasis">{{ a.user_email || 'system' }} · {{ a.resource_type }}</p>
                  </v-timeline-item>
                </v-timeline>
              </div>
            </v-window-item>

            <!-- Billing -->
            <v-window-item value="billing">
              <div class="mt-3">
                <v-btn color="primary" variant="tonal" size="small" prepend-icon="mdi-refresh" :loading="loadingDrill" @click="loadBilling" class="mb-3">Load Billing</v-btn>
                <v-alert v-if="billing === null && !loadingDrill" type="info" variant="tonal" density="compact">Click "Load Billing" to fetch invoices & payments.</v-alert>
                <template v-if="billing">
                  <div class="d-flex ga-3 flex-wrap mb-4">
                    <v-chip color="success" variant="tonal" size="small">Paid: KSh {{ formatNum(billing.paid_total) }}</v-chip>
                    <v-chip color="primary" variant="tonal" size="small">{{ billing.invoices.length }} invoices</v-chip>
                    <v-chip color="info" variant="tonal" size="small">{{ billing.payments.length }} payments</v-chip>
                  </div>
                  <p class="text-caption text-medium-emphasis mb-1">INVOICES</p>
                  <v-list density="compact" lines="one" class="px-0">
                    <v-list-item v-for="inv in billing.invoices" :key="inv.id">
                      <v-list-item-title class="text-body-2">{{ inv.invoice_number }} — KSh {{ formatNum(inv.total) }}</v-list-item-title>
                      <v-list-item-subtitle>{{ inv.status }} · due {{ formatDate(inv.due_date) }}</v-list-item-subtitle>
                      <template #append><v-chip :color="invColor(inv.status)" size="x-small" variant="tonal" label>{{ inv.status }}</v-chip></template>
                    </v-list-item>
                  </v-list>
                </template>
              </div>
            </v-window-item>
          </v-window>
        </div>
      </template>
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const toast = useToast()

interface Tenant {
  id: number
  name: string
  schema_name: string
  plan: string
  status: string
  contact_email: string
  contact_phone: string
  country: string
  currency_code: string
  currency_symbol: string
  timezone: string
  on_trial: boolean
  trial_ends_at: string | null
  paid_until: string | null
  max_branches: number
  max_users: number
  max_products: number
  notes: string
  created_on: string
  days_to_trial_end: number | null
  is_trial_expired: boolean
  mrr_estimate: number
  domains: { id: number; domain: string; is_primary: boolean }[]
}

const loading = ref(false)
const tenants = ref<Tenant[]>([])
const search = ref('')
const statusFilter = ref('all')
const planFilter = ref('all')
const actionLoading = ref<number | null>(null)

const statusOptions = [
  { title: 'All Status', value: 'all' },
  { title: 'Active', value: 'active' },
  { title: 'Trial', value: 'trial' },
  { title: 'Suspended', value: 'suspended' },
  { title: 'Cancelled', value: 'cancelled' },
]
const planOptions = [
  { title: 'All Plans', value: 'all' },
  { title: 'Free', value: 'free' },
  { title: 'Starter', value: 'starter' },
  { title: 'Business', value: 'business' },
  { title: 'Enterprise', value: 'enterprise' },
]
const planValues = ['free', 'starter', 'business', 'enterprise']

const headers = [
  { title: 'Tenant', key: 'name', sortable: true },
  { title: 'Plan', key: 'plan', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Limits', key: 'limits', sortable: false },
  { title: 'Trial', key: 'trial', sortable: false },
  { title: 'Created', key: 'created_on', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
]

const filteredTenants = computed(() => {
  let list = tenants.value
  if (statusFilter.value !== 'all') list = list.filter(t => t.status === statusFilter.value)
  if (planFilter.value !== 'all') list = list.filter(t => t.plan === planFilter.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(t =>
      t.name?.toLowerCase().includes(q) ||
      t.contact_email?.toLowerCase().includes(q) ||
      t.schema_name?.toLowerCase().includes(q),
    )
  }
  return list
})

// ── Detail drawer ──
const drawerOpen = ref(false)
const selected = ref<Tenant | null>(null)
const detailTab = ref('overview')
const manageForm = reactive({
  plan: 'free',
  max_branches: 1,
  max_users: 5,
  max_products: 500,
  trial_days: 7,
})
const loadingDrill = ref(false)
const activity = ref<any[]>([])
const billing = ref<any | null>(null)

function openDetail(_event: any, item?: any) {
  const t = item?.item || item || _event
  selected.value = t as Tenant
  if (selected.value) {
    manageForm.plan = selected.value.plan
    manageForm.max_branches = selected.value.max_branches
    manageForm.max_users = selected.value.max_users
    manageForm.max_products = selected.value.max_products
    manageForm.trial_days = 7
  }
  activity.value = []
  billing.value = null
  detailTab.value = 'overview'
  drawerOpen.value = true
}

function planColor(plan: string): string {
  const map: Record<string, string> = { free: 'grey', starter: 'primary', business: 'purple', enterprise: 'amber' }
  return map[plan] || 'grey'
}
function statusColor(status: string): string {
  const map: Record<string, string> = { trial: 'info', active: 'success', suspended: 'warning', cancelled: 'error' }
  return map[status] || 'grey'
}
function activityColor(action: string): string {
  if (action?.includes('create')) return 'success'
  if (action?.includes('delete')) return 'error'
  if (action?.includes('update')) return 'warning'
  return 'primary'
}
function invColor(s: string): string {
  const m: Record<string, string> = { paid: 'success', overdue: 'error', sent: 'info', draft: 'grey', cancelled: 'grey' }
  return m[s] || 'grey'
}
function avatarStyle(name: string): Record<string, string> {
  const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#06b6d4', '#f43f5e']
  const idx = (name?.charCodeAt(0) || 0) % colors.length
  const c = colors[idx]
  return { background: c + '22', color: c }
}
function formatDate(v: string): string {
  return new Date(v).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
}
function formatTime(v: string): string {
  return new Date(v).toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function formatNum(v: number): string {
  return Number(v || 0).toLocaleString('en-US')
}

async function loadTenants() {
  loading.value = true
  try {
    const data = await useApi()('/tenants/manage/')
    tenants.value = data.results || data
  } catch {
    toast.error('Failed to load tenants')
  } finally {
    loading.value = false
  }
}

async function apiAction(id: number, action: string, body?: any) {
  actionLoading.value = id
  try {
    const res = await useApi()(`/tenants/manage/${id}/${action}/`, { method: 'POST', body })
    return res
  } finally {
    actionLoading.value = null
  }
}

async function refreshSelected() {
  if (!selected.value) return
  try {
    const updated = await useApi()(`/tenants/manage/${selected.value.id}/`)
    Object.assign(selected.value, updated)
  } catch { /* keep stale */ }
}

async function suspendTenant(t: Tenant) {
  try {
    await apiAction(t.id, 'suspend', { reason: 'Suspended by platform admin' })
    toast.success(`${t.name} suspended`)
    await refreshSelected()
    await loadTenants()
  } catch { toast.error('Failed to suspend tenant') }
}

async function activateTenant(t: Tenant) {
  try {
    await apiAction(t.id, 'activate')
    toast.success(`${t.name} activated`)
    await refreshSelected()
    await loadTenants()
  } catch { toast.error('Failed to activate tenant') }
}

async function cancelTenant(t: Tenant) {
  try {
    await apiAction(t.id, 'cancel')
    toast.success(`${t.name} cancelled`)
    await refreshSelected()
    await loadTenants()
  } catch { toast.error('Failed to cancel tenant') }
}

async function changePlan() {
  if (!selected.value) return
  try {
    await apiAction(selected.value.id, 'change_plan', { plan: manageForm.plan })
    toast.success(`Plan changed to ${manageForm.plan}`)
    await refreshSelected()
    await loadTenants()
  } catch { toast.error('Failed to change plan') }
}

async function setLimits() {
  if (!selected.value) return
  try {
    await apiAction(selected.value.id, 'set-limits', {
      max_branches: manageForm.max_branches,
      max_users: manageForm.max_users,
      max_products: manageForm.max_products,
    })
    toast.success('Limits updated')
    await refreshSelected()
    await loadTenants()
  } catch { toast.error('Failed to set limits') }
}

async function extendTrial() {
  if (!selected.value) return
  try {
    await apiAction(selected.value.id, 'extend-trial', { days: manageForm.trial_days })
    toast.success(`Trial extended by ${manageForm.trial_days} days`)
    await refreshSelected()
    await loadTenants()
  } catch { toast.error('Failed to extend trial') }
}

async function loadActivity() {
  if (!selected.value) return
  loadingDrill.value = true
  try {
    const res = await useApi()(`/tenants/manage/${selected.value.id}/activity/`)
    activity.value = res.logs || res.results || res || []
  } catch { toast.error('Failed to load activity') }
  finally { loadingDrill.value = false }
}

async function loadBilling() {
  if (!selected.value) return
  loadingDrill.value = true
  try {
    billing.value = await useApi()(`/tenants/manage/${selected.value.id}/billing/`)
  } catch { toast.error('Failed to load billing') }
  finally { loadingDrill.value = false }
}

onMounted(loadTenants)
</script>

<style scoped>
.sa-drawer :deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.sa-drawer__header {
  padding: 20px 20px 12px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  position: sticky;
  top: 0;
  background: rgb(var(--v-theme-surface));
  z-index: 1;
}
.sa-drawer__body {
  padding: 8px 20px 40px;
  flex: 1;
  overflow-y: auto;
}
</style>

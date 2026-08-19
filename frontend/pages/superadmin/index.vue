<template>
  <div class="sa-page">
    <!-- ===== Header ===== -->
    <div class="sa-header">
      <div class="sa-header__left">
        <div class="sa-header__title-icon">
          <v-icon size="24">mdi-server-network</v-icon>
        </div>
        <div>
          <h1 class="text-h5 font-weight-bold">Platform Dashboard</h1>
          <p class="text-body-2 text-medium-emphasis">Manage all tenants across the DomendraPOS platform</p>
        </div>
      </div>
      <div class="sa-header__actions">
        <v-btn variant="tonal" prepend-icon="mdi-refresh" size="small" @click="loadData" :loading="loading">Refresh</v-btn>
      </div>
    </div>

    <!-- ===== Loading (skeleton) ===== -->
    <div v-if="loading && stats === null" class="sa-skeleton">
      <div class="sa-kpi-grid">
        <v-skeleton-loader v-for="n in 5" :key="n" type="article" class="sa-skel-kpi" boilerplate />
      </div>
      <v-skeleton-loader type="table-tbody" class="sa-skel-table" boilerplate />
    </div>

    <template v-else>
      <!-- ===== KPI Row ===== -->
      <div class="sa-kpi-grid">
        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Total Tenants</span>
            <div class="sa-kpi__icon sa-kpi__icon--primary">
              <v-icon size="18">mdi-domain</v-icon>
            </div>
          </div>
          <p class="sa-kpi__value">{{ stats?.total_tenants ?? 0 }}</p>
          <div class="sa-kpi__sub">All registered workspaces</div>
        </div>

        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Active</span>
            <div class="sa-kpi__icon sa-kpi__icon--success">
              <v-icon size="18">mdi-check-circle</v-icon>
            </div>
          </div>
          <p class="sa-kpi__value text-success">{{ stats?.active ?? 0 }}</p>
          <div class="sa-kpi__sub">Paying or active subscriptions</div>
        </div>

        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Trial</span>
            <div class="sa-kpi__icon sa-kpi__icon--info">
              <v-icon size="18">mdi-clock-outline</v-icon>
            </div>
          </div>
          <p class="sa-kpi__value text-info">{{ stats?.trial ?? 0 }}</p>
          <div class="sa-kpi__sub">On free trial period</div>
        </div>

        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Suspended</span>
            <div class="sa-kpi__icon sa-kpi__icon--warning">
              <v-icon size="18">mdi-pause-circle</v-icon>
            </div>
          </div>
          <p class="sa-kpi__value text-warning">{{ stats?.suspended ?? 0 }}</p>
          <div class="sa-kpi__sub">Temporarily disabled</div>
        </div>

        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Cancelled</span>
            <div class="sa-kpi__icon sa-kpi__icon--error">
              <v-icon size="18">mdi-close-circle</v-icon>
            </div>
          </div>
          <p class="sa-kpi__value text-error">{{ stats?.cancelled ?? 0 }}</p>
          <div class="sa-kpi__sub">No longer active</div>
        </div>
      </div>

      <!-- ===== Plan Distribution ===== -->
      <div class="sa-plan-row">
        <div class="sa-card sa-card--full">
          <div class="sa-card__header">
            <div class="sa-card__header-icon sa-card__header-icon--blue">
              <v-icon size="20">mdi-credit-card-outline</v-icon>
            </div>
            <div>
              <h3 class="sa-card__title">Plan Distribution</h3>
              <p class="sa-card__subtitle">Tenants by subscription plan</p>
            </div>
          </div>
          <div class="sa-card__body">
            <div class="sa-plan-grid">
              <div v-for="plan in planCards" :key="plan.key" class="sa-plan-card">
                <div class="sa-plan-card__icon" :style="{ background: plan.color + '1a', color: plan.color }">
                  <v-icon size="20">{{ plan.icon }}</v-icon>
                </div>
                <div>
                  <p class="sa-plan-card__label">{{ plan.label }}</p>
                  <p class="sa-plan-card__value">{{ plan.count }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Tenants Table ===== -->
      <div class="sa-card sa-card--full">
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
            style="max-width: 280px"
          />
          <v-select
            v-model="statusFilter"
            density="compact"
            variant="outlined"
            :items="statusOptions"
            hide-details
            class="sa-filter"
            style="max-width: 160px"
          />
        </div>

        <v-data-table
          :headers="headers"
          :items="filteredTenants"
          :items-per-page="10"
          density="comfortable"
          hover
        >
          <template #item.name="{ item }">
            <div class="d-flex align-center ga-2">
              <v-avatar size="32" color="primary" variant="tonal">
                <span class="text-body-2 font-weight-bold">{{ item.name?.charAt(0)?.toUpperCase() }}</span>
              </v-avatar>
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

          <template #item.currency="{ item }">
            <span class="text-body-2">{{ item.currency_code }} ({{ item.currency_symbol }})</span>
          </template>

          <template #item.created_on="{ item }">
            <span class="text-body-2 text-medium-emphasis">{{ formatDate(item.created_on) }}</span>
          </template>

          <template #item.domains="{ item }">
            <div class="d-flex flex-wrap ga-1">
              <v-chip
                v-for="d in item.domains"
                :key="d.id"
                size="x-small"
                variant="outlined"
                label
              >{{ d.domain }}</v-chip>
            </div>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex ga-1">
              <v-btn
                v-if="item.status !== 'suspended'"
                size="small"
                variant="text"
                color="warning"
                prepend-icon="mdi-pause"
                :loading="actionLoading === item.id"
                @click="suspendTenant(item)"
              >Suspend</v-btn>
              <v-btn
                v-else
                size="small"
                variant="text"
                color="success"
                prepend-icon="mdi-play"
                :loading="actionLoading === item.id"
                @click="activateTenant(item)"
              >Activate</v-btn>
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
  currency_code: string
  currency_symbol: string
  created_on: string
  domains: { id: number; domain: string; is_primary: boolean }[]
}

interface PlatformStats {
  total_tenants: number
  active: number
  trial: number
  suspended: number
  cancelled: number
  by_plan: { free: number; starter: number; business: number; enterprise: number }
  recent_tenants: Tenant[]
}

const loading = ref(false)
const stats = ref<PlatformStats | null>(null)
const tenants = ref<Tenant[]>([])
const search = ref('')
const statusFilter = ref('all')
const actionLoading = ref<number | null>(null)

const statusOptions = [
  { title: 'All', value: 'all' },
  { title: 'Active', value: 'active' },
  { title: 'Trial', value: 'trial' },
  { title: 'Suspended', value: 'suspended' },
  { title: 'Cancelled', value: 'cancelled' },
]

const headers = [
  { title: 'Tenant', key: 'name', sortable: true },
  { title: 'Plan', key: 'plan', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Currency', key: 'currency', sortable: false },
  { title: 'Domains', key: 'domains', sortable: false },
  { title: 'Created', key: 'created_on', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
]

const planCards = computed(() => [
  { key: 'free', label: 'Free', count: stats.value?.by_plan?.free ?? 0, icon: 'mdi-package-variant', color: '#94a3b8' },
  { key: 'starter', label: 'Starter', count: stats.value?.by_plan?.starter ?? 0, icon: 'mdi-rocket-launch', color: '#3b82f6' },
  { key: 'business', label: 'Business', count: stats.value?.by_plan?.business ?? 0, icon: 'mdi-briefcase', color: '#8b5cf6' },
  { key: 'enterprise', label: 'Enterprise', count: stats.value?.by_plan?.enterprise ?? 0, icon: 'mdi-domain', color: '#f59e0b' },
])

const filteredTenants = computed(() => {
  let list = tenants.value
  if (statusFilter.value !== 'all') {
    list = list.filter(t => t.status === statusFilter.value)
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(t =>
      t.name?.toLowerCase().includes(q) ||
      t.contact_email?.toLowerCase().includes(q) ||
      t.schema_name?.toLowerCase().includes(q)
    )
  }
  return list
})

function planColor(plan: string): string {
  const map: Record<string, string> = {
    free: 'grey',
    starter: 'primary',
    business: 'purple',
    enterprise: 'amber',
  }
  return map[plan] || 'grey'
}

function statusColor(status: string): string {
  const map: Record<string, string> = {
    trial: 'info',
    active: 'success',
    suspended: 'warning',
    cancelled: 'error',
  }
  return map[status] || 'grey'
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function loadData() {
  loading.value = true
  try {
    const [statsData, tenantsData] = await Promise.all([
      useApi()('/tenants/manage/stats/'),
      useApi()('/tenants/manage/'),
    ])
    stats.value = statsData
    tenants.value = tenantsData.results || tenantsData
  } catch {
    toast.error('Failed to load platform data')
  } finally {
    loading.value = false
  }
}

async function suspendTenant(tenant: Tenant) {
  actionLoading.value = tenant.id
  try {
    await useApi()(`/tenants/manage/${tenant.id}/suspend/`, { method: 'POST' })
    tenant.status = 'suspended'
    toast.success(`${tenant.name} suspended`)
  } catch {
    toast.error('Failed to suspend tenant')
  } finally {
    actionLoading.value = null
  }
}

async function activateTenant(tenant: Tenant) {
  actionLoading.value = tenant.id
  try {
    await useApi()(`/tenants/manage/${tenant.id}/activate/`, { method: 'POST' })
    tenant.status = 'active'
    toast.success(`${tenant.name} activated`)
  } catch {
    toast.error('Failed to activate tenant')
  } finally {
    actionLoading.value = null
  }
}

onMounted(loadData)
</script>

<style scoped>
.sa-page {
  padding: 20px 24px;
  max-width: 1600px;
  margin: 0 auto;
  font-family: "Segoe UI Variable", Inter, system-ui, sans-serif;
}

/* ===== Header ===== */
.sa-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.sa-header__left { display: flex; align-items: center; gap: 14px; }
.sa-header__title-icon {
  width: 48px; height: 48px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(52, 120, 246, 0.12);
  color: #3478f6;
  flex-shrink: 0;
}
.sa-header__actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

/* ===== Skeleton ===== */
.sa-skeleton { display: flex; flex-direction: column; gap: 20px; }
.sa-skel-kpi { border-radius: 16px !important; height: 110px; }
.sa-skel-table { border-radius: 16px !important; min-height: 400px; }

/* ===== KPI Grid ===== */
.sa-kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.sa-kpi {
  padding: 18px 20px;
  border-radius: 16px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.sa-kpi:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); }
.sa-kpi__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}
.sa-kpi__icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.sa-kpi__icon--success { background: rgba(76, 175, 80, 0.12); color: rgb(76, 175, 80); }
.sa-kpi__icon--primary { background: rgba(52, 120, 246, 0.12); color: #3478f6; }
.sa-kpi__icon--info    { background: rgba(33, 150, 243, 0.12); color: rgb(33, 150, 243); }
.sa-kpi__icon--warning { background: rgba(255, 152, 0, 0.12); color: rgb(255, 152, 0); }
.sa-kpi__icon--error   { background: rgba(239, 83, 80, 0.12); color: rgb(239, 83, 80); }
.sa-kpi__label {
  font-size: 0.6875rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}
.sa-kpi__value {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 4px;
  line-height: 1.2;
}
.sa-kpi__sub {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.4);
}

/* ===== Plan Row ===== */
.sa-plan-row { margin-bottom: 20px; }

/* ===== Card ===== */
.sa-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}
.sa-card--full { min-height: auto; }
.sa-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.sa-card__header-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.sa-card__header-icon--blue  { background: rgba(52, 120, 246, 0.12); color: #3478f6; }
.sa-card__header-icon--indigo { background: rgba(99, 102, 241, 0.12); color: rgb(99, 102, 241); }
.sa-card__title { font-size: 0.9375rem; font-weight: 700; letter-spacing: -0.01em; }
.sa-card__subtitle { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.4); margin-top: 1px; }
.sa-card__body { padding: 14px 20px 20px; flex: 1; }

/* ===== Plan Cards ===== */
.sa-plan-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.sa-plan-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
.sa-plan-card__icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.sa-plan-card__label {
  font-size: 0.6875rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
  margin: 0;
}
.sa-plan-card__value {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
}

/* ===== Empty ===== */
.sa-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
}

/* ===== Mobile ===== */
@media (max-width: 1400px) {
  .sa-kpi-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1024px) {
  .sa-kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .sa-plan-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .sa-page { padding: 12px; }
  .sa-kpi-grid { grid-template-columns: 1fr 1fr; }
  .sa-header__left { flex-direction: column; align-items: flex-start; gap: 8px; }
}
@media (max-width: 480px) {
  .sa-kpi-grid { grid-template-columns: 1fr; }
  .sa-plan-grid { grid-template-columns: 1fr; }
}
</style>

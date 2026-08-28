<template>
  <div class="sa-page">
    <!-- ===== Header ===== -->
    <div class="sa-header">
      <div class="sa-header__left">
        <div class="sa-header__title-icon">
          <v-icon size="26">mdi-server-network</v-icon>
        </div>
        <div>
          <h1 class="text-h5 font-weight-bold">Platform Dashboard</h1>
          <p class="text-body-2 text-medium-emphasis">Manage all tenants across the DomendraPOS platform</p>
        </div>
      </div>
      <div class="sa-header__actions">
        <v-btn variant="outlined" prepend-icon="mdi-account-plus-outline" to="/superadmin/tenants">Manage Tenants</v-btn>
        <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="loadData">Refresh</v-btn>
      </div>
    </div>

    <!-- ===== Loading (skeleton) ===== -->
    <div v-if="loading && stats === null" class="sa-skeleton">
      <div class="sa-kpi-grid">
        <v-skeleton-loader v-for="n in 8" :key="n" type="article" class="sa-skel-kpi" boilerplate />
      </div>
      <v-skeleton-loader type="card, table-tbody" class="sa-skel-table" boilerplate />
    </div>

    <template v-else>
      <!-- ===== Hero KPI Row ===== -->
      <div class="sa-kpi-grid">
        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Total Tenants</span>
            <div class="sa-kpi__icon sa-kpi__icon--primary">
              <v-icon size="20">mdi-domain</v-icon>
            </div>
          </div>
          <p class="sa-kpi__value">{{ stats?.total_tenants ?? 0 }}</p>
          <div class="sa-kpi__sub">
            <span class="sa-kpi__delta sa-kpi__delta--up">
              <v-icon size="12">mdi-trending-up</v-icon>
              {{ stats?.new_this_month ?? 0 }} new this month
            </span>
          </div>
        </div>

        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Active</span>
            <div class="sa-kpi__icon sa-kpi__icon--success">
              <v-icon size="20">mdi-check-circle</v-icon>
            </div>
          </div>
          <p class="sa-kpi__value text-success">{{ stats?.active ?? 0 }}</p>
          <div class="sa-kpi__sub">{{ activePct }}% of all tenants</div>
        </div>

        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">On Trial</span>
            <div class="sa-kpi__icon sa-kpi__icon--info">
              <v-icon size="20">mdi-clock-outline</v-icon>
            </div>
          </div>
          <p class="sa-kpi__value text-info">{{ stats?.trial ?? 0 }}</p>
          <div class="sa-kpi__sub">{{ stats?.trial_expiring ?? 0 }} expiring soon</div>
        </div>

        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Est. Monthly Revenue</span>
            <div class="sa-kpi__icon sa-kpi__icon--teal">
              <v-icon size="20">mdi-cash-multiple</v-icon>
            </div>
          </div>
          <p class="sa-kpi__value">KSh {{ formatNum(stats?.mrr_estimate ?? 0) }}</p>
          <div class="sa-kpi__sub">Projected MRR across active plans</div>
        </div>

        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Suspended</span>
            <div class="sa-kpi__icon sa-kpi__icon--warning">
              <v-icon size="20">mdi-pause-circle</v-icon>
            </div>
          </div>
          <p class="sa-kpi__value text-warning">{{ stats?.suspended ?? 0 }}</p>
          <div class="sa-kpi__sub">Temporarily disabled</div>
        </div>

        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Cancelled</span>
            <div class="sa-kpi__icon sa-kpi__icon--error">
              <v-icon size="20">mdi-close-circle</v-icon>
            </div>
          </div>
          <p class="sa-kpi__value text-error">{{ stats?.cancelled ?? 0 }}</p>
          <div class="sa-kpi__sub">No longer active</div>
        </div>

        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">New This Month</span>
            <div class="sa-kpi__icon sa-kpi__icon--accent">
              <v-icon size="20">mdi-account-plus</v-icon>
            </div>
          </div>
          <p class="sa-kpi__value">{{ stats?.new_this_month ?? 0 }}</p>
          <div class="sa-kpi__sub">Tenants onboarded in {{ monthName }}</div>
        </div>

        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Trial Expiring</span>
            <div class="sa-kpi__icon sa-kpi__icon--warning">
              <v-icon size="20">mdi-alert-clock</v-icon>
            </div>
          </div>
          <p class="sa-kpi__value text-warning">{{ stats?.trial_expiring ?? 0 }}</p>
          <div class="sa-kpi__sub">Within 3 days — follow up</div>
        </div>
      </div>

      <!-- ===== Two column: Plan distribution + Recent tenants ===== -->
      <div class="sa-two-col">
        <!-- Plan distribution with progress bars -->
        <div class="sa-card">
          <div class="sa-card__header">
            <div class="sa-card__header-icon sa-card__header-icon--indigo">
              <v-icon size="20">mdi-credit-card-outline</v-icon>
            </div>
            <div>
              <h3 class="sa-card__title">Plan Distribution</h3>
              <p class="sa-card__subtitle">Tenants by subscription plan & projected revenue</p>
            </div>
          </div>
          <div class="sa-card__body">
            <div v-for="plan in planCards" :key="plan.key" class="sa-bar-row">
              <div class="sa-bar-row__top">
                <div class="d-flex align-center ga-2">
                  <v-icon size="18" :color="plan.color">{{ plan.icon }}</v-icon>
                  <span class="sa-bar-row__label" :style="{ color: plan.color }">{{ plan.label }}</span>
                </div>
                <div class="d-flex align-center ga-2">
                  <span class="sa-bar-row__count">{{ plan.count }} tenants</span>
                  <v-chip size="x-small" variant="tonal" :color="plan.color">KSh {{ formatNum(plan.mrr) }}/mo</v-chip>
                </div>
              </div>
              <div class="sa-bar">
                <div class="sa-bar__fill" :style="{ width: plan.pct + '%', background: plan.color }" />
              </div>
            </div>
          </div>
        </div>

        <!-- Recent tenants -->
        <div class="sa-card">
          <div class="sa-card__header">
            <div class="sa-card__header-icon sa-card__header-icon--blue">
              <v-icon size="20">mdi-clock-alert-outline</v-icon>
            </div>
            <div>
              <h3 class="sa-card__title">Recent Tenants</h3>
              <p class="sa-card__subtitle">Latest onboarded workspaces</p>
            </div>
            <v-spacer />
            <v-btn variant="text" size="small" to="/superadmin/tenants" append-icon="mdi-arrow-right">View all</v-btn>
          </div>
          <div class="sa-card__body">
            <div v-if="recentTenants.length === 0" class="sa-empty">
              <v-icon size="40" color="grey-lighten-1">mdi-domain-off</v-icon>
              <p class="text-body-2 text-medium-emphasis mt-2">No tenants yet</p>
            </div>
            <div v-for="t in recentTenants" :key="t.id" class="sa-tenant-row">
              <div class="sa-tenant-row__avatar" :style="avatarStyle(t.name)">
                {{ t.name?.charAt(0)?.toUpperCase() }}
              </div>
              <div class="flex-grow-1" style="min-width: 0">
                <p class="sa-tenant-row__name" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ t.name }}</p>
                <p class="sa-tenant-row__meta">{{ t.contact_email || '—' }} · {{ formatDate(t.created_on) }}</p>
              </div>
              <v-chip :color="statusColor(t.status)" size="x-small" variant="tonal" label>{{ t.status }}</v-chip>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Quick actions ===== -->
      <div class="sa-card">
        <div class="sa-card__header">
          <div class="sa-card__header-icon sa-card__header-icon--green">
            <v-icon size="20">mdi-flash-outline</v-icon>
          </div>
          <div>
            <h3 class="sa-card__title">Quick Actions</h3>
            <p class="sa-card__subtitle">Jump to common platform tasks</p>
          </div>
        </div>
        <div class="sa-card__body">
          <div class="sa-quick-grid">
            <NuxtLink to="/superadmin/tenants" class="sa-quick">
              <div class="sa-quick__icon" style="background:rgba(52,120,246,0.14);color:rgb(52,120,246)">
                <v-icon size="20">mdi-domain</v-icon>
              </div>
              <div>
                <p class="sa-quick__label">Manage Tenants</p>
                <p class="sa-quick__desc">Suspend, activate, change plans & limits</p>
              </div>
            </NuxtLink>
            <NuxtLink to="/superadmin/billing" class="sa-quick">
              <div class="sa-quick__icon" style="background:rgba(139,92,246,0.14);color:rgb(139,92,246)">
                <v-icon size="20">mdi-file-document-outline</v-icon>
              </div>
              <div>
                <p class="sa-quick__label">Platform Invoices</p>
                <p class="sa-quick__desc">View invoices & payments across tenants</p>
              </div>
            </NuxtLink>
            <NuxtLink to="/superadmin/payments" class="sa-quick">
              <div class="sa-quick__icon" style="background:rgba(13,148,136,0.14);color:rgb(13,148,136)">
                <v-icon size="20">mdi-cellphone-link</v-icon>
              </div>
              <div>
                <p class="sa-quick__label">M-Pesa Payments</p>
                <p class="sa-quick__desc">All mobile money transactions</p>
              </div>
            </NuxtLink>
            <NuxtLink to="/superadmin/plans" class="sa-quick">
              <div class="sa-quick__icon" style="background:rgba(245,158,11,0.14);color:rgb(245,158,11)">
                <v-icon size="20">mdi-layers-triple</v-icon>
              </div>
              <div>
                <p class="sa-quick__label">Subscription Plans</p>
                <p class="sa-quick__desc">Configure pricing, features & limits</p>
              </div>
            </NuxtLink>
          </div>
        </div>
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
  trial_expiring: number
  mrr_estimate: number
  new_this_month: number
  by_plan: { free: number; starter: number; business: number; enterprise: number }
  recent_tenants: Tenant[]
}

const loading = ref(false)
const stats = ref<PlatformStats | null>(null)

const PLAN_META = {
  free: { label: 'Free', icon: 'mdi-package-variant', color: '#94a3b8', mrr: 0 },
  starter: { label: 'Starter', icon: 'mdi-rocket-launch', color: '#3b82f6', mrr: 1500 },
  business: { label: 'Business', icon: 'mdi-briefcase', color: '#8b5cf6', mrr: 5000 },
  enterprise: { label: 'Enterprise', icon: 'mdi-domain', color: '#f59e0b', mrr: 15000 },
} as const

const planCards = computed(() => {
  const total = stats.value?.total_tenants || 1
  return (Object.keys(PLAN_META) as (keyof typeof PLAN_META)[]).map(key => {
    const meta = PLAN_META[key]
    const count = stats.value?.by_plan?.[key] ?? 0
    return {
      key,
      label: meta.label,
      icon: meta.icon,
      color: meta.color,
      count,
      mrr: count * meta.mrr,
      pct: Math.round((count / total) * 100),
    }
  })
})

const recentTenants = computed(() => stats.value?.recent_tenants ?? [])

const activePct = computed(() => {
  const t = stats.value?.total_tenants || 0
  return t > 0 ? Math.round(((stats.value?.active ?? 0) / t) * 100) : 0
})

const monthName = computed(() =>
  new Date().toLocaleDateString('en-US', { month: 'long' }),
)

function statusColor(status: string): string {
  const map: Record<string, string> = {
    trial: 'info',
    active: 'success',
    suspended: 'warning',
    cancelled: 'error',
  }
  return map[status] || 'grey'
}

function avatarStyle(name: string): Record<string, string> {
  const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#06b6d4', '#f43f5e']
  const idx = (name?.charCodeAt(0) || 0) % colors.length
  const c = colors[idx]
  return { background: c + '22', color: c }
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatNum(v: number): string {
  return Number(v || 0).toLocaleString('en-US')
}

async function loadData() {
  loading.value = true
  try {
    stats.value = await useApi()('/tenants/manage/stats/')
  } catch {
    toast.error('Failed to load platform data')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

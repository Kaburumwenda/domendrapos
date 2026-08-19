<template>
  <div class="aud-page">
    <!-- Header -->
    <div class="aud-header">
      <div class="aud-header__left">
        <h1 class="aud-header__title">Audit Logs</h1>
        <p class="aud-header__sub">
          Immutable trail of every security-relevant action across the system
        </p>
      </div>
      <div class="aud-header__actions">
        <button class="aud-btn aud-btn--ghost" @click="refreshAll">
          <v-icon size="18">mdi-refresh</v-icon>
          Refresh
        </button>
        <button class="aud-btn aud-btn--ghost" :disabled="!filteredLogs.length" @click="exportCsv">
          <v-icon size="18">mdi-download</v-icon>
          Export CSV
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="aud-kpi-grid">
      <div v-for="kpi in kpis" :key="kpi.label" class="aud-kpi">
        <div class="aud-kpi__icon" :class="`aud-kpi__icon--${kpi.color}`">
          <v-icon size="22">{{ kpi.icon }}</v-icon>
        </div>
        <div class="aud-kpi__body">
          <p class="aud-kpi__label">{{ kpi.label }}</p>
          <p class="aud-kpi__value">{{ kpi.value }}</p>
        </div>
      </div>
    </div>

    <!-- Activity Chart -->
    <div class="aud-chart-card" v-if="summary">
      <div class="aud-chart-card__head">
        <div>
          <h3 class="aud-chart-card__title">Activity — Last 7 Days</h3>
          <p class="aud-chart-card__sub">Daily audit events</p>
        </div>
        <div class="aud-chart-card__legend">
          <span class="aud-chart-card__legend-dot"></span>
          Events
        </div>
      </div>
      <div class="aud-chart">
        <div
          v-for="(day, i) in summary.by_day"
          :key="i"
          class="aud-chart__bar-col"
          :title="`${day.date}: ${day.count} events`"
        >
          <div class="aud-chart__bar-value">{{ day.count || '' }}</div>
          <div class="aud-chart__bar-track">
            <div
              class="aud-chart__bar-fill"
              :style="{ height: `${(day.count / maxDayCount) * 100}%` }"
            ></div>
          </div>
          <div class="aud-chart__bar-label">{{ formatDayShort(day.date) }}</div>
        </div>
      </div>
    </div>

    <!-- Toolbar + Filters -->
    <div class="aud-toolbar">
      <div class="aud-toolbar__search">
        <v-icon size="18" class="aud-toolbar__icon">mdi-magnify</v-icon>
        <input
          v-model="search"
          class="aud-toolbar__input"
          placeholder="Search description, resource ID, user..."
        />
      </div>
      <div class="aud-toolbar__selects">
        <select v-model="actionFilter" class="aud-toolbar__select">
          <option value="">All Actions</option>
          <option v-for="a in actionOptions" :key="a.value" :value="a.value">
            {{ a.label }}
          </option>
        </select>
        <select v-model="resourceFilter" class="aud-toolbar__select">
          <option value="">All Resources</option>
          <option v-for="r in resourceOptions" :key="r" :value="r">
            {{ resourceLabels[r] || r }}
          </option>
        </select>
        <select v-model="userFilter" class="aud-toolbar__select">
          <option value="">All Users</option>
          <option v-for="u in userOptions" :key="u" :value="u">{{ u }}</option>
        </select>
      </div>
    </div>

    <!-- Action Filter Pills -->
    <div class="aud-pills">
      <button
        class="aud-pills__pill"
        :class="{ 'aud-pills__pill--active': actionFilter === '' }"
        @click="actionFilter = ''"
      >
        All
        <span class="aud-pills__count">{{ logs.length }}</span>
      </button>
      <button
        v-for="a in actionPills"
        :key="a.value"
        class="aud-pills__pill"
        :class="{ 'aud-pills__pill--active': actionFilter === a.value }"
        @click="actionFilter = a.value"
      >
        <span class="aud-pills__dot" :class="`aud-pills__dot--${a.color}`"></span>
        {{ a.label }}
        <span class="aud-pills__count">{{ a.count }}</span>
      </button>
    </div>

    <!-- Logs Table -->
    <div class="aud-table-wrap">
      <div v-if="loading" class="aud-loading">
        <v-progress-circular indeterminate color="primary" size="48" width="4" />
        <p>Loading audit trail...</p>
      </div>
      <div v-else-if="!filteredLogs.length" class="aud-empty">
        <v-icon size="48" class="aud-empty__icon">mdi-shield-check-outline</v-icon>
        <p class="aud-empty__title">No matching audit entries</p>
        <p class="aud-empty__sub">Try adjusting your filters</p>
      </div>
      <div v-else class="aud-table-scroll">
        <table class="aud-table">
          <thead>
            <tr>
              <th class="aud-table__th">Action</th>
              <th class="aud-table__th">Resource</th>
              <th class="aud-table__th">Description</th>
              <th class="aud-table__th">User</th>
              <th class="aud-table__th">IP</th>
              <th class="aud-table__th">Time</th>
              <th class="aud-table__th aud-table__th--right"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="log in paginatedLogs"
              :key="log.id"
              class="aud-table__row"
              @click="openDetail(log)"
            >
              <td class="aud-table__cell">
                <span class="aud-action-chip" :class="`aud-action-chip--${log.action}`">
                  <v-icon size="14">{{ actionIcon(log.action) }}</v-icon>
                  {{ log.action_label }}
                </span>
              </td>
              <td class="aud-table__cell">
                <div class="aud-resource">
                  <span class="aud-resource__type">{{ log.resource_label || log.resource_type }}</span>
                  <span v-if="log.resource_id" class="aud-resource__id">#{{ log.resource_id }}</span>
                </div>
              </td>
              <td class="aud-table__cell aud-table__cell--desc">
                <p class="aud-table__desc">{{ log.description }}</p>
              </td>
              <td class="aud-table__cell">
                <span class="aud-user">{{ log.user_email || 'anonymous' }}</span>
              </td>
              <td class="aud-table__cell">
                <span class="aud-ip">{{ log.ip_address || '—' }}</span>
              </td>
              <td class="aud-table__cell">
                <div class="aud-time">
                  <p class="aud-time__rel">{{ relativeTime(log.timestamp) }}</p>
                  <p class="aud-time__abs">{{ formatDateTime(log.timestamp) }}</p>
                </div>
              </td>
              <td class="aud-table__cell aud-table__cell--right">
                <v-icon size="18" class="aud-table__chevron">mdi-chevron-right</v-icon>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredLogs.length" class="aud-pagination">
        <p class="aud-pagination__info">
          Showing {{ pageStart + 1 }}–{{ pageEnd }} of {{ filteredLogs.length }}
        </p>
        <div class="aud-pagination__nav">
          <button
            class="aud-pagination__page"
            :disabled="page === 1"
            @click="page--"
          >
            <v-icon size="16">mdi-chevron-left</v-icon>
          </button>
          <span class="aud-pagination__current">{{ page }} / {{ totalPages }}</span>
          <button
            class="aud-pagination__page"
            :disabled="page === totalPages"
            @click="page++"
          >
            <v-icon size="16">mdi-chevron-right</v-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Dialog -->
    <v-dialog v-model="detailDialog" max-width="680" scroll-strategy="block">
      <v-card rounded="xl" class="aud-dialog" v-if="selected">
        <div class="aud-dialog__header">
          <div class="aud-dialog__header-icon" :class="`aud-dialog__header-icon--${selected.action_color}`">
            <v-icon size="24">{{ actionIcon(selected.action) }}</v-icon>
          </div>
          <div class="flex-1">
            <h3 class="text-h6 font-weight-bold">{{ selected.action_label }} — {{ selected.resource_label }}</h3>
            <p class="text-body-2 text-medium-emphasis">{{ selected.description }}</p>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="detailDialog = false" />
        </div>
        <v-divider />
        <div class="aud-dialog__body">
          <div class="aud-detail-grid">
            <div class="aud-detail-item">
              <p class="aud-detail__label">User</p>
              <p class="aud-detail__value">{{ selected.user_email || 'anonymous' }}</p>
            </div>
            <div class="aud-detail-item">
              <p class="aud-detail__label">User ID</p>
              <p class="aud-detail__value">{{ selected.user_id || '—' }}</p>
            </div>
            <div class="aud-detail-item">
              <p class="aud-detail__label">Resource ID</p>
              <p class="aud-detail__value">{{ selected.resource_id || '—' }}</p>
            </div>
            <div class="aud-detail-item">
              <p class="aud-detail__label">IP address</p>
              <p class="aud-detail__value">{{ selected.ip_address || '—' }}</p>
            </div>
            <div class="aud-detail-item">
              <p class="aud-detail__label">Timestamp</p>
              <p class="aud-detail__value">{{ formatDateTime(selected.timestamp) }}</p>
            </div>
            <div class="aud-detail-item aud-detail-item--wide">
              <p class="aud-detail__label">User agent</p>
              <p class="aud-detail__value aud-detail__value--mono">{{ selected.user_agent || '—' }}</p>
            </div>
          </div>
          <div v-if="selected.new_values && Object.keys(selected.new_values).length" class="aud-detail-values">
            <p class="aud-detail__label">Submitted values</p>
            <pre class="aud-detail__json">{{ JSON.stringify(selected.new_values, null, 2) }}</pre>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { AuditLog, AuditSummary, AuditAction } from '~/types/iam'

definePageMeta({ middleware: 'auth' })

const api = useApi()
const toast = useToast()

/* ----------------------------------------------------------- state */

const loading = ref(false)
const logs = ref<AuditLog[]>([])
const summary = ref<AuditSummary | null>(null)

const detailDialog = ref(false)
const selected = ref<AuditLog | null>(null)

const search = ref('')
const actionFilter = ref('')
const resourceFilter = ref('')
const userFilter = ref('')

const page = ref(1)
const pageSize = 20

/* ----------------------------------------------------------- constants */

const actionLabels: Record<string, string> = {
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
  login: 'Login',
  logout: 'Logout',
  approve: 'Approve',
  reject: 'Reject',
  void: 'Void',
  refund: 'Refund',
  export: 'Export',
  config_change: 'Config Change',
}

const actionColors: Record<string, string> = {
  create: 'success',
  update: 'info',
  delete: 'error',
  login: 'primary',
  logout: 'neutral',
  approve: 'success',
  reject: 'warning',
  void: 'error',
  refund: 'warning',
  export: 'info',
  config_change: 'secondary',
}

const resourceLabels: Record<string, string> = {
  User: 'Staff',
  Product: 'Product',
  Customer: 'Customer',
  Supplier: 'Supplier',
  PurchaseOrder: 'Purchase Order',
  GoodsReceipt: 'Goods Receipt',
  POSTransaction: 'POS Sale',
  ParkedSale: 'Parked Sale',
  POSShift: 'Cashier Shift',
  POSCredit: 'Credit Account',
  Sale: 'Sale',
  Refund: 'Refund',
  StockItem: 'Stock Item',
  StockAdjustment: 'Stock Adjustment',
  Expense: 'Expense',
  CustomerInvoice: 'Invoice',
  Permission: 'Permission',
  RolePermission: 'Role Permission',
  Client: 'Tenant',
  Branch: 'Branch',
  Register: 'Register',
  StockTransfer: 'Stock Transfer',
}

function actionIcon(a: string): string {
  const map: Record<string, string> = {
    create: 'mdi-plus-circle-outline',
    update: 'mdi-pencil-outline',
    delete: 'mdi-delete-outline',
    login: 'mdi-login',
    logout: 'mdi-logout',
    approve: 'mdi-check-decagram-outline',
    reject: 'mdi-close-circle-outline',
    void: 'mdi-cancel',
    refund: 'mdi-cash-refund',
    export: 'mdi-download-outline',
    config_change: 'mdi-cog-outline',
  }
  return map[a] || 'mdi-circle-outline'
}

/* ----------------------------------------------------------- computed */

const resourceOptions = computed(() => {
  const s = new Set<string>()
  for (const l of logs.value) s.add(l.resource_type)
  return Array.from(s).sort()
})

const userOptions = computed(() => {
  const s = new Set<string>()
  for (const l of logs.value) if (l.user_email) s.add(l.user_email)
  return Array.from(s).sort()
})

const actionOptions = computed(() => {
  return Object.keys(actionLabels).map((v) => ({ value: v, label: actionLabels[v] }))
})

const actionPills = computed(() => {
  return Object.keys(actionLabels).map((v) => ({
    value: v,
    label: actionLabels[v],
    color: actionColors[v],
    count: logs.value.filter((l) => l.action === v).length,
  }))
})

const maxDayCount = computed(() => {
  if (!summary.value?.by_day?.length) return 1
  return Math.max(1, ...summary.value.by_day.map((d) => d.count))
})

const filteredLogs = computed(() => {
  let out = logs.value
  const q = search.value.trim().toLowerCase()
  if (q) {
    out = out.filter((l) =>
      (l.description || '').toLowerCase().includes(q)
      || (l.resource_id || '').toLowerCase().includes(q)
      || (l.user_email || '').toLowerCase().includes(q)
    )
  }
  if (actionFilter.value) out = out.filter((l) => l.action === actionFilter.value)
  if (resourceFilter.value) out = out.filter((l) => l.resource_type === resourceFilter.value)
  if (userFilter.value) out = out.filter((l) => l.user_email === userFilter.value)
  return out
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredLogs.value.length / pageSize)))

const pageStart = computed(() => (page.value - 1) * pageSize)
const pageEnd = computed(() => Math.min(filteredLogs.value.length, pageStart.value + pageSize))

const paginatedLogs = computed(() =>
  filteredLogs.value.slice(pageStart.value, pageStart.value + pageSize),
)

const kpis = computed(() => [
  {
    label: 'Total Events',
    value: summary.value?.total ?? logs.value.length,
    icon: 'mdi-shield-key-outline',
    color: 'primary',
  },
  {
    label: 'Last 24 Hours',
    value: summary.value?.recent_24h ?? 0,
    icon: 'mdi-clock-outline',
    color: 'info',
  },
  {
    label: 'Last 7 Days',
    value: summary.value?.recent_7d ?? 0,
    icon: 'mdi-calendar-week-begin',
    color: 'success',
  },
  {
    label: 'Active Users',
    value: summary.value?.by_user?.length ?? 0,
    icon: 'mdi-account-group-outline',
    color: 'warning',
  },
  {
    label: 'Actions Today',
    value: todayCount.value,
    icon: 'mdi-gesture-tap-button',
    color: 'purple',
  },
  {
    label: 'Resources Touched',
    value: uniqueResources.value,
    icon: 'mdi-shape-outline',
    color: 'neutral',
  },
])

const todayCount = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return logs.value.filter((l) => l.timestamp?.startsWith(today)).length
})

const uniqueResources = computed(() => new Set(logs.value.map((l) => l.resource_type)).size)

/* ----------------------------------------------------------- watchers */

// Reset page when filters change
watch([search, actionFilter, resourceFilter, userFilter], () => {
  page.value = 1
})

/* ----------------------------------------------------------- API */

async function loadLogs() {
  try {
    const data = await api('/audit/?page_size=500&ordering=-timestamp')
    logs.value = data.results || data
  } catch (e) {
    toast.error('Failed to load audit logs')
  }
}

async function loadSummary() {
  try {
    summary.value = await api('/audit/summary/')
  } catch (e) {
    /* summary is optional — page still works with just logs */
  }
}

async function refreshAll() {
  loading.value = true
  try {
    await Promise.all([loadLogs(), loadSummary()])
  } finally {
    loading.value = false
  }
}

/* ----------------------------------------------------------- helpers */

function relativeTime(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const now = Date.now()
  const diff = (now - d.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return d.toLocaleDateString()
}

function formatDateTime(iso: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDayShort(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 3)
}

function openDetail(log: AuditLog) {
  selected.value = log
  detailDialog.value = true
}

function exportCsv() {
  const rows = filteredLogs.value
  const headers = ['ID', 'Timestamp', 'User', 'Action', 'Resource', 'Resource ID', 'Description', 'IP', 'User Agent']
  const csv = [
    headers.join(','),
    ...rows.map((l) =>
      [l.id, l.timestamp, l.user_email, l.action, l.resource_type, l.resource_id,
       `"${(l.description || '').replace(/"/g, '""')}"`,
       l.ip_address || '', `"${(l.user_agent || '').replace(/"/g, '""')}"`].join(',')
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  toast.success(`Exported ${rows.length} entries`)
}

/* ----------------------------------------------------------- lifecycle */

onMounted(refreshAll)
</script>

<style scoped>
.aud-page {
  padding: 0 0 24px 0;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.aud-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.aud-header__title { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; color: rgb(var(--v-theme-on-surface)); }
.aud-header__sub { font-size: 0.875rem; color: rgba(var(--v-theme-on-surface), 0.6); margin-top: 4px; }
.aud-header__actions { display: flex; gap: 10px; align-items: center; }

/* Buttons */
.aud-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 0.8125rem;
  font-weight: 600;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  cursor: pointer;
  transition: all 0.18s ease;
}
.aud-btn:hover { background: rgba(var(--v-theme-primary), 0.08); border-color: rgba(var(--v-theme-primary), 0.4); }
.aud-btn--ghost { background: transparent; }
.aud-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* KPI */
.aud-kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; margin-bottom: 22px; }
.aud-kpi {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: all 0.18s ease;
}
.aud-kpi:hover { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); transform: translateY(-1px); }
.aud-kpi__icon { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0; }
.aud-kpi__icon--primary { background: rgba(var(--v-theme-primary), 0.12); color: rgb(var(--v-theme-primary)); }
.aud-kpi__icon--info { background: rgba(0, 149, 255, 0.12); color: rgb(0, 149, 255); }
.aud-kpi__icon--success { background: rgba(76, 175, 80, 0.12); color: rgb(46, 125, 50); }
.aud-kpi__icon--warning { background: rgba(255, 152, 0, 0.12); color: rgb(230, 81, 0); }
.aud-kpi__icon--purple { background: rgba(156, 39, 176, 0.12); color: rgb(123, 31, 162); }
.aud-kpi__icon--neutral { background: rgba(var(--v-theme-on-surface), 0.08); color: rgba(var(--v-theme-on-surface), 0.6); }
.aud-kpi__label { font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(var(--v-theme-on-surface), 0.55); margin: 0; }
.aud-kpi__value { font-size: 1.5rem; font-weight: 800; margin: 0; line-height: 1.2; }

/* Chart card */
.aud-chart-card {
  padding: 20px;
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  margin-bottom: 22px;
}
.aud-chart-card__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.aud-chart-card__title { font-size: 0.9375rem; font-weight: 700; margin: 0; }
.aud-chart-card__sub { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.55); margin: 2px 0 0 0; }
.aud-chart-card__legend { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.65); }
.aud-chart-card__legend-dot { width: 10px; height: 10px; border-radius: 3px; background: rgb(var(--v-theme-primary)); }

.aud-chart { display: flex; align-items: flex-end; gap: 12px; height: 160px; }
.aud-chart__bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; }
.aud-chart__bar-value { font-size: 0.6875rem; font-weight: 700; color: rgba(var(--v-theme-on-surface), 0.7); margin-bottom: 4px; }
.aud-chart__bar-track {
  flex: 1;
  width: 100%;
  max-width: 48px;
  background: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 6px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.aud-chart__bar-fill {
  width: 100%;
  background: linear-gradient(180deg, rgb(var(--v-theme-primary)) 0%, rgba(var(--v-theme-primary), 0.5) 100%);
  border-radius: 6px;
  min-height: 4px;
  transition: height 0.3s ease;
}
.aud-chart__bar-label { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.5); margin-top: 6px; }

/* Toolbar */
.aud-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.aud-toolbar__search {
  flex: 1;
  min-width: 240px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}
.aud-toolbar__icon { color: rgba(var(--v-theme-on-surface), 0.5); }
.aud-toolbar__input { flex: 1; border: none; outline: none; background: transparent; font-size: 0.875rem; color: rgb(var(--v-theme-on-surface)); }
.aud-toolbar__selects { display: flex; gap: 8px; }
.aud-toolbar__select {
  padding: 10px 14px;
  border-radius: 10px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-on-surface));
  cursor: pointer;
  outline: none;
}

/* Pills */
.aud-pills { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
.aud-pills__pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface));
  color: rgba(var(--v-theme-on-surface), 0.7);
  cursor: pointer;
  transition: all 0.16s ease;
}
.aud-pills__pill:hover { border-color: rgba(var(--v-theme-primary), 0.4); }
.aud-pills__pill--active {
  background: rgba(var(--v-theme-primary), 0.12);
  border-color: rgba(var(--v-theme-primary), 0.5);
  color: rgb(var(--v-theme-primary));
}
.aud-pills__dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.aud-pills__dot--success { background: rgb(76, 175, 80); }
.aud-pills__dot--info { background: rgb(0, 149, 255); }
.aud-pills__dot--error { background: rgb(244, 67, 54); }
.aud-pills__dot--primary { background: rgb(var(--v-theme-primary)); }
.aud-pills__dot--neutral { background: rgba(var(--v-theme-on-surface), 0.4); }
.aud-pills__dot--warning { background: rgb(255, 152, 0); }
.aud-pills__dot--secondary { background: rgb(156, 39, 176); }
.aud-pills__count { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.5); background: rgba(var(--v-theme-on-surface), 0.06); padding: 1px 6px; border-radius: 8px; }

/* Table */
.aud-table-wrap {
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  overflow: hidden;
}
.aud-loading, .aud-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; gap: 12px; color: rgba(var(--v-theme-on-surface), 0.55); }
.aud-empty__icon { opacity: 0.4; }
.aud-empty__title { font-weight: 700; font-size: 0.9375rem; margin: 0; color: rgb(var(--v-theme-on-surface)); }
.aud-empty__sub { font-size: 0.8125rem; margin: 0; }
.aud-table-scroll { overflow-x: auto; }
.aud-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
.aud-table__th {
  text-align: left;
  padding: 12px 16px;
  font-weight: 700;
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(var(--v-theme-on-surface), 0.55);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgba(var(--v-theme-on-surface), 0.02);
  white-space: nowrap;
}
.aud-table__th--right { text-align: right; }
.aud-table__row { cursor: pointer; transition: background 0.12s ease; }
.aud-table__row:hover td { background: rgba(var(--v-theme-primary), 0.03); }
.aud-table__cell {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  vertical-align: middle;
  color: rgb(var(--v-theme-on-surface));
}
.aud-table__cell--desc { max-width: 360px; }
.aud-table__cell--right { text-align: right; }
.aud-table__desc {
  margin: 0;
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.75);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.aud-table__chevron { color: rgba(var(--v-theme-on-surface), 0.4); }

/* Action chip */
.aud-action-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.aud-action-chip--create, .aud-action-chip--approve {
  background: rgba(76, 175, 80, 0.12);
  color: rgb(46, 125, 50);
}
.aud-action-chip--update, .aud-action-chip--export {
  background: rgba(0, 149, 255, 0.12);
  color: rgb(0, 119, 204);
}
.aud-action-chip--delete, .aud-action-chip--void {
  background: rgba(244, 67, 54, 0.12);
  color: rgb(198, 40, 40);
}
.aud-action-chip--login {
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
}
.aud-action-chip--logout {
  background: rgba(var(--v-theme-on-surface), 0.08);
  color: rgba(var(--v-theme-on-surface), 0.6);
}
.aud-action-chip--reject, .aud-action-chip--refund {
  background: rgba(255, 152, 0, 0.12);
  color: rgb(230, 81, 0);
}
.aud-action-chip--config_change {
  background: rgba(156, 39, 176, 0.12);
  color: rgb(123, 31, 162);
}

/* Resource */
.aud-resource { display: flex; align-items: center; gap: 6px; }
.aud-resource__type { font-weight: 600; font-size: 0.8125rem; }
.aud-resource__id { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.55); font-family: monospace, monospace; }

.aud-user { font-size: 0.8125rem; font-weight: 500; }
.aud-ip { font-size: 0.75rem; font-family: monospace, monospace; color: rgba(var(--v-theme-on-surface), 0.65); }

.aud-time { display: flex; flex-direction: column; }
.aud-time__rel { font-size: 0.75rem; font-weight: 600; margin: 0; }
.aud-time__abs { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.5); margin: 0; }

/* Pagination */
.aud-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  flex-wrap: wrap;
  gap: 10px;
}
.aud-pagination__info { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.6); margin: 0; }
.aud-pagination__nav { display: flex; align-items: center; gap: 10px; }
.aud-pagination__page {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: transparent;
  cursor: pointer;
  color: rgb(var(--v-theme-on-surface));
  transition: all 0.16s ease;
}
.aud-pagination__page:hover:not(:disabled) { background: rgba(var(--v-theme-primary), 0.08); border-color: rgba(var(--v-theme-primary), 0.4); }
.aud-pagination__page:disabled { opacity: 0.4; cursor: not-allowed; }
.aud-pagination__current { font-size: 0.8125rem; font-weight: 600; }

/* Dialog */
.aud-dialog { background: rgb(var(--v-theme-surface)); }
.aud-dialog__header { display: flex; align-items: center; gap: 14px; padding: 20px 24px; }
.aud-dialog__header-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.aud-dialog__header-icon--primary { background: rgba(var(--v-theme-primary), 0.12); color: rgb(var(--v-theme-primary)); }
.aud-dialog__header-icon--success { background: rgba(76, 175, 80, 0.12); color: rgb(46, 125, 50); }
.aud-dialog__header-icon--info { background: rgba(0, 149, 255, 0.12); color: rgb(0, 119, 204); }
.aud-dialog__header-icon--error { background: rgba(244, 67, 54, 0.12); color: rgb(198, 40, 40); }
.aud-dialog__header-icon--warning { background: rgba(255, 152, 0, 0.12); color: rgb(230, 81, 0); }
.aud-dialog__header-icon--secondary { background: rgba(156, 39, 176, 0.12); color: rgb(123, 31, 162); }
.aud-dialog__header-icon--neutral { background: rgba(var(--v-theme-on-surface), 0.08); color: rgba(var(--v-theme-on-surface), 0.6); }
.aud-dialog__body { padding: 20px 24px; }
.aud-detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 18px; }
.aud-detail-item { display: flex; flex-direction: column; }
.aud-detail-item--wide { grid-column: 1 / -1; }
.aud-detail__label { font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(var(--v-theme-on-surface), 0.55); margin: 0 0 4px 0; }
.aud-detail__value { font-size: 0.875rem; color: rgb(var(--v-theme-on-surface)); margin: 0; word-break: break-word; }
.aud-detail__value--mono { font-family: monospace, monospace; font-size: 0.75rem; }
.aud-detail-values { margin-top: 12px; }
.aud-detail__json {
  margin: 6px 0 0 0;
  padding: 14px;
  border-radius: 8px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  font-family: monospace, monospace;
  font-size: 0.75rem;
  overflow-x: auto;
  color: rgba(var(--v-theme-on-surface), 0.85);
}
</style>

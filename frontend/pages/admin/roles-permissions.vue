<template>
  <div class="iam-page">
    <!-- Header -->
    <div class="iam-header">
      <div class="iam-header__left">
        <h1 class="iam-header__title">Roles &amp; Permissions</h1>
        <p class="iam-header__sub">Manage role-based access control across every module</p>
      </div>
      <div class="iam-header__actions">
        <button class="iam-btn iam-btn--ghost" @click="refreshAll">
          <v-icon size="18">mdi-refresh</v-icon>
          Refresh
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="iam-kpi-grid">
      <div v-for="kpi in kpis" :key="kpi.label" class="iam-kpi">
        <div class="iam-kpi__icon" :class="`iam-kpi__icon--${kpi.color}`">
          <v-icon size="22">{{ kpi.icon }}</v-icon>
        </div>
        <div class="iam-kpi__body">
          <p class="iam-kpi__label">{{ kpi.label }}</p>
          <p class="iam-kpi__value">{{ kpi.value }}</p>
        </div>
      </div>
    </div>

    <!-- Role cards -->
    <div class="iam-roles-grid">
      <div
        v-for="r in roleList"
        :key="r.value"
        class="iam-role-card"
        :class="{ 'iam-role-card--active': activeRole === r.value }"
        @click="openRole(r.value)"
      >
        <div class="iam-role-card__head">
          <div class="iam-role-card__icon" :class="`iam-role-card__icon--${roleColor(r.value)}`">
            <v-icon size="22">{{ roleIcon(r.value) }}</v-icon>
          </div>
          <div class="iam-role-card__meta">
            <p class="iam-role-card__name">{{ r.label }}</p>
            <p class="iam-role-card__count">{{ roleUserCounts[r.value] || 0 }} user(s)</p>
          </div>
          <v-chip
            v-if="rolePermCounts[r.value]"
            size="x-small"
            label
            :color="roleColor(r.value)"
            variant="tonal"
            class="iam-role-card__chip"
          >
            {{ rolePermCounts[r.value] }} perms
          </v-chip>
        </div>
        <div class="iam-role-card__bars">
          <div
            v-for="m in moduleSummary(r.value)"
            :key="m.module"
            class="iam-role-card__bar"
            :title="m.label"
          >
            <span class="iam-role-card__bar-fill" :style="{ width: m.fill }" :class="`iam-role-card__bar-fill--${m.fill > 0 ? 'on' : 'off'}`" />
          </div>
        </div>
      </div>
    </div>

    <!-- Matrix Dialog -->
    <v-dialog v-model="matrixDialog" max-width="1100" persistent scroll-strategy="block">
      <v-card rounded="xl" class="iam-dialog">
        <!-- Dialog header -->
        <div class="iam-dialog__header">
          <div class="iam-dialog__header-icon iam-dialog__header-icon--primary">
            <v-icon size="24">mdi-shield-account-outline</v-icon>
          </div>
          <div class="flex-1">
            <h3 class="text-h6 font-weight-bold">
              {{ activeRoleLabel }}
            </h3>
            <p class="text-body-2 text-medium-emphasis">
              Toggle module permissions for this role — changes save immediately.
            </p>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="matrixDialog = false" />
        </div>

        <v-divider />

        <!-- Loading state -->
        <div v-if="matrixLoading" class="iam-loading">
          <v-progress-circular indeterminate color="primary" size="48" width="4" />
          <p>Loading permissions...</p>
        </div>

        <!-- Matrix body -->
        <div v-else class="iam-dialog__body">
          <!-- Bulk action bar -->
          <div class="iam-bulkbar">
            <div class="iam-bulkbar__info">
              <v-icon size="18">mdi-checkbox-multiple-marked-outline</v-icon>
              <span>{{ totalGranted }} of {{ totalPossible }} permissions granted</span>
            </div>
            <div class="iam-bulkbar__actions">
              <button class="iam-btn iam-btn--ghost iam-btn--sm" @click="grantAll">
                <v-icon size="16">mdi-check-all</v-icon>
                Grant All
              </button>
              <button class="iam-btn iam-btn--ghost iam-btn--sm" @click="revokeAll">
                <v-icon size="16">mdi-close-box-outline</v-icon>
                Revoke All
              </button>
              <button class="iam-btn iam-btn--ghost iam-btn--sm" @click="resetDefaults">
                <v-icon size="16">mdi-undo-variant</v-icon>
                Reset Defaults
              </button>
            </div>
          </div>

          <!-- Matrix table -->
          <div class="iam-matrix-wrap">
            <table class="iam-matrix">
              <thead>
                <tr>
                  <th class="iam-matrix__col-module">Module</th>
                  <th
                    v-for="a in actionList"
                    :key="a.value"
                    class="iam-matrix__col-action"
                  >
                    <div class="iam-matrix__action-head">
                      <v-icon size="16">{{ actionIcon(a.value) }}</v-icon>
                      <span>{{ a.label }}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in moduleList" :key="m.value">
                  <td class="iam-matrix__module-cell">
                    <div class="iam-matrix__module-info">
                      <v-icon size="18" class="iam-matrix__module-icon">{{ moduleIcon(m.value) }}</v-icon>
                      <div>
                        <p class="iam-matrix__module-name">{{ m.label }}</p>
                        <p class="iam-matrix__module-desc">{{ moduleDesc(m.value) }}</p>
                      </div>
                    </div>
                  </td>
                  <td
                    v-for="a in actionList"
                    :key="a.value"
                    class="iam-matrix__cell"
                  >
                    <button
                      class="iam-toggle"
                      :class="{ 'iam-toggle--on': isGranted(m.value, a.value) }"
                      :disabled="saving"
                      @click="togglePerm(m.value, a.value)"
                    >
                      <v-icon size="18">
                        {{ isGranted(m.value, a.value) ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                      </v-icon>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <v-divider />
        <div class="iam-dialog__actions">
          <v-spacer />
          <v-btn variant="text" @click="matrixDialog = false">Close</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type {
  RoleName,
  ModuleName,
  ActionName,
  Permission,
  PermissionMatrix,
  StaffSummary,
} from '~/types/iam'

definePageMeta({ middleware: 'auth' })

const api = useApi()
const toast = useToast()
const auth = useAuthStore()

/* ----------------------------------------------------------- refs/state */

const loading = ref(false)
const matrixLoading = ref(false)
const saving = ref(false)
const matrixDialog = ref(false)

const permissions = ref<Permission[]>([])
const matrix = ref<PermissionMatrix>({} as PermissionMatrix)
const rolePermCounts = ref<Record<string, number>>({})
const staff = ref<StaffSummary[]>([])
const activeRole = ref<RoleName | null>(null)

/* ----------------------------------------------------------- constants */

const roleList: { value: RoleName; label: string }[] = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'tenant_admin', label: 'Tenant Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'cashier', label: 'Cashier' },
  { value: 'inventory_clerk', label: 'Inventory Clerk' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'sales_associate', label: 'Sales Associate' },
  { value: 'viewer', label: 'Viewer' },
]

const moduleList: { value: ModuleName; label: string }[] = [
  { value: 'products', label: 'Products' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'sales', label: 'Sales & Checkout' },
  { value: 'payments', label: 'Payments' },
  { value: 'customers', label: 'Customers' },
  { value: 'suppliers', label: 'Suppliers' },
  { value: 'purchasing', label: 'Purchasing' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'reports', label: 'Reports' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'staff', label: 'Staff Management' },
  { value: 'branches', label: 'Branches' },
  { value: 'settings', label: 'Settings' },
]

const actionList: { value: ActionName; label: string }[] = [
  { value: 'view', label: 'View' },
  { value: 'create', label: 'Create' },
  { value: 'edit', label: 'Edit' },
  { value: 'delete', label: 'Delete' },
  { value: 'approve', label: 'Approve' },
  { value: 'export', label: 'Export' },
]

const moduleDescriptions: Record<ModuleName, string> = {
  products: 'Catalog, categories, brands, units',
  inventory: 'Stock items, movements, transfers, adjustments',
  sales: 'Transactions, discounts, refunds',
  payments: 'Payments and refunds',
  customers: 'Customer accounts and loyalty',
  suppliers: 'Supplier records',
  purchasing: 'Purchase orders and goods receipts',
  accounting: 'Journal entries, expenses, invoices',
  reports: 'Reports and exports',
  analytics: 'Dashboards, KPIs, and deep-dive analytics',
  staff: 'Users and permissions',
  branches: 'Branches and registers',
  settings: 'Tenant and business settings',
}

/* ----------------------------------------------------------- helpers */

const roleLabels: Record<RoleName, string> = {
  super_admin: 'Super Admin',
  tenant_admin: 'Tenant Admin',
  manager: 'Manager',
  cashier: 'Cashier',
  inventory_clerk: 'Inventory Clerk',
  accountant: 'Accountant',
  sales_associate: 'Sales Associate',
  viewer: 'Viewer',
}

const activeRoleLabel = computed(() => activeRole.value ? roleLabels[activeRole.value] : '')

function roleIcon(role: RoleName): string {
  const map: Record<RoleName, string> = {
    super_admin: 'mdi-crown-outline',
    tenant_admin: 'mdi-domain',
    manager: 'mdi-account-tie-outline',
    cashier: 'mdi-cash-register',
    inventory_clerk: 'mdi-clipboard-arrow-up-outline',
    accountant: 'mdi-calculator-variant-outline',
    sales_associate: 'mdi-account-star-outline',
    viewer: 'mdi-eye-outline',
  }
  return map[role]
}

function roleColor(role: RoleName): string {
  const map: Record<RoleName, string> = {
    super_admin: 'purple',
    tenant_admin: 'indigo',
    manager: 'primary',
    cashier: 'teal',
    inventory_clerk: 'orange',
    accountant: 'success',
    sales_associate: 'info',
    viewer: 'neutral',
  }
  return map[role]
}

function moduleIcon(m: ModuleName): string {
  const map: Record<ModuleName, string> = {
    products: 'mdi-package-variant-closed',
    inventory: 'mdi-archive-outline',
    sales: 'mdi-receipt-text-outline',
    payments: 'mdi-credit-card-outline',
    customers: 'mdi-account-group-outline',
    suppliers: 'mdi-truck-outline',
    purchasing: 'mdi-clipboard-list-outline',
    accounting: 'mdi-currency-usd',
    reports: 'mdi-chart-box-outline',
    analytics: 'mdi-chart-arc',
    staff: 'mdi-account-tie-outline',
    branches: 'mdi-store-outline',
    settings: 'mdi-cog-outline',
  }
  return map[m]
}

function moduleDesc(m: ModuleName): string {
  return moduleDescriptions[m] || ''
}

function actionIcon(a: ActionName): string {
  const map: Record<ActionName, string> = {
    view: 'mdi-eye-outline',
    create: 'mdi-plus-circle-outline',
    edit: 'mdi-pencil-outline',
    delete: 'mdi-delete-outline',
    approve: 'mdi-check-decagram-outline',
    export: 'mdi-download-outline',
  }
  return map[a]
}

function isGranted(m: ModuleName, a: ActionName): boolean {
  if (!activeRole.value) return false
  const actions = matrix.value[activeRole.value]?.[m]
  return !!actions?.includes(a)
}

/* role-card mini-bars: one fill bar per module, full if any action granted */
function moduleSummary(role: RoleName) {
  const roleMods = matrix.value[role] || {}
  return moduleList.map(m => {
    const count = roleMods[m.value]?.length || 0
    return {
      module: m.value,
      label: m.label,
      fill: count > 0 ? `${(count / 6) * 100}%` : '0%',
    }
  })
}

/* ----------------------------------------------------------- computed */

const kpis = computed(() => [
  { label: 'Roles', value: roleList.length, icon: 'mdi-account-group-outline', color: 'primary' },
  { label: 'Modules', value: moduleList.length, icon: 'mdi-view-module-outline', color: 'info' },
  { label: 'Actions', value: actionList.length, icon: 'mdi-gesture-tap-button', color: 'warning' },
  { label: 'Permissions', value: permissions.value.length, icon: 'mdi-shield-key-outline', color: 'success' },
  { label: 'Total Grants', value: Object.values(rolePermCounts.value).reduce((a, b) => a + b, 0), icon: 'mdi-check-all', color: 'purple' },
  { label: 'Staff', value: staff.value.length, icon: 'mdi-account-tie-outline', color: 'neutral' },
])

const totalGranted = computed(() => {
  if (!activeRole.value) return 0
  const roleMods = matrix.value[activeRole.value] || {}
  return Object.values(roleMods).reduce((a, b) => a + b.length, 0)
})

const totalPossible = computed(() => moduleList.length * actionList.length)

const roleUserCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const s of staff.value) {
    counts[s.role] = (counts[s.role] || 0) + 1
  }
  return counts
})

/* ----------------------------------------------------------- API calls */

async function loadAll() {
  loading.value = true
  try {
    await Promise.all([loadPermissions(), loadMatrix(), loadStaff()])
    computeRolePermCounts()
  } catch (e) {
    /* individual loaders handle errors */
  } finally {
    loading.value = false
  }
}

async function loadPermissions() {
  try {
    // Request all 72 permissions (default page_size=20 so we override)
    const data = await api('/users/permissions/?page_size=100')
    permissions.value = data.results || data
  } catch (e) {
    toast.error('Failed to load permissions catalog')
  }
}

async function loadMatrix() {
  matrixLoading.value = true
  try {
    const data = await api('/users/role-permissions/matrix/')
    matrix.value = data as PermissionMatrix
  } catch (e) {
    toast.error('Failed to load permission matrix')
  } finally {
    matrixLoading.value = false
  }
}

async function loadStaff() {
  try {
    const data = await api('/users/staff/?page_size=100')
    staff.value = data.results || data
  } catch (e) { /* ignore — counts degrade gracefully */ }
}

function computeRolePermCounts() {
  const counts: Record<string, number> = {}
  for (const r of roleList) {
    const roleMods = matrix.value[r.value] || {}
    counts[r.value] = Object.values(roleMods).reduce((a, b) => a + b.length, 0)
  }
  rolePermCounts.value = counts
}

function refreshAll() {
  loadAll()
  toast.success('Permissions refreshed')
}

/* ----------------------------------------------------------- actions */

function openRole(role: RoleName) {
  activeRole.value = role
  matrixDialog.value = true
  if (!matrix.value[role]) {
    // ensure the matrix has an entry for this role
    matrix.value = { ...matrix.value, [role]: {} }
  }
}

/**
 * Compute the permission ID for a (module, action) pair from the catalog
 */
function permissionIdFor(m: ModuleName, a: ActionName): number | null {
  const p = permissions.value.find(p => p.module === m && p.action === a)
  return p?.id || null
}

/**
 * Build the full list of permission IDs that the role should have
 * based on the current matrix state (after the would-be toggle).
 */
function buildIdList(): number[] {
  if (!activeRole.value) return []
  const roleMods = matrix.value[activeRole.value] || {}
  const ids: number[] = []
  for (const m of moduleList) {
    const acts = roleMods[m.value] || []
    for (const a of acts) {
      const id = permissionIdFor(m.value, a)
      if (id) ids.push(id)
    }
  }
  return ids
}

async function saveMatrix() {
  if (!activeRole.value) return
  saving.value = true
  try {
    const permIds = buildIdList()
    const data = await api('/users/role-permissions/bulk/', {
      method: 'POST',
      body: {
        role: activeRole.value,
        permissions: permIds,
      },
    })
    // Update the local matrix from the response (the bulk endpoint returns
    // serialized RolePermission rows)
    const rebuilt = {} as Record<ModuleName, ActionName[]>
    for (const rp of data) {
      const m = rp.permission_detail.module
      const a = rp.permission_detail.action
      if (!rebuilt[m]) rebuilt[m] = []
      rebuilt[m].push(a)
    }
    matrix.value = { ...matrix.value, [activeRole.value]: rebuilt }
    computeRolePermCounts()
  } catch (e: any) {
    toast.error(e?.data?.detail || 'Failed to save permissions')
    // Rollback optimistic UI changes is complex — reload matrix to be safe
    await loadMatrix()
  } finally {
    saving.value = false
  }
}

/**
 * Optimistically toggle a permission cell, then call saveMatrix which
 * upserts the entire role's grant set atomically.
 */
async function togglePerm(m: ModuleName, a: ActionName) {
  if (!activeRole.value || saving.value) return
  const roleMods = { ...(matrix.value[activeRole.value] || {}) }
  const actions = new Set(roleMods[m] || [])
  if (actions.has(a)) actions.delete(a)
  else actions.add(a)
  roleMods[m] = Array.from(actions) as ActionName[]
  matrix.value = { ...matrix.value, [activeRole.value]: roleMods }
  await saveMatrix()
}

function grantAll() {
  if (!activeRole.value || saving.value) return
  const roleMods: Record<ModuleName, ActionName[]> = {} as any
  for (const m of moduleList) {
    roleMods[m.value] = [...actionList.map(a => a.value)]
  }
  matrix.value = { ...matrix.value, [activeRole.value]: roleMods }
  saveMatrix()
}

function revokeAll() {
  if (!activeRole.value || saving.value) return
  const roleMods: Record<ModuleName, ActionName[]> = {} as any
  for (const m of moduleList) roleMods[m.value] = []
  matrix.value = { ...matrix.value, [activeRole.value]: roleMods }
  saveMatrix()
}

/** Trigger backend re-seeding of defaults for the active role. */
async function resetDefaults() {
  if (!activeRole.value) return

  // Map default policy client-side (mirrors seed_permissions.py defaults)
  const grantedModules: Record<RoleName, 'ALL' | ModuleName[]> = {
    super_admin: 'ALL',
    tenant_admin: 'ALL',
    manager: 'ALL',
    cashier: ['sales', 'customers', 'payments', 'reports', 'analytics'],
    inventory_clerk: ['inventory', 'products', 'purchasing', 'analytics'],
    accountant: ['accounting', 'payments', 'reports', 'customers', 'analytics'],
    sales_associate: ['sales', 'customers', 'products', 'analytics'],
    viewer: ['products', 'inventory', 'sales', 'payments', 'customers', 'suppliers', 'purchasing', 'accounting', 'reports', 'analytics'],
  }

  function actionSet(role: RoleName): ActionName[] {
    if (['super_admin', 'tenant_admin', 'manager'].includes(role)) return actionList.map(a => a.value)
    if (role === 'cashier') return ['view', 'create']
    if (role === 'inventory_clerk') return ['view', 'create', 'edit']
    if (role === 'accountant') return ['view', 'create', 'edit', 'export']
    if (role === 'sales_associate') return ['view', 'create']
    return ['view', 'export'] // viewer
  }

  const roleMods: Record<ModuleName, ActionName[]> = {} as any
  const allModules = grantedModules[activeRole.value] === 'ALL'
    ? moduleList.map(m => m.value)
    : grantedModules[activeRole.value] as ModuleName[]
  const acts = actionSet(activeRole.value)

  // Manager doesn't get "delete" on staff
  const restrict: Partial<Record<ModuleName, ActionName[]>> =
    activeRole.value === 'manager' ? { staff: ['delete'] } : {}

  for (const m of moduleList.map(m => m.value)) {
    if (!allModules.includes(m)) {
      roleMods[m] = []
      continue
    }
    const blocked = restrict[m] || []
    roleMods[m] = acts.filter(a => !blocked.includes(a))
  }
  matrix.value = { ...matrix.value, [activeRole.value]: roleMods }
  await saveMatrix()
  toast.success(`Reset ${roleLabels[activeRole.value]} to default policy`)
}

/* ----------------------------------------------------------- lifecycle */

onMounted(loadAll)
</script>

<style scoped>
.iam-page {
  padding: 0 0 24px 0;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.iam-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.iam-header__title {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: rgb(var(--v-theme-on-surface));
}
.iam-header__sub {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-top: 4px;
}
.iam-header__actions { display: flex; gap: 10px; align-items: center; }

/* Buttons */
.iam-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 0.8125rem;
  font-weight: 600;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgba(var(--v-theme-surface), 1);
  color: rgb(var(--v-theme-on-surface));
  cursor: pointer;
  transition: all 0.18s ease;
}
.iam-btn:hover { background: rgba(var(--v-theme-primary), 0.08); border-color: rgba(var(--v-theme-primary), 0.4); }
.iam-btn--ghost { background: transparent; }
.iam-btn--sm { padding: 6px 12px; font-size: 0.75rem; }

/* KPI cards */
.iam-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 22px;
}
.iam-kpi {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: all 0.18s ease;
}
.iam-kpi:hover { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); transform: translateY(-1px); }
.iam-kpi__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  flex-shrink: 0;
}
.iam-kpi__icon--primary { background: rgba(var(--v-theme-primary), 0.12); color: rgb(var(--v-theme-primary)); }
.iam-kpi__icon--info { background: rgba(0, 149, 255, 0.12); color: rgb(0, 149, 255); }
.iam-kpi__icon--warning { background: rgba(255, 152, 0, 0.12); color: rgb(255, 152, 0); }
.iam-kpi__icon--success { background: rgba(76, 175, 80, 0.12); color: rgb(46, 125, 50); }
.iam-kpi__icon--purple { background: rgba(156, 39, 176, 0.12); color: rgb(123, 31, 162); }
.iam-kpi__icon--neutral { background: rgba(var(--v-theme-on-surface), 0.08); color: rgba(var(--v-theme-on-surface), 0.6); }
.iam-kpi__label {
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(var(--v-theme-on-surface), 0.55);
  margin: 0;
}
.iam-kpi__value { font-size: 1.5rem; font-weight: 800; margin: 0; line-height: 1.2; }

/* Role cards grid */
.iam-roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}
.iam-role-card {
  cursor: pointer;
  padding: 18px;
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: all 0.18s ease;
}
.iam-role-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.07);
  transform: translateY(-2px);
}
.iam-role-card--active {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.15);
}
.iam-role-card__head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.iam-role-card__icon {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.iam-role-card__icon--primary { background: rgba(var(--v-theme-primary), 0.12); color: rgb(var(--v-theme-primary)); }
.iam-role-card__icon--purple { background: rgba(156, 39, 176, 0.12); color: rgb(123, 31, 162); }
.iam-role-card__icon--indigo { background: rgba(63, 81, 181, 0.12); color: rgb(48, 79, 254); }
.iam-role-card__icon--teal { background: rgba(0, 150, 136, 0.12); color: rgb(0, 121, 107); }
.iam-role-card__icon--orange { background: rgba(255, 152, 0, 0.12); color: rgb(230, 81, 0); }
.iam-role-card__icon--success { background: rgba(76, 175, 80, 0.12); color: rgb(46, 125, 50); }
.iam-role-card__icon--info { background: rgba(0, 149, 255, 0.12); color: rgb(0, 119, 204); }
.iam-role-card__icon--neutral { background: rgba(var(--v-theme-on-surface), 0.08); color: rgba(var(--v-theme-on-surface), 0.55); }
.iam-role-card__meta { flex: 1; min-width: 0; }
.iam-role-card__name { font-size: 0.9375rem; font-weight: 700; margin: 0; }
.iam-role-card__count { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.55); margin: 2px 0 0 0; }
.iam-role-card__chip { flex-shrink: 0; }

/* Mini module bars */
.iam-role-card__bars {
  display: flex;
  gap: 3px;
  height: 5px;
}
.iam-role-card__bar {
  flex: 1;
  background: rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}
.iam-role-card__bar-fill {
  position: absolute;
  inset: 0;
  border-radius: 3px;
}
.iam-role-card__bar-fill--on { background: rgb(var(--v-theme-primary)); }
.iam-role-card__bar-fill--off { background: transparent; }

/* Loading */
.iam-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 16px;
  color: rgba(var(--v-theme-on-surface), 0.55);
}

/* Dialog */
.iam-dialog { background: rgb(var(--v-theme-surface)); }
.iam-dialog__header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px;
}
.iam-dialog__header-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.iam-dialog__header-icon--primary {
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
}
.iam-dialog__body { padding: 20px 24px; }

/* Bulk action bar */
.iam-bulkbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.06);
  border: 1px solid rgba(var(--v-theme-primary), 0.18);
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.iam-bulkbar__info { display: flex; align-items: center; gap: 8px; font-size: 0.8125rem; font-weight: 600; color: rgb(var(--v-theme-primary)); }
.iam-bulkbar__actions { display: flex; gap: 8px; flex-wrap: wrap; }

/* Matrix table */
.iam-matrix-wrap {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
.iam-matrix {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}
.iam-matrix thead th {
  background: rgba(var(--v-theme-on-surface), 0.04);
  padding: 12px 14px;
  text-align: left;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(var(--v-theme-on-surface), 0.65);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  position: sticky;
  top: 0;
  z-index: 1;
}
.iam-matrix__col-module { min-width: 220px; }
.iam-matrix__col-action { text-align: center; min-width: 86px; }
.iam-matrix__action-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  font-size: 0.6875rem;
}
.iam-matrix__action-head span { white-space: nowrap; }
.iam-matrix tbody td {
  padding: 10px 14px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  vertical-align: middle;
}
.iam-matrix tbody tr:hover td { background: rgba(var(--v-theme-primary), 0.03); }
.iam-matrix__module-cell { padding: 10px 14px; }
.iam-matrix__module-info { display: flex; align-items: center; gap: 10px; }
.iam-matrix__module-icon { color: rgba(var(--v-theme-on-surface), 0.5); }
.iam-matrix__module-name { font-weight: 700; margin: 0; font-size: 0.8125rem; }
.iam-matrix__module-desc { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.5); margin: 2px 0 0 0; }
.iam-matrix__cell { text-align: center; padding: 6px; }

/* Toggle button */
.iam-toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(var(--v-theme-on-surface), 0.04);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(var(--v-theme-on-surface), 0.35);
  transition: all 0.16s ease;
}
.iam-toggle:hover {
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
}
.iam-toggle--on {
  background: rgba(var(--v-theme-primary), 0.15);
  color: rgb(var(--v-theme-primary));
}
.iam-toggle--on:hover {
  background: rgba(var(--v-theme-primary), 0.25);
}
.iam-toggle:disabled { cursor: progress; opacity: 0.5; }

/* Dialog actions */
.iam-dialog__actions { padding: 16px 24px; display: flex; gap: 8px; align-items: center; }

/* Dark theme tweaks */
:deep(.v-theme--dark) .iam-kpi,
:deep(.v-theme--dark) .iam-role-card,
:deep(.v-theme--dark) .iam-dialog {
  background: rgb(var(--v-theme-surface));
}
</style>

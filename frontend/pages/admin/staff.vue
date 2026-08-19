<template>
  <div class="staff-page">
    <!-- Header -->
    <div class="staff-header">
      <div class="staff-header__left">
        <h1 class="staff-header__title">Staff Members</h1>
        <p class="staff-header__sub">Manage your team — roles, status, and branch assignments</p>
      </div>
      <div class="staff-header__actions">
        <button class="staff-btn staff-btn--ghost" @click="loadStaff">
          <v-icon size="18">mdi-refresh</v-icon>
          Refresh
        </button>
        <button class="staff-btn staff-btn--primary" @click="openCreate">
          <v-icon size="18">mdi-plus</v-icon>
          Add Staff
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="staff-kpi-grid">
      <div v-for="kpi in kpis" :key="kpi.label" class="staff-kpi">
        <div class="staff-kpi__icon" :class="`staff-kpi__icon--${kpi.color}`">
          <v-icon size="20">{{ kpi.icon }}</v-icon>
        </div>
        <div class="staff-kpi__body">
          <p class="staff-kpi__label">{{ kpi.label }}</p>
          <p class="staff-kpi__value">{{ kpi.value }}</p>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="staff-toolbar">
      <div class="staff-toolbar__search">
        <v-icon size="18" class="staff-toolbar__search-icon">mdi-magnify</v-icon>
        <input
          v-model="search"
          class="staff-toolbar__search-input"
          placeholder="Search by name, email, or employee ID…"
          @input="onSearchInput"
        />
        <button v-if="search" class="staff-toolbar__search-clear" @click="clearSearch">
          <v-icon size="16">mdi-close-circle</v-icon>
        </button>
      </div>
      <div class="staff-toolbar__filters">
        <select v-model="roleFilter" class="staff-toolbar__select" @change="loadStaff">
          <option value="">All Roles</option>
          <option v-for="r in roleOptions" :key="r.value" :value="r.value">{{ r.label }}</option>
        </select>
        <select v-model="branchFilter" class="staff-toolbar__select" @change="loadStaff">
          <option value="">All Branches</option>
          <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
        <select v-model="statusFilter" class="staff-toolbar__select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Deactivated</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="staff-table-wrap">
      <table class="staff-table">
        <thead>
          <tr>
            <th>Staff Member</th>
            <th>Role</th>
            <th>Phone</th>
            <th>Branch</th>
            <th>Status</th>
            <th>Hired</th>
            <th style="width: 120px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading skeleton -->
          <template v-if="loading">
            <tr v-for="i in 6" :key="'sk-' + i">
              <td><div class="staff-skeleton" style="width: 160px; height: 38px;" /></td>
              <td><div class="staff-skeleton" style="width: 90px; height: 22px;" /></td>
              <td><div class="staff-skeleton" style="width: 100px; height: 16px;" /></td>
              <td><div class="staff-skeleton" style="width: 80px; height: 16px;" /></td>
              <td><div class="staff-skeleton" style="width: 70px; height: 22px;" /></td>
              <td><div class="staff-skeleton" style="width: 70px; height: 16px;" /></td>
              <td><div class="staff-skeleton" style="width: 100px; height: 28px;" /></td>
            </tr>
          </template>
          <!-- Empty -->
          <tr v-else-if="!filteredUsers.length">
            <td colspan="7" class="staff-empty">
              <v-icon size="40" class="staff-empty__icon">mdi-account-group-outline</v-icon>
              <p class="staff-empty__title">No staff members found</p>
              <p class="staff-empty__sub">Try adjusting your search or filters</p>
            </td>
          </tr>
          <!-- Rows -->
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>
              <div class="staff-cell-user">
                <div class="staff-avatar" :class="`staff-avatar--${roleColor(user.role)}`">
                  {{ initials(user) }}
                </div>
                <div class="staff-cell-user__info">
                  <p class="staff-cell-user__name">{{ fullName(user) }}</p>
                  <p class="staff-cell-user__email">{{ user.email }}</p>
                </div>
              </div>
            </td>
            <td>
              <span class="staff-role-chip" :class="`staff-role-chip--${roleColor(user.role)}`">
                {{ roleLabel(user.role) }}
              </span>
            </td>
            <td>
              <span v-if="user.phone" class="staff-cell-text">{{ user.phone }}</span>
              <span v-else class="staff-cell-muted">—</span>
            </td>
            <td>
              <span v-if="branchName(user.default_branch_id)" class="staff-cell-text">{{ branchName(user.default_branch_id) }}</span>
              <span v-else class="staff-cell-muted">Unassigned</span>
            </td>
            <td>
              <span class="staff-status" :class="user.is_active_employee ? 'staff-status--active' : 'staff-status--inactive'">
                <span class="staff-status__dot" />
                {{ user.is_active_employee ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <span v-if="user.hire_date" class="staff-cell-text">{{ fmt.date(user.hire_date) }}</span>
              <span v-else class="staff-cell-muted">—</span>
            </td>
            <td>
              <div class="staff-actions">
                <button class="staff-action-btn" title="Edit" @click="openEdit(user)">
                  <v-icon size="16">mdi-pencil-outline</v-icon>
                </button>
                <button
                  class="staff-action-btn"
                  :class="user.is_active_employee ? 'staff-action-btn--danger' : 'staff-action-btn--success'"
                  :title="user.is_active_employee ? 'Deactivate' : 'Activate'"
                  :disabled="togglingId === user.id"
                  @click="toggleStatus(user)"
                >
                  <v-icon size="16">{{ user.is_active_employee ? 'mdi-account-off-outline' : 'mdi-account-check-outline' }}</v-icon>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create / Edit Dialog -->
    <v-dialog v-model="dialog" max-width="560" persistent scroll-strategy="block">
      <v-card rounded="xl" class="staff-dialog">
        <div class="staff-dialog__header">
          <div class="staff-dialog__header-icon" :class="editing ? 'staff-dialog__header-icon--edit' : 'staff-dialog__header-icon--primary'">
            <v-icon size="22">{{ editing ? 'mdi-pencil' : 'mdi-account-plus-outline' }}</v-icon>
          </div>
          <div class="flex-1">
            <h3 class="staff-dialog__title">{{ editing ? 'Edit Staff Member' : 'Add New Staff' }}</h3>
            <p class="staff-dialog__sub">{{ editing ? 'Update role and branch assignment' : 'Create a new team member account' }}</p>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="closeDialog" />
        </div>
        <v-divider />
        <div class="staff-dialog__body">
          <div class="staff-form-row">
            <div class="staff-field">
              <label class="staff-field__label">First Name</label>
              <input v-model="form.first_name" class="staff-field__input" placeholder="John" />
            </div>
            <div class="staff-field">
              <label class="staff-field__label">Last Name</label>
              <input v-model="form.last_name" class="staff-field__input" placeholder="Doe" />
            </div>
          </div>
          <div class="staff-field">
            <label class="staff-field__label">Email</label>
            <input v-model="form.email" class="staff-field__input" type="email" placeholder="john@domendra.com" :disabled="editing" />
          </div>
          <div class="staff-form-row">
            <div class="staff-field">
              <label class="staff-field__label">Phone</label>
              <input v-model="form.phone" class="staff-field__input" placeholder="+254700000000" />
            </div>
            <div class="staff-field">
              <label class="staff-field__label">Employee ID</label>
              <input v-model="form.employee_id" class="staff-field__input" placeholder="EMP-001" />
            </div>
          </div>
          <div class="staff-form-row">
            <div class="staff-field">
              <label class="staff-field__label">Role</label>
              <select v-model="form.role" class="staff-field__input">
                <option v-for="r in roleOptions" :key="r.value" :value="r.value">{{ r.label }}</option>
              </select>
            </div>
            <div class="staff-field">
              <label class="staff-field__label">Default Branch</label>
              <select v-model="form.default_branch_id" class="staff-field__input">
                <option :value="null">Unassigned</option>
                <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
              </select>
            </div>
          </div>
          <div class="staff-form-row">
            <div class="staff-field">
              <label class="staff-field__label">Hire Date</label>
              <input v-model="form.hire_date" class="staff-field__input" type="date" />
            </div>
            <div v-if="!editing" class="staff-field">
              <label class="staff-field__label">Password</label>
              <input v-model="form.password" class="staff-field__input" type="password" placeholder="Min 8 characters" />
            </div>
          </div>
          <p v-if="formError" class="staff-form-error">{{ formError }}</p>
        </div>
        <v-divider />
        <div class="staff-dialog__footer">
          <button class="staff-btn staff-btn--ghost" @click="closeDialog">Cancel</button>
          <button class="staff-btn staff-btn--primary" :disabled="saving" @click="saveStaff">
            <v-progress-circular v-if="saving" indeterminate size="16" width="2" color="white" class="mr-2" />
            {{ editing ? 'Save Changes' : 'Create Staff' }}
          </button>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const toast = useToast()
const fmt = useFormat()

interface StaffUser {
  id: number
  email: string
  first_name: string
  last_name: string
  role: string
  phone: string
  avatar: string | null
  is_active_employee: boolean
  employee_id: string
  hire_date: string | null
  termination_date: string | null
  default_branch_id: number | null
  date_joined: string
}

interface Branch {
  id: number
  name: string
  code: string
}

const users = ref<StaffUser[]>([])
const branches = ref<Branch[]>([])
const loading = ref(true)
const togglingId = ref<number | null>(null)
const search = ref('')
const roleFilter = ref('')
const branchFilter = ref('')
const statusFilter = ref('')

const dialog = ref(false)
const editing = ref(false)
const saving = ref(false)
const formError = ref('')
const form = reactive({
  id: null as number | null,
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  employee_id: '',
  role: 'cashier',
  default_branch_id: null as number | null,
  hire_date: '',
  password: '',
})

const roleOptions = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'tenant_admin', label: 'Tenant Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'cashier', label: 'Cashier' },
  { value: 'inventory_clerk', label: 'Inventory Clerk' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'sales_associate', label: 'Sales Associate' },
  { value: 'viewer', label: 'Viewer' },
]

const roleColors: Record<string, string> = {
  super_admin: 'purple',
  tenant_admin: 'indigo',
  manager: 'blue',
  cashier: 'teal',
  inventory_clerk: 'orange',
  accountant: 'green',
  sales_associate: 'cyan',
  viewer: 'grey',
}

function roleColor(role: string): string {
  return roleColors[role] || 'grey'
}

function roleLabel(role: string): string {
  return roleOptions.find(r => r.value === role)?.label || role.replace(/_/g, ' ')
}

function fullName(u: StaffUser): string {
  return `${u.first_name} ${u.last_name}`.trim() || u.email
}

function initials(u: StaffUser): string {
  const f = u.first_name?.[0] || ''
  const l = u.last_name?.[0] || ''
  return (f + l).toUpperCase() || '?'
}

function branchName(id: number | null): string {
  if (!id) return ''
  return branches.value.find(b => b.id === id)?.name || ''
}

// Filtered users (client-side status filter on top of server filters)
const filteredUsers = computed(() => {
  let list = users.value
  if (statusFilter.value === 'active') list = list.filter(u => u.is_active_employee)
  if (statusFilter.value === 'inactive') list = list.filter(u => !u.is_active_employee)
  return list
})

// KPIs
const kpis = computed(() => [
  { label: 'Total Staff', value: users.value.length, icon: 'mdi-account-group', color: 'blue' },
  { label: 'Active', value: users.value.filter(u => u.is_active_employee).length, icon: 'mdi-account-check', color: 'green' },
  { label: 'Inactive', value: users.value.filter(u => !u.is_active_employee).length, icon: 'mdi-account-off', color: 'red' },
  { label: 'Managers', value: users.value.filter(u => ['super_admin', 'tenant_admin', 'manager'].includes(u.role)).length, icon: 'mdi-shield-account', color: 'purple' },
])

// Debounced search
let searchTimer: ReturnType<typeof setTimeout> | null = null
function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadStaff(), 300)
}

function clearSearch() {
  search.value = ''
  loadStaff()
}

async function loadStaff() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (roleFilter.value) params.set('role', roleFilter.value)
    if (branchFilter.value) params.set('default_branch_id', String(branchFilter.value))
    if (search.value) params.set('search', search.value)
    const qs = params.toString() ? `?${params.toString()}` : ''

    const data = await useApi()(`/users/staff/${qs}`)
    users.value = data.results || data
  } catch {
    toast.error('Failed to load staff')
  } finally {
    loading.value = false
  }
}

async function loadBranches() {
  try {
    const data = await useApi()('/branches/')
    branches.value = data.results || data
  } catch { /* ignore */ }
}

function openCreate() {
  editing.value = false
  formError.value = ''
  Object.assign(form, {
    id: null, first_name: '', last_name: '', email: '', phone: '',
    employee_id: '', role: 'cashier', default_branch_id: null,
    hire_date: '', password: '',
  })
  dialog.value = true
}

function openEdit(user: StaffUser) {
  editing.value = true
  formError.value = ''
  Object.assign(form, {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone || '',
    employee_id: user.employee_id || '',
    role: user.role,
    default_branch_id: user.default_branch_id,
    hire_date: user.hire_date || '',
    password: '',
  })
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
  formError.value = ''
}

function validate(): boolean {
  if (!form.first_name.trim()) { formError.value = 'First name is required'; return false }
  if (!form.last_name.trim()) { formError.value = 'Last name is required'; return false }
  if (!form.email.trim()) { formError.value = 'Email is required'; return false }
  if (!editing.value && form.password.length < 8) { formError.value = 'Password must be at least 8 characters'; return false }
  formError.value = ''
  return true
}

async function saveStaff() {
  if (!validate()) return
  saving.value = true
  try {
    if (editing.value && form.id) {
      const payload: Record<string, any> = {
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        employee_id: form.employee_id,
        role: form.role,
        default_branch_id: form.default_branch_id,
        hire_date: form.hire_date || null,
      }
      const updated = await useApi()(`/users/staff/${form.id}/`, { method: 'PATCH', body: payload })
      const idx = users.value.findIndex(u => u.id === form.id)
      if (idx >= 0) users.value[idx] = { ...users.value[idx], ...updated }
      toast.success('Staff member updated')
    } else {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        employee_id: form.employee_id,
        role: form.role,
        default_branch_id: form.default_branch_id,
        hire_date: form.hire_date || null,
        password: form.password,
      }
      const created = await useApi()('/users/staff/', { method: 'POST', body: payload })
      users.value.unshift(created)
      toast.success('Staff member created')
    }
    dialog.value = false
  } catch (e: any) {
    formError.value = e?.data?.email?.[0] || e?.data?.detail || 'Failed to save staff member'
  } finally {
    saving.value = false
  }
}

async function toggleStatus(user: StaffUser) {
  togglingId.value = user.id
  const action = user.is_active_employee ? 'deactivate' : 'activate'
  try {
    await useApi()(`/users/staff/${user.id}/${action}/`, { method: 'POST' })
    user.is_active_employee = !user.is_active_employee
    toast.success(`Staff member ${action}d`)
  } catch {
    toast.error(`Failed to ${action} user`)
  } finally {
    togglingId.value = null
  }
}

onMounted(() => {
  loadBranches()
  loadStaff()
})
</script>

<style scoped>
.staff-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 4px 0;
}

/* ===== Header ===== */
.staff-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.staff-header__title {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: rgba(var(--v-theme-on-surface), 0.9);
  margin: 0;
}
.staff-header__sub {
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  margin: 2px 0 0;
}
.staff-header__actions {
  display: flex;
  gap: 10px;
}

/* ===== Buttons ===== */
.staff-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 10px;
  font-size: 0.8125rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.staff-btn--primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}
.staff-btn--primary:hover {
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}
.staff-btn--ghost {
  background: rgba(var(--v-theme-on-surface), 0.05);
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.staff-btn--ghost:hover {
  background: rgba(var(--v-theme-on-surface), 0.08);
}

/* ===== KPI Grid ===== */
.staff-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.staff-kpi {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.staff-kpi__icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.staff-kpi__icon--blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.staff-kpi__icon--green { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
.staff-kpi__icon--red { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.staff-kpi__icon--purple { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
.staff-kpi__body { display: flex; flex-direction: column; gap: 0; min-width: 0; }
.staff-kpi__label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(var(--v-theme-on-surface), 0.45);
  margin: 0;
}
.staff-kpi__value {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: rgba(var(--v-theme-on-surface), 0.9);
  margin: 0;
  line-height: 1.2;
}

/* ===== Toolbar ===== */
.staff-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.staff-toolbar__search {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 220px;
  max-width: 360px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 10px;
  padding: 0 12px;
  transition: border-color 0.2s;
}
.staff-toolbar__search:focus-within {
  border-color: #3b82f6;
}
.staff-toolbar__search-icon {
  color: rgba(var(--v-theme-on-surface), 0.35);
  flex-shrink: 0;
}
.staff-toolbar__search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 10px 8px;
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.85);
  font-family: inherit;
}
.staff-toolbar__search-input::placeholder {
  color: rgba(var(--v-theme-on-surface), 0.35);
}
.staff-toolbar__search-clear {
  border: none;
  background: none;
  cursor: pointer;
  color: rgba(var(--v-theme-on-surface), 0.35);
  display: flex;
  padding: 2px;
}
.staff-toolbar__filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.staff-toolbar__select {
  padding: 9px 12px;
  border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  background: rgb(var(--v-theme-surface));
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.8);
  cursor: pointer;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
}
.staff-toolbar__select:focus { border-color: #3b82f6; }

/* ===== Table ===== */
.staff-table-wrap {
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow-x: auto;
}
.staff-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}
.staff-table thead th {
  text-align: left;
  padding: 12px 16px;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(var(--v-theme-on-surface), 0.4);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  white-space: nowrap;
}
.staff-table tbody td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.04);
  vertical-align: middle;
}
.staff-table tbody tr:last-child td { border-bottom: none; }
.staff-table tbody tr:hover {
  background: rgba(var(--v-theme-on-surface), 0.02);
}

/* ===== Cell: User ===== */
.staff-cell-user {
  display: flex;
  align-items: center;
  gap: 12px;
}
.staff-avatar {
  width: 38px; height: 38px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}
.staff-avatar--blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.staff-avatar--green { background: linear-gradient(135deg, #22c55e, #15803d); }
.staff-avatar--purple { background: linear-gradient(135deg, #a855f7, #7c3aed); }
.staff-avatar--teal { background: linear-gradient(135deg, #14b8a6, #0d9488); }
.staff-avatar--orange { background: linear-gradient(135deg, #f97316, #ea580c); }
.staff-avatar--indigo { background: linear-gradient(135deg, #6366f1, #4338ca); }
.staff-avatar--cyan { background: linear-gradient(135deg, #06b6d4, #0891b2); }
.staff-avatar--grey { background: linear-gradient(135deg, #94a3b8, #64748b); }
.staff-cell-user__info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.staff-cell-user__name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.85);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.staff-cell-user__email {
  font-size: 0.6875rem;
  color: rgba(var(--v-theme-on-surface), 0.45);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== Role Chip ===== */
.staff-role-chip {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.6875rem;
  font-weight: 600;
  white-space: nowrap;
}
.staff-role-chip--blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.staff-role-chip--green { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
.staff-role-chip--purple { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
.staff-role-chip--indigo { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
.staff-role-chip--teal { background: rgba(20, 184, 166, 0.1); color: #14b8a6; }
.staff-role-chip--orange { background: rgba(249, 115, 22, 0.1); color: #f97316; }
.staff-role-chip--cyan { background: rgba(6, 182, 212, 0.1); color: #06b6d4; }
.staff-role-chip--grey { background: rgba(148, 163, 184, 0.1); color: #64748b; }

/* ===== Status ===== */
.staff-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}
.staff-status__dot {
  width: 8px; height: 8px;
  border-radius: 50%;
}
.staff-status--active { color: #22c55e; }
.staff-status--active .staff-status__dot { background: #22c55e; box-shadow: 0 0 6px rgba(34, 197, 94, 0.4); }
.staff-status--inactive { color: #ef4444; }
.staff-status--inactive .staff-status__dot { background: #ef4444; }

/* ===== Cell Text ===== */
.staff-cell-text {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  white-space: nowrap;
}
.staff-cell-muted {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.3);
}

/* ===== Actions ===== */
.staff-actions {
  display: flex;
  gap: 6px;
}
.staff-action-btn {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: transparent;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: rgba(var(--v-theme-on-surface), 0.5);
  transition: all 0.2s;
}
.staff-action-btn:hover {
  background: rgba(var(--v-theme-on-surface), 0.05);
  color: rgba(var(--v-theme-on-surface), 0.8);
}
.staff-action-btn--danger:hover { color: #ef4444; border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.05); }
.staff-action-btn--success:hover { color: #22c55e; border-color: rgba(34, 197, 94, 0.3); background: rgba(34, 197, 94, 0.05); }
.staff-action-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ===== Skeleton ===== */
.staff-skeleton {
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(var(--v-theme-on-surface), 0.04) 0%, rgba(var(--v-theme-on-surface), 0.08) 50%, rgba(var(--v-theme-on-surface), 0.04) 100%);
  background-size: 200% 100%;
  animation: staffShimmer 1.5s infinite;
}
@keyframes staffShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ===== Empty State ===== */
.staff-empty {
  text-align: center;
  padding: 48px 20px !important;
}
.staff-empty__icon {
  color: rgba(var(--v-theme-on-surface), 0.15);
  margin-bottom: 12px;
}
.staff-empty__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0 0 4px;
}
.staff-empty__sub {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.35);
  margin: 0;
}

/* ===== Dialog ===== */
.staff-dialog {
  overflow: hidden;
}
.staff-dialog__header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px;
}
.staff-dialog__header-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.staff-dialog__header-icon--primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
.staff-dialog__header-icon--edit {
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}
.staff-dialog__title {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.01em;
}
.staff-dialog__sub {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  margin: 2px 0 0;
}
.staff-dialog__body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.staff-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.staff-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.staff-field__label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(var(--v-theme-on-surface), 0.5);
}
.staff-field__input {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgba(var(--v-theme-on-surface), 0.03);
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.85);
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s, background 0.2s;
}
.staff-field__input:focus {
  border-color: #3b82f6;
  background: rgb(var(--v-theme-surface));
}
.staff-field__input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.staff-form-error {
  font-size: 0.75rem;
  color: #ef4444;
  margin: 0;
}
.staff-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
}

/* ===== Responsive ===== */
@media (max-width: 900px) {
  .staff-kpi-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .staff-kpi-grid { grid-template-columns: 1fr; }
  .staff-form-row { grid-template-columns: 1fr; }
  .staff-toolbar__filters { width: 100%; }
  .staff-toolbar__select { flex: 1; }
}
</style>

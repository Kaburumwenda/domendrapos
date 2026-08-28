<template>
  <div class="staff-page">
    <!-- Header -->
    <div class="staff-header">
      <div class="staff-header__left">
        <h1 class="staff-header__title">Staff Members</h1>
        <p class="staff-header__sub">Manage your team — roles, status, branch assignments, and permissions</p>
      </div>
      <div class="staff-header__actions">
        <button class="staff-btn staff-btn--ghost" @click="loadStaff">
          <v-icon size="18">mdi-refresh</v-icon>
          Refresh
        </button>
        <button class="staff-btn staff-btn--ghost" @click="exportStaffCsv">
          <v-icon size="18">mdi-download</v-icon>
          Export
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
        <select v-model="statusFilter" class="staff-toolbar__select" @change="loadStaff">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Deactivated</option>
        </select>
      </div>
    </div>

    <!-- Bulk action bar -->
    <Transition name="staff-bulk">
      <div v-if="selectedIds.length > 0" class="staff-bulk-bar">
        <div class="staff-bulk-bar__left">
          <v-icon size="18" color="primary">mdi-check-circle</v-icon>
          <span class="staff-bulk-bar__count">{{ selectedIds.length }} selected</span>
          <button class="staff-bulk-bar__clear" @click="clearSelection">Clear</button>
        </div>
        <div class="staff-bulk-bar__actions">
          <button class="staff-bulk-btn staff-bulk-btn--success" :disabled="bulkActioning" @click="bulkActivate">
            <v-icon size="16">mdi-account-check-outline</v-icon> Activate
          </button>
          <button class="staff-bulk-btn staff-bulk-btn--danger" :disabled="bulkActioning" @click="bulkDeactivate">
            <v-icon size="16">mdi-account-off-outline</v-icon> Deactivate
          </button>
          <button class="staff-bulk-btn staff-bulk-btn--danger" :disabled="bulkActioning" @click="confirmBulkDelete = true">
            <v-icon size="16">mdi-delete-outline</v-icon> Delete
          </button>
        </div>
      </div>
    </Transition>

    <!-- Table -->
    <div class="staff-table-wrap">
      <table class="staff-table">
        <thead>
          <tr>
            <th style="width: 40px;">
              <input
                type="checkbox"
                class="staff-checkbox"
                :checked="isAllSelected"
                :indeterminate.prop="isIndeterminate"
                @change="toggleSelectAll"
              />
            </th>
            <th class="staff-th-sort" @click="setSort('first_name')">Staff Member <v-icon v-if="sortBy === 'first_name'" size="12">{{ sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up' }}</v-icon></th>
            <th class="staff-th-sort" @click="setSort('role')">Role <v-icon v-if="sortBy === 'role'" size="12">{{ sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up' }}</v-icon></th>
            <th>Phone</th>
            <th>Branch</th>
            <th class="staff-th-sort" @click="setSort('is_active_employee')">Status <v-icon v-if="sortBy === 'is_active_employee'" size="12">{{ sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up' }}</v-icon></th>
            <th class="staff-th-sort" @click="setSort('hire_date')">Hired <v-icon v-if="sortBy === 'hire_date'" size="12">{{ sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up' }}</v-icon></th>
            <th style="width: 140px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading skeleton -->
          <template v-if="loading">
            <tr v-for="i in 6" :key="'sk-' + i">
              <td><div class="staff-skeleton" style="width: 18px; height: 18px;" /></td>
              <td><div class="staff-skeleton" style="width: 160px; height: 38px;" /></td>
              <td><div class="staff-skeleton" style="width: 90px; height: 22px;" /></td>
              <td><div class="staff-skeleton" style="width: 100px; height: 16px;" /></td>
              <td><div class="staff-skeleton" style="width: 80px; height: 16px;" /></td>
              <td><div class="staff-skeleton" style="width: 70px; height: 22px;" /></td>
              <td><div class="staff-skeleton" style="width: 70px; height: 16px;" /></td>
              <td><div class="staff-skeleton" style="width: 120px; height: 28px;" /></td>
            </tr>
          </template>
          <!-- Empty -->
          <tr v-else-if="!filteredUsers.length">
            <td colspan="8" class="staff-empty">
              <v-icon size="40" class="staff-empty__icon">mdi-account-group-outline</v-icon>
              <p class="staff-empty__title">No staff members found</p>
              <p class="staff-empty__sub">Try adjusting your search or filters</p>
            </td>
          </tr>
          <!-- Rows -->
          <tr v-for="user in filteredUsers" :key="user.id" :class="{ 'staff-row--selected': selectedIds.includes(user.id) }">
            <td>
              <input
                type="checkbox"
                class="staff-checkbox"
                :checked="selectedIds.includes(user.id)"
                @change="toggleSelect(user.id)"
              />
            </td>
            <td>
              <div class="staff-cell-user">
                <div class="staff-avatar" :class="`staff-avatar--${roleColor(user.role)}`">
                  <img v-if="user.avatar" :src="user.avatar" class="staff-avatar__img" />
                  <span v-else>{{ initials(user) }}</span>
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
                <button class="staff-action-btn" title="View / Edit" @click="openEdit(user)">
                  <v-icon size="16">mdi-pencil-outline</v-icon>
                </button>
                <button class="staff-action-btn" title="Reset Password" @click="openResetPw(user)">
                  <v-icon size="16">mdi-lock-reset</v-icon>
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
                <button class="staff-action-btn staff-action-btn--danger" title="Delete" @click="confirmDelete(user)">
                  <v-icon size="16">mdi-delete-outline</v-icon>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && pagination.count > 0" class="staff-pagination">
      <div class="staff-pagination__info">
        <span class="staff-pagination__info-num">{{ (pagination.page - 1) * pageSize + 1 }}–{{ Math.min(pagination.page * pageSize, pagination.count) }}</span>
        <span class="staff-pagination__info-sep">of</span>
        <span class="staff-pagination__info-total">{{ pagination.count }}</span>
        <span class="staff-pagination__info-label">staff members</span>
      </div>
      <div class="staff-pagination__controls">
        <button
          class="staff-page-btn staff-page-btn--nav"
          :disabled="pagination.page <= 1"
          @click="changePage(pagination.page - 1)"
        >
          <v-icon size="16">mdi-chevron-left</v-icon>
          <span>Prev</span>
        </button>
        <button
          v-for="p in pageNumbers"
          :key="p"
          class="staff-page-btn"
          :class="{ 'staff-page-btn--active': p === pagination.page }"
          @click="changePage(p)"
        >{{ p }}</button>
        <button
          class="staff-page-btn staff-page-btn--nav"
          :disabled="pagination.page >= pagination.totalPages"
          @click="changePage(pagination.page + 1)"
        >
          <span>Next</span>
          <v-icon size="16">mdi-chevron-right</v-icon>
        </button>
      </div>
    </div>

    <!-- ====== Create / Edit Dialog ====== -->
    <v-dialog v-model="dialog" max-width="640" persistent scroll-strategy="block">
      <v-card rounded="xl" class="staff-dialog">
        <div class="staff-dialog__header">
          <div class="staff-dialog__header-icon" :class="editing ? 'staff-dialog__header-icon--edit' : 'staff-dialog__header-icon--primary'">
            <v-icon size="22">{{ editing ? 'mdi-pencil' : 'mdi-account-plus-outline' }}</v-icon>
          </div>
          <div class="flex-1">
            <h3 class="staff-dialog__title">{{ editing ? 'Edit Staff Member' : 'Add New Staff' }}</h3>
            <p class="staff-dialog__sub">{{ editing ? 'Update role, branch, and profile details' : 'Create a new team member account' }}</p>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="closeDialog" />
        </div>
        <v-divider />

        <!-- Avatar upload -->
        <div class="staff-dialog__avatar-section">
          <input ref="avatarInput" type="file" accept="image/*" class="d-none" @change="onAvatarSelected" />
          <div class="staff-avatar-lg" :class="`staff-avatar-lg--${roleColor(form.role)}`" @click="triggerAvatarInput">
            <img v-if="avatarPreview" :src="avatarPreview" class="staff-avatar-lg__img" />
            <span v-else>{{ formInitials }}</span>
            <div class="staff-avatar-overlay">
              <v-icon size="18" color="white">mdi-camera</v-icon>
            </div>
          </div>
          <div class="staff-avatar-actions">
            <button v-if="avatarPreview" class="staff-btn staff-btn--ghost staff-btn--sm" @click="removeAvatar">
              <v-icon size="14">mdi-trash-can-outline</v-icon> Remove
            </button>
            <button class="staff-btn staff-btn--ghost staff-btn--sm" @click="triggerAvatarInput">
              <v-icon size="14">mdi-upload</v-icon> {{ avatarPreview ? 'Change' : 'Upload' }} Photo
            </button>
          </div>
        </div>

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
            <div v-if="editing" class="staff-field">
              <label class="staff-field__label">Termination Date</label>
              <input v-model="form.termination_date" class="staff-field__input" type="date" />
            </div>
            <div v-else class="staff-field">
              <label class="staff-field__label">Password</label>
              <input v-model="form.password" class="staff-field__input" type="password" placeholder="Min 8 characters" />
            </div>
          </div>
          <div v-if="editing" class="staff-field staff-field--toggle">
            <label class="staff-toggle-row">
              <input type="checkbox" v-model="form.is_active_employee" class="staff-checkbox" />
              <span class="staff-toggle-label">Active Employee</span>
              <span class="staff-toggle-desc">When unchecked, this user cannot log in</span>
            </label>
          </div>
          <div v-if="formError" class="staff-form-error">
            <v-icon size="14">mdi-alert-circle</v-icon> {{ formError }}
          </div>
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

    <!-- ====== Reset Password Dialog ====== -->
    <v-dialog v-model="resetPwDialog" max-width="480" persistent scroll-strategy="block">
      <v-card rounded="xl" class="staff-dialog">
        <div class="staff-dialog__header">
          <div class="staff-dialog__header-icon staff-dialog__header-icon--primary">
            <v-icon size="22">mdi-lock-reset</v-icon>
          </div>
          <div class="flex-1">
            <h3 class="staff-dialog__title">Reset Password</h3>
            <p class="staff-dialog__sub">Set a new password for {{ resetPwTarget?.first_name }} {{ resetPwTarget?.last_name }}</p>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="resetPwDialog = false" />
        </div>
        <v-divider />
        <div class="staff-dialog__body">
          <div class="staff-field">
            <label class="staff-field__label">New Password</label>
            <input v-model="resetPwForm.new_password" class="staff-field__input" type="password" placeholder="Min 8 characters" />
          </div>
          <div class="staff-field">
            <label class="staff-field__label">Confirm Password</label>
            <input v-model="resetPwForm.confirm" class="staff-field__input" type="password" placeholder="Re-enter new password" />
          </div>
          <p v-if="resetPwError" class="staff-form-error">
            <v-icon size="14">mdi-alert-circle</v-icon> {{ resetPwError }}
          </p>
        </div>
        <v-divider />
        <div class="staff-dialog__footer">
          <button class="staff-btn staff-btn--ghost" @click="resetPwDialog = false">Cancel</button>
          <button class="staff-btn staff-btn--primary" :disabled="resettingPw" @click="doResetPw">
            <v-progress-circular v-if="resettingPw" indeterminate size="16" width="2" color="white" class="mr-2" />
            Reset Password
          </button>
        </div>
      </v-card>
    </v-dialog>

    <!-- ====== Delete Confirmation Dialog ====== -->
    <v-dialog v-model="deleteDialog" max-width="440" persistent scroll-strategy="block">
      <v-card rounded="xl" class="staff-dialog">
        <div class="staff-dialog__header">
          <div class="staff-dialog__header-icon staff-dialog__header-icon--danger">
            <v-icon size="22">mdi-delete-outline</v-icon>
          </div>
          <div class="flex-1">
            <h3 class="staff-dialog__title">Delete Staff Member</h3>
            <p class="staff-dialog__sub">This will deactivate {{ deleteTarget?.first_name }} {{ deleteTarget?.last_name }}. You can optionally permanently delete them.</p>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="deleteDialog = false" />
        </div>
        <v-divider />
        <div class="staff-dialog__body">
          <div class="staff-delete-info">
            <div class="staff-avatar staff-avatar--grey" style="width: 48px; height: 48px; font-size: 0.875rem;">
              <span>{{ deleteTarget ? initials(deleteTarget) : '' }}</span>
            </div>
            <div>
              <p class="staff-delete-info__name">{{ deleteTarget ? fullName(deleteTarget) : '' }}</p>
              <p class="staff-delete-info__email">{{ deleteTarget?.email }}</p>
            </div>
          </div>
          <label class="staff-delete-check">
            <input type="checkbox" v-model="hardDelete" class="staff-checkbox" />
            <span>Permanently delete this user (cannot be undone)</span>
          </label>
        </div>
        <v-divider />
        <div class="staff-dialog__footer">
          <button class="staff-btn staff-btn--ghost" @click="deleteDialog = false">Cancel</button>
          <button class="staff-btn staff-btn--danger" :disabled="deleting" @click="doDelete">
            <v-progress-circular v-if="deleting" indeterminate size="16" width="2" color="white" class="mr-2" />
            {{ hardDelete ? 'Delete Permanently' : 'Deactivate' }}
          </button>
        </div>
      </v-card>
    </v-dialog>

    <!-- ====== Bulk Delete Confirmation ====== -->
    <v-dialog v-model="confirmBulkDelete" max-width="440" persistent scroll-strategy="block">
      <v-card rounded="xl" class="staff-dialog">
        <div class="staff-dialog__header">
          <div class="staff-dialog__header-icon staff-dialog__header-icon--danger">
            <v-icon size="22">mdi-delete-outline</v-icon>
          </div>
          <div class="flex-1">
            <h3 class="staff-dialog__title">Delete {{ selectedIds.length }} Staff Members</h3>
            <p class="staff-dialog__sub">This will deactivate the selected users. You can optionally permanently delete them.</p>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="confirmBulkDelete = false" />
        </div>
        <v-divider />
        <div class="staff-dialog__body">
          <label class="staff-delete-check">
            <input type="checkbox" v-model="hardDelete" class="staff-checkbox" />
            <span>Permanently delete these users (cannot be undone)</span>
          </label>
        </div>
        <v-divider />
        <div class="staff-dialog__footer">
          <button class="staff-btn staff-btn--ghost" @click="confirmBulkDelete = false">Cancel</button>
          <button class="staff-btn staff-btn--danger" :disabled="bulkActioning" @click="doBulkDelete">
            <v-progress-circular v-if="bulkActioning" indeterminate size="16" width="2" color="white" class="mr-2" />
            {{ hardDelete ? 'Delete Permanently' : 'Deactivate' }} All
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
const { exportCsv } = useCsvExport()

interface StaffUser {
  id: number
  email: string
  first_name: string
  last_name: string
  role: string
  phone: string
  avatar: string | null
  is_active: boolean
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

// ── State ──
const users = ref<StaffUser[]>([])
const branches = ref<Branch[]>([])
const loading = ref(true)
const togglingId = ref<number | null>(null)
const search = ref('')
const roleFilter = ref('')
const branchFilter = ref('')
const statusFilter = ref('')
const sortBy = ref('date_joined')
const sortDesc = ref(true)
const selectedIds = ref<number[]>([])

const pageSize = 20
const pagination = reactive({
  count: 0,
  page: 1,
  totalPages: 1,
})

// Avatar upload
const avatarInput = ref<HTMLInputElement | null>(null)
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string>('')

// ── Dialog state ──
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
  termination_date: '',
  password: '',
  is_active_employee: true,
})

// Reset password
const resetPwDialog = ref(false)
const resetPwTarget = ref<StaffUser | null>(null)
const resetPwForm = reactive({ new_password: '', confirm: '' })
const resetPwError = ref('')
const resettingPw = ref(false)

// Delete
const deleteDialog = ref(false)
const deleteTarget = ref<StaffUser | null>(null)
const hardDelete = ref(false)
const deleting = ref(false)

// Bulk actions
const confirmBulkDelete = ref(false)
const bulkActioning = ref(false)

// ── Role config ──
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

// ── Helpers ──
function roleColor(role: string): string { return roleColors[role] || 'grey' }
function roleLabel(role: string): string { return roleOptions.find(r => r.value === role)?.label || role.replace(/_/g, ' ') }
function fullName(u: StaffUser): string { return `${u.first_name} ${u.last_name}`.trim() || u.email }
function initials(u: StaffUser): string {
  const f = u.first_name?.[0] || ''
  const l = u.last_name?.[0] || ''
  return (f + l).toUpperCase() || '?'
}
function branchName(id: number | null): string {
  if (!id) return ''
  return branches.value.find(b => b.id === id)?.name || ''
}

const formInitials = computed(() => {
  const f = form.first_name?.[0] || ''
  const l = form.last_name?.[0] || ''
  return (f + l).toUpperCase() || '?'
})

const filteredUsers = computed(() => users.value)

const isAllSelected = computed(() => {
  if (!users.value.length) return false
  return users.value.every(u => selectedIds.value.includes(u.id))
})

const isIndeterminate = computed(() => selectedIds.value.length > 0 && !isAllSelected.value)

const pageNumbers = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, pagination.page - 2)
  const end = Math.min(pagination.totalPages, start + 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const kpis = computed(() => [
  { label: 'Total Staff', value: pagination.count, icon: 'mdi-account-group', color: 'blue' },
  { label: 'Active', value: users.value.filter(u => u.is_active_employee).length, icon: 'mdi-account-check', color: 'green' },
  { label: 'Inactive', value: users.value.filter(u => !u.is_active_employee).length, icon: 'mdi-account-off', color: 'red' },
  { label: 'Managers', value: users.value.filter(u => ['super_admin', 'tenant_admin', 'manager'].includes(u.role)).length, icon: 'mdi-shield-account', color: 'purple' },
])

// ── Sorting ──
function setSort(field: string) {
  if (sortBy.value === field) {
    sortDesc.value = !sortDesc.value
  } else {
    sortBy.value = field
    sortDesc.value = false
  }
  loadStaff()
}

// ── Selection ──
function toggleSelect(id: number) {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = selectedIds.value.filter(id => !users.value.find(u => u.id === id))
  } else {
    selectedIds.value = [...new Set([...selectedIds.value, ...users.value.map(u => u.id)])]
  }
}

function clearSelection() {
  selectedIds.value = []
}

// ── Search ──
let searchTimer: ReturnType<typeof setTimeout> | null = null
function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    pagination.page = 1
    loadStaff()
  }, 300)
}

function clearSearch() {
  search.value = ''
  pagination.page = 1
  loadStaff()
}

// ── Pagination ──
function changePage(p: number) {
  pagination.page = p
  loadStaff()
}

// ── API: Load ──
async function loadStaff() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (roleFilter.value) params.set('role', roleFilter.value)
    if (branchFilter.value) params.set('default_branch_id', String(branchFilter.value))
    if (statusFilter.value === 'active') params.set('is_active_employee', 'true')
    if (statusFilter.value === 'inactive') params.set('is_active_employee', 'false')
    if (search.value) params.set('search', search.value)
    params.set('page', String(pagination.page))
    params.set('page_size', String(pageSize))
    if (sortBy.value) params.set('ordering', `${sortDesc.value ? '-' : ''}${sortBy.value}`)

    const data = await useApi()(`/users/staff/?${params.toString()}`)
    users.value = data.results || data
    pagination.count = data.count || users.value.length
    pagination.totalPages = Math.ceil(pagination.count / pageSize) || 1
  } catch {
    toast.error('Failed to load staff')
  } finally {
    loading.value = false
  }
}

async function loadBranches() {
  try {
    const data = await useApi()('/branches/?page_size=100')
    branches.value = data.results || data
  } catch { /* ignore */ }
}

// ── Avatar upload ──
function triggerAvatarInput() {
  avatarInput.value?.click()
}

function onAvatarSelected(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image exceeds the 5 MB limit')
      target.value = ''
      return
    }
    avatarFile.value = file
    const reader = new FileReader()
    reader.onload = (ev) => { avatarPreview.value = ev.target?.result as string }
    reader.readAsDataURL(file)
  }
  target.value = ''
}

function removeAvatar() {
  avatarFile.value = null
  avatarPreview.value = ''
}

// ── Create / Edit ──
function openCreate() {
  editing.value = false
  formError.value = ''
  avatarFile.value = null
  avatarPreview.value = ''
  Object.assign(form, {
    id: null, first_name: '', last_name: '', email: '', phone: '',
    employee_id: '', role: 'cashier', default_branch_id: null,
    hire_date: '', termination_date: '', password: '', is_active_employee: true,
  })
  dialog.value = true
}

function openEdit(user: StaffUser) {
  editing.value = true
  formError.value = ''
  avatarFile.value = null
  avatarPreview.value = user.avatar || ''
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
    termination_date: user.termination_date || '',
    password: '',
    is_active_employee: user.is_active_employee,
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
      const baseData: Record<string, any> = {
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        employee_id: form.employee_id,
        role: form.role,
        default_branch_id: form.default_branch_id ?? '',
        hire_date: form.hire_date || null,
        termination_date: form.termination_date || null,
        is_active_employee: form.is_active_employee,
      }

      let payload: any = baseData
      let fetchOpts: any = {}

      if (avatarFile.value) {
        const formData = new FormData()
        for (const [key, value] of Object.entries(baseData)) {
          if (value === null || value === undefined) continue
          formData.append(key, String(value))
        }
        formData.append('avatar', avatarFile.value)
        payload = formData
        fetchOpts = { headers: {} }
      }

      const updated = await useApi()(`/users/staff/${form.id}/`, { method: 'PATCH', body: payload, ...fetchOpts })
      const idx = users.value.findIndex(u => u.id === form.id)
      if (idx >= 0) users.value[idx] = { ...users.value[idx], ...updated }
      toast.success('Staff member updated')
    } else {
      const baseData: Record<string, any> = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        employee_id: form.employee_id,
        role: form.role,
        default_branch_id: form.default_branch_id ?? '',
        hire_date: form.hire_date || null,
        password: form.password,
      }

      let payload: any = baseData
      let fetchOpts: any = {}

      if (avatarFile.value) {
        const formData = new FormData()
        for (const [key, value] of Object.entries(baseData)) {
          if (value === null || value === undefined) continue
          formData.append(key, String(value))
        }
        formData.append('avatar', avatarFile.value)
        payload = formData
        fetchOpts = { headers: {} }
      }

      const created = await useApi()('/users/staff/', { method: 'POST', body: payload, ...fetchOpts })
      users.value.unshift(created)
      pagination.count++
      toast.success('Staff member created')
    }
    dialog.value = false
  } catch (e: any) {
    formError.value = e?.data?.email?.[0] || e?.data?.detail || 'Failed to save staff member'
  } finally {
    saving.value = false
  }
}

// ── Activate / Deactivate ──
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

// ── Reset Password ──
function openResetPw(user: StaffUser) {
  resetPwTarget.value = user
  resetPwForm.new_password = ''
  resetPwForm.confirm = ''
  resetPwError.value = ''
  resetPwDialog.value = true
}

async function doResetPw() {
  if (!resetPwTarget.value) return
  if (resetPwForm.new_password.length < 8) {
    resetPwError.value = 'Password must be at least 8 characters'
    return
  }
  if (resetPwForm.new_password !== resetPwForm.confirm) {
    resetPwError.value = 'Passwords do not match'
    return
  }
  resettingPw.value = true
  try {
    await useApi()(`/users/staff/${resetPwTarget.value.id}/reset-password/`, {
      method: 'POST',
      body: { new_password: resetPwForm.new_password },
    })
    toast.success('Password reset successfully')
    resetPwDialog.value = false
  } catch (e: any) {
    resetPwError.value = e?.data?.detail || 'Failed to reset password'
  } finally {
    resettingPw.value = false
  }
}

// ── Delete ──
function confirmDelete(user: StaffUser) {
  deleteTarget.value = user
  hardDelete.value = false
  deleteDialog.value = true
}

async function doDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    const url = hardDelete.value
      ? `/users/staff/${deleteTarget.value.id}/?hard=1`
      : `/users/staff/${deleteTarget.value.id}/`
    await useApi()(url, { method: 'DELETE' })
    if (hardDelete.value) {
      users.value = users.value.filter(u => u.id !== deleteTarget.value!.id)
      pagination.count--
    } else {
      const idx = users.value.findIndex(u => u.id === deleteTarget.value!.id)
      if (idx >= 0) users.value[idx].is_active_employee = false
    }
    toast.success(hardDelete.value ? 'Staff member deleted' : 'Staff member deactivated')
    deleteDialog.value = false
  } catch {
    toast.error('Failed to delete staff member')
  } finally {
    deleting.value = false
  }
}

// ── Bulk Actions ──
async function bulkActivate() {
  bulkActioning.value = true
  let ok = 0
  for (const id of selectedIds.value) {
    try {
      await useApi()(`/users/staff/${id}/activate/`, { method: 'POST' })
      const u = users.value.find(x => x.id === id)
      if (u) u.is_active_employee = true
      ok++
    } catch { /* skip */ }
  }
  bulkActioning.value = false
  toast.success(`${ok} staff member(s) activated`)
  clearSelection()
}

async function bulkDeactivate() {
  bulkActioning.value = true
  let ok = 0
  for (const id of selectedIds.value) {
    try {
      await useApi()(`/users/staff/${id}/deactivate/`, { method: 'POST' })
      const u = users.value.find(x => x.id === id)
      if (u) u.is_active_employee = false
      ok++
    } catch { /* skip */ }
  }
  bulkActioning.value = false
  toast.success(`${ok} staff member(s) deactivated`)
  clearSelection()
}

async function doBulkDelete() {
  bulkActioning.value = true
  let ok = 0
  for (const id of selectedIds.value) {
    try {
      const url = hardDelete.value ? `/users/staff/${id}/?hard=1` : `/users/staff/${id}/`
      await useApi()(url, { method: 'DELETE' })
      if (hardDelete.value) {
        users.value = users.value.filter(u => u.id !== id)
      } else {
        const u = users.value.find(x => x.id === id)
        if (u) u.is_active_employee = false
      }
      ok++
    } catch { /* skip */ }
  }
  bulkActioning.value = false
  toast.success(`${ok} staff member(s) ${hardDelete.value ? 'deleted' : 'deactivated'}`)
  confirmBulkDelete.value = false
  clearSelection()
  if (hardDelete.value) pagination.count -= ok
}

// ── Export ──
function exportStaffCsv() {
  const rows = users.value.map(u => ({
    'First Name': u.first_name,
    'Last Name': u.last_name,
    'Email': u.email,
    'Role': roleLabel(u.role),
    'Phone': u.phone || '',
    'Employee ID': u.employee_id || '',
    'Branch': branchName(u.default_branch_id) || 'Unassigned',
    'Status': u.is_active_employee ? 'Active' : 'Inactive',
    'Hire Date': u.hire_date || '',
    'Termination Date': u.termination_date || '',
    'Date Joined': u.date_joined,
  }))
  exportCsv('staff-members.csv', rows)
  toast.success('Exported staff list')
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
.staff-btn--sm { padding: 6px 12px; font-size: 0.75rem; }
.staff-btn--primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}
.staff-btn--primary:hover { box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4); transform: translateY(-1px); }
.staff-btn--danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}
.staff-btn--danger:hover { box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4); transform: translateY(-1px); }
.staff-btn--ghost {
  background: rgba(var(--v-theme-on-surface), 0.05);
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.staff-btn--ghost:hover { background: rgba(var(--v-theme-on-surface), 0.08); }
.staff-btn:disabled { opacity: 0.5; cursor: not-allowed; }

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
.staff-toolbar__search:focus-within { border-color: #3b82f6; }
.staff-toolbar__search-icon { color: rgba(var(--v-theme-on-surface), 0.35); flex-shrink: 0; }
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
.staff-toolbar__search-input::placeholder { color: rgba(var(--v-theme-on-surface), 0.35); }
.staff-toolbar__search-clear {
  border: none;
  background: none;
  cursor: pointer;
  color: rgba(var(--v-theme-on-surface), 0.35);
  display: flex;
  padding: 2px;
}
.staff-toolbar__filters { display: flex; gap: 8px; flex-wrap: wrap; }
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

/* ===== Bulk bar ===== */
.staff-bulk-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  border-radius: 12px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  flex-wrap: wrap;
}
.staff-bulk-bar__left { display: flex; align-items: center; gap: 10px; }
.staff-bulk-bar__count {
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.8);
}
.staff-bulk-bar__clear {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.75rem;
  color: rgba(var(--v-theme-primary), 0.8);
  font-weight: 500;
}
.staff-bulk-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: transparent;
  cursor: pointer;
  color: rgba(var(--v-theme-on-surface), 0.7);
  transition: all 0.2s;
}
.staff-bulk-btn--success:hover { color: #22c55e; border-color: rgba(34, 197, 94, 0.3); background: rgba(34, 197, 94, 0.06); }
.staff-bulk-btn--danger:hover { color: #ef4444; border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.06); }
.staff-bulk-btn:disabled { opacity: 0.4; cursor: not-allowed; }

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
.staff-th-sort { cursor: pointer; user-select: none; transition: color 0.2s; }
.staff-th-sort:hover { color: rgba(var(--v-theme-on-surface), 0.6); }
.staff-table tbody td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.04);
  vertical-align: middle;
}
.staff-table tbody tr:last-child td { border-bottom: none; }
.staff-table tbody tr:hover { background: rgba(var(--v-theme-on-surface), 0.02); }
.staff-row--selected { background: rgba(var(--v-theme-primary), 0.04) !important; }

/* ===== Checkbox ===== */
.staff-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: rgb(var(--v-theme-primary));
  border-radius: 4px;
}

/* ===== Cell: User ===== */
.staff-cell-user { display: flex; align-items: center; gap: 12px; }
.staff-avatar {
  width: 38px; height: 38px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
}
.staff-avatar__img { width: 100%; height: 100%; object-fit: cover; }
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
.staff-status__dot { width: 8px; height: 8px; border-radius: 50%; }
.staff-status--active { color: #22c55e; }
.staff-status--active .staff-status__dot { background: #22c55e; box-shadow: 0 0 6px rgba(34, 197, 94, 0.4); }
.staff-status--inactive { color: #ef4444; }
.staff-status--inactive .staff-status__dot { background: #ef4444; }

/* ===== Cell Text ===== */
.staff-cell-text { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.7); white-space: nowrap; }
.staff-cell-muted { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.3); }

/* ===== Actions ===== */
.staff-actions { display: flex; gap: 6px; }
.staff-action-btn {
  width: 30px; height: 30px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: transparent;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: rgba(var(--v-theme-on-surface), 0.5);
  transition: all 0.2s;
}
.staff-action-btn:hover { background: rgba(var(--v-theme-on-surface), 0.05); color: rgba(var(--v-theme-on-surface), 0.8); }
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
.staff-empty { text-align: center; padding: 48px 20px !important; }
.staff-empty__icon { color: rgba(var(--v-theme-on-surface), 0.15); margin-bottom: 12px; }
.staff-empty__title { font-size: 0.9375rem; font-weight: 600; color: rgba(var(--v-theme-on-surface), 0.6); margin: 0 0 4px; }
.staff-empty__sub { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.35); margin: 0; }

/* ===== Pagination ===== */
.staff-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 18px;
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.staff-pagination__info {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 0.8125rem;
}
.staff-pagination__info-num {
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.85);
  font-size: 0.875rem;
}
.staff-pagination__info-sep {
  color: rgba(var(--v-theme-on-surface), 0.3);
  font-size: 0.75rem;
}
.staff-pagination__info-total {
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}
.staff-pagination__info-label {
  color: rgba(var(--v-theme-on-surface), 0.45);
  font-size: 0.75rem;
}
.staff-pagination__controls {
  display: flex;
  align-items: center;
  gap: 4px;
}
.staff-page-btn {
  min-width: 36px; height: 36px;
  padding: 0 8px;
  border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: transparent;
  color: rgba(var(--v-theme-on-surface), 0.65);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 4px;
  transition: all 0.2s ease;
  font-family: inherit;
}
.staff-page-btn:hover:not(:disabled) {
  border-color: rgba(var(--v-theme-primary), 0.4);
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.05);
}
.staff-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.staff-page-btn--nav {
  padding: 0 14px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  gap: 2px;
}
.staff-page-btn--active {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.85));
  color: #fff;
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.3);
}
.staff-page-btn--active:hover {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.85));
  color: #fff;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.4);
  transform: translateY(-1px);
}

/* ===== Dialog ===== */
.staff-dialog { overflow: hidden; }
.staff-dialog__header { display: flex; align-items: center; gap: 14px; padding: 20px 24px; }
.staff-dialog__header-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.staff-dialog__header-icon--primary { background: linear-gradient(135deg, #3b82f6, #2563eb); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
.staff-dialog__header-icon--edit { background: linear-gradient(135deg, #f97316, #ea580c); box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3); }
.staff-dialog__header-icon--danger { background: linear-gradient(135deg, #ef4444, #dc2626); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
.staff-dialog__title { font-size: 1.125rem; font-weight: 700; margin: 0; letter-spacing: -0.01em; }
.staff-dialog__sub { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.5); margin: 2px 0 0; }

/* ===== Avatar upload in dialog ===== */
.staff-dialog__avatar-section { display: flex; align-items: center; gap: 16px; padding: 20px 24px 0; }
.staff-avatar-lg {
  width: 72px; height: 72px;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s;
}
.staff-avatar-lg:hover { transform: scale(1.03); }
.staff-avatar-lg__img { width: 100%; height: 100%; object-fit: cover; }
.staff-avatar-overlay {
  position: absolute;
  inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.2s;
}
.staff-avatar-lg:hover .staff-avatar-overlay { opacity: 1; }
.staff-avatar-actions { display: flex; flex-direction: column; gap: 6px; }

.staff-dialog__body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
.staff-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.staff-field { display: flex; flex-direction: column; gap: 6px; }
.staff-field--toggle { margin-top: -4px; }
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
.staff-field__input:focus { border-color: #3b82f6; background: rgb(var(--v-theme-surface)); }
.staff-field__input:disabled { opacity: 0.5; cursor: not-allowed; }
.staff-form-error {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #ef4444;
  margin: 0;
}

/* ===== Toggle row ===== */
.staff-toggle-row {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
.staff-toggle-label { font-size: 0.8125rem; font-weight: 600; color: rgba(var(--v-theme-on-surface), 0.8); }
.staff-toggle-desc { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.4); margin-left: auto; }

/* ===== Delete info ===== */
.staff-delete-info {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border-radius: 12px;
  background: rgba(var(--v-theme-on-surface), 0.03);
}
.staff-delete-info__name { font-size: 0.875rem; font-weight: 600; margin: 0; color: rgba(var(--v-theme-on-surface), 0.85); }
.staff-delete-info__email { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.5); margin: 0; }
.staff-delete-check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  cursor: pointer;
}

.staff-dialog__footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; }

/* ===== Bulk bar transition ===== */
.staff-bulk-enter-active, .staff-bulk-leave-active { transition: all 0.25s ease; }
.staff-bulk-enter-from, .staff-bulk-leave-to { opacity: 0; transform: translateY(-8px); }

/* ===== Responsive ===== */
@media (max-width: 900px) {
  .staff-kpi-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .staff-kpi-grid { grid-template-columns: 1fr; }
  .staff-form-row { grid-template-columns: 1fr; }
  .staff-toolbar__filters { width: 100%; }
  .staff-toolbar__select { flex: 1; }
  .staff-bulk-bar { flex-direction: column; align-items: stretch; }
  .staff-bulk-bar__actions { flex-wrap: wrap; }
}
</style>

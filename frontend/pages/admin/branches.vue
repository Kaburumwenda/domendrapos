<template>
  <div class="br-page">
    <!-- Header -->
    <div class="br-header">
      <div class="br-header__left">
        <h1 class="br-header__title">Branches</h1>
        <p class="br-header__sub">Manage your store locations, registers, and regional settings</p>
      </div>
      <div class="br-header__actions">
        <button class="br-btn br-btn--ghost" @click="loadBranches">
          <v-icon size="18">mdi-refresh</v-icon>
          Refresh
        </button>
        <button class="br-btn br-btn--primary" @click="openCreate">
          <v-icon size="18">mdi-plus</v-icon>
          Add Branch
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="br-kpi-grid">
      <div v-for="kpi in kpis" :key="kpi.label" class="br-kpi">
        <div class="br-kpi__icon" :class="`br-kpi__icon--${kpi.color}`">
          <v-icon size="20">{{ kpi.icon }}</v-icon>
        </div>
        <div class="br-kpi__body">
          <p class="br-kpi__label">{{ kpi.label }}</p>
          <p class="br-kpi__value">{{ kpi.value }}</p>
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="br-toolbar">
      <div class="br-toolbar__search">
        <v-icon size="18" class="br-toolbar__search-icon">mdi-magnify</v-icon>
        <input
          v-model="search"
          class="br-toolbar__search-input"
          placeholder="Search branches by name, code, city…"
        />
        <button v-if="search" class="br-toolbar__search-clear" @click="search = ''">
          <v-icon size="16">mdi-close-circle</v-icon>
        </button>
      </div>
      <div class="br-toolbar__filters">
        <select v-model="statusFilter" class="br-toolbar__select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select v-model="hqFilter" class="br-toolbar__select">
          <option value="">All Types</option>
          <option value="hq">Headquarters</option>
          <option value="store">Stores</option>
        </select>
      </div>
    </div>

    <!-- Card Grid -->
    <div v-if="loading" class="br-card-grid">
      <div v-for="i in 6" :key="'sk-' + i" class="br-card br-card--skeleton">
        <div class="br-skeleton" style="width: 48px; height: 48px; border-radius: 14px;" />
        <div class="br-skeleton" style="width: 60%; height: 20px; margin-top: 16px;" />
        <div class="br-skeleton" style="width: 40%; height: 14px; margin-top: 8px;" />
        <div class="br-skeleton" style="width: 80%; height: 14px; margin-top: 20px;" />
        <div class="br-skeleton" style="width: 70%; height: 14px; margin-top: 6px;" />
        <div class="br-skeleton" style="width: 100%; height: 36px; margin-top: 20px; border-radius: 10px;" />
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!filteredBranches.length" class="br-empty">
      <v-icon size="48" class="br-empty__icon">mdi-store-off-outline</v-icon>
      <p class="br-empty__title">No branches found</p>
      <p class="br-empty__sub">Try adjusting your search or create a new branch</p>
    </div>

    <!-- Cards -->
    <div v-else class="br-card-grid">
      <div
        v-for="branch in filteredBranches"
        :key="branch.id"
        class="br-card"
        :class="{ 'br-card--inactive': !branch.is_active }"
      >
        <!-- Card header -->
        <div class="br-card__top">
          <div class="br-card__icon" :class="branch.is_headquarters ? 'br-card__icon--hq' : 'br-card__icon--store'">
            <v-icon size="24">{{ branch.is_headquarters ? 'mdi-domain' : 'mdi-store-outline' }}</v-icon>
          </div>
          <div class="br-card__head-info">
            <div class="br-card__name-row">
              <h3 class="br-card__name">{{ branch.name }}</h3>
              <span v-if="branch.is_headquarters" class="br-hq-badge">HQ</span>
            </div>
            <p class="br-card__code">{{ branch.code }}</p>
          </div>
          <div class="br-card__menu">
            <button class="br-icon-btn" title="Edit" @click="openEdit(branch)">
              <v-icon size="16">mdi-pencil-outline</v-icon>
            </button>
            <button
              class="br-icon-btn"
              :class="branch.is_active ? 'br-icon-btn--danger' : 'br-icon-btn--success'"
              :title="branch.is_active ? 'Deactivate' : 'Activate'"
              :disabled="branch.is_headquarters"
              @click="toggleStatus(branch)"
            >
              <v-icon size="16">{{ branch.is_active ? 'mdi-power-off' : 'mdi-power' }}</v-icon>
            </button>
          </div>
        </div>

        <!-- Status row -->
        <div class="br-card__status">
          <span class="br-status" :class="branch.is_active ? 'br-status--active' : 'br-status--inactive'">
            <span class="br-status__dot" />
            {{ branch.is_active ? 'Active' : 'Inactive' }}
          </span>
          <span class="br-card__tax">
            Tax: <strong>{{ Number(branch.tax_rate) }}%</strong>
          </span>
        </div>

        <!-- Info rows -->
        <div class="br-card__info">
          <div class="br-info-row">
            <v-icon size="15" class="br-info-row__icon">mdi-map-marker-outline</v-icon>
            <span class="br-info-row__text">
              {{ [branch.city, branch.country].filter(Boolean).join(', ') || 'No address set' }}
            </span>
          </div>
          <div class="br-info-row">
            <v-icon size="15" class="br-info-row__icon">mdi-phone-outline</v-icon>
            <span v-if="branch.phone" class="br-info-row__text">{{ branch.phone }}</span>
            <span v-else class="br-info-row__text br-info-row__text--mute">No phone</span>
          </div>
          <div class="br-info-row">
            <v-icon size="15" class="br-info-row__icon">mdi-email-outline</v-icon>
            <span v-if="branch.email" class="br-info-row__text br-info-row__text--truncate">{{ branch.email }}</span>
            <span v-else class="br-info-row__text br-info-row__text--mute">No email</span>
          </div>
          <div class="br-info-row">
            <v-icon size="15" class="br-info-row__icon">mdi-cash-multiple</v-icon>
            <span class="br-info-row__text">{{ branch.currency_code }} · {{ branch.timezone }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="br-card__footer">
          <div class="br-card__stat">
            <v-icon size="14">mdi-cash-register</v-icon>
            <span>{{ branch.register_count || 0 }} registers</span>
          </div>
          <button class="br-btn br-btn--ghost br-btn--sm" @click="openEdit(branch)">
            <v-icon size="14">mdi-pencil</v-icon>
            Edit
          </button>
        </div>
      </div>
    </div>

    <!-- Create / Edit Dialog -->
    <v-dialog v-model="dialog" max-width="640" persistent scroll-strategy="block">
      <v-card rounded="xl" class="br-dialog">
        <div class="br-dialog__header">
          <div class="br-dialog__header-icon" :class="editing ? 'br-dialog__header-icon--edit' : 'br-dialog__header-icon--primary'">
            <v-icon size="22">{{ editing ? 'mdi-pencil' : 'mdi-store-plus-outline' }}</v-icon>
          </div>
          <div class="flex-1">
            <h3 class="br-dialog__title">{{ editing ? 'Edit Branch' : 'Add New Branch' }}</h3>
            <p class="br-dialog__sub">{{ editing ? 'Update branch details and settings' : 'Create a new store location' }}</p>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="closeDialog" />
        </div>
        <v-divider />
        <div class="br-dialog__body">
          <div class="br-form-row">
            <div class="br-field">
              <label class="br-field__label">Branch Name</label>
              <input v-model="form.name" class="br-field__input" placeholder="Downtown Store" />
            </div>
            <div class="br-field">
              <label class="br-field__label">Code</label>
              <input v-model="form.code" class="br-field__input" placeholder="DTN" :disabled="editing" />
            </div>
          </div>
          <div class="br-form-row">
            <div class="br-field">
              <label class="br-field__label">City</label>
              <input v-model="form.city" class="br-field__input" placeholder="Nairobi" />
            </div>
            <div class="br-field">
              <label class="br-field__label">Country</label>
              <input v-model="form.country" class="br-field__input" placeholder="Kenya" />
            </div>
          </div>
          <div class="br-form-row">
            <div class="br-field">
              <label class="br-field__label">Phone</label>
              <input v-model="form.phone" class="br-field__input" placeholder="+254700000000" />
            </div>
            <div class="br-field">
              <label class="br-field__label">Email</label>
              <input v-model="form.email" class="br-field__input" type="email" placeholder="store@domendra.com" />
            </div>
          </div>
          <div class="br-form-row br-form-row--3">
            <div class="br-field">
              <label class="br-field__label">Currency</label>
              <select v-model="form.currency_code" class="br-field__input">
                <option v-for="c in currencyOptions" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div class="br-field">
              <label class="br-field__label">Tax Rate (%)</label>
              <input v-model="form.tax_rate" class="br-field__input" type="number" step="0.01" placeholder="16.00" />
            </div>
            <div class="br-field">
              <label class="br-field__label">Registers</label>
              <input v-model="form.register_count" class="br-field__input" type="number" placeholder="1" />
            </div>
          </div>
          <div class="br-form-row">
            <div class="br-field">
              <label class="br-field__label">Timezone</label>
              <input v-model="form.timezone" class="br-field__input" placeholder="Africa/Nairobi" />
            </div>
            <div class="br-field">
              <label class="br-field__label">Address</label>
              <input v-model="form.address_line1" class="br-field__input" placeholder="123 Main Street" />
            </div>
          </div>
          <p v-if="formError" class="br-form-error">{{ formError }}</p>
        </div>
        <v-divider />
        <div class="br-dialog__footer">
          <button class="br-btn br-btn--ghost" @click="closeDialog">Cancel</button>
          <button class="br-btn br-btn--primary" :disabled="saving" @click="saveBranch">
            <v-progress-circular v-if="saving" indeterminate size="16" width="2" color="white" class="mr-2" />
            {{ editing ? 'Save Changes' : 'Create Branch' }}
          </button>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const toast = useToast()

interface Branch {
  id: number
  name: string
  code: string
  is_headquarters: boolean
  is_active: boolean
  address_line1: string
  address_line2: string
  city: string
  state_province: string
  postal_code: string
  country: string
  phone: string
  email: string
  currency_code: string
  timezone: string
  tax_rate: string | number
  register_count: number
  created_at: string
  updated_at: string
}

const branches = ref<Branch[]>([])
const loading = ref(true)
const saving = ref(false)
const search = ref('')
const statusFilter = ref('')
const hqFilter = ref('')

const dialog = ref(false)
const editing = ref(false)
const formError = ref('')
const form = reactive({
  id: null as number | null,
  name: '',
  code: '',
  city: '',
  country: 'Kenya',
  phone: '',
  email: '',
  currency_code: 'USD',
  timezone: 'UTC',
  tax_rate: '0',
  register_count: 1,
  address_line1: '',
  is_active: true,
})

const currencyOptions = ['USD', 'EUR', 'GBP', 'INR', 'NGN', 'CAD', 'AUD', 'KES']

const filteredBranches = computed(() => {
  let list = branches.value
  if (statusFilter.value === 'active') list = list.filter(b => b.is_active)
  if (statusFilter.value === 'inactive') list = list.filter(b => !b.is_active)
  if (hqFilter.value === 'hq') list = list.filter(b => b.is_headquarters)
  if (hqFilter.value === 'store') list = list.filter(b => !b.is_headquarters)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q) ||
      b.city?.toLowerCase().includes(q)
    )
  }
  return list
})

const kpis = computed(() => [
  { label: 'Total Branches', value: branches.value.length, icon: 'mdi-store', color: 'blue' },
  { label: 'Active', value: branches.value.filter(b => b.is_active).length, icon: 'mdi-store-check', color: 'green' },
  { label: 'Headquarters', value: branches.value.filter(b => b.is_headquarters).length, icon: 'mdi-domain', color: 'purple' },
  { label: 'Total Registers', value: branches.value.reduce((s, b) => s + (b.register_count || 0), 0), icon: 'mdi-cash-register', color: 'orange' },
])

async function loadBranches() {
  loading.value = true
  try {
    const data = await useApi()('/branches/')
    branches.value = data.results || data
  } catch {
    toast.error('Failed to load branches')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = false
  formError.value = ''
  Object.assign(form, {
    id: null, name: '', code: '', city: '', country: 'Kenya',
    phone: '', email: '', currency_code: 'USD', timezone: 'UTC',
    tax_rate: '0', register_count: 1, address_line1: '', is_active: true,
  })
  dialog.value = true
}

function openEdit(b: Branch) {
  editing.value = true
  formError.value = ''
  Object.assign(form, {
    id: b.id,
    name: b.name,
    code: b.code,
    city: b.city || '',
    country: b.country || '',
    phone: b.phone || '',
    email: b.email || '',
    currency_code: b.currency_code || 'USD',
    timezone: b.timezone || 'UTC',
    tax_rate: String(b.tax_rate || '0'),
    register_count: b.register_count || 1,
    address_line1: b.address_line1 || '',
    is_active: b.is_active,
  })
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
  formError.value = ''
}

function validate(): boolean {
  if (!form.name.trim()) { formError.value = 'Branch name is required'; return false }
  if (!form.code.trim()) { formError.value = 'Branch code is required'; return false }
  formError.value = ''
  return true
}

async function saveBranch() {
  if (!validate()) return
  saving.value = true
  try {
    const payload: Record<string, any> = {
      name: form.name,
      code: form.code,
      city: form.city,
      country: form.country,
      phone: form.phone,
      email: form.email,
      currency_code: form.currency_code,
      timezone: form.timezone,
      tax_rate: form.tax_rate,
      register_count: Number(form.register_count) || 1,
      address_line1: form.address_line1,
      is_active: form.is_active,
    }
    if (editing.value && form.id) {
      const updated = await useApi()(`/branches/${form.id}/`, { method: 'PATCH', body: payload })
      const idx = branches.value.findIndex(b => b.id === form.id)
      if (idx >= 0) branches.value[idx] = { ...branches.value[idx], ...updated }
      toast.success('Branch updated')
    } else {
      const created = await useApi()('/branches/', { method: 'POST', body: payload })
      branches.value.push(created)
      toast.success('Branch created')
    }
    dialog.value = false
  } catch (e: any) {
    formError.value = e?.data?.code?.[0] || e?.data?.name?.[0] || e?.data?.detail || 'Failed to save branch'
  } finally {
    saving.value = false
  }
}

async function toggleStatus(b: Branch) {
  try {
    const updated = await useApi()(`/branches/${b.id}/`, { method: 'PATCH', body: { is_active: !b.is_active } })
    b.is_active = !b.is_active
    toast.success(`Branch ${b.is_active ? 'activated' : 'deactivated'}`)
  } catch {
    toast.error('Failed to toggle branch status')
  }
}

onMounted(loadBranches)
</script>

<style scoped>
.br-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 4px 0;
}

/* ===== Header ===== */
.br-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.br-header__title {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: rgba(var(--v-theme-on-surface), 0.9);
  margin: 0;
}
.br-header__sub {
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  margin: 2px 0 0;
}
.br-header__actions { display: flex; gap: 10px; }

/* ===== Buttons ===== */
.br-btn {
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
.br-btn--sm { padding: 6px 12px; font-size: 0.75rem; }
.br-btn--primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}
.br-btn--primary:hover {
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}
.br-btn--ghost {
  background: rgba(var(--v-theme-on-surface), 0.05);
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.br-btn--ghost:hover { background: rgba(var(--v-theme-on-surface), 0.08); }

/* ===== KPI Grid ===== */
.br-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.br-kpi {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.br-kpi__icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.br-kpi__icon--blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.br-kpi__icon--green { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
.br-kpi__icon--purple { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
.br-kpi__icon--orange { background: rgba(249, 115, 22, 0.1); color: #f97316; }
.br-kpi__body { display: flex; flex-direction: column; min-width: 0; }
.br-kpi__label {
  font-size: 0.6875rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: rgba(var(--v-theme-on-surface), 0.45);
  margin: 0;
}
.br-kpi__value {
  font-size: 1.5rem; font-weight: 800;
  letter-spacing: -0.02em;
  color: rgba(var(--v-theme-on-surface), 0.9);
  margin: 0; line-height: 1.2;
}

/* ===== Toolbar ===== */
.br-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap;
}
.br-toolbar__search {
  position: relative;
  display: flex; align-items: center;
  flex: 1; min-width: 220px; max-width: 360px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 10px;
  padding: 0 12px;
  transition: border-color 0.2s;
}
.br-toolbar__search:focus-within { border-color: #3b82f6; }
.br-toolbar__search-icon { color: rgba(var(--v-theme-on-surface), 0.35); flex-shrink: 0; }
.br-toolbar__search-input {
  flex: 1; border: none; outline: none; background: transparent;
  padding: 10px 8px; font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.85);
  font-family: inherit;
}
.br-toolbar__search-input::placeholder { color: rgba(var(--v-theme-on-surface), 0.35); }
.br-toolbar__search-clear {
  border: none; background: none; cursor: pointer;
  color: rgba(var(--v-theme-on-surface), 0.35); display: flex; padding: 2px;
}
.br-toolbar__filters { display: flex; gap: 8px; flex-wrap: wrap; }
.br-toolbar__select {
  padding: 9px 12px; border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  background: rgb(var(--v-theme-surface));
  font-size: 0.8125rem; font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.8);
  cursor: pointer; outline: none; font-family: inherit;
  transition: border-color 0.2s;
}
.br-toolbar__select:focus { border-color: #3b82f6; }

/* ===== Card Grid ===== */
.br-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

/* ===== Card ===== */
.br-card {
  display: flex; flex-direction: column;
  padding: 20px;
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.25s, transform 0.25s;
}
.br-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}
.br-card--inactive { opacity: 0.65; }
.br-card--skeleton {
  min-height: 280px;
  gap: 0;
}

.br-card__top {
  display: flex; align-items: flex-start; gap: 14px;
  margin-bottom: 14px;
}
.br-card__icon {
  width: 48px; height: 48px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0;
}
.br-card__icon--hq {
  background: linear-gradient(135deg, #a855f7, #7c3aed);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
}
.br-card__icon--store {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
.br-card__head-info { flex: 1; min-width: 0; }
.br-card__name-row { display: flex; align-items: center; gap: 8px; }
.br-card__name {
  font-size: 1rem; font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.9);
  margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.br-hq-badge {
  font-size: 0.5625rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
  padding: 2px 7px; border-radius: 5px;
  background: rgba(168, 85, 247, 0.12); color: #a855f7;
  flex-shrink: 0;
}
.br-card__code {
  font-size: 0.6875rem; font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.4);
  text-transform: uppercase; letter-spacing: 0.08em;
  margin: 2px 0 0;
}
.br-card__menu { display: flex; gap: 6px; flex-shrink: 0; }

.br-card__status {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  margin-bottom: 14px;
}
.br-card__tax {
  font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.5);
}
.br-card__tax strong { color: rgba(var(--v-theme-on-surface), 0.8); }

/* ===== Status ===== */
.br-status {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 0.75rem; font-weight: 600;
}
.br-status__dot { width: 8px; height: 8px; border-radius: 50%; }
.br-status--active { color: #22c55e; }
.br-status--active .br-status__dot { background: #22c55e; box-shadow: 0 0 6px rgba(34, 197, 94, 0.4); }
.br-status--inactive { color: #ef4444; }
.br-status--inactive .br-status__dot { background: #ef4444; }

/* ===== Info ===== */
.br-card__info {
  display: flex; flex-direction: column; gap: 8px;
  flex: 1;
}
.br-info-row { display: flex; align-items: center; gap: 10px; }
.br-info-row__icon { color: rgba(var(--v-theme-on-surface), 0.3); flex-shrink: 0; }
.br-info-row__text {
  font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.6);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.br-info-row__text--mute { color: rgba(var(--v-theme-on-surface), 0.25); }
.br-info-row__text--truncate { overflow: hidden; text-overflow: ellipsis; }

/* ===== Footer ===== */
.br-card__footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 14px;
  margin-top: 14px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.br-card__stat {
  display: flex; align-items: center; gap: 5px;
  font-size: 0.6875rem; font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.4);
}

/* ===== Icon Button ===== */
.br-icon-btn {
  width: 30px; height: 30px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: rgba(var(--v-theme-on-surface), 0.5);
  transition: all 0.2s;
}
.br-icon-btn:hover {
  background: rgba(var(--v-theme-on-surface), 0.05);
  color: rgba(var(--v-theme-on-surface), 0.8);
}
.br-icon-btn--danger:hover { color: #ef4444; border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.05); }
.br-icon-btn--success:hover { color: #22c55e; border-color: rgba(34, 197, 94, 0.3); background: rgba(34, 197, 94, 0.05); }
.br-icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* ===== Skeleton ===== */
.br-skeleton {
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(var(--v-theme-on-surface), 0.04) 0%, rgba(var(--v-theme-on-surface), 0.08) 50%, rgba(var(--v-theme-on-surface), 0.04) 100%);
  background-size: 200% 100%;
  animation: brShimmer 1.5s infinite;
}
@keyframes brShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ===== Empty ===== */
.br-empty {
  text-align: center;
  padding: 60px 20px;
}
.br-empty__icon { color: rgba(var(--v-theme-on-surface), 0.15); margin-bottom: 12px; }
.br-empty__title {
  font-size: 0.9375rem; font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0 0 4px;
}
.br-empty__sub {
  font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.35);
  margin: 0;
}

/* ===== Dialog ===== */
.br-dialog { overflow: hidden; }
.br-dialog__header {
  display: flex; align-items: center; gap: 14px;
  padding: 20px 24px;
}
.br-dialog__header-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0;
}
.br-dialog__header-icon--primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
.br-dialog__header-icon--edit {
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}
.br-dialog__title {
  font-size: 1.125rem; font-weight: 700;
  margin: 0; letter-spacing: -0.01em;
}
.br-dialog__sub {
  font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.5);
  margin: 2px 0 0;
}
.br-dialog__body {
  padding: 20px 24px;
  display: flex; flex-direction: column; gap: 16px;
}
.br-form-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
}
.br-form-row--3 { grid-template-columns: 1fr 1fr 1fr; }
.br-field { display: flex; flex-direction: column; gap: 6px; }
.br-field__label {
  font-size: 0.6875rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: rgba(var(--v-theme-on-surface), 0.5);
}
.br-field__input {
  padding: 10px 14px; border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgba(var(--v-theme-on-surface), 0.03);
  font-size: 0.8125rem; color: rgba(var(--v-theme-on-surface), 0.85);
  outline: none; font-family: inherit;
  transition: border-color 0.2s, background 0.2s;
}
.br-field__input:focus { border-color: #3b82f6; background: rgb(var(--v-theme-surface)); }
.br-field__input:disabled { opacity: 0.5; cursor: not-allowed; }
.br-form-error { font-size: 0.75rem; color: #ef4444; margin: 0; }
.br-dialog__footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 16px 24px;
}

/* ===== Responsive ===== */
@media (max-width: 900px) {
  .br-kpi-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .br-kpi-grid { grid-template-columns: 1fr; }
  .br-form-row { grid-template-columns: 1fr; }
  .br-form-row--3 { grid-template-columns: 1fr; }
  .br-toolbar__filters { width: 100%; }
  .br-toolbar__select { flex: 1; }
}
</style>

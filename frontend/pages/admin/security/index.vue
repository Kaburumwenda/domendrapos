<template>
  <v-container fluid class="sec-page">
    <!-- ══════════ HERO HEADER (mica-style) ══════════ -->
    <div class="sec-hero">
      <div class="sec-hero__content">
        <div class="sec-hero__icon">
          <v-icon size="28">mdi-shield-key</v-icon>
        </div>
        <div class="sec-hero__text">
          <h1 class="sec-hero__title">Security Control Center</h1>
          <p class="sec-hero__sub">
            Monitor login attempts, manage locked users, and configure django-axes security policy
          </p>
        </div>
      </div>
      <div class="sec-hero__actions">
        <v-btn
          variant="tonal"
          color="primary"
          prepend-icon="mdi-refresh"
          :loading="loading"
          rounded="lg"
          size="small"
          @click="refreshAll"
        >
          Refresh
        </v-btn>
        <v-btn
          variant="outlined"
          prepend-icon="mdi-lock-open-variant"
          rounded="lg"
          size="small"
          @click="unlockUserDialog = true"
        >
          Unlock by User/IP
        </v-btn>
      </div>
    </div>

    <!-- ══════════ KPI CARDS (Win11 acrylic) ══════════ -->
    <v-row class="mb-1">
      <v-col v-for="kpi in kpis" :key="kpi.label" cols="12" sm="6" lg="3">
        <v-card
          rounded="xl"
          class="sec-kpi"
          :class="`sec-kpi--${kpi.color}`"
          flat
          border
        >
          <div class="sec-kpi__top">
            <div class="sec-kpi__icon">
              <v-icon size="20">{{ kpi.icon }}</v-icon>
            </div>
            <div class="sec-kpi__badge" :class="`sec-kpi__badge--${kpi.color}`">
              {{ kpi.value }}
            </div>
          </div>
          <p class="sec-kpi__label">{{ kpi.label }}</p>
          <p class="sec-kpi__sub">{{ kpi.sub }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- ══════════ NAVIGATION (Win11 segmented) ══════════ -->
    <div class="sec-nav mb-4">
      <div
        v-for="tab in tabs"
        :key="tab.value"
        class="sec-nav__item"
        :class="{ 'sec-nav__item--active': activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        <v-icon size="18" class="sec-nav__icon">{{ tab.icon }}</v-icon>
        <span class="sec-nav__label">{{ tab.label }}</span>
        <span v-if="tab.count !== undefined" class="sec-nav__badge">
          {{ tab.count }}
        </span>
      </div>
    </div>

    <!-- ══════════ CONTENT WINDOWS ══════════ -->
    <v-fade-transition mode="out-in">
      <div :key="activeTab">
        <!-- ─── LOCKED USERS ─── -->
        <template v-if="activeTab === 'locked'">
          <div v-if="locked.length > 0" class="d-flex ga-2 mb-4 flex-wrap">
            <v-btn
              variant="flat"
              color="error"
              prepend-icon="mdi-lock-open-variant"
              rounded="lg"
              size="small"
              @click="confirmResetAll"
            >
              Unlock All ({{ locked.length }})
            </v-btn>
          </div>

          <v-card v-if="loading" flat class="sec-skeleton">
            <v-progress-circular indeterminate color="primary" size="40" width="3" />
          </v-card>

          <div v-else-if="locked.length === 0" class="sec-empty">
            <div class="sec-empty__icon sec-empty__icon--success">
              <v-icon size="32">mdi-shield-check</v-icon>
            </div>
            <p class="sec-empty__title">No Locked Users</p>
            <p class="sec-empty__sub">
              All clear — no IP addresses or usernames are currently locked out.
            </p>
          </div>

          <v-card v-else flat border rounded="xl" class="sec-table-card">
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th class="text-left font-weight-bold">Username / Email</th>
                  <th class="text-left font-weight-bold">IP Address</th>
                  <th class="text-center font-weight-bold">Failed Attempts</th>
                  <th class="text-left font-weight-bold">Attempt Time</th>
                  <th class="text-left font-weight-bold">Path</th>
                  <th class="text-right font-weight-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in locked" :key="item.id" class="sec-row sec-row--error">
                  <td>
                    <div class="d-flex align-center ga-3">
                      <v-avatar size="36" rounded="lg" color="error" variant="tonal">
                        <v-icon size="18" color="error">mdi-lock</v-icon>
                      </v-avatar>
                      <span class="text-body-1 font-weight-medium">{{ item.username }}</span>
                    </div>
                  </td>
                  <td class="text-body-2">{{ item.ip_address }}</td>
                  <td class="text-center">
                    <v-chip size="small" color="error" variant="tonal" label>
                      {{ item.failures_since_start }}x
                    </v-chip>
                  </td>
                  <td class="text-body-2 text-medium-emphasis">{{ formatDateTime(item.attempt_time) }}</td>
                  <td class="text-caption text-medium-emphasis">{{ item.path_info }}</td>
                  <td class="text-right">
                    <v-btn
                      size="small"
                      variant="tonal"
                      color="success"
                      prepend-icon="mdi-lock-open-variant"
                      rounded="lg"
                      @click="unlockEntry(item.id)"
                    >
                      Unlock
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </template>

        <!-- ─── ALL ATTEMPTS ─── -->
        <template v-if="activeTab === 'attempts'">
          <div class="d-flex ga-3 mb-4 flex-wrap align-center">
            <v-text-field
              v-model="attemptsSearch"
              prepend-inner-icon="mdi-magnify"
              placeholder="Search by username or IP..."
              density="compact"
              variant="outlined"
              hide-details
              rounded="lg"
              style="max-width: 320px;"
              clearable
            />
            <v-btn
              v-if="overview.total_attempts > 0"
              variant="outlined"
              color="error"
              size="small"
              prepend-icon="mdi-delete-sweep"
              rounded="lg"
              @click="confirmResetAll"
            >
              Clear All Attempts
            </v-btn>
          </div>

          <v-card v-if="loadingAttempts" flat class="sec-skeleton">
            <v-progress-circular indeterminate color="primary" size="40" width="3" />
          </v-card>

          <v-card v-else-if="filteredAttempts.length > 0" flat border rounded="xl" class="sec-table-card">
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th class="text-left font-weight-bold">Username</th>
                  <th class="text-left font-weight-bold">IP Address</th>
                  <th class="text-center font-weight-bold">Failures</th>
                  <th class="text-center font-weight-bold">Status</th>
                  <th class="text-left font-weight-bold">Attempt Time</th>
                  <th class="text-right font-weight-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in filteredAttempts"
                  :key="item.id"
                  class="sec-row"
                  :class="{ 'sec-row--error': item.locked }"
                >
                  <td class="text-body-1 font-weight-medium">{{ item.username }}</td>
                  <td class="text-body-2">{{ item.ip_address }}</td>
                  <td class="text-center">
                    <v-chip
                      size="small"
                      :color="item.failures_since_start >= 5 ? 'error' : 'warning'"
                      variant="tonal"
                      label
                    >
                      {{ item.failures_since_start }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <v-chip
                      size="x-small"
                      :color="item.locked ? 'error' : 'default'"
                      :variant="item.locked ? 'tonal' : 'text'"
                      label
                    >
                      <v-icon size="12" class="mr-1">
                        {{ item.locked ? 'mdi-lock' : 'mdi-eye' }}
                      </v-icon>
                      {{ item.locked ? 'Locked' : 'Tracking' }}
                    </v-chip>
                  </td>
                  <td class="text-body-2 text-medium-emphasis">{{ formatDateTime(item.attempt_time) }}</td>
                  <td class="text-right">
                    <v-btn
                      v-if="item.locked"
                      size="small"
                      variant="tonal"
                      color="success"
                      prepend-icon="mdi-lock-open-variant"
                      rounded="lg"
                      @click="unlockEntry(item.id)"
                    >
                      Unlock
                    </v-btn>
                    <span v-else class="text-caption text-disabled">—</span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>

          <div v-else class="sec-empty">
            <div class="sec-empty__icon sec-empty__icon--neutral">
              <v-icon size="32">mdi-login-variant</v-icon>
            </div>
            <p class="sec-empty__title">No Access Attempts</p>
            <p class="sec-empty__sub">No login attempts have been recorded yet.</p>
          </div>
        </template>

        <!-- ─── FAILURE LOGS ─── -->
        <template v-if="activeTab === 'logs'">
          <v-card v-if="loadingLogs" flat class="sec-skeleton">
            <v-progress-circular indeterminate color="primary" size="40" width="3" />
          </v-card>

          <v-card v-else-if="failureLogs.length > 0" flat border rounded="xl" class="sec-table-card">
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th class="text-left font-weight-bold">Username</th>
                  <th class="text-left font-weight-bold">IP Address</th>
                  <th class="text-center font-weight-bold">Locked Out</th>
                  <th class="text-left font-weight-bold">Attempt Time</th>
                  <th class="text-left font-weight-bold">Path</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in failureLogs" :key="log.id" class="sec-row">
                  <td class="text-body-1 font-weight-medium">{{ log.username }}</td>
                  <td class="text-body-2">{{ log.ip_address }}</td>
                  <td class="text-center">
                    <v-icon :color="log.locked_out ? 'error' : 'grey'" size="20">
                      {{ log.locked_out ? 'mdi-lock' : 'mdi-lock-open' }}
                    </v-icon>
                  </td>
                  <td class="text-body-2 text-medium-emphasis">{{ formatDateTime(log.attempt_time) }}</td>
                  <td class="text-caption text-medium-emphasis">{{ log.path_info }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>

          <div v-else class="sec-empty">
            <div class="sec-empty__icon sec-empty__icon--neutral">
              <v-icon size="32">mdi-alert-circle-outline</v-icon>
            </div>
            <p class="sec-empty__title">No Failure Logs</p>
            <p class="sec-empty__sub">No login failure logs have been recorded.</p>
          </div>
        </template>

        <!-- ─── ACTIVE SESSIONS ─── -->
        <template v-if="activeTab === 'sessions'">
          <v-card v-if="loadingSessions" flat class="sec-skeleton">
            <v-progress-circular indeterminate color="primary" size="40" width="3" />
          </v-card>

          <v-card v-else-if="sessions.length > 0" flat border rounded="xl" class="sec-table-card">
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th class="text-left font-weight-bold">User</th>
                  <th class="text-left font-weight-bold">Email</th>
                  <th class="text-left font-weight-bold">Role</th>
                  <th class="text-left font-weight-bold">Branch</th>
                  <th class="text-left font-weight-bold">Last Login</th>
                  <th class="text-left font-weight-bold">Session Expires</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in sessions" :key="s.session_key" class="sec-row sec-row--primary">
                  <td>
                    <div class="d-flex align-center ga-3">
                      <v-avatar size="36" rounded="lg" color="primary" variant="tonal">
                        <span class="text-body-1 font-weight-bold text-primary">
                          {{ (s.name || s.user_name || '?').charAt(0).toUpperCase() }}
                        </span>
                      </v-avatar>
                      <span class="text-body-1 font-weight-medium">{{ s.name || s.user_name }}</span>
                    </div>
                  </td>
                  <td class="text-body-2">{{ s.email || s.user_email }}</td>
                  <td>
                    <v-chip
                      size="small"
                      :color="roleColor(s.role || s.user_role)"
                      variant="tonal"
                      label
                    >
                      {{ formatRole(s.role || s.user_role) }}
                    </v-chip>
                  </td>
                  <td class="text-body-2 text-medium-emphasis">{{ s.branch || '—' }}</td>
                  <td class="text-body-2 text-medium-emphasis">{{ formatDateTime(s.last_login) }}</td>
                  <td class="text-body-2 text-medium-emphasis">{{ formatDateTime(s.session_expires) }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>

          <div v-else class="sec-empty">
            <div class="sec-empty__icon sec-empty__icon--neutral">
              <v-icon size="32">mdi-account-clock</v-icon>
            </div>
            <p class="sec-empty__title">No Active Sessions</p>
            <p class="sec-empty__sub">No users are currently logged in.</p>
          </div>
        </template>

        <!-- ─── SETTINGS ─── -->
        <template v-if="activeTab === 'settings'">
          <v-card flat border rounded="xl" max-width="640" class="sec-settings-card">
            <!-- Settings header -->
            <div class="sec-settings__header">
              <div class="sec-settings__icon">
                <v-icon size="24" color="primary">mdi-shield-lock</v-icon>
              </div>
              <div>
                <p class="text-h6 font-weight-bold mb-0">Login Security Policy</p>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  Configure brute-force login protection
                </p>
              </div>
            </div>

            <v-divider class="mb-5" />

            <v-alert type="info" variant="tonal" density="compact" rounded="lg" class="mb-5">
              <template #prepend>
                <v-icon size="18">mdi-information-outline</v-icon>
              </template>
              Changes apply immediately at runtime. They reset when the server restarts
              unless also updated in <code class="mx-1">settings.py</code>.
            </v-alert>

            <!-- Failure Limit -->
            <div class="sec-setting-row">
              <div class="sec-setting-row__icon sec-setting-row__icon--primary">
                <v-icon size="20" color="primary">mdi-counter</v-icon>
              </div>
              <div class="sec-setting-row__body">
                <p class="sec-setting-row__title">Failure Limit</p>
                <p class="sec-setting-row__desc">
                  Number of failed login attempts before a user/IP is locked out.
                </p>
              </div>
              <div class="sec-setting-row__control">
                <v-text-field
                  v-model.number="settingsForm.failure_limit"
                  type="number"
                  variant="outlined"
                  density="compact"
                  min="1"
                  max="100"
                  hide-details
                  rounded="lg"
                  style="width: 120px;"
                />
              </div>
            </div>

            <v-divider class="my-1" />

            <!-- Cool-off Time -->
            <div class="sec-setting-row">
              <div class="sec-setting-row__icon sec-setting-row__icon--info">
                <v-icon size="20" color="info">mdi-timer-outline</v-icon>
              </div>
              <div class="sec-setting-row__body">
                <p class="sec-setting-row__title">Cool-off Time (hours)</p>
                <p class="sec-setting-row__desc">
                  Hours before a locked-out user/IP is automatically unlocked.
                </p>
              </div>
              <div class="sec-setting-row__control">
                <v-text-field
                  v-model.number="settingsForm.cooloff_time_hours"
                  type="number"
                  variant="outlined"
                  density="compact"
                  min="0"
                  step="0.5"
                  hide-details
                  rounded="lg"
                  style="width: 120px;"
                />
              </div>
            </div>

            <v-divider class="my-1" />

            <!-- Reset on success -->
            <div class="sec-setting-row">
              <div class="sec-setting-row__icon sec-setting-row__icon--success">
                <v-icon size="20" color="success">mdi-refresh-circle</v-icon>
              </div>
              <div class="sec-setting-row__body">
                <p class="sec-setting-row__title">Reset on Successful Login</p>
                <p class="sec-setting-row__desc">
                  If on, a successful login resets the failure counter for that user/IP.
                </p>
              </div>
              <div class="sec-setting-row__control">
                <v-switch
                  v-model="settingsForm.reset_on_success"
                  color="primary"
                  density="compact"
                  hide-details
                  inset
                />
              </div>
            </div>

            <v-divider class="mt-3 mb-4" />

            <div class="d-flex justify-end ga-3">
              <v-btn variant="text" rounded="lg" @click="loadSettings">Reset</v-btn>
              <v-btn
                variant="flat"
                color="primary"
                prepend-icon="mdi-content-save"
                :loading="savingSettings"
                rounded="lg"
                @click="saveSettings"
              >
                Save Changes
              </v-btn>
            </div>
          </v-card>
        </template>
      </div>
    </v-fade-transition>

    <!-- ══════════ UNLOCK ALL DIALOG ══════════ -->
    <v-dialog v-model="resetAllDialog" max-width="460">
      <v-card rounded="xl" class="sec-dialog">
        <div class="sec-dialog__header">
          <div class="sec-dialog__icon sec-dialog__icon--warning">
            <v-icon size="24" color="warning">mdi-alert-circle</v-icon>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="x-small"
            class="sec-dialog__close"
            @click="resetAllDialog = false"
          />
        </div>
        <h3 class="sec-dialog__title">Unlock All?</h3>
        <p class="sec-dialog__body">
          This will delete ALL {{ overview.total_attempts }} access attempt(s) and unlock
          every locked IP/user. This action cannot be undone.
        </p>
        <div class="sec-dialog__actions">
          <v-btn variant="text" rounded="lg" @click="resetAllDialog = false">Cancel</v-btn>
          <v-btn
            color="warning"
            variant="flat"
            :loading="resetting"
            rounded="lg"
            prepend-icon="mdi-lock-open-variant"
            @click="resetAll"
          >
            Unlock All
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- ══════════ UNLOCK USER DIALOG ══════════ -->
    <v-dialog v-model="unlockUserDialog" max-width="500">
      <v-card rounded="xl" class="sec-dialog">
        <div class="sec-dialog__header">
          <div class="sec-dialog__icon sec-dialog__icon--success">
            <v-icon size="24" color="success">mdi-lock-open-variant</v-icon>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="x-small"
            class="sec-dialog__close"
            @click="unlockUserDialog = false"
          />
        </div>
        <h3 class="sec-dialog__title">Unlock User by Email/IP</h3>
        <p class="sec-dialog__body mb-4">
          Enter the username/email or IP address to unlock.
        </p>
        <v-text-field
          v-model="unlockForm.username"
          label="Username / Email"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-account"
          hide-details
          rounded="lg"
          class="mb-3"
        />
        <v-text-field
          v-model="unlockForm.ip"
          label="IP Address (optional)"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-ip"
          hide-details
          rounded="lg"
        />
        <div class="sec-dialog__actions">
          <v-btn variant="text" rounded="lg" @click="unlockUserDialog = false">Cancel</v-btn>
          <v-btn
            color="success"
            variant="flat"
            :loading="unlocking"
            rounded="lg"
            prepend-icon="mdi-lock-open-variant"
            @click="unlockUserOrIp"
          >
            Unlock
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const toast = useToast()
const route = useRoute()
const API = '/security'

const loading = ref(false)
const loadingAttempts = ref(false)
const loadingLogs = ref(false)
const loadingSessions = ref(false)
const savingSettings = ref(false)
const resetting = ref(false)
const unlocking = ref(false)

const activeTab = ref('locked')
const resetAllDialog = ref(false)
const unlockUserDialog = ref(false)
const unlockForm = reactive({ username: '', ip: '' })
const attemptsSearch = ref('')

const overview = ref({})
const locked = ref([])
const attempts = ref([])
const failureLogs = ref([])
const sessions = ref([])
const settingsForm = reactive({
  failure_limit: 5,
  cooloff_time_hours: 1,
  reset_on_success: true,
})

const tabs = computed(() => [
  {
    value: 'locked',
    label: 'Locked Users',
    icon: 'mdi-lock-alert',
    count: overview.value.locked_count ?? 0,
  },
  {
    value: 'attempts',
    label: 'All Attempts',
    icon: 'mdi-login',
    count: overview.value.total_attempts ?? 0,
  },
  {
    value: 'logs',
    label: 'Failure Logs',
    icon: 'mdi-alert-circle-outline',
    count: overview.value.total_failure_logs ?? 0,
  },
  {
    value: 'sessions',
    label: 'Active Sessions',
    icon: 'mdi-account-clock',
    count: sessions.value.length,
  },
  {
    value: 'settings',
    label: 'Settings',
    icon: 'mdi-cog-outline',
  },
])

const kpis = computed(() => [
  {
    label: 'Locked Out',
    value: overview.value.locked_count ?? 0,
    sub: 'users/IPs currently blocked',
    icon: 'mdi-lock-alert',
    color: 'error',
  },
  {
    label: 'Access Attempts',
    value: overview.value.total_attempts ?? 0,
    sub: `${overview.value.unique_ips ?? 0} unique IPs`,
    icon: 'mdi-login',
    color: 'warning',
  },
  {
    label: 'Active Sessions',
    value: overview.value.active_sessions ?? 0,
    sub: 'currently logged in',
    icon: 'mdi-account-clock',
    color: 'primary',
  },
  {
    label: 'Recent Failures (24h)',
    value: overview.value.recent_failures_24h ?? 0,
    sub: `of ${overview.value.total_failure_logs ?? 0} total failures`,
    icon: 'mdi-alert-circle-outline',
    color: 'purple',
  },
])

const filteredAttempts = computed(() => {
  if (!attemptsSearch.value) return attempts.value
  const s = attemptsSearch.value.toLowerCase()
  return attempts.value.filter(
    (a) =>
      (a.username || '').toLowerCase().includes(s) ||
      (a.ip_address || '').toLowerCase().includes(s)
  )
})

function formatDateTime(dt) {
  if (!dt) return '—'
  const d = new Date(dt)
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function roleColor(role) {
  const map = {
    super_admin: 'error',
    tenant_admin: 'primary',
    manager: 'info',
    cashier: 'success',
    accountant: 'warning',
  }
  return map[role] || 'default'
}

function formatRole(role) {
  if (!role) return '—'
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

async function loadOverview() {
  try {
    const data = await useApi()(`${API}/overview/`)
    overview.value = data
    if (data.settings) {
      settingsForm.failure_limit = data.settings.failure_limit
      settingsForm.cooloff_time_hours = data.settings.cooloff_time_hours
      settingsForm.reset_on_success = data.settings.reset_on_success
    }
  } catch {
    toast.error('Failed to load security overview')
  }
}

async function loadLocked() {
  loading.value = true
  try {
    const data = await useApi()(`${API}/locked/`)
    locked.value = Array.isArray(data) ? data : []
  } catch {
    toast.error('Failed to load locked users')
  } finally {
    loading.value = false
  }
}

async function loadAttempts() {
  loadingAttempts.value = true
  try {
    const data = await useApi()(`${API}/attempts/`)
    attempts.value = data.results || []
  } catch {
    toast.error('Failed to load access attempts')
  } finally {
    loadingAttempts.value = false
  }
}

async function loadFailureLogs() {
  loadingLogs.value = true
  try {
    const data = await useApi()(`${API}/failure_logs/`)
    failureLogs.value = data.results || []
  } catch {
    toast.error('Failed to load failure logs')
  } finally {
    loadingLogs.value = false
  }
}

async function loadSessions() {
  loadingSessions.value = true
  try {
    const data = await useApi()(`${API}/logged_users/`)
    sessions.value = Array.isArray(data) ? data : []
  } catch {
    toast.error('Failed to load active sessions')
  } finally {
    loadingSessions.value = false
  }
}

async function loadSettings() {
  try {
    const data = await useApi()(`${API}/config/`)
    settingsForm.failure_limit = data.failure_limit
    settingsForm.cooloff_time_hours = data.cooloff_time_hours
    settingsForm.reset_on_success = data.reset_on_success
  } catch {
    toast.error('Failed to load settings')
  }
}

async function unlockEntry(id) {
  try {
    await useApi()(`${API}/${id}/unlock/`, { method: 'POST' })
    toast.success('User unlocked successfully')
    await loadOverview()
    await loadLocked()
    if (attempts.value.length > 0) loadAttempts()
  } catch {
    toast.error('Failed to unlock user')
  }
}

async function unlockUserOrIp() {
  if (unlockForm.username) {
    try {
      unlocking.value = true
      const res = await useApi()(`${API}/unlock_user/`, {
        method: 'POST',
        body: { username: unlockForm.username },
      })
      toast.success(res.detail || 'User unlocked')
      unlockUserDialog.value = false
      unlockForm.username = ''
      unlockForm.ip = ''
      await loadOverview()
      await loadLocked()
    } catch {
      toast.error('Failed to unlock user')
    } finally {
      unlocking.value = false
    }
    return
  }
  if (unlockForm.ip) {
    try {
      unlocking.value = true
      const res = await useApi()(`${API}/unlock_ip/`, {
        method: 'POST',
        body: { ip_address: unlockForm.ip },
      })
      toast.success(res.detail || 'IP unlocked')
      unlockUserDialog.value = false
      unlockForm.username = ''
      unlockForm.ip = ''
      await loadOverview()
      await loadLocked()
    } catch {
      toast.error('Failed to unlock IP')
    } finally {
      unlocking.value = false
    }
  }
}

function confirmResetAll() {
  resetAllDialog.value = true
}

async function resetAll() {
  try {
    resetting.value = true
    const res = await useApi()(`${API}/reset_all/`, { method: 'POST' })
    toast.success(res.detail || 'All locks reset')
    resetAllDialog.value = false
    await loadOverview()
    await loadLocked()
    if (activeTab.value === 'attempts') loadAttempts()
  } catch {
    toast.error('Failed to reset all locks')
  } finally {
    resetting.value = false
  }
}

async function saveSettings() {
  savingSettings.value = true
  try {
    const res = await useApi()(`${API}/update-config/`, {
      method: 'PATCH',
      body: {
        failure_limit: settingsForm.failure_limit,
        cooloff_time_hours: settingsForm.cooloff_time_hours,
        reset_on_success: settingsForm.reset_on_success,
      },
    })
    toast.success('Security settings updated')
    await loadOverview()
  } catch {
    toast.error('Failed to update settings')
  } finally {
    savingSettings.value = false
  }
}

async function refreshAll() {
  await Promise.all([loadOverview(), loadLocked(), loadAttempts(), loadFailureLogs(), loadSessions(), loadSettings()])
}

onMounted(() => {
  refreshAll()
})
</script>

<style scoped>
/* ═══════════════════════════════════════════════════
   Windows 11 Fluent Design — Security Control Center
   ═══════════════════════════════════════════════════ */

.sec-page {
  padding: 8px 4px 32px;
  max-width: 1400px;
  margin: 0 auto;
}

/* ─── HERO HEADER (mica-style) ─── */
.sec-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 28px;
  border-radius: 16px;
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.06) 0%,
    rgb(var(--v-theme-surface)) 50%
  );
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.sec-hero__content {
  display: flex;
  align-items: center;
  gap: 16px;
}
.sec-hero__icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.15);
}
.sec-hero__title {
  font-size: 1.625rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
  line-height: 1.3;
}
.sec-hero__sub {
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
  margin: 4px 0 0;
}
.sec-hero__actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

/* ─── KPI CARDS ─── */
.sec-kpi {
  padding: 18px 20px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: default;
}
.sec-kpi:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}
.sec-kpi__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.sec-kpi__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sec-kpi--error .sec-kpi__icon { background: rgba(244, 67, 54, 0.10); color: rgb(211, 47, 47); }
.sec-kpi--warning .sec-kpi__icon { background: rgba(255, 152, 0, 0.10); color: rgb(230, 81, 0); }
.sec-kpi--primary .sec-kpi__icon { background: rgba(var(--v-theme-primary), 0.10); color: rgb(var(--v-theme-primary)); }
.sec-kpi--purple .sec-kpi__icon { background: rgba(156, 39, 176, 0.10); color: rgb(123, 31, 162); }
.sec-kpi__badge {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
}
.sec-kpi__badge--error { color: rgb(211, 47, 47); }
.sec-kpi__badge--warning { color: rgb(230, 81, 0); }
.sec-kpi__badge--primary { color: rgb(var(--v-theme-primary)); }
.sec-kpi__badge--purple { color: rgb(123, 31, 162); }
.sec-kpi__label {
  font-size: 0.75rem;
  font-weight: 600;
  margin: 0 0 2px;
  color: rgba(var(--v-theme-on-surface), 0.85);
}
.sec-kpi__sub {
  font-size: 0.6875rem;
  color: rgba(var(--v-theme-on-surface), 0.45);
  margin: 0;
}

/* ─── SEGMENTED NAVIGATION ─── */
.sec-nav {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 12px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  overflow-x: auto;
}
.sec-nav__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.6);
  transition: all 0.15s ease;
  white-space: nowrap;
  user-select: none;
  flex: 1;
  justify-content: center;
  min-width: fit-content;
}
.sec-nav__item:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
  color: rgba(var(--v-theme-on-surface), 0.85);
}
.sec-nav__item--active {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-primary));
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
}
.sec-nav__icon {
  flex-shrink: 0;
}
.sec-nav__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 0.6875rem;
  font-weight: 700;
  background: rgba(var(--v-theme-on-surface), 0.10);
  color: rgba(var(--v-theme-on-surface), 0.65);
}
.sec-nav__item--active .sec-nav__badge {
  background: rgba(var(--v-theme-primary), 0.15);
  color: rgb(var(--v-theme-primary));
}

/* ─── TABLE CARD ─── */
.sec-table-card {
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
}
.sec-row {
  transition: background 0.15s ease;
}
.sec-row:hover {
  background: rgba(var(--v-theme-on-surface), 0.03);
}
.sec-row--error:hover {
  background: rgba(244, 67, 54, 0.04);
}
.sec-row--primary:hover {
  background: rgba(var(--v-theme-primary), 0.04);
}

/* ─── EMPTY STATE ─── */
.sec-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 64px 24px;
}
.sec-empty__icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
.sec-empty__icon--success {
  background: rgba(76, 175, 80, 0.10);
  color: rgb(46, 125, 50);
}
.sec-empty__icon--neutral {
  background: rgba(var(--v-theme-on-surface), 0.06);
  color: rgba(var(--v-theme-on-surface), 0.4);
}
.sec-empty__title {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 6px;
}
.sec-empty__sub {
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  margin: 0;
  max-width: 360px;
}

/* ─── SKELETON LOADING ─── */
.sec-skeleton {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  border-radius: 16px;
  background: rgba(var(--v-theme-on-surface), 0.02);
}

/* ─── SETTINGS CARD ─── */
.sec-settings-card {
  padding: 24px 28px;
}
.sec-settings__header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 6px;
}
.sec-settings__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-primary), 0.10);
  flex-shrink: 0;
}
.sec-setting-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
}
.sec-setting-row__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sec-setting-row__icon--primary { background: rgba(var(--v-theme-primary), 0.10); }
.sec-setting-row__icon--info { background: rgba(0, 149, 255, 0.10); }
.sec-setting-row__icon--success { background: rgba(76, 175, 80, 0.10); }
.sec-setting-row__body {
  flex: 1;
  min-width: 0;
}
.sec-setting-row__title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 2px;
}
.sec-setting-row__desc {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  margin: 0;
}
.sec-setting-row__control {
  flex-shrink: 0;
}

/* ─── DIALOG ─── */
.sec-dialog {
  padding: 24px 28px 20px;
}
.sec-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.sec-dialog__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sec-dialog__icon--warning { background: rgba(255, 152, 0, 0.10); }
.sec-dialog__icon--success { background: rgba(76, 175, 80, 0.10); }
.sec-dialog__close {
  margin-top: -8px;
  margin-right: -8px;
}
.sec-dialog__title {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 8px;
}
.sec-dialog__body {
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0 0 20px;
  line-height: 1.5;
}
.sec-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>

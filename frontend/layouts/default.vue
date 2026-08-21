<template>
  <v-app>
    <!-- Sidebar / Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      rail-width="72"
      width="260"
      permanent
      app
      class="sidebar-drawer"
    >
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="sidebar-logo__icon">
          <img v-if="tenantLogoUrl" :src="tenantLogoUrl" alt="Logo" class="sidebar-logo__img" />
          <v-icon v-else size="22" color="white">mdi-monitor</v-icon>
        </div>
        <div v-if="!rail" class="sidebar-logo__text">
          <span class="sidebar-logo__title">{{ auth.isSuperAdmin ? 'DomendraPOS' : (auth.tenantName || 'DomendraPOS') }}</span>
          <p class="sidebar-logo__sub">{{ auth.isSuperAdmin ? 'Platform Admin' : 'Point of Sale' }}</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav" v-if="!auth.isSuperAdmin">
        <template v-for="item in navItems" :key="item.path || item.label">
          <!-- Parent item with children -->
          <div v-if="item.children" class="sidebar-group">
            <button
              class="sidebar-item"
              :class="{ 'sidebar-item--active': isGroupActive(item), 'sidebar-item--open': expandedGroups[item.label] }"
              @click="toggleGroup(item.label)"
            >
              <v-icon size="20" class="sidebar-item__icon">{{ item.icon }}</v-icon>
              <span v-if="!rail" class="sidebar-item__label">{{ item.label }}</span>
              <v-icon v-if="!rail" size="16" class="sidebar-item__chevron">{{ expandedGroups[item.label] ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </button>
            <div v-if="!rail && expandedGroups[item.label]" class="sidebar-group__children">
              <NuxtLink
                v-for="child in item.children"
                :key="child.path"
                :to="child.path"
                class="sidebar-child"
                :class="{ 'sidebar-child--active': isActive(child.path) }"
              >
                <v-icon size="18" class="sidebar-child__icon">{{ child.icon }}</v-icon>
                <span class="sidebar-child__label">{{ child.label }}</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Single item (no children) -->
          <NuxtLink
            v-else
            :to="item.path"
            class="sidebar-item"
            :class="{ 'sidebar-item--active': isActive(item.path) }"
          >
            <v-icon size="20" class="sidebar-item__icon">{{ item.icon }}</v-icon>
            <span v-if="!rail" class="sidebar-item__label">{{ item.label }}</span>
          </NuxtLink>
        </template>
      </nav>

      <!-- Admin section -->
      <template v-if="auth.isManager">
        <div v-if="!rail" class="sidebar-section-label">Administration</div>
        <nav class="sidebar-nav sidebar-nav--admin">
          <template v-for="item in adminItems" :key="item.path || item.label">
            <!-- Parent item with children -->
            <div v-if="item.children" class="sidebar-group">
              <button
                class="sidebar-item"
                :class="{ 'sidebar-item--active': isGroupActive(item), 'sidebar-item--open': expandedGroups[item.label] }"
                @click="toggleGroup(item.label)"
              >
                <v-icon size="20" class="sidebar-item__icon">{{ item.icon }}</v-icon>
                <span v-if="!rail" class="sidebar-item__label">{{ item.label }}</span>
                <v-icon v-if="!rail" size="16" class="sidebar-item__chevron">{{ expandedGroups[item.label] ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </button>
              <div v-if="!rail && expandedGroups[item.label]" class="sidebar-group__children">
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.path"
                  :to="child.path"
                  class="sidebar-child"
                  :class="{ 'sidebar-child--active': isActive(child.path) }"
                >
                  <v-icon size="18" class="sidebar-child__icon">{{ child.icon }}</v-icon>
                  <span class="sidebar-child__label">{{ child.label }}</span>
                </NuxtLink>
              </div>
            </div>

            <!-- Single item (no children) -->
            <NuxtLink
              v-else
              :to="item.path"
              class="sidebar-item"
              :class="{ 'sidebar-item--active': isActive(item.path) }"
            >
              <v-icon size="20" class="sidebar-item__icon">{{ item.icon }}</v-icon>
              <span v-if="!rail" class="sidebar-item__label">{{ item.label }}</span>
            </NuxtLink>
          </template>
        </nav>
      </template>

      <!-- Super-admin section -->
      <template v-if="auth.isSuperAdmin">
        <div v-if="!rail" class="sidebar-section-label">Platform</div>
        <nav class="sidebar-nav sidebar-nav--admin">
          <template v-for="item in superadminItems" :key="item.path || item.label">
            <NuxtLink
              v-if="!item.children"
              :to="item.path"
              class="sidebar-item"
              :class="{ 'sidebar-item--active': isActive(item.path) }"
            >
              <v-icon size="20" class="sidebar-item__icon">{{ item.icon }}</v-icon>
              <span v-if="!rail" class="sidebar-item__label">{{ item.label }}</span>
            </NuxtLink>
          </template>
        </nav>
      </template>

      <!-- Rail toggle (bottom) -->
      <template #append>
        <div class="sidebar-rail-toggle">
          <button class="sidebar-item sidebar-item--rail" @click="rail = !rail">
            <v-icon size="18" class="sidebar-item__icon">{{ rail ? 'mdi-chevron-double-right' : 'mdi-chevron-double-left' }}</v-icon>
            <span v-if="!rail" class="sidebar-item__label">Collapse</span>
          </button>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Top bar -->
    <v-app-bar flat border="b" height="64">
      <v-app-bar-nav-icon variant="text" @click.stop="rail = !rail" class="d-none d-md-flex" />
      <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer" class="d-flex d-md-none" />

      <!-- Session duration (replaces pageTitle + date) -->
      <div class="nav-brand-clock" v-if="sessionDuration">
        <div class="nav-brand-clock__session">
          <v-icon size="12">mdi-timer-outline</v-icon>
          <span class="nav-brand-clock__session-label">Session</span>
          <span class="nav-brand-clock__session-value">{{ sessionDuration }}</span>
        </div>
      </div>

      <v-spacer />

      <!-- Branch selector (global) -->
      <BranchSelector v-if="!auth.isSuperAdmin" class="mr-2 d-none d-sm-flex" />

      <!-- Live Today Summary in nav bar -->
      <div class="nav-today" v-if="!auth.isSuperAdmin">
        <!-- Today label -->
        <span class="nav-today__label">TODAY</span>

        <!-- LIVE badge -->
        <div class="nav-today__live" v-if="todayKpis.txCount > 0">
          <span class="nav-today__live-dot"></span>
          <span class="nav-today__live-text">LIVE</span>
        </div>

        <!-- Digital clock -->
        <div class="nav-clock">
          <span class="nav-clock__digit">{{ clockDigits.h1 }}</span>
          <span class="nav-clock__digit">{{ clockDigits.h2 }}</span>
          <span class="nav-clock__colon" :class="{ 'nav-clock__colon--blink': clockColon }">:</span>
          <span class="nav-clock__digit">{{ clockDigits.m1 }}</span>
          <span class="nav-clock__digit">{{ clockDigits.m2 }}</span>
          <span class="nav-clock__colon" :class="{ 'nav-clock__colon--blink': clockColon }">:</span>
          <span class="nav-clock__digit">{{ clockDigits.s1 }}</span>
          <span class="nav-clock__digit">{{ clockDigits.s2 }}</span>
        </div>

        <!-- Countdown -->
        <div class="nav-countdown" v-if="storeOpen">
          <v-icon size="13" color="primary">mdi-store-clock-outline</v-icon>
          <span class="nav-countdown__value">{{ countdown }}</span>
        </div>
        <div class="nav-countdown nav-countdown--closed" v-else>
          <v-icon size="13" color="error">mdi-store-off-outline</v-icon>
          <span class="nav-countdown__value">Closed</span>
        </div>

        <!-- Today stats -->
        <div class="nav-today__stats">
          <div class="nav-today__stat">
            <span class="nav-today__stat-label">Revenue</span>
            <span class="nav-today__stat-value text-success">{{ formatMoney(todayKpis.revenue) }}</span>
          </div>
          <div class="nav-today__sep"></div>
          <div class="nav-today__stat">
            <span class="nav-today__stat-label">Txns</span>
            <span class="nav-today__stat-value">{{ todayKpis.txCount }}</span>
          </div>
        </div>
      </div>

      <!-- Fullscreen toggle -->
      <v-btn
        class="fullscreen-toggle"
        :icon="isFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'"
        variant="text"
        @click="toggleFullscreen()"
        :title="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
        aria-label="Toggle fullscreen"
      />

      <!-- Theme toggle -->
      <v-btn
        :icon="theme.isDark.value ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'"
        variant="text"
        @click="theme.toggle()"
        :title="theme.isDark.value ? 'Switch to light mode' : 'Switch to dark mode'"
        aria-label="Toggle dark mode"
      />

      <!-- User menu -->
      <v-menu location="bottom end" offset="8" min-width="220">
        <template #activator="{ props: menuProps }">
          <v-btn v-bind="menuProps" variant="text" rounded="lg" class="px-1">
            <v-avatar color="primary" size="32" class="mr-1">
              <span class="text-white font-weight-bold text-body-2">{{ initials }}</span>
            </v-avatar>
            <v-icon size="18">mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list density="comfortable" nav min-width="220">
          <div class="px-4 py-2">
            <p class="text-body-2 font-weight-bold">{{ auth.fullName }}</p>
            <p class="text-caption text-medium-emphasis">{{ auth.user?.email }}</p>
          </div>
          <v-divider />
          <v-list-item to="/settings/profile" prepend-icon="mdi-account-circle-outline" title="Profile Settings" />
          <v-list-item
            prepend-icon="mdi-logout"
            title="Sign out"
            base-color="error"
            @click="auth.logout()"
          />
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Page content -->
    <v-main>
      <v-container fluid class="px-4 px-md-6 pb-4 pb-md-6 pt-2" style="max-width: 1600px">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFullscreen } from '@vueuse/core'

const route = useRoute()
const auth = useAuthStore()
const theme = useTheme()
const { isFullscreen, enter: enterFullscreen, toggle: toggleFullscreen } = useFullscreen()

// ===== Auto fullscreen =====
// Enter fullscreen automatically when the authenticated layout mounts (login),
// and re-enter whenever the user interacts with the app (clicks are user
// gestures, so they satisfy browser fullscreen activation requirements).
function enterFullscreenSafely() {
  if (!isFullscreen.value) {
    enterFullscreen().catch(() => {})
  }
}

function handleFullscreenClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  // Don't hijack the explicit toggle button so the user can still exit.
  if (target.closest('.fullscreen-toggle')) return
  enterFullscreenSafely()
}

onMounted(() => {
  enterFullscreenSafely()
  document.addEventListener('click', handleFullscreenClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleFullscreenClick)
})

const drawer = ref(true)
const rail = ref(true)

// ---- Tenant logo ----
const config = useRuntimeConfig()
const tenantLogoUrl = computed(() => {
  const logo = auth.tenant?.logo
  if (!logo) return ''
  if (logo.startsWith('http')) return logo
  return config.public.apiBase.replace('/api', '') + '/' + logo
})

// ---- Navigation icons (MDI) ----
const iconDashboard = 'mdi-view-dashboard-outline'
const iconSales = 'mdi-receipt-text-outline'
const iconPOS = 'mdi-cash-register'
const iconProducts = 'mdi-package-variant-closed'
const iconInventory = 'mdi-archive-outline'
const iconAdjustment = 'mdi-clipboard-edit-outline'
const iconStockOnHand = 'mdi-clipboard-list'
const iconMovements = 'mdi-swap-horizontal'
const iconLowStockAlert = 'mdi-alert-octagon-outline'
const iconCustomers = 'mdi-account-group-outline'
const iconSuppliers = 'mdi-truck-outline'
const iconReports = 'mdi-chart-box-outline'
const iconStaff = 'mdi-account-tie-outline'
const iconBranches = 'mdi-store-outline'
const iconTruck = 'mdi-truck-fast-outline'
const iconSettings = 'mdi-cog-outline'
const iconPharmacy = 'mdi-pill-multiple'
const iconFinance = 'mdi-finance'
const iconChart = 'mdi-chart-line'
const iconReceipt = 'mdi-receipt-outline'
const iconCredit = 'mdi-credit-card-outline'
const iconInvoice = 'mdi-file-document-outline'
const iconExpense = 'mdi-cash-minus'
const iconTransfer = 'mdi-arrow-left-right-bold-outline'
const iconClipboard = 'mdi-clipboard-list-outline'
const iconShield = 'mdi-shield-account-outline'
const iconKey = 'mdi-key-variant'
const iconLock = 'mdi-lock-outline'
const iconAudit = 'mdi-file-document-multiple-outline'
const iconBilling = 'mdi-credit-card-clock-outline'
const iconUsage = 'mdi-chart-bar'
const iconPayments = 'mdi-cash-fast'
const iconDomain = 'mdi-domain'
const iconAccountTie = 'mdi-account-tie'
const iconServer = 'mdi-server-network'

const expandedGroups = ref({})
const activeGroupName = ref<string | null>(null)

function toggleGroup(label: string) {
  if (expandedGroups.value[label]) {
    // Already open — close it
    expandedGroups.value[label] = false
    activeGroupName.value = null
  } else {
    // Close all, then open this one (accordion)
    expandedGroups.value = {}
    expandedGroups.value[label] = true
    activeGroupName.value = label
  }
}

function isGroupActive(item: any): boolean {
  return item.children?.some((c: any) => isActive(c.path)) ?? false
}

const navItems = computed(() => [
  { path: '/dashboard', label: 'Dashboard', icon: iconDashboard },
  {
    label: 'Point of Sale',
    icon: iconPOS,
    children: [
      { path: '/pos', label: 'Checkout', icon: iconPOS },
      { path: '/pos/history', label: 'Sales History', icon: iconSales },
      { path: '/pos/parked', label: 'Parked Sales', icon: iconReceipt },
      { path: '/pos/shifts', label: 'Cashier Shifts', icon: iconStaff },
    ],
  },
  {
    label: 'Inventory',
    icon: iconInventory,
    children: [
      { path: '/products', label: 'Stock Items', icon: iconProducts },
      { path: '/inventory/stock', label: 'Stock on Hand', icon: iconStockOnHand },
      { path: '/inventory/movements', label: 'Stock Movements', icon: iconMovements },
      { path: '/inventory/low-stock', label: 'Low Stock Alerts', icon: iconLowStockAlert },
      { path: '/inventory/adjustments', label: 'Adjustments', icon: iconAdjustment },
      { path: '/inventory/stock-analysis', label: 'Stock Analysis', icon: iconChart },
    ],
  },
  { path: '/customers', label: 'Customers', icon: iconCustomers },
  { path: '/suppliers', label: 'Suppliers', icon: iconTruck },
  { path: '/reports', label: 'Reports', icon: iconReports },
  // ---- Pharmacy Section ----
  {
    label: 'Accounts & Finance',
    icon: iconFinance,
    children: [
      { path: '/accounts', label: 'Overview', icon: iconFinance },
      { path: '/invoices', label: 'Invoices', icon: iconInvoice },
      { path: '/credit', label: 'Credit Accounts', icon: iconCredit },
      { path: '/expenses', label: 'Expenses', icon: iconExpense },
      { path: '/purchase-orders', label: 'Purchase Orders', icon: iconClipboard },
    ],
  },
  {
    label: 'Analytics',
    icon: iconChart,
    children: [
      { path: '/analytics', label: 'Overview', icon: iconChart },
      { path: '/analytics/categories', label: 'Categories', icon: iconChart },
      { path: '/analytics/products', label: 'Products', icon: iconProducts },
      { path: '/sales', label: 'Sales', icon: iconSales },
    ],
  },
])

const adminItems = computed(() => [
  { path: '/admin/staff', label: 'Staff Management', icon: iconStaff },
  { path: '/admin/branches', label: 'Branches', icon: iconBranches },
  {
    label: 'IAM & Security',
    icon: iconShield,
    children: [
      { path: '/admin/roles-permissions', label: 'Roles & Permissions', icon: iconKey },
      { path: '/admin/audit-logs', label: 'Audit Logs', icon: iconAudit },
      { path: '/admin/security', label: 'Security Control', icon: iconLock },
    ],
  },
  {
    label: 'API Billing',
    icon: iconBilling,
    children: [
      { path: '/admin/billing/usage', label: 'API Usage', icon: iconUsage },
      { path: '/admin/billing/payments', label: 'Payments', icon: iconPayments },
    ],
  },
  { path: '/admin/settings', label: 'Settings', icon: iconSettings },
])

const superadminItems = computed(() => [
  { path: '/superadmin', label: 'Platform Dashboard', icon: iconDashboard },
  { path: '/superadmin/tenants', label: 'Tenants', icon: iconDomain },
])

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/pos': 'Point of Sale',
    '/pos/history': 'POS Sales History',
    '/pos/parked': 'Parked Sales',
    '/pos/shifts': 'Cashier Shifts',
    '/sales': 'Sales',
    '/products': 'Stock Items',
    '/inventory': 'Inventory',
    '/inventory/stock': 'Stock on Hand',
    '/inventory/movements': 'Stock Movements',
    '/inventory/low-stock': 'Low Stock Alerts',
    '/inventory/adjustments': 'Stock Adjustments',
    '/inventory/stock-analysis': 'Stock Analysis',
    '/customers': 'Customer CRM',
    '/suppliers': 'Suppliers',
    '/reports': 'Reports & Analytics',
    '/admin/staff': 'Staff Management',
    '/admin/branches': 'Branch Management',
    '/admin/roles-permissions': 'Roles & Permissions',
    '/admin/audit-logs': 'Audit Logs',
    '/admin/billing/usage': 'API Usage',
    '/admin/billing/payments': 'API Billing Payments',
    '/admin/settings': 'Settings',
    // Pharmacy
    '/accounts': 'Accounts & Finance',
    '/invoices': 'Customer Invoices',
    '/credit': 'Credit Accounts',
    '/expenses': 'Operating Expenses',
    '/expenses/categories': 'Expense Categories',
    '/purchase-orders': 'Purchase Orders',
    '/analytics': 'Analytics Overview',
    '/analytics/categories': 'Category Analysis',
    '/analytics/products': 'Product Analysis',
    '/sales': 'Sales',
    // Super-admin
    '/superadmin': 'Platform Dashboard',
    '/superadmin/tenants': 'Tenant Management',
  }
  return titles[route.path] || 'DomendraPOS'
})

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
})

const isActive = (path: string) => route.path === path || route.path.startsWith(path + '/')

// Auto-expand group if a child route is active
watch(route, () => {
  // Accordion: check both main nav and admin groups
  const allGroups = [
    ...navItems.value,
    ...(auth.isManager && !auth.isSuperAdmin ? adminItems.value : []),
    ...(auth.isSuperAdmin ? superadminItems.value : []),
  ]
  let foundGroup = false
  for (const item of allGroups) {
    if (item.children && item.children.some(c => isActive(c.path))) {
      // Accordion: only expand the active group, close others
      expandedGroups.value = {}
      expandedGroups.value[item.label] = true
      activeGroupName.value = item.label
      foundGroup = true
    }
  }
  // If navigating to a non-child route, collapse all groups
  if (!foundGroup) {
    expandedGroups.value = {}
    activeGroupName.value = null
  }
}, { immediate: true })

const initials = computed(() => {
  if (!auth.user) return ''
  return (auth.user.first_name[0] || '') + (auth.user.last_name[0] || '')
})

// ===== Live Clock & Countdown =====
const clockDigits = ref({ h1: '0', h2: '0', m1: '0', m2: '0', s1: '0', s2: '0' })
const clockColon = ref(true)
const countdown = ref('')
const storeOpen = ref(true)
const sessionDuration = ref('')
const loginTimeCookie = useCookie<string | null>('login_time')
const STORE_CLOSE_HOUR = 22

function updateClock() {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  clockDigits.value = { h1: h[0], h2: h[1], m1: m[0], m2: m[1], s1: s[0], s2: s[1] }
  clockColon.value = now.getSeconds() % 2 === 0
  const hour = now.getHours()
  storeOpen.value = hour < STORE_CLOSE_HOUR
  if (storeOpen.value) {
    const close = new Date(now)
    close.setHours(STORE_CLOSE_HOUR, 0, 0, 0)
    const diff = close.getTime() - now.getTime()
    const hh = Math.floor(diff / 3600000)
    const mm = Math.floor((diff % 3600000) / 60000)
    const ss = Math.floor((diff % 60000) / 1000)
    countdown.value = `${String(hh).padStart(2, '0')}h ${String(mm).padStart(2, '0')}m ${String(ss).padStart(2, '0')}s`
  }

  // Session duration
  let loginTimeStr = loginTimeCookie.value as string | null
  if (!loginTimeStr) {
    loginTimeStr = new Date().toISOString()
    loginTimeCookie.value = loginTimeStr
  }
  if (loginTimeStr) {
    const loginDate = new Date(loginTimeStr)
    const elapsed = now.getTime() - loginDate.getTime()
    if (elapsed > 0) {
      const eh = Math.floor(elapsed / 3600000)
      const em = Math.floor((elapsed % 3600000) / 60000)
      const es = Math.floor((elapsed % 60000) / 1000)
      sessionDuration.value = `${String(eh).padStart(2, '0')}h ${String(em).padStart(2, '0')}m ${String(es).padStart(2, '0')}s`
    }
  }
}
let clockInterval: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  updateClock()
  clockInterval = setInterval(updateClock, 1000)
})
onUnmounted(() => { if (clockInterval) clearInterval(clockInterval) })

// ===== Today's POS Stats =====
const todayKpis = ref({ revenue: 0, txCount: 0, items: 0 })
let todayInterval: ReturnType<typeof setInterval> | undefined

async function fetchTodayStats() {
  if (!auth.isAuthenticated || !import.meta.client || auth.isSuperAdmin) return
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const res = await useApi()(buildTodayQuery())
    const txs = res.results || res || []
    const todayTxs = txs.filter((t: any) => {
      const d = new Date(t.created_at)
      return d >= startOfDay && t.status === 'completed'
    })
    todayKpis.value = {
      revenue: todayTxs.reduce((s: number, t: any) => s + Number(t.total || 0), 0),
      txCount: todayTxs.length,
      items: todayTxs.reduce((s: number, t: any) => s + Number(t.items_count || 0), 0),
    }
  } catch { /* silently fail */ }
}

const branchStore = useBranchStore()

function buildTodayQuery(): string {
  const params = new URLSearchParams({ page_size: '500' })
  if (branchStore.branchId) {
    params.set('branch', String(branchStore.branchId))
  }
  return `/pos/transactions/?${params.toString()}`
}

const { currency } = useFormat()
function formatMoney(v: number | string | null | undefined): string {
  return currency(Number(v) || 0)
}

onMounted(() => {
  branchStore.init()
  fetchTodayStats()
  todayInterval = setInterval(fetchTodayStats, 30000) // refresh every 30s
})
onUnmounted(() => { if (todayInterval) clearInterval(todayInterval) })
// Re-fetch when route changes or branch changes
watch([() => route.path, () => branchStore.branchId], () => fetchTodayStats())
</script>

<style scoped>
/* ===== Sidebar Drawer ===== */
.sidebar-drawer {
  font-family: "Segoe UI Variable", Inter, system-ui, sans-serif;
  background: rgb(var(--v-theme-surface)) !important;
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.06) !important;
}
.sidebar-drawer :deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
}

/* ===== Logo ===== */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px;
  flex-shrink: 0;
}
.sidebar-logo__icon {
  width: 42px; height: 42px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
  overflow: hidden;
}
.sidebar-logo__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.sidebar-logo__text {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
}
.sidebar-logo__title {
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: rgba(var(--v-theme-on-surface), 0.9);
  white-space: nowrap;
  line-height: 1.3;
}
.sidebar-logo__sub {
  font-size: 0.625rem;
  color: rgba(var(--v-theme-on-surface), 0.4);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
}

/* ===== Divider ===== */
.sidebar-divider {
  height: 1px;
  background: rgba(var(--v-theme-on-surface), 0.06);
  margin: 0 16px;
  flex-shrink: 0;
}
.sidebar-divider--section { margin: 8px 16px 4px; }

/* ===== Section Label ===== */
.sidebar-section-label {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(var(--v-theme-on-surface), 0.38);
  padding: 10px 20px 6px;
  flex-shrink: 0;
}

/* ===== Navigation ===== */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 6px 10px;
  flex: 0 1 auto;
  overflow-y: auto;
}
.sidebar-nav--admin { padding-bottom: 8px; }

/* ===== Nav Item ===== */
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.6);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s cubic-bezier(0.4, 0, 0.2, 1),
              color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.15s ease;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  position: relative;
}
.sidebar-item:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
  color: rgba(var(--v-theme-on-surface), 0.9);
}
.sidebar-item--active {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.18), rgba(var(--v-theme-primary), 0.08));
  color: rgb(var(--v-theme-primary));
  font-weight: 700;
}
.sidebar-item--active::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  border-radius: 0 4px 4px 0;
  background: linear-gradient(180deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.85));
  box-shadow: 0 0 8px rgba(var(--v-theme-primary), 0.4);
}
.sidebar-item__icon {
  flex-shrink: 0;
  opacity: 0.55;
  transition: opacity 0.2s, transform 0.2s;
}
.sidebar-item:hover .sidebar-item__icon {
  opacity: 0.85;
  transform: scale(1.05);
}
.sidebar-item--active .sidebar-item__icon {
  opacity: 1;
  transform: scale(1.05);
}
.sidebar-item__label {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sidebar-item__chevron {
  flex-shrink: 0;
  opacity: 0.35;
  transition: transform 0.25s ease, opacity 0.2s;
}
.sidebar-item--open .sidebar-item__chevron { opacity: 0.7; }

/* ===== Group Children ===== */
.sidebar-group { display: flex; flex-direction: column; gap: 2px; }
.sidebar-group__children {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 24px;
  margin-top: 3px;
  position: relative;
}
.sidebar-group__children::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 4px;
  width: 1.5px;
  background: rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 2px;
}
.sidebar-child {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.5);
  text-decoration: none;
  transition: background 0.2s, color 0.2s, padding-left 0.2s;
}
.sidebar-child:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
  color: rgba(var(--v-theme-on-surface), 0.8);
  padding-left: 16px;
}
.sidebar-child--active {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.15), rgba(var(--v-theme-primary), 0.05));
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}
.sidebar-child__icon { flex-shrink: 0; opacity: 0.4; transition: opacity 0.2s; }
.sidebar-child--active .sidebar-child__icon { opacity: 0.9; }
.sidebar-child__label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ===== Rail Toggle (bottom) ===== */
.sidebar-rail-toggle {
  padding: 6px 10px 10px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.sidebar-item--rail {
  padding: 10px 14px;
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.4);
}

/* ===== Scrollbar (sidebar) ===== */
.sidebar-drawer :deep(.v-navigation-drawer__content)::-webkit-scrollbar {
  width: 4px;
}
.sidebar-drawer :deep(.v-navigation-drawer__content)::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar-drawer :deep(.v-navigation-drawer__content)::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.25);
  border-radius: 999px;
}
.sidebar-drawer :deep(.v-navigation-drawer__content)::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.4);
}

/* ===== Rail mode: center icons ===== */
.sidebar-drawer :deep(.v-navigation-drawer--rail) .sidebar-logo {
  justify-content: center;
  padding: 18px 0;
}
.sidebar-drawer :deep(.v-navigation-drawer--rail) .sidebar-item {
  justify-content: center;
  padding: 10px 0;
}
.sidebar-drawer :deep(.v-navigation-drawer--rail) .sidebar-item__icon {
  margin: 0 auto;
}

/* ===== Nav Brand Clock (replaces pageTitle) ===== */
.nav-brand-clock {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 4px;
}
.nav-brand-clock__session {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.06);
  border: 1px solid rgba(16, 185, 129, 0.08);
}
.nav-brand-clock__session-label {
  font-size: 0.5625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(var(--v-theme-on-surface), 0.35);
}
.nav-brand-clock__session-value {
  font-size: 0.6875rem;
  font-weight: 700;
  color: rgb(var(--v-theme-success));
  font-variant-numeric: tabular-nums;
}

/* ===== Nav Today Summary ===== */
.nav-today {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 8px;
  flex-shrink: 0;
}
:deep(.v-app-bar) { overflow: visible !important; }
:deep(.v-toolbar__content) { overflow: visible !important; }

/* LIVE badge */
.nav-today__label {
  font-size: 0.5625rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: rgba(var(--v-theme-on-surface), 0.5);
  padding-right: 2px;
}
.nav-today__live {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 20px;
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.15);
}
.nav-today__live-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: #f43f5e;
  animation: nav-live-ping 1.5s infinite;
}
.nav-today__live-text {
  font-size: 0.5625rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #f43f5e;
}
@keyframes nav-live-ping {
  0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.4); }
  70% { box-shadow: 0 0 0 4px rgba(244, 63, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
}

/* Digital clock */
.nav-clock {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
  font-variant-numeric: tabular-nums;
}
.nav-clock__digit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 26px;
  font-size: 0.875rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.85);
  background: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 4px;
  padding: 0 1px;
}
.nav-clock__colon {
  font-size: 0.875rem;
  font-weight: 700;
  color: rgba(52, 120, 246, 0.5);
  padding: 0 1px;
  transition: opacity 0.15s;
}
.nav-clock__colon--blink { opacity: 0.2; }

/* Countdown */
.nav-countdown {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 8px;
  background: rgba(52, 120, 246, 0.06);
}
.nav-countdown__value {
  font-size: 0.6875rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  font-variant-numeric: tabular-nums;
}
.nav-countdown--closed {
  background: rgba(239, 83, 80, 0.06);
}
.nav-countdown--closed .nav-countdown__value { color: rgb(var(--v-theme-error)); }

/* Today stats */
.nav-today__stats {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding-left: 10px;
  border-left: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
.nav-today__stat {
  display: flex;
  flex-direction: column;
  gap: 0;
  line-height: 1.2;
}
.nav-today__stat-label {
  font-size: 0.5625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(var(--v-theme-on-surface), 0.35);
}
.nav-today__stat-value {
  font-size: 0.8125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.nav-today__sep {
  width: 1px;
  height: 22px;
  background: rgba(var(--v-theme-on-surface), 0.08);
}

/* Responsive: progressively hide elements on smaller screens */
@media (max-width: 1200px) {
  .nav-today__stats { display: none !important; }
}
@media (max-width: 900px) {
  .nav-countdown { display: none !important; }
}
@media (max-width: 560px) {
  .nav-brand-clock__session { display: none !important; }
}
@media (max-width: 600px) {
  .nav-clock { display: none !important; }
  .nav-today__live { display: none !important; }
}
@media (max-width: 420px) {
  .nav-brand-clock__digit { min-width: 14px; height: 22px; font-size: 0.75rem; }
}
@media (max-width: 400px) {
  .nav-today { display: none !important; }
}
</style>

import { defineStore } from 'pinia'

interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role: string
  phone: string
  avatar: string | null
  is_active_employee: boolean
  employee_id: string
  default_branch_id: number | null
}

interface TenantInfo {
  name: string
  currency_code: string
  currency_symbol: string
  timezone: string
  primary_color: string
  plan: string
  logo: string | null
  // Extended tenant contact details (used by report PDF header)
  contact_email?: string
  contact_phone?: string
  address_line1?: string
  address_line2?: string
}

interface BillingStatus {
  locked: boolean
  reason: string
  has_overdue: boolean
  total_overdue: string
  overdue_count: number
  oldest_due_date: string | null
  days_overdue: number
  grace_days: number
  tenant_name: string | null
  currency: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  tenant: TenantInfo | null
  loginTime: string | null
  billing: BillingStatus | null
  /** role → module → actions[] map (only the current user's role entry) */
  permissions: Record<string, string[]>
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    tenant: null,
    loginTime: null,
    billing: null,
    permissions: {},
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    fullName: (state) => state.user ? `${state.user.first_name} ${state.user.last_name}` : '',
    isSuperAdmin: (state) => state.user?.role === 'super_admin',
    isTenantAdmin: (state) => state.user?.role === 'tenant_admin',
    isManager: (state) => ['super_admin', 'tenant_admin', 'manager'].includes(state.user?.role || ''),
    role: (state) => state.user?.role || '',
    currencyCode: (state) => state.tenant?.currency_code || 'KES',
    currencySymbol: (state) => state.tenant?.currency_symbol || 'KSh',
    tenantName: (state) => state.tenant?.name || '',
    tenantPlan: (state) => state.tenant?.plan || '',
    tenantEmail: (state) => state.tenant?.contact_email || state.user?.email || '',
    tenantPhone: (state) => state.tenant?.contact_phone || '',
    tenantAddress: (state) => {
      const t = state.tenant
      if (!t) return ''
      return [t.address_line1, t.address_line2].filter(Boolean).join(', ')
    },
    tenantLogo: (state) => {
      const logo = state.tenant?.logo
      if (!logo) return ''
      // If logo is already a full URL, return it as-is; otherwise build absolute URL.
      if (typeof logo === 'string' && logo.startsWith('http')) return logo
      const config = useRuntimeConfig()
      const base = (config.public.apiBase as string)?.replace(/\/api$/, '') || 'http://localhost:8000'
      return logo ? `${base}${logo}` : ''
    },
    billingLocked: (state) => !!state.billing?.locked,
    hasOverdue: (state) => !!state.billing?.has_overdue,
    overdueTotal: (state) => state.billing?.total_overdue || '0',
    billingReason: (state) => state.billing?.reason || '',

    /**
     * Check if the current user has a specific permission.
     * @param module  e.g. 'inventory', 'sales', 'products'
     * @param action  e.g. 'view', 'create', 'edit', 'delete'
     * Super admins, tenant admins, and managers bypass all checks.
     */
    can: (state) => (module: string, action: string = 'view'): boolean => {
      const role = state.user?.role || ''
      // Manager and above see everything
      if (['super_admin', 'tenant_admin', 'manager'].includes(role)) return true
      // No permissions loaded yet — deny by default
      if (!state.permissions || !state.permissions[module]) return false
      return state.permissions[module].includes(action)
    },

    /** Check if the user has ANY permission for a module (at least 'view') */
    canAccess: (state) => (module: string): boolean => {
      const role = state.user?.role || ''
      if (['super_admin', 'tenant_admin', 'manager'].includes(role)) return true
      if (!state.permissions || !state.permissions[module]) return false
      return state.permissions[module].length > 0
    },
  },

  actions: {
    setAuth(access: string, refresh: string, user: User, tenant?: TenantInfo | null, billing?: any) {
      this.accessToken = access
      this.refreshToken = refresh
      this.user = user
      this.tenant = tenant || null
      const now = new Date().toISOString()
      this.loginTime = now
      const accessToken = useCookie('access_token')
      const refreshToken = useCookie('refresh_token')
      accessToken.value = access
      refreshToken.value = refresh
      // Persist billing status from login response
      if (billing) {
        this.billing = billing
      }
      // Persist tenant currency in a cookie so useFormat can read it on reload
      const tenantCookie = useCookie('tenant_info')
      tenantCookie.value = tenant ? JSON.stringify(tenant) : null
      const loginCookie = useCookie('login_time')
      loginCookie.value = now
      // NOTE: fetchPermissions() is NOT called here — it's awaited in login()
      // so the redirect logic has real permission data. Calling it here too
      // causes a race condition where the useApi() interceptor fires before
      // the cookie is fully committed, resulting in a 401 → refresh cascade.
    },

    setPermissions(matrix: Record<string, string[]>) {
      this.permissions = matrix
    },

    async fetchPermissions() {
      if (!this.accessToken || !this.user) return
      // Super admins / tenant admins / managers have full access — skip fetch
      if (['super_admin', 'tenant_admin', 'manager'].includes(this.user.role)) {
        // Set a sentinel that 'can' will short-circuit on
        this.permissions = {}
        return
      }
      try {
        // Use a raw $fetch with the token from the store (not useApi()).
        // useApi()'s onRequest reads from useCookie('access_token') which may
        // not be synced yet when called immediately after setAuth(), causing
        // a 401 → token refresh cascade on login.
        const config = useRuntimeConfig()
        const data = await $fetch(`${config.public.apiBase}/users/role-permissions/matrix/`, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        })
        // data is { role: { module: [actions], ... }, ... } — extract just the user's role
        const roleKey = this.user.role
        this.permissions = (data as any)[roleKey] || {}
        // Stash in cookie so middleware can restore on reload without a network call.
        const permCookie = useCookie<Record<string, string[]>>('rbac_permissions', { maxAge: 60 * 60 * 24 * 7 })
        permCookie.value = this.permissions
      } catch {
        // If fetch fails (e.g., network error), try restoring from cookie
        const permCookie = useCookie<Record<string, string[]>>('rbac_permissions')
        if (permCookie.value) {
          this.permissions = permCookie.value
        }
      }
    },

    clearAuth() {
      // Clear persisted POS cart for this user from localStorage
      const userId = this.user?.id
      this.accessToken = null
      this.refreshToken = null
      this.user = null
      this.tenant = null
      this.loginTime = null
      this.billing = null
      this.permissions = {}
      const accessToken = useCookie('access_token')
      const refreshToken = useCookie('refresh_token')
      const tenantCookie = useCookie('tenant_info')
      const loginCookie = useCookie('login_time')
      const permCookie = useCookie('rbac_permissions')
      accessToken.value = null
      refreshToken.value = null
      tenantCookie.value = null
      loginCookie.value = null
      permCookie.value = null
      if (userId && import.meta.client) {
        localStorage.removeItem(`pos_cart_${userId}`)
      }
    },

    setTenant(tenant: TenantInfo) {
      this.tenant = tenant
      const tenantCookie = useCookie('tenant_info')
      tenantCookie.value = JSON.stringify(tenant)
    },

    async login(email: string, password: string) {
      const config = useRuntimeConfig()
      const response = await $fetch(`${config.public.apiBase}/auth/login/`, {
        method: 'POST',
        body: { email, password },
      })
      this.setAuth(response.access, response.refresh, response.user, response.tenant, response.billing)
      // Await permissions so the login page's redirect logic has real data.
      // setAuth() fires fetchPermissions() as fire-and-forget; we await the
      // same async action here so the promise resolves before navigation.
      await this.fetchPermissions()
      return response
    },

    async fetchTenantSettings() {
      try {
        const data = await useApi()('/tenants/me/')
        this.setTenant({
          name: data.name,
          currency_code: data.currency_code,
          currency_symbol: data.currency_symbol,
          timezone: data.timezone,
          primary_color: data.primary_color,
          plan: data.plan || '',
          logo: data.logo || null,
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          address_line1: data.address_line1 || '',
          address_line2: data.address_line2 || '',
        })
        return data
      } catch (e) {
        // If we can't fetch tenant settings, keep the existing defaults
        return null
      }
    },

    logout() {
      // Notify backend to deactivate the active login record
      try {
        useApi()('/auth/logout/', { method: 'POST' })
      } catch {
        // Ignore errors — client-side logout should still proceed
      }
      this.clearAuth()
      navigateTo('/login')
    },

    async refresh() {
      // Force a fresh /auth/me/ fetch to re-check billing lock after a payment.
      try {
        const data = await useApi()('/users/staff/me/')
        if (data) {
          this.user = {
            id: data.id,
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            role: data.role,
            phone: data.phone,
            avatar: data.avatar,
            is_active_employee: data.is_active_employee,
            employee_id: data.employee_id || '',
            default_branch_id: data.default_branch_id,
          } as User
          if (data.billing) {
            this.billing = data.billing
          }
        }
        return data
      } catch {
        return null
      }
    },
  },
})

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
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    tenant: null,
    loginTime: null,
    billing: null,
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
    billingLocked: (state) => !!state.billing?.locked,
    hasOverdue: (state) => !!state.billing?.has_overdue,
    overdueTotal: (state) => state.billing?.total_overdue || '0',
    billingReason: (state) => state.billing?.reason || '',
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
      const accessToken = useCookie('access_token')
      const refreshToken = useCookie('refresh_token')
      const tenantCookie = useCookie('tenant_info')
      const loginCookie = useCookie('login_time')
      accessToken.value = null
      refreshToken.value = null
      tenantCookie.value = null
      loginCookie.value = null
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

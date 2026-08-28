/**
 * Auth middleware - redirects unauthenticated users to login.
 * Also restores tenant currency info and user from JWT on navigation.
 *
 * Superadmins are NOT associated with any tenant and get their own
 * platform-level dashboard at /superadmin. They are kept away from
 * tenant-scoped pages (which would fall back to the demo tenant).
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuthStore()
  const accessToken = useCookie('access_token')
  // Capture all cookie refs synchronously — Nuxt composables lose context after await
  const refreshTokenCookie = useCookie('refresh_token')
  const loginCookie = useCookie('login_time')
  const permCookie = useCookie<Record<string, string[]>>('rbac_permissions', { maxAge: 60 * 60 * 24 * 7 })
  const tenantCookie = useCookie('tenant_info')

  // Public pages that don't require authentication
  const publicPages = ['/login', '/signup', '/docs']
  if (publicPages.includes(to.path)) return

  if (!accessToken.value && !auth.isAuthenticated) {
    return navigateTo('/login')
  }

  // If auth store has no user but we have a JWT, restore the user from it
  if (!auth.user && accessToken.value) {
    try {
      const parts = accessToken.value.split('.')
      if (parts.length >= 2) {
        const payloadStr = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
        const payload = JSON.parse(payloadStr)
        // Restore tokens so isAuthenticated getter works
        auth.accessToken = accessToken.value
        auth.refreshToken = refreshTokenCookie.value || null
        auth.user = {
          id: Number(payload.user_id),
          email: payload.email || '',
          first_name: payload.name?.split(' ')[0] || '',
          last_name: payload.name?.split(' ').slice(1).join(' ') || '',
          role: payload.role || 'viewer',
          phone: '',
          avatar: null,
          is_active_employee: true,
          employee_id: '',
          default_branch_id: null,
        }
        // Set login time if not already set
        if (!auth.loginTime) {
          auth.loginTime = loginCookie.value as string || new Date().toISOString()
        }
        // Restore permissions from cookie first (fast — no network call)
        if (!auth.permissions || Object.keys(auth.permissions).length === 0) {
          if (permCookie.value) {
            auth.setPermissions(permCookie.value)
          }
        }
        // If still no permissions and user is non-manager, fetch from API
        // (awaited so the RBAC route guard below has permissions available)
        const isManagerPlus = ['super_admin', 'tenant_admin', 'manager'].includes(payload.role || '')
        if (!isManagerPlus) {
          // If permissions are missing, fetch from API
          if (!auth.permissions || Object.keys(auth.permissions).length === 0) {
            await auth.fetchPermissions()
          }
          // Always persist permissions to cookie (covers both fresh fetches and
          // SSR-hydrated permissions that haven't been cookie'd yet)
          if (auth.permissions && Object.keys(auth.permissions).length > 0) {
            permCookie.value = auth.permissions
          }
        }
      }
    } catch {
      // Malformed token — ignore and let auth fail naturally
    }
  }

  // ── Super-admin routing guard ──
  // Superadmins manage the entire platform, not a single tenant.
  // They belong on /superadmin/* and must be kept off tenant-scoped pages.
  // /settings/profile is allowed because the User table is shared (public schema).
  const superadminAllowedPrefixes = ['/superadmin', '/settings/profile']
  const isSuperadminPage = superadminAllowedPrefixes.some(p => to.path === p || to.path.startsWith(p + '/'))
  if (auth.role === 'super_admin') {
    if (!isSuperadminPage) {
      return navigateTo('/superadmin')
    }
    // Superadmins bypass the billing gate entirely
    return
  }
  // Non-superadmins must not access the superadmin dashboard
  const isSuperadminOnly = to.path === '/superadmin' || to.path.startsWith('/superadmin/')
  if (isSuperadminOnly) {
    return navigateTo('/dashboard')
  }

  // If auth store has no tenant data but we have a cookie, restore it
  if (!auth.tenant) {
    if (tenantCookie.value) {
      try {
        const tenant = typeof tenantCookie.value === 'string'
          ? JSON.parse(tenantCookie.value)
          : tenantCookie.value
        auth.setTenant(tenant)
      } catch {
        // Malformed cookie, ignore
      }
    }
  }

  // ── Billing lock gate ──
  // When a tenant is past due, the whole app is blocked until bills are
  // cleared. Tenant admins get the "clear bills" screen; other staff get a
  // "contact your admin" screen. Super admins bypass entirely.
  const lockPages = ['/billing/overdue', '/billing/locked']
  if (auth.isAuthenticated && auth.billingLocked && auth.role !== 'super_admin') {
    const lockPage = auth.isTenantAdmin ? '/billing/overdue' : '/billing/locked'
    if (!lockPages.includes(to.path)) {
      return navigateTo(lockPage)
    }
    // If a non-admin lands on the admin overdue screen (or vice-versa), redirect
    if (to.path === '/billing/overdue' && !auth.isTenantAdmin) return navigateTo('/billing/locked')
    if (to.path === '/billing/locked' && auth.isTenantAdmin) return navigateTo('/billing/overdue')
  }

  // When NOT locked, keep the gate pages from being visited directly
  if (auth.isAuthenticated && !auth.billingLocked && lockPages.includes(to.path)) {
    // Allow tenant admins with overdue balance to pre-view the overdue page
    if (!(to.path === '/billing/overdue' && auth.isTenantAdmin && auth.hasOverdue)) {
      return navigateTo('/dashboard')
    }
  }

  // ── RBAC route guard ──
  // Map route prefixes to permission modules. If the user's role doesn't have
  // 'view' access to the module, redirect to /dashboard.
  // Manager and above bypass this check entirely.
  if (auth.isAuthenticated && !auth.isManager && auth.role !== 'super_admin') {
    const routeModuleMap: Record<string, string> = {
      '/products': 'products',
      '/inventory': 'inventory',
      '/pos': 'sales',
      '/sales': 'sales',
      '/customers': 'customers',
      '/suppliers': 'suppliers',
      '/reports': 'reports',
      '/analytics': 'analytics',
      '/accounts': 'accounting',
      '/invoices': 'accounting',
      '/credit': 'accounting',
      '/expenses': 'accounting',
      '/purchase-orders': 'purchasing',
      '/admin/staff': 'staff',
      '/admin/branches': 'branches',
      '/admin/roles-permissions': 'staff',
      '/admin/audit-logs': 'staff',
      '/admin/security': 'staff',
      '/admin/settings': 'settings',
      '/admin/billing': 'settings',
    }

    for (const [prefix, module] of Object.entries(routeModuleMap)) {
      if (to.path === prefix || to.path.startsWith(prefix + '/')) {
        if (!auth.canAccess(module)) {
          return navigateTo('/dashboard')
        }
        break
      }
    }

    // ── Dashboard access guard ──
    // The dashboard aggregates analytics data. If the user has no analytics
    // permission and is trying to view /dashboard, redirect them to /pos
    // (checkout), which is the primary work area for front-of-house staff.
    if (to.path === '/dashboard' && !auth.canAccess('analytics')) {
      if (auth.canAccess('sales')) {
        return navigateTo('/pos')
      }
      // No analytics and no sales — fall back to the first module they can access
      // (or their profile as a last resort).
      const fallbackMods = ['products', 'inventory', 'customers', 'suppliers', 'reports', 'accounting', 'purchasing', 'staff', 'branches', 'settings']
      for (const mod of fallbackMods) {
        if (auth.canAccess(mod)) {
          const modRoute: Record<string, string> = {
            products: '/products',
            inventory: '/inventory',
            customers: '/customers',
            suppliers: '/suppliers',
            reports: '/reports',
            accounting: '/accounts',
            purchasing: '/purchase-orders',
            staff: '/admin/staff',
            branches: '/admin/branches',
            settings: '/admin/settings',
          }
          return navigateTo(modRoute[mod] || '/settings/profile')
        }
      }
      return navigateTo('/settings/profile')
    }
  }
})

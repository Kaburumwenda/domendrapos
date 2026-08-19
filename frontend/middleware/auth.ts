/**
 * Auth middleware - redirects unauthenticated users to login.
 * Also restores tenant currency info and user from JWT on navigation.
 *
 * Superadmins are NOT associated with any tenant and get their own
 * platform-level dashboard at /superadmin. They are kept away from
 * tenant-scoped pages (which would fall back to the demo tenant).
 */
export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuthStore()
  const accessToken = useCookie('access_token')

  // Public pages that don't require authentication
  const publicPages = ['/login', '/signup']
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
    const tenantCookie = useCookie('tenant_info')
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
})

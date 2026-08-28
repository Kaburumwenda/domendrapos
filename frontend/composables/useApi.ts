/**
 * useApi - Centralized API client with JWT auth and tenant resolution.
 *
 * Uses a module-level singleton $fetch instance so the token refresh logic
 * is shared across all callers. On 401, the interceptor:
 *   1. Calls /auth/refresh/ with the refresh token
 *   2. Updates cookie + auth store
 *   3. Retries the original request with the new access token
 *   4. If refresh fails, clears tokens and redirects to /login
 *
 * The retry re-enters the same interceptor, so chained 401s can be
 * refreshed again (with a single-retry guard to prevent infinite loops).
 */

interface ApiResponse<T = any> {
  data: T
  status: number
}

// ── Singleton refresh state ──────────────────────────────────────
let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

async function refreshToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) return refreshPromise

  const refreshTokenCookie = useCookie('refresh_token')
  if (!refreshTokenCookie.value) return null

  isRefreshing = true
  const config = useRuntimeConfig()

  refreshPromise = (async () => {
    try {
      const refreshed = await $fetch<{ access: string; refresh?: string }>(
        `${config.public.apiBase}/auth/refresh/`,
        {
          method: 'POST',
          body: { refresh: refreshTokenCookie.value },
        },
      )
      const accessTokenCookie = useCookie('access_token')
      accessTokenCookie.value = refreshed.access
      if (refreshed.refresh) {
        refreshTokenCookie.value = refreshed.refresh
      }
      // Also sync to the auth Pinia store
      const auth = useAuthStore()
      auth.accessToken = refreshed.access
      if (refreshed.refresh) auth.refreshToken = refreshed.refresh
      return refreshed.access
    } catch {
      // Refresh failed — clear everything and redirect
      const accessTokenCookie = useCookie('access_token')
      accessTokenCookie.value = null
      refreshTokenCookie.value = null
      const auth = useAuthStore()
      auth.accessToken = null
      auth.refreshToken = null
      navigateTo('/login')
      return null
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

let apiInstance: ReturnType<typeof $fetch.create> | null = null

export function useApi() {
  if (apiInstance) return apiInstance

  const config = useRuntimeConfig()

  apiInstance = $fetch.create({
    baseURL: config.public.apiBase,
    credentials: 'include',
    onRequest({ options }) {
      const accessToken = useCookie('access_token')
      if (accessToken.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${accessToken.value}`,
        }
      }
    },
    async onResponseError(context) {
      const { response, request, options } = context
      if (response.status !== 401) return

      // Don't try to refresh the refresh endpoint itself
      if (String(request).includes('/auth/refresh/') || String(request).includes('/auth/login/')) {
        return
      }

      // Already retrying this request? Bail out to prevent infinite loop.
      if ((options as any)._retried) return
      ;(options as any)._retried = true

      const newToken = await refreshToken()
      if (!newToken) return // refreshToken() already redirected to /login

      // Retry the original request with the new token
      return $fetch(request, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      })
    },

    onResponse({ response }) {
      // Global toast for non-2xx responses that aren't already handled
      if (response.status >= 500) {
        const { $toast } = useNuxtApp()
        $toast?.error?.('Server error. Please try again.')
      }
    },
  })

  return apiInstance
}

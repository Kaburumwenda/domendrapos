/**
 * useApi - Centralized API client with JWT auth and tenant resolution.
 */

interface ApiResponse<T = any> {
  data: T
  status: number
}

export function useApi() {
  const config = useRuntimeConfig()
  const accessToken = useCookie('access_token')
  const refreshToken = useCookie('refresh_token')

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      if (accessToken.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${accessToken.value}`,
        }
      }
    },
    async onResponseError({ response }) {
      if (response.status === 401) {
        // Try refresh
        if (refreshToken.value) {
          try {
            const refreshed = await $fetch(`${config.public.apiBase}/auth/refresh/`, {
              method: 'POST',
              body: { refresh: refreshToken.value },
            })
            accessToken.value = refreshed.access
            // Retry original request
            return $fetch(response.url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${refreshed.access}` } })
          } catch {
            accessToken.value = null
            refreshToken.value = null
            navigateTo('/login')
          }
        }
        navigateTo('/login')
      }
    },
  })

  return api
}

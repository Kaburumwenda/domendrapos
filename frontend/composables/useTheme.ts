import { computed, ref, watch } from 'vue'
import { useTheme as useVuetifyTheme } from 'vuetify'

const COOKIE_KEY = 'domendrapos-theme'
type ThemeMode = 'light' | 'dark'

// Singleton refs shared across all callers
const mode = ref<ThemeMode>('light')
let initialized = false

// Vuetify theme instance, captured once during init() (must run in a setup
// context).  Reused for all subsequent applies/toggles.
let vuetifyTheme: ReturnType<typeof useVuetifyTheme> | null = null

// SSR-safe cookie (Nuxt useCookie) — the single source of truth for the
// persisted preference.  Using a cookie (not localStorage) means the server
// render and the client render agree on the initial theme, avoiding a
// hydration class mismatch on .v-application.  Created inside init() so it
// runs in a setup/Nuxt context.
const themeCookieRef = ref<ReturnType<typeof useCookie<'light' | 'dark'>> | null>(null)

/**
 * Resolve the initial theme: stored cookie value, else the system preference
 * (client only).
 */
function resolveInitialMode(): ThemeMode {
  const cookie = themeCookieRef.value?.value
  if (cookie === 'light' || cookie === 'dark') return cookie
  if (import.meta.client && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

/**
 * Apply a theme mode:
 *  1. flips the `dark` class on <html> (consumed by auth/onboarding glass
 *     overrides and the theme.client.ts FOUC partner)
 *  2. switches Vuetify via the official useTheme().change() API, which
 *     applies `.v-theme--dark`/`.v-theme--light` and regenerates the theme
 *     stylesheet.  The previous `$vuetify.theme.global.name.value = next`
 *     assignment is deprecated (warns) and did not reliably flip the
 *     .v-application theme class.
 */
async function applyTheme(next: ThemeMode) {
  if (import.meta.client) {
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  if (vuetifyTheme) {
    try {
      await vuetifyTheme.change(next)
    } catch {
      vuetifyTheme.global.name.value = next
    }
  }
}

function init() {
  if (initialized) return
  initialized = true

  // SSR-safe cookie (Nuxt useCookie) — must be created in a setup/Nuxt
  // context, which init() runs in.  Stored as a ref so the watch handler
  // below can update it.
  try {
    themeCookieRef.value = useCookie<'light' | 'dark'>(COOKIE_KEY, {
      default: () => 'light',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
  } catch {
    themeCookieRef.value = null
  }

  // Capture the Vuetify theme instance once; must be called in setup context.
  try {
    vuetifyTheme = useVuetifyTheme()
  } catch {
    vuetifyTheme = null
  }

  mode.value = resolveInitialMode()
  applyTheme(mode.value)

  watch(mode, (next) => {
    // Persist to the cookie (SSR-safe) and keep <html>/.v-application in sync.
    if (themeCookieRef.value) themeCookieRef.value.value = next
    applyTheme(next)
  })
}

export function useTheme() {
  init()

  function toggle() {
    mode.value = mode.value === 'dark' ? 'light' : 'dark'
  }

  function setDark() {
    mode.value = 'dark'
  }

  function setLight() {
    mode.value = 'light'
  }

  return {
    mode,
    isDark: computed(() => mode.value === 'dark'),
    toggle,
    setDark,
    setLight,
  }
}

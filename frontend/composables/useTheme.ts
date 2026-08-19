import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'domendrapos-theme'
type ThemeMode = 'light' | 'dark'

// Singleton refs shared across all callers
const mode = ref<ThemeMode>('light')
let initialized = false

function applyTheme(next: ThemeMode) {
  if (import.meta.client) {
    // Toggle the class on <html> for any legacy CSS
    document.documentElement.classList.toggle('dark', next === 'dark')

    // Sync Vuetify theme
    const nuxtApp = useNuxtApp()
    const vuetifyTheme = nuxtApp.vueApp.config.globalProperties.$vuetify?.theme
    if (vuetifyTheme) {
      vuetifyTheme.global.name.value = next
    }
  }
}

function init() {
  if (initialized) return
  initialized = true

  // Read stored preference (or system preference on first load)
  let stored: ThemeMode | null = null
  if (import.meta.client) {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') {
      stored = saved
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      stored = 'dark'
    }
  }
  mode.value = stored ?? 'light'
  applyTheme(mode.value)

  watch(mode, (next) => {
    applyTheme(next)
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, next)
    }
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

// Apply persisted/system theme as early as possible to avoid FOUC.
// This only sets the <html> `dark` class (consumed by the auth/onboarding
// glass-card dark overrides and any legacy `.dark` CSS).  The Vuetify theme
// itself is initialised from the same preference in plugins/vuetify.ts (via
// the same cookie) and switched at runtime via composables/useTheme.ts
// (using Vuetify's official useTheme().change() API).
//
// The preference lives in a cookie (set by useTheme.ts) so that SSR and the
// client agree on the initial theme (no hydration class mismatch).  Here
// we read that cookie (or the system preference on first visit) and set the
// FOUC class before the app paints.
function readThemeCookie(): 'light' | 'dark' | null {
  const match = document.cookie.match(/(?:^|;\s*)domendrapos-theme=(light|dark)\b/)
  return match ? (match[1] as 'light' | 'dark') : null
}

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const saved = readThemeCookie()
  const prefersDark = !saved && window.matchMedia('(prefers-color-scheme: dark)').matches
  if (saved === 'dark' || prefersDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})

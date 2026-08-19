// Apply persisted/system theme as early as possible to avoid FOUC.
// This runs on the client before the app mounts.
export default defineNuxtPlugin(() => {
  const theme = useTheme()

  // Re-apply on client hydration to ensure the `dark` class is set
  if (import.meta.client) {
    const saved = localStorage.getItem('domendrapos-theme')
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
})

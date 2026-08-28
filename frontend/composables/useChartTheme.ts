export interface ChartThemeColors {
  primary: string
  success: string
  warning: string
  error: string
  info: string
  secondary: string
  surface: string
  onSurface: string
  grid: string
  foreColor: string
  muted: string
}

function rgbFromVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

export function useChartTheme() {
  // Vuetify exposes CSS variables as --v-theme-{name}
  const colors = computed<ChartThemeColors>(() => {
    const primary = rgbFromVar('--v-theme-primary', '52, 120, 246')
    const success = rgbFromVar('--v-theme-success', '76, 175, 80')
    const warning = rgbFromVar('--v-theme-warning', '255, 152, 0')
    const error = rgbFromVar('--v-theme-error', '239, 83, 80')
    const info = rgbFromVar('--v-theme-info', '33, 150, 243')
    const secondary = rgbFromVar('--v-theme-secondary', '124, 77, 255')
    const surface = rgbFromVar('--v-theme-surface', '255, 255, 255')
    const onSurface = rgbFromVar('--v-theme-on-surface', '0, 0, 0')

    const isDark = surface.split(',').reduce((sum, v) => sum + Number(v), 0) / 3 < 128
    const foreColor = `rgba(${onSurface}, ${isDark ? 0.95 : 0.88})`
    const grid = `rgba(${onSurface}, ${isDark ? 0.12 : 0.08})`
    const muted = `rgba(${onSurface}, ${isDark ? 0.7 : 0.6})`

    return {
      primary,
      success,
      warning,
      error,
      info,
      secondary,
      surface,
      onSurface,
      grid,
      foreColor,
      muted,
    }
  })

  const palette = computed(() => [
    `rgb(${colors.value.primary})`,
    `rgb(${colors.value.success})`,
    `rgb(${colors.value.warning})`,
    `rgb(${colors.value.error})`,
    `rgb(${colors.value.secondary})`,
    `rgb(${colors.value.info})`,
    '#10b981',
    '#f43f5e',
    '#6366f1',
    '#f59e0b',
  ])

  return {
    colors,
    palette,
  }
}

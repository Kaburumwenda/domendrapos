import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { md3 } from 'vuetify/blueprints'
import '@mdi/font/css/materialdesignicons.css'

export default defineNuxtPlugin((nuxtApp) => {
  // Resolve the initial theme from a cookie so the server and client agree
  // (avoids a hydration class mismatch on .v-application, which would
  // otherwise leave the v-theme--dark class un-applied in dev).  The cookie
  // is written by composables/useTheme.ts whenever the user toggles.
  const themeCookie = useCookie<'light' | 'dark'>('domendrapos-theme', {
    default: () => 'light',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  // Fall back to the system preference only when no cookie has been set yet.
  function initialTheme(): 'light' | 'dark' {
    if (themeCookie.value === 'light' || themeCookie.value === 'dark') return themeCookie.value
    if (import.meta.client && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
    return 'light'
  }

  const vuetify = createVuetify({
    components,
    directives,
    blueprint: md3,
    theme: {
      defaultTheme: initialTheme(),
      themes: {
        light: {
          dark: false,
          colors: {
            primary: '#3478f6',
            'primary-darken-1': '#1a5fd0',
            secondary: '#0d9488',
            accent: '#8b5cf6',
            background: '#f3f3f3',
            surface: '#ffffff',
            'surface-variant': '#f5f5f5',
            'on-surface': '#1a1a1a',
            'on-background': '#1a1a1a',
            error: '#c42b1c',
            warning: '#f59e0b',
            success: '#22c55e',
            info: '#3b82f6',
          },
        },
        dark: {
          dark: true,
          colors: {
            primary: '#4cc2ff',          // Win11 AccentCloud blue (brighter for dark bg)
            'primary-darken-1': '#3478f6',
            secondary: '#4fd9c4',
            accent: '#b4a0ff',
            background: '#1f1f1f',         // Mica base
            surface: '#2b2b2b',           // Card / acrylic layer
            'surface-variant': '#323232', // Elevated surface
            'on-surface': '#ffffff',
            'on-background': '#ffffff',
            error: '#ff99a4',
            warning: '#ffd166',
            success: '#6ad296',
            info: '#74c5ff',
          },
        },
      },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})

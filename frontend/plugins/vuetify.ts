import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { md3 } from 'vuetify/blueprints'
import '@mdi/font/css/materialdesignicons.css'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
    blueprint: md3,
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          dark: false,
          colors: {
            primary: '#3478f6',
            'primary-darken-1': '#1a5fd0',
            secondary: '#0d9488',
            accent: '#8b5cf6',
            background: '#f5f5f5',
            surface: '#ffffff',
            error: '#ef4444',
            warning: '#f59e0b',
            success: '#22c55e',
            info: '#3b82f6',
          },
        },
        dark: {
          dark: true,
          colors: {
            primary: '#3478f6',
            'primary-darken-1': '#1a5fd0',
            secondary: '#0d9488',
            accent: '#8b5cf6',
            background: '#1a1a1a',
            surface: '#202020',
            error: '#ef4444',
            warning: '#f59e0b',
            success: '#22c55e',
            info: '#3b82f6',
          },
        },
      },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})

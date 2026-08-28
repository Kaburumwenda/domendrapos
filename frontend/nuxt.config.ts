// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetifyVitePlugin from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  css: ['~/assets/css/main.css', 'vuetify/styles/main.css', '@mdi/font/css/materialdesignicons.css'],

  build: {
    transpile: ['vuetify'],
  },

  vite: {
    ssr: {
      noExternal: ['vuetify'],
    },
    plugins: [
      vuetifyVitePlugin({}),
    ],
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'DomendraPOS',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Multi-tenant SaaS Point-of-Sale platform' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
    pageTransition: { name: 'fade', mode: 'out-in' },
  },

  typescript: {
    strict: true,
  },

  routeRules: {
    '/api/**': { proxy: `${process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api'}/**` },
  },

  compatibilityDate: '2026-08-23',
})


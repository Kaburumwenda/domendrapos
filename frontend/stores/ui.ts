import { defineStore } from 'pinia'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

export interface GlobalError {
  title: string
  message: string
}

interface UIState {
  toasts: Toast[]
  globalLoading: boolean
  loadingMessage: string
  globalError: GlobalError | null
  sidebarCollapsed: boolean
}

export const useUiStore = defineStore('ui', {
  state: (): UIState => ({
    toasts: [],
    globalLoading: false,
    loadingMessage: '',
    globalError: null,
    sidebarCollapsed: false,
  }),

  getters: {
    hasToasts: (state) => state.toasts.length > 0,
    isLoading: (state) => state.globalLoading,
    error: (state) => state.globalError,
  },

  actions: {
    // ── Toasts ──────────────────────────────────────────
    addToast(message: string, type: Toast['type'] = 'info', duration = 3000) {
      const id = Math.random().toString(36).slice(2)
      this.toasts.push({ id, message, type, duration })
      if (duration > 0) {
        setTimeout(() => this.removeToast(id), duration)
      }
    },

    removeToast(id: string) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },

    success(message: string, duration?: number) {
      this.addToast(message, 'success', duration)
    },

    error(message: string, duration?: number) {
      this.addToast(message, 'error', duration ?? 5000)
    },

    info(message: string, duration?: number) {
      this.addToast(message, 'info', duration)
    },

    warning(message: string, duration?: number) {
      this.addToast(message, 'warning', duration)
    },

    clearToasts() {
      this.toasts = []
    },

    // ── Global loading overlay ───────────────────────────
    startLoading(message = '') {
      this.globalLoading = true
      this.loadingMessage = message
    },

    stopLoading() {
      this.globalLoading = false
      this.loadingMessage = ''
    },

    // ── Global error banner ──────────────────────────────
    setError(title: string, message: string) {
      this.globalError = { title, message }
    },

    clearError() {
      this.globalError = null
    },

    // ── Sidebar ──────────────────────────────────────────
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    setSidebar(collapsed: boolean) {
      this.sidebarCollapsed = collapsed
    },
  },
})

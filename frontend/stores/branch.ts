import { defineStore } from 'pinia'
import type { Branch } from '~/types/pos'

interface BranchState {
  branches: Branch[]
  branchId: number | null
  branchName: string
  loaded: boolean
  loading: boolean
}

const STORAGE_KEY = 'domendrapos_branch'

export const useBranchStore = defineStore('branch', {
  state: (): BranchState => ({
    branches: [],
    branchId: null,
    branchName: 'All Branches',
    loaded: false,
    loading: false,
  }),

  getters: {
    activeBranches: (state) => state.branches.filter(b => b.is_active),
    selectedBranch: (state) => state.branches.find(b => b.id === state.branchId) || null,
    branchOptions: (state) => [
      { id: null as number | null, name: 'All Branches', is_headquarters: false, is_active: true },
      ...state.branches.filter(b => b.is_active),
    ],
  },

  actions: {
    setBranch(id: number | null, name?: string) {
      this.branchId = id
      if (name !== undefined) {
        this.branchName = name
      } else {
        const br = this.branches.find(b => b.id === id)
        this.branchName = br?.name ?? (id === null ? 'All Branches' : 'Unknown')
      }
      if (import.meta.client) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: this.branchId, name: this.branchName }))
      }
    },

    clearBranch() {
      this.branchId = null
      this.branchName = 'All Branches'
      if (import.meta.client) {
        localStorage.removeItem(STORAGE_KEY)
      }
    },

    restoreFromStorage() {
      if (!import.meta.client) return
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw) as { id: number | null; name: string }
          this.branchId = parsed.id
          this.branchName = parsed.name || 'All Branches'
        }
      } catch {
        // ignore corrupt storage
      }
    },

    async loadBranches() {
      if (this.loading) return
      this.loading = true
      try {
        const data = await useApi()('/branches/')
        this.branches = (data.results || data) as Branch[]
        this.loaded = true

        // If nothing selected yet, pick HQ or first active branch
        if (!this.branchId && this.activeBranches.length > 0) {
          const hq = this.activeBranches.find(b => b.is_headquarters)
          const fallback = hq || this.activeBranches[0]
          this.setBranch(fallback.id, fallback.name)
        }
      } catch {
        this.branches = []
      } finally {
        this.loading = false
      }
    },

    async init() {
      this.restoreFromStorage()
      await this.loadBranches()
    },
  },
})

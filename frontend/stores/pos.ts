import { defineStore } from 'pinia'
import type { CartItem, CartDiscount, PaymentMethod, Branch, Customer } from '~/types/pos'

const CART_STORAGE_KEY = (userId: string | number) => `pos_cart_${userId}`

interface PersistedCart {
  cart: CartItem[]
  customerName: string
  customerPhone: string
  paymentMethod: PaymentMethod
  discount: CartDiscount
  branchId: number | null
  branchName: string
}

function loadPersistedCart(userId: string | number | null): Partial<PersistedCart> | null {
  if (!userId || !import.meta.client) return null
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY(userId))
    if (!raw) return null
    return JSON.parse(raw) as PersistedCart
  } catch {
    return null
  }
}

function persistCart(userId: string | number | null, data: PersistedCart) {
  if (!userId || !import.meta.client) return
  try {
    localStorage.setItem(CART_STORAGE_KEY(userId), JSON.stringify(data))
  } catch {
    // ignore quota errors
  }
}

function clearPersistedCart(userId: string | number | null) {
  if (!userId || !import.meta.client) return
  try {
    localStorage.removeItem(CART_STORAGE_KEY(userId))
  } catch {
    // ignore
  }
}

interface PosState {
  cart: CartItem[]
  customer: Customer | null
  customerName: string
  customerPhone: string
  paymentMethod: PaymentMethod
  discount: CartDiscount
  branchId: number | null
  branchName: string
  notes: string
  lastTransactionId: number | null
}

export const usePosStore = defineStore('pos', {
  state: (): PosState => {
    const base: PosState = {
      cart: [],
      customer: null,
      customerName: '',
      customerPhone: '',
      paymentMethod: 'cash',
      discount: { type: 'percentage', value: 0 },
      branchId: null,
      branchName: 'All Branches',
      notes: '',
      lastTransactionId: null,
    }
    // Restore cart from localStorage on client-side init
    if (import.meta.client) {
      const auth = useAuthStore()
      const userId = auth.user?.id
      if (userId) {
        const persisted = loadPersistedCart(userId)
        if (persisted) {
          base.cart = persisted.cart || []
          base.customerName = persisted.customerName || ''
          base.customerPhone = persisted.customerPhone || ''
          base.paymentMethod = persisted.paymentMethod || 'cash'
          base.discount = persisted.discount || { type: 'percentage', value: 0 }
          base.branchId = persisted.branchId ?? null
          base.branchName = persisted.branchName || 'All Branches'
        }
      }
    }
    return base
  },

  getters: {
    itemCount: (state) => state.cart.reduce((s, i) => s + i.qty, 0),
    uniqueCount: (state) => state.cart.length,

    lineSubtotals: (state) => {
      return state.cart.map((item) => item.price * item.qty - (item.discount || 0))
    },

    subtotal: (state) => {
      const raw = state.cart.reduce((s, i) => s + i.price * i.qty - (i.discount || 0), 0)
      return Math.round(raw * 100) / 100
    },

    discountAmount: (state) => {
      const sub = (state.cart as CartItem[]).reduce((s, i) => s + i.price * i.qty, 0)
      const raw = state.discount.type === 'percentage'
        ? sub * (state.discount.value / 100)
        : Math.min(state.discount.value, sub)
      return Math.round(raw * 100) / 100
    },

    taxableBase(): number {
      return Math.round((Math.max(0, this.subtotal - this.discountAmount) * 100)) / 100
    },

    taxAmount(state): number {
      const raw = state.cart.reduce((s, i) => {
        const lineBase = i.price * i.qty - (i.discount || 0)
        const lineAfterGlobal = lineBase * (1 - (this.discountAmount / (this.subtotal || 1)))
        return s + lineAfterGlobal * ((i.tax_rate || 0) / 100)
      }, 0)
      return Math.round(raw * 100) / 100
    },

    total(): number {
      return Math.round((Math.max(0, this.taxableBase + this.taxAmount) * 100)) / 100
    },

    totalSavings(): number {
      return this.discountAmount + this.cart.reduce((s, i) => s + (i.discount || 0), 0)
    },

    isEmpty: (state) => state.cart.length === 0,
  },

  actions: {
    addToCart(product: any) {
      const stockUnits = Number(product.quantity_on_hand ?? product.quantity ?? 0)
      const ipu = Number(product.items_per_unit || 1)
      // When unit contains multiple pieces, cart works in pieces; otherwise in units
      const maxStock = ipu > 1 ? Math.floor(stockUnits * ipu) : stockUnits
      const existing = this.cart.find((i) => i.id === product.id)
      if (existing) {
        if (existing.qty < maxStock) {
          existing.qty++
        } else {
          return false
        }
      } else {
        if (maxStock <= 0) return false
        const unitPrice = Number(product.retail_price || product.selling_price || 0)
        // Price per piece: divide unit price by items_per_unit for multi-piece products
        const piecePrice = ipu > 1 ? unitPrice / ipu : unitPrice
        this.cart.push({
          id: product.id,
          name: product.name,
          price: Math.round(piecePrice * 1000) / 1000,
          qty: 1,
          max: maxStock,
          sku: product.sku || '',
          tax_rate: Number(product.tax_rate || 0),
          image: product.image || null,
          discount: 0,
          unit: String(product.unit || 'each'),
          items_per_unit: ipu,
        })
      }
      this._persist()
      return true
    },

    incItem(index: number) {
      const item = this.cart[index]
      if (item && item.qty < item.max) item.qty++
      this._persist()
    },

    decItem(index: number) {
      if (this.cart[index]) {
        if (this.cart[index].qty > 1) {
          this.cart[index].qty--
        } else {
          this.removeItem(index)
        }
      }
      this._persist()
    },

    updateQty(index: number, qty: number) {
      const item = this.cart[index]
      if (!item) return
      if (qty < 1) { this.removeItem(index); return }
      item.qty = Math.min(qty, item.max)
      this._persist()
    },

    removeItem(index: number) {
      this.cart.splice(index, 1)
      this._persist()
    },

    setItemDiscount(index: number, amount: number) {
      if (this.cart[index]) {
        this.cart[index].discount = Math.max(0, Math.min(amount, this.cart[index].price * this.cart[index].qty))
      }
    },

    clearCart() {
      this.cart = []
      this.customer = null
      this.customerName = ''
      this.customerPhone = ''
      this.discount = { type: 'percentage', value: 0 }
      this.notes = ''
      this._persist()
    },

    setCustomer(customer: Customer | null) {
      this.customer = customer
      this.customerName = customer ? customer.full_name : this.customerName
      this.customerPhone = customer ? customer.phone : this.customerPhone
      this._persist()
    },

    setPaymentMethod(method: PaymentMethod) {
      this.paymentMethod = method
      this._persist()
    },

    setBranch(id: number, name: string) {
      this.branchId = id
      this.branchName = name
      this._persist()
    },

    resumeFromParked(items: CartItem[], customerName: string, customerPhone: string) {
      this.cart = items.map((i: CartItem) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
        max: i.max || 999,
        sku: i.sku || '',
        tax_rate: i.tax_rate || 0,
        image: i.image || null,
        discount: i.discount || 0,
        unit: i.unit || 'each',
        items_per_unit: i.items_per_unit || 1,
      }))
      this.customerName = customerName || ''
      this.customerPhone = customerPhone || ''
      this._persist()
    },

    /** Restore cart from localStorage (called after auth is ready) */
    restoreCart() {
      if (!import.meta.client) return
      const auth = useAuthStore()
      const userId = auth.user?.id
      if (!userId) return
      const persisted = loadPersistedCart(userId)
      if (!persisted) return
      this.cart = persisted.cart || []
      this.customerName = persisted.customerName || ''
      this.customerPhone = persisted.customerPhone || ''
      this.paymentMethod = persisted.paymentMethod || 'cash'
      this.discount = persisted.discount || { type: 'percentage', value: 0 }
      this.branchId = persisted.branchId ?? null
      this.branchName = persisted.branchName || 'All Branches'
    },

    /** Persist current cart+state to localStorage (scoped by user ID) */
    _persist() {
      if (!import.meta.client) return
      const auth = useAuthStore()
      const userId = auth.user?.id
      if (!userId) return
      persistCart(userId, {
        cart: this.cart,
        customerName: this.customerName,
        customerPhone: this.customerPhone,
        paymentMethod: this.paymentMethod,
        discount: this.discount,
        branchId: this.branchId,
        branchName: this.branchName,
      })
    },

    /** Clear persisted cart for a specific user (used on logout) */
    clearForUser(userId: number | string | null) {
      clearPersistedCart(userId)
    },

    /** Sync direct v-model mutations (customerName, discount, etc.) to localStorage */
    syncPersist() {
      this._persist()
    },
  },
})

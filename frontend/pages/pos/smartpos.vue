<template>
  <div class="smart-pos-shell">
    <!-- ===== Top bar ===== -->
    <header class="smart-topbar">
      <div class="smart-brand">
        <div class="smart-brand__mark">
          <v-icon size="22" color="primary">mdi-barcode-scan</v-icon>
        </div>
        <div class="smart-brand__text">
          <h1 class="smart-brand__title">Smart POS</h1>
          <p class="smart-brand__meta">Lane 01 · {{ nowLabel }}</p>
        </div>
      </div>

      <!-- Barcode scan bar -->
      <div class="smart-search-wrap">
        <div class="smart-search" :class="{ 'smart-search--ready': scannerReady }">
          <v-icon size="20" class="smart-search__icon">mdi-magnify</v-icon>
          <input
            ref="scanRef"
            v-model="scanInput"
            class="smart-search__input"
            placeholder="Scan barcode or type SKU / name…"
            @keydown.enter.prevent="onScan"
            @input="onScanInput($event)"
            @focus="showSuggestions = true"
            @blur="hideSuggestions"
          />
          <v-btn
            v-if="scanInput"
            size="x-small"
            variant="text"
            icon="mdi-close"
            class="smart-search__clear"
            @click="scanInput = ''; suggestions = []"
          />
          <v-chip v-if="scannerReady && !scanInput" size="x-small" color="success" variant="flat" class="smart-search__chip">
            <v-icon size="12" start>mdi-check-circle</v-icon>
            Ready
          </v-chip>

          <!-- Live suggestions dropdown -->
          <div v-if="showSuggestions && suggestions.length > 0" class="scan-suggestions">
            <button
              v-for="p in suggestions"
              :key="p.id"
              type="button"
              class="scan-suggestion"
              :disabled="stockOf(p) <= 0"
              @mousedown.prevent="pickSuggestion(p)"
            >
              <div class="scan-suggestion__thumb">
                <img v-if="p.image" :src="p.image" alt="" />
                <v-icon v-else size="16" :color="stockOf(p) <= 0 ? 'grey' : 'primary'">mdi-package-variant-closed</v-icon>
              </div>
              <div class="scan-suggestion__body">
                <div class="scan-suggestion__name">{{ p.name }}</div>
                <div class="scan-suggestion__meta">{{ p.sku || '—' }} · Stock {{ stockOf(p) }}{{ pieceStockLabel(p) }}</div>
              </div>
              <div v-if="p.barcode" class="scan-suggestion__barcode">{{ p.barcode }}</div>
              <div class="scan-suggestion__price">{{ formatMoney(piecePrice(p)) }}<template v-if="Number(p.items_per_unit) > 1"> /pc</template></div>
            </button>
          </div>
          <div v-if="showSuggestions && scanInput && suggestions.length === 0 && products.length > 0" class="scan-suggestions scan-suggestions--empty">
            <div class="scan-suggestion__empty">No products match "{{ scanInput }}"</div>
          </div>
        </div>
      </div>

      <div class="smart-topbar__actions">
        <div class="smart-stat d-none d-md-flex">
          <span class="smart-stat__label">Today</span>
          <span class="smart-stat__value">{{ todayStats.count }} sales · {{ formatMoney(todayStats.revenue) }}</span>
        </div>

        <div class="smart-cashier d-none d-sm-flex">
          <v-avatar color="primary" size="34" class="mr-2">
            <span class="text-caption font-weight-bold text-white">{{ cashierInitials }}</span>
          </v-avatar>
          <div class="smart-cashier__text">
            <div class="smart-cashier__name">{{ cashierShort }}</div>
            <div class="smart-cashier__role">{{ auth.role }}</div>
          </div>
        </div>

        <v-btn to="/pos/parked" variant="tonal" color="warning" rounded="lg" size="small" class="text-none smart-hold-btn" :disabled="parkedCount === 0">
          <v-icon start size="18">mdi-pause-circle-outline</v-icon>
          Hold
          <v-badge v-if="parkedCount > 0" :content="parkedCount" color="warning" inline class="ml-2" />
        </v-btn>
      </div>
    </header>

    <!-- ===== Main area ===== -->
    <div class="smart-grid">
      <!-- ===== Left: current order / cart ===== -->
      <section class="smart-order">
        <!-- Order header -->
        <div class="smart-order-header">
          <div class="smart-order-tile">
            <div class="smart-order-tile__label">Order</div>
            <div class="smart-order-tile__value">{{ orderRef }}</div>
          </div>
          <div class="smart-order-tile smart-order-tile--grow">
            <div class="smart-order-tile__label">Customer</div>
            <input
              v-model="pos.customerName"
              class="smart-order-tile__input"
              placeholder="Walk-in customer"
              @input="onCustomerInput"
            />
          </div>
          <div class="smart-order-tile smart-order-tile--right">
            <div class="smart-order-tile__label">Items</div>
            <div class="smart-order-tile__value">{{ pos.itemCount }}</div>
          </div>
        </div>

        <!-- Cart table -->
        <div class="smart-cart-table">
          <div v-if="!pos.isEmpty" class="smart-cart-rows">
            <transition-group name="smart-row">
              <article v-for="(item, i) in pos.cart" :key="item.id" class="smart-cart-item" :class="{ 'smart-cart-item--alt': i % 2 === 0 }">
                <div class="smart-cart-item__main">
                  <div class="smart-cart-item__thumb">
                    <img v-if="item.image" :src="item.image" :alt="item.name" />
                    <v-icon v-else size="18" color="primary">mdi-package-variant-closed</v-icon>
                  </div>
                  <div class="smart-cart-item__info">
                    <div class="smart-cart-item__title">{{ item.name }}</div>
                    <div class="smart-cart-item__meta">{{ item.sku || '—' }} · {{ formatMoney(item.price) }} each<template v-if="item.items_per_unit > 1"> · {{ item.qty }} pcs ({{ (item.qty / item.items_per_unit).toFixed(2) }} {{ item.unit }})</template></div>
                  </div>
                </div>
                <div class="smart-cart-item__controls">
                  <div class="smart-qty">
                    <button type="button" class="smart-qty__btn" :disabled="item.qty <= 1" @click="pos.decItem(i)">
                      <v-icon size="14">mdi-minus</v-icon>
                    </button>
                    <input
                      :value="item.qty"
                      type="number"
                      min="1"
                      :max="item.max"
                      class="smart-qty__input"
                      @change="onQtyChange(i, $event)"
                    />
                    <button type="button" class="smart-qty__btn smart-qty__btn--plus" :disabled="item.qty >= item.max" @click="pos.incItem(i)">
                      <v-icon size="14">mdi-plus</v-icon>
                    </button>
                  </div>
                  <div class="smart-cart-item__total">{{ formatMoney(item.price * item.qty) }}</div>
                  <button type="button" class="smart-cart-item__del" @click="pos.removeItem(i)">
                    <v-icon size="16">mdi-close</v-icon>
                  </button>
                </div>
              </article>
            </transition-group>
          </div>

          <!-- empty state -->
          <div v-else class="smart-cart-empty">
            <div class="smart-cart-empty__card">
              <div class="smart-cart-empty__ring">
                <v-icon size="40" color="primary">mdi-barcode-scan</v-icon>
              </div>
              <div class="smart-cart-empty__title">Ready to scan</div>
              <p class="smart-cart-empty__body">Scan a barcode, type a name or SKU to add your first item.</p>
              <div class="smart-keyhints">
                <div class="smart-keyhint"><kbd>Enter</kbd><span>Add</span></div>
                <div class="smart-keyhint"><kbd>F2</kbd><span>Search</span></div>
                <div class="smart-keyhint"><kbd>F9</kbd><span>Pay</span></div>
                <div class="smart-keyhint"><kbd>F4</kbd><span>Park</span></div>
                <div class="smart-keyhint"><kbd>Esc</kbd><span>Void</span></div>
              </div>
              <div v-if="parkedCount > 0" class="smart-parked-reminder">
                <v-icon size="18" color="warning">mdi-pause-circle</v-icon>
                <span>{{ parkedCount }} parked sale{{ parkedCount === 1 ? '' : 's' }}</span>
                <v-btn to="/pos/parked" variant="tonal" size="small" color="warning" rounded="lg" class="text-none">View</v-btn>
              </div>
            </div>
          </div>
        </div>

        <!-- Totals strip -->
        <div class="smart-totals">
          <div class="smart-totals__row"><span>Subtotal</span><span>{{ formatMoney(pos.subtotal) }}</span></div>
          <div class="smart-totals__row smart-totals__row--discount">
            <span>Discount</span>
            <span>- {{ formatMoney(pos.discountAmount) }}</span>
          </div>
          <div class="smart-totals__row"><span>Tax</span><span>{{ formatMoney(pos.taxAmount) }}</span></div>
          <div class="smart-totals__row smart-totals__row--total">
            <span>Total</span>
            <span>{{ formatMoney(pos.total) }}</span>
          </div>
        </div>
      </section>

      <!-- ===== Right: side actions ===== -->
      <aside class="smart-side">
        <!-- Payment methods -->
        <div class="smart-side-section">
          <div class="smart-side-section__title">Payment Method</div>
          <div class="smart-pay-grid">
            <button
              v-for="opt in paymentOptions"
              :key="opt.value"
              type="button"
              class="smart-pay-btn"
              :class="{ 'smart-pay-btn--active': pos.paymentMethod === opt.value }"
              @click="pos.setPaymentMethod(opt.value)"
            >
              <div class="smart-pay-btn__icon"><v-icon size="22">{{ opt.icon }}</v-icon></div>
              <div class="smart-pay-btn__text">
                <div class="smart-pay-btn__name">{{ opt.label }}</div>
                <div class="smart-pay-btn__hint">{{ opt.hint }}</div>
              </div>
              <v-icon size="14" class="smart-pay-btn__check">{{ pos.paymentMethod === opt.value ? 'mdi-check-circle' : 'mdi-circle-outline' }}</v-icon>
            </button>
          </div>
        </div>

        <!-- Quick discount -->
        <div class="smart-side-section">
          <div class="smart-side-section__title">QUICK DISCOUNT</div>
          <div class="smart-quick-disc">
            <button
              v-for="d in quickDiscounts"
              :key="d"
              type="button"
              class="smart-quick-disc__btn"
              :class="{ 'smart-quick-disc__btn--active': quickDisc === d }"
              @click="applyDiscount(d)"
            >
              {{ d === 0 ? 'None' : `${d}%` }}
            </button>
          </div>
        </div>

        <!-- Sale actions -->
        <div class="smart-side-section">
          <div class="smart-side-section__title">SALE ACTIONS</div>
          <div class="smart-actions">
            <v-btn variant="tonal" color="warning" rounded="lg" prepend-icon="mdi-pause" class="text-none" :disabled="pos.isEmpty" @click="holdDialog = true">
              Hold
            </v-btn>
            <v-btn variant="tonal" color="info" rounded="lg" prepend-icon="mdi-play" class="text-none" :to="'/pos/parked'">Resume</v-btn>
            <v-btn variant="tonal" color="error" rounded="lg" prepend-icon="mdi-close" class="text-none" :disabled="pos.isEmpty" @click="voidCart">
              Void
            </v-btn>
          </div>
        </div>

        <!-- PAY NOW -->
        <button
          type="button"
          class="smart-pay-now"
          :class="{ 'smart-pay-now--disabled': pos.isEmpty || checkingOut }"
          :disabled="pos.isEmpty || checkingOut"
          @click="startCheckout"
        >
          <div class="smart-pay-now__inner">
            <div class="smart-pay-now__left">
              <div class="smart-pay-now__icon">
                <v-icon size="22" color="white">mdi-cash-register</v-icon>
              </div>
              <div>
                <div class="smart-pay-now__label">Charge</div>
                <div class="smart-pay-now__hint">{{ itemCountLabel }}</div>
              </div>
            </div>
            <div class="smart-pay-now__amount">{{ formatMoney(pos.total) }}</div>
          </div>
        </button>
      </aside>
    </div>

    <!-- ===== Checkout Dialog ===== -->
    <v-dialog v-model="checkoutDialog" max-width="600" persistent>
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-cash-register</v-icon>
          Complete Payment
          <v-spacer />
          <v-chip size="small" variant="tonal" color="primary">
            <v-icon size="14" start>{{ paymentOptions.find(o => o.value === pos.paymentMethod)?.icon }}</v-icon>
            {{ paymentOptions.find(o => o.value === pos.paymentMethod)?.label }}
          </v-chip>
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-4">
          <div class="checkout-total-banner">
            <span class="text-body-2 text-medium-emphasis">Total Due</span>
            <span class="checkout-total-banner__value">{{ formatMoney(pos.total) }}</span>
            <div class="checkout-total-banner__method">
              <v-icon size="14">{{ paymentOptions.find(o => o.value === pos.paymentMethod)?.icon }}</v-icon>
              <span>{{ paymentOptions.find(o => o.value === pos.paymentMethod)?.label }}</span>
            </div>
          </div>

          <v-text-field
            v-model="pos.customerName"
            label="Customer"
            placeholder="Walk-in customer"
            density="comfortable"
            variant="outlined"
            rounded="lg"
            prepend-inner-icon="mdi-account-outline"
            clearable
            class="mb-2"
          />
          <v-text-field
            v-model="pos.customerPhone"
            label="Phone"
            placeholder="Optional"
            density="comfortable"
            variant="outlined"
            rounded="lg"
            prepend-inner-icon="mdi-phone-outline"
            class="mb-2"
          />

          <template v-if="pos.paymentMethod === 'cash'">
            <p class="text-subtitle-2 font-weight-medium mb-2">Cash Received</p>
            <div class="quick-cash-grid mb-2">
              <v-btn v-for="amt in quickCashOptions" :key="amt" variant="tonal" size="small" rounded="lg" @click="tendered = amt">
                {{ formatMoney(amt) }}
              </v-btn>
            </div>
            <v-text-field
              v-model.number="tendered"
              label="Amount received"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              type="number"
              :prefix="currencySymbol"
              class="mb-2"
            />
            <div class="change-row" :class="{ 'change-row--positive': change > 0 }">
              <span class="text-body-2">Change</span>
              <span class="text-h6 font-weight-bold">{{ formatMoney(Math.max(0, change)) }}</span>
            </div>
          </template>

          <template v-if="pos.paymentMethod === 'mpesa'">
            <v-text-field
              v-model="mpesaPhone"
              label="Customer M-Pesa phone (optional)"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              prepend-inner-icon="mdi-cellphone"
              placeholder="07XX XXX XXX"
            />
            <v-alert type="info" variant="tonal" density="compact" class="mt-2" rounded="lg">
              Confirm payment was received before completing the sale.
            </v-alert>
          </template>

          <template v-if="pos.paymentMethod === 'card'">
            <v-text-field
              v-model="cardRef"
              label="Card reference / last 4 digits"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              prepend-inner-icon="mdi-credit-card-outline"
              placeholder="1234"
            />
          </template>

          <template v-if="pos.paymentMethod === 'insurance'">
            <v-text-field
              v-model="insuranceProvider"
              label="Insurance provider"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              prepend-inner-icon="mdi-shield-account-outline"
              placeholder="Provider name"
            />
            <v-text-field v-model="insuranceMember" label="Member number" density="comfortable" variant="outlined" rounded="lg" class="mt-2" />
          </template>

          <template v-if="pos.paymentMethod === 'credit'">
            <v-text-field v-model="creditDueDate" label="Due date" type="date" density="comfortable" variant="outlined" rounded="lg" class="mt-2" />
            <v-text-field
              v-model.number="creditPartial"
              label="Partial payment (optional)"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              class="mt-2"
              type="number"
              min="0"
              :prefix="currencySymbol"
            />
            <v-alert type="info" variant="tonal" density="compact" class="mt-2" rounded="lg">
              Balance on credit: {{ formatMoney(Math.max(0, pos.total - (creditPartial || 0))) }}
            </v-alert>
          </template>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-btn variant="text" @click="checkoutDialog = false">Cancel</v-btn>
          <v-spacer />
          <v-btn
            variant="flat"
            color="primary"
            size="large"
            rounded="xl"
            :loading="checkingOut"
            :disabled="!canCompleteCheckout"
            @click="completeCheckout"
          >
            <v-icon start>mdi-check-circle</v-icon>
            Complete Sale
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== Hold Dialog ===== -->
    <v-dialog v-model="holdDialog" max-width="500">
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold">
          <v-icon color="warning" class="mr-2">mdi-pause-circle</v-icon>
          Hold Sale
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-4">
          <v-text-field v-model="holdCustomer" label="Customer name" density="compact" variant="outlined" rounded="lg" />
          <v-text-field v-model="holdPhone" label="Phone (optional)" density="compact" variant="outlined" rounded="lg" class="mt-2" />
          <v-textarea v-model="holdNotes" label="Notes (optional)" density="compact" variant="outlined" rounded="lg" class="mt-2" rows="2" />
          <v-alert type="info" variant="tonal" class="mt-2" rounded="lg">
            <div class="d-flex justify-space-between">
              <span>Items: {{ pos.itemCount }}</span>
              <span>Total: {{ formatMoney(pos.total) }}</span>
            </div>
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-btn variant="text" @click="holdDialog = false">Cancel</v-btn>
          <v-spacer />
          <v-btn variant="flat" color="warning" rounded="xl" @click="confirmHold">Hold Sale</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== Receipt Dialog ===== -->
    <v-dialog v-model="receiptDialog" max-width="420">
      <v-card rounded="xl">
        <div class="receipt-success-header">
          <v-avatar color="success" size="64"><v-icon size="32" color="white">mdi-check</v-icon></v-avatar>
          <h3 class="text-h6 font-weight-bold mt-2">Sale Completed</h3>
          <p class="text-caption text-medium-emphasis">{{ lastTransaction?.transaction_number }}</p>
        </div>
        <v-divider />
        <v-card-text class="pa-0">
          <PosReceipt
            v-if="lastTransaction"
            :number="lastTransaction.transaction_number"
            :items="lastTransaction.items"
            :subtotal="lastTransaction.subtotal"
            :discount="lastTransaction.discount"
            :item-discounts="0"
            :tax="lastTransaction.tax"
            :total="lastTransaction.total"
            :payment-method="lastTransaction.payment_method"
            :tendered="lastTransaction.tendered"
            :change="lastTransaction.change"
            :cashier-name="auth.fullName"
            :customer-name="lastTransaction.customer_name"
            :customer-phone="lastTransaction.customer_phone"
            :branch-name="pos.branchName"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-btn variant="tonal" rounded="xl" prepend-icon="mdi-printer" @click="printReceipt">Print</v-btn>
          <v-spacer />
          <v-btn variant="flat" color="primary" rounded="xl" @click="newSale">New Sale</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { PosProduct, ParkedSale, PaymentMethod } from '~/types/pos'

definePageMeta({ middleware: 'auth' })

const pos = usePosStore()
const auth = useAuthStore()
const { currency, datetime } = useFormat()
const toast = useToast()
const format = useFormat()

// Persist cart whenever store changes (covers v-model mutations like discount, customerName, etc.)
watch(() => pos.$state, () => pos.syncPersist(), { deep: true })

const currencySymbol = computed(() => auth.currencySymbol)
const cashierShort = computed(() => {
  const name = auth.fullName
  return name ? name.split(' ')[0].toUpperCase() : '—'
})

const cashierInitials = computed(() => {
  const name = auth.fullName
  if (!name) return '—'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
})

const itemCountLabel = computed(() => {
  const n = pos.itemCount
  return `${n} item${n === 1 ? '' : 's'}`
})

const nowLabel = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) +
  ' · ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })

function formatMoney(v: number | string) { return currency(Number(v || 0)) }

// ===== Order ref =====
const orderRef = ref(String(Date.now()).slice(-5) + Math.floor(Math.random() * 90 + 10))

// ===== Scanner =====
const scanRef = ref<HTMLInputElement | null>(null)
const scanInput = ref('')
const scannerReady = ref(true)
const showSuggestions = ref(false)
const suggestions = ref<PosProduct[]>([])

const products = ref<PosProduct[]>([])

function onScanInput(event?: Event) {
  const val = event ? (event.target as HTMLInputElement).value : scanInput.value
  const q = val.trim().toLowerCase()
  if (q) scanInput.value = val
  if (!q) {
    suggestions.value = []
    return
  }
  // Live filter by barcode, SKU, or name
  suggestions.value = products.value
    .filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q) ||
      (p.barcode || '').toLowerCase().includes(q)
    )
    .slice(0, 8)
  showSuggestions.value = true
}

function hideSuggestions() {
  setTimeout(() => { showSuggestions.value = false }, 150)
}

function pickSuggestion(p: PosProduct) {
  addToCart(p)
  toast.success(`${p.name} added`)
  scanInput.value = ''
  suggestions.value = []
  showSuggestions.value = false
  scanRef.value?.focus()
}

function onScan() {
  const q = scanInput.value.trim()
  if (!q) return
  // Exact barcode match
  let match = products.value.find(p => p.barcode && p.barcode.toLowerCase() === q.toLowerCase())
  // SKU match
  if (!match) match = products.value.find(p => p.sku && p.sku.toLowerCase() === q.toLowerCase())
  // Name exact match
  if (!match) match = products.value.find(p => (p.name || '').toLowerCase() === q.toLowerCase())
  // Name starts-with
  if (!match) match = products.value.find(p => (p.name || '').toLowerCase().startsWith(q.toLowerCase()))
  // Name contains
  if (!match) match = products.value.find(p => (p.name || '').toLowerCase().includes(q.toLowerCase()))

  if (match) {
    addToCart(match)
    toast.success(`${match.name} added`)
  } else {
    toast.error(`No product found for "${q}"`)
  }
  scanInput.value = ''
  suggestions.value = []
}

// ===== Branches =====
const branches = ref<any[]>([])

async function loadBranches() {
  try {
    const data = await useApi()('/branches/')
    branches.value = data.results || data
    if (branches.value.length > 0 && !pos.branchId) {
      const hq = branches.value.find((b: any) => b.is_headquarters) || branches.value[0]
      pos.setBranch(hq.id, hq.name)
    }
  } catch { /* ignore */ }
}

// ===== Products =====
async function loadProducts() {
  try {
    const params = new URLSearchParams({ page_size: '5000', is_active: 'true', is_sellable: 'true', ordering: 'name' })
    const data = await useApi()(`/products/?${params}`)
    products.value = data.results || data
  } catch { /* ignore */ }
}

function stockOf(p: PosProduct) { return Number(p.quantity_on_hand ?? p.total_quantity ?? 0) }

function pieceStockLabel(p: PosProduct) {
  const n = Number(p.items_per_unit || 1)
  return n > 1 ? ` (${Math.floor(stockOf(p) * n)} pcs)` : ''
}
function piecePrice(p: PosProduct) {
  const n = Number(p.items_per_unit || 1)
  const unitPrice = Number(p.retail_price || 0)
  return n > 1 ? unitPrice / n : unitPrice
}

function addToCart(p: PosProduct) {
  if (stockOf(p) <= 0) {
    toast.error('Item is out of stock')
    return
  }
  const ok = pos.addToCart(p)
  if (!ok) toast.warning('No more stock available')
}

function onQtyChange(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const qty = parseInt(input.value, 10)
  if (isNaN(qty) || qty < 1) {
    input.value = String(pos.cart[index]?.qty ?? 1)
    return
  }
  pos.updateQty(index, qty)
  input.value = String(pos.cart[index]?.qty ?? qty)
}

// ===== Payment =====
const paymentOptions: { value: PaymentMethod; label: string; icon: string; hint: string }[] = [
  { value: 'cash', label: 'Cash', icon: 'mdi-cash', hint: 'Notes & coins' },
  { value: 'mpesa', label: 'M-Pesa', icon: 'mdi-cellphone', hint: 'Mobile money' },
  { value: 'card', label: 'Card', icon: 'mdi-credit-card', hint: 'Visa / Mastercard' },
  { value: 'insurance', label: 'Insurance', icon: 'mdi-shield-account', hint: 'Approved schemes' },
  { value: 'credit', label: 'Credit', icon: 'mdi-account-cash', hint: 'Customer account' },
]

// ===== Quick discount =====
const quickDiscounts = [0, 5, 10, 15, 20]
const quickDisc = ref(0)

function applyDiscount(pct: number) {
  quickDisc.value = pct
  pos.discount = { type: 'percentage', value: pct }
}

// ===== Void cart =====
function voidCart() {
  pos.clearCart()
  quickDisc.value = 0
  orderRef.value = String(Date.now()).slice(-5) + Math.floor(Math.random() * 90 + 10)
  toast.info('Cart voided')
}

// ===== Checkout flow =====
const checkoutDialog = ref(false)
const checkingOut = ref(false)
const tendered = ref(0)
const mpesaPhone = ref('')
const cardRef = ref('')
const insuranceProvider = ref('')
const insuranceMember = ref('')
const creditDueDate = ref('')
const creditPartial = ref(0)

const quickCashOptions = computed(() => {
  const t = pos.total
  return [Math.ceil(t), Math.ceil(t / 100) * 100, Math.ceil(t / 500) * 500, Math.ceil(t / 1000) * 1000]
})

const change = computed(() => (tendered.value || 0) - pos.total)

const canCompleteCheckout = computed(() => {
  if (pos.paymentMethod === 'cash') return tendered.value >= pos.total
  if (pos.paymentMethod === 'credit') return pos.customerName.length > 0
  return true
})

function startCheckout() {
  if (pos.isEmpty) return
  tendered.value = 0
  mpesaPhone.value = pos.customerPhone || ''
  cardRef.value = ''
  insuranceProvider.value = ''
  insuranceMember.value = ''
  creditDueDate.value = ''
  creditPartial.value = 0
  checkoutDialog.value = true
}

const lastTransaction = ref<{
  transaction_number: string
  created_at: string
  items: { name: string; qty: number; price: number }[]
  subtotal: number
  discount: number
  item_discounts: number
  tax: number
  total: number
  payment_method: PaymentMethod
  tendered: number | null
  change: number | null
  customer_name: string
  customer_phone: string
} | null>(null)

async function completeCheckout() {
  if (!canCompleteCheckout.value) return
  checkingOut.value = true
  try {
    // Ensure branch is set before posting
    if (!pos.branchId) {
      await loadBranches()
      if (!pos.branchId) {
        toast.error('No branch available. Please contact support.')
        return
      }
    }

    let paymentRef = ''
    if (pos.paymentMethod === 'mpesa') paymentRef = `M-Pesa: ${mpesaPhone.value}`
    else if (pos.paymentMethod === 'card') paymentRef = `Card: ${cardRef.value}`
    else if (pos.paymentMethod === 'insurance') paymentRef = `Insurance: ${insuranceProvider.value} / ${insuranceMember.value}`
    else if (pos.paymentMethod === 'credit') paymentRef = `Due: ${creditDueDate.value} / Partial: ${creditPartial.value}`

    const round2 = (v: number) => Math.round((Number(v) || 0) * 100) / 100
    const round3 = (v: number) => Math.round((Number(v) || 0) * 1000) / 1000
    const body = {
      branch: pos.branchId,
      customer_name: pos.customerName || 'Walk-in',
      customer_phone: pos.customerPhone || '',
      subtotal: round2(pos.subtotal),
      discount: round2(pos.discountAmount),
      tax: round2(pos.taxAmount),
      total: round2(pos.total),
      payment_method: pos.paymentMethod,
      payment_reference: paymentRef,
      status: 'completed',
      ...(pos.paymentMethod === 'credit'
        ? {
            due_date: creditDueDate.value || null,
            partial_payment: round2(creditPartial.value || 0),
          }
        : {}),
      items: pos.cart.map(i => ({
        product: i.id,
        product_name: i.name,
        // Convert piece qty to unit qty for stock deduction when items_per_unit > 1
        quantity: round3(i.items_per_unit > 1 ? i.qty / i.items_per_unit : i.qty),
        unit_price: round2(i.price),
        line_total: round2(Number(i.price) * Number(i.qty)),
      })),
    }

    const res = await useApi()('/pos/transactions/', { method: 'POST', body })

    lastTransaction.value = {
      transaction_number: res.transaction_number,
      created_at: res.created_at,
      items: [...pos.cart.map(i => ({ name: i.name, qty: i.qty, price: i.price }))],
      subtotal: pos.subtotal,
      discount: pos.discountAmount,
      item_discounts: 0,
      tax: pos.taxAmount,
      total: pos.total,
      payment_method: pos.paymentMethod,
      tendered: pos.paymentMethod === 'cash' ? tendered.value : null,
      change: pos.paymentMethod === 'cash' ? Math.max(0, change.value) : null,
      customer_name: pos.customerName,
      customer_phone: pos.customerPhone,
    }

    pos.clearCart()
    checkoutDialog.value = false
    receiptDialog.value = true
    quickDisc.value = 0
    orderRef.value = String(Date.now()).slice(-5) + Math.floor(Math.random() * 90 + 10)
    await Promise.all([loadProducts(), loadTodayStats(), loadParkedCount(), loadShift()])
  } catch (e: any) {
    const data = e?.data || e?.response?._data || {}
    const msg = data.detail || Object.values(data).flat().join(', ') || 'Checkout failed'
    toast.error(typeof msg === 'string' ? msg : 'Checkout failed')
  } finally {
    checkingOut.value = false
  }
}

// ===== Receipt =====
const receiptDialog = ref(false)

function newSale() {
  receiptDialog.value = false
  lastTransaction.value = null
  pos.clearCart()
  quickDisc.value = 0
  orderRef.value = String(Date.now()).slice(-5) + Math.floor(Math.random() * 90 + 10)
}

function printReceipt() {
  const receiptEl = document.querySelector('.receipt')
  if (!receiptEl) return
  const win = window.open('', '_blank', 'width=400,height=600')
  if (!win) return
  win.document.write(`<html><head><title>Receipt</title><style>body{font-family:monospace;margin:0;padding:20px;}${document.querySelector('style[scoped]')?.textContent || ''}</style></head><body>${receiptEl.outerHTML}</body></html>`)
  win.document.close()
  setTimeout(() => { win.print() }, 250)
}

// ===== Hold / Park =====
const holdDialog = ref(false)
const holdCustomer = ref('')
const holdPhone = ref('')
const holdNotes = ref('')

async function confirmHold() {
  try {
    await useApi()('/pos/parked-sales/', {
      method: 'POST',
      body: {
        branch: pos.branchId,
        customer_name: holdCustomer.value || pos.customerName || 'Walk-in',
        customer_phone: holdPhone.value || pos.customerPhone || '',
        notes: holdNotes.value,
        items_data: pos.cart,
        total: pos.total,
      },
    })
    pos.clearCart()
    holdDialog.value = false
    holdCustomer.value = ''
    holdPhone.value = ''
    holdNotes.value = ''
    quickDisc.value = 0
    toast.success('Sale parked')
    await loadParkedCount()
  } catch {
    toast.error('Failed to park sale')
  }
}

// ===== Parked sales =====
const parkedCount = ref(0)

async function loadParkedCount() {
  try {
    const data = await useApi()('/pos/parked-sales/?page_size=1')
    parkedCount.value = data.count || (data.results || data).length
  } catch { /* ignore */ }
}

// ===== Today stats =====
const todayStats = ref({ count: 0, revenue: 0 })

async function loadTodayStats() {
  try {
    const data = await useApi()('/pos/transactions/?page_size=200')
    const txs = data.results || data
    const todayStr = new Date().toDateString()
    const todayTxs = txs.filter((t: any) => new Date(t.created_at).toDateString() === todayStr && t.status !== 'voided')
    todayStats.value = {
      count: todayTxs.length,
      revenue: todayTxs.reduce((s: number, t: any) => s + Number(t.total), 0),
    }
  } catch { /* ignore */ }
}

// ===== Shifts =====
const shift = ref<any>(null)
const shiftOpeningFloat = ref(0)

async function loadShift() {
  try {
    const data = await useApi()('/pos/shifts/current/')
    shift.value = data
  } catch { shift.value = null }
}

// ===== Customer input =====
function onCustomerInput(e: Event) {
  pos.customerName = (e.target as HTMLInputElement).value
}

// ===== Keyboard shortcuts =====
function onKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement | null
  const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

  if (e.key === 'F2') { e.preventDefault(); scanRef.value?.focus(); return }
  if (e.key === 'F9') { e.preventDefault(); if (!pos.isEmpty) startCheckout(); return }
  if (e.key === 'F4') { e.preventDefault(); if (!pos.isEmpty) holdDialog.value = true; return }
  if (e.key === 'Escape' && !typing) { e.preventDefault(); voidCart(); return }
  if (e.key === 'Escape') { checkoutDialog.value = false; holdDialog.value = false; }
  if ((e.key === 'Enter' || e.key === '/') && !typing) { e.preventDefault(); scanRef.value?.focus() }
}

// ===== Init =====
onMounted(async () => {
  window.addEventListener('keydown', onKeydown)
  pos.restoreCart()
  await loadBranches()
  await Promise.all([loadProducts(), loadTodayStats(), loadParkedCount(), loadShift()])
  scanRef.value?.focus()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
/* ===== Design tokens ===== */
:root {
  --spos-radius: 16px;
  --spos-radius-sm: 12px;
  --spos-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.04);
  --spos-shadow-hover: 0 1px 3px rgba(0, 0, 0, 0.05), 0 12px 32px rgba(0, 0, 0, 0.08);
}

/* ===== Shell ===== */
.smart-pos-shell {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px - 48px);
  min-height: 600px;
  margin: 0 -24px -24px;
  background: rgb(var(--v-theme-background));
}
@media (max-width: 1100px) {
  .smart-pos-shell { height: auto; min-height: calc(100vh - 64px - 48px); margin: 0 -16px -16px; }
}

/* ===== Top bar ===== */
.smart-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex: 0 0 auto;
  padding: 10px 20px;
  min-height: 68px;
  background: rgba(var(--v-theme-surface), 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(var(--v-border-color), 0.08);
  flex-wrap: wrap;
}
@media (max-width: 960px) {
  .smart-topbar { gap: 10px; padding: 12px; }
}

.smart-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex-shrink: 0;
}
.smart-brand__mark {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}
.smart-brand__title {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
  color: rgba(var(--v-theme-on-surface), 0.9);
}
.smart-brand__meta {
  font-size: 0.6875rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  margin: 0;
}

.smart-search-wrap {
  flex: 1 1 380px;
  max-width: 640px;
  min-width: 0;
  display: flex;
  justify-content: center;
}

.smart-search {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 14px;
  border: 1.5px solid transparent;
  background: rgb(var(--v-theme-surface));
  box-shadow: inset 0 0 0 1px rgba(var(--v-border-color), 0.18), 0 1px 2px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
  position: relative;
}
.smart-search:focus-within {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.1), inset 0 0 0 1px rgb(var(--v-theme-primary));
}
.smart-search--ready:not(:focus-within) { border-color: rgba(var(--v-theme-success), 0.3); }
.smart-search__icon { color: rgba(var(--v-theme-on-surface), 0.45); }
.smart-search__input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 0.95rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.9);
  min-width: 0;
}
.smart-search__input::placeholder { color: rgba(var(--v-theme-on-surface), 0.38); }
.smart-search__chip { flex-shrink: 0; }
.smart-search__clear { flex-shrink: 0; opacity: 0.5; }
.smart-search__clear:hover { opacity: 1; }

.smart-topbar__actions {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}
@media (max-width: 960px) {
  .smart-topbar__actions { gap: 8px; }
  .smart-stat { display: none; }
  .smart-cashier { display: none; }
}

.smart-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 6px 12px;
  border-radius: 10px;
  background: rgba(var(--v-theme-surface-variant), 0.35);
}
.smart-stat__label {
  font-size: 0.5625rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.5);
}
.smart-stat__value {
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.85);
}

.smart-cashier {
  display: flex;
  align-items: center;
  min-width: 0;
}
.smart-cashier__text {
  min-width: 0;
  line-height: 1.2;
}
.smart-cashier__name {
  font-size: 0.8125rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.9);
}
.smart-cashier__role {
  font-size: 0.625rem;
  text-transform: capitalize;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

/* ===== Suggestions dropdown ===== */
.scan-suggestions {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 100;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), 0.12);
  border-radius: 14px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.12);
  max-height: 320px;
  overflow-y: auto;
}
.scan-suggestions::-webkit-scrollbar { width: 6px; }
.scan-suggestions::-webkit-scrollbar-thumb { background: rgba(var(--v-theme-primary), 0.25); border-radius: 3px; }

.scan-suggestion {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  border: 0;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: background 0.12s;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.06);
}
.scan-suggestion:last-child { border-bottom: 0; }
.scan-suggestion:hover:not(:disabled) { background: rgba(var(--v-theme-primary), 0.06); }
.scan-suggestion:disabled { opacity: 0.4; cursor: not-allowed; }

.scan-suggestion__thumb {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  object-fit: cover;
}
.scan-suggestion__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.scan-suggestion__body { flex: 1; min-width: 0; }
.scan-suggestion__name {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.87);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.scan-suggestion__meta { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.5); }
.scan-suggestion__barcode {
  font-size: 0.6875rem;
  font-family: monospace;
  color: rgba(var(--v-theme-on-surface), 0.4);
  flex-shrink: 0;
}
.scan-suggestion__price {
  font-size: 0.875rem;
  font-weight: 700;
  color: rgb(13, 148, 136);
  flex-shrink: 0;
  min-width: 70px;
  text-align: right;
}

.scan-suggestions--empty { padding: 16px; }
.scan-suggestion__empty {
  text-align: center;
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

/* ===== Grid ===== */
.smart-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 16px;
  flex: 1 1 0%;
  overflow: hidden;
  min-height: 0;
}
@media (max-width: 1100px) { .smart-grid { grid-template-columns: 1fr; overflow-y: auto; padding: 0; } }

/* ===== Left: order ===== */
.smart-order {
  display: flex;
  flex-direction: column;
  margin: 16px 0 16px 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), 0.1);
  border-radius: var(--spos-radius);
  box-shadow: var(--spos-shadow);
  min-height: 0;
  overflow: hidden;
}
@media (max-width: 1100px) {
  .smart-order { margin: 12px; }
}

.smart-order-header {
  flex-shrink: 0;
  display: flex;
  align-items: stretch;
  gap: 2px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.08);
  background: rgba(var(--v-theme-surface), 1);
}
.smart-order-tile {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  padding: 0 18px;
  min-width: 0;
}
.smart-order-tile:first-child { padding-left: 0; }
.smart-order-tile--grow { flex: 1; border-left: 1px solid rgba(var(--v-border-color), 0.1); }
.smart-order-tile--right { align-items: flex-end; border-left: 1px solid rgba(var(--v-border-color), 0.1); }
.smart-order-tile__label { font-size: 0.625rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(var(--v-theme-on-surface), 0.45); }
.smart-order-tile__value { font-size: 0.95rem; font-weight: 700; color: rgba(var(--v-theme-on-surface), 0.9); }
.smart-order-tile__input {
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.9);
  width: 100%;
  padding: 0;
  border-bottom: 1px dashed transparent;
  transition: border-color 0.2s;
}
.smart-order-tile__input:focus { border-bottom-color: rgb(var(--v-theme-primary)); }
.smart-order-tile__input::placeholder { color: rgba(var(--v-theme-on-surface), 0.35); font-weight: 400; }

/* ===== Cart table ===== */
.smart-cart-table {
  flex: 1 1 0%;
  min-height: 0;
  overflow-y: auto;
  padding: 8px 12px;
}
.smart-cart-table::-webkit-scrollbar { width: 7px; }
.smart-cart-table::-webkit-scrollbar-thumb { background: rgba(var(--v-theme-primary), 0.18); border-radius: 4px; }

.smart-cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 14px;
  margin-bottom: 6px;
  border-radius: 12px;
  border: 1px solid rgba(var(--v-border-color), 0.06);
  background: rgb(var(--v-theme-surface));
  transition: all 0.15s ease;
}
.smart-cart-item:hover {
  background: rgba(var(--v-theme-surface-variant), 0.35);
  border-color: rgba(var(--v-border-color), 0.12);
}
.smart-cart-item--alt { background: rgba(var(--v-theme-surface-variant), 0.22); }

.smart-cart-item__main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}
.smart-cart-item__thumb {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
.smart-cart-item__thumb img { width: 100%; height: 100%; object-fit: cover; }
.smart-cart-item__info { min-width: 0; flex: 1; }
.smart-cart-item__title {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.9);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.smart-cart-item__meta {
  font-size: 0.6875rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.smart-cart-item__controls {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}
.smart-cart-item__total {
  min-width: 80px;
  text-align: right;
  font-size: 0.95rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.9);
}
.smart-cart-item__del {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: rgba(var(--v-theme-error), 0.65);
  cursor: pointer;
  transition: all 0.15s;
}
.smart-cart-item__del:hover { background: rgba(var(--v-theme-error), 0.1); color: rgb(var(--v-theme-error)); }

/* ===== Empty cart ===== */
.smart-cart-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  min-height: 300px;
}
.smart-cart-empty__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 380px;
  padding: 40px 28px;
  border-radius: var(--spos-radius);
  background: rgba(var(--v-theme-surface-variant), 0.25);
  border: 1.5px dashed rgba(var(--v-border-color), 0.2);
}
.smart-cart-empty__ring {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.smart-cart-empty__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.9);
  margin-bottom: 6px;
}
.smart-cart-empty__body {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
  margin: 0 0 20px;
  line-height: 1.5;
}

/* ===== Keyboard hints ===== */
.smart-keyhints {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}
.smart-keyhint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
}
.smart-keyhint kbd {
  display: inline-block;
  padding: 3px 9px;
  font-size: 0.6875rem;
  font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: rgba(var(--v-theme-on-surface), 0.75);
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), 0.2);
  border-bottom-width: 2px;
  border-radius: 6px;
}

/* ===== Parked reminder ===== */
.smart-parked-reminder {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(var(--v-theme-warning), 0.08);
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

/* ===== Totals ===== */
.smart-totals {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 20px 18px;
  background: rgba(var(--v-theme-surface), 1);
  border-top: 1px solid rgba(var(--v-border-color), 0.08);
}
.smart-totals__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.65);
}
.smart-totals__row--discount span:last-child { color: rgba(var(--v-theme-error), 0.8); }
.smart-totals__row--total {
  margin-top: 6px;
  padding-top: 12px;
  border-top: 1px solid rgba(var(--v-border-color), 0.1);
  font-size: 1.15rem;
  font-weight: 800;
  color: rgba(var(--v-theme-on-surface), 0.95);
}
.smart-totals__row--total span:last-child { font-size: 1.35rem; color: rgb(var(--v-theme-primary)); }

/* ===== Right side ===== */
.smart-side {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  overflow-y: auto;
  margin: 16px 16px 16px 0;
}
@media (max-width: 1100px) {
  .smart-side { margin: 0 12px 12px; }
}
.smart-side::-webkit-scrollbar { width: 7px; }
.smart-side::-webkit-scrollbar-thumb { background: rgba(var(--v-theme-primary), 0.18); border-radius: 4px; }

.smart-side-section {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), 0.1);
  border-radius: var(--spos-radius);
  padding: 16px;
  box-shadow: var(--spos-shadow);
}
.smart-side-section__title {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.45);
  margin-bottom: 12px;
}

/* ===== Payment ===== */
.smart-pay-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.smart-pay-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--spos-radius-sm);
  border: 1.5px solid rgba(var(--v-border-color), 0.15);
  background: rgb(var(--v-theme-surface));
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s ease;
  text-align: left;
  width: 100%;
}
.smart-pay-btn:hover {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.04);
}
.smart-pay-btn--active {
  background: rgba(var(--v-theme-primary), 0.08);
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.1);
}
.smart-pay-btn__icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--v-theme-primary));
  transition: all 0.18s ease;
}
.smart-pay-btn--active .smart-pay-btn__icon { background: rgb(var(--v-theme-primary)); color: #fff; }
.smart-pay-btn__text { flex: 1; min-width: 0; }
.smart-pay-btn__name { font-size: 0.875rem; font-weight: 700; color: rgba(var(--v-theme-on-surface), 0.9); }
.smart-pay-btn__hint { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.5); }
.smart-pay-btn__check { color: rgba(var(--v-theme-primary), 0.45); }
.smart-pay-btn--active .smart-pay-btn__check { color: rgb(var(--v-theme-primary)); }

/* ===== Quick discount ===== */
.smart-quick-disc {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
.smart-quick-disc__btn {
  padding: 9px 4px;
  border-radius: 10px;
  border: 1.5px solid rgba(var(--v-border-color), 0.15);
  background: rgb(var(--v-theme-surface));
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.7);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}
.smart-quick-disc__btn:hover { border-color: rgb(var(--v-theme-primary)); color: rgb(var(--v-theme-primary)); }
.smart-quick-disc__btn--active {
  background: rgb(var(--v-theme-primary));
  border-color: rgb(var(--v-theme-primary));
  color: #fff;
}

/* ===== Sale actions ===== */
.smart-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.smart-actions .v-btn { flex: 1; }

/* ===== PAY NOW button ===== */
.smart-pay-now {
  flex-shrink: 0;
  padding: 6px;
  border-radius: var(--spos-radius);
  border: 0;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-accent)));
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 12px 28px rgba(var(--v-theme-primary), 0.32);
  transition: all 0.2s ease;
}
.smart-pay-now:hover:not(.smart-pay-now--disabled) {
  transform: translateY(-2px);
  box-shadow: 0 18px 38px rgba(var(--v-theme-primary), 0.38);
}
.smart-pay-now--disabled {
  background: rgba(var(--v-theme-surface-variant), 0.55);
  color: rgba(var(--v-theme-on-surface), 0.3);
  box-shadow: none;
  cursor: not-allowed;
}
.smart-pay-now__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-radius: calc(var(--spos-radius) - 4px);
  background: linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0));
}
.smart-pay-now__left { display: flex; align-items: center; gap: 12px; }
.smart-pay-now__icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
}
.smart-pay-now__label { font-size: 1rem; font-weight: 800; letter-spacing: 0.02em; text-align: left; }
.smart-pay-now__hint { font-size: 0.6875rem; opacity: 0.8; text-align: left; }
.smart-pay-now__amount { font-size: 1.45rem; font-weight: 800; letter-spacing: -0.02em; }

/* ===== Row transitions ===== */
.smart-row-enter-active { transition: all 0.2s ease; }
.smart-row-leave-active { transition: all 0.15s ease; position: absolute; right: 0; left: 0; }
.smart-row-enter-from { opacity: 0; transform: translateX(16px); }
.smart-row-leave-to { opacity: 0; transform: translateX(-16px); }

/* ===== Qty stepper in cart ===== */
.smart-qty {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-radius: 10px;
  padding: 2px 4px;
}
.smart-qty__btn {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  border: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: rgba(var(--v-theme-on-surface), 0.65);
  cursor: pointer;
  transition: all 0.15s;
}
.smart-qty__btn:hover:not(:disabled) { background: rgba(var(--v-theme-primary), 0.12); color: rgb(var(--v-theme-primary)); }
.smart-qty__btn:disabled { opacity: 0.3; cursor: not-allowed; }
.smart-qty__btn--plus { color: rgb(var(--v-theme-primary)); }
.smart-qty__input {
  width: 34px;
  height: 26px;
  border: 0;
  outline: 0;
  background: transparent;
  text-align: center;
  font-size: 0.8125rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.9);
  -moz-appearance: textfield;
}
.smart-qty__input::-webkit-outer-spin-button,
.smart-qty__input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

/* ===== Checkout dialog ===== */
.checkout-total-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 22px 18px;
  background: rgba(var(--v-theme-surface-variant), 0.35);
  border: 1px solid rgba(var(--v-border-color), 0.1);
  border-radius: var(--spos-radius);
  margin-bottom: 16px;
}
.checkout-total-banner__value {
  font-size: 2.25rem;
  font-weight: 800;
  color: rgb(var(--v-theme-primary));
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.checkout-total-banner__method {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  padding: 4px 12px;
  border-radius: 9999px;
  background: rgba(var(--v-theme-primary), 0.08);
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}
.quick-cash-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}
.change-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
}
.change-row--positive {
  background: rgba(var(--v-theme-success), 0.08);
  border: 1px solid rgba(var(--v-theme-success), 0.2);
}

/* ===== Receipt success header ===== */
.receipt-success-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 16px 20px;
}
.receipt-success-header .v-avatar {
  box-shadow: 0 4px 16px rgba(var(--v-theme-success), 0.3);
}

/* ===== Row transitions ===== */
.smart-row-enter-active { transition: all 0.22s ease; }
.smart-row-leave-active { transition: all 0.16s ease; position: absolute; right: 0; left: 0; }
.smart-row-enter-from { opacity: 0; transform: translateY(8px) scale(0.98); }
.smart-row-leave-to { opacity: 0; transform: translateX(-16px); }
</style>

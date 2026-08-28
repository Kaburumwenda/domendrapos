<template>
  <div class="pos-shell">
    <!-- ===== Top bar ===== -->
    <div class="pos-topbar">
      <v-icon size="26" color="primary" class="mr-2">mdi-cart-variant</v-icon>
      <div>
        <div class="text-subtitle-1 font-weight-bold">
          Point of Sale<span class="text-caption text-medium-emphasis font-weight-regular">· Walk-in / OTC sales</span>
        </div>
        <div class="text-caption text-medium-emphasis">{{ today }} · Cashier: {{ cashierShort }}</div>
      </div>
      <v-spacer />

      <v-btn to="/pos/smartpos" variant="flat" color="primary" rounded="lg" prepend-icon="mdi-barcode-scan" class="text-none d-none d-md-flex">
        Smart POS
      </v-btn>
      <v-chip variant="tonal" color="info" size="default" class="mr-2 d-none d-sm-flex">
        <template #prepend><v-icon size="18">mdi-calendar-check-outline</v-icon></template>
        Today: {{ todayStats.count }} · {{ formatMoney(todayStats.revenue) }}
      </v-chip>
      <v-btn to="/customers" variant="text" rounded="lg" prepend-icon="mdi-account-multiple-outline" class="text-none">Customers</v-btn>
      <v-btn to="/pos/history" variant="text" rounded="lg" prepend-icon="mdi-receipt-text-outline" class="text-none d-none d-sm-flex">Sales History</v-btn>
      <v-badge :content="parkedCount" color="warning" overlap>
        <v-btn to="/pos/parked" variant="text" rounded="lg" prepend-icon="mdi-pause-circle-outline" class="text-none" title="Sales on hold">Hold</v-btn>
      </v-badge>
      <v-btn to="/pos/shifts" variant="text" rounded="lg" prepend-icon="mdi-account-clock-outline" class="text-none" title="Cashier shifts">Shifts</v-btn>

      <!-- Branch select -->
      <v-select
        v-model="pos.branchId"
        :items="branchOptions"
        item-title="name"
        item-value="id"
        variant="outlined"
        density="compact"
        hide-details
        rounded="lg"
        prepend-inner-icon="mdi-store-outline"
        class="topbar-branch"
        @update:model-value="onBranchChange"
      />
    </div>

    <!-- ===== Main grid ===== -->
    <div class="pos-grid">
      <!-- ===== Products ===== -->
      <section class="pos-products">
        <div class="pos-search-bar">
          <v-text-field
            ref="searchRef"
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search products by name or SKU…"
            density="compact"
            variant="outlined"
            hide-details
            rounded="lg"
            class="flex-grow-1"
            clearable
            @update:model-value="onSearch"
            @keyup.enter="quickAddByBarcode"
          />
          <v-select
            v-model="activeCat"
            :items="categoryOptions"
            item-title="label"
            item-value="value"
            density="compact"
            variant="outlined"
            hide-details
            rounded="lg"
            prepend-inner-icon="mdi-filter-variant"
            class="pos-cat-select"
          />
          <v-btn-toggle v-model="viewMode" density="compact" variant="outlined" mandatory divided rounded="lg">
            <v-btn value="grid" size="small" aria-label="Grid view"><v-icon>mdi-view-grid-outline</v-icon></v-btn>
            <v-btn value="list" size="small" aria-label="List view"><v-icon>mdi-view-list-outline</v-icon></v-btn>
          </v-btn-toggle>
        </div>

        <v-progress-linear v-if="loading" indeterminate color="primary" height="2" />

        <!-- Products -->
        <div v-if="!loading" class="pos-products-scroll">
          <div v-if="filtered.length === 0" class="pos-products-empty">
            <v-icon size="48" color="grey-lighten-1">mdi-package-variant-remove</v-icon>
            <p class="mt-2 text-body-1 font-weight-medium">No products found</p>
            <p class="text-caption text-medium-emphasis">Try a different search or category.</p>
          </div>
          <div v-else-if="viewMode === 'grid'" class="pos-product-grid">
            <button
              v-for="p in paginated"
              :key="p.id"
              type="button"
              class="pos-product-card"
              :class="{ 'is-out': stockOf(p) <= 0, 'is-list': false }"
              :disabled="stockOf(p) <= 0"
              @click="addToCart(p)"
            >
              <div class="pos-product-thumb">
                <v-img v-if="p.image" :src="p.image" cover class="pos-product-img" />
                <v-icon v-else size="36" color="primary">mdi-cart-variant</v-icon>
                <span v-if="stockLevel(p) !== 'ok'" class="pos-stock-badge" :class="stockLevel(p) === 'out' ? 'bg-error' : 'bg-warning'">
                  {{ stockLevel(p) === 'out' ? 'Out' : 'Low' }}
                </span>
              </div>
              <div class="pos-product-body">
                <div class="pos-product-name">{{ nameOf(p) }}</div>
                <div class="pos-product-meta">
                  <span class="text-caption text-medium-emphasis">Stock: {{ stockOf(p) }} {{ unitLabel(p) }}{{ pieceStock(p) }}</span>
                </div>
              </div>
              <div class="pos-product-price">
                {{ formatMoney(piecePrice(p)) }}<template v-if="Number(p.items_per_unit) > 1"> / piece</template>
              </div>
            </button>
          </div>
          <div v-else class="pos-product-grid pos-product-grid--list">
            <button
              v-for="p in paginated"
              :key="p.id"
              type="button"
              class="pos-product-card is-list"
              :class="{ 'is-out': stockOf(p) <= 0 }"
              :disabled="stockOf(p) <= 0"
              @click="addToCart(p)"
            >
              <div class="pos-product-thumb">
                <v-img v-if="p.image" :src="p.image" cover class="pos-product-img" />
                <v-icon v-else size="26" color="primary">mdi-cart-variant</v-icon>
                <span v-if="stockLevel(p) !== 'ok'" class="pos-stock-badge" :class="stockLevel(p) === 'out' ? 'bg-error' : 'bg-warning'">
                  {{ stockLevel(p) === 'out' ? 'Out' : 'Low' }}
                </span>
              </div>
              <div class="pos-product-body">
                <div class="pos-product-name">{{ nameOf(p) }}</div>
                <div class="pos-product-meta">
                  <span class="text-caption text-medium-emphasis">{{ p.sku || '—' }} · Stock: {{ stockOf(p) }} {{ unitLabel(p) }}{{ pieceStock(p) }}</span>
                </div>
              </div>
              <div class="pos-product-price">
                {{ formatMoney(piecePrice(p)) }}<template v-if="Number(p.items_per_unit) > 1"> / piece</template>
              </div>
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pos-pagination">
          <span class="text-caption text-medium-emphasis">{{ rangeLabel }}</span>
          <v-select
            v-model="pageSize"
            :items="[12, 24, 48, 96]"
            density="compact"
            variant="outlined"
            hide-details
            rounded="lg"
            style="max-width: 90px;"
          />
          <v-spacer />
          <v-pagination v-model="page" :length="pageCount" :total-visible="5" density="comfortable" rounded="lg" size="small" />
        </div>
      </section>

      <!-- ===== Cart ===== -->
      <aside class="pos-cart">
        <div class="pos-cart-banner">
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-cart</v-icon>
            <div class="text-subtitle-1 font-weight-bold">Current Sale</div>
            <v-spacer />
            <v-chip size="small" variant="tonal" color="white">{{ pos.itemCount }} item{{ pos.itemCount === 1 ? '' : 's' }}</v-chip>
          </div>
        </div>

        <div class="pos-cart-header">
          <v-text-field
            v-model="pos.customerName"
            prepend-inner-icon="mdi-account-circle-outline"
            placeholder="Walk-in customer"
            density="compact"
            variant="outlined"
            hide-details
            rounded="lg"
            class="mt-3"
            clearable
          />
        </div>

        <v-divider />

        <!-- Cart items -->
        <div class="pos-cart-items">
          <div v-if="pos.isEmpty" class="pos-cart-empty">
            <v-icon size="64" color="grey-lighten-1">mdi-cart-outline</v-icon>
            <h3 class="text-h6 mt-2">Cart is empty</h3>
            <p class="text-body-2 text-medium-emphasis">Tap a product to start a sale.</p>
          </div>
          <div v-else class="px-3 py-2">
            <transition-group name="cart-item" tag="div">
              <div v-for="(item, i) in pos.cart" :key="item.id" class="pos-cart-row">
                <div class="flex-grow-1 min-width-0">
                  <div class="text-body-2 font-weight-medium text-truncate">{{ item.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ formatMoney(item.price) }} each<template v-if="item.items_per_unit > 1"> · {{ item.items_per_unit }} {{ item.unit }}/unit</template></div>
                  <div v-if="item.items_per_unit > 1" class="text-caption text-disabled">{{ item.qty }} pcs ({{ (item.qty / item.items_per_unit).toFixed(2) }} {{ item.unit }})</div>
                </div>
                <div class="pos-qty">
                  <v-btn icon="mdi-minus" size="x-small" variant="tonal" rounded="lg" :disabled="item.qty <= 1" @click="pos.decItem(i)" />
                  <input
                    :value="item.qty"
                    type="number"
                    min="1"
                    :max="item.max"
                    class="pos-qty-input"
                    @change="onQtyChange(i, $event)"
                  />
                  <v-btn icon="mdi-plus" size="x-small" variant="tonal" color="primary" rounded="lg" :disabled="item.qty >= item.max" @click="pos.incItem(i)" />
                </div>
                <div class="pos-line-total">{{ formatMoney(item.price * item.qty) }}</div>
                <v-btn icon="mdi-close" size="x-small" variant="text" color="error" rounded="lg" @click="pos.removeItem(i)" />
              </div>
            </transition-group>
          </div>
        </div>

        <!-- Cart footer -->
        <div class="pos-cart-footer">
          <div class="px-4 py-3">
            <div class="d-flex justify-space-between text-body-2 mb-1">
              <span class="text-medium-emphasis">Subtotal</span>
              <span>{{ formatMoney(pos.subtotal) }}</span>
            </div>
            <div class="d-flex align-center justify-space-between text-body-2 mb-1">
              <span class="text-medium-emphasis">Discount</span>
              <v-text-field
                v-model.number="pos.discount.value"
                type="number"
                min="0"
                :max="pos.subtotal"
                density="compact"
                variant="plain"
                hide-details
                class="text-right pos-discount-input"
                :suffix="currencySymbol"
              />
            </div>
            <div class="d-flex justify-space-between text-body-2 mb-2">
              <span class="text-medium-emphasis">Tax</span>
              <span>{{ formatMoney(pos.taxAmount) }}</span>
            </div>
            <v-divider class="mb-2" />
            <div class="d-flex justify-space-between align-center">
              <span class="text-h6 font-weight-bold">Total</span>
              <span class="pos-total-value">{{ formatMoney(pos.total) }}</span>
            </div>
          </div>

          <div class="px-4 pb-3">
            <div class="payment-methods mb-3">
              <button
                v-for="opt in paymentOptions"
                :key="opt.value"
                type="button"
                class="pay-btn"
                :class="{ 'pay-btn--active': pos.paymentMethod === opt.value }"
                @click="pos.setPaymentMethod(opt.value)"
              >
                <v-icon size="18">{{ opt.icon }}</v-icon>
                <span>{{ opt.label }}</span>
              </button>
            </div>
            <div class="d-flex ga-2">
              <v-btn
                variant="tonal"
                color="secondary"
                rounded="lg"
                size="large"
                prepend-icon="mdi-pause"
                class="text-none"
                :disabled="pos.isEmpty"
                @click="holdDialog = true"
              >Hold</v-btn>
              <v-btn
                variant="flat"
                color="secondary"
                rounded="lg"
                size="large"
                class="text-none flex-grow-1"
                :disabled="pos.isEmpty || checkingOut"
                :loading="checkingOut"
                @click="startCheckout"
              >
                <v-icon start>mdi-cash-register</v-icon>
                Charge {{ formatMoney(pos.total) }}
              </v-btn>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- ===== Checkout Dialog ===== -->
    <v-dialog v-model="checkoutDialog" max-width="600" persistent>
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-cash-register</v-icon>
          Complete Payment
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

          <v-autocomplete
            v-model="pos.customerName"
            :items="customerList"
            item-title="full_name"
            item-value="full_name"
            label="Customer"
            placeholder="Walk-in customer"
            density="comfortable"
            variant="outlined"
            rounded="lg"
            prepend-inner-icon="mdi-account-outline"
            clearable
            class="mb-2"
            @update:model-value="onCustomerSelect"
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
            <v-text-field
              v-model="insuranceMember"
              label="Member number"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              class="mt-2"
            />
          </template>

          <template v-if="pos.paymentMethod === 'credit'">
            <v-text-field
              v-model="creditDueDate"
              label="Due date"
              type="date"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              class="mt-2"
            />
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
          <v-btn variant="tonal" rounded="xl" prepend-icon="mdi-printer" :loading="printing" @click="printReceipt">Print</v-btn>
          <v-btn variant="tonal" rounded="xl" prepend-icon="mdi-printer-pos" @click="connectPrinter">
            {{ printerConnected ? 'Connected' : 'Thermal' }}
          </v-btn>
          <v-spacer />
          <v-btn variant="flat" color="primary" rounded="xl" @click="newSale">New Sale</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== Shift Dialog ===== -->
    <v-dialog v-model="shiftDialog" max-width="450">
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold">
          <v-icon color="primary" class="mr-2">mdi-account-clock</v-icon>
          {{ shift ? 'Shift Info' : 'Open Shift' }}
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-4">
          <template v-if="shift">
            <v-alert type="success" variant="tonal" density="compact" rounded="lg" class="mb-3">
              Active shift: {{ shift.reference }}
            </v-alert>
            <div class="shift-info-grid">
              <div class="shift-info-row"><span>Opened</span><span>{{ format.datetime(shift.opened_at) }}</span></div>
              <div class="shift-info-row"><span>Duration</span><span>{{ shift.duration }}</span></div>
              <div class="shift-info-row"><span>Opening Float</span><span>{{ formatMoney(shift.opening_float) }}</span></div>
              <div class="shift-info-row"><span>Transactions</span><span>{{ shift.transaction_count }}</span></div>
              <div class="shift-info-row"><span>Gross Revenue</span><span>{{ formatMoney(shift.gross_revenue) }}</span></div>
            </div>
          </template>
          <template v-else>
            <p class="text-body-2 text-medium-emphasis mb-3">No active shift. Enter opening float to start a new shift.</p>
            <v-text-field
              v-model.number="shiftOpeningFloat"
              label="Opening float"
              type="number"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              :prefix="currencySymbol"
            />
          </template>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="shiftDialog = false">Close</v-btn>
          <v-btn v-if="!shift" variant="flat" color="primary" rounded="xl" :loading="openingShift" @click="openShift">Open Shift</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== Resume Parked Dialog ===== -->
    <v-dialog v-model="resumeDialog" max-width="500">
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold">
          <v-icon color="success" class="mr-2">mdi-play-circle</v-icon>
          Resume Parked Sale
        </v-card-title>
        <v-card-text>
          <v-alert type="info" variant="tonal" rounded="lg">
            <div>Customer: {{ resumeData?.customer_name || 'Walk-in' }}</div>
            <div>Items: {{ resumeData?.item_count }}</div>
            <div>Total: {{ formatMoney(resumeData?.total || 0) }}</div>
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="resumeDialog = false">Cancel</v-btn>
          <v-btn variant="flat" color="success" @click="doResume">Resume</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { PosProduct, ParkedSale, PosShift, Branch, Customer, PaymentMethod } from '~/types/pos'

definePageMeta({ middleware: 'auth' })

const pos = usePosStore()
const branchStore = useBranchStore()
const auth = useAuthStore()
const { currency, datetime } = useFormat()
const toast = useToast()
const format = useFormat()
const escpos = useEscPos()

const printing = ref(false)
const printerConnected = computed(() => escpos.connected.value)

// Persist cart whenever store changes (covers v-model mutations like discount, customerName, etc.)
watch(() => pos.$state, () => pos.syncPersist(), { deep: true })

const currencySymbol = computed(() => auth.currencySymbol)
const cashierShort = computed(() => {
  const name = auth.fullName
  return name ? name.split(' ')[0].toUpperCase() : '—'
})

const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })

function formatMoney(v: number | string) { return currency(Number(v || 0)) }

// ===== Branch (synced with global branch store) =====
const branches = computed(() => branchStore.activeBranches)
const branchOptions = computed(() => branches.value)

function syncPosBranchFromGlobal() {
  if (branchStore.branchId && branchStore.branchId !== pos.branchId) {
    pos.setBranch(branchStore.branchId, branchStore.branchName)
  }
}

watch(() => branchStore.branchId, (id) => {
  if (id && id !== pos.branchId) {
    pos.setBranch(id, branchStore.branchName)
    loadProducts()
    loadShift()
  }
})

async function loadBranches() {
  await branchStore.init()
  syncPosBranchFromGlobal()
  if (branches.value.length > 0 && !pos.branchId) {
    const hq = branches.value.find(b => b.is_headquarters) || branches.value[0]
    pos.setBranch(hq.id, hq.name)
    branchStore.setBranch(hq.id, hq.name)
  }
}

function onBranchChange() {
  const br = branches.value.find(b => b.id === pos.branchId)
  const name = br?.name || ''
  pos.setBranch(pos.branchId!, name)
  branchStore.setBranch(pos.branchId!, name)
  loadProducts()
  loadShift()
}

// ===== Products =====
const products = ref<PosProduct[]>([])
const loading = ref(false)
const search = ref('')
const activeCat = ref<number | string | null>(null)
const viewMode = ref('grid')
const page = ref(1)
const pageSize = ref(24)

const categories = computed(() => {
  const map = new Map<string, number>()
  for (const p of products.value) {
    const cat = p.category_name || 'Uncategorized'
    map.set(cat, (map.get(cat) || 0) + 1)
  }
  return Array.from(map.entries()).map(([name]) => ({ id: name, name }))
})

const categoryOptions = computed(() => [
  { label: 'All categories', value: null },
  ...categories.value.map(c => ({ label: c.name, value: c.id as string })),
])

const filtered = computed(() => {
  let list = products.value.filter(p => p.is_active !== false && p.is_sellable !== false)
  if (activeCat.value) {
    list = list.filter(p => (p.category_name || 'Uncategorized') === activeCat.value)
  }
  if (search.value) {
    const s = search.value.toLowerCase()
    list = list.filter(p =>
      (p.name || '').toLowerCase().includes(s) ||
      (p.sku || '').toLowerCase().includes(s) ||
      (p.barcode || '').toLowerCase().includes(s)
    )
  }
  return list
})

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))
const paginated = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

const rangeLabel = computed(() => {
  if (filtered.value.length === 0) return '0 of 0'
  const start = (page.value - 1) * pageSize.value + 1
  const end = Math.min(page.value * pageSize.value, filtered.value.length)
  return `${start}–${end} of ${filtered.value.length}`
})

let searchTimer: ReturnType<typeof setTimeout> | null = null
function onSearch() {
  clearTimeout(searchTimer!)
  searchTimer = setTimeout(() => { page.value = 1 }, 300)
}

function nameOf(p: PosProduct) { return p.name || 'Unnamed' }
function stockOf(p: PosProduct) { return Number(p.quantity_on_hand ?? p.total_quantity ?? 0) }

// --- items_per_unit helpers ---
function ipu(p: PosProduct | { items_per_unit?: number }) { return Number((p as any).items_per_unit || 1) }
function unitLabel(p: PosProduct) {
  const u = (p.unit || '').trim()
  return u && u !== 'each' ? u : ''
}
function pieceStock(p: PosProduct) {
  const n = ipu(p)
  return n > 1 ? ` (${Math.floor(stockOf(p) * n)} pcs)` : ''
}
function piecePrice(p: PosProduct) {
  const n = ipu(p)
  const unitPrice = Number(p.retail_price || 0)
  return n > 1 ? unitPrice / n : unitPrice
}

function stockLevel(p: PosProduct): 'out' | 'low' | 'ok' {
  const s = stockOf(p)
  if (s <= 0) return 'out'
  if (Number(p.reorder_level) > 0 && s <= Number(p.reorder_level)) return 'low'
  return 'ok'
}

function addToCart(p: PosProduct) {
  if (stockOf(p) <= 0) {
    toast.error('Item is out of stock')
    return
  }
  const ok = pos.addToCart(p)
  if (!ok) {
    toast.warning('No more stock available')
  }
}

function quickAddByBarcode() {
  if (!search.value) return
  const match = products.value.find(p =>
    p.barcode && p.barcode.toLowerCase() === search.value.toLowerCase()
  )
  if (match) {
    addToCart(match)
    search.value = ''
  }
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

async function loadProducts() {
  loading.value = true
  try {
    const params = new URLSearchParams({ page_size: '5000', is_active: 'true', is_sellable: 'true', ordering: 'name' })
    const data = await useApi()(`/products/?${params}`)
    products.value = data.results || data
  } catch {
    toast.error('Failed to load products')
  } finally {
    loading.value = false
  }
}

// ===== Customers =====
const customers = ref<Customer[]>([])
const customerList = computed(() => [{ full_name: 'Walk-in', phone: '', id: null }, ...customers.value])

async function loadCustomers() {
  try {
    const data = await useApi()('/customers/?page_size=500')
    customers.value = (data.results || data).map((c: any) => ({
      ...c,
      full_name: c.full_name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.company_name,
    }))
  } catch { /* ignore */ }
}

function onCustomerSelect(name: string) {
  if (!name) {
    pos.customerName = ''
    return
  }
  const c = customers.value.find(c => c.full_name === name)
  if (c) {
    pos.customerName = c.full_name
    pos.customerPhone = c.phone || ''
  } else {
    pos.customerName = name
  }
}

// ===== Payment =====
const paymentOptions: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'cash', label: 'Cash', icon: 'mdi-cash' },
  { value: 'mpesa', label: 'M-Pesa', icon: 'mdi-cellphone' },
  { value: 'card', label: 'Card', icon: 'mdi-credit-card' },
  { value: 'insurance', label: 'Insurance', icon: 'mdi-shield-account' },
  { value: 'credit', label: 'Credit', icon: 'mdi-account-cash' },
]

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
}

// ===== ESC-POS Thermal Printer =====
async function connectPrinter() {
  // Try USB first, then Bluetooth
  const ok = await escpos.connectUsb()
  if (!ok && escpos.supportsWebBluetooth.value) {
    await escpos.connectBluetooth()
  }
  if (escpos.error.value) {
    toast.error(escpos.error.value)
  } else if (escpos.connected.value) {
    toast.success('Thermal printer connected')
  }
}

async function printReceipt() {
  if (!lastTransaction.value) return
  printing.value = true
  try {
    const tx = lastTransaction.value
    const sym = auth.currencySymbol || 'KSh'
    const dateStr = tx.created_at
      ? new Date(tx.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

    const paymentLabels: Record<string, string> = {
      cash: 'Cash', mpesa: 'M-Pesa', card: 'Card', insurance: 'Insurance',
      credit: 'Credit', bank_transfer: 'Bank Transfer',
    }

    await escpos.smartPrint({
      businessName: auth.tenantName || 'DomendraPOS',
      branchName: pos.branchName || undefined,
      transactionNumber: tx.transaction_number || 'N/A',
      Date: dateStr,
      cashierName: auth.fullName,
      customerName: tx.customer_name || undefined,
      customerPhone: tx.customer_phone || undefined,
      items: tx.items,
      subtotal: tx.subtotal,
      discount: tx.discount,
      itemDiscounts: 0,
      tax: tx.tax,
      total: tx.total,
      paymentMethod: paymentLabels[tx.payment_method] || tx.payment_method || 'N/A',
      tendered: tx.tendered,
      change: tx.change,
      paymentReference: undefined,
      currencySymbol: sym,
    }, { paperWidth: 48, codepage: 0 })

    if (escpos.error.value) {
      toast.error(escpos.error.value)
    } else {
      toast.success('Receipt printed')
    }
  } catch (e: any) {
    toast.error(e?.message || 'Failed to print receipt')
  } finally {
    printing.value = false
  }
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

// ===== Resume parked =====
const resumeDialog = ref(false)
const resumeData = ref<ParkedSale | null>(null)

function checkResume() {
  const raw = sessionStorage.getItem('pos_resume_parked')
  if (raw) {
    sessionStorage.removeItem('pos_resume_parked')
    resumeData.value = JSON.parse(raw)
    resumeDialog.value = true
  }
}

function doResume() {
  if (!resumeData.value) return
  pos.resumeFromParked(resumeData.value.items_data, resumeData.value.customer_name, resumeData.value.customer_phone)
  resumeDialog.value = false
  if (resumeData.value.id) {
    useApi()(`/pos/parked-sales/${resumeData.value.id}/`, { method: 'DELETE' }).catch(() => {})
  }
  toast.success('Parked sale resumed')
  loadParkedCount()
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
const shift = ref<PosShift | null>(null)
const shiftDialog = ref(false)
const shiftOpeningFloat = ref(0)
const openingShift = ref(false)

async function loadShift() {
  try {
    const data = await useApi()('/pos/shifts/current/')
    shift.value = data
  } catch {
    shift.value = null
  }
}

async function openShift() {
  openingShift.value = true
  try {
    const data = await useApi()('/pos/shifts/', {
      method: 'POST',
      body: {
        branch: pos.branchId,
        opening_float: shiftOpeningFloat.value,
      },
    })
    shift.value = data
    shiftDialog.value = false
    shiftOpeningFloat.value = 0
    toast.success('Shift opened')
  } catch (e: any) {
    toast.error(e?.data?.detail || 'Failed to open shift')
  } finally {
    openingShift.value = false
  }
}

// ===== Init =====
const searchRef = ref()

function onKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement | null
  const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
  if (e.key === '/' && !typing) {
    e.preventDefault()
    searchRef.value?.focus()
  }
  if (e.key === 'Escape') {
    checkoutDialog.value = false
    holdDialog.value = false
    shiftDialog.value = false
  }
}

onMounted(async () => {
  window.addEventListener('keydown', onKeydown)
  pos.restoreCart()
  await loadBranches()
  await Promise.all([loadProducts(), loadTodayStats(), loadParkedCount(), loadCustomers(), loadShift()])
  checkResume()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
/* ===== Shell ===== */
.pos-shell {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px - 48px);
  min-height: 600px;
  margin: 0 -24px -24px;
  background: linear-gradient(rgba(var(--v-theme-accent), 0.04), rgb(var(--v-theme-background)) 220px);
}
@media (max-width: 1100px) {
  .pos-shell { height: auto; min-height: calc(100vh - 64px - 48px); margin: 0 -16px -16px; }
}

/* ===== Top bar ===== */
.pos-topbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  padding: 0 16px;
  height: 60px;
  background: rgb(var(--v-theme-surface));
  box-shadow: rgba(0, 0, 0, 0.03) 0 2px 8px 0;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.08);
  flex-wrap: wrap;
}
.topbar-branch {
  max-width: 170px;
  min-width: 130px;
}

/* ===== Grid ===== */
.pos-grid {
  display: grid;
  grid-template-columns: 60% 40%;
  gap: 14px;
  flex: 1 1 0%;
  overflow: hidden;
  padding: 14px;
  min-height: 0;
}
@media (max-width: 1100px) { .pos-grid { grid-template-columns: 1fr; overflow-y: auto; } }

/* ===== Products ===== */
.pos-products {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, 0.12));
  border-radius: 14px;
  box-shadow: rgba(var(--v-theme-on-surface), 0.08) 0 2px 12px 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.pos-search-bar {
  display: flex;
  gap: 10px;
  padding: 12px;
  flex-wrap: wrap;
}
.pos-cat-select { max-width: 200px; min-width: 150px; }

.pos-products-scroll {
  flex: 1 1 0%;
  min-height: 0;
  overflow-y: auto;
  padding: 0 4px;
}
.pos-products-scroll::-webkit-scrollbar { width: 8px; }
.pos-products-scroll::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.25); border-radius: 4px; }

.pos-products-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 16px;
  text-align: center;
}

.pos-product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
  padding: 4px;
  align-content: start;
}
.pos-product-grid--list {
  grid-template-columns: 1fr;
}

/* ===== Product card ===== */
.pos-product-card {
  align-items: stretch;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, 0.12));
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font-family: inherit;
  overflow: hidden;
  padding: 12px;
  position: relative;
  text-align: left;
  transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
}
.pos-product-card::before {
  background: linear-gradient(90deg, rgb(var(--v-theme-accent)), rgb(var(--v-theme-secondary)));
  content: '';
  height: 3px;
  left: 0;
  opacity: 0;
  position: absolute;
  right: 0;
  top: 0;
  transition: opacity 0.18s;
}
.pos-product-card:hover:not(:disabled) {
  border-color: rgba(var(--v-theme-accent), 0.6);
  box-shadow: rgba(var(--v-theme-accent), 0.18) 0 8px 22px;
  transform: translateY(-3px);
}
.pos-product-card:hover:not(:disabled)::before { opacity: 1; }
.pos-product-card:active:not(:disabled) { transform: translateY(-1px); }
.pos-product-card.is-out { cursor: not-allowed; opacity: 0.55; }
.pos-product-card.is-list {
  align-items: center;
  flex-direction: row;
  gap: 12px;
  padding: 8px 12px;
}
.pos-product-card.is-list .pos-product-thumb {
  flex-shrink: 0;
  height: 48px;
  margin-bottom: 0;
  width: 48px;
}
.pos-product-card.is-list .pos-product-body { flex: 1 1 0%; min-width: 0; }
.pos-product-card.is-list .pos-product-name { -webkit-line-clamp: 1; margin-bottom: 2px; }
.pos-product-card.is-list .pos-product-meta { margin-bottom: 0; }
.pos-product-card.is-list .pos-product-price { flex-shrink: 0; font-size: 1.05rem; margin-left: auto; }
.pos-product-card.is-list .pos-stock-badge { font-size: 9px; padding: 1px 5px; }

.pos-product-thumb {
  align-items: center;
  background: linear-gradient(135deg, rgba(var(--v-theme-accent), 0.1), rgba(var(--v-theme-secondary), 0.06));
  border-radius: 10px;
  display: flex;
  height: 70px;
  justify-content: center;
  margin-bottom: 10px;
  position: relative;
  overflow: hidden;
}
.pos-product-img { width: 100%; height: 100%; }
.pos-stock-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  border-radius: 10px;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
.pos-stock-badge.bg-warning { background: rgb(245, 158, 11); }
.pos-stock-badge.bg-error { background: rgb(var(--v-theme-error)); }

.pos-product-body { display: block; }
.pos-product-name {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.25;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 2px;
  color: rgba(var(--v-theme-on-surface), 0.87);
}
.pos-product-meta { display: block; }
.pos-product-price {
  font-size: 16px;
  font-weight: 800;
  color: rgb(var(--v-theme-secondary));
  margin-top: auto;
}

/* ===== Pagination ===== */
.pos-pagination {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 4px;
  height: 40px;
  border-top: 1px solid rgba(var(--v-border-color), 0.08);
  flex: 0 0 auto;
  flex-wrap: wrap;
}

/* ===== Cart ===== */
.pos-cart {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, 0.12));
  border-radius: 14px;
  box-shadow: rgba(var(--v-theme-on-surface), 0.08) 0 2px 12px;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow: hidden auto;
}
.pos-cart::-webkit-scrollbar { width: 8px; }
.pos-cart::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.25); border-radius: 4px; }

.pos-cart-banner {
  background: linear-gradient(135deg, rgb(var(--v-theme-accent)), rgb(var(--v-theme-secondary)));
  color: #fff;
  padding: 14px 16px;
  position: sticky;
  top: 0;
  z-index: 3;
}
.pos-cart-banner .v-chip { background: rgba(255, 255, 255, 0.2); }

.pos-cart-header { padding: 12px 16px; flex-shrink: 0; }
.pos-cart-header :deep(.mt-3) { margin-top: 0 !important; }

.pos-cart-items {
  flex: 1 0 auto;
  min-height: 0;
  overflow-y: auto;
}
.pos-cart-items::-webkit-scrollbar { width: 8px; }
.pos-cart-items::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.25); border-radius: 4px; }

.pos-cart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 16px;
  text-align: center;
  height: 100%;
}

.pos-cart-row {
  align-items: center;
  border-radius: 10px;
  display: flex;
  gap: 8px;
  padding: 10px;
  transition: background 0.15s;
}
.pos-cart-row:hover { background: rgba(99, 102, 241, 0.06); }

.pos-qty {
  align-items: center;
  background: rgba(99, 102, 241, 0.08);
  border-radius: 8px;
  display: flex;
  padding: 2px 4px;
}
.pos-qty-input {
  width: 34px;
  height: 24px;
  border: 0;
  outline: 0;
  background: transparent;
  text-align: center;
  font-size: 0.8125rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.87);
  -moz-appearance: textfield;
  margin: 0 2px;
}
.pos-qty-input::-webkit-outer-spin-button,
.pos-qty-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.pos-qty-input:hover,
.pos-qty-input:focus {
  background: rgba(var(--v-theme-accent), 0.12);
  border-radius: 6px;
}
.pos-line-total {
  color: rgb(var(--v-theme-secondary));
  font-size: 14.4px;
  font-weight: 700;
  min-width: 90px;
  text-align: right;
}

.pos-cart-footer {
  background: rgb(var(--v-theme-surface));
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, 0.12));
  bottom: 0;
  flex-shrink: 0;
  position: sticky;
  z-index: 2;
}
.pos-discount-input { max-width: 110px; }
.pos-discount-input :deep(input) { text-align: right; }
.pos-total-value {
  font-size: 1.35rem;
  font-weight: 800;
  color: rgb(var(--v-theme-secondary));
  letter-spacing: -0.02em;
}

/* ===== Payment methods row ===== */
.payment-methods {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}
@media (max-width: 600px) { .payment-methods { grid-template-columns: repeat(3, 1fr); } }
.pay-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 7px 2px;
  border-radius: 10px;
  border: 1px solid rgba(var(--v-border-color), 0.25);
  background: transparent;
  font-size: 0.65625rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.7);
  cursor: pointer;
  transition: all 0.18s ease;
  font-family: inherit;
}
.pay-btn:hover {
  border-color: rgb(var(--v-theme-accent));
  color: rgb(var(--v-theme-accent));
  background: rgba(var(--v-theme-accent), 0.08);
}
.pay-btn--active {
  background: rgb(var(--v-theme-accent));
  border-color: rgb(var(--v-theme-accent));
  color: #fff;
  box-shadow: 0 3px 10px rgba(var(--v-theme-accent), 0.35);
}

/* ===== Cart item transitions ===== */
.cart-item-enter-active { transition: all 0.2s ease; }
.cart-item-leave-active { transition: all 0.15s ease; position: absolute; }
.cart-item-enter-from { opacity: 0; transform: translateX(12px); }
.cart-item-leave-to { opacity: 0; transform: translateX(-12px); }

/* ===== Checkout dialog ===== */
.checkout-total-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 20px 16px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.04));
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 16px;
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
  margin-top: 4px;
  padding: 4px 12px;
  border-radius: 9999px;
  background: rgba(99, 102, 241, 0.1);
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}
.quick-cash-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-bottom: 8px;
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
  background: rgba(var(--v-theme-success), 0.1);
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

/* ===== Shift info ===== */
.shift-info-grid { display: flex; flex-direction: column; gap: 2px; }
.shift-info-row { display: flex; justify-content: space-between; font-size: 0.875rem; padding: 8px 0; border-bottom: 1px solid rgba(var(--v-border-color), 0.08); }
.shift-info-row span:first-child { color: rgba(var(--v-theme-on-surface), 0.6); }
.shift-info-row span:last-child { font-weight: 600; }
.shift-info-row:last-child { border-bottom: 0; }
</style>

<template>
  <div class="lock-bg lock-bg--overdue pa-4 pa-md-6">
    <div class="mx-auto" style="max-width: 960px;">
      <!-- Restricted banner -->
      <v-card rounded="xl" color="error" variant="flat" class="pa-5 mb-4">
        <div class="d-flex align-center flex-wrap ga-3">
          <v-icon icon="mdi-lock-alert" size="44" />
          <div class="flex-grow-1" style="min-width: 220px;">
            <div class="text-overline" style="opacity:.85">Service restricted</div>
            <h1 class="text-h5 font-weight-bold ma-0">Clear your bills to continue</h1>
            <div class="text-body-2 mt-1" style="opacity:.9">
              {{ statusReason || 'Your account has overdue API usage bills. Settle them to restore access for your team.' }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-caption" style="opacity:.85">Overdue balance</div>
            <div class="text-h4 font-weight-bold">{{ fmtCurrency(summary.total_overdue || overdueTotal) }}</div>
          </div>
        </div>
      </v-card>

      <v-alert v-if="toast" type="success" variant="tonal" class="mb-4" closable @click:close="toast = null">{{ toast }}</v-alert>
      <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = null">{{ error }}</v-alert>

      <div v-if="data">
        <!-- Balances: Outstanding / Overdue / Wallet -->
        <v-row class="mb-1">
          <v-col cols="12" md="4" sm="6">
            <v-card rounded="lg" class="pa-4">
              <div class="d-flex align-center justify-space-between">
                <div class="text-caption text-medium-emphasis">Outstanding</div>
                <v-icon size="20" color="warning">mdi-cash-clock</v-icon>
              </div>
              <div class="text-h6 font-weight-bold mt-1">{{ fmtCurrency(summary.total_outstanding) }}</div>
              <div class="text-caption text-medium-emphasis mt-1">{{ summary.outstanding_count }} unpaid</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="4" sm="6">
            <v-card
              rounded="lg"
              class="pa-4"
              :color="Number(summary.total_overdue) > 0 ? 'error' : undefined"
              :variant="Number(summary.total_overdue) > 0 ? 'tonal' : undefined"
            >
              <div class="d-flex align-center justify-space-between">
                <div class="text-caption text-medium-emphasis">Overdue</div>
                <v-icon size="20" color="error">mdi-alert-circle</v-icon>
              </div>
              <div class="text-h6 font-weight-bold mt-1">{{ fmtCurrency(summary.total_overdue) }}</div>
              <div class="text-caption text-medium-emphasis mt-1">{{ summary.overdue_count }} overdue</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="4" sm="6">
            <v-card rounded="lg" class="pa-4" color="success" variant="tonal">
              <div class="d-flex align-center justify-space-between">
                <div class="text-caption text-medium-emphasis">Wallet balance</div>
                <v-icon size="20">mdi-wallet</v-icon>
              </div>
              <div class="text-h6 font-weight-bold mt-1">{{ fmtCurrency(data.wallet_balance) }}</div>
              <div class="text-caption text-medium-emphasis mt-1">Pre-funded credit</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Bills to clear list -->
        <v-card rounded="xl" class="mb-4">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="error">mdi-receipt-text-alert</v-icon>
            Bills to clear
            <v-spacer />
            <v-btn size="small" variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="reload">Refresh</v-btn>
          </v-card-title>
          <v-divider />
          <v-list v-if="billsToClear.length" lines="two">
            <template v-for="(b, i) in billsToClear" :key="b.id">
              <v-list-item>
                <template #prepend>
                  <v-avatar :color="b.is_overdue ? 'error' : 'warning'" variant="tonal">
                    <v-icon :icon="b.is_overdue ? 'mdi-alert' : 'mdi-clock-outline'" />
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-medium">
                  {{ b.period_label || (b.year + '-' + String(b.month).padStart(2,'0')) }}
                  <v-chip size="x-small" variant="tonal" class="ml-1"
                          :color="b.is_overdue ? 'error' : 'warning'" label>
                    {{ (b.effective_status || b.status).toUpperCase() }}
                  </v-chip>
                </v-list-item-title>
                <v-list-item-subtitle>
                  Balance <strong>{{ fmtCurrency(b.balance ?? b.amount) }}</strong>
                  <span v-if="b.due_date"> · due {{ fmtDate(b.due_date) }}</span>
                  <span v-if="Number(b.discount_amount) > 0"> · {{ fmtCurrency(b.discount_amount) }} discount applied</span>
                </v-list-item-subtitle>
                <template #append>
                  <div class="d-flex ga-1">
                    <v-btn size="small" variant="text" prepend-icon="mdi-ticket-percent"
                           @click="openCoupon(b)">Coupon</v-btn>
                    <v-btn size="small" color="primary" variant="flat" prepend-icon="mdi-cash-fast"
                           @click="openPay(b)">Pay</v-btn>
                  </div>
                </template>
              </v-list-item>
              <v-divider v-if="i < billsToClear.length - 1" />
            </template>
          </v-list>
          <div v-else class="text-center py-8">
            <v-icon size="48" color="success" class="mb-3">mdi-check-circle</v-icon>
            <div class="text-h6 font-weight-bold mb-2">All bills settled!</div>
            <v-btn color="primary" variant="flat" prepend-icon="mdi-arrow-right" @click="recheck">
              Continue to app
            </v-btn>
          </div>
        </v-card>

        <div class="d-flex justify-space-between flex-wrap ga-2">
          <v-btn variant="text" prepend-icon="mdi-refresh" :loading="checking" @click="recheck">
            Re-check access
          </v-btn>
          <v-btn variant="text" prepend-icon="mdi-logout" @click="doLogout">Sign out</v-btn>
        </div>
      </div>

      <v-progress-linear v-else-if="loading" indeterminate color="primary" />
    </div>

    <!-- Pay dialog -->
    <v-dialog v-model="payDialog" max-width="520" persistent>
      <v-card rounded="lg" v-if="payTarget">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-cash-fast</v-icon>
          Pay bill — {{ payTarget.period_label }}
        </v-card-title>
        <v-card-text>
          <div class="d-flex justify-space-between mb-1">
            <span class="text-medium-emphasis">Bill amount</span>
            <span class="font-weight-bold">{{ fmtCurrency(payTarget.amount) }}</span>
          </div>
          <div class="d-flex justify-space-between mb-3">
            <span class="text-medium-emphasis">Balance due</span>
            <span class="font-weight-bold text-warning">{{ fmtCurrency(billBalance) }}</span>
          </div>

          <div class="text-caption text-medium-emphasis mb-1">Payment method</div>
          <v-item-group v-model="payMethod" mandatory class="mb-4">
            <v-row>
              <v-col cols="6">
                <v-item v-slot="{ isSelected, toggle }" value="mpesa">
                  <v-card
                    rounded="lg" variant="outlined" class="pa-2 text-center method-card"
                    :class="{ 'method-card--active': isSelected }" @click="toggle"
                  >
                    <v-icon size="26" color="success">mdi-cellphone</v-icon>
                    <div class="text-caption mt-1">M-Pesa</div>
                  </v-card>
                </v-item>
              </v-col>
              <v-col cols="6">
                <v-item v-slot="{ isSelected, toggle }" value="wallet">
                  <v-card
                    rounded="lg" variant="outlined" class="pa-2 text-center method-card"
                    :class="{ 'method-card--active': isSelected }" @click="toggle"
                  >
                    <v-icon size="26" color="success">mdi-wallet</v-icon>
                    <div class="text-caption mt-1">Wallet</div>
                    <div class="text-caption text-medium-emphasis">{{ fmtCurrency(data?.wallet_balance) }}</div>
                  </v-card>
                </v-item>
              </v-col>
            </v-row>
          </v-item-group>

          <v-text-field
            v-model.number="payAmount"
            type="number"
            label="Amount to pay"
            variant="outlined"
            density="comfortable"
            :prefix="currencySymbol"
            :hint="`You can pay part of the balance (max ${fmtCurrency(billBalance)})`"
            persistent-hint
            class="mb-2"
          />

          <v-text-field
            v-if="payMethod === 'mpesa'"
            v-model="payPhone"
            label="M-Pesa phone number"
            variant="outlined"
            density="comfortable"
            placeholder="07XXXXXXXX"
            prepend-inner-icon="mdi-cellphone"
          />

          <v-alert
            v-if="payMethod === 'wallet' && Number(data?.wallet_balance) < Number(payAmount || 0)"
            type="warning" variant="tonal" density="compact" class="mt-1"
          >
            Insufficient wallet balance. Add funds or choose another method.
          </v-alert>
          <v-alert v-if="payError" type="error" variant="tonal" density="compact" class="mt-3">{{ payError }}</v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="payDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="paying" :disabled="!canPay" @click="confirmPay">
            {{ payMethod === 'mpesa' ? 'Send M-Pesa request' : 'Confirm payment' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Coupon dialog -->
    <v-dialog v-model="couponDialog" max-width="440">
      <v-card rounded="lg" v-if="couponTarget">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="success">mdi-ticket-percent</v-icon>
          Apply coupon — {{ couponTarget.period_label }}
        </v-card-title>
        <v-card-text>
          <div class="d-flex justify-space-between mb-3">
            <span class="text-medium-emphasis">Balance due</span>
            <span class="font-weight-bold text-warning">{{ fmtCurrency(couponTarget.balance ?? couponTarget.amount) }}</span>
          </div>
          <v-text-field
            v-model="couponCode"
            label="Coupon code"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-ticket-percent"
            class="mb-2"
          />
          <v-alert v-if="couponError" type="error" variant="tonal" density="compact" class="mt-2">{{ couponError }}</v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="couponDialog = false">Cancel</v-btn>
          <v-btn color="success" :loading="couponBusy" :disabled="!couponCode.trim()" @click="applyCoupon">Apply</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- M-Pesa processing overlay -->
    <v-dialog v-model="mpesa.dialog" max-width="440" persistent>
      <v-card rounded="lg" class="text-center pa-2">
        <v-card-text class="pa-6">
          <v-icon color="success" size="48" class="mb-4">mdi-cellphone</v-icon>

          <template v-if="mpesa.state === 'processing'">
            <v-progress-circular indeterminate color="success" size="64" width="5" class="mb-4" />
            <div class="text-h6 font-weight-bold mb-1">Awaiting your confirmation</div>
            <p class="text-body-2 text-medium-emphasis mb-2">
              Check your phone and enter your M-Pesa PIN to authorise the payment.
            </p>
            <v-chip color="warning" variant="tonal" size="small" class="mb-3">
              <v-icon start size="16">mdi-alert</v-icon>
              Please do not close or leave this page
            </v-chip>
            <v-progress-linear :model-value="(mpesa.elapsed / mpesa.timeout) * 100" color="success" height="6" rounded class="mb-1" />
            <div class="text-caption text-medium-emphasis">
              <template v-if="mpesaTimeoutLeft > 0">{{ mpesaTimeoutLeft }}s remaining</template>
              <template v-else>Timed out</template>
            </div>
          </template>

          <template v-else-if="mpesa.state === 'success'">
            <v-icon color="success" size="72" class="mb-3">mdi-check-circle</v-icon>
            <div class="text-h6 font-weight-bold mb-1">Payment successful</div>
            <p class="text-body-2 text-medium-emphasis">{{ mpesa.message }}</p>
          </template>

          <template v-else-if="mpesa.state === 'failed'">
            <v-icon color="error" size="72" class="mb-3">mdi-close-circle</v-icon>
            <div class="text-h6 font-weight-bold mb-1">Payment not completed</div>
            <p class="text-body-2 text-medium-emphasis">{{ mpesa.message }}</p>
          </template>
        </v-card-text>
        <v-card-actions v-if="mpesa.state !== 'processing'">
          <v-spacer />
          <v-btn color="primary" variant="flat" @click="closeMpesa">Done</v-btn>
          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'

definePageMeta({ middleware: 'auth' })

const api = useApi()
const auth = useAuthStore()
const { currency: fmtCurrency, date: fmtDate } = useFormat()
const currencySymbol = computed(() => auth.currencySymbol || '$')

const data = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const toast = ref<string | null>(null)
const checking = ref(false)

// Pay dialog
const payDialog = ref(false)
const payTarget = ref<any>(null)
const payMethod = ref('mpesa')
const payAmount = ref(0)
const payPhone = ref('')
const paying = ref(false)
const payError = ref<string | null>(null)

// Coupon dialog
const couponDialog = ref(false)
const couponTarget = ref<any>(null)
const couponCode = ref('')
const couponBusy = ref(false)
const couponError = ref<string | null>(null)

// M-Pesa processing state
const mpesa = reactive({
  dialog: false,
  state: 'processing' as 'processing' | 'success' | 'failed',
  message: '',
  txnId: null as number | null,
  elapsed: 0,
  timeout: 60,
  interval: 6,
})
let pollTimer: ReturnType<typeof setTimeout> | null = null
let tickTimer: ReturnType<typeof setInterval> | null = null
let pollCancelled = false

const summary = computed(() => data.value?.summary || {})
const statusReason = computed(() => auth.billingReason)
const overdueTotal = computed(() => auth.overdueTotal)
const billBalance = computed(() => Number(payTarget.value?.balance ?? payTarget.value?.amount ?? 0))
const mpesaTimeoutLeft = computed(() => Math.max(0, mpesa.timeout - mpesa.elapsed))
const canPay = computed(() => {
  if (!(payAmount.value > 0)) return false
  if (payMethod.value === 'wallet') return Number(data.value?.wallet_balance) >= Number(payAmount.value)
  if (payMethod.value === 'mpesa') return !!payPhone.value
  return false
})

const billsToClear = computed(() => {
  const out = data.value?.outstanding_bills || []
  return [...out].sort((a: any, b: any) => (b.is_overdue - a.is_overdue) || (a.year - b.year) || (a.month - b.month))
})

function openPay(bill: any) {
  payTarget.value = bill
  payError.value = null
  payMethod.value = 'mpesa'
  payAmount.value = Number(bill.balance ?? bill.amount ?? 0)
  payPhone.value = data.value?.phone || ''
  payDialog.value = true
}

function openCoupon(bill: any) {
  couponTarget.value = bill
  couponCode.value = ''
  couponError.value = null
  couponDialog.value = true
}

async function applyCoupon() {
  couponBusy.value = true
  couponError.value = null
  try {
    const res = await api('/usage-billing/payments/coupon/apply/', {
      method: 'POST',
      body: { bill_id: couponTarget.value.id, code: couponCode.value.trim() },
    })
    couponDialog.value = false
    toast.value = res?.detail || 'Coupon applied.'
    await afterPayment()
  } catch (e: any) {
    couponError.value = e?.data?.detail || 'Could not apply coupon.'
  } finally {
    couponBusy.value = false
  }
}

async function confirmPay() {
  paying.value = true
  payError.value = null
  try {
    if (payMethod.value === 'wallet') {
      const res = await api('/usage-billing/payments/wallet/pay-bill/', {
        method: 'POST',
        body: { bill_id: payTarget.value.id, amount: payAmount.value },
      })
      payDialog.value = false
      toast.value = res?.detail || 'Bill paid from wallet.'
      await afterPayment()
    } else {
      await startMpesa({
        purpose: 'bill',
        bill_id: payTarget.value.id,
        amount: payAmount.value,
        phone: payPhone.value,
      })
      payDialog.value = false
    }
  } catch (e: any) {
    payError.value = e?.data?.detail || e.message || 'Payment failed.'
  } finally {
    paying.value = false
  }
}

async function startMpesa({ purpose, bill_id, amount, phone }: { purpose: string; bill_id?: number; amount: number; phone: string }) {
  const res = await api('/usage-billing/payments/mpesa/initiate/', {
    method: 'POST',
    body: { purpose, bill_id, amount, phone },
  })
  mpesa.txnId = res.transaction_id
  mpesa.timeout = res.timeout_seconds || 60
  mpesa.interval = res.poll_interval_seconds || 6
  mpesa.elapsed = 0
  mpesa.state = 'processing'
  mpesa.message = res.detail || ''
  mpesa.dialog = true
  pollCancelled = false
  startTicker()
  schedulePoll(mpesa.interval * 1000)
}

function startTicker() {
  if (tickTimer) clearInterval(tickTimer)
  tickTimer = setInterval(() => {
    if (mpesa.state === 'processing') mpesa.elapsed = Math.min(mpesa.elapsed + 1, mpesa.timeout)
  }, 1000)
}

function schedulePoll(delay: number) {
  if (pollTimer) clearTimeout(pollTimer)
  pollTimer = setTimeout(pollMpesa, delay)
}

async function pollMpesa() {
  if (pollCancelled) return
  try {
    const res = await api('/usage-billing/payments/mpesa/confirm/', {
      method: 'POST',
      body: { transaction_id: mpesa.txnId },
    })
    if (res.status === 'success') {
      mpesa.state = 'success'
      mpesa.message = res.detail || 'Payment confirmed.'
      stopTimers()
      await afterPayment()
      return
    }
    if (res.status === 'failed') {
      mpesa.state = 'failed'
      mpesa.message = res.detail || 'Payment failed.'
      stopTimers()
      return
    }
    if (mpesa.elapsed >= mpesa.timeout) {
      mpesa.state = 'failed'
      mpesa.message = 'Payment timed out. If you were charged, it will reflect shortly — please refresh.'
      stopTimers()
      return
    }
    schedulePoll(mpesa.interval * 1000)
  } catch (e: any) {
    if (mpesa.elapsed >= mpesa.timeout) {
      mpesa.state = 'failed'
      mpesa.message = e?.data?.detail || 'Payment timed out.'
      stopTimers()
      return
    }
    schedulePoll(mpesa.interval * 1000)
  }
}

function stopTimers() {
  pollCancelled = true
  if (pollTimer) clearTimeout(pollTimer)
  if (tickTimer) clearInterval(tickTimer)
}

function closeMpesa() {
  stopTimers()
  mpesa.dialog = false
}

async function afterPayment() {
  await reload()
  const me = await auth.refresh()
  if (me && !me.billing?.locked) {
    setTimeout(() => navigateTo('/dashboard'), 900)
  }
}

async function reload() {
  loading.value = true
  try {
    const [pay, st] = await Promise.all([
      api('/usage-billing/payments/'),
      api('/usage-billing/billing-status/'),
    ])
    data.value = pay
    auth.billing = st
  } catch (e: any) {
    error.value = e?.data?.detail || e.message || 'Failed to load data.'
  } finally {
    loading.value = false
  }
}

async function recheck() {
  checking.value = true
  try {
    const me = await auth.refresh()
    if (me && !me.billing?.locked) {
      await navigateTo('/dashboard')
    } else {
      await reload()
      toast.value = 'Still restricted — please clear the remaining balance.'
    }
  } finally {
    checking.value = false
  }
}

async function doLogout() {
  auth.logout()
}

onMounted(reload)
onBeforeUnmount(stopTimers)
</script>

<style scoped>
.lock-bg {
  min-height: 100vh;
  background: linear-gradient(180deg, #fef2f2 0%, #fefce8 100%);
}
.method-card {
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}
.method-card--active {
  border-color: rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.08);
}
</style>

<template>
  <div ref="receiptEl" class="receipt">
    <!-- Header -->
    <div class="receipt__header">
      <div class="receipt__logo">
        <v-icon color="primary" size="28">mdi-store</v-icon>
      </div>
      <h2 class="receipt__biz">{{ businessName }}</h2>
      <p v-if="branchName" class="receipt__addr">{{ branchName }}</p>
      <p class="receipt__addr">{{ todayDate }}</p>
    </div>

    <div class="receipt__separator" />

    <!-- Meta -->
    <div class="receipt__meta">
      <div class="receipt__meta-row">
        <span>Receipt #</span>
        <span class="receipt__mono">{{ number }}</span>
      </div>
      <div class="receipt__meta-row">
        <span>Date</span>
        <span>{{ formatDate }}</span>
      </div>
      <div class="receipt__meta-row">
        <span>Cashier</span>
        <span>{{ cashierName }}</span>
      </div>
      <div class="receipt__meta-row" v-if="customerName">
        <span>Customer</span>
        <span>{{ customerName }}</span>
      </div>
      <div class="receipt__meta-row" v-if="customerPhone">
        <span>Phone</span>
        <span>{{ customerPhone }}</span>
      </div>
    </div>

    <div class="receipt__separator" />

    <!-- Items -->
    <table class="receipt__items">
      <thead>
        <tr>
          <th class="receipt__left">Item</th>
          <th class="receipt__center">Qty</th>
          <th class="receipt__right">Price</th>
          <th class="receipt__right">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in items" :key="i">
          <td class="receipt__left receipt__item-name">{{ item.name }}</td>
          <td class="receipt__center">{{ item.qty }}</td>
          <td class="receipt__right">{{ formatMoney(item.price) }}</td>
          <td class="receipt__right">{{ formatMoney(item.price * item.qty) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="receipt__separator" />

    <!-- Totals -->
    <div class="receipt__totals">
      <div class="receipt__totals-row">
        <span>Subtotal</span>
        <span>{{ formatMoney(subtotal) }}</span>
      </div>
      <div class="receipt__totals-row" v-if="discount > 0">
        <span>Discount</span>
        <span>-{{ formatMoney(discount) }}</span>
      </div>
      <div class="receipt__totals-row" v-if="itemDiscounts > 0">
        <span>Item Discounts</span>
        <span>-{{ formatMoney(itemDiscounts) }}</span>
      </div>
      <div class="receipt__totals-row" v-if="tax > 0">
        <span>Tax</span>
        <span>{{ formatMoney(tax) }}</span>
      </div>
      <div class="receipt__grand">
        <span>TOTAL</span>
        <span>{{ formatMoney(total) }}</span>
      </div>
    </div>

    <div class="receipt__separator" />

    <!-- Payment -->
    <div class="receipt__payment">
      <div class="receipt__totals-row">
        <span>Payment Method</span>
        <span class="receipt__cap">{{ paymentMethodLabel }}</span>
      </div>
      <div class="receipt__totals-row" v-if="tendered != null">
        <span>Tendered</span>
        <span>{{ formatMoney(tendered) }}</span>
      </div>
      <div class="receipt__totals-row" v-if="change != null && change > 0">
        <span>Change</span>
        <span>{{ formatMoney(change) }}</span>
      </div>
      <div class="receipt__totals-row" v-if="paymentReference">
        <span>Ref</span>
        <span class="receipt__mono">{{ paymentReference }}</span>
      </div>
    </div>

    <div class="receipt__separator" />

    <!-- Footer -->
    <div class="receipt__footer">
      <p class="receipt__thanks">Thank you for shopping with us!</p>
      <p class="receipt__small">Returns accepted within 7 days with receipt.</p>
      <p class="receipt__small receipt__powered">Powered by DomendraPOS</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PaymentMethod } from '~/types/pos'

const props = defineProps<{
  number: string
  items: { name: string; qty: number; price: number }[]
  subtotal: number
  discount: number
  itemDiscounts: number
  tax: number
  total: number
  paymentMethod: PaymentMethod
  tendered?: number | null
  change?: number | null
  paymentReference?: string
  cashierName?: string
  customerName?: string
  customerPhone?: string
  branchName?: string
  businessName?: string
}>()

const { currency } = useFormat()
const auth = useAuthStore()

const businessName = computed(() => props.businessName || auth.tenantName || 'DomendraPOS')
const todayDate = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const formatDate = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const paymentLabels: Record<PaymentMethod, string> = {
  cash: 'Cash',
  mpesa: 'M-Pesa',
  card: 'Card',
  insurance: 'Insurance',
  credit: 'Credit',
  bank_transfer: 'Bank Transfer',
}

const paymentMethodLabel = computed(() => paymentLabels[props.paymentMethod] || props.paymentMethod)

function formatMoney(v: number) { return currency(v) }
</script>

<style scoped>
.receipt {
  font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
  font-size: 0.75rem;
  line-height: 1.5;
  color: #1a1a1a;
  background: #fff;
  padding: 24px 20px;
  max-width: 320px;
  margin: 0 auto;
}

.receipt__header { text-align: center; }
.receipt__logo { margin-bottom: 8px; }
.receipt__biz { font-size: 1.125rem; font-weight: 700; margin-bottom: 4px; letter-spacing: -0.02em; }
.receipt__addr { font-size: 0.6875rem; color: #666; margin: 0; }

.receipt__separator {
  border: none;
  border-top: 1px dashed #ccc;
  margin: 12px 0;
}

.receipt__meta { display: flex; flex-direction: column; gap: 2px; }
.receipt__meta-row { display: flex; justify-content: space-between; font-size: 0.6875rem; }
.receipt__meta-row span:first-child { color: #888; }
.receipt__mono { font-family: monospace; }
.receipt__cap { text-transform: capitalize; }

.receipt__items { width: 100%; border-collapse: collapse; }
.receipt__items th { font-size: 0.6875rem; font-weight: 700; padding: 4px 0; border-bottom: 1px solid #eee; text-transform: uppercase; color: #888; }
.receipt__items td { padding: 5px 0; font-size: 0.6875rem; vertical-align: top; }
.receipt__item-name { max-width: 120px; word-break: break-word; }
.receipt__left { text-align: left; }
.receipt__center { text-align: center; }
.receipt__right { text-align: right; }

.receipt__totals { display: flex; flex-direction: column; gap: 2px; }
.receipt__totals-row { display: flex; justify-content: space-between; font-size: 0.75rem; }
.receipt__totals-row span:first-child { color: #666; }
.receipt__grand {
  display: flex; justify-content: space-between;
  font-size: 1rem; font-weight: 800;
  margin-top: 6px; padding-top: 6px;
  border-top: 2px solid #1a1a1a;
}

.receipt__payment { display: flex; flex-direction: column; gap: 2px; }

.receipt__footer { text-align: center; }
.receipt__thanks { font-weight: 700; font-size: 0.8125rem; margin-bottom: 4px; }
.receipt__small { font-size: 0.625rem; color: #888; margin: 0; }
.receipt__powered { margin-top: 8px; font-style: italic; }
</style>

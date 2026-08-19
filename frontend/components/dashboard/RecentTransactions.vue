<template>
  <v-card rounded="xl" flat border class="tx-card">
    <div class="tx-card__header">
      <GradientIcon icon="mdi-receipt-text-clock" color="teal" />
      <div class="tx-card__titles">
        <h3 class="tx-card__title">Recent Transactions</h3>
        <p class="tx-card__subtitle">Latest sales activity</p>
      </div>
      <v-btn variant="text" size="x-small" class="ml-auto" to="/sales" prepend-icon="mdi-arrow-right">
        View All
      </v-btn>
    </div>
    <v-card-text class="tx-card__body">
      <DashboardEmptyState
        v-if="!transactions.length && !loading"
        icon="mdi-receipt-text-outline"
        title="No transactions yet"
      />
      <v-skeleton-loader v-else-if="loading" type="list-item-three-line@6" boilerplate />
      <div v-else class="tx-list">
        <NuxtLink
          v-for="tx in transactions"
          :key="tx.id"
          :to="`/sales/${tx.id}`"
          class="tx-item"
        >
          <div class="tx-item__left">
            <div class="tx-item__avatar" :class="`tx-item__avatar--${tx.id % 4}`">
              {{ (tx.cashier_name || '?').charAt(0).toUpperCase() }}
            </div>
            <div class="tx-item__info">
              <div class="tx-item__top">
                <span class="tx-item__number">{{ tx.transaction_number }}</span>
                <span class="tx-chip tx-chip--method">{{ tx.payment_method_display || tx.payment_method }}</span>
                <span class="tx-chip tx-chip--items">{{ tx.items_count || 0 }} items</span>
              </div>
              <p class="tx-item__meta">
                {{ tx.cashier_name || 'Unknown' }} · {{ tx.customer_name || 'Walk-in' }} · {{ formatTxDate(tx.created_at) }}
              </p>
              <p v-if="tx.branch_name" class="tx-item__branch">
                <v-icon size="11">mdi-store-outline</v-icon> {{ tx.branch_name }}
              </p>
            </div>
          </div>
          <div class="tx-item__right">
            <span class="tx-item__total">{{ formatMoney(tx.total) }}</span>
            <span class="tx-status" :class="`tx-status--${tx.status}`">
              <span class="tx-status__dot"></span>
              {{ tx.status_display || tx.status }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Transaction {
  id: number
  transaction_number: string
  payment_method: string
  payment_method_display?: string
  items_count?: number
  cashier_name?: string
  customer_name?: string
  created_at: string
  branch_name?: string
  total: number | string
  status: string
  status_display?: string
}

interface Props {
  transactions: Transaction[]
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
})

const { currency, datetime } = useFormat()

function formatMoney(v: number | string | null | undefined): string {
  return currency(Number(v) || 0)
}

function formatTxDate(v: string): string {
  return datetime(v)
}
</script>

<style scoped>
.tx-card {
  display: flex;
  flex-direction: column;
  min-height: 380px;
  overflow: hidden;
}
.tx-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.tx-card__icon { width: 38px !important; height: 38px !important; border-radius: 10px !important; }
.tx-card__titles { flex: 1; min-width: 0; }
.tx-card__title {
  font-size: 0.9375rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.tx-card__subtitle {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.4);
  margin-top: 1px;
}
.tx-card__body { flex: 1; padding: 0; }
.tx-list { display: flex; flex-direction: column; }
.tx-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.04);
  transition: background 0.12s;
  text-decoration: none;
  color: inherit;
}
.tx-item:last-child { border-bottom: none; }
.tx-item:hover { background: rgba(var(--v-theme-primary), 0.04); }
.tx-item__left { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; }
.tx-item__avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  color: #fff;
  flex-shrink: 0;
}
.tx-item__avatar--0 { background: linear-gradient(135deg, #3478f6, #1e40af); }
.tx-item__avatar--1 { background: linear-gradient(135deg, #22c55e, #16a34a); }
.tx-item__avatar--2 { background: linear-gradient(135deg, #f59e0b, #d97706); }
.tx-item__avatar--3 { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.tx-item__info { min-width: 0; flex: 1; }
.tx-item__top { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.tx-item__number { font-size: 0.8125rem; font-weight: 600; }
.tx-chip {
  font-size: 0.625rem;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 6px;
  white-space: nowrap;
}
.tx-chip--method { background: rgba(var(--v-theme-primary), 0.08); color: rgb(var(--v-theme-primary)); }
.tx-chip--items { background: rgba(var(--v-theme-success), 0.08); color: rgb(var(--v-theme-success)); }
.tx-item__meta {
  font-size: 0.6875rem;
  color: rgba(var(--v-theme-on-surface), 0.4);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tx-item__branch {
  font-size: 0.625rem;
  color: rgba(var(--v-theme-on-surface), 0.35);
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 3px;
}
.tx-item__right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.tx-item__total { font-size: 0.875rem; font-weight: 700; }
.tx-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.tx-status__dot { width: 6px; height: 6px; border-radius: 50%; }
.tx-status--completed { background: rgba(var(--v-theme-success), 0.1); color: rgb(var(--v-theme-success)); }
.tx-status--completed .tx-status__dot { background: rgb(var(--v-theme-success)); }
.tx-status--pending { background: rgba(var(--v-theme-warning), 0.1); color: rgb(var(--v-theme-warning)); }
.tx-status--pending .tx-status__dot { background: rgb(var(--v-theme-warning)); }
.tx-status--voided { background: rgba(var(--v-theme-error), 0.1); color: rgb(var(--v-theme-error)); }
.tx-status--voided .tx-status__dot { background: rgb(var(--v-theme-error)); }
.tx-status--refunded { background: rgba(var(--v-theme-error), 0.12); color: rgb(var(--v-theme-error)); }
.tx-status--refunded .tx-status__dot { background: rgb(var(--v-theme-error)); }
</style>
